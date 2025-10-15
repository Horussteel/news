class StorageService {
  constructor() {
    this.BOOKMARKS_KEY = 'bookmarks';
    this.HISTORY_KEY = 'readHistory';
    this.PREFERENCES_KEY = 'userPreferences';
    this.HABITS_KEY = 'habits';
    this.HABIT_COMPLETIONS_KEY = 'habitCompletions';
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

  // Habits operations
  getHabits() {
    try {
      const habits = localStorage.getItem(this.HABITS_KEY);
      return habits ? JSON.parse(habits) : this.getDefaultHabits();
    } catch (error) {
      console.error('Error getting habits:', error);
      return this.getDefaultHabits();
    }
  }

  addHabit(habit) {
    try {
      const habits = this.getHabits();
      const newHabit = {
        id: Date.now().toString(),
        name: habit.name,
        description: habit.description || '',
        category: habit.category || 'personal',
        icon: habit.icon || '🎯',
        color: habit.color || '#3B82F6',
        frequency: habit.frequency || 'daily', // daily, weekly, monthly
        targetCount: habit.targetCount || 1,
        unit: habit.unit || '',
        createdAt: new Date().toISOString(),
        isActive: true,
        streak: 0,
        bestStreak: 0,
        totalCompletions: 0
      };
      
      habits.push(newHabit);
      localStorage.setItem(this.HABITS_KEY, JSON.stringify(habits));
      return newHabit;
    } catch (error) {
      console.error('Error adding habit:', error);
      return null;
    }
  }

  updateHabit(id, updates) {
    try {
      const habits = this.getHabits();
      const index = habits.findIndex(habit => habit.id === id);
      if (index > -1) {
        habits[index] = { ...habits[index], ...updates };
        localStorage.setItem(this.HABITS_KEY, JSON.stringify(habits));
        return habits[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating habit:', error);
      return null;
    }
  }

  deleteHabit(id) {
    try {
      const habits = this.getHabits();
      const updatedHabits = habits.filter(habit => habit.id !== id);
      localStorage.setItem(this.HABITS_KEY, JSON.stringify(updatedHabits));
      
      // Also delete completions for this habit
      const completions = this.getHabitCompletions();
      const updatedCompletions = completions.filter(completion => completion.habitId !== id);
      localStorage.setItem(this.HABIT_COMPLETIONS_KEY, JSON.stringify(updatedCompletions));
      
      return true;
    } catch (error) {
      console.error('Error deleting habit:', error);
      return false;
    }
  }

  // Habit completions operations
  getHabitCompletions() {
    try {
      const completions = localStorage.getItem(this.HABIT_COMPLETIONS_KEY);
      return completions ? JSON.parse(completions) : [];
    } catch (error) {
      console.error('Error getting habit completions:', error);
      return [];
    }
  }

  completeHabit(habitId, date = new Date().toISOString().split('T')[0]) {
    try {
      const completions = this.getHabitCompletions();
      const existingCompletion = completions.find(c => 
        c.habitId === habitId && c.date === date
      );
      
      if (existingCompletion) {
        // Update existing completion
        existingCompletion.count += 1;
        existingCompletion.completedAt = new Date().toISOString();
      } else {
        // Add new completion
        completions.push({
          id: Date.now().toString(),
          habitId,
          date,
          count: 1,
          completedAt: new Date().toISOString()
        });
      }
      
      localStorage.setItem(this.HABIT_COMPLETIONS_KEY, JSON.stringify(completions));
      
      // Update habit statistics
      this.updateHabitStatistics(habitId);
      
      return true;
    } catch (error) {
      console.error('Error completing habit:', error);
      return false;
    }
  }

  uncompleteHabit(habitId, date = new Date().toISOString().split('T')[0]) {
    try {
      const completions = this.getHabitCompletions();
      const completionIndex = completions.findIndex(c => 
        c.habitId === habitId && c.date === date
      );
      
      if (completionIndex > -1) {
        completions.splice(completionIndex, 1);
        localStorage.setItem(this.HABIT_COMPLETIONS_KEY, JSON.stringify(completions));
        
        // Update habit statistics
        this.updateHabitStatistics(habitId);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error uncompleting habit:', error);
      return false;
    }
  }

  isHabitCompleted(habitId, date = new Date().toISOString().split('T')[0]) {
    try {
      const completions = this.getHabitCompletions();
      return completions.some(c => c.habitId === habitId && c.date === date);
    } catch (error) {
      console.error('Error checking habit completion:', error);
      return false;
    }
  }

  getHabitCompletionsForDate(date) {
    try {
      const completions = this.getHabitCompletions();
      return completions.filter(c => c.date === date);
    } catch (error) {
      console.error('Error getting habit completions for date:', error);
      return [];
    }
  }

  updateHabitStatistics(habitId) {
    try {
      const habit = this.getHabits().find(h => h.id === habitId);
      if (!habit) return;
      
      const completions = this.getHabitCompletions().filter(c => c.habitId === habitId);
      const sortedCompletions = completions.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Calculate total completions
      const totalCompletions = completions.reduce((sum, c) => sum + c.count, 0);
      
      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      
      for (let i = 0; i < 365; i++) { // Check last year
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        if (this.isHabitCompleted(habitId, dateStr)) {
          currentStreak++;
        } else if (i > 0) { // Allow today to be incomplete
          break;
        }
      }
      
      // Calculate best streak
      let bestStreak = 0;
      let tempStreak = 0;
      
      for (let i = 0; i < sortedCompletions.length; i++) {
        const completion = sortedCompletions[i];
        const completionDate = new Date(completion.date);
        
        if (i === 0) {
          tempStreak = 1;
        } else {
          const prevCompletion = sortedCompletions[i - 1];
          const prevDate = new Date(prevCompletion.date);
          const daysDiff = Math.floor((completionDate - prevDate) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            tempStreak++;
          } else {
            bestStreak = Math.max(bestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      }
      bestStreak = Math.max(bestStreak, tempStreak);
      
      this.updateHabit(habitId, {
        totalCompletions,
        currentStreak,
        bestStreak
      });
      
    } catch (error) {
      console.error('Error updating habit statistics:', error);
    }
  }

  getHabitStatistics(habitId) {
    try {
      const habit = this.getHabits().find(h => h.id === habitId);
      if (!habit) return null;
      
      const completions = this.getHabitCompletions().filter(c => c.habitId === habitId);
      const today = new Date().toISOString().split('T')[0];
      
      // Last 30 days statistics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
      
      const recentCompletions = completions.filter(c => c.date >= thirtyDaysAgoStr);
      const completionRate = recentCompletions.length / 30; // Last 30 days
      
      return {
        habit,
        totalCompletions: habit.totalCompletions,
        currentStreak: habit.currentStreak,
        bestStreak: habit.bestStreak,
        completionRate: Math.round(completionRate * 100),
        completedToday: this.isHabitCompleted(habitId, today),
        recentCompletions: recentCompletions.length
      };
    } catch (error) {
      console.error('Error getting habit statistics:', error);
      return null;
    }
  }

  getAllHabitsStatistics() {
    try {
      const habits = this.getHabits();
      return habits.map(habit => this.getHabitStatistics(habit.id)).filter(Boolean);
    } catch (error) {
      console.error('Error getting all habits statistics:', error);
      return [];
    }
  }

  getDefaultHabits() {
    return [
      {
        id: '1',
        name: 'Exercise',
        description: '30 minutes of physical activity',
        category: 'health',
        icon: '🏃',
        color: '#10B981',
        frequency: 'daily',
        targetCount: 1,
        unit: 'session',
        createdAt: new Date().toISOString(),
        isActive: true,
        streak: 0,
        bestStreak: 0,
        totalCompletions: 0
      },
      {
        id: '2',
        name: 'Read',
        description: 'Read for 20 minutes',
        category: 'personal',
        icon: '📚',
        color: '#3B82F6',
        frequency: 'daily',
        targetCount: 1,
        unit: 'session',
        createdAt: new Date().toISOString(),
        isActive: true,
        streak: 0,
        bestStreak: 0,
        totalCompletions: 0
      },
      {
        id: '3',
        name: 'Meditate',
        description: '10 minutes of meditation',
        category: 'mindfulness',
        icon: '🧘',
        color: '#8B5CF6',
        frequency: 'daily',
        targetCount: 1,
        unit: 'session',
        createdAt: new Date().toISOString(),
        isActive: true,
        streak: 0,
        bestStreak: 0,
        totalCompletions: 0
      }
    ];
  }

  // Habits export/import
  exportHabitsData() {
    try {
      const data = {
        habits: this.getHabits(),
        completions: this.getHabitCompletions(),
        exportedAt: new Date().toISOString()
      };
      return data;
    } catch (error) {
      console.error('Error exporting habits data:', error);
      return null;
    }
  }

  importHabitsData(data) {
    try {
      if (data.habits) {
        localStorage.setItem(this.HABITS_KEY, JSON.stringify(data.habits));
      }
      if (data.completions) {
        localStorage.setItem(this.HABIT_COMPLETIONS_KEY, JSON.stringify(data.completions));
      }
      return true;
    } catch (error) {
      console.error('Error importing habits data:', error);
      return false;
    }
  }
}

// Create and export singleton instance
const storageService = new StorageService();
export default storageService;
