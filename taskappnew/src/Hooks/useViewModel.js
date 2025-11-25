import { useState, useEffect } from 'react';

export const useViewMode = () => {
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('taskViewMode') || 'card';
  });

  useEffect(() => {
    localStorage.setItem('taskViewMode', viewMode);
  }, [viewMode]);

  const toggleView = () => {
    setViewMode(prev => prev === 'card' ? 'table' : 'card');
  };

  return { viewMode, setViewMode, toggleView };
};