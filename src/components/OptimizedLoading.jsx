import React from 'react';
import LottieAnimation from './LottieAnimation';
import { loadingAnimation } from '../animations/mathAnimations';

const OptimizedLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-32 h-32">
      <LottieAnimation animationData={loadingAnimation} />
    </div>
  </div>
);

export default OptimizedLoading; 