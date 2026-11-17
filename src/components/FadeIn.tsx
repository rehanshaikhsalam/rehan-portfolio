import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { usePortfolioScroll } from '../utils/portfolioScrollContext';

interface FadeInProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'span' | 'section' | 'header' | 'footer' | 'nav' | 'p' | 'h1' | 'h2';
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  className = '',
  as = 'div',
  ...props
}) => {
  const Component = motion[as] as typeof motion.div;
  const { containerRef: scrollContainerRef } = usePortfolioScroll();

  return (
    <Component
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{
        once: true,
        margin: '50px',
        amount: 0,
        ...(scrollContainerRef ? { root: scrollContainerRef } : {}),
      }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
};

export default FadeIn;
