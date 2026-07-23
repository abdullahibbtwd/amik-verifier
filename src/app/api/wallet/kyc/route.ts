import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { api, getConvexHttpClient } from "@/lib/auth/convex-server";
import { requireAuthenticatedUserId } from "@/lib/auth/require-user";
import {
  assignDedicatedAccount,
  formatPhoneForPaystack,
  PAYSTACK_TEST_DETAILS,
  splitName,
} from "@/lib/paystack/client";
import { walletKycSchema } from "@/lib/validations/wallet";

export async function POST(request: Request) {
  try {
    const auth = await requireAuthenticatedUserId(request);
    if (!auth.userId) {
      return auth.response!;
    }

    const body = await request.json();
    const data = walletKycSchema.parse(body);
    const client = getConvexHttpClient();

    const user = await client.action(api.auth.login.getCurrentUser, {
      userId: auth.userId,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const useTestCredentials = data.useTestCredentials ?? true;
    const bvn = useTestCredentials ? PAYSTACK_TEST_DETAILS.bvn : data.bvn;
    const bankAccountNumber = useTestCredentials
      ? PAYSTACK_TEST_DETAILS.accountNumber
      : data.bankAccountNumber;
    const bankCode = useTestCredentials
      ? PAYSTACK_TEST_DETAILS.bankCode
      : data.bankCode;

    const { firstName, middleName, lastName } = splitName(user.name);
    const paystackFirstName = useTestCredentials
      ? PAYSTACK_TEST_DETAILS.firstName
      : firstName;
    const paystackLastName = useTestCredentials
      ? PAYSTACK_TEST_DETAILS.lastName
      : lastName;

    const setup = await client.mutation(api.wallet.submitKyc, {
      userId: auth.userId,
      bvnLast4: bvn.slice(-4),
      ninLast4: data.nin ? data.nin.slice(-4) : undefined,
      bankAccountNumber,
      bankCode,
    });

    if (setup.alreadyActive) {
      const overview = await client.query(api.wallet.getWalletOverview, {
        userId: auth.userId,
      });
      return NextResponse.json({
        status: "active",
        message: "Virtual account is already active.",
        overview,
      });
    }

    const paystack = await assignDedicatedAccount({
      email: user.email,
      first_name: paystackFirstName,
      middle_name: middleName,
      last_name: paystackLastName,
      phone: formatPhoneForPaystack(user.phone),
      preferred_bank: PAYSTACK_TEST_DETAILS.preferredBank,
      country: "NG",
      account_number: bankAccountNumber,
      bvn,
      bank_code: bankCode,
    });

    const customerCode = paystack.data.customer.customer_code;

    await client.mutation(api.wallet.updatePaystackCustomerCode, {
      userId: auth.userId,
      paystackCustomerCode: customerCode,
      virtualAccountId: setup.virtualAccountId,
    });

    const dedicatedAccount = paystack.data.dedicated_account;

    if (dedicatedAccount) {
      await client.mutation(api.wallet.activateVirtualAccount, {
        paystackCustomerCode: customerCode,
        accountNumber: dedicatedAccount.account_number,
        accountName: dedicatedAccount.account_name,
        bankName: dedicatedAccount.bank.name,
        bankSlug: dedicatedAccount.bank.slug,
        paystackDvaId: String(dedicatedAccount.id),
      });
    }

    const overview = await client.query(api.wallet.getWalletOverview, {
      userId: auth.userId,
    });

    return NextResponse.json({
      status: dedicatedAccount ? "active" : "pending",
      message: dedicatedAccount
        ? "Virtual account created successfully."
        : "KYC submitted. Your virtual account will be ready shortly.",
      customerCode,
      overview,
      testMode: useTestCredentials,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid request." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to complete KYC right now.",
      },
      { status: 500 }
    );
  }
}
