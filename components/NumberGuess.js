import { useState, useEffect } from 'react';

const NumberGuess = ({ onGameEnd, language }) => {
  const [targetNumber, setTargetNumber] = useState(0);
  const [currentGuess, setCurrentGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [message, setMessage] = useState('');
  const [guessHistory, setGuessHistory] = useState([]);

  const initializeGame = () => {
    const newTarget = Math.floor(Math.random() * 100) + 1;
    setTargetNumber(newTarget);
    setCurrentGuess('');
    setAttempts(0);
    setGameStarted(true);
    setGameCompleted(false);
    setMessage('');
    setGuessHistory([]);
    console.log('Target number:', newTarget); // For debugging
  };

  const handleGuess = () => {
    const guess = parseInt(currentGuess);
    
    if (isNaN(guess) || guess < 1 || guess > 100) {
      setMessage(language === 'ro' ? 'Introdu un număr între 1 și 100' : 'Enter a number between 1 and 100');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    const newHistory = [...guessHistory, { guess, result: compareGuess(guess, targetNumber) }];
    setGuessHistory(newHistory);

    if (guess === targetNumber) {
      setGameCompleted(true);
      const score = Math.max(100 - newAttempts * 5, 10);
      setMessage(language === 'ro' ? `Felicitări! Ai ghicit numărul ${targetNumber}!` : `Congratulations! You guessed the number ${targetNumber}!`);
      onGameEnd(score, `${language === 'ro' ? 'Ghicit în' : 'Guessed in'} ${newAttempts} ${language === 'ro' ? 'încercări' : 'attempts'}`);
    } else if (guess < targetNumber) {
      setMessage(language === 'ro' ? 'Prea mic! Încearcă un număr mai mare.' : 'Too low! Try a higher number.');
    } else {
      setMessage(language === 'ro' ? 'Prea mare! Încearcă un număr mai mic.' : 'Too high! Try a lower number.');
    }
    
    setCurrentGuess('');
  };

  const compareGuess = (guess, target) => {
    if (guess === target) return 'correct';
    if (guess < target) return 'low';
    return 'high';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !gameCompleted) {
      handleGuess();
    }
  };

  useEffect(() => {
    initializeGame();
  }, []);

  if (!gameStarted) {
    return (
      <div className="game-loading">
        <p>{language === 'ro' ? 'Se pregătește jocul...' : 'Preparing game...'}</p>
      </div>
    );
  }

  return (
    <div className="number-guess">
      <div className="game-info">
        <h3>{language === 'ro' ? 'Ghicește numărul' : 'Guess the Number'}</h3>
        <p>{language === 'ro' ? 'Am ales un număr între 1 și 100' : 'I have chosen a number between 1 and 100'}</p>
      </div>

      <div className="game-stats">
        <span>{language === 'ro' ? 'Încercări:' : 'Attempts:'} {attempts}</span>
      </div>

      {!gameCompleted ? (
        <div className="game-input">
          <input
            type="number"
            value={currentGuess}
            onChange={(e) => setCurrentGuess(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={language === 'ro' ? 'Introdu numărul...' : 'Enter number...'}
            min="1"
            max="100"
            className="guess-input"
          />
          <button onClick={handleGuess} className="guess-button">
            {language === 'ro' ? 'Ghicește' : 'Guess'}
          </button>
        </div>
      ) : (
        <div className="game-completed">
          <div className="success-message">
            <h3>🎉 {message}</h3>
            <p>{language === 'ro' ? `Scor: ${Math.max(100 - attempts * 5, 10)}` : `Score: ${Math.max(100 - attempts * 5, 10)}`}</p>
          </div>
        </div>
      )}

      {message && !gameCompleted && (
        <div className="hint-message">
          {message}
        </div>
      )}

      {guessHistory.length > 0 && (
        <div className="guess-history">
          <h4>{language === 'ro' ? 'Istoric încercări:' : 'Guess History:'}</h4>
          <div className="history-list">
            {guessHistory.map((item, index) => (
              <div key={index} className={`history-item ${item.result}`}>
                <span className="guess-number">{item.guess}</span>
                <span className="guess-result">
                  {item.result === 'low' ? '📉' : item.result === 'high' ? '📈' : '✅'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={initializeGame} className="restart-button">
        {language === 'ro' ? 'Joc nou' : 'New Game'}
      </button>

      <style jsx>{`
        .number-guess {
          max-width: 500px;
          margin: 0 auto;
          padding: 1rem;
          text-align: center;
        }

        .game-info {
          margin-bottom: 1.5rem;
        }

        .game-info h3 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
          font-size: 1.5rem;
        }

        .game-info p {
          margin: 0;
          color: var(--text-secondary);
        }

        .game-stats {
          margin-bottom: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          font-size: 1.1rem;
        }

        .game-input {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          justify-content: center;
        }

        .guess-input {
          padding: 0.8rem;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          font-size: 1rem;
          width: 150px;
          text-align: center;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .guess-button {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .guess-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .hint-message {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          color: var(--text-primary);
          font-weight: 500;
        }

        .game-completed {
          margin-bottom: 1rem;
        }

        .success-message {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 12px;
        }

        .success-message h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.3rem;
        }

        .success-message p {
          margin: 0;
          font-size: 1.1rem;
        }

        .guess-history {
          margin-top: 1.5rem;
        }

        .guess-history h4 {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
        }

        .history-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
        }

        .history-item {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 8px;
          padding: 0.5rem 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .history-item.low {
          border-color: #3B82F6;
        }

        .history-item.high {
          border-color: #EF4444;
        }

        .history-item.correct {
          border-color: #10B981;
          background: rgba(16, 185, 129, 0.1);
        }

        .guess-number {
          font-weight: 600;
          color: var(--text-primary);
        }

        .guess-result {
          font-size: 1.2rem;
        }

        .restart-button {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          margin-top: 1rem;
          transition: all 0.2s ease;
        }

        .restart-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 480px) {
          .game-input {
            flex-direction: column;
            align-items: center;
          }
          
          .guess-input {
            width: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default NumberGuess;
