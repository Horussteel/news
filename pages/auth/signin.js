import { signIn, getProviders } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function SignIn({ providers }) {
  const router = useRouter()
  const { callbackUrl } = router.query

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const response = await fetch('/api/auth/session')
      const session = await response.json()
      if (session.user) {
        router.push(callbackUrl || '/')
      }
    }
    checkAuth()
  }, [router, callbackUrl])

  return (
    <>
      <Head>
        <title>Sign In - NEWS ERDEROM</title>
        <meta name="description" content="Sign in to NEWS ERDEROM with Google" />
      </Head>
      
      <div className="signin-container">
        <div className="signin-card">
          <div className="signin-header">
            <h1>🤖 NEWS ERDEROM</h1>
            <p>Sign in to access personalized news experience</p>
          </div>
          
          <div className="signin-providers">
            {Object.values(providers).map((provider) => (
              <div key={provider.name} className="provider-button">
                <button
                  onClick={() => signIn(provider.id, { callbackUrl: callbackUrl || '/' })}
                  className="google-signin-btn"
                >
                  <svg className="google-icon" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with {provider.name}
                </button>
              </div>
            ))}
          </div>
          
          <div className="signin-benefits">
            <h3>Why sign in?</h3>
            <ul>
              <li>📚 Save articles to read later</li>
              <li>📖 Track your reading history</li>
              <li>⚙️ Personalize your news feed</li>
              <li>🌐 Sync across devices</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .signin-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .signin-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          max-width: 400px;
          width: 100%;
          text-align: center;
        }

        .signin-header {
          margin-bottom: 30px;
        }

        .signin-header h1 {
          font-size: 2rem;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .signin-header p {
          color: #666;
          font-size: 1rem;
        }

        .signin-providers {
          margin-bottom: 30px;
        }

        .google-signin-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 12px 20px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          background: white;
          color: #333;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .google-signin-btn:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }

        .google-icon {
          width: 20px;
          height: 20px;
        }

        .signin-benefits {
          text-align: left;
          border-top: 1px solid #e1e5e9;
          padding-top: 20px;
        }

        .signin-benefits h3 {
          color: #333;
          margin-bottom: 15px;
          text-align: center;
        }

        .signin-benefits ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .signin-benefits li {
          padding: 8px 0;
          color: #666;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        @media (max-width: 480px) {
          .signin-card {
            padding: 30px 20px;
          }
          
          .signin-header h1 {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </>
  )
}

export async function getServerSideProps(context) {
  const providers = await getProviders()
  return {
    props: { providers },
  }
}
