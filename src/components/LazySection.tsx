import { useState, useEffect, useRef, ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  rootMargin?: string;
  threshold?: number;
  fallback?: ReactNode;
  eager?: boolean;
}

const LazySection = ({ 
  children, 
  rootMargin = '400px', // Increased from 200px for earlier loading
  threshold = 0.01, // Lower threshold for earlier trigger
  fallback = <div className="min-h-[200px]" />, // Minimal fallback for faster perceived load
  eager = false
}: LazySectionProps) => {
  const [isVisible, setIsVisible] = useState(eager);
  const [hasLoaded, setHasLoaded] = useState(eager);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eager) return; // Skip observer if eager loading

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    // Re-check on resize to handle viewport changes
    const handleResize = () => {
      if (currentRef && !hasLoaded) {
        const rect = currentRef.getBoundingClientRect();
        if (rect.top < window.innerHeight + 400) { // Increased threshold
          setIsVisible(true);
          setHasLoaded(true);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [rootMargin, threshold, hasLoaded, eager]);

  return (
    <div ref={ref}>
      {isVisible || hasLoaded ? children : fallback}
    </div>
  );
};

export default LazySection;