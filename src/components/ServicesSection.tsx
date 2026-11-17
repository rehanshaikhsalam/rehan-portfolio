import React from 'react';
import FadeIn from './FadeIn';
import { usePortfolioScroll } from '../utils/portfolioScrollContext';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: '01',
    name: 'Automation',
    description:
      'Practical workflow automation in Make.com -- scenario design, triggers & actions, filters & routers, scheduling, data mapping, and error handling.',
  },
  {
    id: '02',
    name: 'AI Automation',
    description:
      'AI-powered workflows integrating Google Gemini, prompt-based data processing, AI-assisted email workflows, and AI voice agent concepts.',
  },
  {
    id: '03',
    name: 'Integrations',
    description:
      'Connecting Gmail, Google Sheets, Google Forms, webhooks, JSON payloads, and basic API integrations so business tools work together seamlessly.',
  },
  {
    id: '04',
    name: 'Lead & Email Ops',
    description:
      'Automated lead capture into Google Sheets, smart inquiry routing, personalized Gmail replies, and instant business notifications.',
  },
  {
    id: '05',
    name: 'Process Design',
    description:
      'Understanding repetitive business problems, planning workflow logic, building client-ready Make.com scenarios, and testing for reliability.',
  },
];

export const ServicesSection: React.FC = () => {
  const { bezel } = usePortfolioScroll();

  return (
    <section
      id="services"
      className={`relative bg-white text-[#0C0C0C] ${
        bezel
          ? 'rounded-t-[60px] px-10 py-32'
          : 'rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32'
      } z-0`}
    >
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <FadeIn delay={0} y={40}>
          <h2
            className={`text-[#0C0C0C] font-black uppercase text-center leading-none tracking-tight ${
              bezel ? 'mb-28' : 'mb-16 sm:mb-20 md:mb-28'
            }`}
            style={{ fontSize: bezel ? '153.6px' : 'clamp(3rem, 12vw, 160px)' }}
          >
            Skills
          </h2>
        </FadeIn>

        {/* Services List */}
        <div className="flex flex-col">
          {SERVICES.map((service, index) => (
            <FadeIn
              key={service.id}
              delay={index * 0.1}
              y={30}
              className={`border-t border-[rgba(12,12,12,0.15)] last:border-b ${
                bezel ? 'py-12' : 'py-8 sm:py-10 md:py-12'
              } transition-colors duration-300 hover:bg-black/[0.02]`}
            >
              <div
                className={`flex ${
                  bezel
                    ? 'flex-row items-center gap-12'
                    : 'flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 md:gap-12'
                } justify-between`}
              >
                {/* Number on left */}
                <div
                  className={`font-black text-[#0C0C0C] leading-none select-none tracking-tighter shrink-0 ${
                    bezel ? 'min-w-[180px]' : 'min-w-[80px] sm:min-w-[140px] md:min-w-[180px]'
                  }`}
                  style={{ fontSize: bezel ? '128px' : 'clamp(3rem, 10vw, 140px)' }}
                >
                  {service.id}
                </div>

                {/* Name & Description on right */}
                <div className="flex flex-col justify-center flex-1 space-y-2">
                  <h3
                    className="font-medium uppercase text-[#0C0C0C] tracking-wide"
                    style={{ fontSize: bezel ? '28.16px' : 'clamp(1rem, 2.2vw, 2.1rem)' }}
                  >
                    {service.name}
                  </h3>
                  <p
                    className="font-light leading-relaxed text-[#0C0C0C] opacity-60 max-w-2xl"
                    style={{ fontSize: bezel ? '20px' : 'clamp(0.85rem, 1.6vw, 1.25rem)' }}
                  >
                    {service.description}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
