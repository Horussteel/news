import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useLanguage, useTranslation } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import gamesService from '../lib/gamesService';
import MemoryGame from '../components/MemoryGame';
import TicTacToe from '../components/TicTacToe';
import NumberGuess from '../components/NumberGuess';
import ReactionTime from '../components/ReactionTime';
import QuizMaster from '../components/QuizMaster';
import WordScramble from '../components/WordScramble';
import Hangman from '../components/Hangman';
import Tetris from '../components/Tetris';
import Snake from '../components/Snake';

const GamesPage = () => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [scores, setScores] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentGame, setCurrentGame] = useState(null);
  const [view, setView] = useState('games'); // games, scores, stats
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Initialize data first
      gamesService.initializeData();
      
      const [gamesData, categoriesData, scoresData, statsData] = await Promise.all([
        Promise.resolve(gamesService.getGames()),
        Promise.resolve(gamesService.getCategories()),
        Promise.resolve(gamesService.getScores()),
        Promise.resolve(gamesService.getGameStats())
      ]);
      
      console.log('Games loaded:', gamesData);
      console.log('Categories loaded:', categoriesData);
      console.log('Scores loaded:', scoresData);
      console.log('Stats loaded:', statsData);
      
      setGames(gamesData);
      setCategories(categoriesData);
      setScores(scoresData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading games data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = selectedCategory === 'all' 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const startGame = (game) => {
    setCurrentGame(game);
  };

  const handleGameEnd = (score, details = '') => {
    const name = playerName || 'Player';
    gamesService.saveScore(currentGame.id, score, name);
    loadData(); // Reload data to show new score
    setCurrentGame(null);
    
    if (details) {
      alert(`${language === 'ro' ? 'Joc terminat!' : 'Game completed!'} ${details} ${language === 'ro' ? 'Scor:' : 'Score:'} ${score}`);
    } else {
      alert(`${language === 'ro' ? 'Joc terminat! Scor:' : 'Game completed! Score:'} ${score}`);
    }
  };

  const renderGame = () => {
    if (!currentGame) return null;

    switch (currentGame.id) {
      case 'memory-game':
        return <MemoryGame onGameEnd={handleGameEnd} language={language} />;
      case 'tic-tac-toe':
        return <TicTacToe onGameEnd={handleGameEnd} language={language} />;
      case 'number-guess':
        return <NumberGuess onGameEnd={handleGameEnd} language={language} />;
      case 'reaction-time':
        return <ReactionTime onGameEnd={handleGameEnd} language={language} />;
      case 'quiz-master':
        return <QuizMaster onGameEnd={handleGameEnd} language={language} />;
      case 'word-scramble':
        return <WordScramble onGameEnd={handleGameEnd} language={language} />;
      case 'hangman':
        return <Hangman onGameEnd={handleGameEnd} language={language} />;
      case 'tetris':
        return <Tetris onGameEnd={handleGameEnd} language={language} />;
      case 'snake':
        return <Snake onGameEnd={handleGameEnd} language={language} />;
      default:
        return (
          <div className="game-placeholder">
            <h3>{getGameName(currentGame)}</h3>
            <p>{language === 'ro' ? 'Acest joc este în dezvoltare.' : 'This game is under development.'}</p>
            <p>{language === 'ro' ? 'Scor simulat:' : 'Simulated score:'} {Math.floor(Math.random() * 100) + 1}</p>
            <button onClick={() => handleGameEnd(Math.floor(Math.random() * 100) + 1)}>
              {language === 'ro' ? 'Termină jocul simulat' : 'End simulated game'}
            </button>
          </div>
        );
    }
  };

  const getGameName = (game) => {
    return language === 'ro' ? game.nameRo : game.name;
  };

  const getGameDescription = (game) => {
    return language === 'ro' ? game.descriptionRo : game.description;
  };

  const getCategoryName = (category) => {
    return language === 'ro' ? category.nameRo : category.name;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ro' ? 'ro-RO' : 'en-US');
  };

  const clearAllScores = () => {
    if (confirm(language === 'ro' ? 'Ești sigur că vrei să ștergi toate scorurile?' : 'Are you sure you want to clear all scores?')) {
      gamesService.clearAllScores();
      loadData();
    }
  };

  if (loading) {
    return (
      <Layout title={language === 'ro' ? 'Jocuri' : 'Games'}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{language === 'ro' ? 'Se încarcă jocurile...' : 'Loading games...'}</p>
        </div>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            gap: 1rem;
          }
          .loading-spinner {
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
        `}</style>
      </Layout>
    );
  }

  return (
    <Layout title={language === 'ro' ? 'Jocuri' : 'Games'}>
      <div className="games-container">
        <div className="games-header">
          <h1 className="games-title">
            🎮 {language === 'ro' ? 'Jocuri' : 'Games'}
          </h1>
          <p className="games-subtitle">
            {language === 'ro' 
              ? 'Distrează-te și antrenează-ți mintea cu jocurile noastre' 
              : 'Have fun and train your mind with our games'}
          </p>
        </div>

        <div className="games-nav">
          <button 
            className={`nav-button ${view === 'games' ? 'active' : ''}`}
            onClick={() => setView('games')}
          >
            🎮 {language === 'ro' ? 'Jocuri' : 'Games'}
          </button>
          <button 
            className={`nav-button ${view === 'scores' ? 'active' : ''}`}
            onClick={() => setView('scores')}
          >
            🏆 {language === 'ro' ? 'Scoruri' : 'Scores'}
          </button>
          <button 
            className={`nav-button ${view === 'stats' ? 'active' : ''}`}
            onClick={() => setView('stats')}
          >
            📊 {language === 'ro' ? 'Statistici' : 'Statistics'}
          </button>
        </div>

        {view === 'games' && (
          <div className="games-view">
            {currentGame ? (
              <div className="game-playing">
                <div className="game-header">
                  <button 
                    className="back-button"
                    onClick={() => setCurrentGame(null)}
                  >
                    ← {language === 'ro' ? 'Înapoi la jocuri' : 'Back to games'}
                  </button>
                  <h2>{getGameName(currentGame)}</h2>
                </div>
                {renderGame()}
              </div>
            ) : (
              <>
                <div className="games-controls">
                  <div className="category-filter">
                    <label>{language === 'ro' ? 'Categorie:' : 'Category:'}</label>
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="category-select"
                    >
                      <option value="all">{language === 'ro' ? 'Toate' : 'All'}</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {getCategoryName(category)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="player-input">
                    <label>{language === 'ro' ? 'Nume jucător:' : 'Player name:'}</label>
                    <input 
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder={language === 'ro' ? 'Introdu numele tău' : 'Enter your name'}
                      className="player-name-input"
                    />
                  </div>
                </div>

                <div className="games-grid">
                  {filteredGames.map(game => (
                    <div key={game.id} className="game-card">
                      <div className="game-icon">{game.icon}</div>
                      <div className="game-info">
                        <h3 className="game-title">{getGameName(game)}</h3>
                        <p className="game-description">{getGameDescription(game)}</p>
                        <div className="game-meta">
                          <span className="game-category">
                            {gamesService.getCategoryIcon(game.category)} 
                            {getCategoryName(categories.find(c => c.id === game.category) || {})}
                          </span>
                          <span className="game-difficulty">
                            {game.difficulty === 'easy' ? '😊' : game.difficulty === 'medium' ? '🤔' : '🔥'} 
                            {game.difficulty}
                          </span>
                          <span className="game-time">⏱️ {game.estimatedTime}</span>
                        </div>
                        <div className="game-players">
                          {game.minPlayers === game.maxPlayers 
                            ? `${game.minPlayers} ${language === 'ro' ? 'jucător' : 'player'}`
                            : `${game.minPlayers}-${game.maxPlayers} ${language === 'ro' ? 'jucători' : 'players'}`
                          }
                        </div>
                      </div>
                      <button 
                        className="play-button"
                        onClick={() => startGame(game)}
                        disabled={currentGame === game}
                      >
                        {currentGame === game 
                          ? (language === 'ro' ? 'Se joacă...' : 'Playing...')
                          : (language === 'ro' ? 'Joacă' : 'Play')
                        }
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {view === 'scores' && (
          <div className="scores-view">
            <div className="scores-header">
              <h2>{language === 'ro' ? 'Scoruri Recente' : 'Recent Scores'}</h2>
              <button 
                className="clear-scores-button"
                onClick={clearAllScores}
              >
                🗑️ {language === 'ro' ? 'Șterge toate scorurile' : 'Clear All Scores'}
              </button>
            </div>
            
            {scores.length === 0 ? (
              <div className="no-scores">
                <p>{language === 'ro' ? 'Nu există scoruri înregistrate încă' : 'No scores recorded yet'}</p>
                <p>{language === 'ro' ? 'Joacă câteva jocuri pentru a vedea scorurile tale!' : 'Play some games to see your scores!'}</p>
              </div>
            ) : (
              <div className="scores-list">
                {scores.slice(-20).reverse().map(score => {
                  const game = gamesService.getGame(score.gameId);
                  return (
                    <div key={score.id} className="score-item">
                      <div className="score-game">
                        {game?.icon} {game ? getGameName(game) : score.gameId}
                      </div>
                      <div className="score-details">
                        <div className="score-value">🏆 {score.score}</div>
                        <div className="score-player">👤 {score.playerName}</div>
                        <div className="score-date">📅 {formatDate(score.date)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {view === 'stats' && (
          <div className="stats-view">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🎮</div>
                <div className="stat-value">{stats?.totalGamesPlayed || 0}</div>
                <div className="stat-label">{language === 'ro' ? 'Jocuri Jucate' : 'Games Played'}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⏱️</div>
                <div className="stat-value">{Math.round((stats?.totalTimeSpent || 0) / 60)}m</div>
                <div className="stat-label">{language === 'ro' ? 'Timp Total' : 'Total Time'}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-value">
                  {stats?.favoriteGame ? (
                    <>
                      {gamesService.getGame(stats.favoriteGame)?.icon} 
                      {gamesService.getGame(stats.favoriteGame) ? getGameName(gamesService.getGame(stats.favoriteGame)) : stats.favoriteGame}
                    </>
                  ) : (
                    language === 'ro' ? 'Niciunul' : 'None'
                  )}
                </div>
                <div className="stat-label">{language === 'ro' ? 'Joc Preferat' : 'Favorite Game'}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-value">{scores.length}</div>
                <div className="stat-label">{language === 'ro' ? 'Scoruri Înregistrate' : 'Scores Recorded'}</div>
              </div>
            </div>

            <div className="category-stats">
              <h3>{language === 'ro' ? 'Statistici pe Categorii' : 'Category Statistics'}</h3>
              <div className="category-stats-grid">
                {categories.map(category => {
                  const categoryGames = games.filter(g => g.category === category.id);
                  const categoryScores = scores.filter(s => categoryGames.some(g => g.id === s.gameId));
                  return (
                    <div key={category.id} className="category-stat-card">
                      <div className="category-icon">{category.icon}</div>
                      <div className="category-name">{getCategoryName(category)}</div>
                      <div className="category-games">{category.gameCount} {language === 'ro' ? 'jocuri' : 'games'}</div>
                      <div className="category-scores">{categoryScores.length} {language === 'ro' ? 'scoruri' : 'scores'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .games-container {
          padding: 2rem 0;
        }

        .games-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .games-title {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .games-subtitle {
          color: var(--text-secondary);
          font-size: 1.1rem;
          margin: 0;
        }

        .games-nav {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .nav-button {
          padding: 0.8rem 1.5rem;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .nav-button:hover {
          border-color: var(--accent-color);
          transform: translateY(-2px);
        }

        .nav-button.active {
          background: var(--accent-color);
          border-color: var(--accent-color);
          color: white;
        }

        .games-controls {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .category-filter, .player-input {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .category-filter label, .player-input label {
          font-weight: 500;
          color: var(--text-secondary);
        }

        .category-select, .player-name-input {
          padding: 0.5rem 1rem;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .game-card {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 15px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .game-card:hover {
          border-color: var(--accent-color);
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .game-icon {
          font-size: 3rem;
          text-align: center;
        }

        .game-info {
          flex: 1;
        }

        .game-title {
          font-size: 1.3rem;
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }

        .game-description {
          color: var(--text-secondary);
          margin: 0 0 1rem 0;
          line-height: 1.4;
        }

        .game-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .game-category, .game-difficulty, .game-time {
          background: var(--bg-tertiary);
          padding: 0.3rem 0.6rem;
          border-radius: 12px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .game-players {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .play-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.8rem;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .play-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .play-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .game-playing {
          max-width: 800px;
          margin: 0 auto;
        }

        .game-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--border-color);
        }

        .back-button {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          color: var(--text-primary);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .back-button:hover {
          background: var(--bg-tertiary);
          border-color: var(--accent-color);
        }

        .game-header h2 {
          margin: 0;
          color: var(--text-primary);
          font-size: 1.5rem;
        }

        .game-placeholder {
          text-align: center;
          padding: 3rem;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 15px;
          margin: 2rem auto;
          max-width: 500px;
        }

        .game-placeholder h3 {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
          font-size: 1.5rem;
        }

        .game-placeholder p {
          margin: 0 0 1.5rem 0;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .game-placeholder button {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .game-placeholder button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .game-loading {
          text-align: center;
          padding: 3rem;
          color: var(--text-primary);
        }

        .game-loading p {
          font-size: 1.2rem;
          margin: 0;
        }

        .scores-view, .stats-view {
          padding: 1rem 0;
        }

        .scores-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .clear-scores-button {
          background: #ef4444;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .clear-scores-button:hover {
          background: #dc2626;
        }

        .no-scores {
          text-align: center;
          padding: 3rem;
          color: var(--text-secondary);
        }

        .scores-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .score-item {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .score-game {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .score-details {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .score-value {
          font-weight: 700;
          font-size: 1.2rem;
          color: var(--accent-color);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 15px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          border-color: var(--accent-color);
          transform: translateY(-3px);
        }

        .stat-icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--accent-color);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .category-stats {
          margin-top: 2rem;
        }

        .category-stats h3 {
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .category-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .category-stat-card {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .category-stat-card:hover {
          border-color: var(--accent-color);
          transform: translateY(-2px);
        }

        .category-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .category-name {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .category-games, .category-scores {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .games-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .games-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .category-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .score-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .score-details {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .category-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
};

export default GamesPage;
