import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { UserProvider } from '../contexts/UserContext'
import { LanguageProvider } from '../contexts/LanguageContext'

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <UserProvider>
        <LanguageProvider>
          <Component {...pageProps} />
        </LanguageProvider>
      </UserProvider>
    </SessionProvider>
  )
}

export default MyApp
