import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import HabitTracker from '../components/HabitTracker';
import MoodTracker from '../components/MoodTracker';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import MeditationTimer from '../components/MeditationTimer';
import { useTranslation } from '../contexts/LanguageContext';

export default function HabitsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('habits');
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Layout title="Wellness Hub - AI News" description="Track your habits, mood, and meditation">
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
        <style jsx>{`
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 50vh;
          }
          .spinner {
            border: 4px solid var(--bg-secondary);
            border-top: 4px solid var(--accent-color);
            border-radius: 50%;
            width: 40px;
            height: 40px;
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'habits':
        return <HabitTracker />;
      case 'mood':
        return <MoodTracker />;
      case 'meditation':
        return <MeditationTimer />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <HabitTracker />;
    }
  };

  return (
    <Layout 
      title="Wellness Hub - AI News" 
      description="Track your habits, mood, meditation, and view comprehensive wellness analytics"
      keywords="habits, mood, meditation, wellness, analytics, tracker, productivity"
    >
      <div className="wellness-hub">
        <div className="hub-header">
          <h1>🌟 Wellness Hub</h1>
          <p>Construiește obiceiuri sănătoase, monitorizează starea emoțională și practică mindfulness</p>
        </div>

        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'habits' ? 'active' : ''}`}
            onClick={() => setActiveTab('habits')}
          >
            🎯 {t('habits.title')}
          </button>
          <button
            className={`tab-btn ${activeTab === 'mood' ? 'active' : ''}`}
            onClick={() => setActiveTab('mood')}
          >
            😌 {t('mood.title')}
          </button>
          <button
            className={`tab-btn ${activeTab === 'meditation' ? 'active' : ''}`}
            onClick={() => setActiveTab('meditation')}
          >
            🧘‍♀️ {t('meditation.title')}
          </button>
          <button
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 {t('analytics.title')}
          </button>
        </div>

        <div className="tab-content">
          {renderTabContent()}
        </div>
      </div>

      <style jsx>{`
        .wellness-hub {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .hub-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .hub-header h1 {
          margin: 0 0 10px 0;
          color: var(--text-primary);
          font-size: 2.5rem;
          font-weight: 700;
        }

        .hub-header p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .tab-navigation {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 30px;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 0;
          flex-wrap: wrap;
        }

        .tab-btn {
          padding: 12px 24px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: 8px 8px 0 0;
          transition: all 0.3s ease;
          font-weight: 500;
          font-size: 1rem;
          position: relative;
          top: 2px;
        }

        .tab-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .tab-btn.active {
          background: var(--accent-color);
          color: white;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
        }

        .tab-content {
          min-height: 600px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .wellness-hub {
            padding: 15px;
          }

          .hub-header h1 {
            font-size: 2rem;
          }

          .hub-header p {
            font-size: 1rem;
          }

          .tab-navigation {
            gap: 5px;
          }

          .tab-btn {
            padding: 10px 16px;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .tab-navigation {
            justify-content: flex-start;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .tab-btn {
            flex-shrink: 0;
            padding: 8px 12px;
            font-size: 0.85rem;
          }

          .hub-header h1 {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </Layout>
  );
}
