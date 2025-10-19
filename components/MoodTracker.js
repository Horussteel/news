import { useState, useEffect } from 'react';
import moodService from '../lib/moodService';
import { useTranslation } from '../contexts/LanguageContext';

const MoodTracker = () => {
  const { t } = useTranslation();
  const [todayMood, setTodayMood] = useState(null);
  const [selectedMood, setSelectedMood] = useState('');
  const [journalEntry, setJournalEntry] = useState('');
  const [showJournal, setShowJournal] = useState(false);
  const [moodStats, setMoodStats] = useState(null);
  const [moodInsights, setMoodInsights] = useState([]);
  const [showInsights, setShowInsights] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showHistory, setShowHistory] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);

  const moodOptions = moodService.getMoodOptions();

  useEffect(() => {
    loadTodayMood();
    loadMoodStats();
    loadMoodInsights();
  }, []);

  const loadTodayMood = () => {
    const today = moodService.getTodayMood();
    setTodayMood(today);
    if (today) {
      setSelectedMood(today.mood);
      setJournalEntry(today.entry || '');
      setShowJournal(!!today.entry);
    }
  };

  const loadMoodStats = () => {
    const stats = moodService.getMoodStats(30);
    setMoodStats(stats);
  };

  const loadMoodInsights = () => {
    const insights = moodService.getMoodInsights();
    setMoodInsights(insights);
  };

  const handleMoodSelect = (moodId) => {
    setSelectedMood(moodId);
  };

  const handleSaveMood = () => {
    if (!selectedMood) return;

    const entry = showJournal ? journalEntry : '';
    const savedMood = moodService.setMoodEntry(selectedDate, selectedMood, entry);
    
    if (selectedDate === new Date().toISOString().split('T')[0]) {
      setTodayMood(savedMood);
    }
    
    loadMoodStats();
    loadMoodInsights();
    
    // Show success feedback
    const moodOption = moodOptions.find(m => m.id === selectedMood);
    if (moodOption) {
      showMoodSavedAnimation(moodOption);
    }
  };

  const showMoodSavedAnimation = (moodOption) => {
    // Create a simple animation
    const animation = document.createElement('div');
    animation.className = 'mood-saved-animation';
    animation.innerHTML = `
      <div class="mood-popup">
        <div class="mood-emoji">${moodOption.emoji}</div>
        <div class="mood-text">Stare salvată!</div>
      </div>
    `;
    
    document.body.appendChild(animation);
    
    setTimeout(() => {
      if (document.body.contains(animation)) {
        document.body.removeChild(animation);
      }
    }, 2000);
  };

  const handleDeleteMood = () => {
    if (confirm('Ești sigur că vrei să ștergi starea pentru această zi?')) {
      moodService.deleteMoodEntry(selectedDate);
      
      if (selectedDate === new Date().toISOString().split('T')[0]) {
        setTodayMood(null);
        setSelectedMood('');
        setJournalEntry('');
        setShowJournal(false);
      }
      
      loadMoodStats();
      loadMoodInsights();
    }
  };

  const loadMoodHistory = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const history = moodService.getMoodHistory(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
    
    setMoodHistory(history.reverse());
    setShowHistory(true);
  };

  const getMoodEmoji = (moodId) => {
    const mood = moodOptions.find(m => m.id === moodId);
    return mood ? mood.emoji : '😐';
  };

  const getMoodColor = (moodId) => {
    const mood = moodOptions.find(m => m.id === moodId);
    return mood ? mood.color : '#6b7280';
  };

  const getMoodLabel = (moodId) => {
    const mood = moodOptions.find(m => m.id === moodId);
    return mood ? mood.label : 'Necunoscut';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ro-RO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderMoodSelector = () => (
    <div className="mood-selector">
      <h3>{t('mood.howDoYouFeel')}</h3>
      <div className="mood-grid">
        {moodOptions.map(mood => (
          <button
            key={mood.id}
            className={`mood-btn ${selectedMood === mood.id ? 'selected' : ''}`}
            onClick={() => handleMoodSelect(mood.id)}
            data-mood={mood.id}
            style={{
              borderColor: selectedMood === mood.id ? mood.color : 'transparent',
              backgroundColor: selectedMood === mood.id ? `${mood.color}20` : 'transparent',
              color: '#4c1d95'
            }}
          >
            <div className="mood-emoji-large">{mood.emoji}</div>
            <div className="mood-label" style={{ color: '#4c1d95' }}>{mood.label}</div>
            <div className="mood-description" style={{ color: '#4c1d95' }}>{mood.description}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderJournalSection = () => (
    <div className="journal-section">
      <div className="journal-header">
        <label className="journal-toggle">
          <input
            type="checkbox"
            checked={showJournal}
            onChange={(e) => setShowJournal(e.target.checked)}
          />
          <span>Adaugă un jurnal (opțional)</span>
        </label>
      </div>
      
      {showJournal && (
        <div className="journal-content">
          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            placeholder="Ce s-a întâmplat astăzi? Cum te simți? Ce ai făcut..."
            className="journal-textarea"
            rows={4}
          />
        </div>
      )}
    </div>
  );

  const renderMoodStats = () => {
    if (!moodStats || moodStats.totalEntries === 0) {
      return (
        <div className="mood-stats-empty">
          <p>Încă nu ai înregistrat nicio stare emoțională.</p>
          <p>Începe să adaugi stări zilnice pentru a vedea statistici!</p>
        </div>
      );
    }

    return (
      <div className="mood-stats">
        <h3>{t('mood.statsLast30Days')}</h3>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{moodStats.totalEntries}</div>
            <div className="stat-label">Zile înregistrate</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{moodStats.currentStreak}</div>
            <div className="stat-label">Serie curentă 🔥</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{moodStats.averageMood.toFixed(1)}/5</div>
            <div className="stat-label">Stare medie</div>
          </div>
        </div>

        <div className="mood-distribution">
          <h4>{t('mood.moodDistributionLabel')}</h4>
          <div className="distribution-list">
            {Object.entries(moodStats.moodDistribution)
              .filter(([, data]) => data.count > 0)
              .sort(([,a], [,b]) => b.count - a.count)
              .map(([moodId, data]) => (
                <div key={moodId} className="distribution-item">
                  <div className="mood-info">
                    <span className="mood-emoji">{data.mood.emoji}</span>
                    <span className="mood-name">{data.mood.label}</span>
                  </div>
                  <div className="mood-bar">
                    <div 
                      className="mood-bar-fill"
                      style={{ 
                        width: `${data.percentage}%`,
                        backgroundColor: data.mood.color
                      }}
                    />
                  </div>
                  <div className="mood-percentage">{data.percentage}%</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMoodInsights = () => {
    return (
      <div className="mood-insights">
        <h3>📊 Insights & Perspective</h3>
        
        {/* 7-Day Calendar Heatmap */}
        <div className="mood-calendar-section">
          <h4>Calendarul stărilor - Ultimele 7 zile</h4>
          <div className="mood-calendar">
            {getLast7DaysData().map((day, index) => (
              <div key={index} className="calendar-day">
                <div 
                  className={`calendar-date ${day.isToday ? 'today' : ''} ${day.hasMood ? 'has-mood' : 'no-mood'}`}
                  style={{
                    backgroundColor: day.hasMood ? getMoodColor(day.mood) : 'var(--bg-secondary)',
                    borderColor: day.isToday ? 'var(--accent-color)' : 'var(--border-color)'
                  }}
                  title={`${day.dateStr}: ${day.hasMood ? getMoodLabel(day.mood) : 'Nicio înregistrare'}`}
                >
                  <div className="calendar-emoji">
                    {day.hasMood ? getMoodEmoji(day.mood) : '•'}
                  </div>
                  <div className="calendar-day-name">
                    {day.dayName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mood Distribution Charts */}
        {moodStats && moodStats.totalEntries > 0 ? (
          <div className="mood-charts-container">
            <div className="mood-chart-section">
              <h4>Grafic cu bare - Distribuția stărilor</h4>
              <div className="mood-chart">
                <div className="chart-container">
                  {renderMoodChart()}
                </div>
                <div className="chart-legend">
                  {Object.entries(moodStats.moodDistribution)
                    .filter(([, data]) => data.count > 0)
                    .map(([moodId, data]) => (
                      <div key={moodId} className="legend-item">
                        <div 
                          className="legend-color"
                          style={{ backgroundColor: data.mood.color }}
                        />
                        <span className="legend-text">
                          {data.mood.emoji} {data.mood.label}
                        </span>
                        <span className="legend-count">{data.count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mood-chart-section">
              <h4>Grafic cu linii - Evoluția stărilor</h4>
              <div className="mood-chart">
                <div className="chart-container">
                  {renderMoodLineChart()}
                </div>
                <div className="chart-legend">
                  {Object.entries(moodStats.moodDistribution)
                    .filter(([, data]) => data.count > 0)
                    .map(([moodId, data]) => (
                      <div key={moodId} className="legend-item">
                        <div 
                          className="legend-color"
                          style={{ backgroundColor: data.mood.color }}
                        />
                        <span className="legend-text">
                          {data.mood.emoji} {data.mood.label}
                        </span>
                        <span className="legend-count">{data.count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-charts-message">
            <div className="message-card">
              <div className="message-icon">📊</div>
              <h3>Nicio înregistrat încă</h3>
              <p>Adaugă stări emoționale zilnice pentru a vedea graficele și insights!</p>
              <div className="message-tip">
                <span>💡 Sfat:</span> Începe cu înregistrarea stării de azi și continuă zilnic pentru a vedea evoluția!
              </div>
            </div>
          </div>
        )}

        {/* Traditional Insights */}
        {moodInsights.length > 0 && (
          <div className="traditional-insights">
            <h4>Analize personalizate</h4>
            <div className="insights-list">
              {moodInsights.map((insight, index) => (
                <div key={index} className={`insight-card insight-${insight.type}`}>
                  <div className="insight-icon">{insight.icon}</div>
                  <div className="insight-content">
                    <h4>{insight.title}</h4>
                    <p>{insight.description}</p>
                    {insight.data && (
                      <div className="insight-data">{insight.data}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Summary */}
        {renderWeeklySummary()}
      </div>
    );
  };

  const getLast7DaysData = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('ro-RO', { weekday: 'short' });
      
      const moodEntry = moodService.getMoodEntry(dateStr);
      
      days.push({
        dateStr,
        dayName,
        hasMood: !!moodEntry,
        mood: moodEntry?.mood || null,
        isToday: i === 0
      });
    }
    
    return days;
  };

  const renderMoodChart = () => {
    if (!moodStats || moodStats.totalEntries === 0) return null;

    const chartData = Object.entries(moodStats.moodDistribution)
      .filter(([, data]) => data.count > 0)
      .sort(([,a], [,b]) => b.count - a.count);

    const maxCount = Math.max(...chartData.map(([, data]) => data.count));
    
    return (
      <div className="bar-chart">
        {chartData.map(([moodId, data]) => (
          <div key={moodId} className="chart-bar-container">
            <div className="chart-bar">
              <div 
                className="chart-bar-fill"
                style={{ 
                  height: `${(data.count / maxCount) * 100}%`,
                  backgroundColor: data.mood.color
                }}
              />
            </div>
            <div className="chart-bar-emoji">
              {data.mood.emoji}
            </div>
            <div className="chart-bar-value">
              {data.count}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMoodLineChart = () => {
    if (!moodStats || moodStats.totalEntries === 0) return null;

    // Get mood history for the last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const history = moodService.getMoodHistory(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    if (history.length === 0) return null;

    // Convert mood data to numerical values for line chart
    const moodValues = {
      'amazing': 5,
      'good': 4,
      'ok': 3,
      'bad': 2,
      'angry': 1,
      'sad': 2,
      'anxious': 2,
      'tired': 2
    };

    // Prepare chart data
    const chartData = history.map(entry => ({
      date: new Date(entry.date),
      value: moodValues[entry.mood] || 3,
      mood: entry.mood,
      emoji: getMoodEmoji(entry.mood),
      color: getMoodColor(entry.mood)
    })).reverse(); // Show oldest to newest

    // Calculate chart dimensions
    const width = 280;
    const height = 200;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Calculate scales
    const maxValue = 5;
    const minValue = 1;
    const valueRange = maxValue - minValue;
    
    const dateRange = chartData[chartData.length - 1].date - chartData[0].date;
    const xScale = (date) => ((date - chartData[0].date) / dateRange) * chartWidth + padding;
    const yScale = (value) => padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;

    // Create path for the line
    const pathData = chartData.map((point, index) => {
      const x = xScale(point.date);
      const y = yScale(point.value);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');

    return (
      <div className="line-chart">
        <svg viewBox={`0 0 ${width} ${height}`} className="line-chart-svg">
          {/* Grid lines */}
          {[1, 2, 3, 4, 5].map(value => (
            <line
              key={value}
              x1={padding}
              y1={yScale(value)}
              x2={width - padding}
              y2={yScale(value)}
              stroke="var(--border-color)"
              strokeWidth="1"
              strokeDasharray="2,2"
              className="grid-line"
            />
          ))}
          
          {/* Y-axis labels */}
          {[1, 2, 3, 4, 5].map(value => (
            <text
              key={value}
              x={padding - 5}
              y={yScale(value) + 4}
              textAnchor="end"
              fontSize="10"
              fill="var(--text-secondary)"
              className="axis-label"
            >
              {value}
            </text>
          ))}
          
          {/* The line */}
          <path
            d={pathData}
            fill="none"
            stroke="var(--accent-color)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="chart-line"
          />
          
          {/* Area under the line */}
          <path
            d={`${pathData} L ${xScale(chartData[chartData.length - 1].date)} ${height - padding} L ${xScale(chartData[0].date)} ${height - padding} Z`}
            fill="url(#gradient)"
            opacity="0.3"
            className="chart-area"
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Data points */}
          {chartData.map((point, index) => (
            <g key={index} className="data-point">
              <circle
                cx={xScale(point.date)}
                cy={yScale(point.value)}
                r="4"
                fill={point.color}
                stroke="white"
                strokeWidth="2"
                className="point-circle"
              />
              {chartData.length <= 15 && (
                <text
                  x={xScale(point.date)}
                  y={yScale(point.value) - 8}
                  textAnchor="middle"
                  fontSize="12"
                  className="point-emoji"
                >
                  {point.emoji}
                </text>
              )}
            </g>
          ))}
          
          {/* X-axis labels (show every few days to avoid crowding) */}
          {chartData.filter((_, index) => index % Math.ceil(chartData.length / 8) === 0 || index === chartData.length - 1).map((point, index) => (
            <text
              key={index}
              x={xScale(point.date)}
              y={height - padding + 15}
              textAnchor="middle"
              fontSize="9"
              fill="var(--text-secondary)"
              className="axis-label"
            >
              {point.date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}
            </text>
          ))}
        </svg>
        
        {/* Chart title */}
        <div className="chart-title">
          <span>Evoluția stărilor emoționale (ultimele {chartData.length} zile)</span>
        </div>
      </div>
    );
  };

  const renderWeeklySummary = () => {
    const weekData = getLast7DaysData();
    const moodDays = weekData.filter(day => day.hasMood);
    
    if (moodDays.length === 0) return null;

    const moodCounts = {};
    moodDays.forEach(day => {
      moodCounts[day.mood] = (moodCounts[day.mood] || 0) + 1;
    });

    const predominantMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (!predominantMood) return null;

    const [moodId, count] = predominantMood;
    const mood = moodOptions.find(m => m.id === moodId);

    return (
      <div className="weekly-summary">
        <h4>📈 Sumar săptămânal</h4>
        <div className="summary-card">
          <div className="summary-mood">
            <span className="summary-emoji">{mood.emoji}</span>
            <div className="summary-text">
              <div className="summary-title">Starea predominantă</div>
              <div className="summary-value">{mood.label}</div>
              <div className="summary-detail">În {count} din {moodDays.length} zile</div>
            </div>
          </div>
          <div className="summary-stats">
            <div className="summary-stat">
              <div className="stat-label">Zile înregistrate</div>
              <div className="stat-value">{moodDays.length}/7</div>
            </div>
            <div className="summary-stat">
              <div className="stat-label">Tendință</div>
              <div className="stat-value">{getWeeklyTrend()}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getWeeklyTrend = () => {
    const weekData = getLast7DaysData();
    const moodDays = weekData.filter(day => day.hasMood);
    
    if (moodDays.length < 3) return '⚪ Date insuficiente';

    const moodValues = {
      'amazing': 5,
      'good': 4,
      'ok': 3,
      'bad': 2,
      'angry': 1,
      'sad': 2,
      'anxious': 2,
      'tired': 2
    };

    const recentDays = moodDays.slice(-3);
    const olderDays = moodDays.slice(0, -3);

    if (olderDays.length === 0) return '🔵 Analiză în curs';

    const recentAvg = recentDays.reduce((sum, day) => sum + (moodValues[day.mood] || 3), 0) / recentDays.length;
    const olderAvg = olderDays.reduce((sum, day) => sum + (moodValues[day.mood] || 3), 0) / olderDays.length;

    if (recentAvg > olderAvg + 0.5) return '📈 Îmbunătățire';
    if (recentAvg < olderAvg - 0.5) return '📉 Scădere';
    return '➡️ Stabil';
  };

  const renderMoodHistory = () => {
    if (!showHistory) return null;

    return (
      <div className="mood-history-modal">
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Istoricul stărilor emoționale</h3>
              <button className="close-btn" onClick={() => setShowHistory(false)}>×</button>
            </div>
            
            <div className="history-list">
              {moodHistory.length === 0 ? (
                <div className="empty-history">
                  <p>Nu există înregistrări în ultimele 30 de zile.</p>
                </div>
              ) : (
                moodHistory.map(entry => (
                  <div key={entry.date} className="history-item">
                    <div className="history-date">
                      {formatDate(entry.date)}
                    </div>
                    <div className="history-mood">
                      <span 
                        className="mood-emoji"
                        style={{ backgroundColor: getMoodColor(entry.mood) }}
                      >
                        {getMoodEmoji(entry.mood)}
                      </span>
                      <span className="mood-label">{getMoodLabel(entry.mood)}</span>
                    </div>
                    {entry.entry && (
                      <div className="history-entry">
                        <p>{entry.entry}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const hasUnsavedChanges = (selectedMood && (!todayMood || todayMood.mood !== selectedMood || todayMood.entry !== journalEntry));

  return (
    <div className="mood-tracker">
      <div className="mood-header">
        <h2>😌 Jurnal Emoțional</h2>
        <div className="header-actions">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="date-picker"
          />
          <button
            onClick={loadMoodHistory}
            className="history-btn"
          >
            📊 Istoric
          </button>
        </div>
      </div>

      <div className="mood-content">
        {renderMoodSelector()}
        
        {selectedMood && renderJournalSection()}
        
        {selectedMood && (
          <div className="mood-actions">
            <button
              onClick={handleSaveMood}
              className="save-mood-btn"
              disabled={!hasUnsavedChanges}
            >
              💾 Salvează starea
            </button>
            
            {todayMood && isToday && (
              <button
                onClick={handleDeleteMood}
                className="delete-mood-btn"
              >
                🗑️ Șterge
              </button>
            )}
          </div>
        )}

        {todayMood && isToday && (
          <div className="today-mood-summary">
            <h3 style={{ color: 'white' }}>Astăzi te simți:</h3>
            <div className="mood-summary">
              <span className="mood-emoji-large">{getMoodEmoji(todayMood.mood)}</span>
              <span className="mood-label" style={{ color: 'white' }}>{getMoodLabel(todayMood.mood)}</span>
            </div>
            {todayMood.entry && (
              <div className="mood-journal-summary">
                <p style={{ color: 'white' }}>{todayMood.entry}</p>
              </div>
            )}
          </div>
        )}

        <div className="mood-sections">
          {showInsights && renderMoodInsights()}
          {renderMoodStats()}
        </div>
      </div>

      {renderMoodHistory()}

      <style jsx>{`
        .mood-tracker {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .mood-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .mood-header h2 {
          margin: 0;
          color: var(--text-primary);
        }

        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .date-picker, .history-btn {
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-primary);
          color: var(--text-primary);
          cursor: pointer;
        }

        .history-btn {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
        }

        .mood-selector h3 {
          text-align: center;
          margin-bottom: 20px;
          color: var(--text-primary);
        }

        .mood-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }

        .mood-btn {
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 15px;
          background: var(--bg-secondary);
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .mood-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .mood-btn.selected {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        /* Light mode specific colors for mood buttons */
        .mood-btn[data-mood="amazing"] {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border-color: #10b981;
        }

        .mood-btn[data-mood="amazing"] .mood-label,
        .mood-btn[data-mood="amazing"] .mood-description {
          color: #4c1d95 !important;
        }

        .mood-btn[data-mood="good"] {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-color: #3b82f6;
        }

        .mood-btn[data-mood="good"] .mood-label,
        .mood-btn[data-mood="good"] .mood-description {
          color: #4c1d95 !important;
        }

        .mood-btn[data-mood="ok"] {
          background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
          border-color: #f59e0b;
        }

        .mood-btn[data-mood="ok"] .mood-label,
        .mood-btn[data-mood="ok"] .mood-description {
          color: #4c1d95 !important;
        }

        .mood-btn[data-mood="bad"] {
          background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
          border-color: #ef4444;
        }

        .mood-btn[data-mood="bad"] .mood-label,
        .mood-btn[data-mood="bad"] .mood-description {
          color: #4c1d95 !important;
        }

        .mood-btn[data-mood="angry"] {
          background: linear-gradient(135deg, #fca5a5 0%, #f87171 100%);
          border-color: #dc2626;
        }

        .mood-btn[data-mood="angry"] .mood-label,
        .mood-btn[data-mood="angry"] .mood-description {
          color: #4c1d95 !important;
        }

        .mood-btn[data-mood="sad"] {
          background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
          border-color: #6b7280;
        }

        .mood-btn[data-mood="sad"] .mood-label,
        .mood-btn[data-mood="sad"] .mood-description {
          color: #4c1d95 !important;
        }

        .mood-btn[data-mood="anxious"] {
          background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%);
          border-color: #8b5cf6;
        }

        .mood-btn[data-mood="anxious"] .mood-label,
        .mood-btn[data-mood="anxious"] .mood-description {
          color: #4c1d95 !important;
        }

        .mood-btn[data-mood="tired"] {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          border-color: #64748b;
        }

        .mood-btn[data-mood="tired"] .mood-label,
        .mood-btn[data-mood="tired"] .mood-description {
          color: #4c1d95 !important;
        }

        /* Dark mode specific colors for mood buttons */
        [data-theme="dark"] .mood-btn {
          background: var(--bg-secondary);
          border-width: 2px;
        }

        [data-theme="dark"] .mood-btn[data-mood="amazing"] {
          background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
          border-color: #10b981;
        }

        [data-theme="dark"] .mood-btn[data-mood="amazing"] .mood-label,
        [data-theme="dark"] .mood-btn[data-mood="amazing"] .mood-description {
          color: #d1fae5 !important;
        }

        [data-theme="dark"] .mood-btn[data-mood="good"] {
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
          border-color: #3b82f6;
        }

        [data-theme="dark"] .mood-btn[data-mood="good"] .mood-label,
        [data-theme="dark"] .mood-btn[data-mood="good"] .mood-description {
          color: #dbeafe !important;
        }

        [data-theme="dark"] .mood-btn[data-mood="ok"] {
          background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
          border-color: #f59e0b;
        }

        [data-theme="dark"] .mood-btn[data-mood="ok"] .mood-label,
        [data-theme="dark"] .mood-btn[data-mood="ok"] .mood-description {
          color: #fed7aa !important;
        }

        [data-theme="dark"] .mood-btn[data-mood="bad"] {
          background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
          border-color: #ef4444;
        }

        [data-theme="dark"] .mood-btn[data-mood="bad"] .mood-label,
        [data-theme="dark"] .mood-btn[data-mood="bad"] .mood-description {
          color: #fecaca !important;
        }

        [data-theme="dark"] .mood-btn[data-mood="angry"] {
          background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
          border-color: #dc2626;
        }

        [data-theme="dark"] .mood-btn[data-mood="angry"] .mood-label,
        [data-theme="dark"] .mood-btn[data-mood="angry"] .mood-description {
          color: #fecaca !important;
        }

        [data-theme="dark"] .mood-btn[data-mood="sad"] {
          background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
          border-color: #6b7280;
        }

        [data-theme="dark"] .mood-btn[data-mood="sad"] .mood-label,
        [data-theme="dark"] .mood-btn[data-mood="sad"] .mood-description {
          color: #d1d5db !important;
        }

        [data-theme="dark"] .mood-btn[data-mood="anxious"] {
          background: linear-gradient(135deg, #581c87 0%, #6b21a8 100%);
          border-color: #8b5cf6;
        }

        [data-theme="dark"] .mood-btn[data-mood="anxious"] .mood-label,
        [data-theme="dark"] .mood-btn[data-mood="anxious"] .mood-description {
          color: #e9d5ff !important;
        }

        [data-theme="dark"] .mood-btn[data-mood="tired"] {
          background: linear-gradient(135deg, #334155 0%, #475569 100%);
          border-color: #64748b;
        }

        [data-theme="dark"] .mood-btn[data-mood="tired"] .mood-label,
        [data-theme="dark"] .mood-btn[data-mood="tired"] .mood-description {
          color: #f1f5f9 !important;
        }

        .mood-emoji-large {
          font-size: 3.5rem;
          margin-bottom: 10px;
          transition: transform 0.2s ease;
        }

        .mood-btn:hover .mood-emoji-large {
          transform: scale(1.1);
        }

        .mood-label {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .mood-description {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        /* Override text colors for mood buttons with higher specificity */
        .mood-tracker .mood-btn .mood-label {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .mood-tracker .mood-btn .mood-description {
          font-size: 0.8rem;
        }

        .journal-section {
          margin-bottom: 30px;
        }

        .journal-header {
          margin-bottom: 15px;
        }

        .journal-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: var(--text-primary);
        }

        .journal-toggle input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .journal-content {
          animation: slideDown 0.3s ease;
        }

        .journal-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-family: inherit;
          resize: vertical;
          min-height: 100px;
        }

        .mood-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 30px;
        }

        .save-mood-btn, .delete-mood-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .save-mood-btn {
          background: var(--accent-color);
          color: white;
        }

        .save-mood-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .delete-mood-btn {
          background: #ef4444;
          color: white;
        }

        .save-mood-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .delete-mood-btn:hover {
          background: #dc2626;
          transform: translateY(-2px);
        }

        .today-mood-summary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 30px;
          text-align: center;
        }

        .today-mood-summary h3 {
          margin: 0 0 15px 0;
        }

        .mood-summary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .mood-summary .mood-emoji-large {
          font-size: 3rem;
        }

        .mood-summary .mood-label {
          font-size: 1.2rem;
          font-weight: 600;
        }

        .mood-journal-summary {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }

        .mood-journal-summary p {
          margin: 0;
          font-style: italic;
        }

        .mood-sections {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .mood-insights h3,
        .mood-stats h3 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
        }

        .insights-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .insight-card {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 15px;
          border-radius: 8px;
          background: var(--bg-secondary);
          border-left: 4px solid;
        }

        .insight-positive {
          border-left-color: #10b981;
        }

        .insight-warning {
          border-left-color: #f59e0b;
        }

        .insight-achievement {
          border-left-color: #8b5cf6;
        }

        .insight-pattern {
          border-left-color: #3b82f6;
        }

        .insight-info {
          border-left-color: #6b7280;
        }

        .insight-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .insight-content h4 {
          margin: 0 0 8px 0;
          color: var(--text-primary);
        }

        .insight-content p {
          margin: 0 0 8px 0;
          color: var(--text-secondary);
        }

        .insight-data {
          font-size: 0.9rem;
          color: var(--accent-color);
          font-weight: 500;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: var(--bg-secondary);
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid var(--border-color);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: var(--accent-color);
          margin-bottom: 5px;
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .mood-distribution h4 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
        }

        .distribution-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .distribution-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 10px;
          background: var(--bg-secondary);
          border-radius: 6px;
        }

        .mood-info {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 120px;
        }

        .mood-info .mood-emoji {
          font-size: 1.2rem;
        }

        .mood-info .mood-name {
          color: var(--text-primary);
          font-weight: 500;
        }

        .mood-bar {
          flex: 1;
          height: 8px;
          background: var(--border-color);
          border-radius: 4px;
          overflow: hidden;
        }

        .mood-bar-fill {
          height: 100%;
          transition: width 0.5s ease;
        }

        .mood-percentage {
          min-width: 40px;
          text-align: right;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .mood-stats-empty {
          text-align: center;
          padding: 40px;
          color: var(--text-secondary);
        }

        .mood-history-modal .modal-overlay {
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
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-header h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .history-list {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .history-item {
          padding: 15px;
          border-bottom: 1px solid var(--border-color);
        }

        .history-item:last-child {
          border-bottom: none;
        }

        .history-date {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .history-mood {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .history-mood .mood-emoji {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .history-mood .mood-label {
          color: var(--text-primary);
          font-weight: 500;
        }

        .history-entry {
          background: var(--bg-secondary);
          padding: 10px;
          border-radius: 6px;
        }

        .history-entry p {
          margin: 0;
          color: var(--text-secondary);
          font-style: italic;
        }

        .empty-history {
          text-align: center;
          padding: 40px;
          color: var(--text-secondary);
        }

        .mood-saved-animation {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1000;
          pointer-events: none;
        }

        .mood-popup {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 20px 30px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
          animation: moodPopup 2s ease-out forwards;
        }

        .mood-popup .mood-emoji {
          font-size: 3rem;
          margin-bottom: 10px;
        }

        .mood-popup .mood-text {
          font-size: 1.2rem;
          font-weight: 600;
        }

        @keyframes moodPopup {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1) translateY(-30px);
            opacity: 0;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .mood-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions {
            justify-content: center;
          }

          .mood-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .mood-btn {
            padding: 12px;
          }

          .mood-emoji-large {
            font-size: 2rem;
          }

          .mood-label {
            font-size: 0.9rem;
          }

          .mood-description {
            font-size: 0.7rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .distribution-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .mood-info {
            min-width: auto;
          }

          .mood-bar {
            width: 100%;
          }

          .mood-percentage {
            text-align: left;
          }

          .modal-content {
            margin: 10px;
            max-height: calc(100vh - 20px);
          }
        }

        /* Calendar Heatmap Styles */
        .mood-calendar-section {
          margin-bottom: 30px;
        }

        .mood-calendar-section h4 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
          text-align: center;
        }

        .mood-calendar {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }

        .calendar-day {
          text-align: center;
        }

        .calendar-date {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          border: 2px solid var(--border-color);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          margin: 0 auto;
        }

        .calendar-date:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .calendar-date.today {
          border-color: var(--accent-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .calendar-date.has-mood {
          color: white;
          font-weight: 600;
        }

        .calendar-date.no-mood {
          background: var(--bg-secondary);
          color: var(--text-secondary);
        }

        .calendar-emoji {
          font-size: 1.5rem;
          margin-bottom: 2px;
        }

        .calendar-day-name {
          font-size: 0.7rem;
          font-weight: 500;
        }

        /* Charts Container */
        .mood-charts-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        /* Chart Styles */
        .mood-chart-section {
          margin-bottom: 0;
        }

        .mood-chart-section h4 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
          text-align: center;
        }

        .mood-chart {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid var(--border-color);
        }

        .chart-container {
          margin-bottom: 20px;
        }

        .bar-chart {
          display: flex;
          align-items: end;
          justify-content: space-around;
          height: 200px;
          gap: 15px;
          padding: 10px;
        }

        .chart-bar-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          max-width: 80px;
        }

        .chart-bar {
          width: 100%;
          height: 150px;
          background: var(--border-color);
          border-radius: 6px 6px 0 0;
          position: relative;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .chart-bar-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          border-radius: 6px 6px 0 0;
          transition: height 0.8s ease;
          background: linear-gradient(to top, var(--accent-color), var(--accent-color)80);
        }

        .chart-bar-emoji {
          font-size: 1.2rem;
          margin-bottom: 4px;
        }

        .chart-bar-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .chart-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          justify-content: center;
          padding-top: 15px;
          border-top: 1px solid var(--border-color);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px;
          background: var(--bg-primary);
          border-radius: 6px;
          border: 1px solid var(--border-color);
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .legend-text {
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .legend-count, .legend-percentage {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        /* Line Chart Styles */
        .line-chart {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 200px;
          position: relative;
        }

        .line-chart-svg {
          width: 100%;
          height: 180px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .chart-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawLine 2s ease forwards;
        }

        .chart-area {
          opacity: 0;
          animation: fadeInArea 1s ease 0.5s forwards;
        }

        .data-point {
          opacity: 0;
          animation: fadeInPoint 0.5s ease forwards;
        }

        .data-point:nth-child(1) { animation-delay: 0.8s; }
        .data-point:nth-child(2) { animation-delay: 0.9s; }
        .data-point:nth-child(3) { animation-delay: 1.0s; }
        .data-point:nth-child(4) { animation-delay: 1.1s; }
        .data-point:nth-child(5) { animation-delay: 1.2s; }
        .data-point:nth-child(n+6) { animation-delay: 1.3s; }

        .point-circle {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .point-circle:hover {
          r: 6;
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
        }

        .point-emoji {
          opacity: 0;
          animation: fadeIn 0.5s ease forwards;
        }

        .grid-line {
          opacity: 0.3;
          transition: opacity 0.3s ease;
        }

        .grid-line:hover {
          opacity: 0.6;
        }

        .axis-label {
          font-size: 10px;
          opacity: 0.7;
        }

        .chart-title {
          margin-top: 10px;
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes fadeInArea {
          to {
            opacity: 0.3;
          }
        }

        @keyframes fadeInPoint {
          to {
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          to {
            opacity: 0.8;
          }
        }

        /* Pie Chart Styles */
        .pie-chart {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
        }

        .pie-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
        }

        .pie-slice {
          transition: transform 0.3s ease;
          cursor: pointer;
        }

        .pie-slice:hover {
          transform: scale(1.05);
        }

        .pie-path {
          transition: all 0.3s ease;
        }

        .pie-percentage {
          font-weight: bold;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .pie-emoji {
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
        }

        /* No Charts Message */
        .no-charts-message {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          margin-bottom: 30px;
        }

        .message-card {
          background: linear-gradient(135deg, var(--bg-secondary), var(--bg-primary));
          border: 2px dashed var(--border-color);
          border-radius: 16px;
          padding: 30px;
          text-align: center;
          max-width: 400px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .message-card:hover {
          border-color: var(--accent-color);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .message-icon {
          font-size: 3rem;
          margin-bottom: 15px;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .message-card h3 {
          margin: 0 0 10px 0;
          color: var(--text-primary);
          font-size: 1.3rem;
          font-weight: 600;
        }

        .message-card p {
          margin: 0 0 20px 0;
          color: var(--text-secondary);
          font-size: 1rem;
          line-height: 1.5;
        }

        .message-tip {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 15px;
          margin-top: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .message-tip span:first-child {
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .no-charts-message {
            min-height: 150px;
          }

          .message-card {
            padding: 20px;
            margin: 0 15px;
          }

          .message-icon {
            font-size: 2.5rem;
            margin-bottom: 10px;
          }

          .message-card h3 {
            font-size: 1.1rem;
          }

          .message-card p {
            font-size: 0.9rem;
            margin-bottom: 15px;
          }

          .message-tip {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
            text-align: left;
          }
        }

        @media (max-width: 480px) {
          .no-charts-message {
            min-height: 120px;
          }

          .message-card {
            padding: 15px;
            margin: 0 10px;
          }

          .message-icon {
            font-size: 2rem;
            margin-bottom: 8px;
          }

          .message-card h3 {
            font-size: 1rem;
          }

          .message-card p {
            font-size: 0.8rem;
            margin-bottom: 10px;
          }

          .message-tip {
            padding: 10px;
            font-size: 0.8rem;
          }
        }

        /* Weekly Summary Styles */
        .weekly-summary {
          margin-bottom: 30px;
        }

        .weekly-summary h4 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
          text-align: center;
        }

        .summary-card {
          background: linear-gradient(135deg, var(--accent-color)20, var(--accent-color)10);
          border: 1px solid var(--accent-color)30;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .summary-mood {
          display: flex;
          align-items: center;
          gap: 15px;
          flex: 1;
        }

        .summary-emoji {
          font-size: 3rem;
          flex-shrink: 0;
        }

        .summary-text {
          flex: 1;
        }

        .summary-title {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .summary-value {
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .summary-detail {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .summary-stats {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex-shrink: 0;
        }

        .summary-stat {
          text-align: center;
          padding: 10px;
          background: var(--bg-secondary);
          border-radius: 8px;
          min-width: 100px;
        }

        .summary-stat .stat-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .summary-stat .stat-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        /* Traditional Insights */
        .traditional-insights {
          margin-bottom: 30px;
        }

        .traditional-insights h4 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
          text-align: center;
        }

        @media (max-width: 768px) {
          .mood-calendar {
            gap: 8px;
          }

          .calendar-date {
            width: 50px;
            height: 50px;
          }

          .calendar-emoji {
            font-size: 1.2rem;
          }

          .calendar-day-name {
            font-size: 0.6rem;
          }

          .bar-chart {
            height: 150px;
            gap: 10px;
          }

          .chart-bar-container {
            max-width: 60px;
          }

          .chart-bar {
            height: 120px;
          }

          .summary-card {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .summary-stats {
            flex-direction: row;
            justify-content: center;
            width: 100%;
          }

          .summary-stat {
            min-width: 80px;
          }

          .chart-legend {
            gap: 10px;
          }
        }

        @media (max-width: 480px) {
          .mood-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .mood-actions {
            flex-direction: column;
          }

          .today-mood-summary {
            padding: 15px;
          }

          .mood-summary .mood-emoji-large {
            font-size: 2.5rem;
          }

          .mood-summary .mood-label {
            font-size: 1rem;
          }

          .mood-calendar {
            gap: 5px;
          }

          .calendar-date {
            width: 40px;
            height: 40px;
            border-radius: 8px;
          }

          .calendar-emoji {
            font-size: 1rem;
            margin-bottom: 1px;
          }

          .calendar-day-name {
            font-size: 0.5rem;
          }

          .bar-chart {
            height: 120px;
            gap: 8px;
          }

          .chart-bar-container {
            max-width: 50px;
          }

          .chart-bar {
            height: 100px;
          }

          .chart-bar-emoji {
            font-size: 1rem;
          }

          .chart-bar-value {
            font-size: 0.8rem;
          }

          .summary-emoji {
            font-size: 2.5rem;
          }

          .summary-value {
            font-size: 1.1rem;
          }

          .summary-stats {
            flex-direction: column;
            gap: 8px;
          }

          .summary-stat {
            min-width: auto;
            width: 100%;
          }

          .chart-legend {
            gap: 8px;
          }

          .legend-item {
            padding: 3px 6px;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MoodTracker;
