import { createContext, useContext, useState, useEffect } from 'react';
import type { Message, Subject } from '../types';
import { subjects } from '../data/subjects';

interface AppContextType {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  selectedSubject: Subject | null;
  setSelectedSubject: (subject: Subject | null) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  // Add these for responsive functionality:
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  // Add state for responsive sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedMessages = localStorage.getItem('messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Add toggle function for sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        messages,
        addMessage,
        selectedSubject,
        setSelectedSubject,
        isDarkMode,
        toggleDarkMode,
        isSidebarOpen,
        toggleSidebar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}