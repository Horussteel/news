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

    // Initialize gamification storage
    if (!localStorage.getItem('habitGameData')) {
      localStorage.setItem('habitGameData', JSON.stringify({
        userStats: {
          totalPoints: 0,
          currentLevel: 1,
          currentXP: 0,
          totalCompletions: 0,
          longestStreak: 0,
          perfectWeeks: 0
        },
        unlockedAchievements: [],
        unlockedBadges: [],
        userPreferences: {
          showAnimations: true,
          soundEnabled: true,
          confettiEnabled: true
        }
      }));
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
    } catch (error) {
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
      currentStreak: 0,
      // Gamification properties
      pointsPerCompletion: habitData.pointsPerCompletion || 10,
      difficulty: habitData.difficulty || 'easy',
      totalPointsEarned: 0,
      timesCompleted: 0,
      milestones: []
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
    } catch (error) {
      console.error('❌ HabitService: Error getting habit completions:', error);
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
    
    const habitCompletions = completions[habitId];
    
    // Check if already completed for this date
    if (!Array.isArray(habitCompletions) || !habitCompletions.includes(date)) {
      if (Array.isArray(habitCompletions)) {
        habitCompletions.push(date);
        habitCompletions.sort(); // Keep dates in order
      } else {
        completions[habitId] = [date];
      }
      
      this.saveHabitCompletions(completions);
      
      // Update habit's completion list
      const habits = this.getHabits();
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        habit.completions = [...(completions[habitId] || [])];
        this.saveHabits(habits);
      }
      
      return true;
    }
    
    return false;
  }

  // Check if habit is completed for a specific date
  isHabitCompleted(habitId, date = new Date().toISOString().split('T')[0]) {
    const completions = this.getHabitCompletions();
    const habitCompletions = completions[habitId] || [];
    return Array.isArray(habitCompletions) && habitCompletions.includes(date);
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
    if (!Array.isArray(completions) || completions.length === 0) {
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

  // Get gamification data
  getGameData() {
    if (typeof window === 'undefined') return null;
    try {
      const gameData = localStorage.getItem('habitGameData');
      return gameData ? JSON.parse(gameData) : null;
    } catch (error) {
      console.error('❌ HabitService: Error getting game data:', error);
      return null;
    }
  }

  // Save gamification data
  saveGameData(gameData) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('habitGameData', JSON.stringify(gameData));
    } catch (error) {
      console.error('Error saving game data:', error);
    }
  }

  // Calculate points earned for habit completion
  calculatePoints(habit, isNewCompletion = false) {
    let basePoints = habit.pointsPerCompletion || 10;
    
    // Difficulty multiplier
    const difficultyMultipliers = {
      easy: 1.0,
      medium: 1.5,
      hard: 2.0,
      expert: 3.0
    };
    
    const difficultyMultiplier = difficultyMultipliers[habit.difficulty] || 1.0;
    
    // Streak bonus
    let streakBonus = 0;
    const stats = this.getHabitStats(habit.id);
    if (stats.currentStreak >= 7) {
      streakBonus = Math.floor(stats.currentStreak / 7) * 5;
    }
    
    // Perfect week bonus (7 consecutive days)
    const currentStreak = stats.currentStreak;
    const perfectWeekBonus = (currentStreak >= 7 && currentStreak % 7 === 0) ? 10 : 0;
    
    // First completion bonus
    const firstCompletionBonus = isNewCompletion ? 20 : 0;
    
    const totalPoints = Math.round((basePoints * difficultyMultiplier) + streakBonus + perfectWeekBonus + firstCompletionBonus);
    
    return {
      basePoints: Math.round(basePoints * difficultyMultiplier),
      streakBonus,
      perfectWeekBonus,
      firstCompletionBonus,
      totalPoints
    };
  }

  // Award points to user and habit
  awardPoints(habitId, isNewCompletion = false) {
    const habits = this.getHabits();
    const habit = habits.find(h => h.id === habitId);
    
    if (!habit) return null;
    
    const pointsCalculation = this.calculatePoints(habit, isNewCompletion);
    const gameData = this.getGameData();
    
    // Update habit points
    habit.totalPointsEarned = (habit.totalPointsEarned || 0) + pointsCalculation.totalPoints;
    habit.timesCompleted = (habit.timesCompleted || 0) + 1;
    
    // Update user stats
    if (gameData && gameData.userStats) {
      gameData.userStats.totalPoints = (gameData.userStats.totalPoints || 0) + pointsCalculation.totalPoints;
      gameData.userStats.totalCompletions = (gameData.userStats.totalCompletions || 0) + 1;
      
      // Update longest streak
      const currentStreak = habit.currentStreak || 0;
      if (currentStreak > (gameData.userStats.longestStreak || 0)) {
        gameData.userStats.longestStreak = currentStreak;
      }
    }
    
    // Save changes
    this.saveHabits(habits);
    if (gameData) {
      this.saveGameData(gameData);
    }
    
    // Check for achievements
    const achievementResult = this.checkAchievements(habitId, pointsCalculation);
    
    return {
      habit,
      pointsEarned: pointsCalculation.totalPoints,
      userStats: gameData ? gameData.userStats : null,
      achievement: achievementResult
    };
  }

  // Check and unlock achievements
  checkAchievements(habitId, pointsCalculation) {
    const gameData = this.getGameData();
    if (!gameData) return null;
    
    const achievements = this.getAchievements();
    const habits = this.getHabits();
    const habit = habits.find(h => h.id === habitId);
    
    if (!habit) return null;
    
    const unlockedAchievements = gameData.unlockedAchievements || [];
    const newAchievements = [];
    
    // Define achievements
    const achievementList = [
      {
        id: 'first_completion',
        name: '🌟 Primulul pas',
        description: 'Ai completat primul tău obiceiul!',
        icon: '🌟',
        points: 50,
        condition: () => habit.timesCompleted === 1
      },
      {
        id: 'streak_7',
        name: '🔥 Seria de 7',
        description: 'Ai o serie de 7 zile consecutive!',
        icon: '🔥',
        points: 100,
        condition: () => habit.currentStreak >= 7
      },
      {
        id: 'streak_30',
        name: '💎 Maratonist',
        description: 'Ai o serie de 30 de zile consecutive!',
        icon: '💎',
        points: 500,
        condition: () => habit.currentStreak >= 30
      },
      {
        id: 'points_100',
        name: '💯 Centenar',
        description: 'Ai câștigat 100 de puncte totale!',
        icon: '💯',
        points: 200,
        condition: () => habit.totalPointsEarned >= 100
      },
      {
        id: 'points_1000',
        name: '🏆 Mii de puncte',
        description: 'Ai câștigat 1000 de puncte totale!',
        icon: '🏆',
        points: 1000,
        condition: () => habit.totalPointsEarned >= 1000
      },
      {
        id: 'completions_50',
        name: '📊 Consistent',
        description: 'Ai completat obiceiul de 50 de ori!',
        icon: '📊',
        points: 300,
        condition: () => habit.timesCompleted >= 50
      },
      {
        id: 'completions_100',
        name: '🏅 Maestru',
        description: 'Ai completat obiceiul de 100 de ori!',
        icon: '🏅',
        points: 500,
        condition: () => habit.timesCompleted >= 100
      }
    ];
    
    // Check achievements
    achievementList.forEach(achievement => {
      if (!unlockedAchievements.includes(achievement.id) && achievement.condition()) {
        newAchievements.push(achievement);
        unlockedAchievements.push(achievement.id);
      }
    });
    
    // Save unlocked achievements
    if (newAchievements.length > 0) {
      gameData.unlockedAchievements = unlockedAchievements;
      this.saveGameData(gameData);
    }
    
    return newAchievements.length > 0 ? newAchievements : null;
  }

  // Get all achievements
  getAchievements() {
    return [
      {
        id: 'first_completion',
        name: '🌟 Primulul pas',
        description: 'Ai completat primul tău obiceiul!',
        icon: '🌟',
        points: 50,
        category: 'milestone'
      },
      {
        id: 'streak_7',
        name: '🔥 Seria de 7',
        description: 'Ai o serie de 7 zile consecutive!',
        icon: '🔥',
        points: 100,
        category: 'streak'
      },
      {
        id: 'streak_30',
        name: '💎 Maratonist',
        description: 'Ai o serie de 30 de zile consecutive!',
        icon: '💎',
        points: 500,
        category: 'streak'
      },
      {
        id: 'points_100',
        name: '💯 Centenar',
        description: 'Ai câștigat 100 de puncte totale!',
        icon: '💯',
        points: 200,
        category: 'points'
      },
      {
        id: 'points_1000',
        name: '🏆 Mii de puncte',
        description: 'Ai câștigat 1000 de puncte totale!',
        icon: '🏆',
        points: 1000,
        category: 'points'
      },
      {
        id: 'completions_50',
        name: '📊 Consistent',
        description: 'Ai completat obiceiul de 50 de ori!',
        icon: '📊',
        points: 300,
        category: 'completion'
      },
      {
        id: 'completions_100',
        name: '🏅 Maestru',
        description: 'Ai completat obiceiul de 100 de ori!',
        icon: '🏅',
        points: 500,
        category: 'completion'
      }
    ];
  }

  // Calculate user level based on XP
  calculateUserLevel(totalPoints) {
    // Level thresholds (XP needed for each level)
    const levels = [
      { level: 1, xpRequired: 0, title: 'Începător' },
      { level: 2, xpRequired: 100, title: 'Novice' },
      { level: 3, xpRequired: 250, title: 'Aventurier' },
      { level: 4, xpRequired: 500, title: 'Explorator' },
      { level: 5, xpRequired: 1000, title: 'Expert' },
      { level: 6, xpRequired: 2000, title: 'Maestru' },
      { level: 7, xpRequired: 3500, title: 'Guru' },
      { level: 8, xpRequired: 5000, title: 'Legendă' },
      { level: 9, xpRequired: 7500, title: 'Mastru Legendă' },
      { level: 10, xpRequired: 10000, title: 'Nemesis' }
    ];
    
    for (let i = levels.length - 1; i >= 0; i--) {
      if (totalPoints >= levels[i].xpRequired) {
        return {
          ...levels[i],
          xpIntoLevel: totalPoints - levels[i].xpRequired,
          xpToNextLevel: i < levels.length - 1 ? 
            levels[i + 1].xpRequired - totalPoints : 0
        };
      }
    }
    
    return levels[0]; // Fallback to level 1
  }

  // Update user level
  updateUserLevel() {
    const gameData = this.getGameData();
    if (!gameData || !gameData.userStats) return null;
    
    const userStats = gameData.userStats;
    const levelInfo = this.calculateUserLevel(userStats.totalPoints);
    
    userStats.currentLevel = levelInfo.level;
    userStats.currentXP = userStats.totalPoints;
    
    this.saveGameData(gameData);
    
    return levelInfo;
  }

  // Get user statistics with gamification
  getUserStats() {
    const gameData = this.getGameData();
    if (!gameData) return null;
    
    const userStats = gameData.userStats || {};
    const levelInfo = this.calculateUserLevel(userStats.totalPoints || 0);
    
    return {
      ...userStats,
      level: levelInfo.level,
      levelTitle: levelInfo.title,
      xpIntoLevel: levelInfo.xpIntoLevel,
      xpToNextLevel: levelInfo.xpToNextLevel,
      unlockedAchievements: gameData.unlockedAchievements || [],
      unlockedBadges: gameData.unlockedBadges || []
    };
  }

  // Enhanced markHabitCompleted with gamification
  markHabitCompletedWithGamification(habitId, date = new Date().toISOString().split('T')[0]) {
    const wasAlreadyCompleted = this.isHabitCompleted(habitId, date);
    
    if (!wasAlreadyCompleted) {
      // Mark as completed (original logic)
      this.markHabitCompleted(habitId, date);
      
      // Award points and check achievements
      const result = this.awardPoints(habitId, false);
      
      // Update user level
      this.updateUserLevel();
      
      return {
        success: true,
        pointsEarned: result.pointsEarned,
        achievement: result.achievement,
        isNewLevel: false
      };
    }
    
    return { success: false, reason: 'already_completed' };
  }

  // Get leaderboards
  getLeaderboards() {
    const habits = this.getHabits();
    const gameData = this.getGameData();
    
    if (!gameData) return null;
    
    // Top habits by points
    const topHabits = habits
      .filter(h => !h.isArchived)
      .sort((a, b) => (b.totalPointsEarned || 0) - (a.totalPointsEarned || 0))
      .slice(0, 10)
      .map(habit => ({
        habitId: habit.id,
        habitName: habit.name,
        habitIcon: habit.icon,
        habitColor: habit.color,
        totalPoints: habit.totalPointsEarned || 0,
        completions: habit.timesCompleted || 0,
        currentStreak: this.getHabitStats(habit.id).currentStreak
      }));
    
    return {
      topHabits,
      userStats: this.getUserStats(),
      totalActiveHabits: habits.filter(h => !h.isArchived).length
    };
  }

  // Clear all habits data
  clearAllData() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('habits');
      localStorage.removeItem('habitCompletions');
      localStorage.removeItem('habitGameData');
    } catch (error) {
      console.error('Error clearing habits data:', error);
    }
  }
}

export default new HabitService();
