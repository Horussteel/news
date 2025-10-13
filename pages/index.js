import { useState, useEffect } from 'react';
import Head from 'next/head';
import NewsCard from '../components/NewsCard';
import SearchBar from '../components/SearchBar';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('Toate');
  const [language, setLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('news');

  const categories = [
    'Toate', 'Technology', 'Business', 'Science', 'Health', 
    'Sports', 'Entertainment', 'General', 'AI', 'Machine Learning'
  ];

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        category: category === 'Toate' ? '' : category,
        search: searchTerm,
        language
      });

      const response = await fetch(`/api/news?${params}`);
      const data = await response.json();

      if (data.error) {
        setError(data.message);
      } else {
        setArticles(data.articles || []);
      }
    } catch (err) {
      setError('Failed to fetch news');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        search: searchTerm
      });

      const response = await fetch(`/api/youtube?${params}`);
      const data = await response.json();

      if (data.error) {
        setError(data.message);
      } else {
        setVideos(data.videos || []);
      }
    } catch (err) {
      setError('Failed to fetch videos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'news') {
      fetchNews();
    } else {
      fetchVideos();
    }
  }, [searchTerm, category, language, activeTab]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const VideoCard = ({ video }) => (
    <div className="video-card">
      <div className="video-thumbnail">
        {video.thumbnail && (
          <img src={video.thumbnail} alt={video.title} />
        )}
      </div>
      <div className="video-content">
        <h3 className="video-title">
          <a href={video.url} target="_blank" rel="noopener noreferrer">
            {video.title}
          </a>
        </h3>
        <p className="video-channel">{video.channelTitle}</p>
        <p className="video-date">
          {new Date(video.publishedAt).toLocaleDateString()}
        </p>
        <p className="video-description">{video.description}</p>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>AI News - Latest Artificial Intelligence News</title>
        <meta name="description" content="Latest AI and machine learning news from around the world" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">
        <header className="header">
          <h1 className="title">🤖 AI News Hub</h1>
          <p className="subtitle">Latest Artificial Intelligence & Technology News</p>
        </header>

        <div className="controls">
          <SearchBar onSearch={handleSearch} />
          
          <div className="filters">
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="filter-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="filter-select"
            >
              <option value="en">English</option>
              <option value="ro">Română</option>
            </select>
          </div>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            📰 News ({articles.length})
          </button>
          <button 
            className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            📺 Videos ({videos.length})
          </button>
        </div>

        <main className="main-content">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading {activeTab === 'news' ? 'news' : 'videos'}...</p>
            </div>
          ) : error ? (
            <div className="error">
              <p>❌ {error}</p>
              <button onClick={activeTab === 'news' ? fetchNews : fetchVideos}>
                Try Again
              </button>
            </div>
          ) : (
            <div className="content-grid">
              {activeTab === 'news' ? (
                articles.length > 0 ? (
                  articles.map((article, index) => (
                    <NewsCard key={`${article.url}-${index}`} article={article} />
                  ))
                ) : (
                  <div className="no-content">
                    <p>No articles found. Try adjusting your search or filters.</p>
                  </div>
                )
              ) : (
                videos.length > 0 ? (
                  videos.map((video, index) => (
                    <VideoCard key={`${video.id}-${index}`} video={video} />
                  ))
                ) : (
                  <div className="no-content">
                    <p>No videos found. Try adjusting your search.</p>
                  </div>
                )
              )}
            </div>
          )}
        </main>

        <footer className="footer">
          <p>&copy; 2024 AI News Hub. Powered by NewsAPI & YouTube API</p>
        </footer>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
        }

        .title {
          font-size: 3rem;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 1.2rem;
          color: #666;
        }

        .controls {
          margin-bottom: 30px;
        }

        .filters {
          display: flex;
          gap: 15px;
          margin-top: 20px;
          justify-content: center;
        }

        .filter-select {
          padding: 10px 15px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          background: white;
          cursor: pointer;
        }

        .tabs {
          display: flex;
          margin-bottom: 30px;
          border-bottom: 2px solid #e1e5e9;
        }

        .tab {
          padding: 15px 30px;
          border: none;
          background: none;
          font-size: 16px;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }

        .tab.active {
          border-bottom-color: #667eea;
          color: #667eea;
          font-weight: bold;
        }

        .loading {
          text-align: center;
          padding: 40px;
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error {
          text-align: center;
          padding: 40px;
          color: #dc3545;
        }

        .error button {
          margin-top: 15px;
          padding: 10px 20px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 25px;
        }

        .no-content {
          text-align: center;
          padding: 60px 20px;
          color: #666;
          font-size: 1.1rem;
        }

        .video-card {
          border: 1px solid #e1e5e9;
          border-radius: 12px;
          overflow: hidden;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .video-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .video-thumbnail img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .video-content {
          padding: 20px;
        }

        .video-title {
          margin: 0 0 10px 0;
          font-size: 1.1rem;
          line-height: 1.4;
        }

        .video-title a {
          color: #333;
          text-decoration: none;
        }

        .video-title a:hover {
          color: #667eea;
        }

        .video-channel {
          color: #666;
          font-size: 0.9rem;
          margin: 5px 0;
        }

        .video-date {
          color: #999;
          font-size: 0.8rem;
          margin: 5px 0;
        }

        .video-description {
          color: #666;
          font-size: 0.9rem;
          line-height: 1.4;
          margin-top: 10px;
        }

        .footer {
          text-align: center;
          margin-top: 60px;
          padding-top: 30px;
          border-top: 1px solid #e1e5e9;
          color: #666;
        }

        @media (max-width: 768px) {
          .container {
            padding: 10px;
          }

          .title {
            font-size: 2rem;
          }

          .content-grid {
            grid-template-columns: 1fr;
          }

          .filters {
            flex-direction: column;
            align-items: center;
          }

          .tabs {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
