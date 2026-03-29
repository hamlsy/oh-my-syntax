import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingCanvas } from '@/features/background/FloatingCanvas';
import { ContributorDetailModal } from '@/features/modals/ContributorDetailModal';
import { ContributorsModal } from '@/features/modals/ContributorsModal';
import { HeroSection } from '@/features/hero/HeroSection';
import { SearchContainer } from '@/features/search/SearchContainer';
import { RecentCommandsSection } from '@/features/recent/RecentCommandsSection';
import { AdSkeleton } from '@/components/ui/AdSkeleton';

function App() {
  return (
    <ErrorBoundary>
      {/* Layer 0: Background (fixed, z-0) */}
      <FloatingCanvas />

      {/* Layer 1: Main content (relative, z-10) */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />

        {/* C-1: no motion.div layout here — it would re-animate on every
            search keystroke as ResultList height changes inside SearchContainer */}
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-6">
          <HeroSection />
          <RecentCommandsSection />
          <SearchContainer />

          {/* AdSense placeholder — fixed height prevents CLS */}
          <div className="mt-12">
            <AdSkeleton height={90} />
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
