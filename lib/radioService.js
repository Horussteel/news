const RADIO_API_BASE = 'https://api.radio-browser.info/json';

class RadioService {
  constructor() {
    this.stations = [];
    this.favorites = this.loadFavorites();
    this.recentlyPlayed = this.loadRecentlyPlayed();
    this.currentStation = null;
  }

  // Load favorites from localStorage
  loadFavorites() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('radioFavorites');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  }

  // Load recently played from localStorage
  loadRecentlyPlayed() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('radioRecentlyPlayed');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  }

  // Save favorites to localStorage
  saveFavorites() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('radioFavorites', JSON.stringify(this.favorites));
    }
  }

  // Save recently played to localStorage
  saveRecentlyPlayed() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('radioRecentlyPlayed', JSON.stringify(this.recentlyPlayed));
    }
  }

  // Search radio stations by country
  async searchByCountry(countryCode = 'RO', limit = 50) {
    try {
      const response = await fetch(
        `${RADIO_API_BASE}/stations/search?countrycode=${countryCode}&limit=${limit}&order=clickcount&reverse=true`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch radio stations');
      }
      
      const stations = await response.json();
      
      // Filter and enhance stations data
      return stations
        .filter(station => station.url && station.name)
        .map(station => ({
          id: station.stationuuid,
          name: station.name,
          url: station.url,
          country: station.country,
          language: station.language || 'Unknown',
          genre: station.tags || 'Various',
          favicon: station.favicon || '/radio-placeholder.png',
          votes: station.votes || 0,
          clickCount: station.clickcount || 0,
          isFavorite: this.favorites.some(fav => fav.id === station.stationuuid),
          bitrate: station.bitrate || 128
        }));
    } catch (error) {
      console.error('Error fetching radio stations:', error);
      return [];
    }
  }

  // Search radio stations by genre
  async searchByGenre(genre, limit = 30) {
    try {
      const response = await fetch(
        `${RADIO_API_BASE}/stations/search?tag=${genre}&limit=${limit}&order=clickcount&reverse=true`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch radio stations by genre');
      }
      
      const stations = await response.json();
      
      return stations
        .filter(station => station.url && station.name)
        .map(station => ({
          id: station.stationuuid,
          name: station.name,
          url: station.url,
          country: station.country,
          language: station.language || 'Unknown',
          genre: station.tags || 'Various',
          favicon: station.favicon || '/radio-placeholder.png',
          votes: station.votes || 0,
          clickCount: station.clickcount || 0,
          isFavorite: this.favorites.some(fav => fav.id === station.stationuuid),
          bitrate: station.bitrate || 128
        }));
    } catch (error) {
      console.error('Error fetching radio stations by genre:', error);
      return [];
    }
  }

  // Get popular Romanian radio stations
  async getRomanianStations() {
    // Return comprehensive list of Romanian stations with multiple backup URLs
    const romanianStations = [
      {
        id: 'radio-zu-1',
        name: 'Radio Zu',
        urls: [
          'https://stream.radiozu.ro/mp3',
          'http://stream.radiozu.ro/mp3',
          'https://live.radiozu.ro/mp3',
          'http://live.radiozu.ro/mp3'
        ],
        country: 'Romania',
        language: 'Romanian',
        genre: 'Top 40,Pop,Rock',
        favicon: 'https://www.radiozu.ro/favicon.ico',
        votes: 1000,
        clickCount: 5000,
        isFavorite: this.favorites.some(fav => fav.id === 'radio-zu-1'),
        bitrate: 192
      },
      {
        id: 'pro-fm-1',
        name: 'Pro FM',
        urls: [
          'https://stream.profm.ro/profm.mp3',
          'http://stream.profm.ro/profm.mp3',
          'https://icecast.profm.ro/profm.mp3',
          'http://icecast.profm.ro/profm.mp3'
        ],
        country: 'Romania',
        language: 'Romanian',
        genre: 'Top 40,Pop',
        favicon: 'https://www.profm.ro/favicon.ico',
        votes: 950,
        clickCount: 4500,
        isFavorite: this.favorites.some(fav => fav.id === 'pro-fm-1'),
        bitrate: 192
      },
      {
        id: 'kiss-fm-1',
        name: 'Kiss FM',
        urls: [
          'https://stream.kissfm.ro/kissfm.mp3',
          'http://stream.kissfm.ro/kissfm.mp3',
          'https://kissfm.ro/kissfm.mp3',
          'http://kissfm.ro/kissfm.mp3'
        ],
        country: 'Romania',
        language: 'Romanian',
        genre: 'Top 40,Dance,Pop',
        favicon: 'https://www.kissfm.ro/favicon.ico',
        votes: 900,
        clickCount: 4000,
        isFavorite: this.favorites.some(fav => fav.id === 'kiss-fm-1'),
        bitrate: 128
      },
      {
        id: 'magic-fm-1',
        name: 'Magic FM',
        urls: [
          'https://stream.magicfm.ro/magicfm.mp3',
          'http://stream.magicfm.ro/magicfm.mp3',
          'https://live.magicfm.ro/magicfm.mp3',
          'http://live.magicfm.ro/magicfm.mp3'
        ],
        country: 'Romania',
        language: 'Romanian',
        genre: 'Easy Listening,Pop',
        favicon: 'https://www.magicfm.ro/favicon.ico',
        votes: 800,
        clickCount: 3500,
        isFavorite: this.favorites.some(fav => fav.id === 'magic-fm-1'),
        bitrate: 128
      },
      {
        id: 'radio-romania-muzical-1',
        name: 'Radio România Muzical',
        urls: [
          'http://stream2.srr.ro:8016/RomanaMuzical.mp3',
          'http://stream.srr.ro:8016/RomanaMuzical.mp3',
          'https://stream.srr.ro:8016/RomanaMuzical.mp3'
        ],
        country: 'Romania',
        language: 'Romanian',
        genre: 'Classical,Music',
        favicon: 'https://www.romania-muzical.ro/favicon.ico',
        votes: 750,
        clickCount: 3000,
        isFavorite: this.favorites.some(fav => fav.id === 'radio-romania-muzical-1'),
        bitrate: 192
      },
      {
        id: 'radio-romania-actualitati-1',
        name: 'Radio România Actualități',
        urls: [
          'http://stream2.srr.ro:8024/Actualitati.mp3',
          'http://stream.srr.ro:8024/Actualitati.mp3',
          'https://stream.srr.ro:8024/Actualitati.mp3'
        ],
        country: 'Romania',
        language: 'Romanian',
        genre: 'News,Talk',
        favicon: 'https://www.romania-actualitati.ro/favicon.ico',
        votes: 850,
        clickCount: 3200,
        isFavorite: this.favorites.some(fav => fav.id === 'radio-romania-actualitati-1'),
        bitrate: 128
      },
      {
        id: 'radio-romania-cultural-1',
        name: 'Radio România Cultural',
        urls: [
          'http://stream2.srr.ro:8012/Cultural.mp3',
          'http://stream.srr.ro:8012/Cultural.mp3',
          'https://stream.srr.ro:8012/Cultural.mp3'
        ],
        country: 'Romania',
        language: 'Romanian',
        genre: 'Cultural,Talk',
        favicon: 'https://www.romania-cultural.ro/favicon.ico',
        votes: 700,
        clickCount: 2800,
        isFavorite: this.favorites.some(fav => fav.id === 'radio-romania-cultural-1'),
        bitrate: 128
      },
      {
        id: 'digi-fm-1',
        name: 'Digi FM',
        urls: [
          'https://audio.digi24.ro/DigiFM.mp3',
          'http://audio.digi24.ro/DigiFM.mp3',
          'https://srg-ssr-1-digi.mp3',
          'http://srg-ssr-1-digi.mp3'
        ],
        country: 'Romania',
        language: 'Romanian',
        genre: 'News,Talk',
        favicon: 'https://www.digifm.ro/favicon.ico',
        votes: 820,
        clickCount: 3100,
        isFavorite: this.favorites.some(fav => fav.id === 'digi-fm-1'),
        bitrate: 128
      },
      {
        id: 'europa-fm-1',
        name: 'Europa FM',
        urls: [
          'https://stream.europafm.ro/EuropaFM.mp3',
          'http://stream.europafm.ro/EuropaFM.mp3',
          'https://live.europafm.ro/EuropaFM.mp3'
        ],
        country: 'Romania',
        language: 'Romanian',
        genre: 'News, Talk',
        favicon: 'https://www.europafm.ro/favicon.ico',
        votes: 780,
        clickCount: 2900,
        isFavorite: this.favorites.some(fav => fav.id === 'europa-fm-1'),
        bitrate: 128
      },
      {
        id: 'radio-3net-1',
        name: 'Radio 3Net',
        urls: [
          'http://live.radio3net.ro:8000/radio3net.mp3',
          'https://live.radio3net.ro:8000/radio3net.mp3',
          'http://radio3net.ro:8000/radio3net.mp3',
          'https://radio3net.ro:8000/radio3net.mp3'
        ],
        country: 'Romania',
        language: 'Romanian',
        genre: 'Dance,Electronic',
        favicon: 'https://www.radio3net.ro/favicon.ico',
        votes: 750,
        clickCount: 2700,
        isFavorite: this.favorites.some(fav => fav.id === 'radio-3net-1'),
        bitrate: 192
      },
      {
        id: 'rock-fm-1',
        name: 'Rock FM',
        urls: [
          'https://stream.rockfm.ro/rockfm.mp3',
          'http://stream.rockfm.ro/rockfm.mp3',
          'https://live.rockfm.ro/rockfm.mp3',
          'http://live.rockfm.ro/rockfm.mp3'
        ],
        country: 'Romania',
        language: 'Romanian',
        genre: 'Rock,Classic Rock',
        favicon: 'https://www.rockfm.ro/favicon.ico',
        votes: 820,
        clickCount: 3000,
        isFavorite: this.favorites.some(fav => fav.id === 'rock-fm-1'),
        bitrate: 192
      },
      {
        id: 'virgin-radio-1',
        name: 'Virgin Radio',
        urls: [
          'https://stream.virginradio.ro/virgin.mp3',
          'http://stream.virginradio.ro/virgin.mp3',
          'https://live.virginradio.ro/virgin.mp3'
        ],
        country: 'Romania',
        language: 'Romanian',
        genre: 'Top 40,Pop',
        favicon: 'https://www.virginradio.ro/favicon.ico',
        votes: 880,
        clickCount: 3300,
        isFavorite: this.favorites.some(fav => fav.id === 'virgin-radio-1'),
        bitrate: 128
      },
      {
        id: 'nav-romania-1',
        name: 'NAV Romania',
        urls: [
          'http://live.nav.ro:8000/nav.mp3',
          'https://live.nav.ro:8000/nav.mp3',
          'http://nav.ro:8000/nav.mp3'
        ],
        country: 'Romania',
        language: 'Romanian',
        genre: 'Dance,Electronic',
        favicon: 'https://www.nav.ro/favicon.ico',
        votes: 720,
        clickCount: 2600,
        isFavorite: this.favorites.some(fav => fav.id === 'nav-romania-1'),
        bitrate: 192
      },
      {
        id: 'radio-tanana-1',
        name: 'Radio Tanana',
        urls: [
          'http://asculta.radiotanana.ro:8000/radiotanana.mp3',
          'https://asculta.radiotanana.ro:8000/radiotanana.mp3',
          'http://www.radiotanana.ro:8000/radiotanana.mp3'
        ],
        country: 'Romania',
        language: 'Romanian',
        genre: 'Manele,Pop',
        favicon: 'https://www.radiotanana.ro/favicon.ico',
        votes: 900,
        clickCount: 3800,
        isFavorite: this.favorites.some(fav => fav.id === 'radio-tanana-1'),
        bitrate: 128
      },
      {
        id: 'radio-impact-1',
        name: 'Radio Impact',
        urls: [
          'http://live.radioimpact.ro:8000/impact.mp3',
          'https://live.radioimpact.ro:8000/impact.mp3',
          'http://www.radioimpact.ro:8000/impact.mp3'
        ],
        country: 'Romania',
        language: 'Romanian',
        genre: 'Dance,Electronic',
        favicon: 'https://www.radioimpact.ro/favicon.ico',
        votes: 680,
        clickCount: 2400,
        isFavorite: this.favorites.some(fav => fav.id === 'radio-impact-1'),
        bitrate: 192
      },
      {
        id: 'radio-guerrilla-1',
        name: 'Radio Guerrilla',
        urls: [
          'http://live.guerrillaradio.ro:8000/guerrilla.mp3',
          'https://live.guerrillaradio.ro:8000/guerrilla.mp3',
          'http://www.guerrillaradio.ro:8000/guerrilla.mp3'
        ],
        country: 'Romania',
        language: 'Romanian',
        genre: 'Alternative,Indie',
        favicon: 'https://www.guerrillaradio.ro/favicon.ico',
        votes: 750,
        clickCount: 2800,
        isFavorite: this.favorites.some(fav => fav.id === 'radio-guerrilla-1'),
        bitrate: 192
      },
      // Additional popular stations
      {
        id: 'itsybitsy-1',
        name: 'Itsy Bitsy',
        urls: [
          'https://stream.itsybitsy.ro/itsybitsy.mp3',
          'http://stream.itsybitsy.ro/itsybitsy.mp3'
        ],
        country: 'Romania',
        language: 'Romanian',
        genre: 'Children,Family',
        favicon: 'https://www.itsybitsy.ro/favicon.ico',
        votes: 600,
        clickCount: 2000,
        isFavorite: this.favorites.some(fav => fav.id === 'itsybitsy-1'),
        bitrate: 128
      },
      {
        id: 'city-fm-1',
        name: 'City FM',
        urls: [
          'https://stream.cityfm.ro/cityfm.mp3',
          'http://stream.cityfm.ro/cityfm.mp3'
        ],
        country: 'Romania',
        language: 'Romanian',
        genre: 'Pop,Top 40',
        favicon: 'https://www.cityfm.ro/favicon.ico',
        votes: 650,
        clickCount: 2200,
        isFavorite: this.favorites.some(fav => fav.id === 'city-fm-1'),
        bitrate: 128
      },
      {
        id: 'radio-21-1',
        name: 'Radio 21',
        urls: [
          'https://stream.radio21.ro/radio21.mp3',
          'http://stream.radio21.ro/radio21.mp3'
        ],
        country: 'Romania',
        language: 'Romanian',
        genre: 'Pop,News',
        favicon: 'https://www.radio21.ro/favicon.ico',
        votes: 700,
        clickCount: 2500,
        isFavorite: this.favorites.some(fav => fav.id === 'radio-21-1'),
        bitrate: 128
      }
    ];

    // Convert to single URL format for compatibility and mark favorites
    return romanianStations.map(station => ({
      ...station,
      url: station.urls[0], // Primary URL
      backupUrls: station.urls.slice(1),
      isFavorite: this.favorites.some(fav => fav.id === station.id)
    }));
  }

  // Get stations by multiple countries (for variety)
  async getInternationalStations() {
    // Return comprehensive list of international stations with working URLs
    const internationalStations = [
      {
        id: 'bbc-radio-1',
        name: 'BBC Radio 1',
        url: 'http://stream.live.vc.bbcmedia.co.uk/bbc_radio_one_mp3',
        country: 'United Kingdom',
        language: 'English',
        genre: 'Top 40,Pop',
        favicon: 'https://www.bbc.co.uk/radio1/favicon.ico',
        votes: 1200,
        clickCount: 6000,
        isFavorite: this.favorites.some(fav => fav.id === 'bbc-radio-1'),
        bitrate: 128
      },
      {
        id: 'bbc-radio-2',
        name: 'BBC Radio 2',
        url: 'http://stream.live.vc.bbcmedia.co.uk/bbc_radio_two_mp3',
        country: 'United Kingdom',
        language: 'English',
        genre: 'Pop,Easy Listening',
        favicon: 'https://www.bbc.co.uk/radio2/favicon.ico',
        votes: 1100,
        clickCount: 5500,
        isFavorite: this.favorites.some(fav => fav.id === 'bbc-radio-2'),
        bitrate: 128
      },
      {
        id: 'bbc-radio-3',
        name: 'BBC Radio 3',
        url: 'http://stream.live.vc.bbcmedia.co.uk/bbc_radio_three_mp3',
        country: 'United Kingdom',
        language: 'English',
        genre: 'Classical,Jazz',
        favicon: 'https://www.bbc.co.uk/radio3/favicon.ico',
        votes: 900,
        clickCount: 4500,
        isFavorite: this.favorites.some(fav => fav.id === 'bbc-radio-3'),
        bitrate: 192
      },
      {
        id: 'bbc-radio-4',
        name: 'BBC Radio 4',
        url: 'http://stream.live.vc.bbcmedia.co.uk/bbc_radio_fourfm_mp3',
        country: 'United Kingdom',
        language: 'English',
        genre: 'News,Talk',
        favicon: 'https://www.bbc.co.uk/radio4/favicon.ico',
        votes: 1000,
        clickCount: 5000,
        isFavorite: this.favorites.some(fav => fav.id === 'bbc-radio-4'),
        bitrate: 128
      },
      {
        id: 'nrj-france',
        name: 'NRJ France',
        url: 'http://stream.nrj.fr/nrj.mp3',
        country: 'France',
        language: 'French',
        genre: 'Top 40,Pop',
        favicon: 'https://www.nrj.fr/favicon.ico',
        votes: 950,
        clickCount: 4800,
        isFavorite: this.favorites.some(fav => fav.id === 'nrj-france'),
        bitrate: 128
      },
      {
        id: 'rtl-france',
        name: 'RTL France',
        url: 'http://stream.rtl.fr/rtl.mp3',
        country: 'France',
        language: 'French',
        genre: 'News,Talk',
        favicon: 'https://www.rtl.fr/favicon.ico',
        votes: 900,
        clickCount: 4200,
        isFavorite: this.favorites.some(fav => fav.id === 'rtl-france'),
        bitrate: 128
      },
      {
        id: 'rfm-france',
        name: 'RFM France',
        url: 'http://stream.rfm.fr/rfm.mp3',
        country: 'France',
        language: 'French',
        genre: 'Pop,Top 40',
        favicon: 'https://www.rfm.fr/favicon.ico',
        votes: 850,
        clickCount: 4000,
        isFavorite: this.favorites.some(fav => fav.id === 'rfm-france'),
        bitrate: 128
      },
      {
        id: 'wdr-germany',
        name: 'WDR 4',
        url: 'http://wdr-mp3-m.wdr.de/wdr-mp3-m/live/mp3/128/stream.mp3',
        country: 'Germany',
        language: 'German',
        genre: 'Pop,News',
        favicon: 'https://www.wdr.de/favicon.ico',
        votes: 800,
        clickCount: 3800,
        isFavorite: this.favorites.some(fav => fav.id === 'wdr-germany'),
        bitrate: 128
      },
      {
        id: 'antenne-bayern',
        name: 'Antenne Bayern',
        url: 'https://stream.antenne.de/antenne/bayern/mp3',
        country: 'Germany',
        language: 'German',
        genre: 'Pop,Top 40',
        favicon: 'https://www.antenne.de/favicon.ico',
        votes: 850,
        clickCount: 3900,
        isFavorite: this.favorites.some(fav => fav.id === 'antenne-bayern'),
        bitrate: 128
      },
      {
        id: 'rds-italy',
        name: 'RDS Italy',
        url: 'https://stream.rds.it/rds.mp3',
        country: 'Italy',
        language: 'Italian',
        genre: 'Pop,Top 40',
        favicon: 'https://www.rds.it/favicon.ico',
        votes: 900,
        clickCount: 4100,
        isFavorite: this.favorites.some(fav => fav.id === 'rds-italy'),
        bitrate: 128
      },
      {
        id: 'rtl-italy',
        name: 'RTL Italy',
        url: 'https://stream.rtl.it/rtl.mp3',
        country: 'Italy',
        language: 'Italian',
        genre: 'News,Talk',
        favicon: 'https://www.rtl.it/favicon.ico',
        votes: 820,
        clickCount: 3700,
        isFavorite: this.favorites.some(fav => fav.id === 'rtl-italy'),
        bitrate: 128
      },
      {
        id: 'cadena-ser',
        name: 'Cadena SER',
        url: 'https://emisoras.cadenaser.com/mp3/main.mp3',
        country: 'Spain',
        language: 'Spanish',
        genre: 'News,Talk',
        favicon: 'https://www.cadenaser.com/favicon.ico',
        votes: 950,
        clickCount: 4600,
        isFavorite: this.favorites.some(fav => fav.id === 'cadena-ser'),
        bitrate: 128
      },
      {
        id: 'los40-espana',
        name: 'LOS40 España',
        url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40_MP3.mp3',
        country: 'Spain',
        language: 'Spanish',
        genre: 'Top 40,Pop',
        favicon: 'https://www.los40.com/favicon.ico',
        votes: 880,
        clickCount: 4200,
        isFavorite: this.favorites.some(fav => fav.id === 'los40-espana'),
        bitrate: 128
      },
      {
        id: 'kexp-seattle',
        name: 'KEXP Seattle',
        url: 'http://live-mp3-128.kexp.org/kexp128.mp3',
        country: 'USA',
        language: 'English',
        genre: 'Alternative,Indie',
        favicon: 'https://www.kexp.org/favicon.ico',
        votes: 1000,
        clickCount: 5000,
        isFavorite: this.favorites.some(fav => fav.id === 'kexp-seattle'),
        bitrate: 128
      },
      {
        id: 'nyc-public-radio',
        name: 'WNYC New York',
        url: 'http://fm-mp3-128.wnyc.org/wnycfm.mp3',
        country: 'USA',
        language: 'English',
        genre: 'News,Talk',
        favicon: 'https://www.wnyc.org/favicon.ico',
        votes: 950,
        clickCount: 4800,
        isFavorite: this.favorites.some(fav => fav.id === 'nyc-public-radio'),
        bitrate: 128
      },
      {
        id: 'jazz24',
        name: 'Jazz 24',
        url: 'http://jazz24.leanstream.co/jazz24.mp3',
        country: 'USA',
        language: 'English',
        genre: 'Jazz',
        favicon: 'https://www.jazz24.com/favicon.ico',
        votes: 800,
        clickCount: 3500,
        isFavorite: this.favorites.some(fav => fav.id === 'jazz24'),
        bitrate: 128
      },
      {
        id: 'classical-music',
        name: 'Classical Music',
        url: 'http://stream.srg-ssr.ch/m/drs3/mp3_128',
        country: 'Switzerland',
        language: 'German',
        genre: 'Classical',
        favicon: 'https://www.srf.ch/favicon.ico',
        votes: 750,
        clickCount: 3200,
        isFavorite: this.favorites.some(fav => fav.id === 'classical-music'),
        bitrate: 128
      },
      {
        id: 'smooth-radio',
        name: 'Smooth Radio UK',
        url: 'http://media-ice.musicradio.com/SmoothUKMP3',
        country: 'United Kingdom',
        language: 'English',
        genre: 'Easy Listening,Pop',
        favicon: 'https://www.smoothradio.com/favicon.ico',
        votes: 850,
        clickCount: 3900,
        isFavorite: this.favorites.some(fav => fav.id === 'smooth-radio'),
        bitrate: 128
      },
      {
        id: 'absolute-radio',
        name: 'Absolute Radio UK',
        url: 'http://media-ice.musicradio.com/AbsoluteRadioMP3',
        country: 'United Kingdom',
        language: 'English',
        genre: 'Rock,Pop',
        favicon: 'https://www.absoluteradio.co.uk/favicon.ico',
        votes: 820,
        clickCount: 3700,
        isFavorite: this.favorites.some(fav => fav.id === 'absolute-radio'),
        bitrate: 128
      },
      {
        id: 'heart-uk',
        name: 'Heart UK',
        url: 'http://media-ice.musicradio.com/HeartLondonMP3',
        country: 'United Kingdom',
        language: 'English',
        genre: 'Pop,Easy Listening',
        favicon: 'https://www.heart.co.uk/favicon.ico',
        votes: 900,
        clickCount: 4300,
        isFavorite: this.favorites.some(fav => fav.id === 'heart-uk'),
        bitrate: 128
      },
      {
        id: 'capital-uk',
        name: 'Capital UK',
        url: 'http://media-ice.musicradio.com/CapitalMP3',
        country: 'United Kingdom',
        language: 'English',
        genre: 'Top 40,Pop',
        favicon: 'https://www.capitalfm.com/favicon.ico',
        votes: 880,
        clickCount: 4100,
        isFavorite: this.favorites.some(fav => fav.id === 'capital-uk'),
        bitrate: 128
      }
    ];

    // Mark favorites
    return internationalStations.map(station => ({
      ...station,
      isFavorite: this.favorites.some(fav => fav.id === station.id)
    }));
  }

  // Add station to favorites
  addToFavorites(station) {
    if (!this.favorites.find(fav => fav.id === station.id)) {
      this.favorites.push(station);
      this.saveFavorites();
      
      // Update station in current list
      if (this.stations.length > 0) {
        const stationIndex = this.stations.findIndex(s => s.id === station.id);
        if (stationIndex !== -1) {
          this.stations[stationIndex].isFavorite = true;
        }
      }
    }
  }

  // Remove station from favorites
  removeFromFavorites(stationId) {
    this.favorites = this.favorites.filter(fav => fav.id !== stationId);
    this.saveFavorites();
    
    // Update station in current list
    if (this.stations.length > 0) {
      const stationIndex = this.stations.findIndex(s => s.id === stationId);
      if (stationIndex !== -1) {
        this.stations[stationIndex].isFavorite = false;
      }
    }
  }

  // Add station to recently played
  addToRecentlyPlayed(station) {
    // Remove if already exists
    this.recentlyPlayed = this.recentlyPlayed.filter(s => s.id !== station.id);
    
    // Add to beginning
    this.recentlyPlayed.unshift(station);
    
    // Keep only last 20
    if (this.recentlyPlayed.length > 20) {
      this.recentlyPlayed = this.recentlyPlayed.slice(0, 20);
    }
    
    this.saveRecentlyPlayed();
    this.currentStation = station;
  }

  // Get favorite stations
  getFavorites() {
    return this.favorites;
  }

  // Get recently played stations
  getRecentlyPlayed() {
    return this.recentlyPlayed;
  }

  // Get current station
  getCurrentStation() {
    return this.currentStation;
  }

  // Set current station
  setCurrentStation(station) {
    this.currentStation = station;
    this.addToRecentlyPlayed(station);
  }

  // Search stations by name
  async searchStations(query, limit = 20) {
    try {
      const response = await fetch(
        `${RADIO_API_BASE}/stations/search?name=${query}&limit=${limit}&order=clickcount&reverse=true`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search radio stations');
      }
      
      const stations = await response.json();
      
      return stations
        .filter(station => station.url && station.name)
        .map(station => ({
          id: station.stationuuid,
          name: station.name,
          url: station.url,
          country: station.country,
          language: station.language || 'Unknown',
          genre: station.tags || 'Various',
          favicon: station.favicon || '/radio-placeholder.png',
          votes: station.votes || 0,
          clickCount: station.clickcount || 0,
          isFavorite: this.favorites.some(fav => fav.id === station.stationuuid),
          bitrate: station.bitrate || 128
        }));
    } catch (error) {
      console.error('Error searching radio stations:', error);
      return [];
    }
  }

  // Get radio genres
  getGenres() {
    return [
      { name: 'Pop', icon: '🎵' },
      { name: 'Rock', icon: '🎸' },
      { name: 'Jazz', icon: '🎷' },
      { name: 'Classical', icon: '🎻' },
      { name: 'Electronic', icon: '🎧' },
      { name: 'Hip Hop', icon: '🎤' },
      { name: 'Country', icon: '🤠' },
      { name: 'News', icon: '📰' },
      { name: 'Sports', icon: '⚽' },
      { name: 'Talk', icon: '🗣️' },
      { name: 'Top 40', icon: '🏆' },
      { name: 'Dance', icon: '💃' },
      { name: 'Retro', icon: '📻' },
      { name: 'World', icon: '🌍' }
    ];
  }
}

export default new RadioService();
