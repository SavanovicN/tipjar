import { HeroSection } from "@/app/components/HeroSection";
import { LeaderboardSection } from "@/app/components/LeaderboardSection";
import { FeatureStats } from "@/app/components/shared/FeatureStats";
import { Footer } from "@/app/components/shared/Footer";
import { Header } from "@/app/components/shared/Header";
import { NetworkStatus } from "@/app/components/shared/NetworkStatus";
import { SkipLink } from "@/app/components/shared/SkipLink";
import { TipSection } from "@/app/components/TipSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SkipLink />

      <NetworkStatus />

      <Header />

      <main id="main-content">
        <HeroSection />

        <FeatureStats />

        <TipSection />

        <LeaderboardSection />
      </main>

      <Footer />
    </div>
  );
}
