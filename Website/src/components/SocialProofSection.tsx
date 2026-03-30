import { useEffect, useMemo, useRef } from "react";

const videoSource =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260308_114720_3dabeb9e-2c39-4907-b747-bc3544e2d5b7.mp4";

interface TrendingCoin {
  symbol: string;
  name: string;
  url: string;
}

const staticCoins: TrendingCoin[] = [
  { symbol: "LOL", name: "LOL", url: "https://dexscreener.com/search?q=LOL" },
  { symbol: "PIXEL", name: "Pixel Coin", url: "https://dexscreener.com/search?q=PIXEL" },
  { symbol: "ANIME", name: "Anime Bitcoin", url: "https://dexscreener.com/search?q=ANIME" },
  { symbol: "PERK", name: "PERK", url: "https://dexscreener.com/search?q=PERK" },
  { symbol: "KID", name: "The Gaza Kid", url: "https://dexscreener.com/search?q=KID" },
  { symbol: "Clippy", name: "Clippy", url: "https://dexscreener.com/search?q=Clippy" },
  { symbol: "MONDAY", name: "MEMESCOPE MONDAY", url: "https://dexscreener.com/search?q=MONDAY" },
  { symbol: "ROFL", name: "Rolling on the floor laughing", url: "https://dexscreener.com/search?q=ROFL" },
  { symbol: "Anime", name: "ANIMEFICATION", url: "https://dexscreener.com/search?q=ANIMEFICATION" },
  { symbol: "エックス", name: "Japanese X", url: "https://dexscreener.com/search?q=%E3%82%A8%E3%83%83%E3%82%AF%E3%82%B9" },
  { symbol: "LOLA", name: "Lola the Otter", url: "https://dexscreener.com/search?q=LOLA" },
  { symbol: "Lost", name: "Pumpfun ruined my life", url: "https://dexscreener.com/search?q=Pumpfun%20ruined%20my%20life" },
  { symbol: "TRASHCAN", name: "trash can", url: "https://dexscreener.com/search?q=TRASHCAN" },
  { symbol: "犬", name: "Japanese Dogs", url: "https://dexscreener.com/search?q=%E7%8A%AC" },
  { symbol: "LGNS", name: "Longinus", url: "https://dexscreener.com/search?q=LGNS" },
  { symbol: "Downald", name: "Downald Twump", url: "https://dexscreener.com/search?q=Downald" },
  { symbol: "umi", name: "umi", url: "https://dexscreener.com/search?q=umi" },
  { symbol: "Punch", name: "パンチ", url: "https://dexscreener.com/search?q=%E3%83%91%E3%83%B3%E3%83%81" },
  { symbol: "PUMPPERPS", name: "PumpPerps", url: "https://dexscreener.com/search?q=PUMPPERPS" },
  { symbol: "ATLAS", name: "Atlas", url: "https://dexscreener.com/search?q=ATLAS" },
];

const MARQUEE_DURATION_SECONDS = 60;

export function SocialProofSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<number | null>(null);
  const marqueeItems = useMemo(() => [...staticCoins, ...staticCoins], []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const fadeWindow = 0.5;

    const tick = () => {
      const duration = video.duration || 0;
      const currentTime = video.currentTime || 0;
      let opacity = 1;

      if (duration > 0) {
        if (currentTime < fadeWindow) {
          opacity = currentTime / fadeWindow;
        } else if (duration - currentTime < fadeWindow) {
          opacity = Math.max((duration - currentTime) / fadeWindow, 0);
        }
      }

      video.style.opacity = `${opacity}`;
      frameRef.current = window.requestAnimationFrame(tick);
    };

    const handleEnded = () => {
      video.style.opacity = "0";
      resetTimeoutRef.current = window.setTimeout(() => {
        video.currentTime = 0;
        void video.play();
      }, 100);
    };

    frameRef.current = window.requestAnimationFrame(tick);
    video.addEventListener("ended", handleEnded);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: 0 }}
      >
        <source src={videoSource} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      <div className="relative z-10 flex flex-col items-center gap-20 px-4 pb-24 pt-16">
        <div className="h-40" />

        <div className="flex w-full max-w-6xl flex-col gap-6 rounded-[28px] border border-white/10 bg-black/30 p-6 shadow-glow backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="shrink-0 whitespace-nowrap text-base leading-7 text-foreground/90">
          Automated Perp Markets: 
            <br />
            If it's trending, it's on Vibe.
          </div>

          <div className="reader-scrollbar relative overflow-hidden">
            <div
              className="flex min-w-max animate-marquee items-center gap-16 pr-16"
              style={{ animationDuration: `${MARQUEE_DURATION_SECONDS}s` }}
            >
              {marqueeItems.map((coin, index) => (
                <a
                  key={`${coin.symbol}-${coin.name}-${index}`}
                  href={coin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 whitespace-nowrap transition hover:opacity-80"
                >
                  <div className="liquid-glass flex h-6 w-6 items-center justify-center rounded-lg text-xs font-semibold text-foreground">
                    {coin.symbol?.[0] ?? "?"}
                  </div>
                  <span className="text-base font-semibold text-foreground drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
                    {coin.symbol}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
