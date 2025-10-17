import { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import Layout from '../components/Layout';
import RadioPlayer from '../components/RadioPlayer';
import radioService from '../lib/radioServiceBrowserAPI';

const Radio = () => {
  const { t } = useTranslation();
  const [stations, setStations] = useState([]);
  const [internationalStations, setInternationalStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [activeTab, setActiveTab] = useState('romanian');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    loadRadioData();
  }, []);

  // Update filtered stations when filters change
  useEffect(() => {
    filterStations();
  }, [stations, internationalStations, selectedGenre, searchQuery, activeTab]);

  const loadRadioData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Loading all radio data...');
      const [romanianData, internationalData] = await Promise.all([
        radioService.fetchRomanianStations(),
        radioService.fetchInternationalStations()
      ]);
      setStations(romanianData);
      setInternationalStations(internationalData);
      console.log(`Loaded ${romanianData.length} Romanian and ${internationalData.length} international stations`);
    } catch (error) {
      console.error('Error loading radio data:', error);
      setError('Failed to load radio stations. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterStations = () => {
    let sourceStations = activeTab === 'romanian' ? stations : internationalStations;
    let filtered = [...sourceStations];

    // Filter by genre
    if (selectedGenre !== 'all') {
      filtered = sourceStations.filter(s => s.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = sourceStations.filter(station =>
        station.name.toLowerCase().includes(lowerQuery) ||
        station.genre.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredStations(filtered);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedGenre('all');
    setSearchQuery('');
  };

  const handleStationSelect = (station) => {
    console.log('Selecting station:', station.name);
    setSelectedStation(station);
    setShowMiniPlayer(true);
  };

  const formatGenre = (genre) => {
    if (!genre) return 'Various';
    return genre.split(',')[0].trim();
  };

  const getGenreIcon = (genre) => {
    return '🎵'; // Default icon
  };

  const genres = radioService.getGenres();

  return (
    <Layout title="Radio" description="Listen to radio stations from Romania and around the world">
      <div className="radio-page">
        {/* Header */}
        <div className="radio-header">
          <div className="header-content">
            <h1 className="page-title">🎵 Radio</h1>
            <p className="page-subtitle">Discover and listen to radio stations</p>
          </div>
          
          {/* Search Bar */}
          <div className="search-container">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search stations, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
            <button onClick={loadRadioData} className="retry-btn">Retry</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="radio-tabs">
          <button 
            className={`tab-btn ${activeTab === 'romanian' ? 'active' : ''}`}
            onClick={() => handleTabChange('romanian')}
          >
            <span className="tab-icon">🇷🇴</span>
            <span className="tab-label">Romanian</span>
            <span className="tab-count">({stations.length})</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'international' ? 'active' : ''}`}
            onClick={() => handleTabChange('international')}
          >
            <span className="tab-icon">🌍</span>
            <span className="tab-label">International</span>
            <span className="tab-count">({internationalStations.length})</span>
          </button>
        </div>

        {/* Genre Filter */}
        <div className="genre-filter">
          <div className="genre-pills">
            <button 
              className={`genre-pill ${selectedGenre === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedGenre('all')}
            >
              <span className="genre-icon">🎵</span>
              <span>All</span>
            </button>
            {/* You can add genre filtering for international stations too if desired */}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading radio stations...</p>
          </div>
        )}

        {/* Stations Grid */}
        {!isLoading && (
          <div className="stations-container">
            {filteredStations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📻</div>
                <h3>No stations found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="stations-grid">
                {filteredStations.map((station, index) => (
                  <div 
                    key={station.id}
                    className="station-card"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handleStationSelect(station)}
                  >
                    <div className="station-header">
                      <img 
                        src={station.favicon || '/radio-placeholder.png'} 
                        alt={station.name}
                        className="station-logo"
                        onError={(e) => e.target.src = '/radio-placeholder.png'}
                      />
                    </div>
                    
                    <div className="station-info">
                      <h3 className="station-name">{station.name}</h3>
                      <div className="station-meta">
                        <span className="station-country">📍 {station.country}</span>
                        {station.bitrate && (
                          <span className="station-bitrate">🎵 {station.bitrate}kbps</span>
                        )}
                      </div>
                      <p className="station-genre">
                        <span className="genre-icon">{getGenreIcon(station.genre)}</span>
                        {formatGenre(station.genre)}
                      </p>
                      {station.lastcheckok && (
                        <div className="station-status">
                          <span className="status-indicator online"></span>
                          <span className="status-text">Online</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="station-actions">
                      <button className="play-btn">
                        <span className="play-icon">▶️</span>
                        <span>Play</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Radio Player */}
        {selectedStation && (
          <RadioPlayer 
            station={selectedStation} 
            onStationChange={setSelectedStation}
            isMini={showMiniPlayer}
          />
        )}

        <style jsx>{`
          .radio-page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }

          .radio-header {
            text-align: center;
            margin-bottom: 2rem;
          }

          .header-content {
            margin-bottom: 2rem;
          }

          .page-title {
            font-size: 3rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--accent-color), #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
          }

          .page-subtitle {
            font-size: 1.2rem;
            color: var(--text-secondary);
            margin: 0;
          }

          .search-container {
            max-width: 600px;
            margin: 0 auto;
          }

          .search-box {
            position: relative;
            display: flex;
            align-items: center;
            background: var(--bg-secondary);
            border: 2px solid var(--border-color);
            border-radius: 50px;
            padding: 1rem 1.5rem;
            transition: all 0.3s ease;
          }

          .search-box:focus-within {
            border-color: var(--accent-color);
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          }

          .search-icon {
            font-size: 1.2rem;
            margin-right: 1rem;
            color: var(--text-secondary);
          }

          .search-input {
            flex: 1;
            border: none;
            background: none;
            font-size: 1rem;
            color: var(--text-primary);
            outline: none;
          }

          .search-input::placeholder {
            color: var(--text-secondary);
          }

          .error-message {
            display: flex;
            align-items: center;
            gap: 1rem;
            background: #fee;
            border: 1px solid #fcc;
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 2rem;
            color: #c33;
          }

          .error-icon {
            font-size: 1.2rem;
          }

          .retry-btn {
            background: var(--accent-color);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.5rem 1rem;
            cursor: pointer;
            font-weight: 500;
            margin-left: auto;
          }

          .radio-tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 2rem;
            background: var(--bg-secondary);
            padding: 0.5rem;
            border-radius: 16px;
            overflow-x: auto;
          }

          .tab-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: none;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            color: var(--text-secondary);
            font-weight: 500;
            white-space: nowrap;
          }

          .tab-btn:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
          }

          .tab-btn.active {
            background: var(--accent-color);
            color: white;
          }

          .tab-icon {
            font-size: 1.1rem;
          }

          .tab-label {
            font-size: 0.9rem;
          }

          .tab-count {
            font-size: 0.8rem;
            opacity: 0.8;
          }

          .tab-badge {
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 0.2rem 0.5rem;
            border-radius: 10px;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .genre-filter {
            margin-bottom: 2rem;
          }

          .genre-pills {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .genre-pill {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: var(--bg-tertiary);
            border: 2px solid var(--border-color);
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            color: var(--text-secondary);
            font-weight: 500;
          }

          .genre-pill:hover {
            border-color: var(--accent-color);
            color: var(--text-primary);
            transform: translateY(-2px);
          }

          .genre-pill.active {
            background: var(--accent-color);
            border-color: var(--accent-color);
            color: white;
          }

          .genre-icon {
            font-size: 0.9rem;
          }

          .loading-container {
            text-align: center;
            padding: 4rem 2rem;
          }

          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid var(--border-color);
            border-top: 4px solid var(--accent-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }

          .loading-text {
            color: var(--text-secondary);
            font-size: 1.1rem;
          }

          .stations-container {
            margin-bottom: 2rem;
          }

          .empty-state {
            text-align: center;
            padding: 4rem 2rem;
          }

          .empty-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.5;
          }

          .empty-state h3 {
            color: var(--text-primary);
            margin-bottom: 0.5rem;
          }

          .empty-state p {
            color: var(--text-secondary);
          }

          .stations-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1.5rem;
          }

          .station-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            animation: fadeInUp 0.5s ease-out;
          }

          .station-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.1);
            border-color: var(--accent-color);
          }

          .station-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--accent-color), #8b5cf6);
            transform: scaleX(0);
            transition: transform 0.3s ease;
          }

          .station-card:hover::before {
            transform: scaleX(1);
          }

          .station-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
          }

          .station-logo {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            object-fit: cover;
            background: var(--bg-tertiary);
          }

          .favorite-btn {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--bg-tertiary);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            font-size: 1rem;
          }

          .favorite-btn:hover {
            transform: scale(1.1);
            border-color: var(--accent-color);
          }

          .favorite-btn.active {
            background: var(--accent-color);
            border-color: var(--accent-color);
            animation: heartbeat 0.6s ease;
          }

          .station-info {
            margin-bottom: 1rem;
          }

          .station-name {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
            line-height: 1.3;
          }

          .station-meta {
            display: flex;
            gap: 1rem;
            margin-bottom: 0.5rem;
          }

          .station-country,
          .station-bitrate {
            font-size: 0.8rem;
            color: var(--text-secondary);
            opacity: 0.8;
          }

          .station-genre {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .station-status {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 0.5rem;
          }

          .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }

          .status-indicator.online {
            background: #4caf50;
            animation: pulse 2s infinite;
          }

          .status-text {
            font-size: 0.8rem;
            color: #4caf50;
            font-weight: 500;
          }

          .station-actions {
            display: flex;
            justify-content: center;
          }

          .play-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
            border: none;
            border-radius: 25px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .play-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }

          .play-icon {
            font-size: 1rem;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes heartbeat {
            0% { transform: scale(1); }
            25% { transform: scale(1.3); }
            50% { transform: scale(1); }
            75% { transform: scale(1.3); }
            100% { transform: scale(1); }
          }

          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @media (max-width: 768px) {
            .radio-page {
              padding: 1rem;
            }

            .page-title {
              font-size: 2rem;
            }

            .radio-tabs {
              gap: 0.25rem;
              padding: 0.25rem;
            }

            .tab-btn {
              padding: 0.5rem 1rem;
              font-size: 0.85rem;
            }

            .genre-pills {
              gap: 0.25rem;
            }

            .genre-pill {
              padding: 0.4rem 0.8rem;
              font-size: 0.85rem;
            }

            .stations-grid {
              grid-template-columns: 1fr;
              gap: 1rem;
            }

            .station-card {
              padding: 1rem;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default Radio;
