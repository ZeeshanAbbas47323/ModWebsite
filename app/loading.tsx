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
        <span className="absolute size-24 rounded-full border-2 border-gray-100 border-t-primary animate-spin" />
        <div className="animate-pulse">
          <SiteLogo width={120} height={30} className="h-8 w-auto" priority />
        </div>
      </div>
    </div>
  );
}
