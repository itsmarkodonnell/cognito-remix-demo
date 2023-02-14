import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}
export function validatePassword(password: unknown): { status: boolean; error?: string } {
  if (typeof password !== "string" || password.length < 8) {
    return {
      status: false,
      error: "Password must be at least 8 characters long",
    };
  }
  const isContainsNumber = /^(?=.*[0-9])/;
  if (!new RegExp(isContainsNumber).test(password!)) {
    return {
      status: false,
      error: "Password doesn't contain a number",
    };
  }
  const isContainsUppercase = /^(?=.*[A-Z])/;
  if (!new RegExp(isContainsUppercase).test(password!)) {
    return {
      status: false,
      error: "Password doesn't contain an uppercase letter",
    };
  }

  const isContainsLowercase = /^(?=.*[a-z])/;
  if (!new RegExp(isContainsLowercase).test(password!)) {
    return {
      status: false,
      error: "Password doesn't contain a lowercase letter",
    };
  }
  const isContainsSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹])/;
  if (!new RegExp(isContainsSymbol).test(password!)) {
    return {
      status: false,
      error: "Password doesn't have special characters",
    };
  }

  if (typeof password !== "string" || password.length === 0) {
    return {
      status: false,
      error: "Password is required",
    };
  }

  return {
    status: true,
  }
}
