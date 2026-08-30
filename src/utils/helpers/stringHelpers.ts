// src/utils/helpers/stringHelpers.ts
export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(" ");
};

/**
 * Capitalise the first letter of each whitespace-separated word, lower-casing the
 * rest, and collapse runs of whitespace. Mirrors the desktop client's
 * CapitalizeProductName so product names are stored consistently.
 */
export const toTitleCase = (value: string): string =>
  value
    .trim()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
