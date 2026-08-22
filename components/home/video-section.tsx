"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useHomeSection } from "@/hooks/use-home-section";
import { mapHomeVideo } from "@/lib/map-home-video";

function hexToRgba(hex: string, opacity: number) {
  const cleaned = hex.replace("#", "");
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  if (full.length !== 6) return `rgba(0,0,0,${opacity})`;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function VideoSection() {
  const { data: section, isLoading } = useHomeSection("home_video");
  const video = mapHomeVideo(section);

  if (isLoading) {
    return (
      <section className="container pt-10 md:pt-12 lg:pt-16">
        <div className="w-full rounded-[24px] md:rounded-[32px] bg-zinc-900 min-h-[400px] md:aspect-video md:max-h-[600px] animate-pulse" />
      </section>
    );
  }

  if (!video) return null;

  return (
    <section className="container pt-10 md:pt-12 lg:pt-16">
      <div
        className="relative w-full rounded-[24px] md:rounded-[32px] overflow-hidden min-h-[400px] md:aspect-video md:max-h-[600px] flex items-center justify-center"
        style={{ backgroundColor: video.backgroundColor }}
      >
        {video.videoUrl ? (
          <video
            autoPlay={video.autoplay}
            loop={video.loop}
            muted={video.muted}
            playsInline={video.playsInline}
            poster={video.posterUrl || undefined}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={video.videoUrl} type={video.videoType} />
          </video>
        ) : null}

        <div
          className="absolute inset-0"
          style={{
            backgroundColor: hexToRgba(video.overlayColor, video.overlayOpacity),
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 md:px-8 w-full">
          {video.title ? (
            <h2
              className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight drop-shadow-md"
              style={{ color: video.titleColor }}
            >
              {video.title}
            </h2>
          ) : null}

          {video.description ? (
            <p
              className="text-base md:text-lg lg:text-xl max-w-[775px] mx-auto mb-8 drop-shadow-md"
              style={{ color: video.descriptionColor }}
            >
              {video.description}
            </p>
          ) : null}

          {video.buttonText ? (
            <Button variant="default" size="xl" asChild>
              <Link href={video.buttonUrl}>{video.buttonText}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
