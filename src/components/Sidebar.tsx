import { motion } from 'framer-motion';
import { subjects } from '../data/subjects';
import { useApp } from '../context/AppContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import logo from '/src/assets/aithena-logo.png';

export function Sidebar() {
  const { selectedSubject, setSelectedSubject, isSidebarOpen, toggleSidebar } = useApp();

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0 z-30 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 relative">
          <motion.img 
            src={logo}
            alt="Aithena Logo"
            className="w-32 h-32 mx-auto mb-2 rounded-lg" 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
          {/* Close button - only visible on mobile */}
          <button 
            className="md:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={toggleSidebar}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-4 px-3 pb-16 overflow-y-auto max-h-[calc(100vh-6rem)]">
          {subjects.map((subject, index) => (
            <motion.button
              key={subject.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                setSelectedSubject(subject);
                if (window.innerWidth < 768) { // Close sidebar on mobile after selection
                  toggleSidebar();
                }
              }}
              className={`w-full p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mb-2 transition-all duration-200 ${
                selectedSubject?.id === subject.id
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{subject.icon}</span>
                <div>
                  <h3 className="font-medium">{subject.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{subject.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </nav>
      </aside>
    </>
  );
}
