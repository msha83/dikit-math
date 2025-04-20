import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

/**
 * LottieAnimation - Component for rendering Lottie animations
 * @param {Object} props
 * @param {Object|string} props.animationData - Animation data or path to JSON file
 * @param {number} props.width - Container width (default 100%)
 * @param {number} props.height - Container height (default auto)
 * @param {boolean} props.loop - Whether the animation should loop
 * @param {boolean} props.autoplay - Whether the animation should start automatically
 * @param {string} props.className - Additional classes
 * @returns {JSX.Element}
 */
const LottieAnimation = ({ 
  animationData, 
  width = '100%', 
  height = 'auto', 
  loop = true, 
  autoplay = true,
  className = ''
}) => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && animationData) {
      // Destroy previous animation if it exists
      if (animationRef.current) {
        animationRef.current.destroy();
      }

      // Load the animation
      const loadAnimation = async () => {
        let animData = animationData;
        
        // If it's a URL or path, load the JSON
        if (typeof animationData === 'string') {
          try {
            const response = await fetch(animationData);
            animData = await response.json();
          } catch (error) {
            console.error('Error loading Lottie animation:', error);
            return;
          }
        }
        
        // Initialize the animation
        animationRef.current = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop,
          autoplay,
          animationData: animData,
          rendererSettings: {
            progressiveLoad: true,
            preserveAspectRatio: 'xMidYMid slice',
          }
        });
        
        // Optimization: reduce quality and CPU usage on mobile devices
        if (window.innerWidth < 768) {
          animationRef.current.setSubframe(false);
        }
      };
      
      loadAnimation();
    }
    
    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, [animationData, loop, autoplay]);

  return (
    <div 
      className={`lottie-container will-change-transform ${className}`}
      ref={containerRef} 
      style={{ width, height }}
    />
  );
};

export default LottieAnimation; 