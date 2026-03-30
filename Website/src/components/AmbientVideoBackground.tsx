import { useEffect, useRef } from "react";

const ambientVideoSource =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260308_114720_3dabeb9e-2c39-4907-b747-bc3544e2d5b7.mp4";

interface AmbientVideoBackgroundProps {
  /** Base video opacity (0-1). */
  videoOpacity?: number;
  /** Dark gradient veil opacity (0-1). */
  overlayOpacity?: number;
}

export function AmbientVideoBackground({
  videoOpacity = 0.2,
  overlayOpacity = 0.5,
}: AmbientVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      void video.play().catch(() => {
        // Keep silent fallback animation layer visible.
      });
    };

    tryPlay();
    const onVisibility = () => {
      if (!document.hidden) {
        tryPlay();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: videoOpacity }}
      >
        <source src={ambientVideoSource} type="video/mp4" />
      </video>

      <div className="ambient-video-shimmer absolute inset-0" />

      <div
        className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/45 to-background"
        style={{ opacity: overlayOpacity }}
      />
    </div>
  );
}
