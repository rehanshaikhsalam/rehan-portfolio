import React from 'react';
import FadeIn from './FadeIn';
import AnimatedText from './AnimatedText';
import ContactButton from './ContactButton';
import { usePortfolioScroll } from '../utils/portfolioScrollContext';

interface AboutSectionProps {
  onOpenContact: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenContact }) => {
  const { embedded, bezel } = usePortfolioScroll();
  const aboutText =
    'I am a hospitality student building practical skills in AI automation and no-code workflow development. I work with Make.com, Gemini AI, Google Workspace, and webhooks to connect apps, automate repetitive processes, and streamline everyday business operations.';

  return (
    <section
      id="about"
      className={`relative ${
        embedded ? 'min-h-full' : 'min-h-screen'
      } flex flex-col items-center justify-center ${
        bezel ? 'px-10' : 'px-5 sm:px-8 md:px-10'
      } py-20 overflow-hidden bg-[#0C0C0C] select-none`}
    >
      {/* 4 Decorative 3D Floating Elements */}
      {/* Top-left: Moon icon */}
      <div
        className={`absolute top-[4%] ${
          bezel ? 'left-[4%]' : 'left-[1%] sm:left-[2%] md:left-[4%]'
        } pointer-events-none z-10`}
      >
        <FadeIn delay={0.1} x={-80} y={0} duration={0.9}>
          <img
            src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png"
            alt="Moon 3D icon"
            className={`${
              bezel ? 'w-[210px]' : 'w-[120px] sm:w-[160px] md:w-[210px]'
            } h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]`}
            loading="lazy"
            draggable={false}
          />
        </FadeIn>
      </div>

      {/* Bottom-left: 3D object */}
      <div
        className={`absolute bottom-[8%] ${
          bezel ? 'left-[10%]' : 'left-[3%] sm:left-[6%] md:left-[10%]'
        } pointer-events-none z-10`}
      >
        <FadeIn delay={0.25} x={-80} y={0} duration={0.9}>
          <img
            src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png"
            alt="3D object"
            className={`${
              bezel ? 'w-[180px]' : 'w-[100px] sm:w-[140px] md:w-[180px]'
            } h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]`}
            loading="lazy"
            draggable={false}
          />
        </FadeIn>
      </div>

      {/* Top-right: Lego icon */}
      <div
        className={`absolute top-[4%] ${
          bezel ? 'right-[4%]' : 'right-[1%] sm:right-[2%] md:right-[4%]'
        } pointer-events-none z-10`}
      >
        <FadeIn delay={0.15} x={80} y={0} duration={0.9}>
          <img
            src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png"
            alt="Lego 3D icon"
            className={`${
              bezel ? 'w-[210px]' : 'w-[120px] sm:w-[160px] md:w-[210px]'
            } h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]`}
            loading="lazy"
            draggable={false}
          />
        </FadeIn>
      </div>

      {/* Bottom-right: 3D group */}
      <div
        className={`absolute bottom-[8%] ${
          bezel ? 'right-[10%]' : 'right-[3%] sm:right-[6%] md:right-[10%]'
        } pointer-events-none z-10`}
      >
        <FadeIn delay={0.3} x={80} y={0} duration={0.9}>
          <img
            src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png"
            alt="3D group element"
            className={`${
              bezel ? 'w-[220px]' : 'w-[130px] sm:w-[170px] md:w-[220px]'
            } h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]`}
            loading="lazy"
            draggable={false}
          />
        </FadeIn>
      </div>

      {/* Center content wrapper */}
      <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center">
        {/* Heading */}
        <FadeIn delay={0} y={40}>
          <h2
            className="hero-heading font-black uppercase leading-none tracking-tight text-center"
            style={{ fontSize: bezel ? '153.6px' : 'clamp(3rem, 12vw, 160px)' }}
          >
            About me
          </h2>
        </FadeIn>

        {/* Gap between heading and text */}
        <div className={bezel ? 'h-16' : 'h-10 sm:h-14 md:h-16'} />

        {/* Animated paragraph */}
        <div className="w-full max-w-[560px] mx-auto px-4">
          <AnimatedText
            text={aboutText}
            className="text-[#D7E2EA] font-medium text-center leading-relaxed"
          />
        </div>

        {/* Gap between text block and button */}
        <div className={bezel ? 'h-24' : 'h-16 sm:h-20 md:h-24'} />

        {/* Contact button */}
        <FadeIn delay={0.4} y={20}>
          <ContactButton onClick={onOpenContact} />
        </FadeIn>
      </div>
    </section>
  );
};

export default AboutSection;
