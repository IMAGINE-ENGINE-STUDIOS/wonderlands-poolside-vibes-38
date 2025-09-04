import { useState, useEffect, useRef, ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  rootMargin?: string;
  threshold?: number;
  fallback?: ReactNode;
}

const LazySection = ({ 
  children, 
  rootMargin = '100px',
  threshold = 0.1,
  fallback = <div className="min-h-[200px] flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>
}: LazySectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [rootMargin, threshold, hasLoaded]);

  return (
    <div ref={ref}>
      {isVisible || hasLoaded ? children : fallback}
    </div>
  );
};

export default LazySection;