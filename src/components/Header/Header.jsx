import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { ThemeToggle } from '../ThemeToggle';
import { Button } from '../ui/Button';

const Header = ({ onLogoClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-light-background-elevated dark:bg-dark-background-elevated border-b border-light-background-tertiary dark:border-dark-background-tertiary backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et nom */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button 
              onClick={onLogoClick}
              className="flex items-center gap-3 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 text-transparent bg-clip-text">
                Autoclipr
              </span>
            </button>
          </motion.div>
          
          {/* Boutons de droite */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="icon"
              className="relative"
              onClick={() => {}}
            >
              <BellIcon className="w-5 h-5 text-light-text-primary dark:text-dark-text-primary" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full border-2 border-light-background-elevated dark:border-dark-background-elevated" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
