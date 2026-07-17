import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Customize nprogress globally
NProgress.configure({ 
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.1
});

const TopProgressBar = () => {
  const location = useLocation();

  useEffect(() => {
    NProgress.start();
    
    const timeout = setTimeout(() => {
      NProgress.done();
    }, 400); // Simulate network latency on route transition
    
    return () => {
      clearTimeout(timeout);
      NProgress.done();
    };
  }, [location]);

  return null;
};

export default TopProgressBar;
