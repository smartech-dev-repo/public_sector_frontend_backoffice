import { useState } from '#app';

export const useTheme = () => {
  const isDark = useState('theme-dark', () => false);

  const toggleTheme = () => {
    isDark.value = !isDark.value;
    if (typeof window !== 'undefined') {
      if (isDark.value) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  };

  const initTheme = () => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      // Default to light mode as requested
      if (storedTheme === 'dark') {
        isDark.value = true;
        document.documentElement.classList.add('dark');
      } else {
        isDark.value = false;
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return { isDark, toggleTheme, initTheme };
};
