import { useEffect, useMemo, useRef, type CSSProperties } from "react";

const videoSource =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260308_114720_3dabeb9e-2c39-4907-b747-bc3544e2d5b7.mp4";

interface TrendingCoin {
  symbol: string;
  name: string;
  url: string;
  listed: string;
}

const rowOneCoins: TrendingCoin[] = [
  { symbol: "$ANIME", name: "Anime Bitcoin 30", listed: "Listed 2m ago", url: "https://dexscreener.com/search?q=ANIME" },
  { symbol: "$LOLA", name: "Lola the Otter", listed: "Listed 6m ago", url: "https://dexscreener.com/search?q=LOLA" },
  { symbol: "$TRASHCAN", name: "trash can", listed: "Listed 9m ago", url: "https://dexscreener.com/search?q=TRASHCAN" },
  { symbol: "$DOG", name: "Japanese Dogs", listed: "Just Listed", url: "https://dexscreener.com/search?q=%E7%8A%AC" },
  { symbol: "$PIXEL", name: "Pixel Coin", listed: "Listed 11m ago", url: "https://dexscreener.com/search?q=PIXEL" },
  { symbol: "$PERK", name: "PERK", listed: "Listed 14m ago", url: "https://dexscreener.com/search?q=PERK" },
  { symbol: "$KID", name: "The Gaza Kid 10", listed: "Listed 18m ago", url: "https://dexscreener.com/search?q=KID" },
];

const rowTwoCoins: TrendingCoin[] = [
  { symbol: "$LOL", name: "LOL", listed: "Listed 1m ago", url: "https://dexscreener.com/search?q=LOL" },
  { symbol: "$MONDAY", name: "MEMESCOPE MONDAY", listed: "Listed 4m ago", url: "https://dexscreener.com/search?q=MONDAY" },
  { symbol: "$ROFL", name: "Rolling on the floor laughing 200", listed: "Listed 7m ago", url: "https://dexscreener.com/search?q=ROFL" },
  { symbol: "$ATLAS", name: "Atlas 50", listed: "Listed 12m ago", url: "https://dexscreener.com/search?q=ATLAS" },
  { symbol: "$PUMPPERPS", name: "PumpPerps", listed: "Listed 16m ago", url: "https://dexscreener.com/search?q=PUMPPERPS" },
  { symbol: "$DOWNALD", name: "Downald Twump", listed: "Listed 22m ago", url: "https://dexscreener.com/search?q=Downald" },
  { symbol: "$CLIPPY", name: "Clippy 150", listed: "Listed 31m ago", url: "https://dexscreener.com/search?q=Clippy" },
];

const rowThreeCoins: TrendingCoin[] = [
  { symbol: "$UMI", name: "umi 30", listed: "Just Listed", url: "https://dexscreener.com/search?q=umi" },
  { symbol: "$PUNCH", name: "パンチ", listed: "Listed 3m ago", url: "https://dexscreener.com/search?q=%E3%83%91%E3%83%B3%E3%83%81" },
  { symbol: "$LOST", name: "Pumpfun ruined my life", listed: "Listed 5m ago", url: "https://dexscreener.com/search?q=Pumpfun%20ruined%20my%20life" },
  { symbol: "$LGNS", name: "Longinus", listed: "Listed 8m ago", url: "https://dexscreener.com/search?q=LGNS" },
  { symbol: "$ANIMEFICATION", name: "ANIMEFICATION 20", listed: "Listed 10m ago", url: "https://dexscreener.com/search?q=ANIMEFICATION" },
  { symbol: "$X", name: "Japanese X", listed: "Listed 13m ago", url: "https://dexscreener.com/search?q=%E3%82%A8%E3%83%83%E3%82%AF%E3%82%B9" },
  { symbol: "$PERK", name: "PERK", listed: "Listed 15m ago", url: "https://dexscreener.com/search?q=PERK" },
];

