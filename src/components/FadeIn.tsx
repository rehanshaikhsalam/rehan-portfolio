import React, { useMemo } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { usePortfolioScroll } from '../utils/portfolioScrollContext';

interface FadeInProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  immediate?: boolean;
  className?: string;
  as?: 'div' | 'span' | 'section' | 'header' | 'footer' | 'nav' | 'p' | 'h1' | 'h2';
}

const VISIBLE_TARGET = { opacity: 1, x: 0, y: 0 } as const;

export const FadeIn: React.FC<FadeInProps> = React.memo(({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  immediate = false,
  className = '',
  as = 'div',
  ...props
}) => {
  const Component = motion[as] as typeof motion.div;
  const { containerRef: scrollContainerRef } = usePortfolioScroll();

  const initialState = useMemo(() => ({ opacity: 0, x, y }), [x, y]);

  const viewport = useMemo(
    () => ({
      once: true,
      margin: '0px',
      amount: 'some' as const,
      ...(scrollContainerRef ? { root: scrollContainerRef } : {}),
    }),
    [scrollContainerRef]
  );

  const transition = useMemo(
    () => ({
      duration,
      delay,
      ease: [0.25, 0.1, 0.25, 1] as const,
    }),
    [duration, delay]
  );

  if (immediate) {
    return (
      <Component
        initial={initialState}
        animate={VISIBLE_TARGET}
        transition={transition}
        className={className}
        {...props}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      initial={initialState}
      whileInView={VISIBLE_TARGET}
      viewport={viewport}
      transition={transition}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
});

FadeIn.displayName = 'FadeIn';

export default FadeIn;
