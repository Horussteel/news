import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import secureVaultService from '../lib/secureVaultService';
import VaultLocker from '../components/SecureVault/VaultLocker';
import VaultDashboard from '../components/SecureVault/VaultDashboard';
import Layout from '../components/Layout';

const VaultPage = () => {
  const router = useRouter();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkVaultStatus();
  }, []);

  const checkVaultStatus = () => {
    try {
      // Verifică dacă seiful este inițializat
      if (!secureVaultService.isVaultInitialized()) {
        setIsLoading(false);
        return;
      }

      // Verifică dacă sesiunea este activă
      if (secureVaultService.isSessionActive()) {
        setIsUnlocked(true);
      }
    } catch (error) {
      setError('Eroare la verificarea stării seifului');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlocked = () => {
    setIsUnlocked(true);
  };

  const handleLocked = () => {
    setIsUnlocked(false);
  };

  const handleInitialized = () => {
    // Seiful a fost inițializat cu succes
  };

  const handleLogout = () => {
    // Blochează seiful și navighează la pagina principală
    secureVaultService.lockVault();
    router.push('/');
  };

  if (isLoading) {
    return (
      <Layout title="Seif Securizat" description="Seif personal securizat">
        <div className="vault-loading-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Se verifică starea seifului...</p>
          </div>

          <style jsx>{`
            .vault-loading-page {
              min-height: 100vh;
              background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .loading-container {
              text-align: center;
              color: white;
            }

            .loading-spinner {
              width: 50px;
              height: 50px;
              border: 3px solid rgba(255, 255, 255, 0.2);
              border-top: 3px solid #667eea;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 1rem;
            }

            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            .loading-container p {
              font-size: 1.1rem;
              opacity: 0.8;
            }
          `}</style>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Eroare Seif" description="Eroare la accesarea seifului">
        <div className="vault-error-page">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>Eroare la accesarea seifului</h2>
            <p>{error}</p>
            <button 
              className="btn-retry"
              onClick={() => {
                setError('');
                checkVaultStatus();
              }}
            >
              Reîncearcă
            </button>
            <button 
              className="btn-home"
              onClick={() => router.push('/')}
            >
              Pagina principală
            </button>
          </div>

          <style jsx>{`
            .vault-error-page {
              min-height: 100vh;
              background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 2rem;
            }

            .error-container {
              text-align: center;
              color: white;
              background: rgba(239, 68, 68, 0.1);
              border: 1px solid rgba(239, 68, 68, 0.3);
              border-radius: 16px;
              padding: 3rem 2rem;
              max-width: 400px;
            }

            .error-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }

            .error-container h2 {
              margin: 0 0 1rem 0;
              font-size: 1.5rem;
              color: #fca5a5;
            }

            .error-container p {
              margin: 0 0 2rem 0;
              opacity: 0.8;
              line-height: 1.6;
            }

            .btn-retry, .btn-home {
              display: block;
              width: 100%;
              padding: 0.75rem 1.5rem;
              margin-bottom: 1rem;
              border: none;
              border-radius: 8px;
              font-size: 0.9rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
            }

            .btn-retry {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }

            .btn-retry:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }

            .btn-home {
              background: rgba(255, 255, 255, 0.1);
              color: white;
              border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .btn-home:hover {
              background: rgba(255, 255, 255, 0.2);
            }

            .btn-home:last-child {
              margin-bottom: 0;
            }
          `}</style>
        </div>
      </Layout>
    );
  }

  // Dacă seiful nu este deblocat, arată ecranul de deblocare
  if (!isUnlocked) {
    return (
      <Layout title="Seif Securizat" description="Accesați seiful dvs. securizat" hideNavigation={true}>
        <VaultLocker 
          onUnlocked={handleUnlocked}
          onInitialized={handleInitialized}
        />
      </Layout>
    );
  }

  // Dacă seiful este deblocat, arată dashboard-ul
  return (
    <Layout title="Seif Securizat" description="Panou de control seif securizat" hideNavigation={true}>
      <VaultDashboard 
        onLock={handleLocked}
        onLogout={handleLogout}
      />
    </Layout>
  );
};

export default VaultPage;
