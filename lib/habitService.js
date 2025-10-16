class HabitService {
  constructor() {
    this.initializeStorage();
  }

  initializeStorage() {
    if (typeof window === 'undefined') return;
    
    if (!localStorage.getItem('habits')) {
      localStorage.setItem('habits', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('habitCompletions')) {
      localStorage.setItem('habitCompletions', JSON.stringify({}));
    }
  }

  // Get all habits
  getHabits() {
    console.log('🎯 HabitService: getHabits() called');
    if (typeof window === 'undefined') return [];
    try {
      const habits = localStorage.getItem('habits');
      const parsedHabits = habits ? JSON.parse(habits) : [];
      console.log('🎯 HabitService: Habits loaded:', parsedHabits.length, 'items');
      return parsedHabits;
    } catch {
      console.error('❌ HabitService: Error getting habits:', error);
      return [];
    }
  }

  // Save habits to storage
  saveHabits(habits) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('habits', JSON.stringify(habits));
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  }

  // Add a new habit
  addHabit(habitData) {
    const habits = this.getHabits();
    const newHabit = {
      id: Date.now().toString(),
      name: habitData.name,
      description: habitData.description || '',
      category: habitData.category || 'personal',
      frequency: habitData.frequency || 'daily',
      createdAt: new Date().toISOString(),
      startDate: habitData.startDate || new Date().toISOString(),
      type: habitData.type || 'positive',
      isArchived: false,
      icon: habitData.icon || '🎯',
      color: habitData.color || '#3B82F6',
      completions: [],
      bestStreak: 0,
      currentStreak: 0
    };

    habits.push(newHabit);
    this.saveHabits(habits);
    return newHabit;
  }

  // Update a habit
  updateHabit(habitId, updates) {
    const habits = this.getHabits();
    const index = habits.findIndex(h => h.id === habitId);
    
    if (index !== -1) {
      habits[index] = { ...habits[index], ...updates };
      this.saveHabits(habits);
      return habits[index];
    }
    return null;
  }

  // Delete a habit
  deleteHabit(habitId) {
    const habits = this.getHabits();
    const filteredHabits = habits.filter(h => h.id !== habitId);
    this.saveHabits(filteredHabits);
    
    // Also delete completions for this habit
    const completions = this.getHabitCompletions();
    delete completions[habitId];
    this.saveHabitCompletions(completions);
  }

  // Archive/unarchive a habit
  toggleArchiveHabit(habitId) {
    const habits = this.getHabits();
    const habit = habits.find(h => h.id === habitId);
    
    if (habit) {
      habit.isArchived = !habit.isArchived;
      this.saveHabits(habits);
      return habit;
    }
    return null;
  }

  // Get habit completions
  getHabitCompletions() {
    if (typeof window === 'undefined') return {};
    try {
      const completions = localStorage.getItem('habitCompletions');
      return completions ? JSON.parse(completions) : {};
    } catch {
      return {};
    }
  }

  // Save habit completions
  saveHabitCompletions(completions) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('habitCompletions', JSON.stringify(completions));
    } catch (error) {
      console.error('Error saving habit completions:', error);
    }
  }

  // Mark habit as completed for a specific date
  markHabitCompleted(habitId, date = new Date().toISOString().split('T')[0]) {
    const completions = this.getHabitCompletions();
    
    if (!completions[habitId]) {
      completions[habitId] = [];
    }
    
    // Check if already completed for this date
    if (!completions[habitId].includes(date)) {
      completions[habitId].push(date);
      completions[habitId].sort(); // Keep dates in order
      this.saveHabitCompletions(completions);
      
      // Update habit's completion list
      const habits = this.getHabits();
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        habit.completions = [...completions[habitId]];
        this.saveHabits(habits);
      }
      
      return true;
    }
    
    return false;
  }

  // Check if habit is completed for a specific date
  isHabitCompleted(habitId, date = new Date().toISOString().split('T')[0]) {
    const completions = this.getHabitCompletions();
    return completions[habitId] ? completions[habitId].includes(date) : false;
  }

  // Get habit statistics
  getHabitStats(habitId) {
    const habits = this.getHabits();
    const habit = habits.find(h => h.id === habitId);
    const completions = this.getHabitCompletions()[habitId] || [];
    
    if (!habit) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        totalCompletions: 0,
        completionRate: 0,
        completionHistory: []
      };
    }

    const stats = this.calculateStreakStats(completions);
    
    return {
      ...stats,
      totalCompletions: completions.length,
      completionRate: this.calculateCompletionRate(habit, completions),
      completionHistory: completions
    };
  }

  // Calculate streak statistics
  calculateStreakStats(completions) {
    if (completions.length === 0) {
      return { currentStreak: 0, bestStreak: 0 };
    }

    const sortedDates = [...completions].sort();
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak (consecutive days up to today)
    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date(today);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const completionDate = new Date(sortedDates[sortedDates.length - 1 - i]);
      const diffTime = checkDate - completionDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === i) {
        currentStreak++;
        checkDate = new Date(completionDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }

    // Calculate best streak
    tempStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currentDate = new Date(sortedDates[i]);
        const diffTime = currentDate - prevDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          bestStreak = Math.max(bestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);

    return { currentStreak, bestStreak };
  }

  // Calculate completion rate
  calculateCompletionRate(habit, completions) {
    if (habit.isArchived || !habit.startDate) return 0;
    
    const startDate = new Date(habit.startDate);
    const today = new Date();
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceStart <= 0) return 0;
    
    // For daily habits, count only days that should have been completed
    const daysToComplete = this.getDaysToComplete(habit, startDate, today);
    
    return daysToComplete > 0 ? Math.round((completions.length / daysToComplete) * 100) : 0;
  }

  // Get days that should have been completed based on frequency
  getDaysToComplete(habit, startDate, endDate) {
    const days = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      switch (habit.frequency) {
        case 'daily':
          days.push(currentDate.toISOString().split('T')[0]);
          break;
        case 'weekly':
          // Only check the same day of week
          if (currentDate.getDay() === startDate.getDay()) {
            days.push(currentDate.toISOString().split('T')[0]);
          }
          break;
        case 'monthly':
          // Only check the same day of month
          if (currentDate.getDate() === startDate.getDate()) {
            days.push(currentDate.toISOString().split('T')[0]);
          }
          break;
      }
      
      if (habit.type === 'negative') {
        // For negative habits, check every day (frequency doesn't apply)
        days.push(currentDate.toISOString().split('T')[0]);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days.length;
  }

  // Get overall habit statistics
  getAllHabitsStats() {
    const habits = this.getHabits();
    const totalStats = {
      totalHabits: habits.length,
      activeHabits: habits.filter(h => !h.isArchived).length,
      completedToday: 0,
      weeklyStreaks: 0,
      monthlyStreaks: 0,
      totalCompletions: 0,
      averageCompletionRate: 0
    };

    const today = new Date().toISOString().split('T')[0];
    let totalCompletionRate = 0;
    let activeHabitsCount = 0;

    habits.forEach(habit => {
      if (!habit.isArchived) {
        const stats = this.getHabitStats(habit.id);
        
        if (this.isHabitCompleted(habit.id, today)) {
          totalStats.completedToday++;
        }
        
        if (stats.currentStreak >= 7) {
          totalStats.weeklyStreaks++;
        }
        
        if (stats.currentStreak >= 30) {
          totalStats.monthlyStreaks++;
        }
        
        totalStats.totalCompletions += stats.totalCompletions;
        totalCompletionRate += stats.completionRate;
        activeHabitsCount++;
      }
    });

    totalStats.averageCompletionRate = activeHabitsCount > 0 ? 
      Math.round(totalCompletionRate / activeHabitsCount) : 0;

    return totalStats;
  }

  // Get habits by category
  getHabitsByCategory(category) {
    const habits = this.getHabits();
    return habits.filter(h => h.category === category);
  }

  // Get habit categories
  getHabitCategories() {
    const habits = this.getHabits();
    const categories = [...new Set(habits.map(h => h.category))];
    return categories;
  }

  // Search habits
  searchHabits(query) {
    const habits = this.getHabits();
    const lowercaseQuery = query.toLowerCase();
    
    return habits.filter(habit => 
      habit.name.toLowerCase().includes(lowercaseQuery) ||
      habit.description.toLowerCase().includes(lowercaseQuery) ||
      habit.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get habit completion history for a date range
  getHabitCompletionHistory(habitId, startDate, endDate) {
    const completions = this.getHabitCompletions()[habitId] || [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return completions.filter(date => {
      const completionDate = new Date(date);
      return completionDate >= start && completionDate <= end;
    });
  }

  // Get all habits with their statistics
  getHabitsWithStats() {
    const habits = this.getHabits();
    return habits.map(habit => ({
      ...habit,
      stats: this.getHabitStats(habit.id)
    }));
  }

  // Get habit performance metrics
  getHabitPerformanceMetrics() {
    const habits = this.getHabits();
    const metrics = {
      totalHabits: habits.length,
      activeHabits: habits.filter(h => !h.isArchived).length,
      archivedHabits: habits.filter(h => h.isArchived).length,
      positiveHabits: habits.filter(h => h.type === 'positive' && !h.isArchived).length,
      negativeHabits: habits.filter(h => h.type === 'negative' && !h.isArchived).length,
      habitsWithStreaks: 0,
      averageStreakLength: 0,
      bestPerformingHabit: null,
      worstPerformingHabit: null,
      categoryDistribution: {}
    };

    let totalStreakLength = 0;
    let habitsWithStreaks = 0;
    let bestCompletionRate = 0;
    let worstCompletionRate = 100;
    let bestHabit = null;
    let worstHabit = null;

    habits.forEach(habit => {
      if (!habit.isArchived) {
        const stats = this.getHabitStats(habit.id);
        
        if (stats.currentStreak > 0) {
          habitsWithStreaks++;
          totalStreakLength += stats.currentStreak;
        }
        
        if (stats.completionRate > bestCompletionRate) {
          bestCompletionRate = stats.completionRate;
          bestHabit = habit;
        }
        
        if (stats.completionRate < worstCompletionRate && stats.totalCompletions > 0) {
          worstCompletionRate = stats.completionRate;
          worstHabit = habit;
        }

        // Category distribution
        if (!metrics.categoryDistribution[habit.category]) {
          metrics.categoryDistribution[habit.category] = 0;
        }
        metrics.categoryDistribution[habit.category]++;
      }
    });

    metrics.averageStreakLength = habitsWithStreaks > 0 ? 
      Math.round(totalStreakLength / habitsWithStreaks) : 0;
    metrics.habitsWithStreaks = habitsWithStreaks;
    metrics.bestPerformingHabit = bestHabit;
    metrics.worstPerformingHabit = worstHabit;

    return metrics;
  }

  // Export habits data
  exportHabitsData() {
    const habits = this.getHabits();
    const completions = this.getHabitCompletions();
    
    return {
      habits,
      completions,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  // Import habits data
  importHabitsData(data) {
    try {
      if (data.habits && Array.isArray(data.habits)) {
        this.saveHabits(data.habits);
      }
      
      if (data.completions && typeof data.completions === 'object') {
        this.saveHabitCompletions(data.completions);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing habits data:', error);
      return false;
    }
  }

  // Clear all habits data
  clearAllData() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('habits');
      localStorage.removeItem('habitCompletions');
    } catch (error) {
      console.error('Error clearing habits data:', error);
    }
  }
}

export default new HabitService();
