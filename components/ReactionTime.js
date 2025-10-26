import { useState, useEffect } from 'react';

const ReactionTime = ({ onGameEnd, language }) => {
  const [gameState, setGameState] = useState('waiting'); // waiting, ready, clicked, finished
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [timeout, setTimeout] = useState(null);

  const startGame = () => {
    setGameState('ready');
    setGameStarted(true);
    setShowResult(false);
    
    // Show green signal after random delay (2-5 seconds)
    const delay = Math.random() * 3000 + 2000;
    const timeoutId = setTimeout(() => {
      setStartTime(Date.now());
      setGameState('clicked');
    }, delay);
    
    setTimeout(timeoutId);
  };

  const handleClick = () => {
    if (gameState === 'waiting') {
      // Start the game
      startGame();
      return;
    }

    if (gameState === 'finished') {
      return;
    }

    if (gameState === 'ready') {
      // Too early!
      setGameState('finished');
      setReactionTime(-1); // -1 indicates too early
      setShowResult(true);
      return;
    }

    if (gameState === 'clicked') {
      const endTime = Date.now();
      const time = endTime - startTime;
      setReactionTime(time);
      setGameState('finished');
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (!bestTime || time < bestTime) {
        setBestTime(time);
      }
      
      setShowResult(true);
    }
  };

  const resetRound = () => {
    setGameState('waiting');
    setReactionTime(0);
    setShowResult(false);
  };

  const calculateScore = () => {
    if (reactionTime <= 0) return 0; // Too early
    if (reactionTime < 250) return 100; // Excellent
    if (reactionTime < 350) return 80;  // Good
    if (reactionTime < 450) return 60;  // Average
    return 40; // Slow
  };

  const getReactionMessage = () => {
    if (reactionTime <= 0) return language === 'ro' ? 'Prea devreme!' : 'Too early!';
    if (reactionTime < 250) return language === 'ro' ? 'Excelent!' : 'Excellent!';
    if (reactionTime < 350) return language === 'ro' ? 'Foarte bine!' : 'Very good!';
    if (reactionTime < 450) return language === 'ro' ? 'Bine!' : 'Good!';
    return language === 'ro' ? 'Mai repede data viitoare!' : 'Faster next time!';
  };

  const finishGame = () => {
    const avgTime = attempts > 0 ? bestTime : 0;
    const score = calculateScore();
    onGameEnd(score, `${language === 'ro' ? 'Cel mai bun timp:' : 'Best time:'} ${bestTime}ms`);
    
    // Reset for new game
    setGameState('waiting');
    setGameStarted(false);
    setReactionTime(0);
    setAttempts(0);
    setBestTime(null);
    setShowResult(false);
  };

  useEffect(() => {
    setGameStarted(true);
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [timeout]);

  if (!gameStarted) {
    return (
      <div className="game-loading">
        <p>{language === 'ro' ? 'Se pregătește jocul...' : 'Preparing game...'}</p>
      </div>
    );
  }

  return (
    <div className="reaction-time">
      <div className="game-info">
        <h3>{language === 'ro' ? 'Timp de Reacție' : 'Reaction Time'}</h3>
        <p>{language === 'ro' ? 'Click pe culoarea verde cât mai repede posibil' : 'Click on the green area as fast as possible'}</p>
      </div>

      <div className="game-stats">
        <span>{language === 'ro' ? 'Încercări:' : 'Attempts:'} {attempts}</span>
        {bestTime && (
          <span>{language === 'ro' ? 'Cel mai bun:' : 'Best:'} {bestTime}ms</span>
        )}
      </div>

      <div 
        className={`reaction-area ${gameState}`}
        onClick={handleClick}
      >
        {gameState === 'waiting' && (
          <div className="waiting-message">
            <h3>{language === 'ro' ? 'Click pentru a începe' : 'Click to start'}</h3>
            <p>{language === 'ro' ? 'Când devine verde, click cât mai repede!' : 'When it turns green, click as fast as you can!'}</p>
          </div>
        )}
        
        {gameState === 'ready' && (
          <div className="ready-message">
            <h3>{language === 'ro' ? 'Așteaptă...' : 'Wait...'}</h3>
            <p>{language === 'ro' ? 'Pregătește-te!' : 'Get ready!'}</p>
          </div>
        )}
        
        {gameState === 'clicked' && (
          <div className="go-message">
            <h3>{language === 'ro' ? 'CLICK ACUM!' : 'CLICK NOW!'}</h3>
            <p>{language === 'ro' ? 'Click!' : 'Click!'}</p>
          </div>
        )}
        
        {showResult && (
          <div className="result-message">
            <h3>{getReactionMessage()}</h3>
            <p>{language === 'ro' ? 'Timp de reacție:' : 'Reaction time:'} {Math.abs(reactionTime)}ms</p>
            <div className="result-stats">
              <span>{language === 'ro' ? 'Scor:' : 'Score:'} {calculateScore()}</span>
            </div>
            <div className="result-buttons">
              <button onClick={resetRound} className="try-again-button">
                {language === 'ro' ? 'Încearcă din nou' : 'Try again'}
              </button>
              {attempts >= 3 && (
                <button onClick={finishGame} className="finish-button">
                  {language === 'ro' ? 'Termină jocul' : 'Finish game'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {attempts >= 3 && !showResult && (
        <button onClick={finishGame} className="finish-game-button">
          {language === 'ro' ? 'Termină jocul' : 'Finish game'}
        </button>
      )}

      <style jsx>{`
        .reaction-time {
          max-width: 600px;
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
          display: flex;
          justify-content: center;
          gap: 2rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .reaction-area {
          aspect-ratio: 16/9;
          border: 3px solid var(--border-color);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 1.5rem;
          font-weight: 600;
          color: white;
          font-size: 1.2rem;
        }

        .reaction-area.waiting {
          background: var(--bg-secondary);
          border-color: var(--accent-color);
        }

        .reaction-area.ready {
          background: #F59E0B;
          border-color: #F59E0B;
        }

        .reaction-area.clicked {
          background: #10B981;
          border-color: #10B981;
          animation: pulse 0.5s ease-in-out;
        }

        .reaction-area.finished {
          background: var(--bg-secondary);
          border-color: var(--border-color);
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .waiting-message h3,
        .ready-message h3,
        .go-message h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.8rem;
        }

        .waiting-message p,
        .ready-message p,
        .go-message p {
          margin: 0;
          font-size: 1rem;
          opacity: 0.9;
        }

        .go-message {
          animation: blink 0.5s ease-in-out infinite alternate;
        }

        @keyframes blink {
          0% { opacity: 1; }
          100% { opacity: 0.7; }
        }

        .result-message {
          text-align: center;
        }

        .result-message h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .result-message p {
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
          font-weight: 500;
        }

        .result-stats {
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .result-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .try-again-button {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .finish-button {
          background: #10B981;
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .try-again-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .finish-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .finish-game-button {
          background: #EF4444;
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          margin-top: 1rem;
        }

        .finish-game-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        @media (max-width: 480px) {
          .reaction-area {
            aspect-ratio: 4/3;
          }
          
          .waiting-message h3,
          .ready-message h3,
          .go-message h3 {
            font-size: 1.4rem;
          }
          
          .result-buttons {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ReactionTime;
