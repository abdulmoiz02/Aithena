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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
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

  if (!selectedSubject) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 pt-20 md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md md:max-w-2xl"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Welcome to Aithena
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">
            Select a subject from the sidebar to start your learning journey with our AI-powered educational assistants.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen pt-16 w-full">
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        <AnimatePresence>
          {messages
            .filter(m => m.subject === selectedSubject.id)
            .map(message => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mb-4 ${
                  message.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                }`}
              >
                <div
                  className={`max-w-[90%] md:max-w-[80%] rounded-lg p-3 md:p-4 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <ReactMarkdown 
                    className="prose dark:prose-invert max-w-none prose-sm md:prose-base"
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start mb-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 md:p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-3 md:p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 p-2 md:p-3 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary-500 text-white rounded-lg px-3 md:px-6 py-2 md:py-3 hover:bg-primary-600 disabled:opacity-50 transition-colors duration-200 flex items-center gap-1 md:gap-2"
          >
            <span className="hidden sm:inline">Send</span>
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}