import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { UserProvider } from '../contexts/UserContext'

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </SessionProvider>
  )
}

export default MyApp
