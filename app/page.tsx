import { HeroSection } from "@/sections/HeroSection";
import { FeatureSection } from "@/sections/FeatureSection";
import { ServiceSection } from "@/sections/ServiceSection";
import { HowItWorksSection } from "@/sections/HowItWorksSection";
import { ShowcaseSection } from "@/sections/ShowcaseSection";
import { CTASection } from "@/sections/CTASection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <FeatureSection />
      <ServiceSection />
      <HowItWorksSection />
      <ShowcaseSection />
      <CTASection />
    </div>
  );
}
