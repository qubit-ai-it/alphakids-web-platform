import Hero from '@/features/landing/components/Hero';
import GameModes from '@/features/landing/components/GameModes';
import HowItWorks from '@/features/landing/components/HowItWorks';
import Pricing from '@/features/landing/components/Pricing';
import ComparisonTable from '@/features/landing/components/ComparisonTable';
import FAQ from '@/features/landing/components/FAQ';
import LeadForm from '@/features/landing/components/LeadForm';
import Footer from '@/features/landing/components/Footer';

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-white font-sans">
      <Hero />
      <GameModes />
      <HowItWorks />
      <Pricing />
      <ComparisonTable />
      <FAQ />

      <LeadForm />

      <Footer />
    </div>
  );
}
