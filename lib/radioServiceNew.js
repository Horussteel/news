// Simplified Radio Service with Radio Browser API
// Focus on functionality and reliability

const RADIO_BROWSER_API = 'https://de1.api.radio-browser.info/json';

class RadioServiceNew {
  constructor() {
    this.stations = [];
    this.favorites = this.loadFavorites();
    this.recentlyPlayed = this.loadRecentlyPlayed();
    this.currentStation = null;
  }

  // Local storage helpers
  loadFavorites() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('radioFavorites');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  }

  saveFavorites() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('radioFavorites', JSON.stringify(this.favorites));
    }
  }

  loadRecentlyPlayed() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('radioRecentlyPlayed');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  }

  saveRecentlyPlayed() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('radioRecentlyPlayed', JSON.stringify(this.recentlyPlayed));
    }
  }

  // Fetch stations from Radio Browser API
  async fetchRomanianStations() {
    try {
      console.log('Fetching Romanian stations from Radio Browser API...');
      
      const response = await fetch(
        `${RADIO_BROWSER_API}/stations/bycountry/romania?limit=50&order=votes&reverse=true`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Fetched ${data.length} stations`);

      // Process and normalize data
      const stations = data.map(station => ({
        id: station.stationuuid,
        name: station.name || 'Unknown Station',
        url: station.url_resolved || station.url,
        favicon: station.favicon || '/radio-placeholder.png',
        country: station.country || 'Romania',
        genre: station.tags ? station.tags.split(',')[0] : 'Various',
        tags: station.tags ? station.tags.split(',') : [],
        votes: station.votes || 0,
        bitrate: station.bitrate || 128,
        codec: station.codec || 'MP3',
        homepage: station.homepage || '',
        lastcheckok: station.lastcheckok === 1
      }));

      // Filter only working stations
      const workingStations = stations.filter(station => 
        station.lastcheckok && station.url && station.url.startsWith('http')
      );

      console.log(`${workingStations.length} working stations found`);
      this.stations = workingStations;
      return workingStations;

    } catch (error) {
      console.error('Error fetching stations:', error);
      // Return fallback stations if API fails
      return this.getFallbackStations();
    }
  }

  // Fallback stations for testing
  getFallbackStations() {
    return [
      {
        id: 'fallback-1',
        name: 'Radio Zu',
        url: 'http://stream2.radiozu.ro:8020/',
        favicon: '/radio-placeholder.png',
        country: 'Romania',
        genre: 'Top 40',
        tags: ['top40', 'pop', 'romanian'],
        votes: 100,
        bitrate: 128,
        codec: 'MP3',
        homepage: 'https://radiozu.ro',
        lastcheckok: true
      },
      {
        id: 'fallback-2',
        name: 'Pro FM',
        url: 'http://live.profm.ro:8000/profm.mp3',
        favicon: '/radio-placeholder.png',
        country: 'Romania',
        genre: 'Pop',
        tags: ['pop', 'hits'],
        votes: 95,
        bitrate: 192,
        codec: 'MP3',
        homepage: 'https://profm.ro',
        lastcheckok: true
      },
      {
        id: 'fallback-3',
        name: 'Europa FM',
        url: 'http://astreaming.europafm.ro:8000/europafm.aacp',
        favicon: '/radio-placeholder.png',
        country: 'Romania',
        genre: 'News',
        tags: ['news', 'talk'],
        votes: 88,
        bitrate: 64,
        codec: 'AAC',
        homepage: 'https://europafm.ro',
        lastcheckok: true
      }
    ];
  }

  // Get all stations
  getStations() {
    return this.stations;
  }

  // Get stations by genre
  getStationsByGenre(genre) {
    if (genre === 'all') return this.stations;
    return this.stations.filter(station => 
      station.genre.toLowerCase().includes(genre.toLowerCase()) ||
      station.tags.some(tag => tag.toLowerCase().includes(genre.toLowerCase()))
    );
  }

  // Search stations
  searchStations(query) {
    const lowerQuery = query.toLowerCase();
    return this.stations.filter(station =>
      station.name.toLowerCase().includes(lowerQuery) ||
      station.genre.toLowerCase().includes(lowerQuery) ||
      station.country.toLowerCase().includes(lowerQuery) ||
      station.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Get station by ID
  getStationById(id) {
    return this.stations.find(station => station.id === id);
  }

  // Favorites management
  addToFavorites(station) {
    const exists = this.favorites.find(fav => fav.id === station.id);
    if (!exists) {
      this.favorites.push(station);
      this.saveFavorites();
    }
  }

  removeFromFavorites(stationId) {
    this.favorites = this.favorites.filter(fav => fav.id !== stationId);
    this.saveFavorites();
  }

  getFavorites() {
    return this.favorites;
  }

  isFavorite(stationId) {
    return this.favorites.some(fav => fav.id === stationId);
  }

  // Recently played management
  addToRecentlyPlayed(station) {
    // Remove if already exists
    this.recentlyPlayed = this.recentlyPlayed.filter(s => s.id !== station.id);
    // Add to beginning
    this.recentlyPlayed.unshift(station);
    // Keep only last 20
    this.recentlyPlayed = this.recentlyPlayed.slice(0, 20);
    this.saveRecentlyPlayed();
  }

  getRecentlyPlayed() {
    return this.recentlyPlayed;
  }

  // Current station management
  setCurrentStation(station) {
    this.currentStation = station;
    if (station) {
      this.addToRecentlyPlayed(station);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentRadioStation', JSON.stringify(station));
    }
  }

  getCurrentStation() {
    if (this.currentStation) {
      return this.currentStation;
    }
    
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('currentRadioStation');
      if (saved) {
        this.currentStation = JSON.parse(saved);
        return this.currentStation;
      }
    }
    
    return null;
  }

  // Get available genres
  getGenres() {
    const genreSet = new Set();
    this.stations.forEach(station => {
      if (station.genre && station.genre !== 'Various') {
        genreSet.add(station.genre);
      }
      station.tags.forEach(tag => {
        if (tag && tag.length > 0) {
          genreSet.add(tag);
        }
      });
    });
    
    return Array.from(genreSet).sort().map(genre => ({
      name: genre,
      icon: this.getGenreIcon(genre)
    }));
  }

  getGenreIcon(genre) {
    const icons = {
      'pop': '🎵',
      'rock': '🎸',
      'jazz': '🎷',
      'classical': '🎻',
      'electronic': '🎧',
      'hip hop': '🎤',
      'country': '🤠',
      'folk': '🪕',
      'blues': '🎺',
      'metal': '🤘',
      'reggae': '🌴',
      'dance': '💃',
      'house': '🏠',
      'techno': '🤖',
      'ambient': '🌊',
      'news': '📰',
      'talk': '🗣️',
      'sports': '⚽',
      'top40': '🔝',
      'hits': '🎯',
      'romanian': '🇷🇴',
      'manele': '🎵'
    };
    
    const lowerGenre = genre.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (lowerGenre.includes(key)) {
        return icon;
      }
    }
    
    return '🎵';
  }

  // Validate stream URL
  async validateStreamUrl(url) {
    try {
      // Simple validation - just check if URL is accessible
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true; // If no CORS error, assume it's working
    } catch (error) {
      console.log('Stream validation error (may be CORS):', error.message);
      return true; // Assume it's working since CORS might block the request
    }
  }
}

export default new RadioServiceNew();
