import { useState, useEffect } from 'react';

const Hangman = ({ onGameEnd, language }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
  const [score, setScore] = useState(0);

  // Dicționar de cuvinte românești
  const romanianWords = [
    'CALCULATOR', 'PROGRAMARE', 'INTERNET', 'TEHNOLOGIE', 'COMPUTER',
    'SOFTWARE', 'HARDWARE', 'BAZA_DE_DATE', 'ALGORITM', 'JAVASCRIPT',
    'ROMÂNIA', 'BUCUREȘTI', 'CARPATI', 'DUNĂREA', 'MARE',
    'MUNTE', 'PADURE', 'RÂU', 'LAC', 'ORAS',
    'SOARE', 'LUNA', 'STELE', 'CER', 'NOR',
    'FLOARE', 'ARBORE', 'FRUNZA', 'RADACINA', 'SEMINT',
    'ANIMAL', 'PASARE', 'PESTE', 'MAMIFER', 'REPTILA',
    'MASINA', 'AVION', 'VAPOR', 'TREN', 'BICICLET',
    'CASA', 'CLADIRE', 'FEREASTRA', 'USA', 'ACOPERIS',
    'SCOALA', 'ELEV', 'PROFESOR', 'MANUAL', 'TABLETA',
    'MANGA', 'PENAR', 'CREION', 'STILOU', 'CAIET',
    'CART', 'CAL', 'COBZA', 'OAIE', 'VAC'
  ];

  // English words for fallback
  const englishWords = [
    'COMPUTER', 'PROGRAMMING', 'INTERNET', 'TECHNOLOGY', 'SOFTWARE',
    'HARDWARE', 'DATABASE', 'ALGORITHM', 'JAVASCRIPT', 'NETWORK',
    'MOUNTAIN', 'FOREST', 'RIVER', 'LAKE', 'CITY',
    'FLOWER', 'TREE', 'LEAF', 'ROOT', 'SEED',
    'ANIMAL', 'BIRD', 'FISH', 'MAMMAL', 'REPTILE',
    'CAR', 'PLANE', 'SHIP', 'TRAIN', 'BICYCLE'
  ];

  const maxWrongGuesses = 6;
  const words = language === 'ro' ? romanianWords : englishWords;

  const selectRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
  };

  const initializeGame = () => {
    const selectedWord = selectRandomWord();
    setWord(selectedWord);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus('playing');
    setScore(0);
    setGameStarted(true);
  };

  const handleLetterClick = (letter) => {
    if (gameStatus !== 'playing' || guessedLetters.includes(letter)) {
      return;
    }

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (!word.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);

      if (newWrongGuesses >= maxWrongGuesses) {
        setGameStatus('lost');
        if (onGameEnd) {
          onGameEnd(0, `${language === 'ro' ? 'Ai pierdut! Cuvântul era:' : 'You lost! The word was:'} ${word}`);
        }
      }
    } else {
      // Check if won
      const wordLetters = word.split('').filter(char => char !== '_' && char !== '-');
      const uniqueLetters = [...new Set(wordLetters)];
      const correctGuesses = uniqueLetters.filter(letter => newGuessedLetters.includes(letter));

      if (correctGuesses.length === uniqueLetters.length) {
        setGameStatus('won');
        const finalScore = Math.max(100 - (wrongGuesses * 15), 25);
        setScore(finalScore);
        if (onGameEnd) {
          onGameEnd(finalScore, `${language === 'ro' ? 'Ai câștigat!' : 'You won!'}`);
        }
      }
    }
  };

  const renderWord = () => {
    return word.split('').map((char, index) => {
      if (char === '_' || char === '-') {
        return (
          <span key={index} className="word-char separator">
            {char}
          </span>
        );
      }
      return (
        <span key={index} className="word-char">
          {guessedLetters.includes(char) ? char : '_'}
        </span>
      );
    });
  };

  const renderHangman = () => {
    const parts = [
      // Head
      wrongGuesses >= 1 && (
        <circle key="head" cx="150" cy="70" r="20" stroke="#EF4444" strokeWidth="3" fill="none" />
      ),
      // Body
      wrongGuesses >= 2 && (
        <line key="body" x1="150" y1="90" x2="150" y2="150" stroke="#EF4444" strokeWidth="3" />
      ),
      // Left arm
      wrongGuesses >= 3 && (
        <line key="leftarm" x1="150" y1="110" x2="120" y2="130" stroke="#EF4444" strokeWidth="3" />
      ),
      // Right arm
      wrongGuesses >= 4 && (
        <line key="rightarm" x1="150" y1="110" x2="180" y2="130" stroke="#EF4444" strokeWidth="3" />
      ),
      // Left leg
      wrongGuesses >= 5 && (
        <line key="leftleg" x1="150" y1="150" x2="120" y2="190" stroke="#EF4444" strokeWidth="3" />
      ),
      // Right leg
      wrongGuesses >= 6 && (
        <line key="rightleg" x1="150" y1="150" x2="180" y2="190" stroke="#EF4444" strokeWidth="3" />
      )
    ];

    return (
      <svg width="200" height="250" className="hangman-svg">
        {/* Gallows */}
        <line x1="10" y1="230" x2="100" y2="230" stroke="#666" strokeWidth="4" />
        <line x1="50" y1="230" x2="50" y2="20" stroke="#666" strokeWidth="4" />
        <line x1="50" y1="20" x2="150" y2="20" stroke="#666" strokeWidth="4" />
        <line x1="150" y1="20" x2="150" y2="50" stroke="#666" strokeWidth="4" />
        
        {/* Hangman parts */}
        {parts}
      </svg>
    );
  };

  const renderKeyboard = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZĂÂÎȘȚ'.split('');
    const displayAlphabet = language === 'ro' ? alphabet : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    return (
      <div className="keyboard">
        {displayAlphabet.map(letter => {
          const isGuessed = guessedLetters.includes(letter);
          const isCorrect = isGuessed && word.includes(letter);
          const isWrong = isGuessed && !word.includes(letter);

          return (
            <button
              key={letter}
              className={`key ${isGuessed ? (isCorrect ? 'correct' : 'wrong') : ''}`}
              onClick={() => handleLetterClick(letter)}
              disabled={isGuessed || gameStatus !== 'playing'}
            >
              {letter}
            </button>
          );
        })}
      </div>
    );
  };

  const getGameMessage = () => {
    if (gameStatus === 'won') {
      return {
        text: language === 'ro' ? '🎉 Felicitări! Ai câștigat!' : '🎉 Congratulations! You won!',
        className: 'message won'
      };
    }
    if (gameStatus === 'lost') {
      return {
        text: `${language === 'ro' ? '😔 Ai pierdut! Cuvântul era:' : '😔 You lost! The word was:'} ${word}`,
        className: 'message lost'
      };
    }
    return {
      text: `${language === 'ro' ? 'Încercări rămase:' : 'Remaining attempts:'} ${maxWrongGuesses - wrongGuesses}`,
      className: 'message playing'
    };
  };

  useEffect(() => {
    initializeGame();
  }, []);

  if (!gameStarted) {
    return (
      <div className="hangman">
        <div className="game-loading">
          <div className="loading-spinner"></div>
          <p>{language === 'ro' ? 'Se pregătește jocul...' : 'Preparing game...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hangman">
      <div className="game-header">
        <h3>{language === 'ro' ? 'Spânzurătoarea' : 'Hangman'}</h3>
        <div className="game-stats">
          <span>{language === 'ro' ? 'Scor:' : 'Score:'} {score}</span>
          <span>{language === 'ro' ? 'Greșeli:' : 'Mistakes:'} {wrongGuesses}/{maxWrongGuesses}</span>
        </div>
      </div>

      <div className="game-container">
        <div className="hangman-container">
          {renderHangman()}
        </div>

        <div className="word-container">
          <div className="word">
            {renderWord()}
          </div>
        </div>

        <div className={`message ${getGameMessage().className}`}>
          {getGameMessage().text}
        </div>

        {renderKeyboard()}

        {gameStatus !== 'playing' && (
          <button onClick={initializeGame} className="new-game-button">
            {language === 'ro' ? '🔄 Joc nou' : '🔄 New Game'}
          </button>
        )}
      </div>

      <style jsx>{`
        .hangman {
          max-width: 800px;
          margin: 0 auto;
          padding: 1rem;
        }

        .game-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .game-header h3 {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
          font-size: 2rem;
          font-weight: 700;
        }

        .game-stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .game-container {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 15px;
          padding: 2rem;
          text-align: center;
        }

        .hangman-container {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .hangman-svg {
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
        }

        .word-container {
          margin-bottom: 2rem;
        }

        .word {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: 0.5rem;
        }

        .word-char {
          display: inline-block;
          min-width: 2rem;
          text-align: center;
          color: var(--text-primary);
          border-bottom: 3px solid var(--accent-color);
          padding: 0.5rem;
          margin: 0 0.25rem;
        }

        .word-char.separator {
          border-bottom: none;
          min-width: 1rem;
          color: var(--text-secondary);
        }

        .message {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 2rem;
          padding: 1rem;
          border-radius: 10px;
        }

        .message.playing {
          background: rgba(59, 130, 246, 0.1);
          border: 2px solid #3B82F6;
          color: #3B82F6;
        }

        .message.won {
          background: rgba(16, 185, 129, 0.1);
          border: 2px solid #10B981;
          color: #10B981;
        }

        .message.lost {
          background: rgba(239, 68, 68, 0.1);
          border: 2px solid #EF4444;
          color: #EF4444;
        }

        .keyboard {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(45px, 1fr));
          gap: 0.5rem;
          max-width: 600px;
          margin: 0 auto 2rem;
        }

        .key {
          padding: 0.75rem;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .key:hover:not(:disabled) {
          background: var(--bg-tertiary);
          border-color: var(--accent-color);
          transform: translateY(-2px);
        }

        .key:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .key.correct {
          background: rgba(16, 185, 129, 0.2);
          border-color: #10B981;
          color: #10B981;
        }

        .key.wrong {
          background: rgba(239, 68, 68, 0.2);
          border-color: #EF4444;
          color: #EF4444;
        }

        .new-game-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .new-game-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .game-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 3rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top: 4px solid var(--accent-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .keyboard {
            grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
            gap: 0.4rem;
          }

          .key {
            padding: 0.6rem;
            font-size: 0.9rem;
          }

          .word {
            font-size: 1.5rem;
            letter-spacing: 0.25rem;
          }

          .word-char {
            min-width: 1.5rem;
            padding: 0.4rem;
          }
        }

        @media (max-width: 480px) {
          .game-stats {
            flex-direction: column;
            gap: 0.5rem;
          }

          .word {
            font-size: 1.2rem;
          }

          .keyboard {
            grid-template-columns: repeat(auto-fit, minmax(35px, 1fr));
          }

          .key {
            padding: 0.5rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Hangman;
