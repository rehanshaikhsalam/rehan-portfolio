import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import FadeIn from './FadeIn';
import ProjectCard, { ProjectData } from './ProjectCard';
import { loadResumeState, patchResumeState, subscribeResumeSync } from '../utils/resumeState';
import { usePortfolioScroll, withBaseUrl } from '../utils/portfolioScrollContext';

const ProjectModal = lazy(() => import('./ProjectModal'));

interface ProjectsSectionProps {
  onOpenContact: () => void;
}

const SHOWCASE_VIDEO_SRC = withBaseUrl(
  'assets/aistudio/Integration_Webhooks__Google_Gemini_AI___Make_-_Google_Chrome_2026-11-02_16-56-36_724c50df.mp4'
);

const OTHER_PROJECTS: ProjectData[] = [
  {
    id: '02',
    name: 'Automated Lead Management',
    category: 'Make.com • Lead Capture',
    tagline:
      'Leads submitted through Google Forms are watched by Make.com in real time, mapped into Google Sheets, and routed to trigger automated follow-up emails.',
    col1Img1: withBaseUrl('assets/project-2-form.jpg'),
    col1Img1Webp: withBaseUrl('assets/project-2-form.webp'),
    col1Img2: withBaseUrl('assets/project-2-sheets.jpg'),
    col1Img2Webp: withBaseUrl('assets/project-2-sheets.webp'),
    col2Img: withBaseUrl('assets/project-2.jpg'),
    col2ImgWebp: withBaseUrl('assets/project-2.webp'),
    role: 'Make.com Scenario Design, Google Forms, Google Sheets, Gmail, Filters, Data Mapping',
    clientType: 'Live Scenario • Lead Capture & Organization',
    outputs: 'Lead / Form Input → Make.com → Data Processing → Google Sheets → Notification',
  },
  {
    id: '03',
    name: 'Smart Lead Response Router',
    category: 'Make.com • Gemini AI & Routing',
    tagline:
      'Incoming enquiries are analyzed by Google Gemini AI to generate a summary and tailored response, then automatically routed across Gmail branches.',
    col1Img1: withBaseUrl('assets/project-2-flow.jpg'),
    col1Img1Webp: withBaseUrl('assets/project-2-flow.webp'),
    col1Img2: withBaseUrl('assets/project-1-details.jpg'),
    col1Img2Webp: withBaseUrl('assets/project-1-details.webp'),
    col2Img: withBaseUrl('assets/project-1.jpg'),
    col2ImgWebp: withBaseUrl('assets/project-1.webp'),
    role: 'Make.com Orchestration, Google Gemini AI, Conditional Routers, Webhooks, Gmail, Sheets',
    clientType: 'Live Scenario • Multi-Branch Routing',
    outputs: 'Sheets Watch → Gemini AI → 3-Way Router → Conditional Gmail Replies',
  },
];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Isolated video showcase component so frequent `onTimeUpdate` ticks
 * during playback never re-render the stacking ProjectCards below.
 * Also defers fetching the 8.5 MB MP4 until the player approaches the viewport.
 */
