import React from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';
import ContactButton from './ContactButton';
import { usePortfolioScroll } from '../utils/portfolioScrollContext';

interface FooterProps {
  onOpenContact: () => void;
  onOpenResume: () => void;
}

export const Footer: React.FC<FooterProps> = React.memo(({ onOpenContact, onOpenResume }) => {
  const { containerRef: scrollContainerRef, bezel } = usePortfolioScroll();
  const scrollToTop = () => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer
      id="contact"
      className={`relative bg-[#0C0C0C] text-[#D7E2EA] ${
        bezel ? 'px-10 py-20' : 'px-6 md:px-10 py-16 sm:py-20'
      } border-t border-white/10 z-10`}
      style={{ contain: 'layout style' }}
    >
      <div
        className={`max-w-6xl mx-auto flex ${
          bezel
            ? 'flex-row items-center justify-between text-left'
            : 'flex-col md:flex-row items-center justify-between text-center md:text-left'
        } gap-8`}
      >
        <div>
          <div
            className={`flex items-center ${
              bezel ? 'justify-start' : 'justify-center md:justify-start'
            } gap-2 text-xs font-semibold uppercase tracking-widest text-purple-400 mb-2`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Rehan Shaikh • AI Automation &amp; No-Code Specialist
          </div>
          <h3
            className={`hero-heading ${
              bezel ? 'text-5xl' : 'text-3xl sm:text-4xl md:text-5xl'
            } font-black uppercase tracking-tight`}
          >
            Let&apos;s Build Something Useful
          </h3>
          <p className="text-sm text-[#D7E2EA]/60 max-w-md font-light mt-2">
            Open to internships &amp; freelance automation work — building practical business automations with Make.com, AI, Google Workspace and webhooks.
          </p>
        </div>

        <div className={`flex ${bezel ? 'flex-row' : 'flex-col sm:flex-row'} items-center gap-4`}>
          <ContactButton onClick={onOpenContact} label="Get In Touch" />
          <button
            onClick={scrollToTop}
            className="p-3.5 rounded-full border border-white/20 text-[#D7E2EA] hover:bg-white/10 hover:border-white/40 transition-colors cursor-pointer"
            aria-label="Back to top"
            title="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        className={`max-w-6xl mx-auto mt-12 pt-8 border-t border-white/5 flex ${
          bezel ? 'flex-row' : 'flex-col sm:flex-row'
        } items-center justify-between text-xs text-[#D7E2EA]/40 gap-4`}
      >
        <span>© {new Date().getFullYear()} Rehan Shaikh. All rights reserved.</span>
        <div className="flex items-center gap-6 uppercase tracking-wider">
          <a
            href="mailto:rehanshaikhsalam@gmail.com"
            className="hover:text-[#D7E2EA] transition-colors cursor-pointer"
          >
            Email
          </a>
          <a
            href="https://wa.me/919014700399?text=Hi%20Rehan%2C%20I%20visited%20your%20portfolio%20and%20would%20like%20to%20discuss%20an%20AI%20automation%20project."
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#D7E2EA] transition-colors cursor-pointer"
          >
            WhatsApp
          </a>
          <button
            type="button"
            onClick={onOpenResume}
            aria-label="Open Resume PDF"
            className="hover:text-[#D7E2EA] transition-colors cursor-pointer uppercase tracking-wider"
          >
            Resume
          </button>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
