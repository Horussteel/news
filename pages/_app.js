import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { UserProvider } from '../contexts/UserContext'
import { LanguageProvider } from '../contexts/LanguageContext'
import { ThemeProvider } from '../contexts/ThemeContext'

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
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
