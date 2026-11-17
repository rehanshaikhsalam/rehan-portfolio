import React from 'react';
import FadeIn from './FadeIn';
import Magnet from './Magnet';
import ContactButton from './ContactButton';
import { usePortfolioScroll, withBaseUrl } from '../utils/portfolioScrollContext';

interface HeroSectionProps {
  onOpenContact: () => void;
  onOpenResume: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenContact, onOpenResume }) => {
  const { embedded, bezel, containerRef: scrollContainerRef } = usePortfolioScroll();
  const scrollTo = (id: string) => {
    const scroller = scrollContainerRef?.current;
    const el = scroller ? scroller.querySelector(`#${id}`) : document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navBtnClass = `text-[#D7E2EA] font-medium uppercase tracking-wider ${
    bezel ? 'text-[1.4rem]' : 'text-xs sm:text-sm md:text-lg lg:text-[1.4rem]'
  } transition-opacity duration-200 hover:opacity-70 cursor-pointer`;

  return (
    <section
      className={`relative ${
        embedded ? 'h-full' : 'h-screen'
      } min-h-[660px] flex flex-col justify-between overflow-x-clip bg-[#0C0C0C]`}
    >
      {/* Navbar */}
      <FadeIn delay={0} y={-20} as="header" className="relative w-full z-30">
        <nav
          className={`flex items-center justify-between ${
            bezel ? 'px-10 pt-8' : 'px-5 sm:px-6 md:px-10 pt-6 md:pt-8'
          }`}
        >
          <button type="button" onClick={() => scrollTo('about')} className={navBtnClass}>
            About
          </button>
          <button type="button" onClick={() => scrollTo('services')} className={navBtnClass}>
            Skills
          </button>
          <button type="button" onClick={() => scrollTo('projects')} className={navBtnClass}>
            Projects
          </button>
          <button type="button" onClick={onOpenResume} className={navBtnClass}>
            Resume
          </button>
          <button type="button" onClick={onOpenContact} className={navBtnClass}>
            Contact
          </button>
        </nav>
      </FadeIn>

      {/* Hero Heading */}
      <div
        className={`w-full overflow-hidden text-center select-none z-0 ${
          bezel ? '-mt-5' : 'mt-6 sm:mt-4 md:-mt-5'
        }`}
      >
        <FadeIn delay={0.15} y={40}>
          <h1
            className={`hero-heading font-black uppercase tracking-tight leading-none whitespace-nowrap w-full ${
              bezel
                ? 'text-[204.8px]'
                : 'text-[13vw] sm:text-[14vw] md:text-[15vw] lg:text-[16vw]'
            }`}
          >
            Hi, i&apos;m rehan
          </h1>
        </FadeIn>
      </div>

      {/* Hero Portrait with Magnet */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 z-10 pointer-events-auto ${
          bezel
            ? 'top-auto translate-y-0 bottom-0'
            : 'top-1/2 -translate-y-1/2 sm:top-auto sm:translate-y-0 sm:bottom-0'
        }`}
      >
        <FadeIn delay={0.6} y={30}>
          <Magnet
            padding={150}
            strength={3}
            activeTransition="transform 0.3s ease-out"
            inactiveTransition="transform 0.6s ease-in-out"
          >
            <img
              src={withBaseUrl('assets/aistudio/rehan_cutout.png')}
              alt="Rehan Shaikh - AI Automation & No-Code Specialist"
              className={`${
                bezel
                  ? 'w-[520px] max-h-[623px]'
                  : 'w-[280px] sm:w-[360px] md:w-[440px] lg:w-[520px] max-h-[72vh]'
              } h-auto object-contain drop-shadow-2xl select-none pointer-events-none`}
              draggable={false}
            />
          </Magnet>
        </FadeIn>
      </div>

      {/* Bottom Bar */}
      <div
        className={`flex justify-between items-end ${
          bezel ? 'pb-10 px-10' : 'pb-7 sm:pb-8 md:pb-10 px-6 md:px-10'
        } z-20 relative`}
      >
        {/* Left paragraph */}
        <FadeIn delay={0.35} y={20}>
          <p
            className={`text-[#D7E2EA] font-light uppercase tracking-wide leading-snug ${
              bezel ? 'max-w-[260px]' : 'max-w-[160px] sm:max-w-[220px] md:max-w-[260px]'
            }`}
            style={{ fontSize: bezel ? '18px' : 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
          >
            ai automation &amp; no-code specialist building practical workflows
          </p>
        </FadeIn>

        {/* Right Contact Button */}
        <FadeIn delay={0.5} y={20}>
          <ContactButton onClick={onOpenContact} />
        </FadeIn>
      </div>
    </section>
  );
};

export default HeroSection;
