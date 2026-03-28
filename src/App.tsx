import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingCanvas } from '@/features/background/FloatingCanvas';
import { EasterEggModal } from '@/features/background/EasterEggModal';
import { HeroSection } from '@/features/hero/HeroSection';
import { SearchContainer } from '@/features/search/SearchContainer';
import { AdSkeleton } from '@/components/ui/AdSkeleton';

function App() {
  return (
    <ErrorBoundary>
      {/* Layer 0: Background (fixed, z-0) */}
      <FloatingCanvas />

      {/* Layer 1: Main content (relative, z-10) */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-6">
          <HeroSection />
          <SearchContainer />

          {/* AdSense placeholder — fixed height prevents CLS */}
          <div className="mt-12">
            <AdSkeleton height={90} />
          </div>
        </main>

        <Footer />
      </div>

      {/* Easter egg modal — portal-like, above everything */}
      <EasterEggModal />
    </ErrorBoundary>
  );
}

export default App;
