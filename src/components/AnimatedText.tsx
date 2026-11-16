import React, { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
}

interface CharProps {
  char: string;
  progress: MotionValue<number>;
  range: [number, number];
}

const Character: React.FC<CharProps> = ({ char, progress, range }) => {
  const opacity = useTransform(progress, range, [0.2, 1]);

  return (
    <span className="relative inline-block">
      <span className="opacity-0 select-none">{char === ' ' ? '\u00A0' : char}</span>
      <motion.span
        style={{ opacity }}
        className="absolute inset-0 select-none"
      >
        {char === ' ' ? '\u00A0' : char}
      </motion.span>
    </span>
  );
};

export const AnimatedText: React.FC<AnimatedTextProps> = ({ text, className = '' }) => {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.2'],
  });

  const totalChars = text.length;
  const words = text.split(' ');

  let currentGlobalCharIndex = 0;

  return (
    <p ref={containerRef} className={`relative flex flex-wrap justify-center ${className}`}>
      {words.map((word, wordIndex) => {
        const wordChars = word.split('');
        const isLastWord = wordIndex === words.length - 1;

        return (
          <span key={wordIndex} className="inline-block whitespace-nowrap">
            {wordChars.map((char) => {
              const charIndex = currentGlobalCharIndex++;
              const start = charIndex / totalChars;
              const end = Math.min(1, start + 1 / totalChars);

              return (
                <Character
                  key={charIndex}
                  char={char}
                  progress={scrollYProgress}
                  range={[start, end]}
                />
              );
            })}
            {!isLastWord && (() => {
              const spaceIndex = currentGlobalCharIndex++;
              const start = spaceIndex / totalChars;
              const end = Math.min(1, start + 1 / totalChars);
              return (
                <Character
                  key={spaceIndex}
                  char=" "
                  progress={scrollYProgress}
                  range={[start, end]}
                />
              );
            })()}
          </span>
        );
      })}
    </p>
  );
};

export default AnimatedText;
