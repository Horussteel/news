 class StorageService {
  constructor() {
    this.BOOKMARKS_KEY = 'bookmarks';
    this.HISTORY_KEY = 'readHistory';
    this.PREFERENCES_KEY = 'userPreferences';
  }

  // Bookmarks operations
  getBookmarks() {
    try {
      const bookmarks = localStorage.getItem(this.BOOKMARKS_KEY);
      return bookmarks ? JSON.parse(bookmarks) : [];
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      return [];
    }
  }

  addBookmark(article) {
    try {
      const bookmarks = this.getBookmarks();
      const existingIndex = bookmarks.findIndex(bookmark => bookmark.url === article.url);
      
      if (existingIndex > -1) {
        // Update existing bookmark
        bookmarks[existingIndex] = {
          ...bookmarks[existingIndex],
          ...article,
          savedAt: new Date().toISOString()
        };
      } else {
        // Add new bookmark
        const newBookmark = {
          id: Date.now().toString(),
          ...article,
          savedAt: new Date().toISOString()
        };
        bookmarks.unshift(newBookmark);
      }
      
      localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(bookmarks));
      return true;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return false;
    }
  }

  removeBookmark(url) {
    try {
      const bookmarks = this.getBookmarks();
      const updatedBookmarks = bookmarks.filter(bookmark => bookmark.url !== url);
      localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return false;
    }
  }

  isBookmarked(url) {
    try {
      const bookmarks = this.getBookmarks();
      return bookmarks.some(bookmark => bookmark.url === url);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  }

  // Reading history operations
  getHistory(limit = 100) {
    try {
      const history = localStorage.getItem(this.HISTORY_KEY);
      const parsedHistory = history ? JSON.parse(history) : [];
      return parsedHistory.slice(0, limit);
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }

  addToHistory(article) {
    try {
      const history = this.getHistory();
      
      // Remove if already exists to avoid duplicates
      const filteredHistory = history.filter(item => item.url !== article.url);
      
      // Add to beginning of array
      filteredHistory.unshift({
        ...article,
        readAt: new Date().toISOString()
      });
      
      // Keep only last 100 items
      const trimmedHistory = filteredHistory.slice(0, 100);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(trimmedHistory));
      return true;
    } catch (error) {
      console.error('Error adding to history:', error);
      return false;
    }
  }

  removeFromHistory(url) {
    try {
      const history = this.getHistory();
      const updatedHistory = history.filter(item => item.url !== url);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(updatedHistory));
      return true;
    } catch (error) {
      console.error('Error removing from history:', error);
      return false;
    }
  }

  clearHistory() {
    try {
      localStorage.removeItem(this.HISTORY_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing history:', error);
      return false;
    }
  }

  // User preferences operations
  getPreferences() {
    try {
      const preferences = localStorage.getItem(this.PREFERENCES_KEY);
      return preferences ? JSON.parse(preferences) : this.getDefaultPreferences();
    } catch (error) {
      console.error('Error getting preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  updatePreferences(newPreferences) {
    try {
      const currentPreferences = this.getPreferences();
      const updatedPreferences = { ...currentPreferences, ...newPreferences };
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(updatedPreferences));
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  }

  getDefaultPreferences() {
    return {
      language: 'en',
      defaultCategory: 'Toate',
      theme: 'light',
      articlesPerPage: 20,
      emailNotifications: false,
      autoSaveHistory: true,
      showBookmarksBadge: true
    };
  }

  // Utility operations
  exportData() {
    try {
      const data = {
        bookmarks: this.getBookmarks(),
        history: this.getHistory(),
        preferences: this.getPreferences(),
        exportedAt: new Date().toISOString()
      };
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  importData(data) {
    try {
      if (data.bookmarks) {
        localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(data.bookmarks));
      }
      if (data.history) {
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(data.history));
      }
      if (data.preferences) {
        localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(data.preferences));
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  clearAllData() {
    try {
      localStorage.removeItem(this.BOOKMARKS_KEY);
      localStorage.removeItem(this.HISTORY_KEY);
      localStorage.removeItem(this.PREFERENCES_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  // Statistics
  getStatistics() {
    try {
      const bookmarks = this.getBookmarks();
      const history = this.getHistory();
      const preferences = this.getPreferences();
      
      return {
        totalBookmarks: bookmarks.length,
        totalHistoryItems: history.length,
        oldestBookmark: bookmarks.length > 0 ? bookmarks[bookmarks.length - 1]?.savedAt : null,
        newestBookmark: bookmarks.length > 0 ? bookmarks[0]?.savedAt : null,
        mostReadSource: this.getMostReadSource(history),
        preferences: preferences
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return null;
    }
  }

  getMostReadSource(history) {
    try {
      const sourceCounts = {};
      history.forEach(item => {
        if (item.source) {
          sourceCounts[item.source] = (sourceCounts[item.source] || 0) + 1;
        }
      });
      
      let mostReadSource = null;
      let maxCount = 0;
      
      Object.entries(sourceCounts).forEach(([source, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostReadSource = { source, count };
        }
      });
      
      return mostReadSource;
    } catch (error) {
      console.error('Error getting most read source:', error);
      return null;
    }
  }
}

// Create and export singleton instance
const storageService = new StorageService();
export default storageService;
