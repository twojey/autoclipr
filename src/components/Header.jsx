import React from 'react';
import { Link } from 'react-router-dom';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';
import NotificationCenter from './notifications/NotificationCenter';

const Header = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-light-background-primary/80 dark:bg-dark-background-primary/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="group flex items-center space-x-2 font-display text-2xl font-bold 
                     transition-all duration-300 hover:scale-105"
          >
            <span className="bg-gradient-to-r from-primary-500 to-accent-500 
                           bg-clip-text text-transparent animate-pulse-glow">
              Autoclipr
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden sm:flex items-center space-x-8">
            <Link 
              to="/editor" 
              className="relative text-light-text-secondary dark:text-dark-text-secondary 
                       hover:text-light-text-primary dark:hover:text-dark-text-primary 
                       transition-all duration-300 group"
            >
              Editor
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r 
                             from-primary-500 to-accent-500 transition-all duration-300 
                             group-hover:w-full"></span>
            </Link>
            <Link 
              to="/projects" 
              className="relative text-light-text-secondary dark:text-dark-text-secondary 
                       hover:text-light-text-primary dark:hover:text-dark-text-primary 
                       transition-all duration-300 group"
            >
              Projects
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r 
                             from-primary-500 to-accent-500 transition-all duration-300 
                             group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Centre de notifications */}
            <NotificationCenter />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-icon group"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <SunIcon className="w-6 h-6 text-light-text-secondary dark:text-dark-text-secondary 
                                  group-hover:text-primary-500 dark:group-hover:text-primary-400 
                                  transition-colors duration-300" />
              ) : (
                <MoonIcon className="w-6 h-6 text-light-text-secondary dark:text-dark-text-secondary 
                                   group-hover:text-primary-500 dark:group-hover:text-primary-400 
                                   transition-colors duration-300" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
