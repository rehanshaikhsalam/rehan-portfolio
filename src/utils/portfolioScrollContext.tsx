import React, { createContext, useContext } from 'react';

export interface PortfolioScrollContextValue {
  containerRef: React.RefObject<HTMLDivElement | null> | null;
  embedded: boolean;
}

export const PortfolioScrollContext = createContext<PortfolioScrollContextValue>({
  containerRef: null,
  embedded: false,
});

export function usePortfolioScroll(): PortfolioScrollContextValue {
  return useContext(PortfolioScrollContext);
}

export function withBaseUrl(path: string): string {
  const clean = path.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL || '/';
  return `${base.endsWith('/') ? base : `${base}/`}${clean}`;
}
