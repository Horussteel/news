import { useState, useEffect } from 'react';

const PinKeypad = ({ 
  onPinComplete, 
  onPinChange, 
  maxLength = 6, 
  title = "Introduceți PIN-ul",
  showForgotPin = false,
  onForgotPin,
  error = null,
  isLoading = false,
  disabled = false
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  useEffect(() => {
    onPinChange?.(pin);
  }, [pin, onPinChange]);

  const handleNumberClick = (number) => {
    if (disabled || isLoading) return;
    
    if (pin.length < maxLength) {
      const newPin = pin + number;
      setPin(newPin);
      
      if (newPin.length === maxLength) {
        // Auto-submit când atinge lungimea maximă
        setTimeout(() => {
          onPinComplete?.(newPin);
        }, 100); // Mic întârziere pentru feedback vizual
      }
    }
  };

  const handleClear = () => {
    if (disabled || isLoading) return;
    setPin('');
  };

  const handleBackspace = () => {
    if (disabled || isLoading) return;
    setPin(pin.slice(0, -1));
  };

  const handleKeyPress = (e) => {
    if (disabled || isLoading) return;
    
    if (e.key >= '0' && e.key <= '9') {
      handleNumberClick(e.key);
    } else if (e.key === 'Backspace') {
      handleBackspace();
    } else if (e.key === 'Delete') {
      handleClear();
    } else if (e.key === 'Enter' && pin.length > 0) {
      onPinComplete?.(pin);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [pin, disabled, isLoading]);

  const renderPinDisplay = () => {
    const dots = [];
    for (let i = 0; i < maxLength; i++) {
      const isFilled = i < pin.length;
      dots.push(
        <div 
          key={i} 
          className={`pin-dot ${isFilled ? 'filled' : ''} ${error ? 'error' : ''}`}
        >
          {isFilled && (showPin ? pin[i] : '•')}
        </div>
      );
    }
    return dots;
  };

  return (
    <div className="pin-keypad-container">
      <div className="pin-keypad-header">
        <h2 className="pin-title">{title}</h2>
        {error && (
          <div className="pin-error">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
          </div>
        )}
      </div>

      <div className="pin-display">
        {renderPinDisplay()}
        <button 
          className="pin-visibility-toggle"
          onClick={() => setShowPin(!showPin)}
          disabled={disabled || isLoading}
          title={showPin ? "Ascunde PIN" : "Arată PIN"}
        >
          {showPin ? '👁️‍🗨️' : '👁️'}
        </button>
      </div>

      <div className="pin-keypad">
        <div className="keypad-row">
          {[1, 2, 3].map(num => (
            <button
              key={num}
              className="keypad-button"
              onClick={() => handleNumberClick(num.toString())}
              disabled={disabled || isLoading}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="keypad-row">
          {[4, 5, 6].map(num => (
            <button
              key={num}
              className="keypad-button"
              onClick={() => handleNumberClick(num.toString())}
              disabled={disabled || isLoading}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="keypad-row">
          {[7, 8, 9].map(num => (
            <button
              key={num}
              className="keypad-button"
              onClick={() => handleNumberClick(num.toString())}
              disabled={disabled || isLoading}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="keypad-row">
          <button
            className="keypad-button keypad-action"
            onClick={handleClear}
            disabled={disabled || isLoading}
          >
            Șterge
          </button>
          <button
            className="keypad-button"
            onClick={() => handleNumberClick('0')}
            disabled={disabled || isLoading}
          >
            0
          </button>
          <button
            className="keypad-button keypad-action"
            onClick={handleBackspace}
            disabled={disabled || isLoading}
          >
            ←
          </button>
        </div>
        
        {/* Buton de submit vizibil când PIN-ul este complet */}
        {pin.length === maxLength && (
          <div className="keypad-submit-row">
            <button
              className="submit-button"
              onClick={() => onPinComplete?.(pin)}
              disabled={disabled || isLoading}
              type="button"
            >
              🔓 {isLoading ? 'Se procesează...' : 'Deblochează Seiful'}
            </button>
          </div>
        )}
      </div>

      {showForgotPin && (
        <button 
          className="forgot-pin-button"
          onClick={onForgotPin}
          disabled={disabled || isLoading}
        >
          Am uitat PIN-ul
        </button>
      )}

      {isLoading && (
        <div className="pin-loading">
          <div className="loading-spinner"></div>
          <span>Se procesează...</span>
        </div>
      )}

      <style jsx>{`
        .pin-keypad-container {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          max-width: 400px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
        }

        .pin-keypad-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }

        .pin-keypad-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .pin-title {
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .pin-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .error-icon {
          font-size: 1.2rem;
        }

        .error-text {
          color: #fca5a5;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .pin-display {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          position: relative;
        }

        .pin-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: transparent;
          transition: all 0.3s ease;
          font-size: 0.8rem;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .pin-dot.filled {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          transform: scale(1.1);
          box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
        }

        .pin-dot.error {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.2);
        }

        .pin-visibility-toggle {
          position: absolute;
          right: -40px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .pin-visibility-toggle:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        .pin-visibility-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pin-keypad {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .keypad-row {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
        }

        .keypad-button {
          width: 60px;
          height: 60px;
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .keypad-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.3s ease, height 0.3s ease;
        }

        .keypad-button:hover:not(:disabled)::before {
          width: 100px;
          height: 100px;
        }

        .keypad-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .keypad-button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .keypad-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .keypad-action {
          font-size: 1rem;
          background: rgba(102, 126, 234, 0.2);
          border-color: rgba(102, 126, 234, 0.4);
        }

        .keypad-action:hover:not(:disabled) {
          background: rgba(102, 126, 234, 0.3);
          border-color: rgba(102, 126, 234, 0.6);
        }

        .forgot-pin-button {
          width: 100%;
          margin-top: 1.5rem;
          padding: 0.75rem;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .forgot-pin-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-color: rgba(255, 255, 255, 0.4);
        }

        .forgot-pin-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .keypad-submit-row {
          display: flex;
          justify-content: center;
          margin-top: 1rem;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .submit-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 10px rgba(16, 185, 129, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .pin-loading {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          border-radius: 20px;
          backdrop-filter: blur(5px);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .pin-loading span {
          color: white;
          font-size: 0.9rem;
        }

        /* Responsive Design */
        @media (max-width: 480px) {
          .pin-keypad-container {
            padding: 1.5rem;
            margin: 0 1rem;
          }

          .pin-title {
            font-size: 1.3rem;
          }

          .keypad-button {
            width: 50px;
            height: 50px;
            font-size: 1.3rem;
          }

          .pin-visibility-toggle {
            right: -35px;
            width: 28px;
            height: 28px;
          }

          .pin-dot {
            width: 14px;
            height: 14px;
            font-size: 0.7rem;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .pin-keypad-container {
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .pin-keypad-container {
            border: 2px solid white;
          }

          .keypad-button {
            border: 2px solid white;
          }

          .pin-dot {
            border: 2px solid white;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .keypad-button,
          .pin-dot,
          .pin-visibility-toggle,
          .forgot-pin-button {
            transition: none;
          }

          .pin-error {
            animation: none;
          }

          .loading-spinner {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default PinKeypad;
