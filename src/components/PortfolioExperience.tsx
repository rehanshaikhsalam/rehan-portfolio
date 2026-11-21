import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import HeroSection from './HeroSection';
import MarqueeSection from './MarqueeSection';
import AboutSection from './AboutSection';
import ServicesSection from './ServicesSection';
import ProjectsSection from './ProjectsSection';
import Footer from './Footer';
import {
  consumePendingScrollRestore,
  loadResumeState,
  patchResumeState,
  ResumeState,
  subscribeFlushScroll,
  subscribeResumeSync,
} from '../utils/resumeState';
import { PortfolioScrollContext } from '../utils/portfolioScrollContext';

const ContactModal = lazy(() => import('./ContactModal'));
const ResumeModal = lazy(() => import('./ResumeModal'));

function computeTargetScrollY(
  state: ResumeState,
  scrollHeight: number,
  clientHeight: number,
  clientWidth: number
): number {
  const maxScroll = Math.max(0, scrollHeight - clientHeight);
  if (state.portfolioScrollY <= 0 && state.portfolioScrollProgress <= 0) {
    return 0;
  }
  if (
    state.portfolioViewportWidth > 0 &&
    Math.abs(clientWidth - state.portfolioViewportWidth) > 120
  ) {
    return Math.min(maxScroll, Math.max(0, Math.round(state.portfolioScrollProgress * maxScroll)));
  }
  return Math.min(maxScroll, Math.max(0, state.portfolioScrollY));
}

