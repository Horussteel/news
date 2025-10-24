import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import UserMenu from './UserMenu';
import Head from 'next/head';
import storageService from '../lib/storageService';
import todoService from '../lib/todoService';
import readingService from '../lib/readingService';
import pomodoroService from '../lib/pomodoroService';
import { useLanguage, useTranslation } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const Layout = ({ children, title, description }) => {
  const router = useRouter();
  const { language, changeLanguage, availableLanguages } = useLanguage();
  const { t } = useTranslation();
  const { theme, updateTheme } = useTheme();
  
  // Verificăm dacă suntem pe pagina principală
  const isHomePage = router.pathname === '/';

  useEffect(() => {
    // Make services available globally for data export
    if (typeof window !== 'undefined') {
      window.storageService = storageService;
      window.todoService = todoService;
      window.readingService = readingService;
      window.pomodoroService = pomodoroService;
    }
  }, []);

  return (
    <>
      <Head>
        <title>{title || t('layout.title')}</title>
        <meta name="description" content={description || t('layout.subtitle')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="layout-container">
        <header className={`layout-header ${isHomePage ? 'home-header' : 'transparent-header'}`}>
          <div className="header-content">
            <div className="header-left">
              <h1 className="title">
                <a href="/" className="home-link clickable-logo">
                  🤖 {t('layout.title')}
                </a>
              </h1>
              <p className="subtitle">{t('layout.subtitle')}</p>
              {!isHomePage && (
              <nav className="transparent-nav">
                <a href="/news" className="transparent-nav-link">📰 {t('navigation.news')}</a>
                <a href="/weather" className="transparent-nav-link">🌤️ {t('navigation.weather')}</a>
                <a href="/todo" className="transparent-nav-link">✅ {t('navigation.todo')}</a>
                <a href="/habits" className="transparent-nav-link">🎯 {t('navigation.habits')}</a>
                <a href="/pomodoro" className="transparent-nav-link">🍅 {t('navigation.pomodoro')}</a>
                <a href="/financial" className="transparent-nav-link">💰 {t('navigation.financial')}</a>
                <a href="/dashboard" className="transparent-nav-link">📊 {t('navigation.dashboard')}</a>
                <a href="/settings" className="transparent-nav-link">⚙️ {t('navigation.settings')}</a>
              </nav>
              )}
            </div>
            <div className="header-right">
              <UserMenu />
              <button 
                className="language-toggle"
                onClick={() => changeLanguage(language === 'en' ? 'ro' : 'en')}
                title={t('layout.language.switch')}
              >
                {language === 'en' ? "🇷🇴" : "🇬🇧"}
              </button>
              <button 
                className="theme-toggle"
                onClick={() => updateTheme(theme === 'light' ? 'dark' : 'light')}
                title={theme === 'dark' ? t('layout.themeToggle.dark') : t('layout.themeToggle.light')}
              >
                {theme === 'dark' ? "☀️" : "🌙"}
              </button>
            </div>
          </div>
        </header>

        <main className="layout-main">
          {children}
        </main>

        <footer className="layout-footer">
          <div className="footer-content">
            <div className="footer-nav">
              <a href="/news" className="footer-nav-link">📰 {t('navigation.news')}</a>
              <a href="/weather" className="footer-nav-link">🌤️ {t('navigation.weather')}</a>
              <a href="/bookmarks" className="footer-nav-link">📚 {t('navigation.bookmarks')}</a>
              <a href="/history" className="footer-nav-link">📖 {t('navigation.history')}</a>
              <a href="/radio" className="footer-nav-link">🎵 Radio</a>
              <a href="/habits" className="footer-nav-link">🎯 {t('navigation.habits')}</a>
              <a href="/reading" className="footer-nav-link">📚 {t('navigation.reading')}</a>
              <a href="/todo" className="footer-nav-link">✅ {t('navigation.todo')}</a>
              <a href="/pomodoro" className="footer-nav-link">🍅 {t('navigation.pomodoro')}</a>
              <a href="/financial" className="footer-nav-link">💰 {t('navigation.financial')}</a>
              <a href="/dashboard" className="footer-nav-link">📊 {t('navigation.dashboard')}</a>
              <a href="/vault" className="footer-nav-link">🔐 {t('navigation.vault')}</a>
              <a href="/settings" className="footer-nav-link">⚙️ {t('navigation.settings')}</a>
            </div>
            
            <div className="footer-bottom">
              <div className="copyright">
                © 2025 erderom.ro. Toate drepturile rezervate.
              </div>
              <div className="version-info">
                <span className="version-badge">v3.0.0</span>
                <span className="commit-hash">#0d6a867</span>
              </div>
            </div>
          </div>
        </footer>
      </div>


      <style jsx>{`
        .layout-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .layout-header {
          margin-bottom: 2rem;
          transition: all 0.3s ease;
        }

        .home-header {
          background: var(--bg-primary);
          border-bottom: 2px solid var(--border-color);
        }

        .transparent-header {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .transparent-nav {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        .transparent-nav-link {
          padding: 0.4rem 0.8rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 15px;
          text-decoration: none;
          color: var(--text-primary);
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }

        .transparent-nav-link:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .transparent-header .title {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .transparent-header .subtitle {
          color: var(--text-secondary);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          text-align: left;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .title {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .home-link {
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
        }

        .clickable-logo:hover {
          transform: scale(1.05);
          background: linear-gradient(135deg, #FF8C00 0%, #FFA500 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .clickable-logo:active {
          transform: scale(0.98);
        }

        .subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .footer-nav {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .footer-nav-link {
          padding: 0.5rem 1rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          text-decoration: none;
          color: var(--text-primary);
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .footer-nav-link:hover {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
          transform: translateY(-2px);
        }

        .footer-nav-link:active {
          transform: translateY(0);
        }

        .footer-bottom {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
          margin-top: 1rem;
          text-align: center;
        }

        .copyright {
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .copyright a {
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .copyright a:hover {
          color: var(--accent-color);
        }

        .layout-main {
          flex: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          width: 100%;
        }

        .layout-footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          padding: 2rem;
          color: var(--text-secondary);
          margin-top: auto;
          transition: all 0.3s ease;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
        }


        .version-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .version-badge {
          background: var(--accent-color);
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-weight: 500;
          font-size: 0.7rem;
        }

        .commit-hash {
          font-family: monospace;
          background: var(--bg-tertiary);
          padding: 0.2rem 0.5rem;
          border-radius: 8px;
          color: var(--text-tertiary);
        }

        .language-toggle {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.2rem;
          color: var(--text-primary);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .language-toggle:hover {
          transform: scale(1.1);
          border-color: var(--accent-color);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .theme-toggle {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1.2rem;
        }

        .theme-toggle:hover {
          transform: scale(1.1);
          border-color: var(--accent-color);
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
            padding: 1rem;
          }

          .header-left {
            text-align: center;
          }

          .title {
            font-size: 1.5rem;
          }

          .subtitle {
            font-size: 0.9rem;
          }

          .transparent-nav {
            justify-content: center;
            gap: 0.5rem;
            margin-top: 0.8rem;
          }

          .transparent-nav-link {
            padding: 0.3rem 0.6rem;
            font-size: 0.75rem;
          }

          .footer-nav {
            justify-content: center;
            gap: 0.5rem;
          }

          .footer-nav-link {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
          }

          .layout-main {
            padding: 0 1rem;
          }

          .layout-footer {
            padding: 1rem;
            font-size: 0.9rem;
          }

          .footer-content {
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .footer-nav {
            gap: 0.3rem;
          }

          .footer-nav-link {
            padding: 0.3rem 0.6rem;
            font-size: 0.75rem;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 0.8rem;
            text-align: center;
          }

          .copyright {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  );
};

export default Layout;
