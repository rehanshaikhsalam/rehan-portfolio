/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';

const PortfolioExperience = lazy(() => import('./components/PortfolioExperience'));
const LaptopDiveOpening = lazy(() => import('./components/LaptopDiveOpening'));

export default function App() {
  const isPortfolioFrame =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('view') === 'portfolio';

  if (isPortfolioFrame) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#0C0C0C]" />}>
        <PortfolioExperience />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#0b2f20]" />}>
      <LaptopDiveOpening />
    </Suspense>
  );
}
