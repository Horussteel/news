import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import gmailService from '../lib/gmailService';
import { useTranslation } from '../contexts/LanguageContext';

const GmailWidget = () => {
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const [gmailData, setGmailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      loadGmailData();
    } else if (status === 'unauthenticated') {
      setLoading(false);
      setError('Vă rugăm să vă autentificați pentru a vedea emailurile');
    }
  }, [status, session]);

  const loadGmailData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📧 Gmail: Loading data for session:', {
        hasAccessToken: !!session?.accessToken,
        accessTokenLength: session?.accessToken?.length,
        userEmail: session?.user?.email
      });
      
      const gmailStats = await gmailService.getGmailStats(session.accessToken);
      console.log('📧 Gmail: Data received:', gmailStats);
      
      setGmailData(gmailStats);
    } catch (error) {
      console.error('📧 Gmail: Error loading data:', error);
      
      if (error.message === 'UNAUTHORIZED') {
        setError('Trebuie să autorizați accesul la Gmail. Vă rugăm să vă re-autentificați.');
      } else if (error.message.includes('403')) {
        setError('Gmail API nu este activat. Verifică Google Cloud Console.');
      } else if (error.message.includes('401')) {
        setError('Token expirat. Apasă pe "Re-autentificare Gmail".');
      } else {
        setError(`Eroare la încărcarea Gmail: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    gmailService.clearCache();
    loadGmailData();
  };

  const handleReauth = () => {
    fetch('/api/auth/signout', { method: 'POST' })
      .then(() => {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/auth/signin?prompt=consent';
      });
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return '#10b981';
      case 'down': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (status === 'loading') {
    return (
      <div className="gmail-widget">
        <div className="gmail-header">
          <h3>📧 Gmail</h3>
        </div>
        <div className="gmail-loading">
          <div className="gmail-spinner"></div>
          <span>Se încarcă...</span>
        </div>
        <style jsx>{`
          .gmail-widget {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
          }

          .gmail-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .gmail-header h3 {
            margin: 0;
            color: var(--text-primary);
            font-size: 1.2rem;
          }

          .gmail-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            padding: 20px;
            color: var(--text-secondary);
          }

          .gmail-spinner {
            width: 24px;
            height: 24px;
            border: 2px solid var(--border-color);
            border-top: 2px solid var(--accent-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (status === 'unauthenticated' || error) {
    return (
      <div className="gmail-widget">
        <div className="gmail-header">
          <h3>📧 Gmail</h3>
        </div>
        <div className="gmail-error">
          <div className="error-icon">🔒</div>
          <div className="error-message">
            {error || 'Conectați-vă pentru a vedea emailurile'}
          </div>
          {status === 'unauthenticated' && (
            <button 
              className="signin-btn"
              onClick={() => window.location.href = '/auth/signin'}
            >
              Conectare Google
            </button>
          )}
          {status === 'authenticated' && (
            <button 
              className="reauth-btn"
              onClick={handleReauth}
            >
              🔑 Re-autentificare Gmail
            </button>
          )}
        </div>
        <style jsx>{`
          .gmail-widget {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
          }

          .gmail-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .gmail-header h3 {
            margin: 0;
            color: var(--text-primary);
            font-size: 1.2rem;
          }

          .gmail-error {
            text-align: center;
            padding: 20px;
            color: var(--text-secondary);
          }

          .error-icon {
            font-size: 2rem;
            margin-bottom: 10px;
          }

          .error-message {
            margin-bottom: 15px;
            font-size: 0.9rem;
          }

          .signin-btn {
            background: var(--accent-color);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .signin-btn:hover, .reauth-btn:hover {
            background: #38a169;
          }

          .reauth-btn {
            background: #f59e0b;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            margin-top: 10px;
          }
        `}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="gmail-widget">
        <div className="gmail-header">
          <h3>📧 Gmail</h3>
          <button className="refresh-btn" onClick={handleRefresh}>
            🔄
          </button>
        </div>
        <div className="gmail-loading">
          <div className="gmail-spinner"></div>
          <span>Se încarcă...</span>
        </div>
        <style jsx>{`
          .gmail-widget {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
          }

          .gmail-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .gmail-header h3 {
            margin: 0;
            color: var(--text-primary);
            font-size: 1.2rem;
          }

          .refresh-btn {
            background: transparent;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 6px 10px;
            cursor: pointer;
            font-size: 1.2rem;
            transition: all 0.3s ease;
          }

          .refresh-btn:hover {
            background: var(--bg-primary);
            border-color: var(--accent-color);
          }

          .gmail-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            padding: 20px;
            color: var(--text-secondary);
          }

          .gmail-spinner {
            width: 24px;
            height: 24px;
            border: 2px solid var(--border-color);
            border-top: 2px solid var(--accent-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="gmail-widget">
      <div className="gmail-header">
        <h3>📧 Gmail</h3>
        <div className="header-actions">
          <button className="view-all-btn" onClick={() => window.location.href = '/gmail'}>
            Vezi toate
          </button>
          <button className="refresh-btn" onClick={handleRefresh}>
            🔄
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="gmail-stats">
        <div className="stat-card">
          <div className="stat-icon unread">📧</div>
          <div className="stat-content">
            <div className="stat-value">{gmailData.unreadCount}</div>
            <div className="stat-label">Necitite</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon today">📅</div>
          <div className="stat-content">
            <div className="stat-value">{gmailData.todayCount}</div>
            <div className="stat-label">Astăzi</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon trend">
            <span style={{ color: getTrendColor(gmailData.trend) }}>
              {getTrendIcon(gmailData.trend)}
            </span>
          </div>
          <div className="stat-content">
            <div className="stat-value">{gmailData.yesterdayCount}</div>
            <div className="stat-label">Ieri</div>
          </div>
        </div>
      </div>

      {/* Recent Messages Preview */}
      {gmailData.recentMessages.length > 0 && (
        <div className="recent-messages">
          <h4>📨 Mesaje recente</h4>
          <div className="messages-list">
            {gmailData.recentMessages.map((message) => (
              <div key={message.id} className={`message-item ${message.isUnread ? 'unread' : ''}`}>
                <div className="message-avatar">
                  {message.from.avatar.type === 'generated' ? (
                    <div 
                      className="generated-avatar"
                      style={{ backgroundColor: message.from.avatar.color }}
                    >
                      {message.from.avatar.initials}
                    </div>
                  ) : (
                    <img src={message.from.avatar.url} alt={message.from.name} />
                  )}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <div className="message-from">{message.from.name}</div>
                    <div className="message-time">{message.timeFormatted}</div>
                  </div>
                  <div className="message-subject">{message.subject}</div>
                  <div className="message-snippet">{message.snippet}</div>
                </div>
                {message.isUnread && (
                  <div className="unread-indicator"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .gmail-widget {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .gmail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .gmail-header h3 {
          margin: 0;
          color: var(--text-primary);
          font-size: 1.2rem;
        }

        .header-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .view-all-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .view-all-btn:hover {
          background: #38a169;
        }

        .refresh-btn {
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 6px 10px;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover {
          background: var(--bg-primary);
          border-color: var(--accent-color);
        }

        .gmail-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--bg-primary);
          border-radius: 10px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-color);
          color: white;
          border-radius: 8px;
        }

        .stat-icon.unread {
          background: #ef4444;
        }

        .stat-icon.today {
          background: #3b82f6;
        }

        .stat-icon.trend {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 1.3rem;
          font-weight: bold;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        .recent-messages {
          margin-top: 20px;
        }

        .recent-messages h4 {
          margin: 0 0 12px 0;
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 600;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .message-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background: var(--bg-primary);
          border-radius: 8px;
          transition: all 0.3s ease;
          position: relative;
          cursor: pointer;
        }

        .message-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .message-item.unread {
          background: linear-gradient(135deg, #3b82f610, #1d4ed810);
          border: 1px solid #3b82f620;
        }

        .message-avatar {
          flex-shrink: 0;
        }

        .generated-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 0.9rem;
        }

        .message-avatar img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
        }

        .message-content {
          flex: 1;
          min-width: 0;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .message-from {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .message-time {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .message-subject {
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .message-snippet {
          font-size: 0.8rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .unread-indicator {
          position: absolute;
          top: 16px;
          right: 12px;
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
        }

        @media (max-width: 768px) {
          .gmail-stats {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .stat-card {
            padding: 12px;
            gap: 10px;
          }

          .stat-icon {
            width: 32px;
            height: 32px;
            font-size: 1.2rem;
          }

          .stat-value {
            font-size: 1.1rem;
          }

          .message-item {
            padding: 10px;
            gap: 10px;
          }

          .generated-avatar {
            width: 32px;
            height: 32px;
            font-size: 0.8rem;
          }

          .message-avatar img {
            width: 32px;
            height: 32px;
          }
        }

        @media (max-width: 480px) {
          .gmail-widget {
            padding: 16px;
          }

          .header-actions {
            flex-direction: column;
            gap: 6px;
          }

          .view-all-btn {
            font-size: 0.7rem;
            padding: 4px 8px;
          }

          .stat-card {
            padding: 10px;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default GmailWidget;
