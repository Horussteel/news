import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useUser } from '../contexts/UserContext'

const UserMenu = () => {
  const { data: session, status } = useSession()
  const { bookmarksCount, isLoading } = useUser()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = () => {
    setIsOpen(false)
    signOut({ callbackUrl: '/' })
  }

  if (status === 'loading') {
    return (
      <div className="user-menu-loading">
        <div className="avatar-skeleton"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <Link href="/auth/signin" className="signin-btn">
        Sign In
      </Link>
    )
  }

  return (
    <div className="user-menu">
      <button 
        className="user-menu-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="user-avatar">
          {session.user.image ? (
            <img 
              src={session.user.image} 
              alt={session.user.name}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="avatar-placeholder">
              {session.user.name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
        <span className="user-name">{session.user.name}</span>
        <svg className="dropdown-arrow" viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5H7z"/>
        </svg>
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="dropdown-header">
            <div className="user-info">
              <div className="user-avatar">
                {session.user.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {session.user.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="user-details">
                <p className="user-name">{session.user.name}</p>
                <p className="user-email">{session.user.email}</p>
              </div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-menu-items">
            <Link href="/" className="menu-item">
              <svg className="menu-icon" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              <span>Home</span>
            </Link>
            <Link href="/bookmarks" className="menu-item">
              <svg className="menu-icon" viewBox="0 0 24 24">
                <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
              </svg>
              <span>Bookmarks</span>
              {bookmarksCount > 0 && (
                <span className="badge">{bookmarksCount}</span>
              )}
            </Link>

            <Link href="/history" className="menu-item">
              <svg className="menu-icon" viewBox="0 0 24 24">
                <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
              </svg>
              <span>Reading History</span>
            </Link>

            <Link href="/settings" className="menu-item">
              <svg className="menu-icon" viewBox="0 0 24 24">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
              </svg>
              <span>Settings</span>
            </Link>

            <div className="dropdown-divider"></div>

            <button className="menu-item signout-btn" onClick={handleSignOut}>
              <svg className="menu-icon" viewBox="0 0 24 24">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .user-menu {
          position: relative;
        }

        .user-menu-loading {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f0f0f0;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .signin-btn {
          padding: 10px 20px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .signin-btn:hover {
          background: #5a67d8;
          transform: translateY(-1px);
        }

        .user-menu-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: white;
          border: 2px solid #e1e5e9;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .user-menu-button:hover {
          border-color: #667eea;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
        }

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dropdown-arrow {
          width: 16px;
          height: 16px;
          fill: #666;
          transition: transform 0.3s ease;
        }

        .user-menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          width: 280px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          z-index: 1000;
          overflow: hidden;
        }

        .dropdown-header {
          padding: 20px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-info .user-avatar {
          width: 48px;
          height: 48px;
        }

        .user-details .user-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .user-email {
          font-size: 14px;
          color: #666;
          margin: 0;
        }

        .dropdown-divider {
          height: 1px;
          background: #e1e5e9;
          margin: 0;
        }

        .dropdown-menu-items {
          padding: 8px 0;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          color: #333;
          text-decoration: none;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.2s ease;
          position: relative;
        }

        .menu-item:hover {
          background-color: #f8f9fa;
        }

        .menu-icon {
          width: 20px;
          height: 20px;
          fill: #666;
          flex-shrink: 0;
        }

        .menu-item span {
          flex: 1;
          font-size: 14px;
        }

        .badge {
          background: #667eea;
          color: white;
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 500;
        }

        .signout-btn:hover .menu-icon {
          fill: #dc3545;
        }

        @media (max-width: 768px) {
          .user-name {
            display: none;
          }
          
          .user-menu-dropdown {
            width: 240px;
          }
        }
      `}</style>
    </div>
  )
}

export default UserMenu
