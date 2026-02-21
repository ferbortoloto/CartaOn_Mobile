import { useState, useEffect } from 'react';
import { instructors } from '../data/instructors';

export function useInstructorSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setResults(instructors);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return { instructors: results, loading };
}
