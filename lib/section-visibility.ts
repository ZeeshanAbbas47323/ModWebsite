import type { UseQueryResult } from "@tanstack/react-query";

/**
 * Decides what a home section should render.
 *
 * The bundled fallbacks exist so the storefront still looks right when the API
 * is unreachable. They must NOT stand in for a section the admin deliberately
 * removed - deactivating or deleting a block used to make its hardcoded copy
 * appear instead of hiding it, which is the opposite of what the toggle means.
 *
 * `useHomeSection` distinguishes the two cases for us:
 *   - `undefined` -> still loading, or the request failed
 *   - `null`      -> the request succeeded and this section is not live
 *
 * Returns `null` when the section should not render at all.
 */
export function resolveSection<TSection, TView>(
  query: Pick<UseQueryResult<TSection | null>, "data" | "isError">,
  mapped: TView | null,
  fallback: TView
): TView | null {
  if (mapped) return mapped;

  // Nothing came back and the request failed: show the bundled copy rather
  // than a hole in the page.
  if (query.isError) return fallback;

  // The API answered and did not include this section, so it is inactive,
  // deleted, or was never created. Render nothing.
  if (query.data === null) return null;

  // Still loading - callers render their skeleton before reaching here.
  return fallback;
}
