import { HeroSection } from '@/components/landing/HeroSection';
import { DemoPreview } from '@/components/landing/DemoPreview';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { WhyStudentsNeed } from '@/components/landing/WhyStudentsNeed';
import { FeatureBento } from '@/components/landing/FeatureBento';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <DemoPreview />
      <HowItWorks />
      <WhyStudentsNeed />
      <FeatureBento />
    </div>
  );
}
