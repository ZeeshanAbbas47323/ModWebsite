export interface PasswordRule {
  label: string;
  test: (value: string) => boolean;
}

/** Mirrors the API's registration rules so failures surface before submitting. */
export const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "An uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "A lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "A number", test: (v) => /\d/.test(v) },
  { label: "A special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export function isStrongPassword(value: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}

/** The API counts digits, so formatting characters do not help reach the minimum. */
export function digitCount(phone: string): number {
  return (phone.match(/\d/g) ?? []).length;
}
