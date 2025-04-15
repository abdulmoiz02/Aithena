import { SunIcon, MoonIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';

export function Header() {
  const { isDarkMode, toggleDarkMode, selectedSubject, toggleSidebar } = useApp();

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 right-0 left-0 md:left-64 z-10">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="mr-4 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 md:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white truncate">
            {selectedSubject ? selectedSubject.name : 'Select a Subject'}
          </h2>
        </div>
        
        <button
          onClick={toggleDarkMode}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {isDarkMode ? (
            <SunIcon className="h-6 w-6" />
          ) : (
            <MoonIcon className="h-6 w-6" />
          )}
        </button>
      </div>
    </header>
  );
}