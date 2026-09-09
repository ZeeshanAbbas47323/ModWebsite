import { SiteLogo } from "@/components/shared/site-logo";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white">
      <div className="relative flex items-center justify-center">
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
