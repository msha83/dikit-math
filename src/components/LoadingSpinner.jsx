import React from 'react';

const LoadingSpinner = ({ size = 'medium' }) => {
  let sizeClass = 'h-12 w-12';
  
  if (size === 'small') {
    sizeClass = 'h-8 w-8';
  } else if (size === 'large') {
    sizeClass = 'h-16 w-16';
  }
  
  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${sizeClass}`}></div>
    </div>
  );
};

export default LoadingSpinner; 