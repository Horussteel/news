import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import storageService from '../lib/storageService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [readHistory, setReadHistory] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data when session changes
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    if (session) {
      // User is authenticated
      const userData = {
        ...session.user,
        isAuthenticated: true
      };
      setUser(userData);
      
      // Load user data from localStorage
      const savedBookmarks = storageService.getBookmarks();
      const savedHistory = storageService.getHistory();
      const savedPreferences = storageService.getPreferences();
      
      setBookmarks(savedBookmarks);
      setReadHistory(savedHistory);
      setPreferences(savedPreferences);
      setBookmarksCount(savedBookmarks.length);
    } else {
      // User is not authenticated
      setUser(null);
      setBookmarks([]);
      setReadHistory([]);
      setPreferences(storageService.getDefaultPreferences());
      setBookmarksCount(0);
    }
    
    setIsLoading(false);
  }, [session, status]);

  // Bookmark functions
  const toggleBookmark = (article) => {
    if (!article || !article.url) return false;

    const isCurrentlyBookmarked = storageService.isBookmarked(article.url);
    
    if (isCurrentlyBookmarked) {
      const success = storageService.removeBookmark(article.url);
      if (success) {
        const updatedBookmarks = bookmarks.filter(bookmark => bookmark.url !== article.url);
        setBookmarks(updatedBookmarks);
        setBookmarksCount(updatedBookmarks.length);
        return true;
      }
    } else {
      const success = storageService.addBookmark(article);
      if (success) {
        const updatedBookmarks = storageService.getBookmarks();
        setBookmarks(updatedBookmarks);
        setBookmarksCount(updatedBookmarks.length);
        return true;
      }
    }
    return false;
  };

  const isBookmarked = (url) => {
    return storageService.isBookmarked(url);
  };

  const removeBookmark = (url) => {
    const success = storageService.removeBookmark(url);
    if (success) {
      const updatedBookmarks = bookmarks.filter(bookmark => bookmark.url !== url);
      setBookmarks(updatedBookmarks);
      setBookmarksCount(updatedBookmarks.length);
    }
    return success;
  };

  // History functions
  const addToHistory = (article) => {
    if (!article || !article.url) return false;
    
    const success = storageService.addToHistory(article);
    if (success) {
      const updatedHistory = storageService.getHistory();
      setReadHistory(updatedHistory);
    }
    return success;
  };

  const removeFromHistory = (url) => {
    const success = storageService.removeFromHistory(url);
    if (success) {
      const updatedHistory = storageService.getHistory();
      setReadHistory(updatedHistory);
    }
    return success;
  };

  const clearHistory = () => {
    const success = storageService.clearHistory();
    if (success) {
      setReadHistory([]);
    }
    return success;
  };

  // Preferences functions
  const updatePreferences = (newPreferences) => {
    const success = storageService.updatePreferences(newPreferences);
    if (success) {
      const updatedPreferences = storageService.getPreferences();
      setPreferences(updatedPreferences);
    }
    return success;
  };

  const resetPreferences = () => {
    const defaultPreferences = storageService.getDefaultPreferences();
    const success = storageService.updatePreferences(defaultPreferences);
    if (success) {
      setPreferences(defaultPreferences);
    }
    return success;
  };

  // Utility functions
  const exportUserData = () => {
    return storageService.exportData();
  };

  const importUserData = (data) => {
    const success = storageService.importData(data);
    if (success) {
      // Refresh all data
      setBookmarks(storageService.getBookmarks());
      setReadHistory(storageService.getHistory());
      setPreferences(storageService.getPreferences());
      setBookmarksCount(storageService.getBookmarks().length);
    }
    return success;
  };

  const clearAllUserData = () => {
    const success = storageService.clearAllData();
    if (success) {
      setBookmarks([]);
      setReadHistory([]);
      setPreferences(storageService.getDefaultPreferences());
      setBookmarksCount(0);
    }
    return success;
  };

  const getUserStatistics = () => {
    return storageService.getStatistics();
  };

  // Auto-save preferences when they change
  useEffect(() => {
    if (preferences) {
      storageService.updatePreferences(preferences);
    }
  }, [preferences]);

  // Update bookmarks count when bookmarks change
  useEffect(() => {
    setBookmarksCount(bookmarks.length);
  }, [bookmarks]);

  const value = {
    // User data
    user,
    session,
    status,
    isLoading,
    
    // Bookmarks
    bookmarks,
    bookmarksCount,
    toggleBookmark,
    isBookmarked,
    removeBookmark,
    
    // History
    readHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
    
    // Preferences
    preferences,
    updatePreferences,
    resetPreferences,
    
    // Utilities
    exportUserData,
    importUserData,
    clearAllUserData,
    getUserStatistics,
    
    // Helpers
    isAuthenticated: !!session,
    hasBookmarks: bookmarks.length > 0,
    hasHistory: readHistory.length > 0
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
