import { useState, useEffect } from 'react';
import habitService from '../lib/habitService';
import { useTranslation } from '../contexts/LanguageContext';

const HabitTracker = () => {
  const { t } = useTranslation();
  const [habits, setHabits] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('today'); // today, week, month
  const [editingHabit, setEditingHabit] = useState(null);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    category: 'personal',
    icon: '🎯',
    color: '#3B82F6',
    frequency: 'daily',
    targetCount: 1,
    unit: '',
    type: 'positive',
    startDate: '',
    difficulty: 'easy',
    pointsPerCompletion: 10
  });

  // Gamification state
  const [userStats, setUserStats] = useState(null);
  const [showAchievementNotification, setShowAchievementNotification] = useState(null);
  const [animatingHabits, setAnimatingHabits] = useState(new Set());
  const [showPointsAnimation, setShowPointsAnimation] = useState(null);

  const categories = [
    { value: 'personal', label: 'Personal', icon: '👤' },
    { value: 'health', label: 'Health', icon: '💪' },
    { value: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
    { value: 'productivity', label: 'Productivity', icon: '📈' },
    { value: 'learning', label: 'Learning', icon: '📚' },
    { value: 'social', label: 'Social', icon: '👥' }
  ];

  const icons = ['🎯', '🏃', '📚', '🧘', '💪', '🎨', '🎵', '💧', '🥗', '😴', '✍️', '🏆'];

  useEffect(() => {
    loadData();
    loadUserStats();
  }, []);

  const loadUserStats = () => {
    const stats = habitService.getUserStats();
    setUserStats(stats);
  };

  const loadData = () => {
    const habitsData = habitService.getHabits();
    const habitsWithStats = habitService.getHabitsWithStats();
    setHabits(habitsData.filter(h => !h.isArchived));
    setStatistics(habitsWithStats.map(h => ({ habit: h, ...h.stats })));
  };

  const handleCompleteHabit = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habitService.isHabitCompleted(habitId, selectedDate);
    
    if (isCompleted) {
      // Remove completion for this date
      const completions = habitService.getHabitCompletions()[habitId] || [];
      const updatedCompletions = completions.filter(date => date !== selectedDate);
      const allCompletions = habitService.getHabitCompletions();
      allCompletions[habitId] = updatedCompletions;
      habitService.saveHabitCompletions(allCompletions);
      loadData();
    } else {
      // Mark as completed with gamification
      const result = habitService.markHabitCompletedWithGamification(habitId, selectedDate);
      
      if (result.success) {
        // Show points animation
        setShowPointsAnimation({
          habitId,
          points: result.pointsEarned,
          position: { x: 0, y: 0 }
        });
        
        // Add to animating habits
        setAnimatingHabits(prev => new Set([...prev, habitId]));
        
        // Show achievement notification if unlocked
        if (result.achievement && result.achievement.length > 0) {
          setShowAchievementNotification(result.achievement[0]);
        }
        
        // Reload data after animation
        setTimeout(() => {
          loadData();
          loadUserStats();
          setAnimatingHabits(prev => {
            const newSet = new Set(prev);
            newSet.delete(habitId);
            return newSet;
          });
        }, 1000);
      }
    }
  };

  const showConfetti = () => {
    // Simple confetti animation using CSS
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    confettiContainer.innerHTML = `
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
      <div class="confetti-piece"></div>
    `;
    
    document.body.appendChild(confettiContainer);
    
    setTimeout(() => {
      document.body.removeChild(confettiContainer);
    }, 3000);
  };

  const handleAddHabit = () => {
    if (!newHabit.name.trim()) return;
    
    if (editingHabit) {
      habitService.updateHabit(editingHabit.id, newHabit);
      setEditingHabit(null);
    } else {
      habitService.addHabit(newHabit);
    }
    
    setNewHabit({
      name: '',
      description: '',
      category: 'personal',
      icon: '🎯',
      color: '#3B82F6',
      frequency: 'daily',
      targetCount: 1,
      unit: '',
      type: 'positive',
      startDate: '',
      difficulty: 'easy',
      pointsPerCompletion: 10
    });
    setShowAddForm(false);
    loadData();
  };

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setNewHabit({
      name: habit.name,
      description: habit.description,
      category: habit.category,
      icon: habit.icon,
      color: habit.color,
      frequency: habit.frequency,
      targetCount: habit.targetCount,
      unit: habit.unit,
      type: habit.type || 'positive',
      startDate: habit.startDate || '',
      difficulty: habit.difficulty || 'easy',
      pointsPerCompletion: habit.pointsPerCompletion || 10
    });
    setShowAddForm(true);
  };

  const handleDeleteHabit = (habitId) => {
    if (confirm('Are you sure you want to delete this habit and all its data?')) {
      habitService.deleteHabit(habitId);
      loadData();
    }
  };

  const getCompletionRate = () => {
    if (statistics.length === 0) return 0;
    const totalRate = statistics.reduce((sum, stat) => sum + stat.completionRate, 0);
    return Math.round(totalRate / statistics.length);
  };

  const getTotalStreak = () => {
    return statistics.reduce((sum, stat) => sum + stat.currentStreak, 0);
  };

  const getCompletionsForDate = (date) => {
    const completions = habitService.getHabitCompletions();
    const completedHabitIds = Object.keys(completions).filter(habitId => {
      const habitCompletions = completions[habitId] || [];
      return Array.isArray(habitCompletions) && habitCompletions.includes(date);
    });
    return habits.filter(h => completedHabitIds.includes(h.id));
  };

  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const renderHabitCard = (habit) => {
    const stat = statistics.find(s => s.habit.id === habit.id);
    const isCompleted = habitService.isHabitCompleted(habit.id, selectedDate);
    const negativeTime = null; // Simplified for now - negative habits can be implemented later
    
    return (
      <div key={habit.id} className={`habit-card ${habit.type === 'negative' ? 'negative-habit' : ''}`}>
        <div className="habit-header">
          <div className="habit-info">
            <div className="habit-icon" style={{ backgroundColor: habit.color }}>
              {habit.icon}
            </div>
            <div className="habit-details">
              <h3>{habit.name}</h3>
              <p>{habit.description}</p>
              {habit.type === 'negative' && (
                <div className="habit-type-badge">🚫 Negative Habit</div>
              )}
            </div>
          </div>
          <div className="habit-actions">
            {habit.type === 'positive' && (
              <button 
                className={`complete-btn ${isCompleted ? 'completed' : ''}`}
                onClick={() => handleCompleteHabit(habit.id)}
              >
                {isCompleted ? '✓' : '○'}
              </button>
            )}
            {habit.type === 'negative' && (
              <button 
                className="reset-btn"
                onClick={() => {
                  if (confirm('Are you sure you want to reset this negative habit counter? This will start counting from today.')) {
                    // Negative habits functionality can be implemented later
                    loadData();
                  }
                }}
                title="Reset counter"
              >
                🔄
              </button>
            )}
            <button 
              className="edit-btn"
              onClick={() => handleEditHabit(habit)}
            >
              ✏️
            </button>
            <button 
              className="delete-btn"
              onClick={() => handleDeleteHabit(habit.id)}
            >
              🗑️
            </button>
          </div>
        </div>
        
        {/* Negative habit time display */}
        {habit.type === 'negative' && negativeTime && (
          <div className="negative-time-display">
            <div className="time-counter">
              <span className="time-label">Time Clean:</span>
              <span className="time-value">{negativeTime.formatted}</span>
            </div>
            <div className="time-details">
              <span>Started: {new Date(negativeTime.startDate).toLocaleDateString()}</span>
            </div>
          </div>
        )}
        
        {stat && (
          <div className="habit-stats">
            <div className="stat">
              <span className="label">Streak</span>
              <span className="value">{stat.currentStreak} 🔥</span>
            </div>
            <div className="stat">
              <span className="label">Best</span>
              <span className="value">{stat.bestStreak} 🏆</span>
            </div>
            <div className="stat">
              <span className="label">Rate</span>
              <span className="value">{stat.completionRate}%</span>
            </div>
            <div className="stat">
              <span className="label">Total</span>
              <span className="value">{stat.totalCompletions}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="week-view">
        <h3>{t('habits.thisWeek')}</h3>
        <div className="week-grid">
          {weekDates.map((date, index) => {
            const completions = getCompletionsForDate(date);
            const isToday = date === new Date().toISOString().split('T')[0];
            
            return (
              <div key={date} className={`day-cell ${isToday ? 'today' : ''}`}>
                <div className="day-header">
                  <span className="day-name">{days[index]}</span>
                  <span className="day-date">{new Date(date).getDate()}</span>
                </div>
                <div className="day-habits">
                  {habits.slice(0, 4).map(habit => {
                    const isCompleted = habitService.isHabitCompleted(habit.id, date);
                    return (
                      <div 
                        key={habit.id}
                        className={`habit-indicator ${isCompleted ? 'completed' : ''}`}
                        style={{ backgroundColor: isCompleted ? habit.color : '#e5e7eb' }}
                        title={habit.name}
                      >
                        {habit.icon}
                      </div>
                    );
                  })}
                </div>
                <div className="day-summary">
                  {completions.length}/{habits.length}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="habit-tracker">
      <div className="tracker-header">
        <h2>🎯 {t('habits.title')}</h2>
        <div className="header-actions">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-picker"
          />
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="view-mode-select"
          >
            <option value="today">{t('habits.daily')}</option>
            <option value="week">{t('habits.weekly')}</option>
            <option value="month">{t('habits.monthly')}</option>
          </select>
          <button
            onClick={() => setShowAddForm(true)}
            className="add-habit-btn"
          >
            + {t('habits.addHabit')}
          </button>
        </div>
      </div>

      {/* User Stats Overview with Gamification */}
      <div className="stats-overview">
        {/* User Level and Points */}
        {userStats && (
          <div className="user-level-card">
            <div className="level-info">
              <div className="level-badge">
                <span className="level-number">{userStats.level}</span>
                <span className="level-title">{userStats.levelTitle}</span>
              </div>
              <div className="level-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${(userStats.xpIntoLevel / (userStats.xpIntoLevel + userStats.xpToNextLevel)) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {userStats.xpIntoLevel}/{userStats.xpIntoLevel + userStats.xpToNextLevel} XP
                </span>
              </div>
            </div>
            <div className="user-points">
              <div className="points-display">
                <span className="points-value">{userStats.totalPoints}</span>
                <span className="points-label">Total Points</span>
              </div>
              <div className="achievements-count">
                <span className="achievements-value">{userStats.unlockedAchievements.length}</span>
                <span className="achievements-label">Achievements</span>
              </div>
            </div>
          </div>
        )}

        <div className="stat-card">
          <h3>{t('habits.overallPerformance')}</h3>
          <div className="stat-value">{getCompletionRate()}%</div>
          <p>{t('habits.completionRate')}</p>
        </div>
        <div className="stat-card">
          <h3>{t('habits.totalStreak')}</h3>
          <div className="stat-value">{getTotalStreak()} 🔥</div>
          <p>{t('habits.activeDays')}</p>
        </div>
        <div className="stat-card">
          <h3>{t('habits.activeHabits')}</h3>
          <div className="stat-value">{habits.length}</div>
          <p>{t('habits.beingTracked')}</p>
        </div>
        <div className="stat-card">
          <h3>{t('habits.todaysProgress')}</h3>
          <div className="stat-value">
            {getCompletionsForDate(selectedDate).length}/{habits.length}
          </div>
          <p>{t('habits.completed')}</p>
        </div>
      </div>

      {/* Achievement Notification */}
      {showAchievementNotification && (
        <div className="achievement-notification">
          <div className="achievement-content">
            <div className="achievement-icon">
              {showAchievementNotification.icon}
            </div>
            <div className="achievement-info">
              <h4>🏆 Achievement Unlocked!</h4>
              <h5>{showAchievementNotification.name}</h5>
              <p>{showAchievementNotification.description}</p>
              <div className="achievement-points">
                +{showAchievementNotification.points} Points
              </div>
            </div>
            <button 
              className="achievement-close"
              onClick={() => setShowAchievementNotification(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Points Animation */}
      {showPointsAnimation && (
        <div className="points-animation">
          <div className="points-popup">
            <span className="points-value">+{showPointsAnimation.points}</span>
            <span className="points-label">Points</span>
          </div>
        </div>
      )}

      {/* View Modes */}
      {viewMode === 'week' && renderWeekView()}

      {/* Habits Grid for Today View */}
      {viewMode === 'today' && (
        <div className="habits-section">
          <h3>
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          {habits.length === 0 ? (
            <div className="empty-state">
              <p>{t('habits.noHabitsFound')}</p>
            </div>
          ) : (
            <div className="habits-grid">
              {habits.map(habit => renderHabitCard(habit))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Habit Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingHabit ? t('habits.editHabit') : t('habits.addNewHabit')}</h3>
            
            <div className="form-group">
              <label>{t('habits.name')}</label>
              <input
                type="text"
                value={newHabit.name}
                onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                placeholder={t('habits.habitNamePlaceholder')}
              />
            </div>

            <div className="form-group">
              <label>{t('habits.description')}</label>
              <textarea
                value={newHabit.description}
                onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                placeholder={t('habits.descriptionPlaceholder')}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('habits.category')}</label>
                <select
                  value={newHabit.category}
                  onChange={(e) => setNewHabit({...newHabit, category: e.target.value})}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('habits.icon')}</label>
                <div className="icon-selector">
                  {icons.map(icon => (
                    <button
                      key={icon}
                      className={`icon-btn ${newHabit.icon === icon ? 'selected' : ''}`}
                      onClick={() => setNewHabit({...newHabit, icon})}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>{t('habits.habitType')}</label>
              <select
                value={newHabit.type}
                onChange={(e) => setNewHabit({...newHabit, type: e.target.value})}
              >
                <option value="positive">✅ Positive Habit (Build good habits)</option>
                <option value="negative">🚫 Negative Habit (Break bad habits)</option>
              </select>
            </div>

            {newHabit.type === 'negative' && (
              <div className="form-group">
                <label>{t('habits.startDate')}</label>
                <input
                  type="date"
                  value={newHabit.startDate}
                  onChange={(e) => setNewHabit({...newHabit, startDate: e.target.value})}
                  max={new Date().toISOString().split('T')[0]}
                />
                <small>When did you start this negative habit tracking?</small>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>{t('habits.color')}</label>
                <input
                  type="color"
                  value={newHabit.color}
                  onChange={(e) => setNewHabit({...newHabit, color: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>{t('habits.frequencyLabel')}</label>
                <select
                  value={newHabit.frequency}
                  onChange={(e) => setNewHabit({...newHabit, frequency: e.target.value})}
                >
                  <option value="daily">{t('habits.daily')}</option>
                  <option value="weekly">{t('habits.weekly')}</option>
                  <option value="monthly">{t('habits.monthly')}</option>
                </select>
              </div>
            </div>

            {/* Gamification Settings */}
            <div className="form-group">
              <label>Difficulty</label>
              <select
                value={newHabit.difficulty}
                onChange={(e) => setNewHabit({...newHabit, difficulty: e.target.value})}
              >
                <option value="easy">🌱 Easy (10 points)</option>
                <option value="medium">🌿 Medium (15 points)</option>
                <option value="hard">🔥 Hard (20 points)</option>
                <option value="expert">⚡ Expert (30 points)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Points per Completion</label>
              <input
                type="number"
                value={newHabit.pointsPerCompletion}
                onChange={(e) => setNewHabit({...newHabit, pointsPerCompletion: parseInt(e.target.value) || 10})}
                min="1"
                max="100"
              />
              <small>Override difficulty settings</small>
            </div>

            <div className="form-actions">
              <button onClick={() => setShowAddForm(false)}>{t('habits.cancel')}</button>
              <button onClick={handleAddHabit} disabled={!newHabit.name.trim()}>
                {editingHabit ? t('habits.update') : t('habits.add')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .habit-tracker {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .tracker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .tracker-header h2 {
          margin: 0;
          color: var(--text-primary);
        }

        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .date-picker, .view-mode-select {
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .add-habit-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: var(--bg-secondary);
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid var(--border-color);
        }

        .stat-card h3 {
          margin: 0 0 10px 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: var(--accent-color);
          margin-bottom: 5px;
        }

        .stat-card p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .week-view {
          margin-bottom: 30px;
        }

        .week-view h3 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
        }

        .week-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
        }

        .day-cell {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 10px;
          text-align: center;
        }

        .day-cell.today {
          border-color: var(--accent-color);
          background: rgba(59, 130, 246, 0.1);
        }

        .day-header {
          display: flex;
          flex-direction: column;
          margin-bottom: 10px;
        }

        .day-name {
          font-weight: bold;
          color: var(--text-primary);
          font-size: 0.8rem;
        }

        .day-date {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .day-habits {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 10px;
        }

        .habit-indicator {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          margin: 0 auto;
        }

        .day-summary {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: bold;
        }

        .habits-list h3 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
        }

        .habits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .habit-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
        }

        .habit-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border-color: var(--accent-color);
        }

        .habit-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--accent-color), var(--accent-color-light, #8b9dc3));
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .habit-card:hover::before {
          opacity: 1;
        }

        .habit-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 15px;
          flex: 1;
        }

        .habit-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .habit-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease;
        }

        .habit-card:hover .habit-icon {
          transform: scale(1.1);
        }

        .habit-details h3 {
          margin: 0 0 8px 0;
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 600;
        }

        .habit-details p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.85rem;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .habit-actions {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: auto;
        }

        .complete-btn {
          width: 65px;
          height: 65px;
          border: 2px solid var(--accent-color);
          border-radius: 12px;
          background: transparent;
          color: var(--accent-color);
          font-size: 28px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .complete-btn:hover {
          transform: scale(1.05);
        }

        .complete-btn.completed {
          background: var(--accent-color);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .edit-btn, .delete-btn {
          width: 48px;
          height: 48px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .edit-btn:hover {
          border-color: var(--accent-color);
          color: var(--accent-color);
          transform: scale(1.05);
        }

        .delete-btn:hover {
          border-color: #ef4444;
          color: #ef4444;
          transform: scale(1.05);
        }

        .habit-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid var(--border-color);
        }

        .stat {
          text-align: center;
          padding: 8px;
          background: var(--bg-primary);
          border-radius: 8px;
          transition: background 0.3s ease;
        }

        .stat:hover {
          background: var(--accent-color);
        }

        .stat:hover .label,
        .stat:hover .value {
          color: white;
        }

        .stat .label {
          display: block;
          font-size: 0.7rem;
          color: var(--text-secondary);
          margin-bottom: 3px;
          font-weight: 500;
        }

        .stat .value {
          font-weight: bold;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: var(--text-secondary);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: var(--bg-primary);
          border-radius: 12px;
          padding: 30px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-content h3 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .icon-selector {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 5px;
        }

        .icon-btn {
          width: 35px;
          height: 35px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-secondary);
          cursor: pointer;
          font-size: 16px;
        }

        .icon-btn.selected {
          border-color: var(--accent-color);
          background: var(--accent-color);
        }

        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .form-actions button {
          padding: 10px 20px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          cursor: pointer;
        }

        .form-actions button:last-child {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
        }

        .form-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Negative Habits Styles */
        .negative-habit {
          border-left: 4px solid #ef4444;
        }

        .negative-habit:hover::before {
          background: linear-gradient(90deg, #ef4444, #f87171);
        }

        .habit-type-badge {
          background: #ef4444;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
          margin-top: 5px;
          display: inline-block;
        }

        .negative-time-display {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          padding: 12px;
          border-radius: 8px;
          margin: 10px 0;
          text-align: center;
        }

        .time-counter {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }

        .time-label {
          font-size: 0.8rem;
          opacity: 0.9;
        }

        .time-value {
          font-size: 1.1rem;
          font-weight: bold;
        }

        .time-details {
          font-size: 0.7rem;
          opacity: 0.8;
        }

        .reset-btn {
          width: 48px;
          height: 48px;
          border: 2px solid #f59e0b;
          border-radius: 8px;
          background: transparent;
          color: #f59e0b;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .reset-btn:hover {
          background: #f59e0b;
          color: white;
          transform: scale(1.05);
        }

        .reset-btn:active {
          transform: scale(0.95);
        }

        @media (max-width: 768px) {
          .tracker-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions {
            flex-wrap: wrap;
          }

          .stats-overview {
            grid-template-columns: repeat(2, 1fr);
          }

          .week-grid {
            grid-template-columns: repeat(7, 1fr);
            gap: 5px;
          }

          .day-cell {
            padding: 5px;
          }

          .habits-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 15px;
          }

          .habit-card {
            padding: 15px;
          }

          .habit-icon {
            width: 50px;
            height: 50px;
            font-size: 24px;
          }

          .habit-details h3 {
            font-size: 1rem;
          }

          .habit-details p {
            font-size: 0.8rem;
          }

          .complete-btn {
            width: 60px;
            height: 60px;
            font-size: 26px;
          }

          .edit-btn, .delete-btn {
            width: 44px;
            height: 44px;
            font-size: 16px;
          }

          .habit-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .stat {
            padding: 6px;
          }

          .stat .label {
            font-size: 0.65rem;
          }

          .stat .value {
            font-size: 0.8rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .icon-selector {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 480px) {
          .habits-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .habit-card {
            padding: 12px;
          }

          .habit-icon {
            width: 45px;
            height: 45px;
            font-size: 20px;
          }

          .habit-details h3 {
            font-size: 0.9rem;
          }

          .habit-details p {
            font-size: 0.75rem;
          }

          .complete-btn {
            width: 40px;
            height: 40px;
            font-size: 18px;
          }

          .edit-btn, .delete-btn {
            width: 28px;
            height: 28px;
            font-size: 11px;
          }

          .habit-stats {
            margin-top: 12px;
            padding-top: 12px;
            gap: 6px;
          }

          .stat {
            padding: 4px;
          }

          .stat .label {
            font-size: 0.6rem;
          }

          .stat .value {
            font-size: 0.75rem;
          }
        }

        /* Gamification Styles */
        .user-level-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 24px;
          color: white;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          grid-column: 1 / -1;
          position: relative;
          overflow: hidden;
        }

        .user-level-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%);
          animation: floatingOrbs 15s ease-in-out infinite;
        }

        .level-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          z-index: 1;
        }

        .level-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.1);
          padding: 12px 20px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .level-number {
          font-size: 2rem;
          font-weight: bold;
          color: #fff;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .level-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .level-progress {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4ade80 0%, #22c55e 100%);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .progress-text {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.9);
          text-align: center;
        }

        .user-points {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          position: relative;
          z-index: 1;
        }

        .points-display, .achievements-count {
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 12px 20px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          flex: 1;
        }

        .points-value, .achievements-value {
          display: block;
          font-size: 1.5rem;
          font-weight: bold;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .points-label, .achievements-label {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.9);
          margin-top: 4px;
        }

        /* Achievement Notification */
        .achievement-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          animation: slideInRight 0.5s ease;
        }

        .achievement-content {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(251, 191, 36, 0.4);
          display: flex;
          align-items: center;
          gap: 16px;
          max-width: 400px;
          position: relative;
        }

        .achievement-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 70%);
          border-radius: 12px;
        }

        .achievement-icon {
          font-size: 2.5rem;
          animation: bounce 2s ease-in-out infinite;
        }

        .achievement-info {
          flex: 1;
        }

        .achievement-info h4 {
          margin: 0 0 8px 0;
          font-size: 1rem;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .achievement-info h5 {
          margin: 0 0 4px 0;
          font-size: 1.1rem;
          font-weight: bold;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .achievement-info p {
          margin: 0 0 8px 0;
          font-size: 0.9rem;
          opacity: 0.9;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .achievement-points {
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .achievement-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          font-size: 1.2rem;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .achievement-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        /* Points Animation */
        .points-animation {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1000;
          pointer-events: none;
        }

        .points-popup {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          font-weight: bold;
          font-size: 1.2rem;
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
          animation: pointsPopup 1s ease-out forwards;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .points-value {
          font-size: 1.8rem;
          display: block;
          margin-bottom: 4px;
        }

        .points-label {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        @keyframes pointsPopup {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1) translateY(-50px);
            opacity: 0;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @keyframes floatingOrbs {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(20px, -20px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 10px) rotate(240deg);
          }
        }

        /* Confetti Animation */
        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
        }

        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24, #f0932b, #e91e63);
          animation: confettiFall 3s linear forwards;
        }

        .confetti-piece:nth-child(1) { left: 10%; animation-delay: 0s; background: #ff6b6b; }
        .confetti-piece:nth-child(2) { left: 20%; animation-delay: 0.1s; background: #4ecdc4; }
        .confetti-piece:nth-child(3) { left: 30%; animation-delay: 0.2s; background: #45b7d1; }
        .confetti-piece:nth-child(4) { left: 40%; animation-delay: 0.3s; background: #f9ca24; }
        .confetti-piece:nth-child(5) { left: 50%; animation-delay: 0.4s; background: #f0932b; }
        .confetti-piece:nth-child(6) { left: 60%; animation-delay: 0.5s; background: #e91e63; }
        .confetti-piece:nth-child(7) { left: 70%; animation-delay: 0.6s; background: #ff6b6b; }
        .confetti-piece:nth-child(8) { left: 80%; animation-delay: 0.7s; background: #4ecdc4; }
        .confetti-piece:nth-child(9) { left: 90%; animation-delay: 0.8s; background: #45b7d1; }
        .confetti-piece:nth-child(10) { left: 95%; animation-delay: 0.9s; background: #f9ca24; }

        @keyframes confettiFall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        /* Animating Habits */
        .habit-card.animating {
          animation: habitComplete 1s ease;
        }

        @keyframes habitComplete {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          }
          100% {
            transform: scale(1);
          }
        }

        /* Responsive for Gamification */
        @media (max-width: 768px) {
          .user-level-card {
            padding: 20px;
          }

          .level-badge {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }

          .user-points {
            flex-direction: column;
            gap: 12px;
          }

          .achievement-notification {
            right: 10px;
            left: 10px;
            max-width: calc(100% - 20px);
          }

          .achievement-content {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .user-level-card {
            padding: 16px;
          }

          .level-number {
            font-size: 1.5rem;
          }

          .level-title {
            font-size: 1rem;
          }

          .points-value, .achievements-value {
            font-size: 1.2rem;
          }

          .achievement-content {
            padding: 16px;
          }

          .achievement-icon {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default HabitTracker;