export const PortfolioExperience: React.FC<{ embedded?: boolean; bezel?: boolean }> = React.memo(({
  embedded = false,
  bezel = false,
}) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [isContactOpen, setIsContactOpen] = useState<boolean>(
    () => loadResumeState().portfolioContactOpen
  );
  const [isResumeOpen, setIsResumeOpen] = useState<boolean>(
    () => loadResumeState().resumeModalOpen
  );

  const openContact = React.useCallback(() => {
    setIsContactOpen(true);
    patchResumeState({ portfolioContactOpen: true });
  }, []);

  const closeContact = React.useCallback(() => {
    setIsContactOpen(false);
    patchResumeState({ portfolioContactOpen: false });
  }, []);

  const openResume = React.useCallback(() => {
    setIsResumeOpen(true);
    patchResumeState({ resumeModalOpen: true });
  }, []);

  const closeResume = React.useCallback(() => {
    setIsResumeOpen(false);
    patchResumeState({ resumeModalOpen: false });
  }, []);

  const isRestoringRef = React.useRef<boolean>(false);

  const getScrollMetrics = React.useCallback(() => {
    const el = embedded ? scrollContainerRef.current : null;
    if (el) {
      return {
        ready: el.clientHeight > 0 && el.scrollHeight > 0,
        scrollTop: Math.max(0, el.scrollTop),
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        clientWidth: el.clientWidth,
        scrollTo: (top: number) => {
          el.scrollTop = top;
        },
      };
    }
    return {
      ready: window.innerHeight > 0,
      scrollTop: Math.max(0, window.scrollY),
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: window.innerHeight,
      clientWidth: window.innerWidth,
      scrollTo: (top: number) => window.scrollTo({ top, behavior: 'auto' }),
    };
  }, [embedded]);

  React.useLayoutEffect(() => {
    if (!embedded) return;
    if (!consumePendingScrollRestore()) return;

    const initial = loadResumeState();
    if (initial.portfolioScrollY > 1 || initial.portfolioScrollProgress > 0.001) {
      isRestoringRef.current = true;
      const m = getScrollMetrics();
      if (m.ready) {
        const target = computeTargetScrollY(initial, m.scrollHeight, m.clientHeight, m.clientWidth);
        m.scrollTo(target);
      }
    }
  }, [embedded, getScrollMetrics]);

  useEffect(() => {
    let saveTimer = 0;
    let restoreRaf = 0;
    const scrollerEl = embedded ? scrollContainerRef.current : null;

    const persistScrollNow = () => {
      if (saveTimer) {
        window.clearTimeout(saveTimer);
        saveTimer = 0;
      }
      if (isRestoringRef.current) return;
      const m = getScrollMetrics();
      if (!m.ready) return;
      const maxScroll = Math.max(0, m.scrollHeight - m.clientHeight);
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, m.scrollTop / maxScroll)) : 0;
      patchResumeState({
        portfolioScrollY: m.scrollTop,
        portfolioScrollProgress: progress,
        portfolioViewportWidth: m.clientWidth,
        portfolioViewportHeight: m.clientHeight,
      });
    };

    const scheduleSave = () => {
      if (isRestoringRef.current) return;
      if (saveTimer) window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        saveTimer = 0;
        persistScrollNow();
      }, 220);
    };

    const cancelRestoreOnUserInput = () => {
      if (isRestoringRef.current) {
        isRestoringRef.current = false;
        if (restoreRaf) {
          cancelAnimationFrame(restoreRaf);
          restoreRaf = 0;
        }
      }
    };

    // Complete one-shot scroll restore cleanly after layout settles, never looping
    if (isRestoringRef.current) {
      restoreRaf = requestAnimationFrame(() => {
        restoreRaf = 0;
        if (!isRestoringRef.current) return;
        const m = getScrollMetrics();
        if (m.ready) {
          const target = computeTargetScrollY(
            loadResumeState(),
            m.scrollHeight,
            m.clientHeight,
            m.clientWidth
          );
          if (Math.abs(m.scrollTop - target) > 2) {
            m.scrollTo(target);
          }
        }
        isRestoringRef.current = false;
      });
    }

    const onVisibilityOrHide = () => {
      if (document.visibilityState === 'hidden') {
        persistScrollNow();
      }
    };

    // Sync modal open states cleanly without hijacking active scroll position
    const unsubSync = subscribeResumeSync((state) => {
      setIsContactOpen((prev) => (prev === state.portfolioContactOpen ? prev : state.portfolioContactOpen));
      setIsResumeOpen((prev) => (prev === state.resumeModalOpen ? prev : state.resumeModalOpen));
    });

    // Synchronous flush before Expand <-> Laptop transition
    const unsubFlush = subscribeFlushScroll(() => {
      isRestoringRef.current = false;
      persistScrollNow();
    });

    const onFlushMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'PORTFOLIO_FLUSH_SCROLL') {
        isRestoringRef.current = false;
        persistScrollNow();
      }
    };

    const scrollTarget: HTMLElement | Window = scrollerEl ?? window;
    window.addEventListener('message', onFlushMessage);
    scrollTarget.addEventListener('scroll', scheduleSave, { passive: true });
    window.addEventListener('pagehide', persistScrollNow);
    document.addEventListener('visibilitychange', onVisibilityOrHide);
    scrollTarget.addEventListener('wheel', cancelRestoreOnUserInput, { passive: true });
    scrollTarget.addEventListener('touchstart', cancelRestoreOnUserInput, { passive: true });
    scrollTarget.addEventListener('pointerdown', cancelRestoreOnUserInput, { passive: true });
    window.addEventListener('keydown', cancelRestoreOnUserInput);

    return () => {
      unsubSync();
      unsubFlush();
      window.removeEventListener('message', onFlushMessage);
      if (saveTimer) window.clearTimeout(saveTimer);
      if (restoreRaf) cancelAnimationFrame(restoreRaf);
      scrollTarget.removeEventListener('scroll', scheduleSave);
      window.removeEventListener('pagehide', persistScrollNow);
      document.removeEventListener('visibilitychange', onVisibilityOrHide);
      scrollTarget.removeEventListener('wheel', cancelRestoreOnUserInput);
      scrollTarget.removeEventListener('touchstart', cancelRestoreOnUserInput);
      scrollTarget.removeEventListener('pointerdown', cancelRestoreOnUserInput);
      window.removeEventListener('keydown', cancelRestoreOnUserInput);
    };
  }, [embedded, getScrollMetrics]);

  const scrollContextValue = useMemo(
    () => ({ containerRef: embedded ? scrollContainerRef : null, embedded, bezel }),
    [embedded, bezel]
  );

  return (
    <MotionConfig reducedMotion="user">
      <PortfolioScrollContext.Provider value={scrollContextValue}>
        <div
          ref={embedded ? scrollContainerRef : undefined}
          data-portfolio-scroll={embedded ? 'true' : undefined}
          className={`${
            embedded ? 'w-full h-full overflow-y-auto' : 'min-h-[100svh]'
          } bg-[#0C0C0C] text-[#D7E2EA] font-['Kanit',sans-serif] selection:bg-purple-600 selection:text-white`}
          style={{ overflowX: 'clip' }}
        >
          {/* 1. Hero Section */}
          <HeroSection onOpenContact={openContact} onOpenResume={openResume} />

          {/* 2. Marquee Section */}
          <MarqueeSection />

          {/* 3. About Section */}
          <AboutSection onOpenContact={openContact} />

          {/* 4. Services / Skills Section */}
          <ServicesSection />

          {/* 5. Projects Section */}
          <ProjectsSection onOpenContact={openContact} />

          {/* Footer */}
          <Footer onOpenContact={openContact} onOpenResume={openResume} />

          {/* Interactive Contact Modal (lazy-loaded on demand) */}
          {isContactOpen && (
            <Suspense fallback={null}>
              <ContactModal isOpen={isContactOpen} onClose={closeContact} />
            </Suspense>
          )}

          {/* Interactive Resume PDF Modal (lazy-loaded on demand) */}
          {isResumeOpen && (
            <Suspense fallback={null}>
              <ResumeModal isOpen={isResumeOpen} onClose={closeResume} />
            </Suspense>
          )}
        </div>
      </PortfolioScrollContext.Provider>
    </MotionConfig>
  );
});

PortfolioExperience.displayName = 'PortfolioExperience';

export default PortfolioExperience;
