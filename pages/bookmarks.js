import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useTranslation } from '../contexts/LanguageContext';
import NewsCard from '../components/NewsCard';
import Layout from '../components/Layout';

const Bookmarks = () => {
  const { bookmarks, isLoading, removeBookmark, hasBookmarks } = useUser();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = bookmarks.filter(bookmark =>
        bookmark.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.source?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBookmarks(filtered);
    } else {
      setFilteredBookmarks(bookmarks);
    }
  }, [bookmarks, searchTerm]);

  const handleRemoveBookmark = (url) => {
    if (window.confirm(t('bookmarks.removeConfirm'))) {
      removeBookmark(url);
    }
  };

  if (isLoading) {
    return (
      <Layout title={t('bookmarks.title')} description={t('bookmarks.description')}>
        <div className="bookmarks-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{t('bookmarks.loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={t('bookmarks.title')} description={t('bookmarks.description')}>
      <div className="bookmarks-page">
        <div className="bookmarks-header">
          <h1>{t('bookmarks.title')}</h1>
          <div className="bookmarks-stats">
            <span className="bookmark-count">{bookmarks.length} {t('bookmarks.savedArticles')}</span>
          </div>
        </div>

        <div className="bookmarks-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder={t('bookmarks.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <svg className="search-icon" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
        </div>

        {!hasBookmarks ? (
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24">
              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
            </svg>
            <h2>{t('bookmarks.noBookmarks')}</h2>
            <p>{t('bookmarks.noBookmarksDescription')}</p>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <h2>{t('bookmarks.noBookmarksFound')}</h2>
            <p>{t('bookmarks.noBookmarksFoundDescription')}</p>
          </div>
        ) : (
          <div className="bookmarks-grid">
            {filteredBookmarks.map((bookmark) => (
              <div key={bookmark.id} className="bookmark-item">
                <NewsCard 
                  article={bookmark} 
                  isBookmarked={true}
                  onBookmarkToggle={() => handleRemoveBookmark(bookmark.url)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .bookmarks-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .bookmarks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .bookmarks-header h1 {
          font-size: 2.5rem;
          color: #333;
          margin: 0;
        }

        .bookmark-count {
          background: #667eea;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .bookmarks-controls {
          margin-bottom: 2rem;
        }

        .search-bar {
          position: relative;
          max-width: 400px;
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

        .bookmarks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        .bookmark-item {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .bookmark-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        @media (max-width: 768px) {
          .bookmarks-page {
            padding: 1rem;
          }

          .bookmarks-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .bookmarks-header h1 {
            font-size: 2rem;
          }

          .bookmarks-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Bookmarks;
