import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useSession } from 'next-auth/react';
import { useTranslation } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import Layout from '../components/Layout';

const Settings = () => {
  const { t } = useTranslation();
  const { 
    preferences, 
    updatePreferences, 
    resetPreferences, 
    exportUserData, 
    importUserData, 
    clearAllUserData, 
    getUserStatistics,
    isAuthenticated 
  } = useUser();
  const { data: session } = useSession();
  const {
    theme,
    fontSize,
    compactMode,
    accentColor,
    updateTheme,
    updateFontSize,
    updateCompactMode,
    updateAccentColor,
    resetToDefaults
  } = useTheme();
  
  const [formData, setFormData] = useState({});
  const [statistics, setStatistics] = useState(null);
  const [importExportData, setImportExportData] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
    if (isAuthenticated) {
      setStatistics(getUserStatistics());
    }
  }, [preferences, isAuthenticated]);

  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSavePreferences = () => {
    updatePreferences(formData);
    showNotificationMessage(t('settings.preferencesSaved'));
  };

  const handleResetPreferences = () => {
    if (window.confirm(t('settings.confirmResetPreferences'))) {
      resetPreferences();
      showNotificationMessage(t('settings.preferencesReset'));
    }
  };

  const handleExportData = () => {
    const data = exportUserData();
    if (data) {
      const dataStr = JSON.stringify(data, null, 2);
      setImportExportData(dataStr);
      
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-news-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotificationMessage(t('settings.dataExported'));
    }
  };

  const handleImportData = () => {
    if (!importExportData.trim()) {
      showNotificationMessage(t('settings.pasteBackupDataFirst'), 'error');
      return;
    }

    try {
      const data = JSON.parse(importExportData);
      if (window.confirm(t('settings.confirmImportData'))) {
        const success = importUserData(data);
        if (success) {
          showNotificationMessage(t('settings.dataImported'));
          setImportExportData('');
        } else {
          showNotificationMessage(t('settings.failedImportData'), 'error');
        }
      }
    } catch (error) {
      showNotificationMessage(t('settings.invalidDataFormat'), 'error');
    }
  };

  const handleClearAllData = () => {
    if (window.confirm(t('settings.confirmClearAllData'))) {
      if (window.confirm(t('settings.confirmClearAllDataFinal'))) {
        clearAllUserData();
        showNotificationMessage(t('settings.dataCleared'));
      }
    }
  };

  const categories = ['Toate', 'Technology', 'Business', 'Science', 'Health', 'Sports', 'Entertainment'];
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'ro', label: 'Română' }
  ];

  const themes = [
    { value: 'light', label: '🌞 Light', preview: 'bg-white border-gray-300' },
    { value: 'dark', label: '🌙 Dark', preview: 'bg-gray-900 border-gray-700' },
    { value: 'auto', label: '🎨 Auto', preview: 'bg-gradient-to-r from-white to-gray-900 border-gray-500' }
  ];

  if (!isAuthenticated) {
    return (
      <Layout title={t('settings.title')} description={t('settings.description')}>
        <div className="settings-page">
          <div className="auth-required">
            <div className="auth-icon">🔒</div>
            <h2>{t('settings.authenticationRequired')}</h2>
            <p>{t('settings.pleaseSignIn')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t('settings.title')} description={t('settings.description')}>
      <div className="settings-page">
        {/* Notification Toast */}
        {showNotification && (
          <div className={`notification-toast ${notificationType}`}>
            <div className="notification-content">
              <span className="notification-icon">
                {notificationType === 'success' ? '✅' : '❌'}
              </span>
              <span className="notification-text">{notificationMessage}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="settings-header">
          <div className="header-content">
            <h1>{t('settings.title')}</h1>
            <p className="header-subtitle">{t('settings.description')}</p>
          </div>
          <div className="user-profile-card">
            <img 
              src={session.user.image} 
              alt={session.user.name}
              className="user-avatar"
              referrerPolicy="no-referrer"
            />
            <div className="user-info">
              <span className="user-name">{session.user.name}</span>
              <span className="user-email">{session.user.email}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="settings-nav">
          <button 
            className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="tab-icon">👤</span>
            <span className="tab-label">{t('settings.general')}</span>
          </button>
          <button 
            className={`nav-tab ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <span className="tab-icon">🎨</span>
            <span className="tab-label">{t('settings.appearance')}</span>
          </button>
          <button 
            className={`nav-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <span className="tab-icon">🔔</span>
            <span className="tab-label">{t('settings.notifications')}</span>
          </button>
          <button 
            className={`nav-tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <span className="tab-icon">💾</span>
            <span className="tab-label">{t('settings.dataManagement')}</span>
          </button>
          <button 
            className={`nav-tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <span className="tab-icon">ℹ️</span>
            <span className="tab-label">{t('settings.about')}</span>
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="tab-content">
              <h2>{t('settings.profileSettings')}</h2>
              
              <div className="settings-grid">
                <div className="setting-card">
                  <div className="setting-header">
                    <span className="setting-icon">🌐</span>
                    <div>
                      <h3>{t('settings.language')}</h3>
                      <p>{t('settings.chooseLanguage')}</p>
                    </div>
                  </div>
                  <select 
                    name="language" 
                    value={formData.language || 'en'} 
                    onChange={handleInputChange}
                    className="setting-select"
                  >
                    {languages.map(lang => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="setting-card">
                  <div className="setting-header">
                    <span className="setting-icon">📂</span>
                    <div>
                      <h3>{t('settings.defaultCategory')}</h3>
                      <p>Default news category</p>
                    </div>
                  </div>
                  <select 
                    name="defaultCategory" 
                    value={formData.defaultCategory || 'Toate'} 
                    onChange={handleInputChange}
                    className="setting-select"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="setting-card">
                  <div className="setting-header">
                    <span className="setting-icon">📄</span>
                    <div>
                      <h3>{t('settings.articlesPerPage')}</h3>
                      <p>Number of articles per page</p>
                    </div>
                  </div>
                  <input
                    type="number"
                    name="articlesPerPage"
                    value={formData.articlesPerPage || 20}
                    onChange={handleInputChange}
                    min="5"
                    max="50"
                    className="setting-input"
                  />
                </div>

                <div className="setting-card">
                  <div className="setting-header">
                    <span className="setting-icon">⏰</span>
                    <div>
                      <h3>Time Zone</h3>
                      <p>Your local time zone</p>
                    </div>
                  </div>
                  <select 
                    name="timezone" 
                    value={formData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                    onChange={handleInputChange}
                    className="setting-select"
                  >
                    <option value="Europe/Bucharest">Europe/Bucharest</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="America/Los_Angeles">America/Los_Angeles</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
              </div>

              <div className="settings-actions">
                <button className="btn-primary" onClick={handleSavePreferences}>
                  {t('settings.savePreferences')}
                </button>
                <button className="btn-secondary" onClick={handleResetPreferences}>
                  {t('settings.resetToDefault')}
                </button>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="tab-content">
              <h2>Appearance Settings</h2>
              
              <div className="settings-grid">
                <div className="setting-card full-width">
                  <div className="setting-header">
                    <span className="setting-icon">🎨</span>
                    <div>
                      <h3>Theme</h3>
                      <p>Choose your preferred theme</p>
                    </div>
                  </div>
                  <div className="theme-selector">
                    {themes.map(theme => (
                      <div key={theme.value} className="theme-option">
                        <input
                          type="radio"
                          name="theme"
                          value={theme.value}
                          checked={theme === theme.value}
                          onChange={() => updateTheme(theme.value)}
                          id={`theme-${theme.value}`}
                        />
                        <label htmlFor={`theme-${theme.value}`} className="theme-label">
                          <div className={`theme-preview ${theme.preview}`}></div>
                          <span>{theme.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="setting-card">
                  <div className="setting-header">
                    <span className="setting-icon">🔤</span>
                    <div>
                      <h3>Font Size</h3>
                      <p>Adjust text size</p>
                    </div>
                  </div>
                  <select 
                    name="fontSize" 
                    value={fontSize}
                    onChange={(e) => updateFontSize(e.target.value)}
                    className="setting-select"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                  </select>
                </div>

                <div className="setting-card">
                  <div className="setting-header">
                    <span className="setting-icon">📱</span>
                    <div>
                      <h3>Compact Mode</h3>
                      <p>Show more content with less spacing</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="compactMode"
                      checked={compactMode}
                      onChange={(e) => updateCompactMode(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-card">
                  <div className="setting-header">
                    <span className="setting-icon">🌈</span>
                    <div>
                      <h3>Accent Color</h3>
                      <p>Choose your accent color</p>
                    </div>
                  </div>
                  <div className="color-selector">
                    {['#667eea', '#f56565', '#48bb78', '#ed8936', '#9f7aea'].map(color => (
                      <button
                        key={color}
                        className={`color-option ${accentColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateAccentColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="tab-content">
              <h2>Notification Settings</h2>
              
              <div className="settings-grid">
                <div className="setting-card">
                  <div className="setting-header">
                    <span className="setting-icon">🔔</span>
                    <div>
                      <h3>Browser Notifications</h3>
                      <p>Show desktop notifications</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="browserNotifications"
                      checked={formData.browserNotifications || false}
                      onChange={handleInputChange}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-card">
                  <div className="setting-header">
                    <span className="setting-icon">📧</span>
                    <div>
                      <h3>{t('settings.emailNotifications')}</h3>
                      <p>Daily digest emails (Coming Soon)</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={formData.emailNotifications || false}
                      onChange={handleInputChange}
                      disabled
                    />
                    <span className="slider disabled"></span>
                  </label>
                </div>

                <div className="setting-card">
                  <div className="setting-header">
                    <span className="setting-icon">📰</span>
                    <div>
                      <h3>News Alerts</h3>
                      <p>Notify for breaking news</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="newsAlerts"
                      checked={formData.newsAlerts || true}
                      onChange={handleInputChange}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-card">
                  <div className="setting-header">
                    <span className="setting-icon">✅</span>
                    <div>
                      <h3>Task Reminders</h3>
                      <p>Remind about pending tasks</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="taskReminders"
                      checked={formData.taskReminders || true}
                      onChange={handleInputChange}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-card">
                  <div className="setting-header">
                    <span className="setting-icon">🍅</span>
                    <div>
                      <h3>Pomodoro Alerts</h3>
                      <p>Session completion notifications</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="pomodoroAlerts"
                      checked={formData.pomodoroAlerts || true}
                      onChange={handleInputChange}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-card">
                  <div className="setting-header">
                    <span className="setting-icon">📚</span>
                    <div>
                      <h3>Reading Goals</h3>
                      <p>Daily reading progress updates</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="readingGoals"
                      checked={formData.readingGoals || false}
                      onChange={handleInputChange}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Data Management Tab */}
          {activeTab === 'data' && (
            <div className="tab-content">
              <h2>{t('settings.dataManagementTitle')}</h2>
              
              {statistics && (
                <div className="stats-section">
                  <h3>{t('settings.yourStatistics')}</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-number">{statistics.totalBookmarks}</div>
                      <div className="stat-label">{t('settings.bookmarks')}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{statistics.totalHistoryItems}</div>
                      <div className="stat-label">{t('settings.articlesRead')}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{statistics.totalTodos}</div>
                      <div className="stat-label">Tasks</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{statistics.totalHabits}</div>
                      <div className="stat-label">Habits</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="data-section">
                <h3>{t('settings.backupRestore')}</h3>
                
                <div className="backup-cards">
                  <div className="backup-card export">
                    <div className="backup-icon">📤</div>
                    <h4>{t('settings.exportData')}</h4>
                    <p>{t('settings.exportDataDescription')}</p>
                    <button className="btn-success" onClick={handleExportData}>
                      Export Data
                    </button>
                  </div>

                  <div className="backup-card import">
                    <div className="backup-icon">📥</div>
                    <h4>{t('settings.importData')}</h4>
                    <p>{t('settings.importDataDescription')}</p>
                    <textarea
                      value={importExportData}
                      onChange={(e) => setImportExportData(e.target.value)}
                      placeholder={t('settings.pasteBackupData')}
                      className="import-textarea"
                      rows={4}
                    />
                    <button className="btn-primary" onClick={handleImportData}>
                      Import Data
                    </button>
                  </div>
                </div>
              </div>

              <div className="danger-zone">
                <h3>⚠️ {t('settings.dangerZone')}</h3>
                <div className="danger-content">
                  <div className="danger-info">
                    <h4>{t('settings.clearAllData')}</h4>
                    <p>{t('settings.clearAllDataWarning')}</p>
                  </div>
                  <button className="btn-danger" onClick={handleClearAllData}>
                    Clear All Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="tab-content">
              <div className="about-hero">
                <div className="hero-content">
                  <div className="hero-icon">🚀</div>
                  <h1 className="hero-title">Despre Momentum</h1>
                  <p className="hero-subtitle">
                    Gata, l-am actualizat.
                  </p>
                </div>
              </div>

              <div className="about-content">
                <div className="privacy-section">
                  <div className="privacy-card">
                    <div className="privacy-header">
                      <div className="privacy-icon-large">🔒</div>
                      <h2>Bun venit la Momentum</h2>
                    </div>
                    <div className="privacy-text">
                      <p className="intro-text">
                        O aplicație dezvoltată de Erderom pe un principiu fundamental: <strong>datele dumneavoastră vă aparțin în totalitate.</strong>
                      </p>
                      
                      <p className="architecture-text">
                        Am construit News ERDEROM cu o arhitectură axată pe confidențialitate totală. Aplicația noastră folosește exclusiv stocarea locală (Local Storage) a dispozitivului dumneavoastră.
                      </p>

                      <div className="what-it-means">
                        <h3>Ce înseamnă acest lucru pentru tine?</h3>
                        <p className="highlight-text">
                          Indiferent cât de sensibile sunt informațiile pe care le salvezi în aplicație, acestea nu părăsesc niciodată dispozitivul tău.
                        </p>
                      </div>

                      <div className="privacy-features-modern">
                        <div className="privacy-feature-item">
                          <div className="feature-icon">🚫</div>
                          <div className="feature-content">
                            <h4>Zero baze de date pe server</h4>
                            <p>Noi NU stocăm, colectăm sau procesăm datele tale personale pe serverele noastre.</p>
                          </div>
                        </div>

                        <div className="privacy-feature-item">
                          <div className="feature-icon">🔑</div>
                          <div className="feature-content">
                            <h4>Acces Exclusiv</h4>
                            <p>Doar tu ai acces la informațiile tale, direct de pe telefonul sau computerul tău.</p>
                          </div>
                        </div>

                        <div className="privacy-feature-item">
                          <div className="feature-icon">🛡️</div>
                          <div className="feature-content">
                            <h4>Siguranță Maximă</h4>
                            <p>Totul rămâne local, 100% sub controlul tău.</p>
                          </div>
                        </div>
                      </div>

                      <div className="mission-section">
                        <h3>Misiunea noastră</h3>
                        <p>
                          Misiunea noastră la Erderom este să oferim soluții de digitalizare transparente și sigure, care să îți respecte dreptul la viață privată.
                        </p>
                      </div>

                      <div className="cta-section">
                        <p>
                          Află mai multe despre cum putem accelera digitalizarea afacerii tale vizitând:
                        </p>
                        <a 
                          href="https://webdevfast.ro/digitalizare.html" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="cta-link"
                        >
                          <span className="link-icon">🌐</span>
                          <span>webdevfast.ro/digitalizare.html</span>
                          <span className="link-arrow">→</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="version-section">
                  <div className="version-card">
                    <div className="version-header">
                      <div className="version-icon">📱</div>
                      <h3>Informații Versiune</h3>
                    </div>
                    <div className="version-details">
                      <div className="version-info-modern">
                        <div className="version-number">v2.0.0</div>
                        <div className="version-date">Actualizat: Octombrie 2025</div>
                      </div>
                      <div className="version-features-modern">
                        <span className="feature-badge-modern">🎨 Modern UI</span>
                        <span className="feature-badge-modern">🌐 Multi-language</span>
                        <span className="feature-badge-modern">🔒 Local-first</span>
                        <span className="feature-badge-modern">📄 PDF Export</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .settings-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* Notification Toast */
        .notification-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          animation: slideIn 0.3s ease;
        }

        .notification-toast.success {
          background: #10b981;
          color: white;
        }

        .notification-toast.error {
          background: #ef4444;
          color: white;
        }

        .notification-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .notification-icon {
          font-size: 1.2rem;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Header */
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 2rem;
          background: linear-gradient(135deg, var(--accent-color) 0%, #764ba2 100%);
          border-radius: 16px;
          color: white;
        }

        .header-content h1 {
          font-size: 2.5rem;
          margin: 0 0 0.5rem 0;
        }

        .header-subtitle {
          opacity: 0.95;
          margin: 0;
          color: #ffffff;
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }

        .user-profile-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255,255,255,0.1);
          padding: 1rem;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          color: white;
        }

        .user-email {
          font-size: 0.9rem;
          opacity: 0.8;
          color: white;
        }

        /* Navigation */
        .settings-nav {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          background: var(--bg-secondary);
          padding: 0.5rem;
          border-radius: 12px;
          box-shadow: var(--shadow);
          overflow-x: auto;
        }

        .nav-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: var(--text-secondary);
          font-weight: 500;
          white-space: nowrap;
        }

        .nav-tab:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .nav-tab.active {
          background: var(--accent-color);
          color: white;
        }

        .tab-icon {
          font-size: 1.2rem;
        }

        .tab-label {
          font-size: 0.9rem;
        }

        /* Content */
        .settings-content {
          background: var(--bg-primary);
          border-radius: 12px;
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .tab-content {
          padding: 2rem;
        }

        .tab-content h2 {
          color: var(--text-primary);
          margin-bottom: 2rem;
          font-size: 1.8rem;
          font-weight: 600;
        }

        /* Settings Grid */
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .setting-card {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
        }

        .setting-card:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-2px);
        }

        .setting-card.full-width {
          grid-column: 1 / -1;
        }

        .setting-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .setting-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          border-radius: 8px;
          box-shadow: var(--shadow);
        }

        .setting-header h3 {
          margin: 0;
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 600;
        }

        .setting-header p {
          margin: 0.25rem 0 0 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .setting-select,
        .setting-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .setting-select:focus,
        .setting-input:focus {
          outline: none;
          border-color: var(--accent-color);
        }

        /* Theme Selector */
        .theme-selector {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .theme-option {
          position: relative;
        }

        .theme-option input[type="radio"] {
          position: absolute;
          opacity: 0;
        }

        .theme-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .theme-label:hover {
          border-color: #667eea;
        }

        .theme-option input[type="radio"]:checked + .theme-label {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .theme-preview {
          width: 60px;
          height: 40px;
          border-radius: 4px;
          border: 2px solid;
        }

        /* Color Selector */
        .color-selector {
          display: flex;
          gap: 0.5rem;
        }

        .color-option {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid transparent;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .color-option:hover {
          transform: scale(1.1);
        }

        .color-option.active {
          border-color: #333;
          box-shadow: 0 0 0 2px white, 0 0 0 4px #333;
        }

        /* Switch */
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: var(--accent-color);
        }

        input:checked + .slider:before {
          transform: translateX(26px);
        }

        .slider.disabled {
          background-color: var(--border-color);
          cursor: not-allowed;
        }

        /* Buttons */
        .settings-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
        }

        .btn-primary,
        .btn-secondary,
        .btn-success,
        .btn-danger {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: var(--accent-color);
          color: white;
        }

        .btn-primary:hover {
          background: var(--accent-hover);
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .btn-secondary:hover {
          background: var(--border-color);
        }

        .btn-success {
          background: #10b981;
          color: white;
        }

        .btn-success:hover {
          background: #059669;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        /* Statistics */
        .stats-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: 12px;
        }

        .stats-section h3 {
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          text-align: center;
          padding: 1.5rem;
          background: var(--bg-primary);
          border-radius: 8px;
          box-shadow: var(--shadow);
        }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: bold;
          color: var(--accent-color);
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }

        /* Data Management */
        .data-section {
          margin-bottom: 2rem;
        }

        .data-section h3 {
          margin-bottom: 1.5rem;
          color: #333;
        }

        .backup-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .backup-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #e1e5e9;
          text-align: center;
        }

        .backup-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .backup-card h4 {
          margin-bottom: 0.5rem;
          color: #333;
        }

        .backup-card p {
          color: #666;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .import-textarea {
          width: 100%;
          padding: 1rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-family: monospace;
          font-size: 0.9rem;
          resize: vertical;
          margin-bottom: 1rem;
        }

        /* Danger Zone */
        .danger-zone {
          padding: 2rem;
          background: #fff5f5;
          border: 2px solid #fed7d7;
          border-radius: 12px;
        }

        .danger-zone h3 {
          color: #c53030;
          margin-bottom: 1rem;
        }

        .danger-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .danger-info h4 {
          color: #c53030;
          margin-bottom: 0.5rem;
        }

        .danger-info p {
          color: #c53030;
          font-size: 0.9rem;
          margin: 0;
        }

        /* Modern About Section */
        .about-hero {
          text-align: center;
          margin-bottom: 3rem;
          padding: 3rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          color: white;
          position: relative;
          overflow: hidden;
          animation: heroGradient 8s ease infinite;
        }

        .about-hero::before {
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

        @keyframes heroGradient {
          0%, 100% { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          25% { background: linear-gradient(135deg, #764ba2 0%, #667eea 100%); }
          50% { background: linear-gradient(135deg, #667eea 0%, #9f7aea 100%); }
          75% { background: linear-gradient(135deg, #9f7aea 0%, #764ba2 100%); }
        }

        @keyframes floatingOrbs {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(20px, -20px) rotate(120deg); }
          66% { transform: translate(-20px, 10px) rotate(240deg); }
        }

        .hero-content {
          position: relative;
          z-index: 1;
        }

        .hero-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          animation: fadeInUp 0.8s ease;
        }

        .hero-subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          margin: 0;
          font-style: italic;
          animation: fadeInUp 0.8s ease 0.2s both;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .about-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          align-items: start;
        }

        .privacy-section {
          animation: slideInLeft 0.8s ease 0.4s both;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .privacy-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .privacy-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }

        .privacy-header {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 2rem;
          text-align: center;
          border-bottom: 1px solid #e1e5e9;
        }

        .privacy-icon-large {
          font-size: 3rem;
          margin-bottom: 1rem;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .privacy-header h2 {
          margin: 0;
          color: #333;
          font-size: 1.8rem;
          font-weight: 600;
        }

        .privacy-text {
          padding: 2rem;
        }

        .intro-text {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #333;
          margin-bottom: 1.5rem;
          animation: fadeIn 1s ease 0.6s both;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .architecture-text {
          color: #666;
          line-height: 1.6;
          margin-bottom: 2rem;
          animation: fadeIn 1s ease 0.8s both;
        }

        .what-it-means {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border-left: 4px solid #667eea;
          animation: slideInRight 0.8s ease 1s both;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .what-it-means h3 {
          color: #333;
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }

        .highlight-text {
          color: #667eea;
          font-weight: 600;
          font-size: 1.1rem;
          line-height: 1.6;
        }

        .privacy-features-modern {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .privacy-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          border: 1px solid #e1e5e9;
          transition: all 0.3s ease;
          animation: fadeInUp 0.8s ease 1.2s both;
        }

        .privacy-feature-item:nth-child(1) { animation-delay: 1.2s; }
        .privacy-feature-item:nth-child(2) { animation-delay: 1.4s; }
        .privacy-feature-item:nth-child(3) { animation-delay: 1.6s; }

        .privacy-feature-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          border-color: #667eea;
        }

        .feature-icon {
          font-size: 2rem;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          flex-shrink: 0;
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .feature-content h4 {
          color: #333;
          margin-bottom: 0.5rem;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .feature-content p {
          color: #666;
          line-height: 1.5;
          margin: 0;
        }

        .mission-section {
          background: linear-gradient(135deg, #4c51bf 0%, #667eea 100%);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          color: white;
          animation: fadeIn 1s ease 1.8s both;
          position: relative;
          box-shadow: 0 8px 25px rgba(76, 29, 149, 0.3);
        }

        .mission-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          z-index: 1;
        }

        .mission-section::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          border-radius: 12px;
          z-index: 1;
        }

        .mission-section > * {
          position: relative;
          z-index: 3;
        }

        .mission-section h3 {
          color: #ffffff;
          margin-bottom: 1rem;
          font-size: 1.3rem;
          text-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.5),
            0 0 20px rgba(255, 255, 255, 0.3);
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .mission-section p {
          line-height: 1.7;
          margin: 0;
          color: #ffffff;
          text-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.4),
            0 0 15px rgba(255, 255, 255, 0.2);
          font-weight: 600;
          font-size: 1.05rem;
        }

        /* Force visibility in all themes */
        .mission-section,
        .mission-section h3,
        .mission-section p {
          color: #ffffff !important;
        }

        /* Enhanced light mode visibility */
        @media (prefers-color-scheme: light) {
          .mission-section {
            background: linear-gradient(135deg, #3730a3 0%, #4c51bf 100%);
            box-shadow: 0 8px 30px rgba(55, 48, 163, 0.4);
          }
          
          .mission-section h3 {
            text-shadow: 
              0 2px 4px rgba(0, 0, 0, 0.6),
              0 0 25px rgba(255, 255, 255, 0.4);
          }
          
          .mission-section p {
            text-shadow: 
              0 1px 3px rgba(0, 0, 0, 0.5),
              0 0 20px rgba(255, 255, 255, 0.3);
          }
        }

        /* Dark mode enhancement */
        @media (prefers-color-scheme: dark) {
          .mission-section {
            background: linear-gradient(135deg, #4c51bf 0%, #667eea 100%);
            box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .mission-section {
            background: #000000;
            border: 2px solid #ffffff;
          }
          
          .mission-section h3,
          .mission-section p {
            color: #ffffff !important;
            text-shadow: none;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .mission-section {
            animation: none;
          }
        }

        .cta-section {
          text-align: center;
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 12px;
          animation: fadeIn 1s ease 2s both;
        }

        .cta-section p {
          color: #666;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .cta-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .cta-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .link-icon {
          font-size: 1.2rem;
        }

        .link-arrow {
          transition: transform 0.3s ease;
        }

        .cta-link:hover .link-arrow {
          transform: translateX(5px);
        }

        .version-section {
          animation: slideInRight 0.8s ease 0.6s both;
        }

        .version-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          overflow: hidden;
          transition: all 0.3s ease;
          height: 100%;
        }

        .version-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }

        .version-header {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 1.5rem;
          text-align: center;
          border-bottom: 1px solid #e1e5e9;
        }

        .version-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          animation: rotate 3s ease-in-out infinite;
        }

        @keyframes rotate {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(10deg); }
          75% { transform: rotate(-10deg); }
        }

        .version-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .version-details {
          padding: 1.5rem;
          text-align: center;
        }

        .version-info-modern {
          margin-bottom: 1.5rem;
        }

        .version-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .version-date {
          color: #666;
          font-size: 0.9rem;
        }

        .version-features-modern {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .feature-badge-modern {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          box-shadow: 0 2px 10px rgba(102, 126, 234, 0.2);
          transition: all 0.3s ease;
        }

        .feature-badge-modern:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        /* Responsive for About Section */
        @media (max-width: 768px) {
          .about-hero {
            padding: 2rem 1rem;
            margin-bottom: 2rem;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .about-content {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .privacy-header,
          .privacy-text,
          .cta-section {
            padding: 1.5rem;
          }

          .privacy-feature-item {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .feature-icon {
            margin: 0 auto;
          }

          .version-header,
          .version-details {
            padding: 1rem;
          }

          .version-number {
            font-size: 2rem;
          }
        }

        @media (max-width: 480px) {
          .hero-icon {
            font-size: 3rem;
          }

          .privacy-header h2 {
            font-size: 1.5rem;
          }

          .privacy-feature-item {
            padding: 1rem;
          }

          .feature-icon {
            width: 50px;
            height: 50px;
            font-size: 1.5rem;
          }

          .cta-link {
            padding: 0.75rem 1.5rem;
            font-size: 0.9rem;
          }
        }

        /* Auth Required */
        .auth-required {
          text-align: center;
          padding: 4rem 2rem;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .auth-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .auth-required h2 {
          color: #666;
          margin-bottom: 1rem;
        }

        .auth-required p {
          color: #999;
          max-width: 400px;
          margin: 0 auto;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .settings-page {
            padding: 1rem;
          }

          .settings-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .settings-header h1 {
            font-size: 2rem;
          }

          .settings-nav {
            flex-wrap: wrap;
          }

          .nav-tab {
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
          }

          .tab-content {
            padding: 1rem;
          }

          .settings-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .settings-actions {
            flex-direction: column;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .backup-cards {
            grid-template-columns: 1fr;
          }

          .danger-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .about-grid {
            grid-template-columns: 1fr;
          }

          .theme-selector {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .tech-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </Layout>
  );
};

export default Settings;
