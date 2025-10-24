import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import gmailService from '../lib/gmailService';
import { useTranslation } from '../contexts/LanguageContext';

const GmailPage = () => {
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      loadMessages();
    } else if (status === 'unauthenticated') {
      setLoading(false);
      setError('Vă rugăm să vă autentificați pentru a vedea emailurile');
    }
  }, [status, session]);

  const loadMessages = async (messageFilter = filter, query = searchQuery) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📧 Gmail: Loading messages with filter:', messageFilter, 'query:', query);
      
      let gmailMessages = [];
      
      if (messageFilter === 'unread') {
        gmailMessages = await gmailService.getUnreadMessages(session.accessToken);
      } else if (messageFilter === 'today') {
        gmailMessages = await gmailService.getTodayMessages(session.accessToken);
      } else if (messageFilter === 'important') {
        gmailMessages = await gmailService.getImportantMessages(session.accessToken);
      } else {
        gmailMessages = await gmailService.getGmailMessages(session.accessToken, query, 50);
      }
      
      // Aplică search query dacă există
      if (query && messageFilter === 'all') {
        gmailMessages = gmailMessages.filter(msg => 
          msg.subject.toLowerCase().includes(query.toLowerCase()) ||
          msg.from.name.toLowerCase().includes(query.toLowerCase()) ||
          msg.snippet.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      console.log('📧 Gmail: Messages loaded:', gmailMessages.length);
      setMessages(gmailMessages);
    } catch (error) {
      console.error('📧 Gmail: Error loading messages:', error);
      
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
    loadMessages();
  };

  const handleReauth = () => {
    fetch('/api/auth/signout', { method: 'POST' })
      .then(() => {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/auth/signin?prompt=consent';
      });
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setSearchQuery('');
    loadMessages(newFilter, '');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      setFilter('all');
      loadMessages('all', query);
    } else {
      loadMessages(filter, '');
    }
  };

  const formatMessageTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 7) {
      return messageDate.toLocaleDateString('ro-RO');
    } else if (diffDays > 0) {
      return `Acum ${diffDays} zile`;
    } else if (diffHours > 0) {
      return `Acum ${diffHours} ore`;
    } else if (diffHours > -1) {
      return 'Ieri';
    } else if (diffHours > -24) {
      return `Acum ${Math.abs(diffHours)} ore`;
    } else {
      return messageDate.toLocaleTimeString('ro-RO', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getMessagePriority = (message) => {
    if (message.isImportant && message.isUnread) return 'high';
    if (message.isUnread) return 'medium';
    if (message.isImportant) return 'low';
    return 'normal';
  };

  if (status === 'loading') {
    return (
      <div className="gmail-page">
        <div className="gmail-header">
          <h1>📧 Gmail</h1>
        </div>
        <div className="gmail-loading">
          <div className="gmail-spinner"></div>
          <span>Se încarcă...</span>
        </div>
        <style jsx>{`
          .gmail-page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }

          .gmail-header {
            margin-bottom: 30px;
            text-align: center;
          }

          .gmail-header h1 {
            color: var(--text-primary);
            font-size: 2.5rem;
            margin: 0;
            background: linear-gradient(135deg, #EA4335, #4285F4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .gmail-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            padding: 60px 20px;
            text-align: center;
          }

          .gmail-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid var(--border-color);
            border-top: 4px solid var(--accent-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .gmail-loading span {
            color: var(--text-secondary);
            font-size: 1.2rem;
          }
        `}</style>
      </div>
    );
  }

  if (status === 'unauthenticated' || error) {
    return (
      <div className="gmail-page">
        <div className="gmail-header">
          <h1>📧 Gmail</h1>
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
          .gmail-page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }

          .gmail-header {
            margin-bottom: 30px;
            text-align: center;
          }

          .gmail-header h1 {
            color: var(--text-primary);
            font-size: 2.5rem;
            margin: 0;
            background: linear-gradient(135deg, #EA4335, #4285F4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .gmail-error {
            text-align: center;
            padding: 60px 20px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 12px;
          }

          .error-icon {
            font-size: 4rem;
            margin-bottom: 20px;
          }

          .error-message {
            font-size: 1.2rem;
            color: var(--text-secondary);
            margin-bottom: 30px;
          }

          .signin-btn {
            background: var(--accent-color);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 500;
            transition: all 0.3s ease;
          }

          .signin-btn:hover, .reauth-btn:hover {
            background: #38a169;
            transform: translateY(-2px);
          }

          .reauth-btn {
            background: #f59e0b;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 500;
            transition: all 0.3s ease;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="gmail-page">
      <div className="gmail-header">
        <h1>📧 Gmail</h1>
        <div className="header-actions">
          <button className="refresh-btn" onClick={handleRefresh}>
            🔄
          </button>
          <button className="back-btn" onClick={() => window.location.href = '/dashboard'}>
            🏠 Dashboard
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Caută emailuri..."
              className="search-input"
            />
            <button type="submit" className="search-btn">
              🔍
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="filter-section">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            📨 Toate
          </button>
          <button
            className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => handleFilterChange('unread')}
          >
            🔴 Necitite
          </button>
          <button
            className={`filter-tab ${filter === 'today' ? 'active' : ''}`}
            onClick={() => handleFilterChange('today')}
          >
            📅 Astăzi
          </button>
          <button
            className={`filter-tab ${filter === 'important' ? 'active' : ''}`}
            onClick={() => handleFilterChange('important')}
          >
            ⭐ Importante
          </button>
        </div>
        <div className="filter-info">
          {filter === 'all' && `Afișare toate ${searchQuery ? `pentru "${searchQuery}"` : 'emailurile'}`}
          {filter === 'unread' && `${messages.length} emailuri necitite`}
          {filter === 'today' && `${messages.length} emailuri de azi`}
          {filter === 'important' && `${messages.length} emailuri importante`}
        </div>
      </div>

      {/* Messages List */}
      <div className="messages-section">
        {loading ? (
          <div className="messages-loading">
            <div className="gmail-spinner"></div>
            <span>Se încarcă emailurile...</span>
          </div>
        ) : messages.length > 0 ? (
          <div className="messages-list">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message-card ${message.isUnread ? 'unread' : ''} priority-${getMessagePriority(message)}`}
                onClick={() => window.open(`https://mail.google.com/mail/u/0/#inbox/${message.id}`, '_blank')}
              >
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
                    <div className="message-time">{formatMessageTime(message.date)}</div>
                  </div>
                  <div className="message-subject">{message.subject}</div>
                  <div className="message-snippet">{message.snippet}</div>
                  <div className="message-meta">
                    {message.isImportant && <span className="important-badge">⭐ Important</span>}
                    {message.isStarred && <span className="starred-badge">⭐</span>}
                    {message.attachments && message.attachments.length > 0 && (
                      <span className="attachment-badge">📎 {message.attachments.length}</span>
                    )}
                  </div>
                </div>
                {message.isUnread && (
                  <div className="unread-indicator"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-messages">
            <div className="no-messages-icon">📭</div>
            <div className="no-messages-text">
              {searchQuery ? `Nu s-au găsit emailuri pentru "${searchQuery}"` : 'Nu sunt emailuri în acest filtru'}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .gmail-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: var(--bg-primary);
          min-height: 100vh;
        }

        .gmail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .gmail-header h1 {
          color: var(--text-primary);
          font-size: 2.5rem;
          margin: 0;
          background: linear-gradient(135deg, #EA4335, #4285F4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .refresh-btn, .back-btn {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover, .back-btn:hover {
          background: var(--accent-color);
          color: white;
          transform: translateY(-2px);
        }

        .search-section {
          margin-bottom: 30px;
        }

        .search-form {
          display: flex;
          justify-content: center;
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          overflow: hidden;
          max-width: 600px;
          width: 100%;
        }

        .search-input {
          flex: 1;
          border: none;
          padding: 16px 20px;
          font-size: 1rem;
          background: transparent;
          color: var(--text-primary);
          outline: none;
        }

        .search-input::placeholder {
          color: var(--text-secondary);
        }

        .search-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 16px 20px;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .search-btn:hover {
          background: #38a169;
        }

        .filter-section {
          margin-bottom: 30px;
          text-align: center;
        }

        .filter-tabs {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }

        .filter-tab {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .filter-tab.active {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .filter-tab:hover:not(.active) {
          background: var(--bg-primary);
          border-color: var(--accent-color);
          transform: translateY(-1px);
        }

        .filter-info {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .messages-section {
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 20px;
          min-height: 400px;
        }

        .messages-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 60px 20px;
        }

        .messages-list {
          display: grid;
          gap: 12px;
        }

        .message-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .message-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          border-color: var(--accent-color);
        }

        .message-card.unread {
          background: linear-gradient(135deg, #4285F410, #EA433510);
          border-color: #4285F430;
        }

        .message-card.priority-high {
          border-left: 4px solid #ef4444;
        }

        .message-card.priority-medium {
          border-left: 4px solid #f59e0b;
        }

        .message-card.priority-low {
          border-left: 4px solid #3b82f6;
        }

        .message-avatar {
          flex-shrink: 0;
        }

        .generated-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.1rem;
        }

        .message-avatar img {
          width: 48px;
          height: 48px;
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
          margin-bottom: 8px;
        }

        .message-from {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 1.1rem;
        }

        .message-time {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .message-subject {
          font-weight: 500;
          color: var(--text-primary);
          font-size: 1rem;
          margin-bottom: 6px;
          line-height: 1.3;
        }

        .message-snippet {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.4;
          margin-bottom: 12px;
        }

        .message-meta {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .important-badge, .starred-badge, .attachment-badge {
          background: var(--accent-color);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .unread-indicator {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 12px;
          height: 12px;
          background: #4285F4;
          border: 2px solid white;
          border-radius: 50%;
        }

        .no-messages {
          text-align: center;
          padding: 60px 20px;
        }

        .no-messages-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .no-messages-text {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .gmail-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top: 4px solid var(--accent-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .gmail-page {
            padding: 15px;
          }

          .gmail-header {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }

          .gmail-header h1 {
            font-size: 2rem;
            text-align: center;
          }

          .header-actions {
            justify-content: center;
          }

          .filter-tabs {
            flex-direction: column;
            align-items: center;
          }

          .filter-tab {
            width: 100%;
            max-width: 200px;
            justify-content: center;
          }

          .message-card {
            padding: 16px;
            gap: 12px;
          }

          .generated-avatar {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }

          .message-avatar img {
            width: 40px;
            height: 40px;
          }

          .message-from {
            font-size: 1rem;
          }

          .message-subject {
            font-size: 0.9rem;
          }

          .message-snippet {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .gmail-page {
            padding: 10px;
          }

          .gmail-header h1 {
            font-size: 1.8rem;
          }

          .message-card {
            padding: 12px;
            gap: 10px;
          }

          .generated-avatar {
            width: 36px;
            height: 36px;
            font-size: 0.9rem;
          }

          .message-avatar img {
            width: 36px;
            height: 36px;
          }

          .search-input {
            padding: 12px 16px;
            font-size: 0.9rem;
          }

          .search-btn {
            padding: 12px 16px;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default GmailPage;
