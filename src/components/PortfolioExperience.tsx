import React, { useEffect, useState } from 'react';
import HeroSection from './HeroSection';
import MarqueeSection from './MarqueeSection';
import AboutSection from './AboutSection';
import ServicesSection from './ServicesSection';
import ProjectsSection from './ProjectsSection';
import Footer from './Footer';
import ContactModal from './ContactModal';
import ResumeModal from './ResumeModal';
import {
  loadResumeState,
  patchResumeState,
  ResumeState,
  subscribeResumeSync,
} from '../utils/resumeState';
import { PortfolioScrollContext } from '../utils/portfolioScrollContext';

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

export const PortfolioExperience: React.FC<{ embedded?: boolean; bezel?: boolean }> = ({
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
        scrollTop: Math.max(0, el.scrollTop),
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        clientWidth: el.clientWidth,
        scrollTo: (top: number) => el.scrollTo({ top, behavior: 'auto' }),
      };
    }
    return {
      scrollTop: Math.max(0, window.scrollY),
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: window.innerHeight,
      clientWidth: window.innerWidth,
      scrollTo: (top: number) => window.scrollTo({ top, behavior: 'auto' }),
    };
  }, [embedded]);

  React.useLayoutEffect(() => {
    if (!embedded && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const initial = loadResumeState();
    if (initial.portfolioScrollY > 1 || initial.portfolioScrollProgress > 0.001) {
      isRestoringRef.current = true;
      const m = getScrollMetrics();
      const target = computeTargetScrollY(initial, m.scrollHeight, m.clientHeight, m.clientWidth);
      m.scrollTo(target);
    }
  }, [embedded, getScrollMetrics]);

  useEffect(() => {
    let rafSave = 0;
    let stopRestoreTimer = 0;
    let resizeObserver: ResizeObserver | null = null;
    const scrollerEl = embedded ? scrollContainerRef.current : null;

    const persistScrollNow = () => {
      if (isRestoringRef.current) return;
      const m = getScrollMetrics();
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
      if (isRestoringRef.current || rafSave) return;
      rafSave = requestAnimationFrame(() => {
        rafSave = 0;
        persistScrollNow();
      });
    };

    const applySavedScroll = (state: ResumeState) => {
      const wantsScroll =
        state.portfolioScrollY > 1 || state.portfolioScrollProgress > 0.001;
      if (!wantsScroll) {
        isRestoringRef.current = false;
        getScrollMetrics().scrollTo(0);
        return;
      }

      isRestoringRef.current = true;
      const applyOnce = () => {
        if (!isRestoringRef.current) return;
        const m = getScrollMetrics();
        const target = computeTargetScrollY(
          loadResumeState(),
          m.scrollHeight,
          m.clientHeight,
          m.clientWidth
        );
        if (Math.abs(m.scrollTop - target) > 2) {
          m.scrollTo(target);
        }
      };

      applyOnce();
      requestAnimationFrame(applyOnce);

      window.clearTimeout(stopRestoreTimer);
      stopRestoreTimer = window.setTimeout(() => {
        applyOnce();
        isRestoringRef.current = false;
      }, 900);
    };

    const cancelRestoreOnUserInput = () => {
      if (isRestoringRef.current) {
        isRestoringRef.current = false;
        window.clearTimeout(stopRestoreTimer);
      }
    };

    if (isRestoringRef.current) {
      applySavedScroll(loadResumeState());
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          if (!isRestoringRef.current) return;
          const m = getScrollMetrics();
          const target = computeTargetScrollY(
            loadResumeState(),
            m.scrollHeight,
            m.clientHeight,
            m.clientWidth
          );
          if (Math.abs(m.scrollTop - target) > 2) {
            m.scrollTo(target);
          }
        });
        resizeObserver.observe(scrollerEl ?? document.documentElement);
      }
    }

    const onLoad = () => {
      if (isRestoringRef.current) {
        const m = getScrollMetrics();
        const target = computeTargetScrollY(
          loadResumeState(),
          m.scrollHeight,
          m.clientHeight,
          m.clientWidth
        );
        m.scrollTo(target);
      }
    };

    const onVisibilityOrHide = () => {
      if (document.visibilityState === 'hidden') {
        persistScrollNow();
      }
    };

    const unsubSync = subscribeResumeSync((state) => {
      setIsContactOpen(state.portfolioContactOpen);
      setIsResumeOpen(state.resumeModalOpen);
      const m = getScrollMetrics();
      const target = computeTargetScrollY(state, m.scrollHeight, m.clientHeight, m.clientWidth);
      if (Math.abs(m.scrollTop - target) > 4) {
        applySavedScroll(state);
      }
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
    window.addEventListener('load', onLoad);
    window.addEventListener('pagehide', persistScrollNow);
    window.addEventListener('beforeunload', persistScrollNow);
    document.addEventListener('visibilitychange', onVisibilityOrHide);
    scrollTarget.addEventListener('wheel', cancelRestoreOnUserInput, { passive: true });
    scrollTarget.addEventListener('touchstart', cancelRestoreOnUserInput, { passive: true });
    scrollTarget.addEventListener('pointerdown', cancelRestoreOnUserInput, { passive: true });
    window.addEventListener('keydown', cancelRestoreOnUserInput);

    return () => {
      persistScrollNow();
      unsubSync();
      window.removeEventListener('message', onFlushMessage);
      if (rafSave) cancelAnimationFrame(rafSave);
      window.clearTimeout(stopRestoreTimer);
      resizeObserver?.disconnect();
      scrollTarget.removeEventListener('scroll', scheduleSave);
      window.removeEventListener('load', onLoad);
      window.removeEventListener('pagehide', persistScrollNow);
      window.removeEventListener('beforeunload', persistScrollNow);
      document.removeEventListener('visibilitychange', onVisibilityOrHide);
      scrollTarget.removeEventListener('wheel', cancelRestoreOnUserInput);
      scrollTarget.removeEventListener('touchstart', cancelRestoreOnUserInput);
      scrollTarget.removeEventListener('pointerdown', cancelRestoreOnUserInput);
      window.removeEventListener('keydown', cancelRestoreOnUserInput);
    };
  }, [embedded, getScrollMetrics]);

  return (
    <PortfolioScrollContext.Provider
      value={{ containerRef: embedded ? scrollContainerRef : null, embedded, bezel }}
    >
      <div
        ref={embedded ? scrollContainerRef : undefined}
        data-portfolio-scroll={embedded ? 'true' : undefined}
        className={`${
          embedded ? 'w-full h-full overflow-y-auto' : 'min-h-screen'
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

        {/* Interactive Contact Modal */}
        <ContactModal
          isOpen={isContactOpen}
          onClose={closeContact}
        />

        {/* Interactive Resume PDF Modal */}
        <ResumeModal
          isOpen={isResumeOpen}
          onClose={closeResume}
        />
      </div>
    </PortfolioScrollContext.Provider>
  );
};

export default PortfolioExperience;
