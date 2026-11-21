import React, { useRef, useEffect } from 'react';

interface MagnetProps {
  children: React.ReactNode;
  padding?: number;
  strength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  className?: string;
}

export const Magnet: React.FC<MagnetProps> = React.memo(({
  children,
  padding = 150,
  strength = 3,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.6s ease-in-out',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Skip magnetic mouse tracking on touch devices or when reduced motion is enabled
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return;

    let rafId = 0;
    let isActive = false;
    let lastX = 0;
    let lastY = 0;

    const applyTransform = () => {
      rafId = 0;
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const isNear =
        lastX >= rect.left - padding &&
        lastX <= rect.right + padding &&
        lastY >= rect.top - padding &&
        lastY <= rect.bottom + padding;

      if (isNear) {
        if (!isActive) {
          isActive = true;
          el.style.transition = activeTransition;
        }
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = (lastX - centerX) / strength;
        const dy = (lastY - centerY) / strength;
        el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      } else if (isActive) {
        isActive = false;
        el.style.transition = inactiveTransition;
        el.style.transform = 'translate3d(0px, 0px, 0)';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(applyTransform);
      }
    };

    const handleMouseLeave = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      if (isActive && containerRef.current) {
        isActive = false;
        containerRef.current.style.transition = inactiveTransition;
        containerRef.current.style.transform = 'translate3d(0px, 0px, 0)';
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [padding, strength, activeTransition, inactiveTransition]);

  return (
    <div
      ref={containerRef}
      className={`inline-block ${className}`}
      style={{
        transform: 'translate3d(0px, 0px, 0)',
        transition: inactiveTransition,
      }}
    >
      {children}
    </div>
  );
});

Magnet.displayName = 'Magnet';

export default Magnet;
