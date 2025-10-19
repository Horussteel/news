import { useState, useEffect, useRef } from 'react';
import meditationService from '../lib/meditationService';
import { useTranslation } from '../contexts/LanguageContext';

const MeditationTimer = () => {
  const { t } = useTranslation();
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [selectedSound, setSelectedSound] = useState('silence');
  const [activeTimer, setActiveTimer] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [meditationStats, setMeditationStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedSession, setCompletedSession] = useState(null);
  const [breathingPhase, setBreathingPhase] = useState('inhale'); // 'inhale', 'hold', 'exhale', 'rest'
  const [breathingCycle, setBreathingCycle] = useState(0);
  const intervalRef = useRef(null);
  const breathingIntervalRef = useRef(null);

  const durations = meditationService.getDurations();
  const ambientSounds = meditationService.getAmbientSounds();
  const settings = meditationService.getMeditationSettings();

  useEffect(() => {
    loadMeditationData();
    
    // Set default values from settings
    if (settings.defaultDuration) {
      setSelectedDuration(settings.defaultDuration);
    }
    if (settings.selectedSound) {
      setSelectedSound(settings.selectedSound);
    }
  }, []);

  useEffect(() => {
    if (activeTimer && isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        const timer = meditationService.getActiveTimer(activeTimer);
        if (timer) {
          setRemainingTime(timer.remainingTime);
          
          if (timer.remainingTime <= 0) {
            handleSessionComplete(timer);
          }
        }
      }, 1000);

      // Start breathing animation
      startBreathingAnimation();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
    };
  }, [activeTimer, isRunning, isPaused]);

  const startBreathingAnimation = () => {
    let phaseTime = 0;
    const phases = {
      inhale: 4000,  // 4 seconds
      hold: 4000,    // 4 seconds
      exhale: 4000,  // 4 seconds
      rest: 2000     // 2 seconds
    };
    
    let currentPhase = 'inhale';
    setBreathingPhase(currentPhase);
    
    breathingIntervalRef.current = setInterval(() => {
      phaseTime += 100;
      
      const phaseDuration = phases[currentPhase];
      if (phaseTime >= phaseDuration) {
        phaseTime = 0;
        
        // Switch to next phase
        switch (currentPhase) {
          case 'inhale':
            currentPhase = 'hold';
            break;
          case 'hold':
            currentPhase = 'exhale';
            break;
          case 'exhale':
            currentPhase = 'rest';
            break;
          case 'rest':
            currentPhase = 'inhale';
            setBreathingCycle(prev => prev + 1);
            break;
        }
        
        setBreathingPhase(currentPhase);
      }
    }, 100);
  };

  const loadMeditationData = () => {
    const stats = meditationService.getMeditationStats();
    const sessions = meditationService.getMeditationSessions();
    
    setMeditationStats(stats);
    
    // Get recent sessions (last 7 days)
    const recent = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (sessions[dateStr]) {
        sessions[dateStr].forEach(session => {
          recent.push(session);
        });
      }
    }
    
    setRecentSessions(recent.slice(-10).reverse()); // Last 10 sessions
  };

  const startMeditation = () => {
    const timerId = meditationService.startMeditation(
      selectedDuration,
      selectedSound,
      (timer) => {
        handleSessionComplete(timer);
      }
    );
    
    setActiveTimer(timerId);
    setIsRunning(true);
    setIsPaused(false);
    setRemainingTime(selectedDuration * 60);
  };

  const pauseMeditation = () => {
    if (activeTimer) {
      meditationService.pauseMeditation(activeTimer);
      setIsPaused(true);
    }
  };

  const resumeMeditation = () => {
    if (activeTimer) {
      meditationService.resumeMeditation(activeTimer);
      setIsPaused(false);
    }
  };

  const stopMeditation = () => {
    if (activeTimer) {
      meditationService.stopMeditation(activeTimer);
      setActiveTimer(null);
      setIsRunning(false);
      setIsPaused(false);
      setRemainingTime(0);
    }
  };

  const handleSessionComplete = (timer) => {
    setActiveTimer(null);
    setIsRunning(false);
    setIsPaused(false);
    setRemainingTime(0);
    setCompletedSession(timer);
    setShowCompletion(true);
    
    // Reload data
    loadMeditationData();
    
    // Hide completion modal after 5 seconds
    setTimeout(() => {
      setShowCompletion(false);
    }, 5000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const updateSetting = (key, value) => {
    meditationService.updateMeditationSetting(key, value);
    loadMeditationData();
  };

  const getSelectedSoundInfo = () => {
    return ambientSounds.find(sound => sound.id === selectedSound) || ambientSounds[0];
  };

  const renderTimerDisplay = () => {
    if (isRunning && !isPaused) {
      // Breathing animation during meditation
      return (
        <div className="breathing-display">
          <div className="breathing-circle-container">
            <div 
              className={`breathing-circle breathing-${breathingPhase}`}
              style={{
                background: getBreathingGradient(),
                transform: `scale(${getBreathingScale()})`,
              }}
            >
              <div className="breathing-text">
                <div className="breathing-phase-text">
                  {getBreathingPhaseText()}
                </div>
                <div className="breathing-timer">
                  {formatTime(remainingTime)}
                </div>
                <div className="meditation-icon">🧘</div>
                {selectedSound !== 'silence' && (
                  <div className="breathing-sound">
                    {getSelectedSoundInfo().icon}
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      );
    } else {
      // Static timer display when not running
      return (
        <div className="timer-display">
          <div className="timer-circle">
            <div className="timer-time">
              {formatTime(remainingTime)}
            </div>
            <div className="timer-duration">
              {selectedDuration} minute{selectedDuration !== 1 ? '' : ''}
            </div>
            {selectedSound !== 'silence' && (
              <div className="timer-sound">
                <span className="sound-icon">{getSelectedSoundInfo().icon}</span>
                <span className="sound-name">{getSelectedSoundInfo().name}</span>
              </div>
            )}
          </div>
          
        </div>
      );
    }
  };

  const getBreathingScale = () => {
    // Keep the same size for all phases - only change color and opacity
    return 1;
  };

  const getBreathingGradient = () => {
    const gradients = {
      inhale: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      hold: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      exhale: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      rest: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    };
    return gradients[breathingPhase] || gradients.inhale;
  };

  const getBreathingPhaseText = () => {
    const texts = {
      inhale: 'Inspira',
      hold: 'Ține',
      exhale: 'Expira',
      rest: 'Relaxează'
    };
    return texts[breathingPhase] || 'Inspira';
  };

  const renderTimerControls = () => (
    <div className="timer-controls">
      {!isRunning ? (
        <button
          onClick={startMeditation}
          className="start-btn"
        >
          🧘‍♀️ Începe Meditația
        </button>
      ) : (
        <div className="active-controls">
          {!isPaused ? (
            <button
              onClick={pauseMeditation}
              className="pause-btn"
            >
              ⏸️ Pauză
            </button>
          ) : (
            <button
              onClick={resumeMeditation}
              className="resume-btn"
            >
              ▶️ Continuă
            </button>
          )}
          <button
            onClick={stopMeditation}
            className="stop-btn"
          >
            ⏹️ Oprește
          </button>
        </div>
      )}
    </div>
  );

  const renderDurationSelector = () => (
    <div className="duration-selector">
      <h3>{t('meditation.selectDuration')}</h3>
      <div className="duration-grid">
        {durations.map(duration => (
          <button
            key={duration.minutes}
            className={`duration-btn ${selectedDuration === duration.minutes ? 'selected' : ''}`}
            onClick={() => setSelectedDuration(duration.minutes)}
            disabled={isRunning}
          >
            <div className="duration-time">{duration.minutes}</div>
            <div className="duration-label">{t(`meditation.${duration.minutes === 3 ? 'shortBreak' : duration.minutes === 5 ? 'quickBreathing' : duration.minutes === 10 ? 'standardSession' : duration.minutes === 15 ? 'deepRelaxation' : duration.minutes === 20 ? 'fullMeditation' : 'longSession'}`)}</div>
            <div className="duration-desc">{t(`meditation.${duration.minutes === 3 ? 'shortBreak' : duration.minutes === 5 ? 'quickBreathing' : duration.minutes === 10 ? 'standardSession' : duration.minutes === 15 ? 'deepRelaxation' : duration.minutes === 20 ? 'fullMeditation' : 'longSession'}`)}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderSoundSelector = () => (
    <div className="sound-selector">
      <h3>{t('meditation.sound')}</h3>
      <div className="sound-grid">
        {ambientSounds.map(sound => (
          <button
            key={sound.id}
            className={`sound-btn ${selectedSound === sound.id ? 'selected' : ''}`}
            onClick={() => setSelectedSound(sound.id)}
            disabled={isRunning}
            style={{
              borderColor: selectedSound === sound.id ? sound.color : 'transparent',
              backgroundColor: selectedSound === sound.id ? `${sound.color}20` : 'transparent',
              color: '#3b82f6'
            }}
          >
            <div className="sound-icon-large">{sound.icon}</div>
            <div className="sound-name" style={{ color: '#3b82f6' }}>
              {sound.id === 'white_noise' ? t('meditation.whiteNoise') : t(`meditation.${sound.id}`)}
            </div>
            <div className="sound-desc" style={{ color: '#3b82f6' }}>
              {sound.id === 'white_noise' ? t('meditation.whiteNoiseDesc') : t(`meditation.${sound.id}Desc`)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStats = () => {
    if (!meditationStats) return null;

    return (
      <div className="meditation-stats">
        <h3>📊 Statistici Meditație</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{meditationStats.totalSessions}</div>
            <div className="stat-label">Sesiuni totale</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatDuration(meditationStats.totalMinutes)}</div>
            <div className="stat-label">Timp total</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{meditationStats.currentStreak} 🔥</div>
            <div className="stat-label">Serie curentă</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{meditationStats.favoriteDuration} min</div>
            <div className="stat-label">Durata preferată</div>
          </div>
        </div>
      </div>
    );
  };

  const renderRecentSessions = () => {
    if (recentSessions.length === 0) {
      return (
        <div className="recent-sessions">
        <h3>🕐 Sesiuni Recente</h3>
          <div className="no-sessions">
            <p>Nu ai nicio sesiune de meditație încă.</p>
            <p>Începe prima ta sesiune pentru a vedea progresul!</p>
          </div>
        </div>
      );
    }

    return (
      <div className="recent-sessions">
        <h3>🕐 {t('meditation.recentSessions')}</h3>
        <div className="sessions-list">
          {recentSessions.map((session, index) => (
            <div key={session.id || index} className="session-item">
              <div className="session-info">
                <div className="session-duration">{session.duration} min</div>
                <div className="session-sound">
                  {ambientSounds.find(s => s.id === session.soundType)?.icon || '🤫'}
                </div>
                <div className="session-time">
                  {new Date(session.startTime).toLocaleTimeString('ro-RO', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div className="session-date">
                {new Date(session.date).toLocaleDateString('ro-RO', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="meditation-settings">
      <h3>⚙️ Setări</h3>
      <div className="settings-list">
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.autoCompleteHabits || false}
              onChange={(e) => updateSetting('autoCompleteHabits', e.target.checked)}
            />
            <span>Completează automat obiceiurile de meditație</span>
          </label>
        </div>
        
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.soundEnabled !== false}
              onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
            />
            <span>Activează sunete de completare</span>
          </label>
        </div>
        
        <div className="setting-item">
          <label>
            Durată implicită:
            <select
              value={settings.defaultDuration || 10}
              onChange={(e) => updateSetting('defaultDuration', parseInt(e.target.value))}
              disabled={isRunning}
            >
              {durations.map(duration => (
                <option key={duration.minutes} value={duration.minutes}>
                  {duration.minutes} minute
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );

  const renderCompletionModal = () => {
    if (!showCompletion || !completedSession) return null;

    return (
      <div className="completion-modal">
        <div className="completion-content">
          <div className="completion-animation">
            <div className="completion-icon">🎉</div>
            <div className="completion-text">
              <h3>Sesiune completată!</h3>
              <p>Ai meditat pentru {completedSession.duration} minute</p>
              {completedSession.soundType !== 'silence' && (
                <p>Cu {getSelectedSoundInfo().name} {getSelectedSoundInfo().icon}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowCompletion(false)}
            className="completion-close"
          >
            Închide
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="meditation-timer">
      <div className="meditation-header">
        <h2>🧘‍♀️ {t('meditation.title')}</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="settings-toggle"
        >
          ⚙️
        </button>
      </div>

      <div className="meditation-content">
        {renderTimerDisplay()}
        {renderTimerControls()}

        {!isRunning && (
          <>
            {renderDurationSelector()}
            {renderSoundSelector()}
          </>
        )}

        {renderStats()}
        {renderRecentSessions()}

        {showSettings && renderSettings()}
      </div>

      {renderCompletionModal()}

      <style jsx>{`
        .meditation-timer {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .meditation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .meditation-header h2 {
          margin: 0;
          color: var(--text-primary);
        }

        .settings-toggle {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .settings-toggle:hover {
          background: var(--accent-color);
          color: white;
        }

        .meditation-content {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        /* Timer Display */
        .timer-display {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 30px;
        }

        .timer-circle {
          position: relative;
          z-index: 2;
          text-align: center;
          background: var(--bg-secondary);
          border-radius: 50%;
          width: 200px;
          height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 3px solid var(--accent-color);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .timer-time {
          font-size: 2.5rem;
          font-weight: bold;
          color: var(--text-primary);
          font-family: 'Courier New', monospace;
          line-height: 1;
        }

        .timer-duration {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-top: 5px;
        }

        .timer-sound {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 8px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .sound-icon {
          font-size: 1rem;
        }


        /* Timer Controls */
        .timer-controls {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }

        .start-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .start-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        .active-controls {
          display: flex;
          gap: 15px;
        }

        .pause-btn, .resume-btn, .stop-btn {
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pause-btn {
          background: #f59e0b;
          color: white;
        }

        .resume-btn {
          background: #10b981;
          color: white;
        }

        .stop-btn {
          background: #ef4444;
          color: white;
        }

        .pause-btn:hover, .resume-btn:hover, .stop-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        /* Duration Selector */
        .duration-selector h3 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
          text-align: center;
        }

        .duration-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
        }

        .duration-btn {
          background: var(--bg-secondary);
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .duration-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .duration-btn.selected {
          border-color: var(--accent-color);
          background: linear-gradient(135deg, var(--accent-color)20, var(--accent-color)10);
          transform: scale(1.05);
        }

        .duration-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .duration-time {
          font-size: 1.8rem;
          font-weight: bold;
          color: var(--text-primary);
          margin-bottom: 5px;
        }

        .duration-label {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 3px;
        }

        .duration-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        /* Sound Selector */
        .sound-selector h3 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
          text-align: center;
        }

        .sound-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 12px;
        }

        .sound-btn {
          background: var(--bg-secondary);
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .sound-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .sound-btn.selected {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .sound-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .sound-icon-large {
          font-size: 2rem;
          margin-bottom: 5px;
        }

        .sound-name {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 3px;
          font-size: 0.9rem;
        }

        .sound-desc {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        /* Stats */
        .meditation-stats h3 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }

        .stat-card {
          background: var(--bg-secondary);
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid var(--border-color);
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: bold;
          color: var(--accent-color);
          margin-bottom: 5px;
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        /* Recent Sessions */
        .recent-sessions h3 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
        }

        .no-sessions {
          text-align: center;
          padding: 40px;
          color: var(--text-secondary);
        }

        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .session-item {
          background: var(--bg-secondary);
          padding: 15px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .session-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .session-duration {
          font-weight: 600;
          color: var(--text-primary);
        }

        .session-sound {
          font-size: 1.2rem;
        }

        .session-time {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .session-date {
          color: var(--text-secondary);
          font-size: 0.8rem;
        }

        /* Settings */
        .meditation-settings h3 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
        }

        .settings-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .setting-item label {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-primary);
          cursor: pointer;
        }

        .setting-item input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .setting-item select {
          margin-left: 10px;
          padding: 5px 8px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        /* Completion Modal */
        .completion-modal {
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
        }

        .completion-content {
          background: var(--bg-primary);
          border-radius: 16px;
          padding: 30px;
          text-align: center;
          max-width: 400px;
          animation: completionBounce 0.5s ease;
        }

        .completion-animation {
          margin-bottom: 20px;
        }

        .completion-icon {
          font-size: 4rem;
          margin-bottom: 15px;
          animation: celebrationPulse 1s ease infinite;
        }

        .completion-text h3 {
          margin: 0 0 10px 0;
          color: var(--text-primary);
          font-size: 1.5rem;
        }

        .completion-text p {
          margin: 5px 0;
          color: var(--text-secondary);
        }

        .completion-close {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          margin-top: 15px;
        }

        @keyframes completionBounce {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes celebrationPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @media (max-width: 768px) {
          .meditation-header {
            text-align: center;
          }

          .timer-circle {
            width: 160px;
            height: 160px;
          }

          .timer-time {
            font-size: 2rem;
          }


          .duration-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .sound-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .active-controls {
            flex-direction: column;
            gap: 10px;
          }

          .session-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }

        /* Breathing Animation Styles */
        .breathing-display {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 30px;
          min-height: 300px;
        }

        .breathing-circle-container {
          position: relative;
          z-index: 10;
        }

        .breathing-circle {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-color)80 100%);
        }

        .breathing-circle::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: rotate 20s linear infinite;
        }

        .breathing-circle.breathing-inhale {
          animation: inhale 4s ease-in-out;
        }

        .breathing-circle.breathing-hold {
          animation: hold 4s ease-in-out;
        }

        .breathing-circle.breathing-exhale {
          animation: exhale 4s ease-in-out;
        }

        .breathing-circle.breathing-rest {
          animation: rest 2s ease-in-out;
        }

        @keyframes inhale {
          0% { opacity: 0.7; }
          100% { opacity: 1; }
        }

        @keyframes hold {
          0% { opacity: 1; }
          100% { opacity: 1; }
        }

        @keyframes exhale {
          0% { opacity: 1; }
          100% { opacity: 0.7; }
        }

        @keyframes rest {
          0% { opacity: 0.7; }
          100% { opacity: 0.7; }
        }

        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .breathing-text {
          text-align: center;
          color: white;
          z-index: 2;
          position: relative;
        }

        .breathing-phase-text {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 10px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .breathing-timer {
          font-size: 1.8rem;
          font-weight: bold;
          font-family: 'Courier New', monospace;
          margin-bottom: 8px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .meditation-icon {
          font-size: 3rem;
          margin-bottom: 10px;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
          animation: float 3s ease-in-out infinite;
          color: white;
          font-weight: bold;
          z-index: 10;
        }

        .breathing-sound {
          font-size: 0.9rem;
          opacity: 0.9;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }


        .breathing-info {
          margin-top: 20px;
          text-align: center;
        }

        .cycle-counter {
          background: var(--bg-secondary);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        @media (max-width: 480px) {
          .meditation-timer {
            padding: 15px;
          }

          .timer-circle {
            width: 140px;
            height: 140px;
          }

          .timer-time {
            font-size: 1.8rem;
          }


          .breathing-circle {
            width: 160px;
            height: 160px;
          }

          .breathing-phase-text {
            font-size: 1rem;
          }

          .breathing-timer {
            font-size: 1.5rem;
          }

          .meditation-icon {
            font-size: 3rem;
            margin-bottom: 8px;
          }


          .duration-grid {
            grid-template-columns: 1fr;
          }

          .sound-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .completion-content {
            margin: 20px;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default MeditationTimer;
