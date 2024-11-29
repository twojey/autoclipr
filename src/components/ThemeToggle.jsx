import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../utils/cn';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative w-9 h-9",
        "bg-light-background-secondary dark:bg-dark-background-secondary",
        "hover:bg-light-background-hover dark:hover:bg-dark-background-hover",
        "border border-light-border dark:border-dark-border",
        "shadow-sm hover:shadow-md transition-all duration-200"
      )}
      aria-label={isDark ? "Activer le thème clair" : "Activer le thème sombre"}
    >
      <div className="relative w-full h-full">
        <motion.div
          initial={false}
          animate={{
            scale: isDark ? 0 : 1,
            rotate: isDark ? 90 : 0,
            opacity: isDark ? 0 : 1
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <SunIcon className="w-5 h-5 text-yellow-500" />
        </motion.div>
        
        <motion.div
          initial={false}
          animate={{
            scale: isDark ? 1 : 0,
            rotate: isDark ? 0 : -90,
            opacity: isDark ? 1 : 0
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <MoonIcon className="w-5 h-5 text-blue-400" />
        </motion.div>
      </div>
    </Button>
  );
};
