import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const location = useLocation();

  // Scroll to top automatically when location (route/query) changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Handle clicking a link pointing to the current page to scroll it back to top
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const anchor = e.target.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href');
        const currentFullPath = window.location.pathname + window.location.search;
        
        // If link points to exactly the current URL (with or without search query)
        if (href && (href === currentFullPath || href === window.location.pathname)) {
          window.scrollTo(0, 0);
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [location]);

  return null;
};

export default ScrollToTop;
