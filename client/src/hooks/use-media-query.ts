import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => {
      setMatches(media.matches);
    };
    
    // Modern approach with addEventListener
    media.addEventListener('change', listener);
    
    // Initialize
    setMatches(media.matches);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

export default useMediaQuery;