// Radio Service using the Radio Browser API
// Docs: https://api.radio-browser.info/

class RadioServiceBrowserAPI {
  constructor() {
    // Use a reliable, geo-DNS-based endpoint for the API
    this.apiBase = 'https://all.api.radio-browser.info/json';
    this.stations = [];
  }

  async fetchRomanianStations() {
    try {
      console.log(`Using API server: ${this.apiBase}`);

      // Fetch working stations from Romania using a broader search, ordered by popularity
      const response = await fetch(`${this.apiBase}/stations/bycountry/Romania?limit=200&order=votes&reverse=true&hidebroken=true`);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter for stations with valid URLs (HTTP or HTTPS) and map to our format
      this.stations = data
        .filter(station => station.url_resolved)
        .map(station => ({
          id: station.stationuuid,
          name: station.name,
          url: station.url_resolved,
          favicon: station.favicon || '/radio-placeholder.png',
          country: station.country,
          genre: station.tags,
          tags: station.tags.split(','),
          votes: station.votes,
          bitrate: station.bitrate,
          codec: station.codec,
          homepage: station.homepage,
          lastcheckok: station.lastcheckok,
          sslVerified: true,
        }));

      console.log(`Fetched and filtered ${this.stations.length} Romanian stations.`);
      return this.stations;
    } catch (error) {
      console.error('Error fetching stations from Radio Browser API:', error);
      // Fallback to an empty array or a minimal hardcoded list if needed
      return [];
    }
  }

  async fetchInternationalStations() {
    try {
      console.log('Fetching international stations...');
      // Fetch top 100 stations by vote count, ensuring they are working
      const response = await fetch(`${this.apiBase}/stations/search?limit=100&order=votes&reverse=true&hidebroken=true`);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      const internationalStations = data
        .filter(station => station.url_resolved)
        .map(station => ({
          id: station.stationuuid,
          name: station.name,
          url: station.url_resolved,
          favicon: station.favicon || '/radio-placeholder.png',
          country: station.country,
          genre: station.tags,
          tags: station.tags.split(','),
          votes: station.votes,
          bitrate: station.bitrate,
          codec: station.codec,
          homepage: station.homepage,
          lastcheckok: station.lastcheckok,
          sslVerified: station.url_resolved.startsWith('https://'),
        }));

      console.log(`Fetched and filtered ${internationalStations.length} international stations.`);
      return internationalStations;
    } catch (error) {
      console.error('Error fetching international stations:', error);
      return [];
    }
  }

  // You can add other methods like search, getGenres, etc. here if needed
  // For now, we'll keep it simple to match the existing usage.
  
  getStations() {
    return this.stations;
  }

  searchStations(query) {
    const lowerQuery = query.toLowerCase();
    return this.stations.filter(station =>
      station.name.toLowerCase().includes(lowerQuery) ||
      station.genre.toLowerCase().includes(lowerQuery)
    );
  }

  getGenres() {
    const genreSet = new Set();
    this.stations.forEach(station => {
      if (station.genre) {
        station.genre.split(',').forEach(g => {
          if(g) genreSet.add(g.trim());
        });
      }
    });
    
    return Array.from(genreSet).sort().map(genre => ({
      name: genre,
      icon: '🎵' // A default icon
    }));
  }
}

// Export a singleton instance
const radioServiceBrowserAPI = new RadioServiceBrowserAPI();
export default radioServiceBrowserAPI;
