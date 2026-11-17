import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import LiveProjectButton from './LiveProjectButton';
import { usePortfolioScroll } from '../utils/portfolioScrollContext';

export interface ProjectData {
  id: string;
  name: string;
  category: string;
  tagline: string;
  col1Img1: string;
  col1Img2: string;
  col2Img: string;
  liveUrl?: string;
  role?: string;
  clientType?: string;
  outputs?: string;
}

interface ProjectCardProps {
  project: ProjectData;
  index: number;
  totalCards: number;
  onSelectProject: (project: ProjectData) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  totalCards,
  onSelectProject,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { containerRef: scrollContainerRef, bezel } = usePortfolioScroll();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    ...(scrollContainerRef ? { container: scrollContainerRef } : {}),
    offset: ['start start', 'end start'],
  });

  const targetScale = 1 - (totalCards - 1 - index) * 0.03;
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);

  return (
    <div
      ref={containerRef}
      className={`${
        bezel ? 'h-[735px] min-h-[720px]' : 'h-[85vh] min-h-[640px] md:min-h-[720px]'
      } flex items-start justify-center relative`}
    >
      <motion.div
        style={{
          top: `calc(5.5rem + ${index * 28}px)`,
          scale,
          transformOrigin: 'top center',
        }}
        className={`sticky w-full ${
          bezel
            ? 'rounded-[60px] p-8'
            : 'rounded-[40px] sm:rounded-[50px] md:rounded-[60px] p-4 sm:p-6 md:p-8'
        } border-2 border-[#D7E2EA] bg-[#0C0C0C] select-none shadow-[0_-10px_40px_rgba(0,0,0,0.8)]`}
      >
        {/* Top Row: Number, Details, and Live Project Button */}
        <div
          className={`flex ${
            bezel
              ? 'flex-row items-center mb-8'
              : 'flex-col sm:flex-row items-start sm:items-center mb-5 sm:mb-6 md:mb-8'
          } justify-between gap-4`}
        >
          <div className={`flex items-center ${bezel ? 'gap-8' : 'gap-4 sm:gap-6 md:gap-8'}`}>
            {/* Number (Huge, same style as services) */}
            <span
              className="font-black text-[#D7E2EA] leading-none tracking-tighter select-none"
              style={{ fontSize: bezel ? '83.2px' : 'clamp(2.8rem, 6.5vw, 100px)' }}
            >
              {project.id}
            </span>

            {/* Category and Project Name */}
            <div className="flex flex-col">
              <span
                className={`${
                  bezel ? 'text-sm' : 'text-xs sm:text-sm'
                } uppercase tracking-widest text-[#D7E2EA]/60 font-light`}
              >
                {project.category}
              </span>
              <h3
                className={`${
                  bezel ? 'text-4xl' : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl'
                } font-medium uppercase text-[#D7E2EA] tracking-wide`}
              >
                {project.name}
              </h3>
            </div>
          </div>

          {/* Live Project Button */}
          <LiveProjectButton onClick={() => onSelectProject(project)} />
        </div>

        {/* Bottom Row: 2-column image grid */}
        <div
          className={`flex ${
            bezel ? 'flex-row gap-6' : 'flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6'
          } w-full`}
        >
          {/* Left Column (40% width): 2 stacked images */}
          <div className={`${bezel ? 'w-[40%] gap-6' : 'w-full sm:w-[40%] gap-3 sm:gap-4 md:gap-6'} flex flex-col`}>
            <div
              className={`overflow-hidden ${
                bezel ? 'rounded-[50px]' : 'rounded-[30px] sm:rounded-[40px] md:rounded-[50px]'
              } bg-[#161616] border border-white/10 group cursor-pointer`}
              style={{ height: bezel ? '204.8px' : 'clamp(130px, 16vw, 230px)' }}
              onClick={() => onSelectProject(project)}
            >
              <img
                src={project.col1Img1}
                alt={`${project.name} asset 1`}
                loading="lazy"
                className={`w-full h-full object-cover ${
                  bezel ? 'rounded-[50px]' : 'rounded-[30px] sm:rounded-[40px] md:rounded-[50px]'
                } transition-transform duration-700 group-hover:scale-105`}
              />
            </div>
            <div
              className={`overflow-hidden ${
                bezel ? 'rounded-[50px]' : 'rounded-[30px] sm:rounded-[40px] md:rounded-[50px]'
              } bg-[#161616] border border-white/10 group cursor-pointer`}
              style={{ height: bezel ? '281.6px' : 'clamp(160px, 22vw, 340px)' }}
              onClick={() => onSelectProject(project)}
            >
              <img
                src={project.col1Img2}
                alt={`${project.name} asset 2`}
                loading="lazy"
                className={`w-full h-full object-cover ${
                  bezel ? 'rounded-[50px]' : 'rounded-[30px] sm:rounded-[40px] md:rounded-[50px]'
                } transition-transform duration-700 group-hover:scale-105`}
              />
            </div>
          </div>

          {/* Right Column (60% width): 1 tall image */}
          <div
            className={`${
              bezel ? 'w-[60%] rounded-[50px]' : 'w-full sm:w-[60%] rounded-[30px] sm:rounded-[40px] md:rounded-[50px]'
            } overflow-hidden bg-[#161616] border border-white/10 group cursor-pointer`}
            style={{ minHeight: bezel ? '512px' : 'clamp(280px, 40vw, 580px)' }}
            onClick={() => onSelectProject(project)}
          >
            <img
              src={project.col2Img}
              alt={`${project.name} featured display`}
              loading="lazy"
              className={`w-full h-full object-cover ${
                bezel ? 'rounded-[50px]' : 'rounded-[30px] sm:rounded-[40px] md:rounded-[50px]'
              } transition-transform duration-700 group-hover:scale-105`}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectCard;
