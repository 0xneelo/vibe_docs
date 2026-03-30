import { useNavigate } from "react-router-dom";

import { HomeNavbar } from "@/components/HomeNavbar";
import { LandingPageButton } from "@/components/ui/LandingPageButton";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-background">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at top, rgba(123, 74, 226, 0.18), transparent 28%), radial-gradient(circle at 72% 18%, rgba(58, 123, 191, 0.16), transparent 22%)",
        }}
      />

      <div className="relative z-10">
        <HomeNavbar />

        <div className="flex flex-col items-center px-4 pt-20 text-center">
          <h1
            className="hero-heading-gradient bg-clip-text text-transparent"
            style={{
              fontFamily: "'Agrandir', 'Geist Sans', sans-serif",
              fontSize: "clamp(5rem, 22vw, 230px)",
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: "-0.024em",
            }}
          >
            Vibe Trading
          </h1>

          <p className="mt-4 max-w-md text-center text-lg leading-8 text-hero-sub opacity-80">
            The only permissionless perpetual futures
            <br />
             protocol that can serve everyone.
          </p>

          <div className="mb-[66px] mt-8">
            <LandingPageButton
              label="Whitepaper"
              className="w-[320px] max-w-full"
              onClick={() => navigate("/library")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
