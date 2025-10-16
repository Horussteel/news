class PomodoroService {
  constructor() {
    this.initializeStorage();
    this.listeners = new Map();
  }

  initializeStorage() {
    if (typeof window === 'undefined') return;
    
    if (!localStorage.getItem('pomodoroSettings')) {
      const defaultSettings = {
        workDuration: 25, // minutes
        shortBreakDuration: 5, // minutes
        longBreakDuration: 15, // minutes
        longBreakInterval: 4, // after 4 pomodoros
        autoStartBreaks: false,
        autoStartPomodoros: false,
        soundEnabled: true,
        notificationEnabled: true,
        taskIntegration: true
      };
      localStorage.setItem('pomodoroSettings', JSON.stringify(defaultSettings));
    }
    
    if (!localStorage.getItem('pomodoroStats')) {
      const defaultStats = {
        totalPomodoros: 0,
        totalWorkTime: 0, // in minutes
        todayPomodoros: 0,
        todayWorkTime: 0,
        streak: 0,
        lastActiveDate: null
      };
      localStorage.setItem('pomodoroStats', JSON.stringify(defaultStats));
    }
  }

  // Get Pomodoro settings
  getSettings() {
    if (typeof window === 'undefined') return this.getDefaultSettings();
    try {
      const settings = localStorage.getItem('pomodoroSettings');
      return settings ? JSON.parse(settings) : this.getDefaultSettings();
    } catch (error) {
      console.error('Error getting Pomodoro settings:', error);
      return this.getDefaultSettings();
    }
  }

  // Save Pomodoro settings
  saveSettings(settings) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
      this.notifyListeners('settingsChanged', settings);
    } catch (error) {
      console.error('Error saving Pomodoro settings:', error);
    }
  }

  // Get Pomodoro statistics
  getStats() {
    if (typeof window === 'undefined') return this.getDefaultStats();
    try {
      const stats = localStorage.getItem('pomodoroStats');
      return stats ? JSON.parse(stats) : this.getDefaultStats();
    } catch (error) {
      console.error('Error getting Pomodoro stats:', error);
      return this.getDefaultStats();
    }
  }

  // Save Pomodoro statistics
  saveStats(stats) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('pomodoroStats', JSON.stringify(stats));
      this.notifyListeners('statsChanged', stats);
    } catch (error) {
      console.error('Error saving Pomodoro stats:', error);
    }
  }

  // Record completed Pomodoro
  recordPomodoro(duration) {
    const stats = this.getStats();
    const today = new Date().toISOString().split('T')[0];
    
    // Check if it's a new day
    if (stats.lastActiveDate !== today) {
      stats.todayPomodoros = 0;
      stats.todayWorkTime = 0;
      stats.streak = 1;
    } else {
      stats.streak += 1;
    }
    
    stats.totalPomodoros += 1;
    stats.totalWorkTime += duration;
    stats.todayPomodoros += 1;
    stats.todayWorkTime += duration;
    stats.lastActiveDate = today;
    
    this.saveStats(stats);
    return stats;
  }

  // Get today's statistics
  getTodayStats() {
    const stats = this.getStats();
    const today = new Date().toISOString().split('T')[0];
    
    if (stats.lastActiveDate !== today) {
      return {
        pomodoros: 0,
        workTime: 0,
        streak: 0
      };
    }
    
    return {
      pomodoros: stats.todayPomodoros,
      workTime: stats.todayWorkTime,
      streak: stats.streak
    };
  }

  // Get weekly statistics
  getWeeklyStats() {
    const stats = this.getStats();
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    // This is simplified - in a real app, you'd track daily stats
    return {
      totalPomodoros: stats.totalPomodoros,
      totalWorkTime: stats.totalWorkTime,
      averagePerDay: Math.round(stats.totalPomodoros / 7),
      currentStreak: stats.streak
    };
  }

  // Reset statistics
  resetStats() {
    const defaultStats = this.getDefaultStats();
    this.saveStats(defaultStats);
  }

  // Export data
  exportData() {
    return {
      settings: this.getSettings(),
      stats: this.getStats(),
      exportedAt: new Date().toISOString()
    };
  }

  // Import data
  importData(data) {
    try {
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      if (data.stats) {
        this.saveStats(data.stats);
      }
      return true;
    } catch (error) {
      console.error('Error importing Pomodoro data:', error);
      return false;
    }
  }

  // Event listeners
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in listener callback:', error);
        }
      });
    }
  }

  // Default values
  getDefaultSettings() {
    return {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      soundEnabled: true,
      notificationEnabled: true,
      taskIntegration: true
    };
  }

  getDefaultStats() {
    return {
      totalPomodoros: 0,
      totalWorkTime: 0,
      todayPomodoros: 0,
      todayWorkTime: 0,
      streak: 0,
      lastActiveDate: null
    };
  }
}

export default new PomodoroService();
