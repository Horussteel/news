import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import WeatherTracker from '../components/WeatherTracker';
import { useLanguage, useTranslation } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import Head from 'next/head';

const WeatherPage = () => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Layout title="Se încarcă...">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh' 
        }}>
          <div style={{ fontSize: '2rem' }}>🌤️</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title={language === 'ro' ? 'Vreme - Prognoză Meteo' : 'Weather - Forecast'}
      description={language === 'ro' 
        ? 'Prognoza meteo curentă și pe următoarele zile pentru locația ta'
        : 'Current weather forecast and next days for your location'
      }
    >
      <Head>
        <meta name="keywords" content={language === 'ro' 
          ? 'vreme, meteo, prognoză, temperatură, precipitații, vânt, umiditate'
          : 'weather, forecast, temperature, precipitation, wind, humidity'
        } />
        <meta name="robots" content="index, follow" />
      </Head>

      <div className="weather-page">
        <div className="page-header">
          <h1 className="page-title">
            {language === 'ro' ? '🌤️ Prognoză Meteo' : '🌤️ Weather Forecast'}
          </h1>
          <p className="page-description">
            {language === 'ro' 
              ? 'Informații meteo în timp real și prognoza pe următoarele zile pentru locația ta curentă.'
              : 'Real-time weather information and forecast for the next days for your current location.'
            }
          </p>
        </div>

        <div className="weather-content">
          <WeatherTracker />
        </div>

        <div className="weather-info">
          <div className="info-section">
            <h3>{language === 'ro' ? '📍 Despre locație' : '📍 About location'}</h3>
            <p>
              {language === 'ro' 
                ? 'Aplicația detectează automat locația ta folosind GPS-ul browser-ului, dar poți alege și manual din lista de 26 orașe principale din România. Dacă permisiunea GPS este refuzată, vom folosi adresa ta IP pentru a determina locația aproximativă.'
                : 'The app automatically detects your location using browser GPS, but you can also manually choose from a list of 26 main cities in Romania. If GPS permission is denied, we will use your IP address to determine the approximate location.'
              }
            </p>
          </div>

          <div className="info-section">
            <h3>{language === 'ro' ? '🔄 Actualizare date' : '🔄 Data update'}</h3>
            <p>
              {language === 'ro' 
                ? 'Datele meteo se actualizează automat la fiecare 10 minute.'
                : 'Weather data is automatically updated every 10 minutes.'
              }
            </p>
          </div>

        <div className="info-section">
          <h3>{language === 'ro' ? '📡 Sursă date' : '📡 Data source'}</h3>
          <p>
            {language === 'ro' 
              ? 'Informațiile meteo sunt furnizate de Open-Meteo API, un serviciu 100% gratuit pentru uz non-comercial, care nu necesită cheie API și oferă date meteo precise globale.'
              : 'Weather information is provided by Open-Meteo API, a 100% free service for non-commercial use that requires no API key and provides accurate global weather data.'
            }
          </p>
        </div>
        </div>

        <style jsx>{`
          .weather-page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
          }

          .page-header {
            text-align: center;
            margin-bottom: 3rem;
          }

          .page-title {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .page-description {
            font-size: 1.1rem;
            color: var(--text-secondary);
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
          }

          .weather-content {
            margin-bottom: 3rem;
          }

          .weather-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
          }

          .info-section {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 15px;
            padding: 1.5rem;
            transition: all 0.3s ease;
          }

          .info-section:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          }

          .info-section h3 {
            margin: 0 0 1rem 0;
            color: var(--accent-color);
            font-size: 1.2rem;
          }

          .info-section p {
            margin: 0;
            color: var(--text-primary);
            line-height: 1.6;
            font-size: 0.95rem;
          }

          @media (max-width: 768px) {
            .weather-page {
              padding: 1rem;
            }

            .page-title {
              font-size: 2rem;
            }

            .page-description {
              font-size: 1rem;
            }

            .weather-info {
              grid-template-columns: 1fr;
              gap: 1.5rem;
            }
          }

          @media (max-width: 480px) {
            .page-title {
              font-size: 1.8rem;
            }

            .info-section {
              padding: 1rem;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default WeatherPage;
