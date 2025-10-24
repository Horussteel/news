import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import CalendarWidget from '../components/CalendarWidget';
import GmailWidget from '../components/GmailWidget';
import { useTranslation } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const GoogleAdminPage = () => {
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('calendar');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (status === 'loading') {
    return (
      <div className="google-admin-page">
        <div className="google-admin-loading">
          <div className="loading-spinner"></div>
          <span>Se încarcă...</span>
        </div>
        <style jsx>{`
          .google-admin-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #4285F4, #EA4335);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .google-admin-loading {
            text-align: center;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }

          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .google-admin-loading span {
            font-size: 1.2rem;
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="google-admin-page">
      {/* Header Section */}
      <section className="google-hero-section">
        {/* Back to Dashboard Button */}
        <div className="back-to-dashboard-container">
          <button 
            className="back-to-dashboard-btn"
            onClick={() => window.location.href = '/dashboard'}
          >
            ← Înapoi la Dashboard
          </button>
        </div>

        <div className="google-hero-content">
          <div className="google-hero-header">
            <div className="google-logo">
              <span className="google-g">G</span>
              <span className="google-o1">o</span>
              <span className="google-o2">o</span>
              <span className="google-g2">g</span>
              <span className="google-l">l</span>
              <span className="google-e">e</span>
            </div>
            <h1 className="google-hero-title">
              Google - Administrare & Analiză
            </h1>
            <p className="google-hero-subtitle">
              Centrul tău unificat pentru Calendar și Gmail
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="google-nav-tabs">
            <button 
              className={`google-nav-tab ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => handleTabChange('calendar')}
            >
              📅 Calendar Google
            </button>
            <button 
              className={`google-nav-tab ${activeTab === 'gmail' ? 'active' : ''}`}
              onClick={() => handleTabChange('gmail')}
            >
              📧 Gmail Google
            </button>
            <button 
              className={`google-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              📊 Prezentare Generală
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="google-content-section">
        <div className="google-content-container">
          {activeTab === 'calendar' && (
            <div className="google-tab-content">
              <div className="tab-header">
                <h2>📅 Calendar Google</h2>
                <p>Organizează-ți evenimentele și programările direct din Calendar-ul tău Google</p>
              </div>
              <CalendarWidget />
            </div>
          )}

          {activeTab === 'gmail' && (
            <div className="google-tab-content">
              <div className="tab-header">
                <h2>📧 Gmail Google</h2>
                <p>Gestionează emailurile, mesajele necitite și comunicarea direct din Gmail</p>
              </div>
              <GmailWidget />
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="google-tab-content">
              <div className="tab-header">
                <h2>📊 Prezentare Generală</h2>
                <p>Vizualizare combinată a calendarului și emailurilor pentru productivitate maximă</p>
              </div>

              <div className="google-overview-grid">
                {/* Calendar Overview */}
                <div className="overview-card calendar-overview">
                  <div className="overview-header">
                    <h3>📅 Calendar</h3>
                    <button 
                      className="overview-action"
                      onClick={() => handleTabChange('calendar')}
                    >
                      Vezi Calendar →
                    </button>
                  </div>
                  <CalendarWidget />
                </div>

                {/* Gmail Overview */}
                <div className="overview-card gmail-overview">
                  <div className="overview-header">
                    <h3>📧 Gmail</h3>
                    <button 
                      className="overview-action"
                      onClick={() => handleTabChange('gmail')}
                    >
                      Vezi Gmail →
                    </button>
                  </div>
                  <GmailWidget />
                </div>
              </div>

              {/* Integration Features */}
              <div className="integration-features">
                <h3>🔗 Funcționalități de Integrare</h3>
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon">📅📧</div>
                    <h4>Calendar-Email Sync</h4>
                    <p>Evenimentele din emailuri se adaugă automat în calendar</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">⏰📨</div>
                    <h4>Reminders Inteligente</h4>
                    <p>Notificări automate pentru evenimente și emailuri importante</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">📊📈</div>
                    <h4>Analytics Unificate</h4>
                    <p>Statistici combinate despre productivitatea ta digitală</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🔄🔄</div>
                    <h4>Sync Real-time</h4>
                    <p>Sincronizare instantanee între toate serviciile Google</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="google-quick-actions">
        <div className="quick-actions-container">
          <div className="quick-action-card">
            <div className="quick-action-icon">📅</div>
            <h4>Calendar Rapid</h4>
            <p>Adaugă eveniment nou</p>
            <button 
              className="quick-action-btn"
              onClick={() => window.open('https://calendar.google.com', '_blank')}
            >
              Deschide Calendar
            </button>
          </div>

          <div className="quick-action-card">
            <div className="quick-action-icon">📧</div>
            <h4>Gmail Rapid</h4>
            <p>Compune email nou</p>
            <button 
              className="quick-action-btn"
              onClick={() => window.open('https://mail.google.com', '_blank')}
            >
              Deschide Gmail
            </button>
          </div>

          <div className="quick-action-card">
            <div className="quick-action-icon">📊</div>
            <h4>Dashboard</h4>
            <p>Statistici complete</p>
            <button 
              className="quick-action-btn"
              onClick={() => window.location.href = '/dashboard'}
            >
              Vezi Dashboard
            </button>
          </div>

          <div className="quick-action-card">
            <div className="quick-action-icon">🏠</div>
            <h4>Acasă</h4>
            <p>Pagina principală</p>
            <button 
              className="quick-action-btn"
              onClick={() => window.location.href = '/'}
            >
              Acasă
            </button>
          </div>
        </div>
      </section>

      <style jsx>{`
        .google-admin-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #4285F4 0%, #EA4335 50%, #FBBC05 75%, #34A853 100%);
          position: relative;
          overflow-x: hidden;
        }

        /* Animated Background */
        .google-admin-page::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 80%, rgba(66, 133, 244, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(234, 67, 53, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(251, 188, 5, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 60% 60%, rgba(52, 168, 83, 0.2) 0%, transparent 50%);
          animation: googleFloat 25s ease-in-out infinite;
          z-index: -1;
        }

        @keyframes googleFloat {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30px, -30px) rotate(90deg); }
          50% { transform: translate(-20px, 20px) rotate(180deg); }
          75% { transform: translate(20px, 30px) rotate(270deg); }
        }

        /* Back to Dashboard Button */
        .back-to-dashboard-container {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 10;
        }

        .back-to-dashboard-btn {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 12px 20px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          position: relative;
          overflow: hidden;
        }

        .back-to-dashboard-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s ease;
        }

        .back-to-dashboard-btn:hover::before {
          left: 100%;
        }

        .back-to-dashboard-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .back-to-dashboard-btn:active {
          transform: translateY(0) scale(0.98);
        }

        /* Hero Section */
        .google-hero-section {
          padding: 60px 20px 40px;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .google-hero-content {
          max-width: 900px;
          margin: 0 auto;
        }

        .google-logo {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2px;
          margin-bottom: 30px;
          font-size: 3rem;
          font-weight: bold;
          font-family: 'Product Sans', 'Arial', sans-serif;
        }

        .google-g { color: #4285F4; }
        .google-o1 { color: #EA4335; }
        .google-o2 { color: #FBBC05; }
        .google-g2 { color: #4285F4; }
        .google-l { color: #34A853; }
        .google-e { color: #EA4335; }

        .google-hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          color: white;
          margin-bottom: 16px;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          line-height: 1.2;
        }

        .google-hero-subtitle {
          font-size: 1.3rem;
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 40px;
          font-weight: 300;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Navigation Tabs */
        .google-nav-tabs {
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .google-nav-tab {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.9);
          padding: 15px 25px;
          border-radius: 50px;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 600;
          transition: all 0.4s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }

        .google-nav-tab::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s ease;
        }

        .google-nav-tab:hover::before {
          left: 100%;
        }

        .google-nav-tab:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          color: white;
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .google-nav-tab.active {
          background: white;
          color: #4285F4;
          border-color: white;
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }

        /* Content Section */
        .google-content-section {
          padding: 0 20px 40px;
          position: relative;
          z-index: 1;
        }

        .google-content-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .google-tab-content {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          margin-bottom: 40px;
        }

        .tab-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid rgba(66, 133, 244, 0.2);
        }

        .tab-header h2 {
          font-size: 2.2rem;
          font-weight: 700;
          color: #4285F4;
          margin-bottom: 10px;
        }

        .tab-header p {
          font-size: 1.1rem;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Overview Grid */
        .google-overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }

        .overview-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 25px;
          transition: all 0.3s ease;
        }

        .overview-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
        }

        .overview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .overview-header h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .overview-action {
          background: #4285F4;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .overview-action:hover {
          background: #3367D6;
          transform: scale(1.05);
        }

        /* Integration Features */
        .integration-features {
          margin-top: 40px;
          text-align: center;
        }

        .integration-features h3 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 30px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
        }

        .feature-card {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border: 1px solid #dee2e6;
          border-radius: 16px;
          padding: 25px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          background: linear-gradient(135deg, #ffffff, #f8f9fa);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 15px;
          display: block;
        }

        .feature-card h4 {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 10px;
        }

        .feature-card p {
          font-size: 0.95rem;
          color: #666;
          line-height: 1.5;
        }

        /* Quick Actions */
        .google-quick-actions {
          padding: 0 20px 60px;
          position: relative;
          z-index: 1;
        }

        .quick-actions-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
        }

        .quick-action-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(15px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          padding: 30px 25px;
          text-align: center;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .quick-action-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .quick-action-card:hover::before {
          opacity: 1;
        }

        .quick-action-card:hover {
          transform: translateY(-10px) scale(1.05);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
          background: rgba(255, 255, 255, 0.95);
        }

        .quick-action-icon {
          font-size: 2.5rem;
          margin-bottom: 15px;
          display: block;
        }

        .quick-action-card h4 {
          font-size: 1.3rem;
          font-weight: 600;
          color: #4285F4;
          margin-bottom: 8px;
        }

        .quick-action-card p {
          font-size: 0.95rem;
          color: #666;
          margin-bottom: 20px;
        }

        .quick-action-btn {
          background: linear-gradient(135deg, #4285F4, #34A853);
          color: white;
          border: none;
          padding: 12px 25px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .quick-action-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.4s ease;
        }

        .quick-action-btn:hover::before {
          width: 300px;
          height: 300px;
        }

        .quick-action-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 10px 25px rgba(66, 133, 244, 0.4);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .back-to-dashboard-container {
            position: relative;
            top: auto;
            left: auto;
            margin-bottom: 20px;
            text-align: center;
          }

          .back-to-dashboard-btn {
            background: rgba(255, 255, 255, 0.15);
            border: 2px solid rgba(255, 255, 255, 0.25);
            color: white;
            padding: 10px 16px;
            border-radius: 20px;
            font-size: 0.85rem;
            margin: 0 auto;
            display: inline-flex;
          }

          .back-to-dashboard-btn:hover {
            background: rgba(255, 255, 255, 0.25);
            border-color: rgba(255, 255, 255, 0.4);
            transform: translateY(-1px) scale(1.02);
          }

          .google-hero-title {
            font-size: 2.5rem;
          }

          .google-hero-subtitle {
            font-size: 1.1rem;
          }

          .google-nav-tabs {
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }

          .google-nav-tab {
            width: 100%;
            max-width: 300px;
            justify-content: center;
          }

          .google-tab-content {
            padding: 25px;
          }

          .tab-header h2 {
            font-size: 1.8rem;
          }

          .google-overview-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .overview-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .quick-actions-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }

        @media (max-width: 480px) {
          .google-hero-section {
            padding: 40px 16px 30px;
          }

          .google-logo {
            font-size: 2rem;
          }

          .google-hero-title {
            font-size: 2rem;
          }

          .google-hero-subtitle {
            font-size: 1rem;
          }

          .google-content-section {
            padding: 0 16px 30px;
          }

          .google-tab-content {
            padding: 20px;
          }

          .overview-card {
            padding: 20px;
          }

          .feature-card {
            padding: 20px;
          }

          .quick-action-card {
            padding: 25px 20px;
          }

          .quick-actions-container {
            grid-template-columns: 1fr;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default GoogleAdminPage;