export function SocialProofSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<number | null>(null);
  const rowOne = useMemo(() => [...rowOneCoins, ...rowOneCoins], []);
  const rowTwo = useMemo(() => [...rowTwoCoins, ...rowTwoCoins], []);
  const rowThree = useMemo(() => [...rowThreeCoins, ...rowThreeCoins], []);

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
    <section id="market-velocity" className="relative -mt-32 w-full overflow-hidden sm:-mt-36 lg:-mt-44">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="metadata"
        className="absolute -top-32 bottom-0 left-0 right-0 h-[calc(100%+8rem)] w-full object-cover sm:-top-36 sm:h-[calc(100%+9rem)] lg:-top-44 lg:h-[calc(100%+11rem)]"
        style={{ opacity: 0 }}
      >
        <source src={videoSource} type="video/mp4" />
      </video>

      <div className="absolute -top-32 bottom-0 left-0 right-0 bg-gradient-to-b from-background via-transparent to-background sm:-top-36 lg:-top-44" />

      <div className="relative z-10 flex translate-y-[6%] flex-col items-center px-4 pb-20 pt-16 sm:pb-24 sm:pt-24">
        <div className="h-24 sm:h-32" />

        <div className="w-full max-w-7xl rounded-[30px] border border-white/10 bg-black/35 p-4 shadow-glow backdrop-blur-md sm:p-6">
          <div className="mb-6 flex flex-col gap-2 sm:mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">Market Velocity Ticker</p>
            <h2 className="max-w-3xl text-xl font-semibold tracking-[-0.02em] text-foreground sm:text-2xl">
              Thousands of potential long-tail perp markets per day.
            </h2>
            <p className="text-sm leading-6 text-foreground/70">
              With Vibe continuous listing velocity across micro-cap assets is not a dream anymore.
            </p>
          </div>

          <div
            className="space-y-3"
            style={{
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
              maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            }}
          >
            <TickerRow coins={rowOne} duration="46s" hoverDuration="62s" direction="normal" />
            <TickerRow coins={rowTwo} duration="32s" hoverDuration="44s" direction="reverse" />
            <TickerRow coins={rowThree} duration="22s" hoverDuration="30s" direction="normal" />
          </div>
        </div>
      </div>

      <style>
        {`
          .velocity-track {
            animation-name: velocityTicker;
            animation-duration: var(--duration);
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            animation-direction: var(--direction);
            will-change: transform;
          }

          .velocity-row:hover .velocity-track {
            animation-duration: var(--hover-duration);
          }

          @keyframes velocityTicker {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
    </section>
  );
}

function TickerRow({
  coins,
  duration,
  hoverDuration,
  direction,
}: {
  coins: TrendingCoin[];
  duration: string;
  hoverDuration: string;
  direction: "normal" | "reverse";
}) {
  const rowStyle = {
    "--duration": duration,
    "--hover-duration": hoverDuration,
    "--direction": direction,
  } as CSSProperties;

  return (
    <div
      className="velocity-row relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] px-2 py-2"
      style={rowStyle}
    >
      <div className="velocity-track flex min-w-max items-center gap-2 pr-2 sm:gap-3 sm:pr-3">
        {coins.map((coin, index) => (
          <a
            key={`${coin.symbol}-${coin.name}-${index}`}
            href={coin.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-w-[220px] items-center gap-3 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2.5 backdrop-blur-md transition hover:border-white/22 hover:bg-white/[0.08] sm:min-w-[260px]"
          >
            <div className="liquid-glass flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold text-foreground/95">
              {coin.symbol.replace("$", "").charAt(0)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{coin.symbol}</p>
              <p className="truncate text-xs text-foreground/65">{coin.name}</p>
            </div>

            <div className="shrink-0 text-right">
              <p className="rounded-full border border-white/14 bg-black/25 px-2 py-0.5 text-[10px] font-medium text-foreground/75">
                {coin.listed}
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.09em] text-foreground/68">
                <span className="relative inline-flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-300/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-300" />
                </span>
                Soon
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
