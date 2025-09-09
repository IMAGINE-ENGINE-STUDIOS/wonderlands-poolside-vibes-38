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
  rootMargin = '200px',
  threshold = 0.1,
  fallback = <div className="min-h-[200px] flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>,
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
        if (rect.top < window.innerHeight + 200) {
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