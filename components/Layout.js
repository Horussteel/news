import { useState, useEffect } from 'react';
import UserMenu from './UserMenu';
import Head from 'next/head';
import storageService from '../lib/storageService';
import todoService from '../lib/todoService';
import readingService from '../lib/readingService';
import pomodoroService from '../lib/pomodoroService';

const Layout = ({ children, title, description }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Make services available globally for data export
    if (typeof window !== 'undefined') {
      window.storageService = storageService;
      window.todoService = todoService;
      window.readingService = readingService;
      window.pomodoroService = pomodoroService;
    }

    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <>
      <Head>
        <title>{title || 'AI News Platform'}</title>
        <meta name="description" content={description || 'Latest AI and technology news'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`layout-container ${darkMode ? 'dark-mode' : 'light-mode'}`} data-theme={darkMode ? 'dark' : 'light'}>
        <header className="layout-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="title">
                <a href="/" className="home-link">
                  🤖 NEWS ERDEROM
                </a>
              </h1>
              <p className="subtitle">Latest Artificial Intelligence & Technology News</p>
              <nav className="main-nav">
                <a href="/" className="nav-link">📰 News</a>
                <a href="/bookmarks" className="nav-link">📚 Bookmarks</a>
                <a href="/history" className="nav-link">📖 History</a>
                <a href="/habits" className="nav-link">🎯 Habits</a>
                <a href="/reading" className="nav-link">📚 Reading</a>
                <a href="/todo" className="nav-link">✅ To-Do</a>
                <a href="/pomodoro" className="nav-link">🍅 Pomodoro</a>
                <a href="/dashboard" className="nav-link">📊 Dashboard</a>
                <a href="/settings" className="nav-link">⚙️ Settings</a>
              </nav>
            </div>
            <div className="header-right">
              <UserMenu />
              <button 
                className="theme-toggle"
                onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
            </div>
          </div>
        </header>

        <main className="layout-main">
          {children}
        </main>

        <footer className="layout-footer">
          <p>&copy; 2025 AI News Hub. Powered by erderom.ro</p>
        </footer>
      </div>

      <style jsx global>{`
        :root {
          --bg-primary: #ffffff;
          --bg-secondary: #f8f9fa;
          --text-primary: #333333;
          --text-secondary: #666666;
          --border-color: #e1e5e9;
          --accent-color: #667eea;
          --shadow-color: rgba(0, 0, 0, 0.1);
        }

        .dark-mode {
          --bg-primary: #1a1a1a;
          --bg-secondary: #2d2d2d;
          --text-primary: #ffffff;
          --text-secondary: #b0b0b0;
          --border-color: #404040;
          --accent-color: #8b9dc3;
          --shadow-color: rgba(0, 0, 0, 0.3);
        }

        body {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          transition: background-color 0.3s ease, color 0.3s ease;
        }
      `}</style>

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
          text-align: center;
          color: var(--text-secondary);
          margin-top: auto;
          transition: all 0.3s ease;
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
