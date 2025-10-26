import storageService from './storageService';

const GAMES_STORAGE_KEY = 'games_data';
const GAME_SCORES_KEY = 'game_scores';
const GAME_STATS_KEY = 'game_stats';

// Predefined games available in the application
const PREDEFINED_GAMES = [
  {
    id: 'memory-game',
    name: 'Memory Game',
    nameRo: 'Joc de Memorie',
    description: 'Test your memory by matching pairs of cards',
    descriptionRo: 'Testează-ți memoria potrivind perechi de cărți',
    category: 'puzzle',
    icon: '🧩',
    difficulty: 'easy',
    minPlayers: 1,
    maxPlayers: 1,
    estimatedTime: '5-10 min'
  },
  {
    id: 'word-scramble',
    name: 'Word Scramble',
    nameRo: 'Cuvinte Amestecate',
    description: 'Unscramble letters to form words',
    descriptionRo: 'Descleştează literele pentru a forma cuvinte',
    category: 'word',
    icon: '📝',
    difficulty: 'medium',
    minPlayers: 1,
    maxPlayers: 1,
    estimatedTime: '3-5 min'
  },
  {
    id: 'number-guess',
    name: 'Number Guess',
    nameRo: 'Ghiceste Numărul',
    description: 'Guess the hidden number with hints',
    descriptionRo: 'Ghiceste numărul ascuns cu indicii',
    category: 'logic',
    icon: '🔢',
    difficulty: 'easy',
    minPlayers: 1,
    maxPlayers: 1,
    estimatedTime: '2-5 min'
  },
  {
    id: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    nameRo: 'X și O',
    description: 'Classic strategy game for two players',
    descriptionRo: 'Joc clasic de strategie pentru doi jucători',
    category: 'strategy',
    icon: '⭕',
    difficulty: 'easy',
    minPlayers: 2,
    maxPlayers: 2,
    estimatedTime: '2-5 min'
  },
  {
    id: 'quiz-master',
    name: 'Quiz Master',
    nameRo: 'Maestrul Quiz',
    description: 'Test your knowledge on various topics',
    descriptionRo: 'Testează-ți cunoștințele pe diverse teme',
    category: 'trivia',
    icon: '🎯',
    difficulty: 'medium',
    minPlayers: 1,
    maxPlayers: 4,
    estimatedTime: '5-15 min'
  },
  {
    id: 'reaction-time',
    name: 'Reaction Time',
    nameRo: 'Timp de Reacție',
    description: 'Test how fast you can react',
    descriptionRo: 'Testează cât de repede poți reacționa',
    category: 'skill',
    icon: '⚡',
    difficulty: 'easy',
    minPlayers: 1,
    maxPlayers: 1,
    estimatedTime: '1-3 min'
  },
  {
    id: 'hangman',
    name: 'Hangman',
    nameRo: 'Spânzurătoarea',
    description: 'Guess word letter by letter before it\'s too late',
    descriptionRo: 'Ghiceste cuvântul literă cu literă înainte să fie prea târziu',
    category: 'word',
    icon: '🔤',
    difficulty: 'medium',
    minPlayers: 1,
    maxPlayers: 1,
    estimatedTime: '3-8 min'
  },
  {
    id: 'tetris',
    name: 'Tetris',
    nameRo: 'Tetris',
    description: 'Arrange falling blocks to complete lines',
    descriptionRo: 'Aranjează blocurile căzătoare pentru a completa linii',
    category: 'skill',
    icon: '🎮',
    difficulty: 'medium',
    minPlayers: 1,
    maxPlayers: 1,
    estimatedTime: '3-10 min'
  },
  {
    id: 'snake',
    name: 'Snake',
    nameRo: 'Șarpe',
    description: 'Eat food to grow and avoid collisions',
    descriptionRo: 'Mănâncă mâncarea pentru a crește și evită coliziunile',
    category: 'skill',
    icon: '🐍',
    difficulty: 'medium',
    minPlayers: 1,
    maxPlayers: 1,
    estimatedTime: '2-8 min'
  }
];

