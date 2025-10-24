import { useState, useEffect } from 'react';
import { useLanguage, useTranslation } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import weatherService from '../lib/weatherService';

const WeatherTracker = () => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [useFahrenheit, setUseFahrenheit] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [selectedCity, setSelectedCity] = useState('București');
  const [useCitySelection, setUseCitySelection] = useState(false);
  const [userIP, setUserIP] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);

  // Încarcă datele meteo
  const loadWeatherData = async (lat, lon) => {
    console.log(`--- WeatherTracker: Se încarcă datele meteo pentru ${lat}, ${lon} ---`);
    try {
      setLoading(true);
      setError(null);
      // Acum trimitem coordonatele direct la serviciu
      const data = await weatherService.getWeatherData(lat, lon);
      setWeatherData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Nu am putut încărca datele meteo.');
      console.error('--- WeatherTracker: Eroare la încărcarea datelor meteo ---', err);
    } finally {
      setLoading(false);
    }
  };

  // Încarcă datele meteo pentru un oraș specific
  const loadWeatherForCity = async (cityName) => {
    console.log(`--- WeatherTracker: Se încarcă datele meteo pentru orașul ${cityName} ---`);
    try {
      setLoading(true);
      setError(null);
      const data = await weatherService.getWeatherForCity(cityName);
      setWeatherData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(`Nu am putut încărca datele meteo pentru ${cityName}.`);
      console.error('--- WeatherTracker: Eroare la încărcarea datelor meteo pentru oraș ---', err);
    } finally {
      setLoading(false);
    }
  };

  // Schimbă orașul selectat
  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    loadWeatherForCity(cityName);
  };

  // Comută între modul de locație automată și selecție manuală
  const toggleLocationMode = () => {
    const newMode = !useCitySelection;
    setUseCitySelection(newMode);
    
    if (newMode) {
      // Trecem la modul de selecție manuală - încărcăm datele pentru orașul curent
      loadWeatherForCity(selectedCity);
    } else {
      // Trecem la modul de locație automată
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            loadWeatherData(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            setError('Permisiunea pentru locație a fost refuzată. Se folosește București.');
            loadWeatherData(44.4268, 26.1025);
          }
        );
      } else {
        loadWeatherData(44.4268, 26.1025);
      }
    }
  };

  // Convertește temperatura
  const convertTemp = (celsius) => {
    if (useFahrenheit) {
      return weatherService.celsiusToFahrenheit(celsius);
    }
    return celsius;
  };

  const getTempUnit = () => {
    return useFahrenheit ? '°F' : '°C';
  };

  const getWindDirection = (degrees) => {
    if (degrees === null || degrees === undefined) return 'N/A';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat(language === 'ro' ? 'ro-RO' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat(language === 'ro' ? 'ro-RO' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date);
  };

  // Detectare IP și locație
  const detectIPAndLocation = async () => {
    try {
      // Detectăm IP-ul
      const ipResponse = await fetch('https://ipapi.co/json/');
      const ipData = await ipResponse.json();
      
      setUserIP(ipData.ip);
      setLocationInfo({
        ip: ipData.ip,
        city: ipData.city,
        region: ipData.region,
        country: ipData.country_name,
        latitude: ipData.latitude,
        longitude: ipData.longitude
      });
      
      console.log('--- WeatherTracker: IP detectat ---', ipData);
    } catch (error) {
      console.error('--- WeatherTracker: Eroare la detectarea IP-ului ---', error);
      setUserIP('N/A');
      setLocationInfo({
        ip: 'N/A',
        city: 'N/A',
        region: 'N/A',
        country: 'N/A'
      });
    }
  };

  // Când componenta se încarcă, cerem geolocația și detectăm IP-ul
  useEffect(() => {
    console.log('--- WeatherTracker: Componenta s-a montat. Se cere geolocația și IP. ---');
    
    // Detectăm IP-ul imediat
    detectIPAndLocation();
    
    // Verificăm dacă navigator.geolocation este disponibil
    if (!navigator.geolocation) {
        console.log('--- WeatherTracker: Geolocația nu este suportată. Se folosește fallback. ---');
        setError('Geolocația nu este suportată de acest browser.');
        // Încărcăm datele pentru locația de fallback (București)
        loadWeatherData(44.4268, 26.1025);
        return;
    }

    // Solicităm locația
    console.log('--- WeatherTracker: Se apelează getCurrentPosition pentru a cere permisiunea. ---');
    navigator.geolocation.getCurrentPosition(
        // Funcția de succes
        (position) => {
            console.log('--- WeatherTracker: Permisiune acordată! Se încarcă datele. ---', position.coords);
            loadWeatherData(position.coords.latitude, position.coords.longitude);
        },
        // Funcția de eroare
        (error) => {
            console.error('--- WeatherTracker: Eroare la obținerea locației. ---', error);
            setError('Permisiunea pentru locație a fost refuzată. Se afișează date pentru București.');
            // Încărcăm datele pentru locația de fallback (București)
            loadWeatherData(44.4268, 26.1025);
        }
    );
  }, []); // Se execută o singură dată, la montarea componentei

  if (loading) {
    return (
      <div className="weather-tracker loading">
        <div className="loading-spinner">🌤️</div>
        <span>Se încarcă datele meteo...</span>
        
        <style jsx>{`
          .weather-tracker.loading {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 15px;
            padding: 2rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            min-height: 200px;
            justify-content: center;
          }

          .loading-spinner {
            font-size: 3rem;
            animation: spin 2s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="weather-tracker error">
        <div className="error-icon">❌</div>
        <h3>Eroare</h3>
        <p>{error || 'Nu am putut încărca datele meteo'}</p>
        
        <style jsx>{`
          .weather-tracker.error {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 15px;
            padding: 2rem;
            text-align: center;
            color: var(--text-primary);
          }

          .error-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
        `}</style>
      </div>
    );
  }

  const { location, current, forecast } = weatherData;

  return (
    <div className="weather-tracker">
      {/* Header cu locație și controale */}
      <div className="weather-header">
        <div className="location-info">
          {/* Selector de mod locație */}
          <div className="location-mode-selector">
            <button
              onClick={toggleLocationMode}
              className={`location-mode-btn ${useCitySelection ? 'active' : ''}`}
              title={useCitySelection ? 'Treci la locație automată' : 'Treci la selecție manuală a orașelor'}
            >
              {useCitySelection ? '🏙️' : '📍'}
            </button>
            {useCitySelection && (
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="city-selector"
                title="Selectează un oraș"
              >
                {weatherService.getAvailableCities().map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            )}
          </div>
          <h2 className="location-name">
            📍 {location.name}, {location.country}
          </h2>
          {lastUpdated && (
            <span className="last-updated">
              Actualizat: {formatTime(lastUpdated)}
            </span>
          )}
        </div>
        <div className="weather-controls">
          <button
            onClick={() => setUseFahrenheit(!useFahrenheit)}
            className="temp-toggle"
            title={`Schimbă în ${useFahrenheit ? 'Celsius' : 'Fahrenheit'}`}
          >
            {getTempUnit()}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="expand-toggle"
            title={expanded ? 'Comprimă' : 'Extinde'}
          >
            {expanded ? '📉' : '📈'}
          </button>
        </div>
      </div>

      {/* Vremea curentă */}
      <div className="current-weather">
        <div className="weather-main">
          <div className="temperature-display">
            <div className="temp-icon">
              <img 
                src={weatherService.getWeatherIcon(current.icon, 4)} 
                alt={current.description}
              />
            </div>
            <div className="temp-info">
              <div className="current-temp">
                {convertTemp(current.temperature)}{getTempUnit()}
              </div>
              <div className="feels-like">
                Simți {convertTemp(current.feels_like)}{getTempUnit()}
              </div>
            </div>
          </div>
            <div className="weather-description">
            <h3>{current.description ? weatherService.getWeatherDescriptionEnhanced(current.description, current.temperature) : 'Se încarcă...'}</h3>
            <p className="description-details">
              Umiditate: {current.humidity}% | Vânt: {current.wind_speed} m/s {getWindDirection(current.wind_direction)}
            </p>
          </div>
        </div>

        {/* Detalii suplimentare */}
        <div className="weather-details">
          <div className="detail-item">
            <span className="detail-label">Presiune</span>
            <span className="detail-value">{current.pressure || 'N/A'} hPa</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Vizibilitate</span>
            <span className="detail-value">{current.visibility || 'N/A'} km</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Răsărit</span>
            <span className="detail-value">{current.sun?.sunrise ? formatTime(current.sun.sunrise) : 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Apus</span>
            <span className="detail-value">{current.sun?.sunset ? formatTime(current.sun.sunset) : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Prognoza extinsă */}
      {expanded && (
        <div className="forecast-section">
          <h3>Prognoza pe următoarele zile</h3>
          <div className="forecast-grid">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-day">
                <div className="forecast-date">
                  <div className="day-name">{day.day_name}</div>
                  <div className="date-text">{formatDate(day.date).split(',')[0]}</div>
                </div>
                <div className="forecast-icon">
                  <img 
                    src={weatherService.getWeatherIcon(day.icon || '01d', 2)} 
                    alt={day.description || 'Prognoză meteo'}
                  />
                </div>
                <div className="forecast-temps">
                  <span className="temp-max">{convertTemp(day.temperature.max)}°</span>
                  <span className="temp-min">{convertTemp(day.temperature.min)}°</span>
                </div>
                <div className="forecast-description">{day.description}</div>
                {day.precipitation > 0 && (
                  <div className="precipitation">💧 {day.precipitation}mm</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IP Location Info - colț stânga jos */}
      {locationInfo && (
        <div className="ip-info">
          <div className="ip-header">
            🌐 IP Location
          </div>
          <div className="ip-details">
            <div className="ip-item">
              <span className="ip-label">IP:</span>
              <span className="ip-value">{locationInfo.ip}</span>
            </div>
            {locationInfo.city !== 'N/A' && (
              <div className="ip-item">
                <span className="ip-label">Locație IP:</span>
                <span className="ip-value">{locationInfo.city}, {locationInfo.region}</span>
              </div>
            )}
            {locationInfo.country !== 'N/A' && (
              <div className="ip-item">
                <span className="ip-label">Țară:</span>
                <span className="ip-value">{locationInfo.country}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .weather-tracker {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 15px;
          padding: 1.5rem;
          color: var(--text-primary);
          transition: all 0.3s ease;
        }

        .weather-tracker:hover {
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .weather-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .location-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .location-name {
          margin: 0;
          font-size: 1.5rem;
          color: var(--accent-color);
        }

        .last-updated {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .location-mode-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .location-mode-btn {
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          border-radius: 8px;
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.2rem;
          color: var(--text-primary);
        }

        .location-mode-btn.active {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
        }

        .location-mode-btn:hover {
          border-color: var(--accent-color);
          transform: translateY(-1px);
        }

        .city-selector {
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          border-radius: 8px;
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          color: var(--text-primary);
          min-width: 150px;
        }

        .city-selector:focus {
          outline: none;
          border-color: var(--accent-color);
        }

        .city-selector:hover {
          border-color: var(--accent-color);
        }

        .weather-controls {
          display: flex;
          gap: 0.5rem;
        }

        .temp-toggle,
        .expand-toggle {
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          border-radius: 8px;
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .temp-toggle:hover,
        .expand-toggle:hover {
          border-color: var(--accent-color);
          transform: translateY(-2px);
        }

        .current-weather {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .weather-main {
          display: flex;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .temperature-display {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .temp-icon img {
          width: 80px;
          height: 80px;
        }

        .current-temp {
          font-size: 2.5rem;
          font-weight: bold;
          color: var(--accent-color);
        }

        .feels-like {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .weather-description h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.3rem;
          text-transform: capitalize;
        }

        .description-details {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .weather-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          padding: 1rem;
          background: var(--bg-primary);
          border-radius: 10px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .detail-value {
          font-weight: bold;
          color: var(--text-primary);
        }

        .forecast-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-color);
        }

        .forecast-section h3 {
          margin: 0 0 1rem 0;
          color: var(--accent-color);
        }

        .forecast-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }

        .forecast-day {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 1rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .forecast-day:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .forecast-date {
          margin-bottom: 0.5rem;
        }

        .day-name {
          font-weight: bold;
          color: var(--accent-color);
        }

        .date-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .forecast-icon img {
          width: 40px;
          height: 40px;
          margin: 0.5rem 0;
        }

        .forecast-temps {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin: 0.5rem 0;
        }

        .temp-max {
          font-weight: bold;
          color: var(--text-primary);
        }

        .temp-min {
          color: var(--text-secondary);
        }

        .forecast-description {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 0.5rem 0;
          text-transform: capitalize;
        }

        .precipitation {
          font-size: 0.8rem;
          color: var(--accent-color);
          margin-top: 0.5rem;
        }

        @media (max-width: 768px) {
          .weather-tracker {
            padding: 1rem;
          }

          .weather-header {
            flex-direction: column;
            text-align: center;
          }

          .weather-main {
            flex-direction: column;
            text-align: center;
          }

          .current-temp {
            font-size: 2rem;
          }

          .weather-details {
            grid-template-columns: repeat(2, 1fr);
          }

        .forecast-grid {
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }

        /* IP Info Styles */
        .ip-info {
          position: fixed;
          bottom: 20px;
          left: 20px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 1rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          z-index: 1000;
          font-size: 0.8rem;
          min-width: 200px;
          transition: all 0.3s ease;
        }

        .ip-info:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }

        .ip-header {
          font-weight: bold;
          color: var(--accent-color);
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .ip-details {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .ip-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.2rem 0;
          border-bottom: 1px solid var(--border-color);
        }

        .ip-item:last-child {
          border-bottom: none;
        }

        .ip-label {
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.75rem;
        }

        .ip-value {
          color: var(--text-primary);
          font-weight: bold;
          font-size: 0.8rem;
        }

        @media (max-width: 768px) {
          .ip-info {
            bottom: 10px;
            left: 10px;
            right: 10px;
            min-width: auto;
            font-size: 0.7rem;
          }

          .ip-header {
            font-size: 0.8rem;
          }

          .ip-value {
            font-size: 0.7rem;
          }
        }

        @media (max-width: 480px) {
          .location-name {
            font-size: 1.2rem;
          }

          .current-temp {
            font-size: 1.8rem;
          }

          .temp-icon img {
            width: 60px;
            height: 60px;
          }

          .forecast-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default WeatherTracker;
