import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true); // Default to dark theme

  useEffect(() => {
    const savedTheme = localStorage.getItem('df_theme') || 'dark';
    
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setIsDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('df_theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('df_theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button 
      onClick={toggleTheme} 
      className="theme-toggle-btn"
      aria-label="Toggle theme mode"
      title="Toggle Light/Dark Mode"
    >
      {isDark ? <Sun className="theme-toggle-icon animate-spin-slow" size={20} /> : <Moon className="theme-toggle-icon" size={20} />}
    </button>
  );
};

export default ThemeToggle;
