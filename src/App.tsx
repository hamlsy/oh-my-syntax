import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingCanvas } from '@/features/background/FloatingCanvas';
import { FloatingContributorLayer } from '@/features/background/FloatingContributorLayer';
import { ContributorDetailModal } from '@/features/modals/ContributorDetailModal';
import { ContributorsModal } from '@/features/modals/ContributorsModal';
import { HeroSection } from '@/features/hero/HeroSection';
import { SearchContainer } from '@/features/search/SearchContainer';
import { RecentCommandsSection } from '@/features/recent/RecentCommandsSection';
import { AdSkeleton } from '@/components/ui/AdSkeleton';
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <ErrorBoundary>
      <Analytics />
      {/* Layer 0: Background (fixed, z-0) */}
      <FloatingCanvas />

      {/* Layer 1: Main content (relative, z-10) */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />

        {/* C-1: no motion.div layout here — it would re-animate on every
            search keystroke as ResultList height changes inside SearchContainer */}
        <main className="flex-1 w-full">
          {/* Hero bound: full viewport width so contributor cards can drift
              across the entire screen, while y-position is relative to this
              container (hero section height) — not the full viewport */}
          <div
            className="relative"
            style={{ width: '100vw', marginLeft: 'calc(-1 * (100vw - 100%) / 2)' }}
          >
            <div className="max-w-3xl mx-auto px-4 md:px-6">
              <HeroSection />
            </div>
            <FloatingContributorLayer />
          </div>

          {/* Rest of content — normal centered layout */}
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <RecentCommandsSection />
            <SearchContainer />

            {/* AdSense placeholder — fixed height prevents CLS */}
            <div className="mt-12">
              <AdSkeleton height={90} />
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Modals — portal-like, above everything */}
      <ContributorDetailModal />
      <ContributorsModal />
    </ErrorBoundary>
  );
}

export default App;
