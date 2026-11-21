import React, { useMemo, useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { usePortfolioScroll } from '../utils/portfolioScrollContext';

interface AnimatedTextProps {
  text: string;
  className?: string;
}

interface WordProps {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word: React.FC<WordProps> = React.memo(({ word, progress, range }) => {
  const opacity = useTransform(progress, range, [0.2, 1]);

  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.28em] select-none">
      {word}
    </motion.span>
  );
});

Word.displayName = 'Word';

export const AnimatedText: React.FC<AnimatedTextProps> = React.memo(({ text, className = '' }) => {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const { containerRef: scrollContainerRef } = usePortfolioScroll();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    ...(scrollContainerRef ? { container: scrollContainerRef } : {}),
    offset: ['start 0.85', 'end 0.35'],
  });

  const wordItems = useMemo(() => {
    const split = text.split(' ');
    const total = split.length;
    return split.map((word, index) => {
      const start = index / total;
      const end = Math.min(1, start + 1.5 / total);
      return { word, range: [start, end] as [number, number] };
    });
  }, [text]);

  return (
    <p ref={containerRef} className={`relative flex flex-wrap justify-center ${className}`}>
      {wordItems.map((item, wordIndex) => (
        <Word
          key={wordIndex}
          word={item.word}
          progress={scrollYProgress}
          range={item.range}
        />
      ))}
    </p>
  );
});

AnimatedText.displayName = 'AnimatedText';

export default AnimatedText;
