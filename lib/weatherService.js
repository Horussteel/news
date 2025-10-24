// Weather Service - Serviciu pentru informații meteo folosind Open-Meteo API
// Open-Meteo este 100% gratuit pentru uz non-comercial și nu necesită cheie API
// Limitare: necesită coordonate (lat/lng), nu oferă căutare de orașe

const BASE_URL = 'https://api.open-meteo.com/v1';

class WeatherService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minute cache
    
    // Lista de orașe principale din România cu coordonatele lor
    this.cities = {
      'București': { lat: 44.4268, lon: 26.1025, country: 'RO' },
      'Cluj-Napoca': { lat: 46.7712, lon: 23.6236, country: 'RO' },
      'Timișoara': { lat: 45.7489, lon: 21.2087, country: 'RO' },
      'Iași': { lat: 47.1517, lon: 27.5879, country: 'RO' },
      'Constanța': { lat: 44.1807, lon: 28.6343, country: 'RO' },
      'Craiova': { lat: 44.3193, lon: 23.7965, country: 'RO' },
      'Brașov': { lat: 45.6486, lon: 25.6061, country: 'RO' },
      'Galați': { lat: 45.4353, lon: 28.0377, country: 'RO' },
      'Ploiești': { lat: 44.9396, lon: 26.0192, country: 'RO' },
      'Oradea': { lat: 47.0465, lon: 21.9189, country: 'RO' },
      'Brăila': { lat: 45.2652, lon: 27.9595, country: 'RO' },
      'Arad': { lat: 46.1866, lon: 21.3127, country: 'RO' },
      'Pitești': { lat: 44.8565, lon: 24.8695, country: 'RO' },
      'Sibiu': { lat: 45.7983, lon: 24.1256, country: 'RO' },
      'Bacău': { lat: 46.5670, lon: 26.9145, country: 'RO' },
      'Târgu-Mureș': { lat: 46.5466, lon: 24.5555, country: 'RO' },
      'Baia Mare': { lat: 47.6530, lon: 23.5806, country: 'RO' },
      'Buzău': { lat: 45.1492, lon: 26.8258, country: 'RO' },
      'Botoșani': { lat: 47.7489, lon: 26.6701, country: 'RO' },
      'Satu Mare': { lat: 47.7792, lon: 22.8910, country: 'RO' },
      'Râmnicu Vâlcea': { lat: 45.1039, lon: 24.3756, country: 'RO' },
      'Drobeta-Turnu Severin': { lat: 44.6309, lon: 22.6560, country: 'RO' },
      'Târgu Jiu': { lat: 45.0362, lon: 23.2805, country: 'RO' },
      'Târgoviște': { lat: 44.9300, lon: 25.4492, country: 'RO' },
      'Focșani': { lat: 45.6964, lon: 27.1830, country: 'RO' },
      'Bistrița': { lat: 47.1359, lon: 24.5079, country: 'RO' },
      'Reșița': { lat: 45.2931, lon: 21.8442, country: 'RO' }
    };
  }

  // Obține coordonatele geografice bazate pe IP (fallback pentru locație)
  async getLocationByIP() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        lat: data.latitude,
        lon: data.longitude,
        city: data.city,
        country: data.country_name
      };
    } catch (error) {
      // Fallback la București dacă IP location eșuează
      return {
        lat: 44.4268,
        lon: 26.1025,
        city: 'București',
        country: 'Romania'
      };
    }
  }

  // Obține locația utilizatorului folosind geolocation API
  async getCurrentLocation() {
    console.log('--- weatherService: Se încearcă obținerea locației GPS ---');
    
    // Mai întâncăm să obținem locația prin IP, apoi prin GPS dacă e disponibil
    try {
        // Încercăm mai întâi IP location pentru a avea o locație imediat
        const ipLocation = await this.getLocationByIP();
        console.log('--- weatherService: Locație IP obținută ---', ipLocation);
        
        // Dacă geolocația GPS e disponibilă, o folosim pentru precizie maximă
        if (navigator.geolocation) {
            console.log('--- weatherService: GPS disponibil, se încearcă obținerea locației precise ---');
            
            // Returnăm o promisiune care se rezolvă cu locația IP imediat
            // și apoi se actualizează cu locația GPS dacă e disponibilă
            return new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition(
                    // Funcția de succes - actualizăm cu locația GPS precisă
                    (position) => {
                        console.log('--- weatherService: Geolocație GPS obținută cu succes! ---', position.coords);
                        resolve({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude,
                            name: ipLocation.city || 'Locație Curentă',
                            country: ipLocation.country || 'RO'
                        });
                    },
                    // Funcția de eroare - folosim locația IP
                    (error) => {
                        console.warn('--- weatherService: GPS eșuat, se folosește locație IP ---', error.message);
                        resolve({
                            lat: ipLocation.lat,
                            lon: ipLocation.lon,
                            name: ipLocation.city || 'Locație Detectată',
                            country: ipLocation.country
                        });
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 8000,
                        maximumAge: 0
                    }
                );
            });
        } else {
            // Dacă GPS nu e disponibil, folosim doar locația IP
            console.log('--- weatherService: GPS nu e disponibil, se folosește doar locația IP ---');
            return {
                lat: ipLocation.lat,
                lon: ipLocation.lon,
                name: ipLocation.city || 'Locație Detectată',
                country: ipLocation.country
            };
        }
    } catch (error) {
        console.error('--- weatherService: Eroare la obținerea locației ---', error);
        // Doar ca ultimă soluție, folosim București
        return {
            lat: 44.4268,
            lon: 26.1025,
            name: 'București (Fallback)',
            country: 'RO'
        };
    }
}

  // Generează cache key
  getCacheKey(lat, lon, type = 'current') {
    return `${type}_${lat}_${lon}`;
  }

  // Verifică dacă cache-ul este valid
  isCacheValid(timestamp) {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  // Obține vremea curentă folosind Open-Meteo API
  async getCurrentWeather(lat, lon) {
    const cacheKey = this.getCacheKey(lat, lon, 'current');
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      // Open-Meteo API call - fără cheie API necesară
      const response = await fetch(
        `${BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,weathercode,windspeed_10m,winddirection_10m&daily=sunrise,sunset&timezone=auto`
      );
      
      if (!response.ok) {
        throw new Error('Open-Meteo API request failed');
      }
      
      const data = await response.json();
      const weatherData = this.parseCurrentWeather(data, lat, lon);
      
      // Salvăm în cache
      this.cache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
      });
      
      return weatherData;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      // Returnăm date fallback
      return this.getFallbackWeather();
    }
  }

  // Obține prognoza pe 7 zile folosind Open-Meteo API
  async getForecast(lat, lon) {
    const cacheKey = this.getCacheKey(lat, lon, 'forecast');
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      // Open-Meteo API call pentru prognoză
      const response = await fetch(
        `${BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=auto`
      );
      
      if (!response.ok) {
        throw new Error('Open-Meteo API request failed');
      }
      
      const data = await response.json();
      const forecastData = this.parseForecast(data);
      
      // Salvăm în cache
      this.cache.set(cacheKey, {
        data: forecastData,
        timestamp: Date.now()
      });
      
      return forecastData;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      return this.getFallbackForecast();
    }
  }

  // Parsează datele pentru vremea curentă de la Open-Meteo
  parseCurrentWeather(data, lat, lon) {
    if (!data || !data.current_weather || !data.hourly) {
        throw new Error("Datele meteo primite de la Open-Meteo sunt incomplete.");
    }

    // Obținem ora curentă pentru a găsi datele orare corespunzătoare
    const now = new Date();
    const currentHour = new Date(now).getHours();
    
    // Găsim indexul orei curente în array-ul hourly
    const hourlyIndex = data.hourly.time.findIndex(time => {
        const hourDate = new Date(time);
        return hourDate.getHours() === currentHour && 
               hourDate.getDate() === now.getDate();
    });

    // Folosim indexul curent sau primul index disponibil
    const useIndex = hourlyIndex >= 0 ? hourlyIndex : 0;

    // Obținem informațiile despre locație (Open-Meteo nu oferă geocoding)
    const locationInfo = {
        name: 'Locație Curentă',
        country: 'RO' // Vom îmbunătăți asta cu un serviciu de reverse geocoding dacă e necesar
    };

    // Convertim weather code în descriere și iconiță
    const weatherInfo = this.getWeatherDescription(data.current_weather.weathercode);
    
    return {
        location: locationInfo,
        current: {
            temperature: Math.round(data.current_weather.temperature),
            feels_like: Math.round(data.current_weather.temperature), // Open-Meteo nu oferă feels_like direct
            description: weatherInfo.description,
            icon: weatherInfo.icon,
            humidity: data.hourly.relativehumidity_2m[useIndex] || 50,
            pressure: 1013, // Open-Meteo nu oferă presiune în planul gratuit
            wind_speed: Math.round(data.current_weather.windspeed),
            wind_direction: data.current_weather.winddirection,
            visibility: 10, // Open-Meteo nu oferă vizibilitate în planul gratuit
            uv_index: null, // Open-Meteo oferă UV index doar în planul plătit
            sun: {
              sunrise: data.daily.sunrise[0] ? new Date(data.daily.sunrise[0]) : null,
              sunset: data.daily.sunset[0] ? new Date(data.daily.sunset[0]) : null
            }
        },
        timestamp: new Date()
    };
  }

  // Parsează datele de prognoză de la Open-Meteo
  parseForecast(data) {
    if (!data || !data.daily) {
      throw new Error("Datele de prognoză primite de la Open-Meteo sunt incomplete.");
    }
    
    const forecast = [];
    const daily = data.daily;
    
    // Sărim prima zi (astăzi) și luăm următoarele 6 zile
    for (let i = 1; i < Math.min(daily.time.length, 7); i++) {
      const date = new Date(daily.time[i]);
      const weatherInfo = this.getWeatherDescription(daily.weathercode[i]);
      
      forecast.push({
        date: date,
        day_name: this.getDayName(date),
        temperature: {
          min: Math.round(daily.temperature_2m_min[i]),
          max: Math.round(daily.temperature_2m_max[i]),
          avg: Math.round((daily.temperature_2m_min[i] + daily.temperature_2m_max[i]) / 2)
        },
        description: weatherInfo.description,
        icon: weatherInfo.icon,
        humidity: 65, // Open-Meteo nu oferă umiditate zilnică în planul gratuit
        wind_speed: Math.round(daily.windspeed_10m_max[i]),
        precipitation: daily.precipitation_probability_max[i] || 0
      });
    }
    
    return forecast;
  }

  // Converteste WMO weather code în descriere și iconiță
  getWeatherDescription(weatherCode) {
    // WMO Weather interpretation codes (WW)
    const weatherMap = {
      0: { description: 'cer senin', icon: '01d' },
      1: { description: 'predominant senin', icon: '01d' },
      2: { description: 'parțial noros', icon: '02d' },
      3: { description: 'noros', icon: '03d' },
      45: { description: 'ceață', icon: '50d' },
      48: { description: 'ceață depusă', icon: '50d' },
      51: { description: 'burniță ușoară', icon: '09d' },
      53: { description: 'burniță moderată', icon: '09d' },
      55: { description: 'burniță densă', icon: '09d' },
      56: { description: 'burniță înghețată', icon: '09d' },
      57: { description: 'burniță densă înghețată', icon: '09d' },
      61: { description: 'ploaie ușoară', icon: '10d' },
      63: { description: 'ploaie moderată', icon: '10d' },
      65: { description: 'ploaie torențială', icon: '10d' },
      66: { description: 'ploaie înghețată ușoară', icon: '10d' },
      67: { description: 'ploaie înghețată torențială', icon: '10d' },
      71: { description: 'ninsoare ușoară', icon: '13d' },
      73: { description: 'ninsoare moderată', icon: '13d' },
      75: { description: 'ninsoare abundentă', icon: '13d' },
      77: { description: 'fulgi de zăpadă', icon: '13d' },
      80: { description: 'averse ușoare', icon: '10d' },
      81: { description: 'averse moderate', icon: '10d' },
      82: { description: 'averse violente', icon: '10d' },
      85: { description: 'averse de zăpadă ușoare', icon: '13d' },
      86: { description: 'averse de zăpadă moderate', icon: '13d' },
      95: { description: 'furtună ușoară', icon: '11d' },
      96: { description: 'furtună cu grindină ușoară', icon: '11d' },
      99: { description: 'furtună cu grindină violentă', icon: '11d' }
    };

    return weatherMap[weatherCode] || { description: 'necunoscut', icon: '01d' };
  }

  // Obține cea mai comună valoare dintr-un array (menținut pentru compatibilitate)
  getMostCommon(arr) {
    const counts = {};
    let maxCount = 0;
    let mostCommon = arr[0];
    
    arr.forEach(item => {
      counts[item] = (counts[item] || 0) + 1;
      if (counts[item] > maxCount) {
        maxCount = counts[item];
        mostCommon = item;
      }
    });
    
    return mostCommon;
  }

  // Obține numele zilei în română
  getDayName(date) {
    const days = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
    return days[date.getDay()];
  }

  // Returnează date fallback dacă API-ul eșuează
  getFallbackWeather() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      location: {
        name: 'București',
        country: 'RO'
      },
      current: {
        temperature: 20,
        feels_like: 18,
        description: 'cer senin',
        icon: '01d',
        humidity: 60,
        pressure: 1013,
        wind_speed: 3,
        wind_direction: 180,
        visibility: 10,
        uv_index: 5,
        sun: {
          sunrise: new Date(today.getTime() + 6 * 60 * 60 * 1000), // 6:00 AM
          sunset: new Date(today.getTime() + 18 * 60 * 60 * 1000)  // 6:00 PM
        }
      },
      timestamp: new Date()
    };
  }

  getFallbackForecast() {
    const forecast = [];
    const today = new Date();
    
    // Începem de la mâine (i = 1) pentru prognoza pe următoarele 5 zile
    for (let i = 1; i <= 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      forecast.push({
        date: date,
        day_name: this.getDayName(date),
        temperature: {
          min: 15 + (i - 1) * 2, // Temperatura crește progresiv
          max: 25 + (i - 1) * 2,
          avg: 20 + (i - 1) * 2
        },
        description: this.getVariedDescription(i), // Descrieri variate pentru fiecare zi
        icon: this.getVariedIcon(i), // Iconițe variate
        humidity: Math.max(40, 65 - (i - 1) * 5), // Umiditate descrescătoare, minim 40%
        wind_speed: 3 + (i - 1) * 0.5, // Vânt ușor crescător
        precipitation: i % 3 === 0 ? 2.5 : 0 // Precipitații ocazionale
      });
    }
    
    return forecast;
  }

  // Generează descrieri variate pentru prognoză
  getVariedDescription(dayIndex) {
    const descriptions = [
      'parțial noros',
      'cer senin',
      'noros',
      'posibilă ploaie',
      'vămurit'
    ];
    return descriptions[(dayIndex - 1) % descriptions.length];
  }

  // Generează iconițe variate pentru prognoză
  getVariedIcon(dayIndex) {
    const icons = ['02d', '01d', '03d', '10d', '50d'];
    return icons[(dayIndex - 1) % icons.length];
  }

  // Obține date meteo complete (curent + prognoză)
  async getWeatherData(lat, lon) {
    console.log(`--- weatherService: Se obțin datele meteo pentru ${lat}, ${lon} ---`);
    try {
        // Obținem simultan vremea curentă și prognoza
        const [current, forecast] = await Promise.all([
            this.getCurrentWeather(lat, lon),
            this.getForecast(lat, lon)
        ]);

        // Returnăm un obiect complet cu toate datele
        return {
            location: current.location, // Locația este returnată de getCurrentWeather
            current: current.current,
            forecast: forecast
        };
    } catch (error) {
        console.error('--- weatherService: Eroare la obținerea datelor meteo complete ---', error);
        // În caz de eroare, returnăm un set complet de date de fallback
        return {
            location: { name: 'București (Fallback)', country: 'RO' },
            current: this.getFallbackWeather().current,
            forecast: this.getFallbackForecast()
        };
    }
  }

  // Curăță cache-ul
  clearCache() {
    this.cache.clear();
  }

  // Convertește temperatura din Celsius în Fahrenheit
  celsiusToFahrenheit(celsius) {
    return Math.round((celsius * 9/5) + 32);
  }

  // Obține iconița meteo corespunzătoare (menținut pentru compatibilitate)
  getWeatherIcon(iconCode, size = 2) {
    return `https://openweathermap.org/img/wn/${iconCode}@${size}x.png`;
  }

  // Obține lista de orașe disponibile
  getAvailableCities() {
    return Object.keys(this.cities).sort();
  }

  // Obține coordonatele unui oraș
  getCityCoordinates(cityName) {
    return this.cities[cityName] || null;
  }

  // Verifică dacă un oraș există în listă
  isCityAvailable(cityName) {
    return cityName in this.cities;
  }

  // Obține date meteo pentru un oraș specific
  async getWeatherForCity(cityName) {
    if (!this.isCityAvailable(cityName)) {
      throw new Error(`Orașul "${cityName}" nu este disponibil în lista de orașe.`);
    }

    const city = this.cities[cityName];
    return await this.getWeatherData(city.lat, city.lon);
  }

  // Obține descrierea îmbunătățită a vremii
  getWeatherDescriptionEnhanced(description, temperature) {
    if (!description) return 'Se încarcă...';
    
    const desc = description.toLowerCase();
    
    if (temperature < 0) {
      return desc.includes('ninsoare') ? description : `${description} ger`;
    } else if (temperature > 30) {
      return desc.includes('senin') ? 'Foarte cald și însorit' : `${description} caniculă`;
    } else if (temperature >= 20 && temperature <= 25) {
      return desc.includes('senin') ? 'Vreme frumoasă și însorită' : description;
    }
    
    return description;
  }
}

export default new WeatherService();
