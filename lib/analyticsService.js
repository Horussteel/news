import todoService from './todoService';
import habitService from './habitService';
import readingService from './readingService';

class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.clearCache();
  }

  clearCache() {
    this.cache.clear();
  }

  // Get comprehensive analytics data
  getAnalytics() {
    const cacheKey = 'comprehensive_analytics';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const analytics = {
      overview: this.getOverviewStats(),
      productivity: this.getProductivityStats(),
      habits: this.getHabitsStats(),
      reading: this.getReadingStats(),
      todos: this.getTodosStats(),
      timeline: this.getTimelineData(),
      trends: this.getTrendsData(),
      achievements: this.getAchievementsData()
    };

    this.cache.set(cacheKey, {
      data: analytics,
      timestamp: Date.now()
    });

    return analytics;
  }

  // Overview statistics
  getOverviewStats() {
    console.log('📊 AnalyticsService: getOverviewStats() called');
    
    try {
      const todos = todoService.getTodos();
      const habits = habitService.getHabits();
      const reading = readingService.getReadingProgress();
      
      console.log('📊 AnalyticsService: Raw data:', { todos, habits, reading });
      
      const completedTodos = todos.filter(t => t.completed).length;
      const activeHabits = habits.filter(h => !h.isArchived).length;
      const completedReading = reading.filter(r => r.completed).length;

      const stats = {
        totalTodos: todos.length,
        completedTodos,
        completionRate: todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0,
        totalHabits: habits.length,
        activeHabits,
        totalReading: reading.length,
        completedReading,
        readingCompletionRate: reading.length > 0 ? Math.round((completedReading / reading.length) * 100) : 0,
        overallProductivity: this.calculateOverallProductivity()
      };
      
      console.log('📊 AnalyticsService: Overview stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('❌ AnalyticsService: Error in getOverviewStats():', error);
      return {
        totalTodos: 0,
        completedTodos: 0,
        completionRate: 0,
        totalHabits: 0,
        activeHabits: 0,
        totalReading: 0,
        completedReading: 0,
        readingCompletionRate: 0,
        overallProductivity: 0
      };
    }
  }

  // Productivity statistics
  getProductivityStats() {
    const currentWeek = this.getWeekRange();
    const currentMonth = this.getMonthRange();
    
    return {
      thisWeek: this.getProductivityForRange('week', currentWeek),
      thisMonth: this.getProductivityForRange('month', currentMonth),
      lastWeek: this.getProductivityForRange('week', this.getWeekRange(-1)),
      lastMonth: this.getProductivityForRange('month', this.getMonthRange(-1)),
      averageDaily: this.getAverageDailyProductivity(),
      bestDay: this.getBestProductivityDay(),
      worstDay: this.getWorstProductivityDay()
    };
  }

  // Habits statistics
  getHabitsStats() {
    const habits = habitService.getHabits();
    const habitStats = habits.map(habit => {
      const stats = habitService.getHabitStats(habit.id);
      return {
        id: habit.id,
        name: habit.name,
        type: habit.type || 'positive',
        streak: stats.currentStreak,
        bestStreak: stats.bestStreak,
        completionRate: stats.completionRate,
        totalCompletions: stats.totalCompletions,
        category: habit.category,
        createdAt: habit.createdAt,
        isArchived: habit.isArchived
      };
    });

    return {
      habits: habitStats,
      totalActive: habitStats.filter(h => !h.isArchived).length,
      averageStreak: habitStats.length > 0 ? Math.round(habitStats.reduce((sum, h) => sum + h.streak, 0) / habitStats.length) : 0,
      bestStreak: habitStats.length > 0 ? Math.max(...habitStats.map(h => h.bestStreak)) : 0,
      completionRate: habitStats.length > 0 ? Math.round(habitStats.reduce((sum, h) => sum + h.completionRate, 0) / habitStats.length) : 0
    };
  }

  // Reading statistics
  getReadingStats() {
    const reading = readingService.getReadingProgress();
    const books = reading.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      totalPages: book.totalPages,
      currentPage: book.currentPage,
      progress: book.progress,
      completed: book.completed,
      startDate: book.startDate,
      endDate: book.endDate,
      category: book.category
    }));

    const totalPagesRead = books.reduce((sum, book) => sum + (book.currentPage || 0), 0);
    const totalPagesTotal = books.reduce((sum, book) => sum + (book.totalPages || 0), 0);
    const completedBooks = books.filter(book => book.completed).length;

    return {
      books,
      totalPagesRead,
      totalPagesTotal,
      totalPagesRemaining: totalPagesTotal - totalPagesRead,
      completedBooks,
      averageProgress: books.length > 0 ? Math.round(books.reduce((sum, book) => sum + book.progress, 0) / books.length) : 0,
      readingSpeed: this.calculateReadingSpeed(books),
      favoriteCategory: this.getFavoriteCategory(books)
    };
  }

  // To-Do statistics
  getTodosStats() {
    const todos = todoService.getTodos();
    const categories = todoService.getCategories();
    
    const byPriority = {
      urgent: todos.filter(t => t.priority === 'urgent').length,
      high: todos.filter(t => t.priority === 'high').length,
      medium: todos.filter(t => t.priority === 'medium').length,
      low: todos.filter(t => t.priority === 'low').length
    };

    const byStatus = {
      pending: todos.filter(t => !t.completed).length,
      completed: todos.filter(t => t.completed).length,
      overdue: todos.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length
    };

    const byCategory = {};
    categories.forEach(category => {
      byCategory[category.name] = todos.filter(t => t.category === category.name).length;
    });

    return {
      total: todos.length,
      byPriority,
      byStatus,
      byCategory,
      averageCompletionTime: this.getAverageCompletionTime(todos)
    };
  }

  // Timeline data
  getTimelineData() {
    const days = 30; // Last 30 days
    const timeline = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayData = this.getDayAnalytics(date);
      timeline.push({
        date: date.toISOString().split('T')[0],
        ...dayData
      });
    }
    
    return timeline;
  }

  // Trends data
  getTrendsData() {
    const timeline = this.getTimelineData();
    
    return {
      productivityTrend: this.calculateTrend(timeline.map(d => d.productivityScore)),
      todosTrend: this.calculateTrend(timeline.map(d => d.todosCompleted)),
      habitsTrend: this.calculateTrend(timeline.map(d => d.habitsCompleted)),
      readingTrend: this.calculateTrend(timeline.map(d => d.pagesRead))
    };
  }

  // Achievements data
  getAchievementsData() {
    const todos = todoService.getTodos();
    const habits = habitService.getHabits();
    const reading = readingService.getReadingProgress();
    
    const achievements = [];
    
    // Todo achievements
    if (todos.filter(t => t.completed).length >= 10) {
      achievements.push({
        id: 'todo_master',
        title: 'Task Master',
        description: 'Completed 10+ tasks',
        icon: '🏆',
        earnedAt: this.findDateWhenAchieved('todos_completed_10'),
        category: 'productivity'
      });
    }
    
    if (todos.filter(t => t.completed).length >= 50) {
      achievements.push({
        id: 'todo_expert',
        title: 'Productivity Expert',
        description: 'Completed 50+ tasks',
        icon: '⭐',
        earnedAt: this.findDateWhenAchieved('todos_completed_50'),
        category: 'productivity'
      });
    }
    
    // Habit achievements
    const maxStreak = habits.reduce((max, habit) => {
      const stats = habitService.getHabitStats(habit.id);
      return Math.max(max, stats.bestStreak);
    }, 0);
    
    if (maxStreak >= 7) {
      achievements.push({
        id: 'habit_warrior',
        title: 'Habit Warrior',
        description: `Maintained a ${maxStreak}-day streak`,
        icon: '🔥',
        earnedAt: this.findDateWhenAchieved('habit_streak_7'),
        category: 'consistency'
      });
    }
    
    if (maxStreak >= 30) {
      achievements.push({
        id: 'habit_master',
        title: 'Habit Master',
        description: `Maintained a ${maxStreak}-day streak`,
        icon: '👑',
        earnedAt: this.findDateWhenAchieved('habit_streak_30'),
        category: 'consistency'
      });
    }
    
    // Reading achievements
    const completedBooks = reading.filter(book => book.completed).length;
    
    if (completedBooks >= 1) {
      achievements.push({
        id: 'first_book',
        title: 'Bookworm',
        description: 'Completed your first book',
        icon: '📚',
        earnedAt: this.findDateWhenAchieved('first_book_completed'),
        category: 'learning'
      });
    }
    
    if (completedBooks >= 5) {
      achievements.push({
        id: 'reading_enthusiast',
        title: 'Reading Enthusiast',
        description: 'Completed 5+ books',
        icon: '📖',
        earnedAt: this.findDateWhenAchieved('books_completed_5'),
        category: 'learning'
      });
    }
    
    return {
      achievements,
      totalAchievements: achievements.length,
      recentAchievements: achievements.slice(-3)
    };
  }

  // Helper methods
  getWeekRange(offset = 0) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() - (offset * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return { start: startOfWeek, end: endOfWeek };
  }

  getMonthRange(offset = 0) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0);
    
    return { start: startOfMonth, end: endOfMonth };
  }

  getProductivityForRange(range, dateRange) {
    const todos = todoService.getTodos();
    const habits = habitService.getHabits();
    const reading = readingService.getReadingProgress();
    
    let productivityScore = 0;
    
    // Todo completions
    const todosInRange = todos.filter(todo => {
      const todoDate = new Date(todo.completedAt || todo.createdAt);
      return todoDate >= dateRange.start && todoDate <= dateRange.end && todo.completed;
    });
    productivityScore += todosInRange.length * 2;
    
    // Habit completions
    habits.forEach(habit => {
      const stats = habitService.getHabitStats(habit.id);
      const completionsInRange = stats.completionHistory.filter(date => {
        const completionDate = new Date(date);
        return completionDate >= dateRange.start && completionDate <= dateRange.end;
      });
      productivityScore += completionsInRange.length;
    });
    
    // Reading progress
    const readingInRange = reading.filter(book => {
      if (!book.completed) return false;
      const completionDate = new Date(book.endDate);
      return completionDate >= dateRange.start && completionDate <= dateRange.end;
    });
    productivityScore += readingInRange.length * 3;
    
    return {
      score: productivityScore,
      todosCompleted: todosInRange.length,
      habitsCompleted: habits.reduce((sum, habit) => {
        const stats = habitService.getHabitStats(habit.id);
        const completionsInRange = stats.completionHistory.filter(date => {
          const completionDate = new Date(date);
          return completionDate >= dateRange.start && completionDate <= dateRange.end;
        });
        return sum + completionsInRange.length;
      }, 0),
      booksCompleted: readingInRange.length
    };
  }

  getAverageDailyProductivity() {
    const timeline = this.getTimelineData();
    if (timeline.length === 0) return 0;
    
    const totalScore = timeline.reduce((sum, day) => sum + day.productivityScore, 0);
    return Math.round(totalScore / timeline.length);
  }

  getBestProductivityDay() {
    const timeline = this.getTimelineData();
    if (timeline.length === 0) return null;
    
    const bestDay = timeline.reduce((best, current) => 
      current.productivityScore > best.productivityScore ? current : best
    );
    
    return {
      date: bestDay.date,
      score: bestDay.productivityScore,
      todosCompleted: bestDay.todosCompleted,
      habitsCompleted: bestDay.habitsCompleted,
      booksCompleted: bestDay.booksCompleted
    };
  }

  getWorstProductivityDay() {
    const timeline = this.getTimelineData();
    if (timeline.length === 0) return null;
    
    const worstDay = timeline.reduce((worst, current) => 
      current.productivityScore < worst.productivityScore ? current : worst
    );
    
    return {
      date: worstDay.date,
      score: worstDay.productivityScore,
      todosCompleted: worstDay.todosCompleted,
      habitsCompleted: worstDay.habitsCompleted,
      booksCompleted: worstDay.booksCompleted
    };
  }

  calculateOverallProductivity() {
    const overview = this.getOverviewStats();
    const weights = {
      todos: 0.4,
      habits: 0.3,
      reading: 0.3
    };
    
    const todoScore = (overview.completionRate / 100) * weights.todos;
    const habitScore = (overview.activeHabits > 0 ? overview.activeHabits / overview.totalHabits * 100 : 0) * weights.habits;
    const readingScore = (overview.readingCompletionRate / 100) * weights.reading;
    
    const overallScore = (todoScore + habitScore + readingScore) * 100;
    return Math.round(Math.min(overallScore, 100)); // Cap at 100%
  }

  calculateReadingSpeed(books) {
    const completedBooks = books.filter(book => book.completed && book.startDate && book.endDate);
    if (completedBooks.length === 0) return 0;
    
    const totalDays = completedBooks.reduce((sum, book) => {
      const start = new Date(book.startDate);
      const end = new Date(book.endDate);
      return sum + Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }, 0);
    
    const totalPages = completedBooks.reduce((sum, book) => sum + (book.totalPages || 0), 0);
    
    return totalDays > 0 ? Math.round(totalPages / totalDays) : 0;
  }

  getFavoriteCategory(books) {
    const categoryCounts = {};
    books.forEach(book => {
      if (book.category) {
        categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
      }
    });
    
    let favoriteCategory = null;
    let maxCount = 0;
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteCategory = category;
      }
    });
    
    return favoriteCategory;
  }

  getAverageCompletionTime(todos) {
    const completedTodos = todos.filter(todo => todo.completed && todo.createdAt && todo.completedAt);
    if (completedTodos.length === 0) return 0;
    
    const totalTime = completedTodos.reduce((sum, todo) => {
      const created = new Date(todo.createdAt);
      const completed = new Date(todo.completedAt);
      return sum + (completed - created);
    }, 0);
    
    return Math.round(totalTime / completedTodos.length / (1000 * 60 * 60)); // in hours
  }

  getDayAnalytics(date) {
    const todos = todoService.getTodos();
    const habits = habitService.getHabits();
    const reading = readingService.getReadingProgress();
    
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const todosCompleted = todos.filter(todo => {
      if (!todo.completed) return false;
      const completedDate = new Date(todo.completedAt);
      return completedDate >= date && completedDate < nextDay;
    }).length;
    
    const habitsCompleted = habits.reduce((count, habit) => {
      const stats = habitService.getHabitStats(habit.id);
      const completions = stats.completionHistory.filter(completionDate => {
        const date = new Date(completionDate);
        return date >= date && date < nextDay;
      });
      return count + completions.length;
    }, 0);
    
    const booksCompleted = reading.filter(book => {
      if (!book.completed) return false;
      const completedDate = new Date(book.endDate);
      return completedDate >= date && completedDate < nextDay;
    }).length;
    
    const pagesRead = reading.reduce((sum, book) => {
      // This is simplified - in a real app, you'd track page reading history
      return sum + (book.completed ? (book.totalPages || 0) : 0);
    }, 0);
    
    return {
      date: date.toISOString().split('T')[0],
      todosCompleted,
      habitsCompleted,
      booksCompleted,
      pagesRead,
      productivityScore: (todosCompleted * 2) + (habitsCompleted * 1) + (booksCompleted * 3)
    };
  }

  calculateTrend(values) {
    if (values.length < 2) return 'insufficient_data';
    
    const recent = values.slice(-7);
    const older = values.slice(-14, -7);
    
    if (older.length === 0) return 'insufficient_data';
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    
    const difference = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (difference > 10) return 'improving';
    if (difference < -10) return 'declining';
    return 'stable';
  }

  findDateWhenAchieved(achievementId) {
    // This is a simplified implementation
    // In a real app, you'd track achievement dates properly
    const achievements = this.getStoredAchievements();
    return achievements[achievementId] || new Date().toISOString();
  }

  getStoredAchievements() {
    // Retrieve stored achievements from localStorage
    try {
      const stored = localStorage.getItem('achievements');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  // Export analytics data
  exportAnalytics(format = 'json') {
    const analytics = this.getAnalytics();
    
    if (format === 'json') {
      return JSON.stringify(analytics, null, 2);
    }
    
    if (format === 'csv') {
      return this.convertToCSV(analytics);
    }
    
    return analytics;
  }

  convertToCSV(analytics) {
    // Convert analytics data to CSV format
    const csv = [];
    
    // Overview
    csv.push('Overview');
    csv.push('Metric,Value');
    Object.entries(analytics.overview).forEach(([key, value]) => {
      csv.push(`${key},${value}`);
    });
    csv.push('');
    
    // Timeline
    csv.push('Timeline');
    csv.push('Date,Todos,Habits,Books,Pages,Productivity');
    analytics.timeline.forEach(day => {
      csv.push(`${day.date},${day.todosCompleted},${day.habitsCompleted},${day.booksCompleted},${day.pagesRead},${day.productivityScore}`);
    });
    
    return csv.join('\n');
  }

  // Get specific analytics for dashboard
  getDashboardData() {
    console.log('🔍 AnalyticsService: getDashboardData() called');
    
    try {
      const overview = this.getOverviewStats();
      console.log('📊 Overview stats:', overview);
      
      const recentActivity = this.getRecentActivity();
      console.log('📋 Recent activity:', recentActivity);
      
      const topMetrics = this.getTopMetrics();
      console.log('🏆 Top metrics:', topMetrics);
      
      const quickStats = this.getQuickStats();
      console.log('⚡ Quick stats:', quickStats);
      
      const data = {
        overview,
        recentActivity,
        topMetrics,
        quickStats
      };
      
      console.log('✅ AnalyticsService: Dashboard data ready:', data);
      return data;
    } catch (error) {
      console.error('❌ AnalyticsService: Error in getDashboardData():', error);
      return {
        overview: { totalTodos: 0, completedTodos: 0, completionRate: 0, totalHabits: 0, activeHabits: 0, totalReading: 0, completedReading: 0, readingCompletionRate: 0, overallProductivity: 0 },
        recentActivity: [],
        topMetrics: {},
        quickStats: { todayTodos: 0, todayHabits: 0, todayReading: 0, todayProductivity: 0 }
      };
    }
  }

  getRecentActivity(days = 7) {
    const todos = todoService.getTodos();
    const habits = habitService.getHabits();
    const reading = readingService.getReadingProgress();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentTodos = todos
      .filter(todo => todo.completedAt && new Date(todo.completedAt) > cutoffDate)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5)
      .map(todo => ({
        type: 'todo',
        title: todo.title,
        completedAt: todo.completedAt,
        priority: todo.priority
      }));
    
    const recentHabits = habits
      .filter(habit => {
        const stats = habitService.getHabitStats(habit.id);
        return stats.completionHistory.length > 0;
      })
      .map(habit => {
        const stats = habitService.getHabitStats(habit.id);
        const lastCompletion = stats.completionHistory[stats.completionHistory.length - 1];
        return {
          type: 'habit',
          name: habit.name,
          lastCompletion,
          streak: stats.currentStreak
        };
      })
      .sort((a, b) => new Date(b.lastCompletion) - new Date(a.lastCompletion))
      .slice(0, 3);
    
    const recentReading = reading
      .filter(book => book.completed && book.endDate && new Date(book.endDate) > cutoffDate)
      .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
      .slice(0, 3)
      .map(book => ({
        type: 'reading',
        title: book.title,
        author: book.author,
        completedAt: book.endDate,
        progress: book.progress
      }));
    
    return [...recentTodos, ...recentHabits, ...recentReading];
  }

  getTopMetrics() {
    const overview = this.getOverviewStats();
    const productivity = this.getProductivityStats();
    const habits = this.getHabitsStats();
    const reading = this.getReadingStats();
    
    return {
      mostProductiveDay: this.getBestProductivityDay(),
      longestStreak: habits.bestStreak,
      fastestReader: {
        booksCompleted: reading.completedBooks,
        readingSpeed: reading.readingSpeed
      },
      topCategory: reading.favoriteCategory,
      completionRate: overview.completionRate
    };
  }

  getQuickStats() {
    console.log('⚡ AnalyticsService: getQuickStats() called');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todos = todoService.getTodos();
    const habits = habitService.getHabits();
    const reading = readingService.getReadingProgress();
    
    console.log('⚡ AnalyticsService: Raw data for quick stats:', { todos, habits, reading });
    
    const todayTodos = todos.filter(todo => {
      if (!todo.completed) return false;
      return new Date(todo.completedAt) >= today && new Date(todo.completedAt) < tomorrow;
    }).length;
    
    const todayHabits = habits.reduce((count, habit) => {
      const stats = habitService.getHabitStats(habit.id);
      const todayCompletions = stats.completionHistory.filter(date => {
        const completionDate = new Date(date);
        return completionDate >= today && completionDate < tomorrow;
      });
      return count + todayCompletions.length;
    }, 0);
    
    const todayReading = reading.filter(book => {
      if (!book.completed) return false;
      return new Date(book.endDate) >= today && new Date(book.endDate) < tomorrow;
    }).length;
    
    const quickStats = {
      todayTodos,
      todayHabits,
      todayReading,
      todayProductivity: (todayTodos * 2) + (todayHabits * 1) + (todayReading * 3)
    };
    
    console.log('⚡ AnalyticsService: Quick stats calculated:', quickStats);
    return quickStats;
  }
}

export default new AnalyticsService();
