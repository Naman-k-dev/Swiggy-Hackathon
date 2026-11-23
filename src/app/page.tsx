import { HeroSection } from '@/components/landing/HeroSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { WhyStudentsNeed } from '@/components/landing/WhyStudentsNeed';
import { FeatureBento } from '@/components/landing/FeatureBento';
import { DemoPreview } from '@/components/landing/DemoPreview';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <HowItWorks />
      <WhyStudentsNeed />
      <FeatureBento />
      <DemoPreview />
    </div>
  );
}
