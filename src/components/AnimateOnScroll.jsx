import React, { useEffect, useRef, useState } from 'react';

/**
 * AnimateOnScroll - Componente que añade animaciones cuando un elemento se vuelve visible
 * @param {Object} props
 * @param {string} props.animation - Tipo de animación: 'fade-in', 'slide-up', 'slide-left', 'slide-right'
 * @param {number} props.delay - Retardo de la animación en múltiplos de 100ms (1-5)
 * @param {boolean} props.once - Si es true, la animación solo ocurre una vez
 * @param {string} props.className - Clases adicionales
 * @param {React.ReactNode} props.children - Contenido del componente
 * @returns {JSX.Element}
 */
const AnimateOnScroll = ({ 
  animation = 'fade-in', 
  delay = 0, 
  once = true, 
  className = '', 
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(currentRef);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );
    
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [once]);
  
  // Determinar clases de animación
  const animationClass = `animate-${animation}`;
  const delayClass = delay > 0 && delay <= 5 ? `delay-${delay}` : '';
  
  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? animationClass : 'opacity-0'} ${delayClass}`}
    >
      {children}
    </div>
  );
};

export default AnimateOnScroll; 