const FeaturedVideoShowcase: React.FC = React.memo(() => {
  const { containerRef: scrollContainerRef, bezel } = usePortfolioScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [isCinemaFullscreen, setIsCinemaFullscreen] = useState(false);
  const [videoPreload, setVideoPreload] = useState<'none' | 'metadata'>('none');

  const isFullscreen = isNativeFullscreen || isCinemaFullscreen;

  // Defer downloading MP4 metadata until user scrolls within 400px of the video
  useEffect(() => {
    const el = containerRef.current;
    if (!el || videoPreload === 'metadata') return;

    if (typeof IntersectionObserver === 'undefined') {
      setVideoPreload('metadata');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVideoPreload('metadata');
          observer.disconnect();
        }
      },
      {
        root: scrollContainerRef?.current ?? null,
        rootMargin: '400px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollContainerRef, videoPreload]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (videoPreload === 'none') {
      setVideoPreload('metadata');
    }

    if (video.paused || video.ended) {
      try {
        await video.play();
      } catch {
        video.muted = true;
        setIsMuted(true);
        try {
          await video.play();
        } catch {
          // Ignore playback interruption
        }
      }
    } else {
      video.pause();
    }
  }, [videoPreload]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    if (!nextMuted && video.volume === 0) {
      video.volume = 1;
      setVolume(1);
    }
    setIsMuted(nextMuted);
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const nextVol = parseFloat(e.target.value);
    video.volume = nextVol;
    video.muted = nextVol === 0;
    setVolume(nextVol);
    setIsMuted(nextVol === 0);
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const nextTime = parseFloat(e.target.value);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    const video = videoRef.current as
      | (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
      | null;

    if (isCinemaFullscreen) {
      setIsCinemaFullscreen(false);
      return;
    }

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // ignore exit error
      }
      return;
    }

    if (container && typeof container.requestFullscreen === 'function') {
      try {
        await container.requestFullscreen();
        return;
      } catch {
        // Fallback if host frame blocks native fullscreen
      }
    }

    if (video && typeof video.webkitEnterFullscreen === 'function') {
      try {
        video.webkitEnterFullscreen();
        return;
      } catch {
        // Fallback to cinema overlay
      }
    }

    setIsCinemaFullscreen(true);
  }, [isCinemaFullscreen]);

  useEffect(() => {
    const onFsChange = () => {
      setIsNativeFullscreen(document.fullscreenElement === containerRef.current);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCinemaFullscreen) {
        setIsCinemaFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isCinemaFullscreen]);

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className={bezel ? 'mb-24' : 'mb-14 sm:mb-20 md:mb-24'}>
      <FadeIn delay={0.1} y={30}>
        <div
          ref={containerRef}
          className={
            isCinemaFullscreen
              ? 'fixed inset-0 z-50 bg-black flex flex-col justify-between'
              : `relative w-full mx-auto ${
                  bezel
                    ? 'rounded-[60px] p-8'
                    : 'rounded-[40px] sm:rounded-[50px] md:rounded-[60px] p-4 sm:p-6 md:p-8'
                } border-2 border-[#D7E2EA] bg-[#0C0C0C] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.8)]`
          }
        >
          {!isFullscreen && (
            <div
              className={`flex items-center ${
                bezel ? 'gap-8 mb-6' : 'gap-4 sm:gap-6 md:gap-8 mb-5 sm:mb-6'
              }`}
            >
              <span
                className="font-black text-[#D7E2EA] leading-none tracking-tighter select-none"
                style={{ fontSize: bezel ? '83.2px' : 'clamp(2.8rem, 6.5vw, 100px)' }}
              >
                01
              </span>
              <div className="flex flex-col">
                <span
                  className={`${
                    bezel ? 'text-sm' : 'text-xs sm:text-sm'
                  } uppercase tracking-widest text-[#D7E2EA]/60 font-light`}
                >
                  Make.com • Webhooks &amp; Gemini AI
                </span>
                <h3
                  className={`${
                    bezel ? 'text-4xl' : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl'
                  } font-medium uppercase text-[#D7E2EA] tracking-wide`}
                >
                  AI Lead Scoring &amp; Airtable Pipeline
                </h3>
              </div>
            </div>
          )}

          {/* Video Frame */}
          <div
            className={
              isFullscreen
                ? 'relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden'
                : `relative w-full ${
                    bezel
                      ? 'rounded-[38px]'
                      : 'rounded-[24px] sm:rounded-[32px] md:rounded-[38px]'
                  } border border-white/10 bg-black flex flex-col overflow-hidden`
            }
          >
            <div
              className={
                isFullscreen
                  ? 'relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden'
                  : `relative w-full bg-black flex items-center justify-center overflow-hidden aspect-[1920/1020] ${
                      bezel ? 'max-h-[665px]' : 'max-h-[calc(100vh-200px)]'
                    }`
              }
            >
              <video
                ref={videoRef}
                src={SHOWCASE_VIDEO_SRC}
                playsInline
                preload={videoPreload}
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onLoadedMetadata={(e) => {
                  const vid = e.currentTarget;
                  setDuration(vid.duration || 0);
                  setIsMuted(vid.muted);
                  setVolume(vid.volume);
                }}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onVolumeChange={(e) => {
                  setIsMuted(e.currentTarget.muted || e.currentTarget.volume === 0);
                  setVolume(e.currentTarget.volume);
                }}
                className="w-full h-full object-contain cursor-pointer select-none"
              />

              {/* Centered Play Button Overlay when paused */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label="Play workflow showcase video"
                  className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/15 transition-colors cursor-pointer group"
                >
                  <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 text-[#0C0C0C] flex items-center justify-center shadow-[0_12px_36px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-110">
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1 fill-current" />
                  </span>
                </button>
              )}
            </div>

            {/* Clean Unobtrusive Control Bar below video */}
            <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-3.5 bg-[#0C0C0C] border-t border-white/10 text-[#D7E2EA]">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                className="w-9 h-9 rounded-full bg-white text-[#0C0C0C] flex items-center justify-center hover:bg-white/90 transition-colors cursor-pointer shrink-0"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5 fill-current" />
                )}
              </button>

              <span className="text-xs font-medium tabular-nums text-[#D7E2EA]/80 shrink-0 min-w-[74px]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div className="relative flex-1 flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  aria-label="Seek video timeline"
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-white bg-white/20"
                  style={{
                    background: `linear-gradient(to right, #D7E2EA ${progressPct}%, rgba(255,255,255,0.2) ${progressPct}%)`,
                  }}
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                  className="p-2 rounded-full hover:bg-white/10 text-[#D7E2EA] transition-colors cursor-pointer"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Volume"
                  className="hidden sm:block w-16 md:w-20 h-1 rounded-full appearance-none cursor-pointer accent-white bg-white/25"
                />
              </div>

              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                className="p-2 rounded-full hover:bg-white/10 text-[#D7E2EA] transition-colors cursor-pointer shrink-0"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
});

