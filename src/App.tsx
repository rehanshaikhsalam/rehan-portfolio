/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import PortfolioExperience from './components/PortfolioExperience';
import LaptopDiveOpening from './components/LaptopDiveOpening';

export default function App() {
  const isPortfolioFrame =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('view') === 'portfolio';

  if (isPortfolioFrame) {
    return <PortfolioExperience />;
  }

  return <LaptopDiveOpening />;
}
