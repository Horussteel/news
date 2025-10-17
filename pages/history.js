import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTranslation } from '../contexts/LanguageContext';
import NewsCard from '../components/NewsCard';
import Layout from '../components/Layout';

const History = () => {
  const { readHistory, isLoading, removeFromHistory, clearHistory, hasHistory } = useUser();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    let filtered = readHistory;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.source?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.readAt);
        return itemDate.toDateString() === selectedDateObj.toDateString();
      });
    }

    setFilteredHistory(filtered);
  }, [readHistory, searchTerm, selectedDate]);

  const handleRemoveFromHistory = (url) => {
    if (window.confirm(t('history.removeConfirm'))) {
      removeFromHistory(url);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm(t('history.clearHistoryConfirm'))) {
      clearHistory();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getUniqueDates = () => {
    const dates = readHistory.map(item => new Date(item.readAt).toDateString());
    return [...new Set(dates)];
  };

  if (isLoading) {
    return (
      <Layout title={t('history.title')} description={t('history.description')}>
        <div className="history-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{t('history.loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t('history.title')} description={t('history.description')}>
      <div className="history-page">
        <div className="history-header">
          <div className="header-left">
            <h1>{t('history.title')}</h1>
            <span className="history-count">{readHistory.length} {t('history.articlesRead')}</span>
          </div>
          {hasHistory && (
            <button className="clear-history-btn" onClick={handleClearHistory}>
              {t('history.clearAllHistory')}
            </button>
          )}
        </div>

        <div className="history-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder={t('history.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <svg className="search-icon" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
          
          <div className="date-filter">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-select"
            >
              <option value="">{t('history.allDates')}</option>
              {getUniqueDates().map(date => (
                <option key={date} value={new Date(date).toISOString().split('T')[0]}>
                  {new Date(date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!hasHistory ? (
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24">
              <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
            </svg>
            <h2>{t('history.noHistory')}</h2>
            <p>{t('history.noHistoryDescription')}</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <h2>{t('history.noHistoryFound')}</h2>
            <p>{t('history.noHistoryFoundDescription')}</p>
          </div>
        ) : (
          <div className="history-timeline">
            {filteredHistory.map((item, index) => (
              <div key={item.url || index} className="history-item">
                <div className="history-content">
                  <div className="history-meta">
                    <span className="read-time">
                      {t('history.readAt')} {formatDate(item.readAt)}
                    </span>
                    {item.source?.name && (
                      <span className="source-name">• {item.source.name}</span>
                    )}
                  </div>
                  <NewsCard 
                    article={item} 
                    showRemoveButton={true}
                    onRemove={() => handleRemoveFromHistory(item.url)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .history-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .history-header h1 {
          font-size: 2.5rem;
          color: #333;
          margin: 0;
        }

        .history-count {
          color: #666;
          font-size: 1rem;
        }

        .clear-history-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .clear-history-btn:hover {
          background: #c82333;
        }

        .history-controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .search-bar {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 2px solid #e1e5e9;
          border-radius: 25px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          fill: #666;
        }

        .date-filter {
          min-width: 200px;
        }

        .date-select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          background: white;
          cursor: pointer;
          transition: border-color 0.3s ease;
        }

        .date-select:focus {
          outline: none;
          border-color: #667eea;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: #f8f9fa;
          border-radius: 12px;
          margin: 2rem 0;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          fill: #ccc;
          margin-bottom: 1rem;
        }

        .empty-state h2 {
          color: #666;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #999;
          max-width: 400px;
          margin: 0 auto;
        }

        .history-timeline {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .history-item {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .history-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .history-content {
          padding: 1.5rem;
        }

        .history-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.85rem;
          color: #666;
        }

        .read-time {
          font-weight: 500;
        }

        .source-name {
          color: #999;
        }

        @media (max-width: 768px) {
          .history-page {
            padding: 1rem;
          }

          .history-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .history-header h1 {
            font-size: 2rem;
          }

          .history-controls {
            flex-direction: column;
          }

          .search-bar {
            min-width: unset;
          }

          .date-filter {
            min-width: unset;
          }
        }
      `}</style>
    </Layout>
  );
};

export default History;
