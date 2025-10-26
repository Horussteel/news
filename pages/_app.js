import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { UserProvider } from '../contexts/UserContext'
import { LanguageProvider } from '../contexts/LanguageContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { useEffect } from 'react'

// Import services to make them available globally
import '../lib/storageService'
import '../lib/todoService'
import '../lib/readingService'
import '../lib/habitService'
import '../lib/pomodoroService'
import '../lib/financialService'
import '../lib/gamesService'
import '../lib/dataExportService'

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  useEffect(() => {
    // Make services available globally for the export service
    if (typeof window !== 'undefined') {
      import('../lib/storageService').then(module => {
        window.storageService = module.default;
      });
      import('../lib/todoService').then(module => {
        window.todoService = module.default;
      });
      import('../lib/readingService').then(module => {
        window.readingService = module.default;
      });
      import('../lib/habitService').then(module => {
        window.habitService = module.default;
      });
      import('../lib/pomodoroService').then(module => {
        window.pomodoroService = module.default;
      });
      import('../lib/financialService').then(module => {
        window.financialService = module.default;
      });
      import('../lib/gamesService').then(module => {
        window.gamesService = module.default;
      });
      import('../lib/dataExportService').then(module => {
        window.dataExportService = module.default;
      });
    }
  }, []);

  return (
    <SessionProvider session={session}>
      <UserProvider>
        <LanguageProvider>
          <ThemeProvider>
            <Component {...pageProps} />
          </ThemeProvider>
        </LanguageProvider>
      </UserProvider>
    </SessionProvider>
  )
}

export default MyApp
