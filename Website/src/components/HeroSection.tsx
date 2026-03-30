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

        <div className="flex flex-col items-center px-4 pt-12 text-center sm:pt-16 md:pt-20">
          <h1
            className="text-white"
            style={{
              fontFamily: "'Agrandir', 'Geist Sans', sans-serif",
              fontSize: "clamp(3.4rem, 16vw, 230px)",
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: "-0.024em",
            }}
          >
            Vibe Trading
          </h1>

          <p className="mt-3 max-w-lg mx-auto text-center text-base leading-7 text-hero-sub opacity-85 sm:mt-4 sm:text-lg sm:leading-8">
  Scaling permissionless perpetual listings from 
  <span className="font-semibold text-white"> hundreds </span> 
  to <span className="font-semibold text-white"> tens of millions </span> 
  of markets per year.
</p>

          <div className="mb-2 mt-6 sm:mb-3 sm:mt-8">
            <LandingPageButton
              label="Whitepaper"
              className="w-[240px] max-w-full sm:w-[320px]"
              onClick={() => navigate("/library")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
