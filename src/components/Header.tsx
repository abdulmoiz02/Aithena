import { SunIcon, MoonIcon, Bars3Icon, UserCircleIcon, BellIcon } from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';

export function Header() {
  const { isDarkMode, toggleDarkMode, selectedSubject, toggleSidebar } = useApp();

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 right-0 left-0 md:left-72 z-10 shadow-sm">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile menu button with animation */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="mr-4 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 md:hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded transition-colors duration-200"
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="h-6 w-6" />
          </motion.button>
          
          {/* Subject display with decoration */}
          <div className="flex items-center">
            {selectedSubject ? (
              <>
                <div className="hidden sm:flex h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 items-center justify-center text-white font-bold text-sm mr-3">
                  {selectedSubject.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Current Subject</p>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
                    {selectedSubject.name}
                  </h2>
                </div>
              </>
            ) : (
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white truncate">
                Select a Subject
              </h2>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Notification button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full transition-colors duration-200"
            aria-label="Notifications"
          >
            <BellIcon className="h-5 w-5" />
          </motion.button>
          
          {/* Dark mode toggle with animation */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: isDarkMode ? -30 : 30 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </motion.button>
          
          {/* User profile */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:flex items-center space-x-2 p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            aria-label="User profile"
          >
            <UserCircleIcon className="h-6 w-6" />
            <span className="text-sm font-medium hidden lg:block">Account</span>
          </motion.button>
        </div>
      </div>
      
      {/* Progress indicator when a subject is selected */}
      {selectedSubject && (
        <div className="h-1 bg-gray-100 dark:bg-gray-700 w-full">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 w-3/4 rounded-r-full"></div>
        </div>
      )}
    </header>
  );
}