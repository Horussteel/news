import { useState, useEffect } from 'react';
import secureVaultService from '../../lib/secureVaultService';
import PinKeypad from './PinKeypad';

const VaultLocker = ({ onUnlocked, onInitialized }) => {
  const [mode, setMode] = useState('unlock'); // 'unlock' | 'setup' | 'confirm'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [setupPin, setSetupPin] = useState('');
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  useEffect(() => {
    checkVaultStatus();
  }, []);

  useEffect(() => {
    if (lockoutTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setLockoutTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTimeRemaining]);

  const checkVaultStatus = () => {
    if (secureVaultService.isSessionActive()) {
      onUnlocked?.();
      return;
    }

    if (!secureVaultService.isVaultInitialized()) {
      setMode('setup');
    } else {
      // Verifică dacă seiful este blocat
      if (secureVaultService.isVaultLocked()) {
        const remaining = secureVaultService.getLockoutTimeRemaining();
        setLockoutTimeRemaining(remaining);
      }
    }
  };

  const handleUnlockPin = async (pin) => {
    setIsLoading(true);
    setError('');

    try {
      const result = secureVaultService.unlockVault(pin);
      
      if (result.success) {
        onUnlocked?.();
      } else {
        setError(result.message);
        
        // Dacă seiful este blocat, actualizează timpul rămas
        if (result.locked || result.lockoutTimeRemaining) {
          setLockoutTimeRemaining(result.lockoutTimeRemaining || secureVaultService.getLockoutTimeRemaining());
        }
      }
    } catch (error) {
      setError('Eroare la deblocarea seifului');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupPin = async (pin) => {
    if (pin.length < 4) {
      setError('PIN-ul trebuie să aibă cel puțin 4 cifre');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = secureVaultService.initializeVault(pin);
      
      if (result.success) {
        setSetupPin(pin);
        setMode('confirm');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Eroare la inițializarea seifului');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPin = async (pin) => {
    console.log('🔐 Confirm PIN - PIN introdus:', pin, 'Setup PIN:', setupPin, 'Se potrivesc?', pin === setupPin);
    
    if (pin !== setupPin) {
      setError('PIN-urile nu se potrivesc. Vă rugăm să introduceți același PIN.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Confirm PIN - Deblocare seif cu PIN:', pin);
      const result = secureVaultService.unlockVault(pin);
      
      if (result.success) {
        console.log('🔐 Confirm PIN - Seif deblocat cu succes');
        onInitialized?.();
        onUnlocked?.();
      } else {
        console.log('🔐 Confirm PIN - Eroare la deblocare:', result.message);
        setError(result.message);
      }
    } catch (error) {
      console.log('🔐 Confirm PIN - Eroare exception:', error);
      setError('Eroare la confirmarea PIN-ului');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinComplete = (pin) => {
    console.log('🔐 [VaultLocker] handlePinComplete - Mod curent:', mode, 'PIN:', pin);
    
    switch (mode) {
      case 'unlock':
        console.log('🔐 [VaultLocker] Apelare handleUnlockPin');
        handleUnlockPin(pin);
        break;
      case 'setup':
        console.log('🔐 [VaultLocker] Apelare handleSetupPin');
        handleSetupPin(pin);
        break;
      case 'confirm':
        console.log('🔐 [VaultLocker] Apelare handleConfirmPin');
        handleConfirmPin(pin);
        break;
    }
  };

  const handleForgotPin = () => {
    setError('ATENȚIE: Dacă uitați PIN-ul, toate datele din seif vor fi pierdute permanent. Nu există metodă de recuperare.');
  };

  const handleResetVault = () => {
    if (confirm('Sunteți sigur că doriți să ștergeți complet seiful? Toate datele vor fi pierdute permanent și această acțiune nu poate fi anulată.')) {
      try {
        const result = secureVaultService.resetVault();
        if (result.success) {
          // Resetăm starea locală
          setMode('setup');
          setSetupPin('');
          setError('');
          
          // Afișăm mesaj de succes
          setTimeout(() => {
            setError('Seiful a fost resetat complet. Puteți crea un nou seif.');
            setTimeout(() => setError(''), 3000);
          }, 100);
          
        } else {
          setError('Eroare la resetarea seifului: ' + result.message);
        }
      } catch (error) {
        setError('Eroare la resetarea seifului: ' + error.message);
      }
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'unlock':
        return lockoutTimeRemaining > 0 
          ? `Seif Blocat (${Math.floor(lockoutTimeRemaining / 60)}:${(lockoutTimeRemaining % 60).toString().padStart(2, '0')})`
          : 'Deblocați Seiful';
      case 'setup':
        return 'Creați PIN-ul Seifului';
      case 'confirm':
        return 'Confirmați PIN-ul';
      default:
        return 'Seif Securizat';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'unlock':
        return lockoutTimeRemaining > 0 
          ? 'Așteptați până expiră timpul de blocare'
          : 'Introduceți PIN-ul pentru a accesa seiful';
      case 'setup':
        return 'Alegeți un PIN de cel puțin 4 cifre pentru a securiza datele';
      case 'confirm':
        return 'Introduceți din nou PIN-ul pentru confirmare';
      default:
        return '';
    }
  };

  const isDisabled = lockoutTimeRemaining > 0;

  return (
    <div className="vault-locker-container">
      <div className="vault-locker-content">
        <div className="vault-header">
          <div className="vault-icon">🔐</div>
          <h1 className="vault-title">Seif Securizat</h1>
          <p className="vault-subtitle">{getSubtitle()}</p>
        </div>

        <PinKeypad
          onPinComplete={handlePinComplete}
          maxLength={6}
          title={getTitle()}
          error={error}
          isLoading={isLoading}
          disabled={isDisabled}
          showForgotPin={mode === 'unlock'}
          onForgotPin={handleForgotPin}
        />

        <div className="vault-security-info">
          <div className="security-features">
            <div className="security-feature">
              <span className="feature-icon">🔒</span>
              <span className="feature-text">Criptare AES-256</span>
            </div>
            <div className="security-feature">
              <span className="feature-icon">💾</span>
              <span className="feature-text">Stocare 100% locală</span>
            </div>
            <div className="security-feature">
              <span className="feature-icon">🛡️</span>
              <span className="feature-text">Fără acces terță parte</span>
            </div>
          </div>
          
          {mode === 'setup' && (
            <div className="setup-warning">
              <span className="warning-icon">⚠️</span>
              <div className="warning-text">
                <strong>Important:</strong> Salvați PIN-ul într-un loc sigur. 
                Dacă îl uitați, toate datele vor fi pierdute permanent.
              </div>
            </div>
          )}

          {/* Opțiune de resetare pentru cazul în care utilizatorul uită PIN-ul */}
          {mode === 'unlock' && (
            <div className="reset-vault-section">
              <div className="reset-warning">
                <span className="warning-icon">🚨</span>
                <div className="warning-text">
                  <strong>Ați uitat PIN-ul?</strong><br/>
                  Dacă nu mai puteți accesa seifulul, puteți să-l resetați complet.<br/>
                  <strong>Atenție:</strong> Această acțiune va șterge <strong>permanent</strong> toate datele din seif!
                </div>
              </div>
              <button 
                className="reset-vault-button"
                onClick={handleResetVault}
              >
                🗑️ Resetează Complet Seifulul
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .vault-locker-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .vault-locker-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(102, 126, 234, 0.05) 0%, transparent 50%);
          animation: floatingBackground 20s ease-in-out infinite;
        }

        @keyframes floatingBackground {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }

        .vault-locker-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 500px;
        }

        .vault-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .vault-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }

        .vault-title {
          color: white;
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .vault-subtitle {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.1rem;
          margin: 0;
          line-height: 1.6;
        }

        .vault-security-info {
          margin-top: 3rem;
          text-align: center;
        }

        .security-features {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .security-feature {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .security-feature:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .feature-icon {
          font-size: 1.5rem;
        }

        .feature-text {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .setup-warning {
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          text-align: left;
        }

        .warning-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .warning-text {
          color: #fde68a;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .warning-text strong {
          color: #fbbf24;
          font-weight: 600;
        }

        .reset-vault-section {
          margin-top: 2rem;
          text-align: center;
        }

        .reset-warning {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          text-align: left;
          margin-bottom: 1rem;
        }

        .reset-warning .warning-text {
          color: #fca5a5;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .reset-warning .warning-text strong {
          color: #f87171;
          font-weight: 600;
        }

        .reset-vault-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
        }

        .reset-vault-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
          background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
        }

        .reset-vault-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 10px rgba(220, 38, 38, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .vault-locker-container {
            padding: 1rem;
          }

          .vault-icon {
            font-size: 3rem;
          }

          .vault-title {
            font-size: 2rem;
          }

          .vault-subtitle {
            font-size: 1rem;
          }

          .security-features {
            gap: 1rem;
          }

          .security-feature {
            padding: 0.75rem;
            min-width: 100px;
          }

          .feature-icon {
            font-size: 1.2rem;
          }

          .feature-text {
            font-size: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .vault-locker-content {
            max-width: 100%;
          }

          .security-features {
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
          }

          .security-feature {
            width: 100%;
            max-width: 200px;
            flex-direction: row;
            justify-content: center;
          }

          .setup-warning {
            flex-direction: column;
            text-align: center;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .vault-locker-container {
            background: #000000;
          }

          .vault-title {
            color: #ffffff;
            -webkit-text-fill-color: #ffffff;
          }

          .security-feature {
            border: 2px solid #ffffff;
          }

          .setup-warning {
            border: 2px solid #fbbf24;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .vault-icon {
            animation: none;
          }

          .vault-locker-container::before {
            animation: none;
          }

          .security-feature {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default VaultLocker;
