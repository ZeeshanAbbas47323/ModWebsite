import { SiteLogo } from "@/components/shared/site-logo";

/**
 * Next's App Router shows this automatically while a route segment (or the
 * data it suspends on) is still loading — replacing the browser's own blank
 * white flash with a branded splash instead. `SiteLogo` already falls back
 * to the bundled local SVG on any CMS-logo failure, so this never itself
 * waits on a network request to appear.
 */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white">
      <div className="relative flex items-center justify-center">
        {/* Soft pulsing halo behind the mark instead of a spinner ring. */}
        <span className="absolute size-28 rounded-full bg-primary/25 blur-2xl animate-pulse" />
        <SiteLogo
          width={140}
          height={36}
          className="relative h-9 w-auto animate-pulse"
          priority
        />
      </div>
    </div>
  );
}
