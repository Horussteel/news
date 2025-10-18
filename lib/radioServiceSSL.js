import radioService from './radioService';

class RadioServiceSSL {
  constructor() {
    this.baseService = radioService;
    this.isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    this.proxyUrl = '/api/radio-proxy';
  }

  // Convert HTTP URLs to proxy URLs when on HTTPS
  getSecureUrl(url) {
    if (!this.isHttps || !url) return url;
    
    // If URL is already HTTPS, return as-is
    if (url.startsWith('https://')) return url;
    
    // Convert HTTP URL to proxy URL
    return `${this.proxyUrl}?url=${encodeURIComponent(url)}`;
  }

  // Get all URLs with fallback mechanism
  getStationUrls(station) {
    const urls = [];
    
    // Add primary URL
    if (station.url) {
      urls.push(this.getSecureUrl(station.url));
    }
    
    // Add backup URLs if available
    if (station.backupUrls && Array.isArray(station.backupUrls)) {
      station.backupUrls.forEach(backupUrl => {
        urls.push(this.getSecureUrl(backupUrl));
      });
    }
    
    // If no URLs found, return empty array
    return urls.length > 0 ? urls : [];
  }

  // Get Romanian stations with SSL support
  async getRomanianStations() {
    const stations = await this.baseService.getRomanianStations();
    
    return stations.map(station => ({
      ...station,
      urls: this.getStationUrls(station),
      url: this.getSecureUrl(station.url),
      backupUrls: station.backupUrls ? station.backupUrls.map(url => this.getSecureUrl(url)) : []
    }));
  }

  // Get international stations with SSL support
  async getInternationalStations() {
    const stations = await this.baseService.getInternationalStations();
    
    return stations.map(station => ({
      ...station,
      urls: this.getStationUrls(station),
      url: this.getSecureUrl(station.url),
      backupUrls: station.backupUrls ? station.backupUrls.map(url => this.getSecureUrl(url)) : []
    }));
  }

  // Search stations with SSL support
  async searchByCountry(countryCode = 'RO', limit = 50) {
    const stations = await this.baseService.searchByCountry(countryCode, limit);
    
    return stations.map(station => ({
      ...station,
      urls: this.getStationUrls(station),
      url: this.getSecureUrl(station.url),
      backupUrls: station.backupUrls ? station.backupUrls.map(url => this.getSecureUrl(url)) : []
    }));
  }

  // Search by genre with SSL support
  async searchByGenre(genre, limit = 30) {
    const stations = await this.baseService.searchByGenre(genre, limit);
    
    return stations.map(station => ({
      ...station,
      urls: this.getStationUrls(station),
      url: this.getSecureUrl(station.url),
      backupUrls: station.backupUrls ? station.backupUrls.map(url => this.getSecureUrl(url)) : []
    }));
  }

  // Search stations by name with SSL support
  async searchStations(query, limit = 20) {
    const stations = await this.baseService.searchStations(query, limit);
    
    return stations.map(station => ({
      ...station,
      urls: this.getStationUrls(station),
      url: this.getSecureUrl(station.url),
      backupUrls: station.backupUrls ? station.backupUrls.map(url => this.getSecureUrl(url)) : []
    }));
  }

  // Test if a URL is accessible
  async testUrl(url) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors' // Important for cross-origin requests
      });
      return true;
    } catch (error) {
      console.warn(`Failed to test URL ${url}:`, error);
      return false;
    }
  }

  // Get the first working URL from a list of URLs
  async getWorkingUrl(urls) {
    if (!urls || urls.length === 0) return null;
    
    // Try each URL in order
    for (const url of urls) {
      try {
        // For proxy URLs, we can't easily test them, so return the first one
        if (url.includes('/api/radio-proxy')) {
          return url;
        }
        
        // For direct URLs, try to fetch HEAD
        const response = await fetch(url, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        return url;
      } catch (error) {
        console.warn(`URL ${url} failed, trying next...`);
        continue;
      }
    }
    
    // If all fail, return the first URL anyway
    return urls[0];
  }

  // Get best working URL for a station
  async getBestStationUrl(station) {
    const urls = this.getStationUrls(station);
    return await this.getWorkingUrl(urls);
  }

  // Delegate other methods to base service
  addToFavorites(station) {
    return this.baseService.addToFavorites(station);
  }

  removeFromFavorites(stationId) {
    return this.baseService.removeFromFavorites(stationId);
  }

  addToRecentlyPlayed(station) {
    return this.baseService.addToRecentlyPlayed(station);
  }

  getFavorites() {
    return this.baseService.getFavorites();
  }

  getRecentlyPlayed() {
    return this.baseService.getRecentlyPlayed();
  }

  getCurrentStation() {
    return this.baseService.getCurrentStation();
  }

  setCurrentStation(station) {
    return this.baseService.setCurrentStation(station);
  }

  getGenres() {
    return this.baseService.getGenres();
  }

  // Get SSL status info
  getSSLInfo() {
    return {
      isHttps: this.isHttps,
      proxyUrl: this.proxyUrl,
      needsProxy: this.isHttps
    };
  }
}

export default new RadioServiceSSL();