export const ProjectsSection: React.FC<ProjectsSectionProps> = React.memo(({ onOpenContact }) => {
  const { bezel } = usePortfolioScroll();

  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(() => {
    const savedId = loadResumeState().selectedProjectId;
    return savedId ? OTHER_PROJECTS.find((p) => p.id === savedId) ?? null : null;
  });

  useEffect(() => {
    return subscribeResumeSync((state) => {
      const next = state.selectedProjectId
        ? OTHER_PROJECTS.find((p) => p.id === state.selectedProjectId) ?? null
        : null;
      setSelectedProject((prev) => (prev?.id === next?.id ? prev : next));
    });
  }, []);

  const handleSelectProject = useCallback((proj: ProjectData | null) => {
    setSelectedProject(proj);
    patchResumeState({ selectedProjectId: proj ? proj.id : null });
  }, []);

  const handleCloseProject = useCallback(() => {
    handleSelectProject(null);
  }, [handleSelectProject]);

  return (
    <section
      id="projects"
      className={`relative bg-[#0C0C0C] ${
        bezel
          ? 'rounded-t-[60px] -mt-14 px-10 pt-32'
          : 'rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 px-4 sm:px-8 md:px-10 pt-20 sm:pt-24 md:pt-32'
      } z-10 pb-32`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading: "Project" (singular) */}
        <div className={bezel ? 'mb-24 text-center' : 'mb-14 sm:mb-20 md:mb-24 text-center'}>
          <FadeIn delay={0} y={40}>
            <h2
              className="hero-heading font-black uppercase leading-none tracking-tight text-center"
              style={{ fontSize: bezel ? '153.6px' : 'clamp(3rem, 12vw, 160px)' }}
            >
              Project
            </h2>
          </FadeIn>
        </div>

        {/* 01 Featured Full-Screen Cinematic Video Showcase */}
        <FeaturedVideoShowcase />

        {/* Remaining 2 Stacking Project Cards */}
        <div className="relative">
          {OTHER_PROJECTS.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              totalCards={OTHER_PROJECTS.length}
              onSelectProject={handleSelectProject}
            />
          ))}
        </div>
      </div>

      {/* Project Detail Lightbox Modal — mounted & code-split on demand */}
      {selectedProject && (
        <Suspense fallback={null}>
          <ProjectModal
            project={selectedProject}
            onClose={handleCloseProject}
            onOpenContact={onOpenContact}
          />
        </Suspense>
      )}
    </section>
  );
});

export default ProjectsSection;
