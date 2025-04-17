import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  PaperAirplaneIcon, 
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon,
  LightBulbIcon,
  BugAntIcon
} from '@heroicons/react/24/outline';
import React from 'react';

type FeedbackType = {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
};

const feedbackTypes: FeedbackType[] = [
  { 
    id: 'general', 
    icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />, 
    label: 'General Feedback', 
    description: 'Share your thoughts on Aithena' 
  },
  { 
    id: 'issue', 
    icon: <BugAntIcon className="h-5 w-5" />, 
    label: 'Report an Issue', 
    description: 'Tell us what went wrong' 
  },
  { 
    id: 'suggestion', 
    icon: <LightBulbIcon className="h-5 w-5" />, 
    label: 'Feature Suggestion', 
    description: 'What would make Aithena better?' 
  },
  { 
    id: 'urgent', 
    icon: <ExclamationCircleIcon className="h-5 w-5" />, 
    label: 'Urgent Support', 
    description: 'Get help with critical issues' 
  }
];

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [activeType, setActiveType] = useState<string>('general');
  const [message, setMessage] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);
    
    // Simulate an API call
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setIsSuccess(false);
        setMessage('');
        onClose();
      }, 2000);
    }, 1500);
  };

  const activeFeedback = feedbackTypes.find(type => type.id === activeType);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Modal overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Scrollable container to center modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
                {/* Decorative accents */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 opacity-5 rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600 opacity-5 rounded-tr-full" />
                
                {/* Header */}
                <div className="relative px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <PaperAirplaneIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Feedback & Support
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </motion.button>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  {/* Feedback type selection */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {feedbackTypes.map((type) => (
                      <motion.button
                        key={type.id}
                        whileHover={{ y: -2 }}
                        whileTap={{ y: 1 }}
                        onClick={() => setActiveType(type.id)}
                        className={`p-4 rounded-xl flex flex-col items-center text-center transition-all duration-200 ${
                          activeType === type.id
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                            : 'border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className={`p-2 rounded-lg mb-2 ${
                          activeType === type.id
                            ? 'bg-white bg-opacity-20'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          {type.icon}
                        </div>
                        <span className="font-medium text-sm">{type.label}</span>
                        <span className={`text-xs mt-1 ${
                          activeType === type.id
                            ? 'text-white text-opacity-80'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {type.description}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Feedback form */}
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Your Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                    
                    <div className="mb-6">
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        {activeFeedback?.label}
                      </label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Tell us about your ${activeFeedback?.label.toLowerCase()}...`}
                        required
                      />
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSending || isSuccess}
                      className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 relative overflow-hidden 
                        ${isSending || isSuccess 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                        }`}
                    >
                      <div className="relative flex items-center justify-center">
                        {isSending && (
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        )}
                        {isSuccess ? 'Message Sent!' : isSending ? 'Sending...' : 'Submit Feedback'}
                      </div>
                    </motion.button>
                  </form>
                </div>
                
                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 text-center text-sm text-gray-500 dark:text-gray-400">
                  Thank you for helping us improve Aithena! We'll review your feedback soon.
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
