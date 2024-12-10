import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et nom */}
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={onLogoClick}
          >
            <img 
              src={isDark ? "/heyddit_dark_bg.png" : "/heyddit_white_bg.png"}
              alt="Heyddit Logo" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                Heyddit
              </span>
          </motion.div>
          
          {/* Boutons de droite */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDark ? 'dark' : 'light'}
                  initial={{ scale: 0, rotate: -180, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0, rotate: 180, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isDark ? (
                    <SunIcon className="w-5 h-5 text-gray-200" />
                  ) : (
                    <MoonIcon className="w-5 h-5 text-gray-800" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
              onClick={() => {}}
            >
              <BellIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
