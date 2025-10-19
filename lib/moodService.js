class MoodService {
  constructor() {
    this.initializeStorage();
  }

  initializeStorage() {
    if (typeof window === 'undefined') return;
    
    if (!localStorage.getItem('moodEntries')) {
      localStorage.setItem('moodEntries', JSON.stringify({}));
    }

    if (!localStorage.getItem('moodSettings')) {
      localStorage.setItem('moodSettings', JSON.stringify({
        reminderEnabled: false,
        reminderTime: '20:00',
        showInsights: true
      }));
    }
  }

  // Get mood entries
  getMoodEntries() {
    if (typeof window === 'undefined') return {};
    try {
      const entries = localStorage.getItem('moodEntries');
      return entries ? JSON.parse(entries) : {};
    } catch (error) {
      console.error('❌ MoodService: Error getting mood entries:', error);
      return {};
    }
  }

  // Save mood entries
  saveMoodEntries(entries) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('moodEntries', JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving mood entries:', error);
    }
  }

  // Get available moods
  getMoodOptions() {
    return [
      { id: 'amazing', emoji: '🤩', label: 'Excelent', color: '#10b981', description: 'Mă simt fantastic!' },
      { id: 'good', emoji: '😊', label: 'Bine', color: '#3b82f6', description: 'O zi bună' },
      { id: 'ok', emoji: '😐', label: 'OK', color: '#f59e0b', description: 'Normal, nici bine nici rău' },
      { id: 'bad', emoji: '😟', label: 'Rău', color: '#ef4444', description: 'Nu e o zi bună' },
      { id: 'angry', emoji: '😠', label: 'Furios', color: '#dc2626', description: 'Sunt supărat/ă' },
      { id: 'sad', emoji: '😢', label: 'Trist', color: '#6b7280', description: 'Mă simt trist/ă' },
      { id: 'anxious', emoji: '😰', label: 'Anxios', color: '#8b5cf6', description: 'Sunt îngrijorat/ă' },
      { id: 'tired', emoji: '😴', label: 'Obosit', color: '#64748b', description: 'Sunt obosit/ă' }
    ];
  }

  // Add or update mood entry for a specific date
  setMoodEntry(date, moodId, entry = '') {
    const entries = this.getMoodEntries();
    const today = date || new Date().toISOString().split('T')[0];
    
    entries[today] = {
      mood: moodId,
      entry: entry,
      timestamp: new Date().toISOString(),
      date: today
    };
    
    this.saveMoodEntries(entries);
    return entries[today];
  }

  // Get mood entry for a specific date
  getMoodEntry(date) {
    const entries = this.getMoodEntries();
    return entries[date] || null;
  }

  // Get mood entry for today
  getTodayMood() {
    const today = new Date().toISOString().split('T')[0];
    return this.getMoodEntry(today);
  }

  // Get mood entries for a date range
  getMoodHistory(startDate, endDate) {
    const entries = this.getMoodEntries();
    const history = [];
    
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (entries[dateStr]) {
        history.push(entries[dateStr]);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return history;
  }

  // Get mood statistics
  getMoodStats(days = 30) {
    const entries = this.getMoodEntries();
    const moodOptions = this.getMoodOptions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const stats = {
      totalEntries: 0,
      moodDistribution: {},
      averageMood: 0,
      currentStreak: 0,
      longestStreak: 0,
      recentTrend: 'stable',
      entries: []
    };
    
    // Initialize mood distribution
    moodOptions.forEach(mood => {
      stats.moodDistribution[mood.id] = {
        count: 0,
        percentage: 0,
        mood: mood
      };
    });
    
    let totalScore = 0;
    let validEntries = 0;
    let currentStreakCount = 0;
    let longestStreakCount = 0;
    
    // Get entries for the specified period
    const sortedDates = Object.keys(entries).sort();
    
    sortedDates.forEach(dateStr => {
      const entry = entries[dateStr];
      const entryDate = new Date(dateStr);
      
      if (entryDate >= cutoffDate) {
        stats.totalEntries++;
        stats.entries.push(entry);
        
        // Update mood distribution
        if (stats.moodDistribution[entry.mood]) {
          stats.moodDistribution[entry.mood].count++;
        }
        
        // Calculate mood score (1-5 scale)
        const moodScore = this.getMoodScore(entry.mood);
        totalScore += moodScore;
        validEntries++;
        
        // Calculate streaks (consecutive days with entries)
        const daysDiff = Math.floor((new Date() - entryDate) / (1000 * 60 * 60 * 24));
        if (daysDiff <= validEntries) {
          currentStreakCount++;
        } else {
          longestStreakCount = Math.max(longestStreakCount, currentStreakCount);
          currentStreakCount = 1;
        }
      }
    });
    
    // Update streaks
    stats.currentStreak = currentStreakCount;
    stats.longestStreak = Math.max(longestStreakCount, currentStreakCount);
    
    // Calculate percentages
    Object.keys(stats.moodDistribution).forEach(moodId => {
      const count = stats.moodDistribution[moodId].count;
      stats.moodDistribution[moodId].percentage = 
        stats.totalEntries > 0 ? Math.round((count / stats.totalEntries) * 100) : 0;
    });
    
    // Calculate average mood
    stats.averageMood = validEntries > 0 ? Math.round((totalScore / validEntries) * 10) / 10 : 0;
    
    // Calculate trend
    if (stats.entries.length >= 7) {
      const recentEntries = stats.entries.slice(-7);
      const olderEntries = stats.entries.slice(-14, -7);
      
      const recentAvg = recentEntries.reduce((sum, entry) => 
        sum + this.getMoodScore(entry.mood), 0) / recentEntries.length;
      
      const olderAvg = olderEntries.length > 0 ? 
        olderEntries.reduce((sum, entry) => sum + this.getMoodScore(entry.mood), 0) / olderEntries.length : recentAvg;
      
      if (recentAvg > olderAvg + 0.3) {
        stats.recentTrend = 'improving';
      } else if (recentAvg < olderAvg - 0.3) {
        stats.recentTrend = 'declining';
      } else {
        stats.recentTrend = 'stable';
      }
    }
    
    return stats;
  }

  // Get mood score (1-5 scale)
  getMoodScore(moodId) {
    const moodScores = {
      'amazing': 5,
      'good': 4,
      'ok': 3,
      'bad': 2,
      'angry': 1,
      'sad': 1.5,
      'anxious': 2,
      'tired': 2.5
    };
    return moodScores[moodId] || 3;
  }

  // Get mood insights
  getMoodInsights() {
    const stats = this.getMoodStats(30);
    const insights = [];
    
    if (stats.totalEntries === 0) {
      return [{
        type: 'info',
        title: 'Începe să-ți înregistrezi starea',
        description: 'Adaugă prima ta intrare pentru a vedea insights personalizate.',
        icon: '📝'
      }];
    }
    
    // Most common mood
    const mostCommonMood = Object.entries(stats.moodDistribution)
      .sort(([,a], [,b]) => b.count - a.count)[0];
    
    if (mostCommonMood && mostCommonMood[1].count > 0) {
      insights.push({
        type: 'pattern',
        title: 'Starea ta predominantă',
        description: `În ultimele 30 de zile, te-ai simțit cel mai des ${mostCommonMood[1].mood.label} ${mostCommonMood[1].mood.emoji}`,
        icon: mostCommonMood[1].mood.emoji,
        data: `${mostCommonMood[1].percentage}% din timp`
      });
    }
    
    // Trend insight
    if (stats.recentTrend === 'improving') {
      insights.push({
        type: 'positive',
        title: 'Tendință pozitivă',
        description: 'Starea ta emoțională s-a îmbunătățit în ultima săptămână!',
        icon: '📈'
      });
    } else if (stats.recentTrend === 'declining') {
      insights.push({
        type: 'warning',
        title: 'Atenție la tendință',
        description: 'Starea ta emoțională a scăzut în ultima săptămână. Încearcă să te odihnești mai mult.',
        icon: '📉'
      });
    }
    
    // Streak insight
    if (stats.currentStreak >= 7) {
      insights.push({
        type: 'achievement',
        title: 'Serie impresionantă!',
        description: `Ai înregistrat starea emoțională pentru ${stats.currentStreak} zile consecutive!`,
        icon: '🔥'
      });
    }
    
    // Consistency insight
    if (stats.totalEntries >= 25) {
      insights.push({
        type: 'achievement',
        title: 'Foarte consistent!',
        description: 'Ai înregistrat starea emoțională în majoritatea zilelor. Continuă așa!',
        icon: '⭐'
      });
    } else if (stats.totalEntries < 10) {
      insights.push({
        type: 'tip',
        title: 'Fii mai constant',
        description: 'Încearcă să înregistrezi starea emoțională în fiecare zi pentru insights mai bune.',
        icon: '💡'
      });
    }
    
    return insights;
  }

  // Get mood correlations with habits
  getMoodHabitCorrelations() {
    const moodEntries = this.getMoodEntries();
    const correlations = [];
    
    // This would require habit data - we'll implement this later
    // when we integrate with the habit service
    
    return correlations;
  }

  // Delete mood entry
  deleteMoodEntry(date) {
    const entries = this.getMoodEntries();
    delete entries[date];
    this.saveMoodEntries(entries);
    return true;
  }

  // Export mood data
  exportMoodData() {
    const entries = this.getMoodEntries();
    const settings = this.getMoodSettings();
    
    return {
      entries,
      settings,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  // Import mood data
  importMoodData(data) {
    try {
      if (data.entries && typeof data.entries === 'object') {
        this.saveMoodEntries(data.entries);
      }
      
      if (data.settings && typeof data.settings === 'object') {
        this.saveMoodSettings(data.settings);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing mood data:', error);
      return false;
    }
  }

  // Get mood settings
  getMoodSettings() {
    if (typeof window === 'undefined') return {};
    try {
      const settings = localStorage.getItem('moodSettings');
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error('Error getting mood settings:', error);
      return {};
    }
  }

  // Save mood settings
  saveMoodSettings(settings) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('moodSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving mood settings:', error);
    }
  }

  // Update mood setting
  updateMoodSetting(key, value) {
    const settings = this.getMoodSettings();
    settings[key] = value;
    this.saveMoodSettings(settings);
    return settings;
  }

  // Clear all mood data
  clearAllData() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('moodEntries');
      localStorage.removeItem('moodSettings');
      this.initializeStorage();
    } catch (error) {
      console.error('Error clearing mood data:', error);
    }
  }

  // Get mood for heatmap (last 365 days)
  getMoodHeatmapData() {
    const entries = this.getMoodEntries();
    const heatmapData = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const entry = entries[dateStr];
      const moodOption = entry ? this.getMoodOptions().find(m => m.id === entry.mood) : null;
      
      heatmapData.push({
        date: dateStr,
        mood: entry ? entry.mood : null,
        intensity: entry ? this.getMoodScore(entry.mood) : 0,
        color: moodOption ? moodOption.color : '#e5e7eb',
        emoji: moodOption ? moodOption.emoji : null,
        hasEntry: !!entry
      });
    }
    
    return heatmapData;
  }

  // Get mood calendar data for a specific month
  getMoodCalendarData(year, month) {
    const entries = this.getMoodEntries();
    const calendarData = [];
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split('T')[0];
      
      const entry = entries[dateStr];
      const moodOption = entry ? this.getMoodOptions().find(m => m.id === entry.mood) : null;
      
      calendarData.push({
        date: dateStr,
        day: day,
        mood: entry ? entry.mood : null,
        entry: entry ? entry.entry : '',
        emoji: moodOption ? moodOption.emoji : null,
        color: moodOption ? moodOption.color : '#e5e7eb',
        hasEntry: !!entry,
        isToday: dateStr === new Date().toISOString().split('T')[0]
      });
    }
    
    return calendarData;
  }
}

export default new MoodService();
