import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useApp } from '../context/AppContext';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export function ChatWindow() {
  const { selectedSubject, messages, addMessage } = useApp();
  const [input, setInput] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedSubject && !messages.some(m => m.subject === selectedSubject.id)) {
      // Add welcome message for new subject
      addMessage({
        role: 'assistant',
        content: `👋 Welcome! I'm your ${selectedSubject.name} assistant. I'm here to help you learn and understand ${selectedSubject.name.toLowerCase()} concepts. Feel free to ask any questions about ${selectedSubject.name.toLowerCase()}, and I'll do my best to explain them clearly.

What would you like to learn about today?`,
        subject: selectedSubject.id,
      });
    }
  }, [selectedSubject?.id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!input.trim() || !selectedSubject) return;

    const userMessage = input.trim();
    setInput('');
    
    addMessage({
      role: 'user',
      content: userMessage,
      subject: selectedSubject.id,
    });

    setIsLoading(true);
    try {
      // Get previous messages for this subject
      const subjectMessages = messages
        .filter(m => m.subject === selectedSubject.id)
        // Format messages for Gemini API
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));
      
      // Add the new user message
      subjectMessages.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      // Prepare system prompt as the first message from the model
      const systemPrompt = {
        role: 'model',
        parts: [{ text: selectedSubject.systemPrompt }]
      };

      // Create the API request with full conversation history
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [systemPrompt, ...subjectMessages],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const responseText = data.candidates[0].content.parts[0].text;
        addMessage({
          role: 'assistant',
          content: responseText,
          subject: selectedSubject.id,
        });
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (error) {
      console.error('Failed to get response:', error);
      addMessage({
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        subject: selectedSubject.id,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // No subject selected - show welcome screen
  if (!selectedSubject) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 pt-20 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-blue-100 dark:border-blue-900"
        >
          <div className="mb-6">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight">
            Welcome to Aithena
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Select a subject from the sidebar to start your learning journey with our AI-powered educational assistants.
          </p>
          <div className="flex justify-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Choose a Subject
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Subject is selected - show chat interface
  return (
    <div className="flex-1 flex flex-col h-screen pt-16 w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
    
      
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {messages
              .filter(m => m.subject === selectedSubject.id)
              .map((message, index) => (
                <motion.div
                  key={message.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-6 ${
                    message.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-4 shadow-md ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center mb-2">
                        <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs mr-2">
                          A
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Aithena</span>
                      </div>
                    )}
                    <ReactMarkdown 
                      className="prose dark:prose-invert max-w-none prose-sm md:prose-base"
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start mb-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs mr-2">
                    A
                  </div>
                  <div className="flex space-x-2 ml-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat input */}
      <form onSubmit={handleSubmit} className="p-4 md:p-6 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full rounded-full border-2 border-gray-200 dark:border-gray-700 p-4 pr-16 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-2 hover:shadow-lg disabled:opacity-50 transition-all duration-300"
          >
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </div>
      </form>
    </div>
  );
}