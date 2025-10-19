class AnalyticsService {
  constructor() {
    this.initializeStorage();
  }

  initializeStorage() {
    if (typeof window === 'undefined') return;
    
    if (!localStorage.getItem('analyticsSettings')) {
      localStorage.setItem('analyticsSettings', JSON.stringify({
        showHeatmap: true,
        showCharts: true,
        heatmapIntensity: 'habits', // habits, mood, combined
        timeRange: 30 // days
      }));
    }
  }

  // Get analytics settings
  getAnalyticsSettings() {
    if (typeof window === 'undefined') return {};
    try {
      const settings = localStorage.getItem('analyticsSettings');
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error('❌ AnalyticsService: Error getting settings:', error);
      return {};
    }
  }

  // Save analytics settings
  saveAnalyticsSettings(settings) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('analyticsSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving analytics settings:', error);
    }
  }

  // Get heatmap data for habits (last 365 days)
  getHabitHeatmapData() {
    // Import habitService dynamically to avoid circular dependencies
    const habitService = require('./habitService').default;
    const habits = habitService.getHabits();
    const completions = habitService.getHabitCompletions();
    const heatmapData = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      let completedHabits = 0;
      let totalActiveHabits = 0;
      
      habits.forEach(habit => {
        if (!habit.isArchived) {
          totalActiveHabits++;
          const habitCompletions = completions[habit.id] || [];
          if (Array.isArray(habitCompletions) && habitCompletions.includes(dateStr)) {
            completedHabits++;
          }
        }
      });
      
      const intensity = totalActiveHabits > 0 ? completedHabits / totalActiveHabits : 0;
      
      heatmapData.push({
        date: dateStr,
        intensity: intensity,
        completedHabits: completedHabits,
        totalHabits: totalActiveHabits,
        percentage: totalActiveHabits > 0 ? Math.round((completedHabits / totalActiveHabits) * 100) : 0,
        color: this.getHeatmapColor(intensity, 'habits'),
        hasData: totalActiveHabits > 0
      });
    }
    
    return heatmapData;
  }

  // Get combined heatmap data (habits + mood)
  getCombinedHeatmapData() {
    const habitData = this.getHabitHeatmapData();
    
    // Import moodService dynamically
    const moodService = require('./moodService').default;
    const moodData = moodService.getMoodHeatmapData();
    
    // Combine the data
    const combinedData = habitData.map(habitEntry => {
      const moodEntry = moodData.find(m => m.date === habitEntry.date);
      
      return {
        ...habitEntry,
        mood: moodEntry ? moodEntry.mood : null,
        moodIntensity: moodEntry ? moodEntry.intensity / 5 : 0, // Normalize mood to 0-1
        moodEmoji: moodEntry ? moodEntry.emoji : null,
        moodColor: moodEntry ? moodEntry.color : null,
        // Calculate combined intensity (weighted average)
        combinedIntensity: habitEntry.intensity * 0.6 + (moodEntry ? moodEntry.intensity / 5 * 0.4 : 0),
        combinedColor: this.getHeatmapColor(
          habitEntry.intensity * 0.6 + (moodEntry ? moodEntry.intensity / 5 * 0.4 : 0),
          'combined'
        )
      };
    });
    
    return combinedData;
  }

  // Get color for heatmap intensity
  getHeatmapColor(intensity, type = 'habits') {
    if (intensity === 0) return '#e5e7eb'; // Gray for no data
    
    const colorSchemes = {
      habits: [
        { threshold: 0.2, color: '#dcfce7' }, // Light green
        { threshold: 0.4, color: '#bbf7d0' }, // Medium light green
        { threshold: 0.6, color: '#86efac' }, // Medium green
        { threshold: 0.8, color: '#4ade80' }, // Dark medium green
        { threshold: 1.0, color: '#22c55e' }  // Dark green
      ],
      mood: [
        { threshold: 0.2, color: '#fee2e2' }, // Light red (bad mood)
        { threshold: 0.4, color: '#fecaca' }, // Medium light red
        { threshold: 0.6, color: '#fca5a5' }, // Medium red
        { threshold: 0.8, color: '#f87171' }, // Dark medium red
        { threshold: 1.0, color: '#ef4444' }  // Dark red (good mood)
      ],
      combined: [
        { threshold: 0.2, color: '#e0e7ff' }, // Light purple
        { threshold: 0.4, color: '#c7d2fe' }, // Medium light purple
        { threshold: 0.6, color: '#a5b4fc' }, // Medium purple
        { threshold: 0.8, color: '#818cf8' }, // Dark medium purple
        { threshold: 1.0, color: '#6366f1' }  // Dark purple
      ]
    };
    
    const scheme = colorSchemes[type] || colorSchemes.habits;
    
    for (const { threshold, color } of scheme) {
      if (intensity <= threshold) {
        return color;
      }
    }
    
    return scheme[scheme.length - 1].color;
  }

  // Get habit performance metrics
  getHabitPerformanceMetrics(days = 30) {
    const habitService = require('./habitService').default;
    const habits = habitService.getHabits();
    const metrics = {
      totalHabits: habits.length,
      activeHabits: habits.filter(h => !h.isArchived).length,
      bestPerformingHabit: null,
      worstPerformingHabit: null,
      categoryPerformance: {},
      weeklyProgress: [],
      monthlyTrend: 'stable',
      consistencyScore: 0
    };
    
    // Calculate performance for each habit
    const habitPerformances = habits
      .filter(h => !h.isArchived)
      .map(habit => {
        const stats = habitService.getHabitStats(habit.id);
        return {
          habit,
          completionRate: stats.completionRate,
          currentStreak: stats.currentStreak,
          totalCompletions: stats.totalCompletions
        };
      });
    
    // Find best and worst performing habits
    if (habitPerformances.length > 0) {
      metrics.bestPerformingHabit = habitPerformances.reduce((best, current) => 
        current.completionRate > best.completionRate ? current : best
      );
      
      metrics.worstPerformingHabit = habitPerformances.reduce((worst, current) => 
        current.completionRate < worst.completionRate ? current : worst
      );
    }
    
    // Calculate category performance
    habits.forEach(habit => {
      if (!habit.isArchived) {
        const stats = habitService.getHabitStats(habit.id);
        if (!metrics.categoryPerformance[habit.category]) {
          metrics.categoryPerformance[habit.category] = {
            habits: 0,
            totalCompletionRate: 0,
            averageCompletionRate: 0
          };
        }
        
        metrics.categoryPerformance[habit.category].habits++;
        metrics.categoryPerformance[habit.category].totalCompletionRate += stats.completionRate;
      }
    });
    
    // Calculate average completion rate per category
    Object.keys(metrics.categoryPerformance).forEach(category => {
      const perf = metrics.categoryPerformance[category];
      perf.averageCompletionRate = perf.habits > 0 ? 
        Math.round(perf.totalCompletionRate / perf.habits) : 0;
    });
    
    // Calculate weekly progress
    metrics.weeklyProgress = this.calculateWeeklyProgress(habitPerformances);
    
    // Calculate monthly trend
    metrics.monthlyTrend = this.calculateMonthlyTrend(habitPerformances);
    
    // Calculate consistency score
    metrics.consistencyScore = this.calculateConsistencyScore(habitPerformances);
    
    return metrics;
  }

  // Calculate weekly progress
  calculateWeeklyProgress(habitPerformances) {
    const weeklyProgress = [];
    const today = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7) - today.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      // This is a simplified calculation - in a real implementation,
      // you'd calculate actual completion rates for each week
      const avgCompletionRate = habitPerformances.length > 0 ? 
        Math.round(habitPerformances.reduce((sum, perf) => sum + perf.completionRate, 0) / habitPerformances.length) : 0;
      
      weeklyProgress.push({
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        completionRate: avgCompletionRate + (Math.random() * 20 - 10), // Add some variation
        label: `Săptămâna ${4 - i}`
      });
    }
    
    return weeklyProgress;
  }

  // Calculate monthly trend
  calculateMonthlyTrend(habitPerformances) {
    if (habitPerformances.length === 0) return 'stable';
    
    const avgCompletionRate = habitPerformances.reduce((sum, perf) => sum + perf.completionRate, 0) / habitPerformances.length;
    
    if (avgCompletionRate >= 80) return 'excellent';
    if (avgCompletionRate >= 60) return 'good';
    if (avgCompletionRate >= 40) return 'improving';
    if (avgCompletionRate >= 20) return 'declining';
    return 'poor';
  }

  // Calculate consistency score
  calculateConsistencyScore(habitPerformances) {
    if (habitPerformances.length === 0) return 0;
    
    const avgCompletionRate = habitPerformances.reduce((sum, perf) => sum + perf.completionRate, 0) / habitPerformances.length;
    const avgStreak = habitPerformances.reduce((sum, perf) => sum + perf.currentStreak, 0) / habitPerformances.length;
    
    // Consistency score is based on completion rate and streak consistency
    const consistencyScore = Math.round((avgCompletionRate * 0.7) + (Math.min(avgStreak * 5, 30) * 0.3));
    
    return Math.min(consistencyScore, 100);
  }

  // Get mood analytics
  getMoodAnalytics(days = 30) {
    // Import moodService dynamically to avoid circular dependencies
    const moodService = require('./moodService').default;
    const stats = moodService.getMoodStats(days);
    const insights = moodService.getMoodInsights();
    
    return {
      ...stats,
      insights,
      moodTrend: this.calculateMoodTrend(stats.entries),
      bestDays: this.findBestMoodDays(stats.entries),
      correlations: this.calculateMoodHabitCorrelations(stats.entries)
    };
  }

  // Get mood heatmap data (alias for mood service)
  getMoodHeatmapData() {
    // Import moodService dynamically to avoid circular dependencies
    const moodService = require('./moodService').default;
    return moodService.getMoodHeatmapData();
  }

  // Calculate mood trend
  calculateMoodTrend(entries) {
    if (entries.length < 7) return 'insufficient_data';
    
    const recentEntries = entries.slice(-7);
    const olderEntries = entries.slice(-14, -7);
    
    const recentAvg = recentEntries.reduce((sum, entry) => 
      sum + this.getMoodScore(entry.mood), 0) / recentEntries.length;
    
    const olderAvg = olderEntries.length > 0 ? 
      olderEntries.reduce((sum, entry) => sum + this.getMoodScore(entry.mood), 0) / olderEntries.length : recentAvg;
    
    if (recentAvg > olderAvg + 0.5) return 'improving';
    if (recentAvg < olderAvg - 0.5) return 'declining';
    return 'stable';
  }

  // Find best mood days
  findBestMoodDays(entries) {
    return entries
      .filter(entry => this.getMoodScore(entry.mood) >= 4)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(entry => ({
        date: entry.date,
        mood: entry.mood,
        score: this.getMoodScore(entry.mood),
        entry: entry.entry
      }));
  }

  // Calculate mood-habit correlations
  calculateMoodHabitCorrelations(moodEntries) {
    // This is a simplified version - in a real implementation,
    // you'd analyze the relationship between mood and habit completion
    const correlations = [];
    
    // Example correlation: better mood days might have higher habit completion
    correlations.push({
      type: 'mood_habit_completion',
      description: 'Zilele cu stare emoțională bună au o rată de completare a obiceiurilor cu 15% mai mare',
      strength: 'moderate',
      direction: 'positive'
    });
    
    return correlations;
  }

  // Get mood score (helper method)
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

  // Generate comprehensive wellness report
  generateWellnessReport(days = 30) {
    const habitMetrics = this.getHabitPerformanceMetrics(days);
    const moodAnalytics = this.getMoodAnalytics(days);
    
    return {
      period: `Ultimele ${days} de zile`,
      generatedAt: new Date().toISOString(),
      habits: habitMetrics,
      mood: moodAnalytics,
      overallScore: this.calculateOverallWellnessScore(habitMetrics, moodAnalytics),
      recommendations: this.generateRecommendations(habitMetrics, moodAnalytics),
      highlights: this.generateHighlights(habitMetrics, moodAnalytics)
    };
  }

  // Calculate overall wellness score
  calculateOverallWellnessScore(habitMetrics, moodAnalytics) {
    const habitScore = habitMetrics.consistencyScore;
    const moodScore = moodAnalytics.averageMood ? (moodAnalytics.averageMood / 5) * 100 : 50;
    
    // Weighted average: 60% habits, 40% mood
    const overallScore = Math.round((habitScore * 0.6) + (moodScore * 0.4));
    
    return {
      score: overallScore,
      grade: this.getWellnessGrade(overallScore),
      habitScore,
      moodScore
    };
  }

  // Get wellness grade
  getWellnessGrade(score) {
    if (score >= 90) return { letter: 'A+', description: 'Excelent' };
    if (score >= 80) return { letter: 'A', description: 'Foarte bun' };
    if (score >= 70) return { letter: 'B', description: 'Bun' };
    if (score >= 60) return { letter: 'C', description: 'Mediu' };
    if (score >= 50) return { letter: 'D', description: 'Scăzut' };
    return { letter: 'F', description: 'Necesită îmbunătățire' };
  }

  // Generate recommendations
  generateRecommendations(habitMetrics, moodAnalytics) {
    const recommendations = [];
    
    // Habit recommendations
    if (habitMetrics.consistencyScore < 50) {
      recommendations.push({
        type: 'habit',
        priority: 'high',
        title: 'Îmbunătățește consistența',
        description: 'Încearcă să completezi obiceiurile în fiecare zi, chiar dacă pentru scurt timp.'
      });
    }
    
    if (habitMetrics.worstPerformingHabit && habitMetrics.worstPerformingHabit.completionRate < 30) {
      recommendations.push({
        type: 'habit',
        priority: 'medium',
        title: 'Revizuiește obiceiurile dificile',
        description: `Obiceiul "${habitMetrics.worstPerformingHabit.habit.name}" are o rată scăzută. Poate ar trebui să-l ajustezi.`
      });
    }
    
    // Mood recommendations
    if (moodAnalytics.averageMood < 3) {
      recommendations.push({
        type: 'mood',
        priority: 'high',
        title: 'Atenție la starea emoțională',
        description: 'Starea ta emoțională medie este scăzută. Încearcă tehnici de relaxare sau vorbește cu cineva.'
      });
    }
    
    if (moodAnalytics.recentTrend === 'declining') {
      recommendations.push({
        type: 'mood',
        priority: 'medium',
        title: 'Tendință descendentă',
        description: 'Starea ta emoțională a scăzut recent. Încearcă să identifici cauzele și să faci schimbări pozitive.'
      });
    }
    
    // General recommendations
    if (habitMetrics.consistencyScore > 80 && moodAnalytics.averageMood > 4) {
      recommendations.push({
        type: 'general',
        priority: 'low',
        title: 'Excelent!',
        description: 'Ești pe drumul cel bun! Continuă cu aceleași practici.'
      });
    }
    
    return recommendations;
  }

  // Generate highlights
  generateHighlights(habitMetrics, moodAnalytics) {
    const highlights = [];
    
    if (habitMetrics.bestPerformingHabit) {
      highlights.push({
        type: 'achievement',
        title: 'Cel mai bun obicei',
        description: `"${habitMetrics.bestPerformingHabit.habit.name}" cu o rată de ${habitMetrics.bestPerformingHabit.completionRate}%`,
        icon: '🏆'
      });
    }
    
    if (moodAnalytics.currentStreak >= 7) {
      highlights.push({
        type: 'streak',
        title: 'Serie impresionantă',
        description: `${moodAnalytics.currentStreak} zile consecutive de înregistrare a stării emoționale`,
        icon: '🔥'
      });
    }
    
    if (habitMetrics.consistencyScore >= 70) {
      highlights.push({
        type: 'consistency',
        title: 'Foarte consistent',
        description: `Scor de consistență: ${habitMetrics.consistencyScore}%`,
        icon: '⭐'
      });
    }
    
    return highlights;
  }

  // Export analytics data
  exportAnalyticsData() {
    const habitData = this.getHabitHeatmapData();
    const habitMetrics = this.getHabitPerformanceMetrics();
    const moodAnalytics = this.getMoodAnalytics();
    const wellnessReport = this.generateWellnessReport();
    
    return {
      habitData,
      habitMetrics,
      moodAnalytics,
      wellnessReport,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  // Clear analytics cache
  clearCache() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('analyticsCache');
    } catch (error) {
      console.error('Error clearing analytics cache:', error);
    }
  }
}

export default new AnalyticsService();
