/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth_constants from "../auth/constants.js";
import type * as auth_crypto from "../auth/crypto.js";
import type * as auth_email from "../auth/email.js";
import type * as auth_login from "../auth/login.js";
import type * as auth_sessions from "../auth/sessions.js";
import type * as auth_signup from "../auth/signup.js";
import type * as auth_verifyEmail from "../auth/verifyEmail.js";
import type * as verifications from "../verifications.js";
import type * as wallet from "../wallet.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "auth/constants": typeof auth_constants;
  "auth/crypto": typeof auth_crypto;
  "auth/email": typeof auth_email;
  "auth/login": typeof auth_login;
  "auth/sessions": typeof auth_sessions;
  "auth/signup": typeof auth_signup;
  "auth/verifyEmail": typeof auth_verifyEmail;
  verifications: typeof verifications;
  wallet: typeof wallet;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
