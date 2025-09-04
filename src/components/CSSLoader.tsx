import { useEffect } from 'react';

interface CSSLoaderProps {
  href: string;
  id: string;
}

export const CSSLoader = ({ href, id }: CSSLoaderProps) => {
  useEffect(() => {
    // Check if stylesheet is already loaded
    if (document.getElementById(id)) {
      return;
    }

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
    };
    
    document.head.appendChild(link);

    return () => {
      const existingLink = document.getElementById(id);
      if (existingLink) {
        document.head.removeChild(existingLink);
      }
    };
  }, [href, id]);

  return null;
};

// Hook for conditional CSS loading
export const useConditionalCSS = (condition: boolean, href: string, id: string) => {
  useEffect(() => {
    if (!condition) return;

    // Check if stylesheet is already loaded
    if (document.getElementById(id)) {
      return;
    }

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
    };
    
    document.head.appendChild(link);
  }, [condition, href, id]);
};