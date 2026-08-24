import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Drop keys whose value is null or undefined.
 *
 * The API validates optional fields by type rather than nullability, so
 * sending `print_method: null` fails with "Expected 'dtf' | ... received null".
 * Optional values must simply be absent from the body.
 */
export function omitEmpty<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== null && value !== undefined)
  ) as Partial<T>;
}
