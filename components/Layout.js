import { useState, useEffect } from 'react';
import UserMenu from './UserMenu';
import Head from 'next/head';
import storageService from '../lib/storageService';
import todoService from '../lib/todoService';
import readingService from '../lib/readingService';
import pomodoroService from '../lib/pomodoroService';
import { useLanguage, useTranslation } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const Layout = ({ children, title, description }) => {
  const { language, changeLanguage, availableLanguages } = useLanguage();
  const { t } = useTranslation();
  const { theme, updateTheme } = useTheme();

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
        <header className="layout-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="title">
                <a href="/" className="home-link">
                  🤖 {t('layout.title')}
                </a>
              </h1>
              <p className="subtitle">{t('layout.subtitle')}</p>
              <nav className="main-nav">
                <a href="/" className="nav-link">📰 {t('navigation.news')}</a>
                <a href="/bookmarks" className="nav-link">📚 {t('navigation.bookmarks')}</a>
                <a href="/history" className="nav-link">📖 {t('navigation.history')}</a>
                <a href="/radio" className="nav-link">🎵 Radio</a>
                <a href="/habits" className="nav-link">🎯 {t('navigation.habits')}</a>
                <a href="/reading" className="nav-link">📚 {t('navigation.reading')}</a>
                <a href="/todo" className="nav-link">✅ {t('navigation.todo')}</a>
                <a href="/pomodoro" className="nav-link">🍅 {t('navigation.pomodoro')}</a>
                <a href="/financial" className="nav-link">💰 {t('navigation.financial')}</a>
                <a href="/dashboard" className="nav-link">📊 {t('navigation.dashboard')}</a>
                <a href="/settings" className="nav-link">⚙️ {t('navigation.settings')}</a>
              </nav>
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
            <a 
              href="https://erderom.ro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              {t('layout.footer')}
            </a>
            <div className="version-info">
              <span className="version-badge">v2.0.0</span>
              <span className="commit-hash">#0d6a867</span>
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
          background: var(--bg-primary);
          border-bottom: 2px solid var(--border-color);
          margin-bottom: 2rem;
          transition: all 0.3s ease;
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
        }

        .subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .main-nav {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        .nav-link {
          padding: 0.5rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          text-decoration: none;
          color: var(--text-primary);
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .nav-link:hover {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
          transform: translateY(-2px);
        }


        .nav-link:active {
          transform: translateY(0);
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
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-link {
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .footer-link:hover {
          color: var(--accent-color);
          text-decoration: underline;
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

          .main-nav {
            justify-content: center;
            gap: 0.5rem;
          }

          .nav-link {
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
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }

          .version-info {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .main-nav {
            gap: 0.3rem;
          }

          .nav-link {
            padding: 0.3rem 0.6rem;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </>
  );
};

export default Layout;
