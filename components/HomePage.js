import { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import todoService from '../lib/todoService';
import habitService from '../lib/habitService';
import pomodoroService from '../lib/pomodoroService';
import financialService from '../lib/financialService';
import WeatherTracker from '../components/WeatherTracker';
import Link from 'next/link';

const HomePage = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [quickStats, setQuickStats] = useState({
    todosToday: 0,
    habitsCompleted: 0,
    totalHabits: 0,
    financialBalance: 0
  });

  useEffect(() => {
    loadQuickStats();
  }, []);

  const loadQuickStats = () => {
    try {
      // Încărcăm statisticile rapide
      const todos = todoService.getTodos();
      const habits = habitService.getHabits();
      const financialStats = financialService.getFinancialStatistics();

      const today = new Date().toDateString();
      const todosToday = todos.filter(todo => 
        todo.dueDate === today && !todo.completed
      ).length;

      const completedHabitsToday = habits.filter(habit => {
        if (!habit.lastCompletion) return false;
        return new Date(habit.lastCompletion).toDateString() === today;
      }).length;

      setQuickStats({
        todosToday,
        habitsCompleted: completedHabitsToday,
        totalHabits: habits.length,
        financialBalance: financialStats?.loans?.netWorth || 0
      });
    } catch (error) {
      console.error('Error loading quick stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const startPomodoroSession = () => {
    // Redirecționăm către pagina Pomodoro pentru a începe sesiunea
    window.location.href = '/pomodoro';
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('common.loading')}...</p>
        </div>
        <style jsx>{`
          .home-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .loading-container {
            text-align: center;
            color: var(--text-primary);
          }

          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid var(--border-color);
            border-top: 3px solid var(--accent-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Bun venit, <span className="hero-name">Dragos</span>! 👋
          </h1>
          <p className="hero-subtitle">Centrul tău de comandă inteligent</p>
          
          <div className="quick-widgets">
            <div className="widget-card">
              <div className="widget-icon">📋</div>
              <div className="widget-content">
                <div className="widget-value">{quickStats.todosToday}</div>
                <div className="widget-label">Sarcini azi</div>
              </div>
            </div>

            <div className="widget-card">
              <div className="widget-icon">🎯</div>
              <div className="widget-content">
                <div className="widget-value">{quickStats.habitsCompleted}/{quickStats.totalHabits}</div>
                <div className="widget-label">Obiceiuri</div>
              </div>
            </div>

            <div className="widget-card">
              <div className="widget-icon">🍅</div>
              <div className="widget-content">
                <button className="pomodoro-btn" onClick={startPomodoroSession}>
                  Începe sesiune
                </button>
                <div className="widget-label">25 min</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Cards Section */}
      <section className="cards-section">
        <div className="cards-grid">
          {/* Card 1: Productivitate */}
          <div className="glass-card productivity-card">
            <div className="card-header">
              <h2 className="card-title">🚀 Productivitate</h2>
              <div className="card-icon">⚡</div>
            </div>
            <div className="card-content">
              <div className="feature-grid">
                <Link href="/todo" className="feature-item">
                  <div className="feature-icon">🎯</div>
                  <div className="feature-text">
                    <div className="feature-name">Sarcini</div>
                    <div className="feature-desc">Gestionează task-urile</div>
                  </div>
                </Link>

                <Link href="/pomodoro" className="feature-item">
                  <div className="feature-icon">🍅</div>
                  <div className="feature-text">
                    <div className="feature-name">Pomodoro</div>
                    <div className="feature-desc">Tehnici de focus</div>
                  </div>
                </Link>

                <Link href="/habits" className="feature-item">
                  <div className="feature-icon">🔄</div>
                  <div className="feature-text">
                    <div className="feature-name">Obiceiuri</div>
                    <div className="feature-desc">Urmărește progresul</div>
                  </div>
                </Link>

                <Link href="/weather" className="feature-item">
                  <div className="feature-icon">🌤️</div>
                  <div className="feature-text">
                    <div className="feature-name">Vreme</div>
                    <div className="feature-desc">Prognoză meteo</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Resurse & Cunoaștere */}
          <div className="glass-card resources-card">
            <div className="card-header">
              <h2 className="card-title">📚 Resurse & Cunoaștere</h2>
              <div className="card-icon">🧠</div>
            </div>
            <div className="card-content">
              <div className="feature-grid">
                <Link href="/news" className="feature-item">
                  <div className="feature-icon">📰</div>
                  <div className="feature-text">
                    <div className="feature-name">Știri</div>
                    <div className="feature-desc">Noutăți zilnice</div>
                  </div>
                </Link>

                <Link href="/reading" className="feature-item">
                  <div className="feature-icon">📖</div>
                  <div className="feature-text">
                    <div className="feature-name">Citit</div>
                    <div className="feature-desc">Jurnal de lectură</div>
                  </div>
                </Link>

                <Link href="/radio" className="feature-item">
                  <div className="feature-icon">📻</div>
                  <div className="feature-text">
                    <div className="feature-name">Radio</div>
                    <div className="feature-desc">Muzică și podcast</div>
                  </div>
                </Link>

                <Link href="/bookmarks" className="feature-item">
                  <div className="feature-icon">🔖</div>
                  <div className="feature-text">
                    <div className="feature-name">Semne de carte</div>
                    <div className="feature-desc">Linkuri salvate</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3: Administrare & Analiză */}
          <div className="glass-card admin-card">
            <div className="card-header">
              <h2 className="card-title">⚙️ Administrare & Analiză</h2>
              <div className="card-icon">📊</div>
            </div>
            <div className="card-content">
              <div className="feature-grid">
                <Link href="/financial" className="feature-item">
                  <div className="feature-icon">💰</div>
                  <div className="feature-text">
                    <div className="feature-name">Finanțe</div>
                    <div className="feature-desc">Gestionare bani</div>
                  </div>
                </Link>

                <Link href="/dashboard" className="feature-item">
                  <div className="feature-icon">📊</div>
                  <div className="feature-text">
                    <div className="feature-name">Panou de control</div>
                    <div className="feature-desc">Statistici</div>
                  </div>
                </Link>

                <Link href="/settings" className="feature-item">
                  <div className="feature-icon">⚙️</div>
                  <div className="feature-text">
                    <div className="feature-name">Setări</div>
                    <div className="feature-desc">Personalizare</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weather Widget Section */}
      <section className="weather-widget-section">
        <div className="weather-widget-container">
          <WeatherTracker />
        </div>
      </section>

      <style jsx>{`
        .home-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow-x: hidden;
        }

        /* Fundal animat simplu */
        .home-page::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
          animation: float 20s ease-in-out infinite;
          z-index: -1;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }

        /* Hero Section */
        .hero-section {
          padding: 60px 20px 40px;
          text-align: center;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          color: white;
          margin-bottom: 16px;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
        }

        .hero-name {
          background: linear-gradient(45deg, #FFD700, #FFA500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 40px;
          font-weight: 300;
        }

        .quick-widgets {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }

        .widget-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s ease;
        }

        .widget-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .widget-icon {
          font-size: 2rem;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 15px;
        }

        .widget-content {
          flex: 1;
          text-align: left;
        }

        .widget-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: white;
          margin-bottom: 4px;
        }

        .widget-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .pomodoro-btn {
          background: linear-gradient(45deg, #FF6B6B, #FF8E53);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pomodoro-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
        }

        /* Cards Section */
        .cards-section {
          padding: 40px 20px 60px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          padding: 30px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .glass-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #FFD700, #FFA500);
        }

        .productivity-card::before {
          background: linear-gradient(90deg, #FF6B6B, #FF8E53);
        }

        .resources-card::before {
          background: linear-gradient(90deg, #4ECDC4, #44A08D);
        }

        .admin-card::before {
          background: linear-gradient(90deg, #667eea, #764ba2);
        }

        .glass-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          background: rgba(255, 255, 255, 0.15);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .card-icon {
          font-size: 2rem;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 15px;
        }

        .feature-grid {
          display: grid;
          gap: 16px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          text-decoration: none;
          color: white;
          transition: all 0.3s ease;
          position: relative;
        }

        .feature-item:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .feature-item:hover .feature-icon {
          animation: enhancedPulse 1.5s ease-in-out infinite, zoomEffect 0.6s ease-out;
          background: rgba(255, 255, 255, 0.25);
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.4);
        }

        /* --- ÎNCEPUT COD DE ADĂUGAT --- */

        /* 1. Definim animația de puls */
        @keyframes pulse-animation {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08); /* Punctul maxim al pulsului */
          }
          100% {
            transform: scale(1);
          }
        }

        /* 2. Aplicăm animația doar la hover */
        .feature-item:hover {
          /* Pornește animația și o face să ruleze la infinit cât timp stă mouse-ul pe ea */
          animation: pulse-animation 1.5s ease-in-out infinite;
          
          /* Bonus: Schimbă cursorul să arate că e clicabil */
          cursor: pointer;
        }

        /* --- SFÂRȘIT COD DE ADĂUGAT --- */

        .feature-item:hover .feature-text {
          transform: translateX(3px);
        }

        .feature-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .feature-text {
          flex: 1;
          transition: all 0.3s ease;
        }

        @keyframes enhancedPulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
            filter: brightness(1);
          }
          25% {
            transform: scale(1.1);
            box-shadow: 0 0 25px rgba(255, 255, 255, 0.5);
            filter: brightness(1.2);
          }
          50% {
            transform: scale(1.2);
            box-shadow: 0 0 35px rgba(255, 255, 255, 0.7);
            filter: brightness(1.3);
          }
          75% {
            transform: scale(1.1);
            box-shadow: 0 0 25px rgba(255, 255, 255, 0.5);
            filter: brightness(1.2);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
            filter: brightness(1);
          }
        }

        @keyframes zoomEffect {
          0% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.3) rotate(5deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }

        .feature-text {
          flex: 1;
        }

        .feature-name {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 2px;
          color: #ffffff;
        }

        .feature-desc {
          font-size: 0.85rem;
          color: #ffffff;
          font-weight: 400;
          opacity: 0.9;
        }

        /* Weather Widget Section */
        .weather-widget-section {
          padding: 0 20px 40px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .weather-widget-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          padding: 20px;
          margin-bottom: 40px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .quick-widgets {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .cards-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .glass-card {
            padding: 20px;
          }

          .card-title {
            font-size: 1.2rem;
          }

          .weather-widget-section {
            padding: 0 16px 30px;
          }
        }

        @media (max-width: 480px) {
          .hero-section {
            padding: 40px 16px 30px;
          }

          .cards-section {
            padding: 30px 16px 40px;
          }

          .widget-card {
            padding: 20px;
          }

          .glass-card {
            padding: 16px;
          }

          .weather-widget-container {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
