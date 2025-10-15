import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';

const Settings = () => {
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
  
  const [formData, setFormData] = useState({});
  const [statistics, setStatistics] = useState(null);
  const [importExportData, setImportExportData] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
    if (isAuthenticated) {
      setStatistics(getUserStatistics());
    }
  }, [preferences, isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSavePreferences = () => {
    updatePreferences(formData);
    alert('Preferences saved successfully!');
  };

  const handleResetPreferences = () => {
    if (window.confirm('Are you sure you want to reset all preferences to default?')) {
      resetPreferences();
      alert('Preferences reset to default!');
    }
  };

  const handleExportData = () => {
    const data = exportUserData();
    if (data) {
      const dataStr = JSON.stringify(data, null, 2);
      setImportExportData(dataStr);
      
      // Create download link
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-news-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Data exported successfully!');
    }
  };

  const handleImportData = () => {
    if (!importExportData.trim()) {
      alert('Please paste the backup data first.');
      return;
    }

    try {
      const data = JSON.parse(importExportData);
      if (window.confirm('Are you sure you want to import this data? This will replace all your current data.')) {
        const success = importUserData(data);
        if (success) {
          alert('Data imported successfully!');
          setImportExportData('');
        } else {
          alert('Failed to import data. Please check the format.');
        }
      }
    } catch (error) {
      alert('Invalid data format. Please check and try again.');
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear ALL your data? This action cannot be undone.')) {
      if (window.confirm('This will delete all bookmarks, history, and preferences. Are you absolutely sure?')) {
        clearAllUserData();
        alert('All data cleared successfully!');
      }
    }
  };

  const categories = ['Toate', 'Technology', 'Business', 'Science', 'Health', 'Sports', 'Entertainment'];
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'ro', label: 'Română' }
  ];

  if (!isAuthenticated) {
    return (
      <Layout title="Settings" description="Manage your preferences and account settings">
        <div className="settings-page">
          <div className="auth-required">
            <svg className="lock-icon" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <h2>Authentication Required</h2>
            <p>Please sign in to access your settings and manage your data.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Settings" description="Manage your preferences and account settings">
      <div className="settings-page">
        <div className="settings-header">
          <h1>Settings</h1>
          <div className="user-info">
            <img 
              src={session.user.image} 
              alt={session.user.name}
              className="user-avatar"
              referrerPolicy="no-referrer"
            />
            <div className="user-details">
              <span className="user-name">{session.user.name}</span>
              <span className="user-email">{session.user.email}</span>
            </div>
          </div>
        </div>

        <div className="settings-tabs">
          <button 
            className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button 
            className={`tab-button ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Data Management
          </button>
          <button 
            className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h2>General Preferences</h2>
              
              <div className="setting-group">
                <label className="setting-label">
                  <span className="setting-name">Language</span>
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
                </label>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <span className="setting-name">Default Category</span>
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
                </label>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <span className="setting-name">Articles per page</span>
                  <input
                    type="number"
                    name="articlesPerPage"
                    value={formData.articlesPerPage || 20}
                    onChange={handleInputChange}
                    min="5"
                    max="50"
                    className="setting-input"
                  />
                </label>
              </div>

              <div className="setting-group">
                <label className="setting-label checkbox-label">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={formData.emailNotifications || false}
                    onChange={handleInputChange}
                    className="setting-checkbox"
                  />
                  <span className="setting-name">Email notifications</span>
                </label>
              </div>

              <div className="setting-group">
                <label className="setting-label checkbox-label">
                  <input
                    type="checkbox"
                    name="autoSaveHistory"
                    checked={formData.autoSaveHistory || true}
                    onChange={handleInputChange}
                    className="setting-checkbox"
                  />
                  <span className="setting-name">Auto-save reading history</span>
                </label>
              </div>

              <div className="setting-group">
                <label className="setting-label checkbox-label">
                  <input
                    type="checkbox"
                    name="showBookmarksBadge"
                    checked={formData.showBookmarksBadge || true}
                    onChange={handleInputChange}
                    className="setting-checkbox"
                  />
                  <span className="setting-name">Show bookmarks badge</span>
                </label>
              </div>

              <div className="settings-actions">
                <button className="save-btn" onClick={handleSavePreferences}>
                  Save Preferences
                </button>
                <button className="reset-btn" onClick={handleResetPreferences}>
                  Reset to Default
                </button>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="settings-section">
              <h2>Data Management</h2>
              
              {statistics && (
                <div className="statistics-section">
                  <h3>Your Statistics</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-number">{statistics.totalBookmarks}</span>
                      <span className="stat-label">Bookmarks</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{statistics.totalHistoryItems}</span>
                      <span className="stat-label">Articles Read</span>
                    </div>
                    {statistics.mostReadSource && (
                      <div className="stat-item">
                        <span className="stat-number">{statistics.mostReadSource.count}</span>
                        <span className="stat-label">Most Read: {statistics.mostReadSource.source}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="data-section">
                <h3>Backup & Restore</h3>
                
                <div className="backup-section">
                  <button className="export-btn" onClick={handleExportData}>
                    Export Data
                  </button>
                  <p className="section-description">
                    Download a backup of all your bookmarks, history, and preferences.
                  </p>
                </div>

                <div className="import-section">
                  <textarea
                    value={importExportData}
                    onChange={(e) => setImportExportData(e.target.value)}
                    placeholder="Paste your backup data here..."
                    className="import-textarea"
                    rows={6}
                  />
                  <button className="import-btn" onClick={handleImportData}>
                    Import Data
                  </button>
                  <p className="section-description">
                    Import your previously exported data to restore your bookmarks and preferences.
                  </p>
                </div>
              </div>

              <div className="danger-zone">
                <h3>Danger Zone</h3>
                <div className="danger-actions">
                  <button className="clear-all-btn" onClick={handleClearAllData}>
                    Clear All Data
                  </button>
                  <p className="warning-text">
                    This will permanently delete all your bookmarks, reading history, and preferences. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="settings-section">
              <h2>About AI News Platform</h2>
              
              <div className="about-content">
                <div className="about-section">
                  <h3>Features</h3>
                  <ul className="feature-list">
                    <li>📰 Real-time news aggregation from multiple sources</li>
                    <li>🎥 YouTube video integration for tech content</li>
                    <li>🔖 Bookmark articles for later reading</li>
                    <li>📚 Reading history tracking</li>
                    <li>🌐 Multi-language support (English/Romanian)</li>
                    <li>⚙️ Customizable preferences</li>
                    <li>💾 Local data storage</li>
                    <li>🔐 Secure Google authentication</li>
                  </ul>
                </div>

                <div className="about-section">
                  <h3>Data Privacy</h3>
                  <p>
                    All your personal data (bookmarks, reading history, preferences) is stored locally in your browser. 
                    We do not collect or store any personal information on our servers.
                  </p>
                </div>

                <div className="about-section">
                  <h3>Technologies Used</h3>
                  <ul className="tech-list">
                    <li>Next.js 14 - React framework</li>
                    <li>NextAuth.js - Authentication</li>
                    <li>NewsAPI.org - News aggregation</li>
                    <li>YouTube Data API - Video content</li>
                    <li>LocalStorage - Client-side data storage</li>
                    <li>CSS3 & JavaScript - User interface</li>
                  </ul>
                </div>

                <div className="about-section">
                  <h3>Version</h3>
                  <p>AI News Platform v1.0.0</p>
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

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e1e5e9;
        }

        .settings-header h1 {
          font-size: 2.5rem;
          color: #333;
          margin: 0;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          color: #333;
        }

        .user-email {
          font-size: 0.9rem;
          color: #666;
        }

        .settings-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #e1e5e9;
        }

        .tab-button {
          padding: 1rem 2rem;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          font-size: 1rem;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-button:hover {
          color: #333;
        }

        .tab-button.active {
          color: #667eea;
          border-bottom-color: #667eea;
        }

        .settings-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .settings-section {
          padding: 2rem;
        }

        .settings-section h2 {
          color: #333;
          margin-bottom: 2rem;
          font-size: 1.8rem;
        }

        .setting-group {
          margin-bottom: 1.5rem;
        }

        .setting-label {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .setting-name {
          font-weight: 500;
          color: #333;
        }

        .setting-select,
        .setting-input {
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .setting-select:focus,
        .setting-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .checkbox-label {
          flex-direction: row;
          align-items: center;
          gap: 0.5rem;
        }

        .setting-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .settings-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e1e5e9;
        }

        .save-btn,
        .reset-btn {
          padding: 0.75rem 2rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .save-btn {
          background: #667eea;
          color: white;
        }

        .save-btn:hover {
          background: #5a67d8;
        }

        .reset-btn {
          background: #e1e5e9;
          color: #333;
        }

        .reset-btn:hover {
          background: #d1d5d9;
        }

        .statistics-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .statistics-section h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .stat-item {
          text-align: center;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: bold;
          color: #667eea;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #666;
        }

        .data-section {
          margin-bottom: 2rem;
        }

        .data-section h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        .backup-section,
        .import-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .export-btn,
        .import-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 1rem;
        }

        .export-btn {
          background: #28a745;
          color: white;
        }

        .export-btn:hover {
          background: #218838;
        }

        .import-btn {
          background: #007bff;
          color: white;
        }

        .import-btn:hover {
          background: #0056b3;
        }

        .section-description {
          color: #666;
          font-size: 0.9rem;
          margin: 0;
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

        .danger-zone {
          padding: 2rem;
          background: #fff5f5;
          border: 2px solid #fed7d7;
          border-radius: 8px;
        }

        .danger-zone h3 {
          color: #c53030;
          margin-bottom: 1rem;
        }

        .danger-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .clear-all-btn {
          padding: 0.75rem 1.5rem;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s ease;
          align-self: flex-start;
        }

        .clear-all-btn:hover {
          background: #c82333;
        }

        .warning-text {
          color: #c53030;
          font-size: 0.9rem;
          margin: 0;
          max-width: 400px;
        }

        .about-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .about-section {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .about-section h3 {
          color: #333;
          margin-bottom: 1rem;
        }

        .feature-list,
        .tech-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .feature-list li,
        .tech-list li {
          padding: 0.5rem 0;
          color: #666;
        }

        .about-section p {
          color: #666;
          line-height: 1.6;
          margin: 0;
        }

        .auth-required {
          text-align: center;
          padding: 4rem 2rem;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .lock-icon {
          width: 64px;
          height: 64px;
          fill: #ccc;
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

        @media (max-width: 768px) {
          .settings-page {
            padding: 1rem;
          }

          .settings-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .settings-header h1 {
            font-size: 2rem;
          }

          .settings-tabs {
            flex-wrap: wrap;
          }

          .tab-button {
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
          }

          .settings-section {
            padding: 1rem;
          }

          .settings-actions {
            flex-direction: column;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Settings;
