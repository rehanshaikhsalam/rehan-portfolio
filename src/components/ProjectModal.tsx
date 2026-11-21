import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { ProjectData } from './ProjectCard';

interface ProjectModalProps {
  project: ProjectData | null;
  onClose: () => void;
  onOpenContact: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = React.memo(({
  project,
  onClose,
  onOpenContact,
}) => {
  if (!project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 25 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90%] overflow-y-auto rounded-[32px] sm:rounded-[48px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-6 sm:p-8 md:p-10 shadow-2xl text-[#D7E2EA] z-10 my-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full text-[#D7E2EA]/70 hover:text-white hover:bg-white/10 transition-colors z-20 cursor-pointer"
            aria-label="Close project modal"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pr-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-semibold uppercase tracking-widest text-purple-400">
                  {project.category}
                </span>
                <span className="text-white/30">•</span>
                <span className="text-xs uppercase tracking-wider text-[#D7E2EA]/60">
                  Case Study {project.id}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight hero-heading">
                {project.name}
              </h2>
              <p className="text-sm text-[#D7E2EA]/70 font-light mt-2 max-w-xl">
                {project.tagline}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  onClose();
                  onOpenContact();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-medium text-xs sm:text-sm uppercase tracking-wider hover:bg-white/90 transition-colors cursor-pointer"
              >
                Inquire Like This <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Image Showcase Grid */}
          <div className="space-y-4 sm:space-y-6 mb-8">
            <div className="rounded-[28px] sm:rounded-[36px] overflow-hidden border border-white/10 max-h-[460px] bg-[#161616]">
              <picture className="block w-full h-full">
                {project.col2ImgWebp && (
                  <source srcSet={project.col2ImgWebp} type="image/webp" />
                )}
                <img
                  src={project.col2Img}
                  alt={project.name}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </picture>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-[24px] overflow-hidden border border-white/10 h-64 sm:h-72 bg-[#161616]">
                <picture className="block w-full h-full">
                  {project.col1Img1Webp && (
                    <source srcSet={project.col1Img1Webp} type="image/webp" />
                  )}
                  <img
                    src={project.col1Img1}
                    alt={`${project.name} detail`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </picture>
              </div>
              <div className="rounded-[24px] overflow-hidden border border-white/10 h-64 sm:h-72 bg-[#161616]">
                <picture className="block w-full h-full">
                  {project.col1Img2Webp && (
                    <source srcSet={project.col1Img2Webp} type="image/webp" />
                  )}
                  <img
                    src={project.col1Img2}
                    alt={`${project.name} workflow details`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </picture>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10 text-sm">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#D7E2EA]/50 block mb-1">
                Tools &amp; Stack
              </span>
              <p className="font-medium text-[#D7E2EA]">
                {project.role || 'Make.com, Google Gemini AI, Google Sheets, Gmail, Webhooks'}
              </p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-[#D7E2EA]/50 block mb-1">
                Scenario Type
              </span>
              <p className="font-medium text-[#D7E2EA]">
                {project.clientType || `${project.category} • Production Scenario`}
              </p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-[#D7E2EA]/50 block mb-1">
                Workflow Flow
              </span>
              <p className="font-medium text-[#D7E2EA]">
                {project.outputs || 'Trigger → Make.com → AI Processing → Sheets & Gmail'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

export default ProjectModal;
