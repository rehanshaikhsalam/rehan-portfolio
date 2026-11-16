/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import HeroSection from './components/HeroSection';
import MarqueeSection from './components/MarqueeSection';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import ProjectsSection from './components/ProjectsSection';
import Footer from './components/Footer';
import ContactModal from './components/ContactModal';
import ResumeModal from './components/ResumeModal';
import LaptopDiveOpening from './components/LaptopDiveOpening';

import {
  loadResumeState,
  patchResumeState,
  ResumeState,
  subscribeResumeSync,
} from './utils/resumeState';

function computeTargetScrollY(state: ResumeState): number {
  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  if (state.portfolioScrollY <= 0 && state.portfolioScrollProgress <= 0) {
    return 0;
  }
  if (
    state.portfolioViewportWidth > 0 &&
    Math.abs(window.innerWidth - state.portfolioViewportWidth) > 120
  ) {
    return Math.min(maxScroll, Math.max(0, Math.round(state.portfolioScrollProgress * maxScroll)));
  }
  return Math.min(maxScroll, Math.max(0, state.portfolioScrollY));
}

function PortfolioExperience() {
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

  React.useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const initial = loadResumeState();
    if (initial.portfolioScrollY > 1 || initial.portfolioScrollProgress > 0.001) {
      isRestoringRef.current = true;
      const target = computeTargetScrollY(initial);
      window.scrollTo({ top: target, behavior: 'auto' });
    }
  }, []);

  useEffect(() => {
    let rafSave = 0;
    let stopRestoreTimer = 0;
    let resizeObserver: ResizeObserver | null = null;

    const persistScrollNow = () => {
      if (isRestoringRef.current) return;
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const y = Math.max(0, window.scrollY);
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, y / maxScroll)) : 0;
      patchResumeState({
        portfolioScrollY: y,
        portfolioScrollProgress: progress,
        portfolioViewportWidth: window.innerWidth,
        portfolioViewportHeight: window.innerHeight,
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
        window.scrollTo({ top: 0, behavior: 'auto' });
        return;
      }

      isRestoringRef.current = true;
      const applyOnce = () => {
        if (!isRestoringRef.current) return;
        const target = computeTargetScrollY(loadResumeState());
        if (Math.abs(window.scrollY - target) > 2) {
          window.scrollTo({ top: target, behavior: 'auto' });
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

    // Continue stabilizing scroll target briefly while lazy images settle on mount
    if (isRestoringRef.current) {
      applySavedScroll(loadResumeState());
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          if (!isRestoringRef.current) return;
          const target = computeTargetScrollY(loadResumeState());
          if (Math.abs(window.scrollY - target) > 2) {
            window.scrollTo({ top: target, behavior: 'auto' });
          }
        });
        resizeObserver.observe(document.documentElement);
      }
    }

    const onLoad = () => {
      if (isRestoringRef.current) {
        const target = computeTargetScrollY(loadResumeState());
        window.scrollTo({ top: target, behavior: 'auto' });
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
      const target = computeTargetScrollY(state);
      if (Math.abs(window.scrollY - target) > 4) {
        applySavedScroll(state);
      }
    });

    const onFlushMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'PORTFOLIO_FLUSH_SCROLL') {
        isRestoringRef.current = false;
        persistScrollNow();
      }
    };

    window.addEventListener('message', onFlushMessage);
    window.addEventListener('scroll', scheduleSave, { passive: true });
    window.addEventListener('load', onLoad);
    window.addEventListener('pagehide', persistScrollNow);
    window.addEventListener('beforeunload', persistScrollNow);
    document.addEventListener('visibilitychange', onVisibilityOrHide);
    window.addEventListener('wheel', cancelRestoreOnUserInput, { passive: true });
    window.addEventListener('touchstart', cancelRestoreOnUserInput, { passive: true });
    window.addEventListener('pointerdown', cancelRestoreOnUserInput, { passive: true });
    window.addEventListener('keydown', cancelRestoreOnUserInput);

    return () => {
      persistScrollNow();
      unsubSync();
      window.removeEventListener('message', onFlushMessage);
      if (rafSave) cancelAnimationFrame(rafSave);
      window.clearTimeout(stopRestoreTimer);
      resizeObserver?.disconnect();
      window.removeEventListener('scroll', scheduleSave);
      window.removeEventListener('load', onLoad);
      window.removeEventListener('pagehide', persistScrollNow);
      window.removeEventListener('beforeunload', persistScrollNow);
      document.removeEventListener('visibilitychange', onVisibilityOrHide);
      window.removeEventListener('wheel', cancelRestoreOnUserInput);
      window.removeEventListener('touchstart', cancelRestoreOnUserInput);
      window.removeEventListener('pointerdown', cancelRestoreOnUserInput);
      window.removeEventListener('keydown', cancelRestoreOnUserInput);
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-[#0C0C0C] text-[#D7E2EA] font-['Kanit',sans-serif] selection:bg-purple-600 selection:text-white"
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
  );
}

export default function App() {
  const isPortfolioFrame =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('view') === 'portfolio';

  if (isPortfolioFrame) {
    return <PortfolioExperience />;
  }

  return <LaptopDiveOpening />;
}
