import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition - Component for adding smooth transitions between pages
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.transitionType - Transition type: 'fade', 'slide', 'zoom'
 * @param {number} props.duration - Transition duration in milliseconds
 * @returns {JSX.Element}
 */
const PageTransition = ({ 
  children, 
  transitionType = 'fade', 
  duration = 300 
}) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');
  const timeoutRef = useRef(null);

  // Generate animation classes based on type
  const getTransitionClasses = () => {
    const baseClass = 'transition-all will-change-transform will-change-opacity';
    
    switch (transitionType) {
      case 'slide':
        return `${baseClass} ${
          transitionStage === 'fadeOut' 
            ? 'opacity-0 translate-x-10' 
            : 'opacity-100 translate-x-0'
        }`;
      case 'zoom':
        return `${baseClass} ${
          transitionStage === 'fadeOut'
            ? 'opacity-0 scale-95'
            : 'opacity-100 scale-100'
        }`;
      case 'fade':
      default:
        return `${baseClass} ${
          transitionStage === 'fadeOut' 
            ? 'opacity-0' 
            : 'opacity-100'
        }`;
    }
  };

  useEffect(() => {
    // If location changes, start the transition
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('fadeOut');
      
      // Avoid memory leaks by clearing any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // After transition time, update location and animate entrance
      timeoutRef.current = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
      }, duration);
    }
    
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location, displayLocation.pathname, duration]);

  // Apply style based on custom duration
  const transitionStyle = {
    transition: `all ${duration}ms ease-in-out`
  };

  return (
    <div
      className={getTransitionClasses()}
      style={transitionStyle}
    >
      {children}
    </div>
  );
};

export default React.memo(PageTransition);
