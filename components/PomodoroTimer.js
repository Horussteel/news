import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import pomodoroService from '../lib/pomodoroService';
import todoService from '../lib/todoService';

const PomodoroTimer = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(pomodoroService.getSettings());
  const [stats, setStats] = useState(pomodoroService.getStats());
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60); // in seconds
  const [currentSession, setCurrentSession] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [todos, setTodos] = useState([]);
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Load todos for task integration
  useEffect(() => {
    const loadTodos = () => {
      const todosData = todoService.getTodos();
      setTodos(todosData.filter(todo => !todo.completed));
    };
    loadTodos();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadTodos();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for settings changes
  useEffect(() => {
    const handleSettingsChange = (newSettings) => {
      setSettings(newSettings);
    };
    
    pomodoroService.addListener('settingsChanged', handleSettingsChange);
    return () => pomodoroService.removeListener('settingsChanged', handleSettingsChange);
  }, []);

  // Listen for stats changes
  useEffect(() => {
    const handleStatsChange = (newStats) => {
      setStats(newStats);
    };
    
    pomodoroService.addListener('statsChanged', handleStatsChange);
    return () => pomodoroService.removeListener('statsChanged', handleStatsChange);
  }, []);

  // Timer effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Update document title with timer
  useEffect(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const sessionType = currentSession === 'work' ? '🍅 Work' : '☕ Break';
    document.title = `${display} - ${sessionType}`;
    
    return () => {
      document.title = 'AI News';
    };
  }, [timeLeft, currentSession]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    playSound();
    showNotification();
    
    if (currentSession === 'work') {
      const newCompletedPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedPomodoros);
      
      // Record the completed pomodoro
      pomodoroService.recordPomodoro(settings.workDuration);
      
      // Update selected task if exists
      if (selectedTask && settings.taskIntegration) {
        const updatedTodos = todoService.getTodos();
        const task = updatedTodos.find(t => t.id === selectedTask);
        if (task) {
          // Add pomodoro count to task (you might want to extend todo schema)
          task.pomodoroCount = (task.pomodoroCount || 0) + 1;
          todoService.updateTodo(task.id, task);
        }
      }
      
      // Determine next session
      if (newCompletedPomodoros % settings.longBreakInterval === 0) {
        setCurrentSession('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setCurrentSession('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);
      }
      
      if (settings.autoStartBreaks) {
        setTimeout(() => setIsRunning(true), 1000);
      }
    } else {
      // Break is over, start work session
      setCurrentSession('work');
      setTimeLeft(settings.workDuration * 60);
      
      if (settings.autoStartPomodoros) {
        setTimeout(() => setIsRunning(true), 1000);
      }
    }
  };

  const playSound = () => {
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const showNotification = () => {
    if (settings.notificationEnabled && 'Notification' in window && Notification.permission === 'granted') {
      const title = currentSession === 'work' ? 'Time for a break! ☕' : 'Back to work! 🍅';
      const body = currentSession === 'work' 
        ? `Great job! You've completed a Pomodoro session. Time for a ${currentSession === 'longBreak' ? 'long' : 'short'} break.`
        : 'Break time is over. Ready to focus?';
      
      new Notification(title, {
        body,
        icon: '/favicon.ico'
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const toggleTimer = () => {
    if (!isRunning && timeLeft === 0) {
      // Reset timer if it's at 0
      resetTimer();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const duration = currentSession === 'work' 
      ? settings.workDuration 
      : currentSession === 'shortBreak' 
      ? settings.shortBreakDuration 
      : settings.longBreakDuration;
    setTimeLeft(duration * 60);
  };

  const skipSession = () => {
    setIsRunning(false);
    handleSessionComplete();
  };

  const startNewSession = () => {
    setCurrentSession('work');
    setTimeLeft(settings.workDuration * 60);
    setCompletedPomodoros(0);
    setIsRunning(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateSettings = (newSettings) => {
    pomodoroService.saveSettings(newSettings);
  };

  const getSessionType = () => {
    switch (currentSession) {
      case 'work': return { label: t('pomodoro.workSession'), emoji: '🍅', color: '#ef4444' };
      case 'shortBreak': return { label: t('pomodoro.shortBreak'), emoji: '☕', color: '#3b82f6' };
      case 'longBreak': return { label: t('pomodoro.longBreak'), emoji: '🌴', color: '#10b981' };
      default: return { label: t('pomodoro.workSession'), emoji: '🍅', color: '#ef4444' };
    }
  };

  const sessionInfo = getSessionType();
  const progress = ((getSessionDuration() - timeLeft) / getSessionDuration()) * 100;

  function getSessionDuration() {
    switch (currentSession) {
      case 'work': return settings.workDuration * 60;
      case 'shortBreak': return settings.shortBreakDuration * 60;
      case 'longBreak': return settings.longBreakDuration * 60;
      default: return settings.workDuration * 60;
    }
  }

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="pomodoro-timer">
      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE" type="audio/wav" />
      </audio>

      <div className="timer-header">
        <h2>🍅 {t('pomodoro.title')}</h2>
        <div className="header-actions">
          <button onClick={() => setShowSettings(!showSettings)} className="settings-btn">
            ⚙️ {t('pomodoro.settings')}
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <h3>{t('pomodoro.today')}</h3>
          <div className="stat-value">{stats.todayPomodoros}</div>
          <p>{t('pomodoro.pomodoros')}</p>
        </div>
        <div className="stat-card">
          <h3>{t('pomodoro.focusTime')}</h3>
          <div className="stat-value">{Math.floor(stats.todayWorkTime / 60)}h {stats.todayWorkTime % 60}m</div>
          <p>{t('pomodoro.today')}</p>
        </div>
        <div className="stat-card">
          <h3>{t('pomodoro.total')}</h3>
          <div className="stat-value">{stats.totalPomodoros}</div>
          <p>{t('pomodoro.allTime')}</p>
        </div>
        <div className="stat-card">
          <h3>{t('pomodoro.streak')}</h3>
          <div className="stat-value">{stats.streak} 🔥</div>
          <p>{t('pomodoro.days')}</p>
        </div>
      </div>

      {/* Task Integration */}
      {settings.taskIntegration && (
        <div className="task-integration">
          <h3>{t('pomodoro.currentTask')}</h3>
          <select 
            value={selectedTask || ''} 
            onChange={(e) => setSelectedTask(e.target.value || null)}
            className="task-select"
          >
            <option value="">{t('pomodoro.noTaskSelected')}</option>
            {todos.map(todo => (
              <option key={todo.id} value={todo.id}>
                {todo.title} ({todo.pomodoroCount || 0} {t('pomodoro.pomodorosCount')})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main Timer */}
      <div className="timer-display">
        <div className="session-info">
          <span className="session-emoji">{sessionInfo.emoji}</span>
          <span className="session-label">{sessionInfo.label}</span>
        </div>
        
        <div className="timer-circle">
          <svg className="progress-ring" viewBox="0 0 120 120">
            <circle
              className="progress-ring-bg"
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              className="progress-ring-fill"
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={sessionInfo.color}
              strokeWidth="8"
              strokeLinecap="round"
              style={{
                strokeDasharray: `${2 * Math.PI * 54}`,
                strokeDashoffset: `${2 * Math.PI * 54 * (1 - progress / 100)}`,
                transform: 'rotate(-90deg)',
                transformOrigin: '60px 60px'
              }}
            />
          </svg>
          <div className="timer-text">
            <div className="time-display">{formatTime(timeLeft)}</div>
            <div className="session-counter">
              {currentSession === 'work' && `#${completedPomodoros + 1}`}
            </div>
          </div>
        </div>

        <div className="timer-controls">
          <button 
            onClick={toggleTimer} 
            className={`control-btn primary ${isRunning ? 'pause' : 'start'}`}
          >
            {isRunning ? `⏸️ ${t('pomodoro.pause')}` : `▶️ ${t('pomodoro.start')}`}
          </button>
          <button onClick={resetTimer} className="control-btn secondary">
            🔄 {t('pomodoro.reset')}
          </button>
          <button onClick={skipSession} className="control-btn secondary">
            ⏭️ {t('pomodoro.skip')}
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>⚙️ Pomodoro Settings</h3>
            
            <div className="settings-grid">
              <div className="setting-group">
                <label>Work Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.workDuration}
                  onChange={(e) => updateSettings({...settings, workDuration: parseInt(e.target.value) || 25})}
                />
              </div>
              
              <div className="setting-group">
                <label>Short Break (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakDuration}
                  onChange={(e) => updateSettings({...settings, shortBreakDuration: parseInt(e.target.value) || 5})}
                />
              </div>
              
              <div className="setting-group">
                <label>Long Break (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreakDuration}
                  onChange={(e) => updateSettings({...settings, longBreakDuration: parseInt(e.target.value) || 15})}
                />
              </div>
              
              <div className="setting-group">
                <label>Long Break Interval</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={settings.longBreakInterval}
                  onChange={(e) => updateSettings({...settings, longBreakInterval: parseInt(e.target.value) || 4})}
                />
              </div>
            </div>

            <div className="checkbox-settings">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.autoStartBreaks}
                  onChange={(e) => updateSettings({...settings, autoStartBreaks: e.target.checked})}
                />
                Auto-start breaks
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.autoStartPomodoros}
                  onChange={(e) => updateSettings({...settings, autoStartPomodoros: e.target.checked})}
                />
                Auto-start Pomodoros
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateSettings({...settings, soundEnabled: e.target.checked})}
                />
                Enable sound notifications
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.notificationEnabled}
                  onChange={(e) => updateSettings({...settings, notificationEnabled: e.target.checked})}
                />
                Enable browser notifications
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.taskIntegration}
                  onChange={(e) => updateSettings({...settings, taskIntegration: e.target.checked})}
                />
                Integrate with To-Do tasks
              </label>
            </div>

            <div className="settings-actions">
              <button onClick={() => setShowSettings(false)}>Close</button>
              <button 
                onClick={() => {
                  pomodoroService.resetStats();
                  setStats(pomodoroService.getStats());
                }}
                className="danger-btn"
              >
                Reset Statistics
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .pomodoro-timer {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .timer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .timer-header h2 {
          margin: 0;
          color: var(--text-primary);
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .settings-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          color: var(--text-primary);
        }

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
          font-size: 1.8rem;
          font-weight: bold;
          color: var(--accent-color);
          margin-bottom: 5px;
        }

        .stat-card p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.8rem;
        }

        .task-integration {
          background: var(--bg-secondary);
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 30px;
          border: 1px solid var(--border-color);
        }

        .task-integration h3 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
        }

        .task-select {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .timer-display {
          background: var(--bg-secondary);
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          border: 1px solid var(--border-color);
        }

        .session-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .session-emoji {
          font-size: 2rem;
        }

        .session-label {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .timer-circle {
          position: relative;
          width: 240px;
          height: 240px;
          margin: 0 auto 30px;
        }

        .progress-ring {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .timer-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .time-display {
          font-size: 3rem;
          font-weight: bold;
          color: var(--text-primary);
          font-family: 'Courier New', monospace;
        }

        .session-counter {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-top: 5px;
        }

        .timer-controls {
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .control-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 120px;
        }

        .control-btn.primary {
          background: var(--accent-color);
          color: white;
        }

        .control-btn.primary:hover {
          background: #2563eb;
          transform: translateY(-2px);
        }

        .control-btn.secondary {
          background: var(--bg-primary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .control-btn.secondary:hover {
          background: var(--border-color);
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

        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }

        .setting-group {
          display: flex;
          flex-direction: column;
        }

        .setting-group label {
          margin-bottom: 5px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .setting-group input[type="number"] {
          padding: 8px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .checkbox-settings {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-primary);
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
        }

        .settings-actions {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .settings-actions button {
          padding: 10px 20px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          cursor: pointer;
        }

        .danger-btn {
          background: #ef4444 !important;
          color: white !important;
          border-color: #ef4444 !important;
        }

        .danger-btn:hover {
          background: #dc2626 !important;
        }

        @media (max-width: 768px) {
          .timer-header {
            flex-direction: column;
            gap: 15px;
          }

          .stats-overview {
            grid-template-columns: repeat(2, 1fr);
          }

          .timer-circle {
            width: 200px;
            height: 200px;
          }

          .time-display {
            font-size: 2.5rem;
          }

          .timer-controls {
            flex-direction: column;
            align-items: center;
          }

          .control-btn {
            width: 100%;
            max-width: 200px;
          }

          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PomodoroTimer;
