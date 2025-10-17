// Simple Radio Service - Only working Romanian stations
// No API, no complications, just direct streams that work

class RadioServiceSimple {
  constructor() {
    // Hardcoded working Romanian radio stations
    this.stations = [
      // === LOCAL ROMANIAN STATIONS (SSL Verified) ===
      {
        id: 'radio-zu',
        name: 'Radio Zu 🇷🇴',
        url: 'https://stream2.radiozu.ro:8020/',
        favicon: '/radio-placeholder.png',
        country: 'Romania',
        genre: 'Top 40',
        tags: ['top40', 'pop', 'romanian', 'local', 'ssl-verified'],
        votes: 100,
        bitrate: 128,
        codec: 'MP3',
        homepage: 'https://radiozu.ro',
        lastcheckok: true,
        sslVerified: true
      },
      {
        id: 'digi-fm',
        name: 'Digi FM 🇷🇴',
        url: 'https://stream.digifm.ro:8000/digifm.mp3',
        favicon: '/radio-placeholder.png',
        country: 'Romania',
        genre: 'News',
        tags: ['news', 'talk', 'sports', 'local', 'ssl-verified'],
        votes: 90,
        bitrate: 128,
        codec: 'MP3',
        homepage: 'https://digifm.ro',
        lastcheckok: true,
        sslVerified: true
      },
      {
        id: 'radio-romania-muzical',
        name: 'Radio România Muzical 🇷🇴',
        url: 'https://stream2.srr.ro:8020/',
        favicon: '/radio-placeholder.png',
        country: 'Romania',
        genre: 'Classical',
        tags: ['classical', 'culture', 'local', 'ssl-verified'],
        votes: 83,
        bitrate: 128,
        codec: 'MP3',
        homepage: 'https://radioromaniamuzical.ro',
        lastcheckok: true,
        sslVerified: true
      },
      {
        id: 'radio-romania-cultural',
        name: 'Radio România Cultural 🇷🇴',
        url: 'https://stream4.srr.ro:8040/',
        favicon: '/radio-placeholder.png',
        country: 'Romania',
        genre: 'Cultural',
        tags: ['cultural', 'talk', 'local', 'ssl-verified'],
        votes: 80,
        bitrate: 128,
        codec: 'MP3',
        homepage: 'https://radioromaniacultural.ro',
        lastcheckok: true,
        sslVerified: true
      },
      {
        id: 'radio-3net-florin-salam',
        name: 'Radio 3NET Florin Salam 🇷🇴',
        url: 'https://live.florinsalam.ro:8000/stream',
        favicon: '/radio-placeholder.png',
        country: 'Romania',
        genre: 'Manele',
        tags: ['manele', 'popular', 'local', 'ssl-verified'],
        votes: 78,
        bitrate: 128,
        codec: 'MP3',
        homepage: 'https://radio3net.ro',
        lastcheckok: true,
        sslVerified: true
      },
      {
        id: 'antena-satelor',
        name: 'Antena Satelor 🇷🇴',
        url: 'https://live.antenaplay.ro:8000/antenasatelor.mp3',
        favicon: '/radio-placeholder.png',
        country: 'Romania',
        genre: 'Folk',
        tags: ['folk', 'traditional', 'local', 'ssl-verified'],
        votes: 82,
        bitrate: 128,
        codec: 'MP3',
        homepage: 'https://antenaplay.ro',
        lastcheckok: true,
        sslVerified: true
      },
      {
        id: 'radio-tanana',
        name: 'Radio Tănănașa 🇷🇴',
        url: 'https://live.radiotanana.ro:8000/',
        favicon: '/radio-placeholder.png',
        country: 'Romania',
        genre: 'Folk',
        tags: ['folk', 'traditional', 'local', 'ssl-verified'],
        votes: 75,
        bitrate: 128,
        codec: 'MP3',
        homepage: 'https://radiotanana.ro',
        lastcheckok: true,
        sslVerified: true
      },
      {
        id: 'radio-vip',
        name: 'Radio Vip 🇷🇴',
        url: 'https://live1.radiovip.ro:8969/live',
        favicon: '/radio-placeholder.png',
        country: 'Romania',
        genre: 'Dance',
        tags: ['dance', 'pop', 'hits', 'local', 'ssl-verified'],
        votes: 70,
        bitrate: 128,
        codec: 'MP3',
        homepage: 'https://radiovip.ro',
        lastcheckok: true,
        sslVerified: true
      },
      // === INTERNATIONAL STATIONS ===
      {
        id: 'pro-fm',
        name: 'Pro FM',
        url: 'https://live.profm.ro:8000/profm.mp3',
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
        id: 'europa-fm',
        name: 'Europa FM',
        url: 'https://astreaming.europafm.ro:8000/europafm.mp3',
        favicon: '/radio-placeholder.png',
        country: 'Romania',
        genre: 'News',
        tags: ['news', 'talk'],
        votes: 88,
        bitrate: 128,
        codec: 'MP3',
        homepage: 'https://europafm.ro',
        lastcheckok: true
      },
      {
        id: 'kiss-fm',
        name: 'Kiss FM',
        url: 'https://live.kissfm.ro:8000/kissfm.mp3',
        favicon: '/radio-placeholder.png',
        country: 'Romania',
        genre: 'Dance',
        tags: ['dance', 'pop', 'hits'],
        votes: 92,
        bitrate: 128,
        codec: 'MP3',
        homepage: 'https://kissfm.ro',
        lastcheckok: true
      },
      {
        id: 'magic-fm',
        name: 'Magic FM',
        url: 'https://stream.magicfm.ro:8000/magicfm.mp3',
        favicon: '/radio-placeholder.png',
        country: 'Romania',
        genre: 'Soft Rock',
        tags: ['soft', 'rock', 'oldies'],
        votes: 85,
        bitrate: 128,
        codec: 'MP3',
        homepage: 'https://magicfm.ro',
        lastcheckok: true
      },
      {
        id: 'rock-fm',
        name: 'Rock FM',
        url: 'https://live.rockfm.ro:8000/rockfm.mp3',
        favicon: '/radio-placeholder.png',
        country: 'Romania',
        genre: 'Rock',
        tags: ['rock', 'classic'],
        votes: 87,
        bitrate: 128,
        codec: 'MP3',
        homepage: 'https://rockfm.ro',
        lastcheckok: true
      },
      {
        id: 'pro-fm-aac',
        name: 'Pro FM AAC',
        url: 'https://live.profm.ro:8000/profm.aac',
        favicon: '/radio-placeholder.png',
        country: 'Romania',
        genre: 'Pop',
        tags: ['pop', 'hits', 'aac'],
        votes: 94,
        bitrate: 128,
        codec: 'AAC',
        homepage: 'https://profm.ro',
        lastcheckok: true
      }
    ];

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

  // Simple methods - no API calls
  async fetchRomanianStations() {
    return Promise.resolve(this.stations);
  }

  getStations() {
    return this.stations;
  }

  getStationsByGenre(genre) {
    if (genre === 'all') return this.stations;
    return this.stations.filter(station => 
      station.genre.toLowerCase().includes(genre.toLowerCase()) ||
      station.tags.some(tag => tag.toLowerCase().includes(genre.toLowerCase()))
    );
  }

  searchStations(query) {
    const lowerQuery = query.toLowerCase();
    return this.stations.filter(station =>
      station.name.toLowerCase().includes(lowerQuery) ||
      station.genre.toLowerCase().includes(lowerQuery) ||
      station.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

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
    this.recentlyPlayed = this.recentlyPlayed.filter(s => s.id !== station.id);
    this.recentlyPlayed.unshift(station);
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
      genreSet.add(station.genre);
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
      'top 40': '🔝',
      'dance': '💃',
      'news': '📰',
      'talk': '🗣️',
      'classical': '🎻',
      'cultural': '🎭',
      'folk': '🪕',
      'manele': '🎵',
      'soft': '🌊',
      'oldies': '📻',
      'traditional': '🏛️',
      'sports': '⚽'
    };
    
    const lowerGenre = genre.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (lowerGenre.includes(key)) {
        return icon;
      }
    }
    
    return '🎵';
  }
}

export default new RadioServiceSimple();
