import React, { useRef, useEffect } from 'react';
import { usePortfolioScroll } from '../utils/portfolioScrollContext';

const ROW_1_IMAGES = [
  'https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif',
  'https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif',
  'https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif',
  'https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif',
  'https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif',
  'https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif',
  'https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif',
  'https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif',
  'https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif',
  'https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif',
  'https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif',
];

const ROW_2_IMAGES = [
  'https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif',
  'https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif',
  'https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif',
  'https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif',
  'https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif',
  'https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif',
  'https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif',
  'https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif',
  'https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif',
  'https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif',
];

export const MarqueeSection: React.FC = React.memo(() => {
  const sectionRef = useRef<HTMLElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const { containerRef: scrollContainerRef, bezel } = usePortfolioScroll();

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    let rafId = 0;
    let isVisible = true;
    const scroller = scrollContainerRef?.current ?? null;
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const applyTransform = () => {
      rafId = 0;
      if (!sectionRef.current || !isVisible || reducedMotion) return;

      const rect = sectionRef.current.getBoundingClientRect();
      let rawOffset = 0;
      if (scroller) {
        const containerRect = scroller.getBoundingClientRect();
        const scale = scroller.clientHeight > 0 ? containerRect.height / scroller.clientHeight : 1;
        rawOffset = ((containerRect.bottom - rect.top) / (scale || 1)) * 0.3;
      } else {
        const sectionTop = rect.top + window.scrollY;
        rawOffset = (window.scrollY - sectionTop + window.innerHeight) * 0.3;
      }

      // Clamp travel so both rows stay edge-to-edge on 360px through 1920px viewports
      const offset = Math.max(0, Math.min(700, rawOffset));
      const x1 = -720 + offset;
      const x2 = -80 - offset;
      if (row1Ref.current) {
        row1Ref.current.style.transform = `translate3d(${x1.toFixed(1)}px, 0, 0)`;
      }
      if (row2Ref.current) {
        row2Ref.current.style.transform = `translate3d(${x2.toFixed(1)}px, 0, 0)`;
      }
    };

    const handleScroll = () => {
      if (!isVisible || reducedMotion || rafId) return;
      rafId = window.requestAnimationFrame(applyTransform);
    };

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          isVisible = Boolean(entry?.isIntersecting);
          const wc = isVisible && !reducedMotion ? 'transform' : 'auto';
          if (row1Ref.current) row1Ref.current.style.willChange = wc;
          if (row2Ref.current) row2Ref.current.style.willChange = wc;
          if (isVisible && !rafId) {
            rafId = window.requestAnimationFrame(applyTransform);
          }
        },
        {
          root: scroller,
          rootMargin: '250px 0px',
        }
      );
      io.observe(sectionEl);
    }

    const target: HTMLElement | Window = scroller ?? window;
    target.addEventListener('scroll', handleScroll, { passive: true });
    applyTransform();

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      io?.disconnect();
      target.removeEventListener('scroll', handleScroll);
    };
  }, [scrollContainerRef]);

  const cardSizeClass = bezel
    ? 'w-[420px] h-[270px] min-w-[420px]'
    : 'w-[280px] h-[180px] min-w-[280px] sm:w-[360px] sm:h-[230px] sm:min-w-[360px] md:w-[420px] md:h-[270px] md:min-w-[420px]';

  return (
    <section
      ref={sectionRef}
      className={`relative w-full overflow-hidden bg-[#0C0C0C] ${
        bezel ? 'pt-40' : 'pt-24 sm:pt-32 md:pt-40'
      } pb-10 select-none`}
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: 'auto 660px',
      }}
    >
      <div className="flex flex-col gap-3">
        {/* Row 1 - Moves RIGHT on scroll */}
        <div
          ref={row1Ref}
          className="flex gap-3 w-max"
          style={{
            transform: 'translate3d(-720px, 0, 0)',
            backfaceVisibility: 'hidden',
          }}
        >
          {ROW_1_IMAGES.map((src, idx) => (
            <div
              key={`r1-${idx}`}
              className={`relative ${cardSizeClass} rounded-2xl overflow-hidden bg-[#161616] border border-white/5 shadow-lg group`}
            >
              <img
                src={src}
                alt={`3D showcase ${idx + 1}`}
                width={420}
                height={270}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>

        {/* Row 2 - Moves LEFT on scroll */}
        <div
          ref={row2Ref}
          className="flex gap-3 w-max"
          style={{
            transform: 'translate3d(-80px, 0, 0)',
            backfaceVisibility: 'hidden',
          }}
        >
          {ROW_2_IMAGES.map((src, idx) => (
            <div
              key={`r2-${idx}`}
              className={`relative ${cardSizeClass} rounded-2xl overflow-hidden bg-[#161616] border border-white/5 shadow-lg group`}
            >
              <img
                src={src}
                alt={`3D showcase ${idx + 1}`}
                width={420}
                height={270}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

MarqueeSection.displayName = 'MarqueeSection';

export default MarqueeSection;
