import React from 'react';
import { usePortfolioScroll } from '../utils/portfolioScrollContext';

interface LiveProjectButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  onClick?: () => void;
  className?: string;
}

export const LiveProjectButton: React.FC<LiveProjectButtonProps> = ({
  label = 'Live Project',
  onClick,
  className = '',
  ...props
}) => {
  const { bezel } = usePortfolioScroll();

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest transition-all duration-200 hover:bg-[#D7E2EA]/10 cursor-pointer select-none ${
        bezel ? 'px-10 py-3.5 text-base' : 'px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base'
      } ${className}`}
      {...props}
    >
      <span>{label}</span>
    </button>
  );
};

export default LiveProjectButton;
