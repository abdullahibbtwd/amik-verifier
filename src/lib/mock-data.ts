export const mockUser = {
  name: "Adaeze Okonkwo",
  email: "adaeze@example.com",
  initials: "AO",
};

export const mockWallet = {
  balance: 24500,
  currency: "NGN",
  virtualAccount: {
    bank: "Wema Bank",
    accountNumber: "0123456789",
    accountName: "Amik Verifier / Adaeze Okonkwo",
  },
};

export const mockTransactions = [
  {
    id: "txn_001",
    type: "credit" as const,
    description: "Wallet funding via bank transfer",
    amount: 50000,
    date: "2026-07-18T10:30:00Z",
    status: "completed" as const,
  },
  {
    id: "txn_002",
    type: "debit" as const,
    description: "NIN verification lookup",
    amount: 350,
    date: "2026-07-18T11:05:00Z",
    status: "completed" as const,
  },
  {
    id: "txn_003",
    type: "debit" as const,
    description: "Premium NIN slip generation",
    amount: 1500,
    date: "2026-07-17T14:22:00Z",
    status: "completed" as const,
  },
  {
    id: "txn_004",
    type: "debit" as const,
    description: "BVN verification lookup",
    amount: 250,
    date: "2026-07-16T09:15:00Z",
    status: "failed" as const,
  },
];

export const mockVerifications = [
  {
    id: "ver_001",
    type: "NIN",
    identifier: "12345678901",
    status: "verified" as const,
    name: "Adaeze Okonkwo",
    date: "2026-07-18T11:05:00Z",
    cost: 350,
  },
  {
    id: "ver_002",
    type: "BVN",
    identifier: "22123456789",
    status: "failed" as const,
    name: null,
    date: "2026-07-16T09:15:00Z",
    cost: 250,
  },
  {
    id: "ver_003",
    type: "NIN Slip",
    identifier: "12345678901",
    status: "verified" as const,
    name: "Adaeze Okonkwo",
    date: "2026-07-17T14:22:00Z",
    cost: 1500,
    tier: "premium" as const,
  },
  {
    id: "ver_004",
    type: "BVN",
    identifier: "22987654321",
    status: "verified" as const,
    name: "Chidi Nwosu",
    date: "2026-07-15T16:40:00Z",
    cost: 250,
  },
];

export const mockDocuments = [
  {
    id: "doc_001",
    title: "Premium NIN Slip",
    type: "NIN Slip",
    tier: "premium" as const,
    generatedAt: "2026-07-17T14:22:00Z",
    identifier: "12345678901",
  },
  {
    id: "doc_002",
    title: "Basic NIN Slip",
    type: "NIN Slip",
    tier: "basic" as const,
    generatedAt: "2026-07-14T08:10:00Z",
    identifier: "98765432109",
  },
];

export const mockLookupResult = {
  success: {
    type: "NIN",
    identifier: "12345678901",
    name: "Adaeze Okonkwo",
    dateOfBirth: "1992-04-15",
    gender: "Female",
    state: "Lagos",
    verifiedAt: new Date().toISOString(),
  },
  failure: {
    type: "BVN",
    identifier: "22123456789",
    message: "No record found for the provided identifier. Please check and try again.",
  },
};

export const pricingPlans = [
  {
    name: "Starter",
    price: "₦0",
    period: "pay-as-you-go",
    features: ["NIN lookup — ₦350", "BVN lookup — ₦250", "Basic slip — ₦800"],
  },
  {
    name: "Business",
    price: "₦25,000",
    period: "/month",
    features: [
      "500 lookups included",
      "Premium slips at ₦1,200",
      "Priority support",
      "Team access (5 seats)",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: [
      "Unlimited volume pricing",
      "Dedicated account manager",
      "API access & webhooks",
      "SLA guarantee",
    ],
  },
];

export type ServicePriceItem = {
  label: string;
  price: number;
};

export type ServicePricingCategory = {
  id: string;
  name: string;
  description: string;
  highlighted?: boolean;
  items: ServicePriceItem[];
};

export const servicePricing: ServicePricingCategory[] = [
  {
    id: "nin",
    name: "NIN",
    description: "Verification and slip generation",
    items: [
      { label: "NIN Slip", price: 350 },
      { label: "Standard Slip", price: 800 },
      { label: "Premium Slip", price: 1500 },
    ],
  },
  {
    id: "bvn",
    name: "BVN",
    description: "Bank verification lookups",
    highlighted: true,
    items: [
      { label: "View Details", price: 250 },
      { label: "BVN Slip (Full Details)", price: 750 },
    ],
  },
  {
    id: "data",
    name: "Data",
    description: "Mobile data bundles — all networks",
    items: [
      { label: "500MB", price: 350 },
      { label: "1GB", price: 650 },
      { label: "2GB", price: 1200 },
      { label: "5GB", price: 2800 },
    ],
  },
];

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
