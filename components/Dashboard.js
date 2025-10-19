import { useState, useEffect } from 'react';
import analyticsService from '../lib/analyticsService';
import financialService from '../lib/financialService';
import DataExportManager from './DataExportManager';
import { useTranslation } from '../contexts/LanguageContext';

const Dashboard = () => {
  const { t } = useTranslation();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [financialStats, setFinancialStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [activeTab, setActiveTab] = useState('overview');
  const [showDataExport, setShowDataExport] = useState(false);

  useEffect(() => {
    loadAnalytics();
    loadFinancialStats();
  }, []);

  const loadAnalytics = () => {
    console.log('🔄 Dashboard: loadAnalytics() called');
    setLoading(true);
    try {
      const data = analyticsService.getDashboardData();
      console.log('📊 Dashboard: Data received:', data);
      setAnalyticsData(data);
    } catch (error) {
      console.error('❌ Dashboard: Error loading analytics:', error);
      // Fallback to empty data on error
      const fallbackData = {
        overview: { 
          totalTodos: 0, 
          completedTodos: 0, 
          completionRate: 0, 
          totalHabits: 0, 
          activeHabits: 0, 
          totalReading: 0, 
          completedReading: 0, 
          readingCompletionRate: 0, 
          overallProductivity: 0 
        },
        recentActivity: [],
        topMetrics: {},
        quickStats: { 
          todayTodos: 0, 
          todayHabits: 0, 
          todayReading: 0, 
          todayProductivity: 0 
        }
      };
      console.log('📊 Dashboard: Using fallback data:', fallbackData);
      setAnalyticsData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = (format) => {
    try {
      const data = analyticsService.exportAnalytics(format);
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const loadFinancialStats = () => {
    try {
      const stats = financialService.getFinancialStatistics();
      setFinancialStats(stats);
    } catch (error) {
      console.error('Error loading financial statistics:', error);
    }
  };

  const handleRefresh = () => {
    analyticsService.clearCache();
    loadAnalytics();
    loadFinancialStats();
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>📊 {t('dashboard.title')}</h2>
          <button className="refresh-btn" onClick={handleRefresh}>
            🔄 {t('common.loading')}
          </button>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>{t('common.loading')}...</p>
        </div>
        <style jsx>{`
          .dashboard {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }

          .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            background: linear-gradient(135deg, #667EEA, #4C51BF);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
          }

          .dashboard-header h2 {
            margin: 0;
            color: white;
            font-size: 1.8rem;
          }

          .refresh-btn {
            background: white;
            color: #667EEA;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .refresh-btn:hover {
            background: #f0f4ff;
            transform: translateY(-2px);
          }

          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            text-align: center;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid var(--border-color);
            border-top: 4px solid var(--accent-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .loading-state p {
            color: var(--text-secondary);
            font-size: 1rem;
          }
        `}</style>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>📊 {t('dashboard.title')}</h2>
          <button className="refresh-btn" onClick={handleRefresh}>
            🔄 {t('common.loading')}
          </button>
        </div>
        <div className="error-state">
          <p>❌ {t('errors.generic')}</p>
          <button onClick={loadAnalytics} className="retry-btn">
            🔄 {t('common.save')}
          </button>
        </div>
        <style jsx>{`
          .dashboard {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }

          .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            background: linear-gradient(135deg, #667EEA, #4C51BF);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
          }

          .dashboard-header h2 {
            margin: 0;
            color: white;
            font-size: 1.8rem;
          }

          .refresh-btn {
            background: white;
            color: #667EEA;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .refresh-btn:hover {
            background: #f0f4ff;
            transform: translateY(-2px);
          }

          .error-state {
            text-align: center;
            padding: 60px 20px;
            color: var(--text-secondary);
          }

          .error-state p {
            font-size: 1.2rem;
            margin-bottom: 20px;
          }

          .retry-btn {
            background: var(--accent-color);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .retry-btn:hover {
            background: #38a169;
          }
        `}</style>
      </div>
    );
  }

  const { overview, recentActivity, topMetrics, quickStats } = analyticsData;

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num) => {
    return `${num}%`;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving': return '#10B981';
      case 'declining': return '#EF4444';
      case 'stable': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>📊 {t('dashboard.title')}</h2>
          <div className="header-actions">
            <button className="refresh-btn" onClick={handleRefresh}>
              🔄 {t('common.loading')}
            </button>
            <button 
              className="data-export-btn" 
              onClick={() => setShowDataExport(!showDataExport)}
            >
              📦 {t('dashboard.exportImport.title')}
            </button>
          </div>
        </div>

      {/* Data Export Manager */}
      {showDataExport && (
        <div className="data-export-section">
          <DataExportManager />
        </div>
      )}

      {/* Overview Section */}
      <div className="overview-section">
        <h3>📈 {t('dashboard.overview')}</h3>
        <div className="overview-cards">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">✅</span>
              <span className="stat-label">{t('navigation.todo')}</span>
            </div>
            <div className="stat-value">{formatNumber(overview.totalTodos)}</div>
            <div className="stat-subtitle">
              {formatNumber(overview.completedTodos)} {t('dashboard.completed')}
            </div>
            <div className="stat-progress">
              <div 
                className="progress-bar"
                style={{ width: `${overview.completionRate}%` }}
              />
              <span>{overview.completionRate}%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">🎯</span>
              <span className="stat-label">{t('navigation.habits')}</span>
            </div>
            <div className="stat-value">{formatNumber(overview.totalHabits)}</div>
            <div className="stat-subtitle">
              {formatNumber(overview.activeHabits)} {t('dashboard.active')}
            </div>
            <div className="stat-progress">
              <div 
                className="progress-bar"
                style={{ 
                  width: `${overview.totalHabits > 0 ? (overview.activeHabits / overview.totalHabits) * 100 : 0}%` 
                }}
              />
              <span>
                {overview.totalHabits > 0 ? Math.round((overview.activeHabits / overview.totalHabits) * 100) : 0}%
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">📚</span>
              <span className="stat-label">{t('navigation.reading')}</span>
            </div>
            <div className="stat-value">{formatNumber(overview.totalReading)}</div>
            <div className="stat-subtitle">
              {formatNumber(overview.completedReading)} {t('dashboard.completed')}
            </div>
            <div className="stat-progress">
              <div 
                className="progress-bar"
                style={{ width: `${overview.readingCompletionRate}%` }}
              />
              <span>{overview.readingCompletionRate}%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">🚀</span>
              <span className="stat-label">{t('dashboard.productivity')}</span>
            </div>
            <div className="stat-value">{overview.overallProductivity}</div>
            <div className="stat-subtitle">
              {t('dashboard.overallScore')}
            </div>
            <div className="stat-progress">
              <div 
                className="progress-bar"
                style={{ 
                  width: `${Math.min(overview.overallProductivity, 100)}%`,
                  backgroundColor: overview.overallProductivity > 70 ? '#10B981' : 
                                   overview.overallProductivity > 40 ? '#F59E0B' : '#EF4444'
                }}
              />
              <span>{overview.overallProductivity}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="quick-stats-section">
        <h3>🌟 {t('dashboard.recentActivity')}</h3>
        <div className="quick-stats-grid">
          <div className="quick-stat">
            <div className="quick-stat-icon">✅</div>
            <div className="quick-stat-content">
              <div className="quick-stat-value">{quickStats.todayTodos}</div>
              <div className="quick-stat-label">{t('navigation.todo')}</div>
            </div>
          </div>

          <div className="quick-stat">
            <div className="quick-stat-icon">🎯</div>
            <div className="quick-stat-content">
              <div className="quick-stat-value">{quickStats.todayHabits}</div>
              <div className="quick-stat-label">{t('navigation.habits')}</div>
            </div>
          </div>

          <div className="quick-stat">
            <div className="quick-stat-icon">📚</div>
            <div className="quick-stat-content">
              <div className="quick-stat-value">{quickStats.todayReading}</div>
              <div className="quick-stat-label">{t('reading.title')}</div>
            </div>
          </div>

          <div className="quick-stat">
            <div className="quick-stat-icon">💰</div>
            <div className="quick-stat-content">
              <div className="quick-stat-value">
                {financialStats?.currentMonth?.netIncome > 0 ? 
                  new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(financialStats.currentMonth.netIncome) : 
                  '0 RON'
                }
              </div>
              <div className="quick-stat-label">{t('dashboard.savings')}</div>
            </div>
          </div>

          <div className="quick-stat">
            <div className="quick-stat-icon">🏦</div>
            <div className="quick-stat-content">
              <div className="quick-stat-value">
                {financialStats?.loans?.netWorth !== undefined ? 
                  new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(financialStats.loans.netWorth) : 
                  '0 RON'
                }
              </div>
              <div className="quick-stat-label">{t('dashboard.netWorth')}</div>
            </div>
          </div>

          <div className="quick-stat">
            <div className="quick-stat-icon">📊</div>
            <div className="quick-stat-content">
              <div className="quick-stat-value">{quickStats.todayProductivity}</div>
              <div className="quick-stat-label">{t('dashboard.score')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="metrics-section">
        <h3>🏆 {t('dashboard.topMetrics')}</h3>
        <div className="metrics-grid">
          {topMetrics.mostProductiveDay && (
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-icon">📅</span>
                <span className="metric-label">{t('dashboard.mostProductiveDay')}</span>
              </div>
              <div className="metric-value">{topMetrics.mostProductiveDay.date}</div>
              <div className="metric-subtitle">
                {t('dashboard.score')}: {topMetrics.mostProductiveDay.score}
              </div>
            </div>
          )}

          {topMetrics.longestStreak > 0 && (
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-icon">🔥</span>
                <span className="metric-label">{t('dashboard.longestStreak')}</span>
              </div>
              <div className="metric-value">{topMetrics.longestStreak} days</div>
              <div className="metric-subtitle">{t('dashboard.currentBest')}</div>
            </div>
          )}

          {topMetrics.fastestReader && topMetrics.fastestReader.booksCompleted > 0 && (
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-icon">📖</span>
                <span className="metric-label">{t('dashboard.readingSpeed')}</span>
              </div>
              <div className="metric-value">{topMetrics.fastestReader.readingSpeed} pages/day</div>
              <div className="metric-subtitle">
                {topMetrics.fastestReader.booksCompleted} {t('dashboard.booksCompleted')}
              </div>
            </div>
          )}

          {topMetrics.topCategory && (
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-icon">📚</span>
                <span className="metric-label">{t('dashboard.favoriteCategory')}</span>
              </div>
              <div className="metric-value">{topMetrics.topCategory}</div>
              <div className="metric-subtitle">{t('dashboard.mostRead')}</div>
            </div>
          )}
        </div>
      </div>

      {/* Loans Overview */}
      {financialStats?.loans && (
        <div className="loans-section">
          <h3>🏦 {t('financial.loans.title')}</h3>
          <div className="loans-grid">
            <div className="loan-card assets-card">
              <div className="loan-header">
                <span className="loan-icon">💰</span>
                <span className="loan-label">{t('financial.loans.totalAssets')}</span>
              </div>
              <div className="loan-value">
                {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(financialStats.loans.totalAssets)}
              </div>
              <div className="loan-subtitle">
                {financialStats.loans.loansGiven} {t('financial.loans.myLoans')}
              </div>
              <div className="loan-progress">
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${financialStats.loans.totalPrincipalGiven > 0 ? 
                      (financialStats.loans.totalReceived / financialStats.loans.totalPrincipalGiven) * 100 : 0}%` 
                  }}
                />
                <span>
                  {financialStats.loans.totalPrincipalGiven > 0 ? 
                    Math.round((financialStats.loans.totalReceived / financialStats.loans.totalPrincipalGiven) * 100) : 0}%
                  </span>
              </div>
            </div>

            <div className="loan-card liabilities-card">
              <div className="loan-header">
                <span className="loan-icon">💳</span>
                <span className="loan-label">{t('financial.loans.totalLiabilities')}</span>
              </div>
              <div className="loan-value">
                {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(financialStats.loans.totalLiabilities)}
              </div>
              <div className="loan-subtitle">
                {financialStats.loans.loansReceived} {t('financial.loans.myDebts')}
              </div>
              <div className="loan-progress">
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${financialStats.loans.totalPrincipalReceived > 0 ? 
                      (financialStats.loans.totalPaid / financialStats.loans.totalPrincipalReceived) * 100 : 0}%` 
                  }}
                />
                <span>
                  {financialStats.loans.totalPrincipalReceived > 0 ? 
                    Math.round((financialStats.loans.totalPaid / financialStats.loans.totalPrincipalReceived) * 100) : 0}%
                  </span>
              </div>
            </div>

            <div className="loan-card net-worth-card">
              <div className="loan-header">
                <span className="loan-icon">📊</span>
                <span className="loan-label">{t('financial.loans.netWorth')}</span>
              </div>
              <div className="loan-value" style={{ 
                color: financialStats.loans.netWorth >= 0 ? '#10B981' : '#EF4444'
              }}>
                {new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(financialStats.loans.netWorth)}
              </div>
              <div className="loan-subtitle">
                {financialStats.loans.netWorth >= 0 ? t('dashboard.positiveBalance') : t('dashboard.negativeBalance')}
              </div>
              <div className="loan-progress">
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${Math.abs(financialStats.loans.netWorth) > 0 ? 
                      Math.min((Math.abs(financialStats.loans.netWorth) / Math.max(financialStats.loans.totalAssets, financialStats.loans.totalLiabilities)) * 100, 100) : 0}%`,
                    backgroundColor: financialStats.loans.netWorth >= 0 ? '#10B981' : '#EF4444'
                  }}
                />
                <span style={{ color: financialStats.loans.netWorth >= 0 ? '#10B981' : '#EF4444' }}>
                  {Math.abs(financialStats.loans.netWorth) > 0 ? 
                    Math.round((Math.abs(financialStats.loans.netWorth) / Math.max(financialStats.loans.totalAssets, financialStats.loans.totalLiabilities)) * 100) : 0}%
                  </span>
              </div>
            </div>

            <div className="loan-card health-card">
              <div className="loan-header">
                <span className="loan-icon">❤️</span>
                <span className="loan-label">{t('dashboard.financialHealth')}</span>
              </div>
              <div className="loan-value" style={{ 
                color: financialStats?.financialHealth?.financialHealthScore >= 70 ? '#10B981' : 
                       financialStats?.financialHealth?.financialHealthScore >= 40 ? '#F59E0B' : '#EF4444'
              }}>
                {financialStats?.financialHealth?.financialHealthScore || 0}/100
              </div>
              <div className="loan-subtitle">
                {financialStats?.financialHealth?.riskLevel && (
                  <span className={`risk-badge risk-${financialStats.financialHealth.riskLevel}`}>
                    {financialStats.financialHealth.riskLevel.toUpperCase()} RISK
                  </span>
                )}
              </div>
              <div className="loan-progress">
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${financialStats?.financialHealth?.financialHealthScore || 0}%`,
                    backgroundColor: financialStats?.financialHealth?.financialHealthScore >= 70 ? '#10B981' : 
                                   financialStats?.financialHealth?.financialHealthScore >= 40 ? '#F59E0B' : '#EF4444'
                  }}
                />
                <span>{financialStats?.financialHealth?.financialHealthScore || 0}%</span>
              </div>
            </div>
          </div>

          {financialStats.loans.overdueLoans > 0 && (
            <div className="overdue-alert">
              <span className="alert-icon">⚠️</span>
              <span className="alert-text">
                {financialStats.loans.overdueLoans} {t('dashboard.overdueLoans')} {t('dashboard.requireAttention')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="activity-section">
        <h3>📋 {t('dashboard.recentActivity')}</h3>
        <div className="activity-list">
          {recentActivity.map((activity, index) => (
            <div key={index} className={`activity-item activity-${activity.type}`}>
              <div className="activity-icon">
                {activity.type === 'todo' && '✅'}
                {activity.type === 'habit' && '🎯'}
                {activity.type === 'reading' && '📚'}
              </div>
              <div className="activity-content">
                <div className="activity-title">
                  {activity.type === 'todo' && activity.title}
                  {activity.type === 'habit' && activity.name}
                  {activity.type === 'reading' && `${activity.title} by ${activity.author}`}
                </div>
                <div className="activity-meta">
                  <span className="activity-date">
                    {activity.type === 'todo' && activity.completedAt && 
                      new Date(activity.completedAt).toLocaleDateString()
                    }
                    {activity.type === 'habit' && activity.lastCompletion && 
                      new Date(activity.lastCompletion).toLocaleDateString()
                    }
                    {activity.type === 'reading' && activity.completedAt && 
                      new Date(activity.completedAt).toLocaleDateString()
                    }
                  </span>
                  {activity.type === 'todo' && (
                    <span className={`activity-priority priority-${activity.priority}`}>
                      {activity.priority}
                    </span>
                  )}
                  {activity.type === 'habit' && (
                    <span className="activity-streak">
                      🔥 {activity.streak} day streak
                    </span>
                  )}
                  {activity.type === 'reading' && (
                    <span className="activity-progress">
                      📖 {activity.progress}% complete
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          background: linear-gradient(135deg, #667EEA, #4C51BF);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .dashboard-header h2 {
          margin: 0;
          color: white;
          font-size: 1.8rem;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .refresh-btn, .data-export-btn {
          background: white;
          color: #667EEA;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover, .data-export-btn:hover {
          background: #f0f4ff;
          transform: translateY(-2px);
        }

        .data-export-section {
          margin-bottom: 30px;
        }

        .overview-section {
          margin-bottom: 30px;
        }

        .overview-section h3 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
          font-size: 1.2rem;
        }

        .overview-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .stat-icon {
          font-size: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-color);
          color: white;
          border-radius: 8px;
        }

        .stat-label {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: bold;
          color: var(--text-primary);
          margin-bottom: 5px;
        }

        .stat-subtitle {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 10px;
        }

        .stat-progress {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: var(--bg-primary);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar span {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .quick-stats-section {
          margin-bottom: 30px;
        }

        .quick-stats-section h3 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
          font-size: 1.2rem;
        }

        .quick-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .quick-stat {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
        }

        .quick-stat:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .quick-stat-icon {
          font-size: 20px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-color);
          color: white;
          border-radius: 6px;
        }

        .quick-stat-content {
          flex: 1;
        }

        .quick-stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--text-primary);
          line-height: 1;
        }

        .quick-stat-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .metrics-section {
          margin-bottom: 30px;
        }

        .metrics-section h3 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
          font-size: 1.2rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .metric-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .metric-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .metric-icon {
          font-size: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #F59E0B, #D97706);
          color: white;
          border-radius: 8px;
        }

        .metric-label {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .metric-value {
          font-size: 1.8rem;
          font-weight: bold;
          color: var(--text-primary);
          margin-bottom: 5px;
        }

        .metric-subtitle {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .activity-section {
          margin-bottom: 30px;
        }

        .activity-section h3 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
          font-size: 1.2rem;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .activity-item {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 15px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          transition: all 0.3s ease;
        }

        .activity-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .activity-icon {
          font-size: 20px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          flex-shrink: 0;
        }

        .activity-todo .activity-icon {
          background: #10B981;
          color: white;
        }

        .activity-habit .activity-icon {
          background: #F59E0B;
          color: white;
        }

        .activity-reading .activity-icon {
          background: #3B82F6;
          color: white;
        }

        .activity-content {
          flex: 1;
        }

        .activity-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 5px;
          line-height: 1.3;
        }

        .activity-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .activity-date {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .activity-priority {
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .priority-urgent {
          background: #EF4444;
          color: white;
        }

        .priority-high {
          background: #F59E0B;
          color: white;
        }

        .priority-medium {
          background: #3B82F6;
          color: white;
        }

        .priority-low {
          background: #10B981;
          color: white;
        }

        .activity-streak {
          font-size: 0.8rem;
          color: #F59E0B;
          font-weight: 500;
        }

        .activity-progress {
          font-size: 0.8rem;
          color: #3B82F6;
          font-weight: 500;
        }

        .loans-section {
          margin-bottom: 30px;
        }

        .loans-section h3 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
          font-size: 1.2rem;
        }

        .loans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .loan-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .loan-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .loan-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--accent-color), #10B981);
        }

        .assets-card::before {
          background: linear-gradient(90deg, #10B981, #059669);
        }

        .liabilities-card::before {
          background: linear-gradient(90deg, #EF4444, #DC2626);
        }

        .net-worth-card::before {
          background: linear-gradient(90deg, #3B82F6, #2563EB);
        }

        .health-card::before {
          background: linear-gradient(90deg, #F59E0B, #D97706);
        }

        .loan-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .loan-icon {
          font-size: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-color);
          color: white;
          border-radius: 8px;
        }

        .assets-card .loan-icon {
          background: #10B981;
        }

        .liabilities-card .loan-icon {
          background: #EF4444;
        }

        .net-worth-card .loan-icon {
          background: #3B82F6;
        }

        .health-card .loan-icon {
          background: #F59E0B;
        }

        .loan-label {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .loan-value {
          font-size: 1.8rem;
          font-weight: bold;
          color: var(--text-primary);
          margin-bottom: 5px;
        }

        .loan-subtitle {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .risk-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .risk-low {
          background: #10B981;
          color: white;
        }

        .risk-medium {
          background: #F59E0B;
          color: white;
        }

        .risk-high {
          background: #EF4444;
          color: white;
        }

        .loan-progress {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .overdue-alert {
          background: #FEF2F2;
          border: 1px solid #FEE2E2;
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #991B1B;
          margin-top: 15px;
        }

        .alert-icon {
          font-size: 18px;
          animation: pulse 2s infinite;
        }

        .alert-text {
          font-size: 0.9rem;
          font-weight: 500;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }

          .header-actions {
            justify-content: center;
          }

          .overview-cards {
            grid-template-columns: 1fr;
          }

          .quick-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .dashboard {
            padding: 15px;
          }

          .overview-cards {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .quick-stats-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .quick-stat {
            padding: 12px;
          }

          .quick-stat-icon {
            width: 32px;
            height: 32px;
            font-size: 18px;
          }

          .quick-stat-value {
            font-size: 1.2rem;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
