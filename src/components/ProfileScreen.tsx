// src/screens/ProfileScreen.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import React from 'react';
import {
  UserCircleIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  AcademicCapIcon,
  BellIcon,
  MoonIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ClockIcon,
  FireIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  joinDate: string;
  lastActive: string;
  studyStreak: number;
  completedTopics: number;
  preferences: {
    darkMode: boolean;
    notifications: boolean;
    language: string;
    studyReminders: boolean;
  };
}

interface ProfileStat {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

// Dummy data
const dummyUserProfile: UserProfile = {
  id: '123456',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatarUrl: null,
  role: 'Student',
  joinDate: '2024-01-15',
  lastActive: '2025-04-16',
  studyStreak: 42,
  completedTopics: 87,
  preferences: {
    darkMode: true,
    notifications: true,
    language: 'English',
    studyReminders: true,
  },
};

const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];

export const ProfileScreen: React.FC = () => {
  const {  toggleDarkMode } = useApp();
  const [profile, setProfile] = useState<UserProfile>(dummyUserProfile);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(dummyUserProfile);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  // Format a date string into a readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };
  
  const handleSaveProfile = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProfile(editedProfile);
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsEditing(false);
      }, 1500);
    }, 1000);
  };
  
  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };
  
  const handleTogglePreference = (preference: keyof UserProfile['preferences']) => {
    setEditedProfile({
      ...editedProfile,
      preferences: {
        ...editedProfile.preferences,
        [preference]: !editedProfile.preferences[preference]
      }
    });
  };
  
  const profileStats: ProfileStat[] = [
    {
      id: 'joinDate',
      icon: <ClockIcon className="h-5 w-5" />,
      label: 'Joined',
      value: formatDate(profile.joinDate),
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    },
    {
      id: 'streak',
      icon: <FireIcon className="h-5 w-5" />,
      label: 'Study Streak',
      value: profile.studyStreak,
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
    },
    {
      id: 'topics',
      icon: <BookOpenIcon className="h-5 w-5" />,
      label: 'Topics Completed',
      value: profile.completedTopics,
      color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    },
    {
      id: 'lastActive',
      icon: <ClockIcon className="h-5 w-5" />,
      label: 'Last Active',
      value: formatDate(profile.lastActive),
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    },
  ];
  
  return (
    // Use theme-based classes for the container background
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Edit button */}
        <div className="relative mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            My Profile
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isEditing) {
                handleSaveProfile();
              } else {
                setIsEditing(true);
              }
            }}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm ${
              isEditing
                ? isSuccess
                  ? 'bg-green-500 text-white'
                  : isLoading
                  ? 'bg-blue-400 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
            disabled={isLoading || isSuccess}
          >
            {isEditing ? (
              isSuccess ? (
                <>
                  <CheckIcon className="h-5 w-5" />
                  <span>Saved!</span>
                </>
              ) : isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5" />
                  <span>Save Changes</span>
                </>
              )
            ) : (
              <>
                <PencilSquareIcon className="h-5 w-5" />
                <span>Edit Profile</span>
              </>
            )}
          </motion.button>
        </div>
        
        {/* Profile card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 h-32">
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent opacity-20" />
          </div>
          
          <div className="px-6 pt-0 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-6 gap-4 sm:gap-6">
              <motion.div
                whileHover={isEditing ? { scale: 1.05 } : {}}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full opacity-70 blur" />
                {profile.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt={profile.name} 
                    className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-900 object-cover" 
                  />
                ) : (
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <UserCircleIcon className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                {isEditing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md cursor-pointer"
                  >
                    <PencilSquareIcon className="w-4 h-4 text-blue-500" />
                  </motion.div>
                )}
              </motion.div>
              
              <div className="text-center sm:text-left flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    className="text-2xl font-bold text-gray-800 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none px-2 py-1 mb-1"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{profile.name}</h2>
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <AcademicCapIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">{profile.role}</span>
                  </div>
                  
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      className="text-sm text-gray-600 dark:text-gray-400 bg-transparent border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500 px-2 py-1"
                    />
                  ) : (
                    <span className="text-sm text-gray-600 dark:text-gray-400">{profile.email}</span>
                  )}
                </div>
              </div>
              
              {isEditing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm"
                >
                  <XMarkIcon className="h-5 w-5" />
                  <span>Cancel</span>
                </motion.button>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {profileStats.map((stat) => (
                <motion.div
                  key={stat.id}
                  whileHover={{ y: -2 }}
                  className="rounded-xl p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                >
                  <div className={`inline-flex p-2 rounded-lg ${stat.color} mb-2`}>
                    {stat.icon}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</div>
                  <div className="font-semibold text-gray-800 dark:text-white">{stat.value}</div>
                </motion.div>
              ))}
            </div>
            
            <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Cog6ToothIcon className="h-5 w-5 text-blue-500" />
                Preferences
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Dark Mode</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Enable dark theme</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isEditing ? editedProfile.preferences.darkMode : profile.preferences.darkMode}
                    onChange={() => {
                        if (isEditing) {
                        handleTogglePreference('darkMode');
                        toggleDarkMode(); // Call this to reflect in UI theme immediately
                        }
                    }}
                    disabled={!isEditing}
                    />
                    <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Notifications</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive app notifications</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isEditing ? editedProfile.preferences.notifications : profile.preferences.notifications}
                      onChange={() => isEditing && handleTogglePreference('notifications')}
                      disabled={!isEditing}
                    />
                    <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <ClockIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Study Reminders</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Daily study reminders</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isEditing ? editedProfile.preferences.studyReminders : profile.preferences.studyReminders}
                      onChange={() => isEditing && handleTogglePreference('studyReminders')}
                      disabled={!isEditing}
                    />
                    <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">Language</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">App language</p>
                    </div>
                  </div>
                  {isEditing ? (
                    <select
                      value={editedProfile.preferences.language}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        preferences: {
                          ...editedProfile.preferences,
                          language: e.target.value
                        }
                      })}
                      className="rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-white">
                      {profile.preferences.language}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sign out button */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 rounded-xl flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            <span>Sign Out</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
