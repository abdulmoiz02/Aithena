import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, DocumentPlusIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useApp } from '../context/AppContext';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";

// Environment variable
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize Google GenAI
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Types
interface FileTypeInfo {
  icon: string;
  name: string;
}

// Supported file types for upload
const SUPPORTED_FILE_TYPES: Record<string, FileTypeInfo> = {
  'application/pdf': { icon: '📄', name: 'PDF' },
  'application/x-javascript': { icon: '📜', name: 'JavaScript' },
  'text/javascript': { icon: '📜', name: 'JavaScript' },
  'application/x-python': { icon: '🐍', name: 'Python' },
  'text/x-python': { icon: '🐍', name: 'Python' },
  'text/plain': { icon: '📝', name: 'Text' },
  'text/html': { icon: '🌐', name: 'HTML' },
  'text/css': { icon: '🎨', name: 'CSS' },
  'text/md': { icon: '📑', name: 'Markdown' },
  'text/csv': { icon: '📊', name: 'CSV' },
  'text/xml': { icon: '📋', name: 'XML' },
  'text/rtf': { icon: '📄', name: 'RTF' }
};

export function ChatWindow() {
  // Context and state
  const { selectedSubject, messages, addMessage } = useApp();
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string>('');
  const [showFileUpload, setShowFileUpload] = useState<boolean>(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

You can also upload documents, code files, or data files for me to analyze!

What would you like to learn about today?`,
        subject: selectedSubject.id,
      });
    }
  }, [selectedSubject?.id, addMessage, messages]);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const validateFileType = (file: File): boolean => {
    return Object.keys(SUPPORTED_FILE_TYPES).includes(file.type);
  };
  
  const handleFileUpload = (file: File) => {
    setFileError('');
    
    if (!validateFileType(file)) {
      setFileError(`Unsupported file type. Please upload a supported file type.`);
      return;
    }
    
    if (file.size > 20 * 1024 * 1024) { // 20MB limit
      setFileError('File is too large. Maximum size is 20MB');
      return;
    }
    
    setUploadedFile(file);
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setFileError('');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };
  
  const processFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          const bytes = new Uint8Array(reader.result);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          // btoa is the browser's Base64 encoder
          resolve(btoa(binary));
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  };

  const toggleFileUpload = () => {
    setShowFileUpload(!showFileUpload);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !uploadedFile) || !selectedSubject) return;

    let userMessage = input.trim();
    
    // If a file is uploaded, include info about it in the message
    if (uploadedFile) {
      const fileInfo = SUPPORTED_FILE_TYPES[uploadedFile.type];
      userMessage = userMessage || `Please analyze this ${fileInfo.name} file`;
      userMessage += ` [Uploaded file: ${uploadedFile.name}]`;
    }
    
    setInput('');
    
    addMessage({
      role: 'user',
      content: userMessage,
      subject: selectedSubject.id,
    });

    setIsLoading(true);
    try {
      // Prepare contents array according to the provided docs
      const contents: any[] = [];
      
      // First item is the text prompt
      contents.push({ text: userMessage });
      
      // Add file data if present
      if (uploadedFile) {
        const base64Data = await processFileToBase64(uploadedFile);
        contents.push({
          inlineData: {
            mimeType: uploadedFile.type,
            data: base64Data
          }
        });
      }

      // Get the system prompt
      const systemPrompt = selectedSubject.systemPrompt || 
        `You are an educational assistant specializing in ${selectedSubject.name}. Be helpful, clear, and informative.`;

      
      // Send request to Gemini API using the provided pattern
      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
          topP: 0.95,
          topK: 40
        }
      });
      
      // Extract and display the response
      if (response.text) {
        addMessage({
          role: 'assistant',
          content: response.text,
          subject: selectedSubject.id,
        });
      } else {
        throw new Error('Empty response from API');
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
      setUploadedFile(null); // Clear file after submission
      setShowFileUpload(false); // Hide file upload area after submission
    }
  };

  // No subject selected - show welcome screen
  if (!selectedSubject) {
    return (
      <div className="flex-1 flex items-center justify-center w-full h-full min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center w-full max-w-2xl mx-auto my-8 p-4 md:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-blue-100 dark:border-blue-900"
        >
          <div className="mb-6">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-3 md:mb-4 tracking-tight">
            Welcome to Aithena
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-6 md:mb-8 leading-relaxed">
            Select a subject from the sidebar to start your learning journey with our AI-powered educational assistants.
          </p>
          <div className="flex justify-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 md:px-6 md:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
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

      {/* Chat input with file upload */}
      <form onSubmit={handleSubmit} className="p-4 md:p-6 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg">
        <div className="max-w-4xl mx-auto">
          {/* File drop zone with visual enhancements - only shown when toggled */}
          <AnimatePresence>
            {showFileUpload && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={`mb-4 p-4 border-2 border-dashed rounded-xl transition-all duration-200 ${
                  uploadedFile 
                    ? 'border-green-400 bg-green-50 dark:bg-green-900/20' 
                    : fileError 
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/20' 
                      : dragActive 
                        ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={!uploadedFile ? triggerFileInput : undefined}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden"
                  onChange={handleFileInputChange}
                  accept={Object.keys(SUPPORTED_FILE_TYPES).join(',')}
                />
                
                {uploadedFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{SUPPORTED_FILE_TYPES[uploadedFile.type].icon}</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{uploadedFile.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({Math.round(uploadedFile.size / 1024)} KB)
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={removeUploadedFile}
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                ) : fileError ? (
                  <div className="text-center text-red-600 dark:text-red-400 font-medium">
                    {fileError}
                    <p className="text-sm font-normal mt-1">Click to try again</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <DocumentPlusIcon className="h-10 w-10 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      Drop a file here or click to upload
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Support for PDF, code files, text, and more (20MB max)
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Input field with attachment button and submit button */}
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={uploadedFile ? "Ask about the uploaded file..." : "Type your message..."}
              className="w-full rounded-full border-2 border-gray-200 dark:border-gray-700 p-4 pr-32 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-inner"
            />
            
            {/* File attachment button */}
            <button
              type="button"
              onClick={toggleFileUpload}
              className={`absolute right-16 top-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                uploadedFile || showFileUpload ? 'text-blue-500 dark:text-blue-400' : ''
              }`}
            >
              <DocumentPlusIcon className="h-6 w-6" />
            </button>
            
            {/* Send button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`absolute right-2 top-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full p-2 hover:shadow-lg disabled:opacity-50 transition-all duration-300 ${
                uploadedFile ? 'animate-pulse' : ''
              }`}
            >
              <PaperAirplaneIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* File type support info - only show when upload area is visible */}
          {showFileUpload && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Supported file types: PDF, JavaScript, Python, TXT, HTML, CSS, MD, CSV, XML, RTF
            </div>
          )}
        </div>
      </form>
    </div>
  );
}