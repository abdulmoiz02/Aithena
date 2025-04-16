import { motion } from 'framer-motion';
import { subjects } from '../data/subjects';
import { useApp } from '../context/AppContext';
import { XMarkIcon, AcademicCapIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import logo from '/src/assets/aithena-logo.png';
import { useEffect } from 'react';

export function Sidebar() {
  const { selectedSubject, setSelectedSubject, isSidebarOpen, toggleSidebar } = useApp();

  // Fix to ensure sidebar is properly displayed on larger screens after reload
  useEffect(() => {
    const handleResize = () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar && window.innerWidth >= 768) {
        sidebar.style.transform = 'translateX(0)';
      }
    };

    // Apply immediately and on window resize
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {/* Mobile overlay with blur effect */}
      {isSidebarOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="md:hidden fixed inset-0 backdrop-blur-sm bg-black bg-opacity-30 z-20"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        id="sidebar"
        className={`w-72 h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0 z-30 shadow-lg md:shadow-none transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } flex flex-col`}
      >
        {/* Logo section with decorative elements */}
        <div className="relative p-6 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-5 rounded-bl-full" />
          
          <div className="flex justify-center">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-lg opacity-75 blur-sm" />
              <motion.img 
                src={logo}
                alt="Aithena Logo"
                className="relative w-32 h-32 rounded-lg shadow-md" 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          </div>
          
          <div className="text-center mt-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Aithena
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI-powered learning assistant
            </p>
          </div>
          
          {/* Close button with animation - only visible on mobile */}
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            onClick={toggleSidebar}
          >
            <XMarkIcon className="h-5 w-5" />
          </motion.button>
        </div>
        
        {/* Subjects heading */}
        <div className="px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <AcademicCapIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            <h2 className="font-semibold text-gray-800 dark:text-white">Subjects</h2>
          </div>
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
            {subjects.length}
          </span>
        </div>
        
        {/* Subject navigation with enhanced styling - Fixed scrolling issue */}
        <nav className="flex-1 px-3 pb-16 overflow-y-auto">
          <div className="space-y-2">
            {subjects.map((subject, index) => (
              <motion.button
                key={subject.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setSelectedSubject(subject);
                  if (window.innerWidth < 768) { // Close sidebar on mobile after selection
                    toggleSidebar();
                  }
                }}
                className={`w-full p-3 text-left rounded-xl mb-1 transition-all duration-200 group relative overflow-hidden ${
                  selectedSubject?.id === subject.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {/* Background decoration for selected item */}
                {selectedSubject?.id === subject.id && (
                  <>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-bl-full" />
                    <div className="absolute bottom-0 left-0 w-10 h-10 bg-white opacity-10 rounded-tr-full" />
                  </>
                )}
                
                <div className="flex items-center gap-3">
                  <div className={`text-2xl p-2 rounded-lg ${
                    selectedSubject?.id === subject.id 
                      ? 'bg-white bg-opacity-20' 
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    {subject.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{subject.name}</h3>
                    <p className={`text-xs ${
                      selectedSubject?.id === subject.id
                        ? 'text-white text-opacity-80'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {subject.description}
                    </p>
                  </div>
                  
                  {/* Arrow indicator for selected item */}
                  {selectedSubject?.id === subject.id && (
                    <ArrowRightIcon className="h-4 w-4 text-white opacity-70" />
                  )}
                </div>
                
                {/* Subtle hover effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.1 }}
                />
              </motion.button>
            ))}
          </div>
        </nav>
        
        {/* Footer section */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 flex-shrink-0">
          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ y: 1 }}
            className="w-full py-2 rounded-lg text-sm text-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
          >
            Feedback & Support
          </motion.button>
        </div>
      </aside>
    </>
  );
}