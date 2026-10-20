/**
 * Utility functions for coupon validation and email/domain matching.
 */

/**
 * Checks if a given email matches any of the allowed emails or domains.
 * Supported entries in allowedList:
 * - Exact email: "user@domain.com"
 * - Domain with leading @: "@company.com" (matches any user@company.com or user@sub.company.com)
 * - Domain with wildcard: "*@company.com"
 * - Plain domain without @: "company.com" (matches any user@company.com or user@sub.company.com)
 */
export function isEmailOrDomainAllowed(
  allowedList: string[] | undefined | null,
  candidateEmail: string | undefined | null
): boolean {
  if (!allowedList || !Array.isArray(allowedList) || allowedList.length === 0 || !candidateEmail) {
    return false;
  }

  const cleanEmail = candidateEmail.trim().toLowerCase();
  if (!cleanEmail.includes("@")) {
    return false;
  }

  const [, domainPart] = cleanEmail.split("@");
  if (!domainPart) {
    return false;
  }

  return allowedList.some((raw) => {
    if (!raw || typeof raw !== "string") return false;
    const item = raw.trim().toLowerCase();
    if (!item) return false;

    // 1. Exact email match (e.g. "alex@example.com")
    if (item === cleanEmail) {
      return true;
    }

    // 2. Wildcard domain match (e.g. "*@example.com")
    if (item.startsWith("*@")) {
      const d = item.slice(2);
      return domainPart === d || domainPart.endsWith("." + d);
    }

    // 3. Domain with leading @ (e.g. "@example.com")
    if (item.startsWith("@")) {
      const d = item.slice(1);
      return domainPart === d || domainPart.endsWith("." + d);
    }

    // 4. Plain domain without @ (e.g. "example.com")
    if (!item.includes("@")) {
      return domainPart === item || domainPart.endsWith("." + item);
    }

    return false;
  });
}
