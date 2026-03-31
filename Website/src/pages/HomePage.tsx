import { FundingModelTeaserSection } from "@/components/FundingModelTeaserSection";
import { HeroSection } from "@/components/HeroSection";
import { SocialProofSection } from "@/components/SocialProofSection";

export function HomePage() {
  return (
    <>
      <HeroSection />
      <SocialProofSection />
      <FundingModelTeaserSection />
    </>
  );
}
