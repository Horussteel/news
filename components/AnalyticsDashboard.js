import { useState, useEffect } from 'react';
import analyticsService from '../lib/analyticsService';
import { useTranslation } from '../contexts/LanguageContext';

const AnalyticsDashboard = () => {
  const { t } = useTranslation();
  const [analyticsSettings, setAnalyticsSettings] = useState({});
  const [habitHeatmapData, setHabitHeatmapData] = useState([]);
  const [combinedHeatmapData, setCombinedHeatmapData] = useState([]);
  const [habitMetrics, setHabitMetrics] = useState(null);
  const [moodAnalytics, setMoodAnalytics] = useState(null);
  const [wellnessReport, setWellnessReport] = useState(null);
  const [selectedView, setSelectedView] = useState('overview'); // overview, heatmap, habits, mood
  const [heatmapType, setHeatmapType] = useState('habits'); // habits, mood, combined
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDetailedModal, setShowDetailedModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);

  useEffect(() => {
    loadAnalyticsSettings();
    loadAnalyticsData();
  }, []);

  const loadAnalyticsSettings = () => {
    const settings = analyticsService.getAnalyticsSettings();
    setAnalyticsSettings(settings);
    if (settings.heatmapIntensity) {
      setHeatmapType(settings.heatmapIntensity);
    }
  };

  const loadAnalyticsData = () => {
    const habitData = analyticsService.getHabitHeatmapData();
    const combinedData = analyticsService.getCombinedHeatmapData();
    const metrics = analyticsService.getHabitPerformanceMetrics();
    const moodData = analyticsService.getMoodAnalytics();
    const report = analyticsService.generateWellnessReport();

    setHabitHeatmapData(habitData);
    setCombinedHeatmapData(combinedData);
    setHabitMetrics(metrics);
    setMoodAnalytics(moodData);
    setWellnessReport(report);
  };

  const handleHeatmapTypeChange = (type) => {
    setHeatmapType(type);
    analyticsService.saveAnalyticsSettings({
      ...analyticsSettings,
      heatmapIntensity: type
    });
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowDetailedModal(true);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ro-RO', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWeekday = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ro-RO', { weekday: 'short' });
  };

  const renderOverview = () => (
    <div className="analytics-overview">
      <h3>📊 {t('analytics.wellnessSummary')}</h3>
      
      {wellnessReport && (
        <div className="wellness-score-card">
          <div className="score-header">
            <h4>Scor General Wellness</h4>
            <div className="score-display">
              <div className="score-circle">
                <span className="score-value">{wellnessReport.overallScore.score}</span>
                <span className="score-grade">{wellnessReport.overallScore.grade.letter}</span>
              </div>
              <div className="score-details">
                <div className="score-item">
                  <span>Obiceiuri:</span>
                  <span>{wellnessReport.overallScore.habitScore}%</span>
                </div>
                <div className="score-item">
                  <span>Stare emoțională:</span>
                  <span>{wellnessReport.overallScore.moodScore}%</span>
                </div>
              </div>
            </div>
            <div className="score-description">
              {wellnessReport.overallScore.grade.description}
            </div>
          </div>
        </div>
      )}

      {wellnessReport && wellnessReport.highlights.length > 0 && (
        <div className="highlights-section">
          <h4>🌟 Realizări Recente</h4>
          <div className="highlights-grid">
            {wellnessReport.highlights.map((highlight, index) => (
              <div key={index} className="highlight-card">
                <div className="highlight-icon">{highlight.icon}</div>
                <div className="highlight-content">
                  <h5>{highlight.title}</h5>
                  <p>{highlight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {wellnessReport && wellnessReport.recommendations.length > 0 && (
        <div className="recommendations-section">
          <h4>💡 Recomandări</h4>
          <div className="recommendations-list">
            {wellnessReport.recommendations
              .filter(rec => rec.priority === 'high')
              .map((recommendation, index) => (
                <div key={index} className={`recommendation-card priority-${recommendation.priority}`}>
                  <div className="recommendation-header">
                    <h5>{recommendation.title}</h5>
                    <span className="priority-badge">{recommendation.priority}</span>
                  </div>
                  <p>{recommendation.description}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderHeatmap = () => {
    const data = heatmapType === 'habits' ? habitHeatmapData : 
                 heatmapType === 'mood' ? analyticsService.getMoodHeatmapData() : 
                 combinedHeatmapData;

    // Group data by weeks
    const weeks = [];
    let currentWeek = [];
    
    data.forEach((day, index) => {
      currentWeek.push(day);
      
      if (currentWeek.length === 7 || index === data.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return (
      <div className="heatmap-section">
        <div className="heatmap-header">
          <h3>📅 Calendar de Activitate</h3>
          <div className="heatmap-controls">
            <select
              value={heatmapType}
              onChange={(e) => handleHeatmapTypeChange(e.target.value)}
              className="heatmap-type-select"
            >
              <option value="habits">Obiceiuri</option>
              <option value="mood">Stare Emoțională</option>
              <option value="combined">Combinat</option>
            </select>
          </div>
        </div>

        <div className="heatmap-container">
          <div className="heatmap-legend">
            <span>Mai puțin</span>
            <div className="legend-colors">
              <div className="legend-color" style={{ backgroundColor: '#e5e7eb' }}></div>
              <div className="legend-color" style={{ backgroundColor: analyticsService.getHeatmapColor(0.2, heatmapType) }}></div>
              <div className="legend-color" style={{ backgroundColor: analyticsService.getHeatmapColor(0.4, heatmapType) }}></div>
              <div className="legend-color" style={{ backgroundColor: analyticsService.getHeatmapColor(0.6, heatmapType) }}></div>
              <div className="legend-color" style={{ backgroundColor: analyticsService.getHeatmapColor(0.8, heatmapType) }}></div>
              <div className="legend-color" style={{ backgroundColor: analyticsService.getHeatmapColor(1.0, heatmapType) }}></div>
            </div>
            <span>Mai mult</span>
          </div>

          <div className="heatmap-grid">
            <div className="weekday-labels">
              {['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'].map((day, index) => (
                <div key={index} className="weekday-label">{day}</div>
              ))}
            </div>
            
            <div className="heatmap-weeks">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="heatmap-week">
                  {week.length < 7 && (
                    <div 
                      className="empty-day" 
                      style={{ gridColumn: `${8 - week.length} / 8` }}
                    ></div>
                  )}
                  {week.map((day, dayIndex) => (
                    <div
                      key={day.date}
                      className={`heatmap-day ${day.hasData ? 'has-data' : 'no-data'}`}
                      style={{
                        backgroundColor: day.color || (heatmapType === 'mood' ? day.color : analyticsService.getHeatmapColor(day.intensity || 0, heatmapType))
                      }}
                      onClick={() => day.hasData && handleDateClick(day.date)}
                      title={`${formatDate(day.date)}: ${day.percentage || 0}%${day.moodEmoji ? ` ${day.moodEmoji}` : ''}`}
                    >
                      {day.moodEmoji && (
                        <span className="day-emoji">{day.moodEmoji}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="heatmap-stats">
          <div className="stat-card">
            <div className="stat-value">
              {data.filter(d => d.hasData).length}
            </div>
            <div className="stat-label">Zile active</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {data.filter(d => d.hasData && (d.intensity > 0.5 || d.moodIntensity > 0.5)).length}
            </div>
            <div className="stat-label">Zile productive</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {data.filter(d => d.hasData).length > 0 ? 
                Math.round((data.filter(d => d.hasData && (d.intensity > 0.5 || d.moodIntensity > 0.5)).length / data.filter(d => d.hasData).length) * 100) : 0}%
            </div>
            <div className="stat-label">Rata de succes</div>
          </div>
        </div>
      </div>
    );
  };

  const renderHabitAnalytics = () => {
    if (!habitMetrics) return <div className="loading">Se încarcă...</div>;

    return (
      <div className="habit-analytics">
        <h3>📈 Analiza Obiceiurilor</h3>
        
        <div className="metrics-cards">
          <div className="metric-card">
            <h4>Performanță Generală</h4>
            <div className="metric-value">{habitMetrics.consistencyScore}%</div>
            <div className="metric-label">Scor de Consistență</div>
          </div>
          
          <div className="metric-card">
            <h4>Obiceiuri Active</h4>
            <div className="metric-value">{habitMetrics.activeHabits}</div>
            <div className="metric-label">Total obiceiuri</div>
          </div>

          <div className="metric-card">
            <h4>Tendință Lunară</h4>
            <div className="metric-value trend-badge trend-{habitMetrics.monthlyTrend}">
              {habitMetrics.monthlyTrend === 'excellent' && 'Excelentă 📈'}
              {habitMetrics.monthlyTrend === 'good' && 'Bună 📊'}
              {habitMetrics.monthlyTrend === 'improving' && 'În creștere 📈'}
              {habitMetrics.monthlyTrend === 'declining' && 'În scădere 📉'}
              {habitMetrics.monthlyTrend === 'poor' && 'Scăzută ⚠️'}
              {habitMetrics.monthlyTrend === 'stable' && 'Stabilă ➡️'}
            </div>
          </div>
        </div>

        {habitMetrics.bestPerformingHabit && (
          <div className="best-habit-card">
            <h4>🏆 Cel mai bun obicei</h4>
            <div className="habit-performance">
              <div className="habit-info">
                <span className="habit-icon">{habitMetrics.bestPerformingHabit.habit.icon}</span>
                <span className="habit-name">{habitMetrics.bestPerformingHabit.habit.name}</span>
              </div>
              <div className="habit-stats">
                <div className="stat">
                  <span className="value">{habitMetrics.bestPerformingHabit.completionRate}%</span>
                  <span className="label">Rată completare</span>
                </div>
                <div className="stat">
                  <span className="value">{habitMetrics.bestPerformingHabit.currentStreak}</span>
                  <span className="label">Serie curentă</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {Object.keys(habitMetrics.categoryPerformance).length > 0 && (
          <div className="category-performance">
            <h4>Performanță pe Categorii</h4>
            <div className="category-list">
              {Object.entries(habitMetrics.categoryPerformance).map(([category, performance]) => (
                <div key={category} className="category-item">
                  <div className="category-info">
                    <span className="category-name">{category}</span>
                    <span className="category-habits">{performance.habits} obiceiuri</span>
                  </div>
                  <div className="category-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${performance.averageCompletionRate}%` }}
                      ></div>
                    </div>
                    <span className="progress-value">{performance.averageCompletionRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {habitMetrics.weeklyProgress.length > 0 && (
          <div className="weekly-progress">
            <h4>Progres Săptămânal</h4>
            <div className="progress-chart">
              {habitMetrics.weeklyProgress.map((week, index) => (
                <div key={index} className="week-bar">
                  <div 
                    className="week-fill"
                    style={{ height: `${Math.max(week.completionRate, 10)}%` }}
                  ></div>
                  <div className="week-label">{week.label}</div>
                  <div className="week-value">{Math.round(week.completionRate)}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMoodAnalytics = () => {
    if (!moodAnalytics) return <div className="loading">Se încarcă...</div>;

    return (
      <div className="mood-analytics">
        <h3>😊 Analiza Stării Emoționale</h3>
        
        <div className="mood-summary-cards">
          <div className="mood-card">
            <h4>Stare Medie</h4>
            <div className="mood-value">{moodAnalytics.averageMood.toFixed(1)}/5</div>
            <div className="mood-label">Ultima lună</div>
          </div>
          
          <div className="mood-card">
            <h4>Serie Curentă</h4>
            <div className="mood-value">{moodAnalytics.currentStreak} 🔥</div>
            <div className="mood-label">Zile consecutive</div>
          </div>

          <div className="mood-card">
            <h4>Tendință</h4>
            <div className="mood-value trend-badge trend-{moodAnalytics.moodTrend}">
              {moodAnalytics.moodTrend === 'improving' && 'Îmbunătățire 📈'}
              {moodAnalytics.moodTrend === 'declining' && 'Scădere 📉'}
              {moodAnalytics.moodTrend === 'stable' && 'Stabilă ➡️'}
              {moodAnalytics.moodTrend === 'insufficient_data' && 'Date insuficiente 📊'}
            </div>
          </div>
        </div>

        {Object.entries(moodAnalytics.moodDistribution).length > 0 && (
          <div className="mood-distribution">
            <h4>Distribuția Stărilor Emoționale</h4>
            <div className="mood-bars">
              {Object.entries(moodAnalytics.moodDistribution)
                .filter(([, data]) => data.count > 0)
                .sort(([,a], [,b]) => b.count - a.count)
                .map(([moodId, data]) => (
                  <div key={moodId} className="mood-bar-item">
                    <div className="mood-bar-info">
                      <span className="mood-emoji">{data.mood.emoji}</span>
                      <span className="mood-name">{data.mood.label}</span>
                    </div>
                    <div className="mood-bar-container">
                      <div 
                        className="mood-bar-fill"
                        style={{ 
                          width: `${data.percentage}%`,
                          backgroundColor: data.mood.color
                        }}
                      ></div>
                    </div>
                    <div className="mood-bar-stats">
                      <span className="count">{data.count} zile</span>
                      <span className="percentage">{data.percentage}%</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {moodAnalytics.bestDays && moodAnalytics.bestDays.length > 0 && (
          <div className="best-mood-days">
            <h4>🌟 Cele mai bune zile</h4>
            <div className="best-days-list">
              {moodAnalytics.bestDays.slice(0, 5).map((day, index) => (
                <div key={index} className="best-day-item">
                  <div className="day-date">{formatDate(day.date)}</div>
                  <div className="day-mood">
                    <span className="mood-emoji">{analyticsService.getMoodScore(day.mood) >= 4 ? '😊' : '😐'}</span>
                    <span className="mood-score">{day.score}/5</span>
                  </div>
                  {day.entry && (
                    <div className="day-entry">
                      <p>{day.entry.substring(0, 100)}{day.entry.length > 100 && '...'}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {moodAnalytics.insights && moodAnalytics.insights.length > 0 && (
          <div className="mood-insights">
            <h4>💡 Insights Emoționale</h4>
            <div className="insights-list">
              {moodAnalytics.insights.map((insight, index) => (
                <div key={index} className={`insight-card insight-${insight.type}`}>
                  <div className="insight-icon">{insight.icon}</div>
                  <div className="insight-content">
                    <h5>{insight.title}</h5>
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
      </div>
    );
  };

  const renderDateDetailModal = () => {
    if (!showDetailedModal || !selectedDate) return null;

    const habitData = habitHeatmapData.find(d => d.date === selectedDate);
    const moodData = analyticsService.getMoodHeatmapData().find(d => d.date === selectedDate);
    const combinedData = combinedHeatmapData.find(d => d.date === selectedDate);

    return (
      <div className="date-detail-modal">
        <div className="modal-overlay" onClick={() => setShowDetailedModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalii - {formatDate(selectedDate)}</h3>
              <button className="close-btn" onClick={() => setShowDetailedModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {habitData && (
                <div className="date-section">
                  <h4>🎯 Obiceiuri</h4>
                  <div className="habit-summary">
                    <div className="habit-stats">
                      <div className="stat">
                        <span className="value">{habitData.completedHabits}</span>
                        <span className="label">Obiceiuri completate</span>
                      </div>
                      <div className="stat">
                        <span className="value">{habitData.totalHabits}</span>
                        <span className="label">Obiceiuri totale</span>
                      </div>
                      <div className="stat">
                        <span className="value">{habitData.percentage}%</span>
                        <span className="label">Rată de succes</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {moodData && moodData.hasEntry && (
                <div className="date-section">
                  <h4>😌 Stare Emoțională</h4>
                  <div className="mood-summary">
                    <div className="mood-display">
                      <span className="mood-emoji-large">{moodData.emoji}</span>
                      <span className="mood-label">{moodData.mood}</span>
                    </div>
                    {moodService.getMoodEntry(selectedDate)?.entry && (
                      <div className="mood-entry">
                        <p>{moodService.getMoodEntry(selectedDate).entry}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {combinedData && (
                <div className="date-section">
                  <h4>📊 Scor Combinat</h4>
                  <div className="combined-score">
                    <div className="score-circle">
                      <span className="score-value">{Math.round(combinedData.combinedIntensity * 100)}%</span>
                    </div>
                    <div className="score-description">
                      Scor general pentru această zi
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>📊 {t('analytics.title')}</h2>
        <div className="view-tabs">
          <button
            className={`tab-btn ${selectedView === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedView('overview')}
          >
            📋 {t('analytics.overview')}
          </button>
          <button
            className={`tab-btn ${selectedView === 'heatmap' ? 'active' : ''}`}
            onClick={() => setSelectedView('heatmap')}
          >
            📅 {t('analytics.heatmap')}
          </button>
          <button
            className={`tab-btn ${selectedView === 'habits' ? 'active' : ''}`}
            onClick={() => setSelectedView('habits')}
          >
            🎯 {t('analytics.habitAnalytics')}
          </button>
          <button
            className={`tab-btn ${selectedView === 'mood' ? 'active' : ''}`}
            onClick={() => setSelectedView('mood')}
          >
            😌 {t('analytics.moodAnalytics')}
          </button>
        </div>
      </div>

      <div className="analytics-content">
        {selectedView === 'overview' && renderOverview()}
        {selectedView === 'heatmap' && renderHeatmap()}
        {selectedView === 'habits' && renderHabitAnalytics()}
        {selectedView === 'mood' && renderMoodAnalytics()}
      </div>

      {renderDateDetailModal()}

      <style jsx>{`
        .analytics-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .analytics-header {
          margin-bottom: 30px;
        }

        .analytics-header h2 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
        }

        .view-tabs {
          display: flex;
          gap: 10px;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 10px;
        }

        .tab-btn {
          padding: 10px 20px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: 8px 8px 0 0;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .tab-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .tab-btn.active {
          background: var(--accent-color);
          color: white;
        }

        .analytics-content {
          min-height: 400px;
        }

        /* Overview Styles */
        .analytics-overview h3 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
        }

        .wellness-score-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 16px;
          margin-bottom: 30px;
        }

        .score-header h4 {
          margin: 0 0 20px 0;
          font-size: 1.3rem;
        }

        .score-display {
          display: flex;
          align-items: center;
          gap: 30px;
          margin-bottom: 20px;
        }

        .score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .score-value {
          font-size: 2.5rem;
          font-weight: bold;
          line-height: 1;
        }

        .score-grade {
          font-size: 1.2rem;
          opacity: 0.9;
        }

        .score-details {
          flex: 1;
        }

        .score-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 1.1rem;
        }

        .score-description {
          font-size: 1.1rem;
          opacity: 0.9;
          font-style: italic;
        }

        .highlights-section {
          margin-bottom: 30px;
        }

        .highlights-section h4 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
        }

        .highlights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }

        .highlight-card {
          background: var(--bg-secondary);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }

        .highlight-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .highlight-content h5 {
          margin: 0 0 8px 0;
          color: var(--text-primary);
        }

        .highlight-content p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .recommendations-section h4 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
        }

        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .recommendation-card {
          background: var(--bg-secondary);
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid;
        }

        .recommendation-card.priority-high {
          border-left-color: #ef4444;
        }

        .recommendation-card.priority-medium {
          border-left-color: #f59e0b;
        }

        .recommendation-card.priority-low {
          border-left-color: #10b981;
        }

        .recommendation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .recommendation-header h5 {
          margin: 0;
          color: var(--text-primary);
        }

        .priority-badge {
          background: var(--accent-color);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          text-transform: uppercase;
        }

        .recommendation-card p {
          margin: 0;
          color: var(--text-secondary);
        }

        /* Heatmap Styles */
        .heatmap-section h3 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
        }

        .heatmap-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .heatmap-type-select {
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .heatmap-container {
          background: var(--bg-secondary);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          margin-bottom: 20px;
          overflow-x: auto;
        }

        .heatmap-legend {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .legend-colors {
          display: flex;
          gap: 4px;
        }

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 2px;
        }

        .heatmap-grid {
          display: flex;
          gap: 10px;
          min-width: 800px;
        }

        .weekday-labels {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-top: 20px;
        }

        .weekday-label {
          height: 12px;
          display: flex;
          align-items: center;
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .heatmap-weeks {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .heatmap-week {
          display: grid;
          grid-template-columns: repeat(7, 12px);
          gap: 4px;
        }

        .heatmap-day {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .heatmap-day:hover {
          transform: scale(1.2);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .heatmap-day.has-data {
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .day-emoji {
          font-size: 8px;
          line-height: 1;
        }

        .empty-day {
          background: transparent;
        }

        .heatmap-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }

        .heatmap-stats .stat-card {
          background: var(--bg-secondary);
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid var(--border-color);
        }

        .heatmap-stats .stat-value {
          font-size: 1.8rem;
          font-weight: bold;
          color: var(--accent-color);
          margin-bottom: 5px;
        }

        .heatmap-stats .stat-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        /* Habit Analytics Styles */
        .habit-analytics h3 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
        }

        .metrics-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .metric-card {
          background: var(--bg-secondary);
          padding: 25px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          text-align: center;
        }

        .metric-card h4 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
        }

        .metric-value {
          font-size: 2.5rem;
          font-weight: bold;
          color: var(--accent-color);
          margin-bottom: 5px;
        }

        .trend-badge {
          font-size: 1.2rem;
          padding: 8px 12px;
          border-radius: 8px;
          background: var(--bg-primary);
        }

        .trend-excellent { background: #10b981; color: white; }
        .trend-good { background: #3b82f6; color: white; }
        .trend-improving { background: #8b5cf6; color: white; }
        .trend-declining { background: #f59e0b; color: white; }
        .trend-poor { background: #ef4444; color: white; }
        .trend-stable { background: #6b7280; color: white; }

        .metric-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .best-habit-card {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 30px;
        }

        .best-habit-card h4 {
          margin: 0 0 15px 0;
        }

        .habit-performance {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .habit-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .habit-icon {
          font-size: 2rem;
        }

        .habit-name {
          font-size: 1.2rem;
          font-weight: 600;
        }

        .habit-stats {
          display: flex;
          gap: 30px;
        }

        .habit-stats .stat {
          text-align: center;
        }

        .habit-stats .stat .value {
          display: block;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .habit-stats .stat .label {
          font-size: 0.8rem;
          opacity: 0.9;
        }

        .category-performance {
          margin-bottom: 30px;
        }

        .category-performance h4 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .category-item {
          background: var(--bg-secondary);
          padding: 15px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .category-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .category-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .category-habits {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .category-progress {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: var(--border-color);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--accent-color);
          transition: width 0.5s ease;
        }

        .progress-value {
          min-width: 40px;
          text-align: right;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .weekly-progress h4 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
        }

        .progress-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 200px;
          background: var(--bg-secondary);
          padding: 20px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .week-bar {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          height: 100%;
          justify-content: flex-end;
        }

        .week-fill {
          width: 30px;
          background: var(--accent-color);
          border-radius: 4px 4px 0 0;
          margin-bottom: 10px;
          transition: height 0.5s ease;
        }

        .week-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 5px;
        }

        .week-value {
          font-size: 0.7rem;
          color: var(--text-primary);
          font-weight: 500;
        }

        /* Mood Analytics Styles */
        .mood-analytics h3 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
        }

        .mood-summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .mood-card {
          background: var(--bg-secondary);
          padding: 25px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          text-align: center;
        }

        .mood-card h4 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
        }

        .mood-value {
          font-size: 2rem;
          font-weight: bold;
          color: var(--accent-color);
          margin-bottom: 5px;
        }

        .mood-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .mood-distribution {
          margin-bottom: 30px;
        }

        .mood-distribution h4 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
        }

        .mood-bars {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .mood-bar-item {
          display: flex;
          align-items: center;
          gap: 15px;
          background: var(--bg-secondary);
          padding: 15px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .mood-bar-info {
          min-width: 120px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mood-emoji {
          font-size: 1.5rem;
        }

        .mood-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .mood-bar-container {
          flex: 1;
          height: 12px;
          background: var(--border-color);
          border-radius: 6px;
          overflow: hidden;
        }

        .mood-bar-fill {
          height: 100%;
          transition: width 0.5s ease;
        }

        .mood-bar-stats {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          min-width: 80px;
        }

        .mood-bar-stats .count {
          font-weight: 600;
          color: var(--text-primary);
        }

        .mood-bar-stats .percentage {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .best-mood-days {
          margin-bottom: 30px;
        }

        .best-mood-days h4 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
        }

        .best-days-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .best-day-item {
          background: var(--bg-secondary);
          padding: 15px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .day-date {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .day-mood {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .day-mood .mood-emoji {
          font-size: 1.2rem;
        }

        .day-mood .mood-score {
          font-weight: 500;
          color: var(--text-primary);
        }

        .day-entry {
          background: var(--bg-primary);
          padding: 10px;
          border-radius: 6px;
        }

        .day-entry p {
          margin: 0;
          color: var(--text-secondary);
          font-style: italic;
          font-size: 0.9rem;
        }

        .mood-insights {
          margin-bottom: 30px;
        }

        .mood-insights h4 {
          margin: 0 0 15px 0;
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

        .insight-positive { border-left-color: #10b981; }
        .insight-warning { border-left-color: #f59e0b; }
        .insight-achievement { border-left-color: #8b5cf6; }
        .insight-pattern { border-left-color: #3b82f6; }
        .insight-info { border-left-color: #6b7280; }

        .insight-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .insight-content h5 {
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

        /* Modal Styles */
        .date-detail-modal .modal-overlay {
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
          max-width: 500px;
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

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .date-section {
          margin-bottom: 25px;
        }

        .date-section:last-child {
          margin-bottom: 0;
        }

        .date-section h4 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
        }

        .habit-summary .habit-stats {
          display: flex;
          justify-content: space-between;
          background: var(--bg-secondary);
          padding: 15px;
          border-radius: 8px;
        }

        .habit-summary .stat {
          text-align: center;
        }

        .habit-summary .stat .value {
          display: block;
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--accent-color);
        }

        .habit-summary .stat .label {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .mood-summary {
          background: var(--bg-secondary);
          padding: 15px;
          border-radius: 8px;
        }

        .mood-display {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .mood-emoji-large {
          font-size: 2rem;
        }

        .mood-display .mood-label {
          font-weight: 600;
          color: var(--text-primary);
        }

        .mood-entry {
          background: var(--bg-primary);
          padding: 10px;
          border-radius: 6px;
        }

        .mood-entry p {
          margin: 0;
          color: var(--text-secondary);
          font-style: italic;
        }

        .combined-score {
          text-align: center;
          background: var(--bg-secondary);
          padding: 20px;
          border-radius: 8px;
        }

        .score-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px auto;
          color: white;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .score-description {
          color: var(--text-secondary);
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .analytics-header {
            text-align: center;
          }

          .view-tabs {
            justify-content: center;
            flex-wrap: wrap;
          }

          .tab-btn {
            font-size: 0.9rem;
            padding: 8px 16px;
          }

          .score-display {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }

          .score-circle {
            width: 100px;
            height: 100px;
          }

          .score-value {
            font-size: 2rem;
          }

          .highlights-grid {
            grid-template-columns: 1fr;
          }

          .metrics-cards,
          .mood-summary-cards {
            grid-template-columns: repeat(2, 1fr);
          }

          .habit-performance {
            flex-direction: column;
            gap: 15px;
          }

          .habit-stats {
              justify-content: center;
          }

          .heatmap-container {
            padding: 15px;
          }

          .heatmap-grid {
            min-width: auto;
          }

          .heatmap-day {
            width: 10px;
            height: 10px;
          }

          .weekday-label {
            font-size: 0.6rem;
          }

          .progress-chart {
            height: 150px;
            padding: 15px;
          }

          .week-fill {
            width: 25px;
          }

          .mood-bar-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .mood-bar-container {
            width: 100%;
          }

          .mood-bar-stats {
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
            min-width: auto;
          }
        }

        @media (max-width: 480px) {
          .analytics-dashboard {
            padding: 15px;
          }

          .metrics-cards,
          .mood-summary-cards {
            grid-template-columns: 1fr;
          }

          .score-circle {
            width: 80px;
            height: 80px;
          }

          .score-value {
            font-size: 1.5rem;
          }

          .heatmap-day {
            width: 8px;
            height: 8px;
          }

          .progress-chart {
            height: 120px;
            padding: 10px;
          }

          .week-fill {
            width: 20px;
          }

          .week-label {
            font-size: 0.7rem;
          }

          .week-value {
            font-size: 0.6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;