const gamesService = {
  // Initialize games data
  initializeData() {
    // Always refresh games data to ensure new games are loaded
    storageService.setItem(GAMES_STORAGE_KEY, PREDEFINED_GAMES);
    
    if (!storageService.getItem(GAME_SCORES_KEY)) {
      storageService.setItem(GAME_SCORES_KEY, []);
    }
    if (!storageService.getItem(GAME_STATS_KEY)) {
      storageService.setItem(GAME_STATS_KEY, {
        totalGamesPlayed: 0,
        totalTimeSpent: 0,
        favoriteGame: null,
        lastPlayedGame: null,
        favoriteGamePlayCount: 0,
        achievements: []
      });
    }
  },

  // Get all available games
  getGames() {
    this.initializeData();
    return storageService.getItem(GAMES_STORAGE_KEY) || [];
  },

  // Get game by ID
  getGame(gameId) {
    const games = this.getGames();
    return games.find(game => game.id === gameId);
  },

  // Get games by category
  getGamesByCategory(category) {
    const games = this.getGames();
    return games.filter(game => game.category === category);
  },

  // Get all game categories
  getCategories() {
    const games = this.getGames();
    const categories = [...new Set(games.map(game => game.category))];
    return categories.map(cat => ({
      id: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      nameRo: this.getCategoryNameRo(cat),
      icon: this.getCategoryIcon(cat),
      gameCount: games.filter(game => game.category === cat).length
    }));
  },

  // Get Romanian name for category
  getCategoryNameRo(category) {
    const categoryNames = {
      'puzzle': 'Puzzle',
      'word': 'Cuvinte',
      'logic': 'Logic',
      'strategy': 'Strategie',
      'trivia': 'Trivia',
      'skill': 'Abilități'
    };
    return categoryNames[category] || category;
  },

  // Get icon for category
  getCategoryIcon(category) {
    const categoryIcons = {
      'puzzle': '🧩',
      'word': '📝',
      'logic': '🧠',
      'strategy': '⭕',
      'trivia': '🎯',
      'skill': '⚡'
    };
    return categoryIcons[category] || '🎮';
  },

  // Save game score
  saveScore(gameId, score, playerName = 'Player') {
    const scores = this.getScores();
    const newScore = {
      id: Date.now().toString(),
      gameId,
      playerName,
      score,
      date: new Date().toISOString(),
      difficulty: this.getGame(gameId)?.difficulty || 'medium'
    };
    scores.push(newScore);
    storageService.setItem(GAME_SCORES_KEY, scores);
    
    // Update stats
    this.updateGameStats(gameId);
    
    return newScore;
  },

  // Get all scores
  getScores() {
    return storageService.getItem(GAME_SCORES_KEY) || [];
  },

  // Get scores for a specific game
  getGameScores(gameId) {
    const scores = this.getScores();
    return scores.filter(score => score.gameId === gameId)
                 .sort((a, b) => b.score - a.score);
  },

  // Get high scores for a game
  getHighScores(gameId, limit = 10) {
    return this.getGameScores(gameId).slice(0, limit);
  },

  // Get player scores
  getPlayerScores(playerName) {
    const scores = this.getScores();
    return scores.filter(score => score.playerName === playerName);
  },

  // Update game statistics
  updateGameStats(gameId) {
    const stats = this.getGameStats();
    stats.totalGamesPlayed = (stats.totalGamesPlayed || 0) + 1;
    stats.lastPlayedGame = gameId;
    
    // Update favorite game (most played)
    const gameScores = this.getGameScores(gameId);
    const gamePlayCount = gameScores.length;
    
    if (!stats.favoriteGame || gamePlayCount > stats.favoriteGamePlayCount) {
      stats.favoriteGame = gameId;
      stats.favoriteGamePlayCount = gamePlayCount;
    }
    
    storageService.setItem(GAME_STATS_KEY, stats);
  },

  // Get game statistics
  getGameStats() {
    return storageService.getItem(GAME_STATS_KEY) || {
      totalGamesPlayed: 0,
      totalTimeSpent: 0,
      favoriteGame: null,
      lastPlayedGame: null,
      achievements: []
    };
  },

  // Get player statistics
  getPlayerStats(playerName) {
    const playerScores = this.getPlayerScores(playerName);
    const gamesPlayed = [...new Set(playerScores.map(score => score.gameId))];
    
    return {
      playerName,
      totalGamesPlayed: playerScores.length,
      uniqueGamesPlayed: gamesPlayed.length,
      averageScore: playerScores.reduce((sum, score) => sum + score.score, 0) / playerScores.length || 0,
      highestScore: Math.max(...playerScores.map(score => score.score), 0),
      favoriteGame: this.getMostPlayedGame(gamesPlayed),
      gamesPlayed: gamesPlayed.map(gameId => ({
        gameId,
        gameName: this.getGame(gameId)?.name || gameId,
        scores: playerScores.filter(score => score.gameId === gameId),
        bestScore: Math.max(...playerScores.filter(score => score.gameId === gameId).map(s => s.score), 0)
      }))
    };
  },

  // Get most played game
  getMostPlayedGame(gameIds) {
    const scores = this.getScores();
    const gameCounts = gameIds.map(gameId => ({
      gameId,
      count: scores.filter(score => score.gameId === gameId).length
    }));
    
    const mostPlayed = gameCounts.reduce((max, current) => 
      current.count > max.count ? current : max, gameCounts[0]);
    
    return mostPlayed?.gameId;
  },

  // Delete score
  deleteScore(scoreId) {
    const scores = this.getScores();
    const filteredScores = scores.filter(score => score.id !== scoreId);
    storageService.setItem(GAME_SCORES_KEY, filteredScores);
    return true;
  },

  // Clear all scores
  clearAllScores() {
    storageService.setItem(GAME_SCORES_KEY, []);
    this.initializeGameStats();
    return true;
  },

  // Initialize game statistics
  initializeGameStats() {
    storageService.setItem(GAME_STATS_KEY, {
      totalGamesPlayed: 0,
      totalTimeSpent: 0,
      favoriteGame: null,
      lastPlayedGame: null,
      favoriteGamePlayCount: 0,
      achievements: []
    });
  },

  // Export data
  exportData() {
    return {
      games: this.getGames(),
      scores: this.getScores(),
      stats: this.getGameStats(),
      exportDate: new Date().toISOString()
    };
  },

  // Import data
  importData(data) {
    if (data.games) {
      storageService.setItem(GAMES_STORAGE_KEY, data.games);
    }
    if (data.scores) {
      storageService.setItem(GAME_SCORES_KEY, data.scores);
    }
    if (data.stats) {
      storageService.setItem(GAME_STATS_KEY, data.stats);
    }
    return true;
  }
};

export default gamesService;
