import { useState, useEffect } from 'react';

const WordScramble = ({ onGameEnd, language }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [hints, setHints] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const [usedWords, setUsedWords] = useState([]);

  // Word lists in both languages
  const words = {
    ro: [
      { word: 'CALCULATOR', hint: 'Dispozitiv electronic de calcul' },
      { word: 'PROGRAMARE', hint: 'Proces de creare software' },
      { word: 'INTERNET', hint: 'Rețea globală de calculatoare' },
      { word: 'TEHNOLOGIE', hint: 'Aplicarea științei în industrie' },
      { word: 'COMPUTER', hint: 'Calculator în engleză' },
      { word: 'SOFTWARE', hint: 'Programe pentru calculator' },
      { word: 'HARDWARE', hint: 'Componente fizice ale calculatorului' },
      { word: 'BAZA_DE_DATE', hint: 'Sistem de stocare informații' },
      { word: 'ALGORITM', hint: 'Pas de rezolvare a unei probleme' },
      { word: 'JAVASCRIPT', hint: 'Limbaj de programare web' },
      { word: 'ROMÂNIA', hint: 'Țara noastră' },
      { word: 'BUCUREȘTI', hint: 'Capitala României' },
      { word: 'CARPATI', hint: 'Munții din România' },
      { word: 'DUNĂREA', hint: 'Râu important în Europa' },
      { word: 'MARE', hint: 'Corp de apă sărat' }
    ],
    en: [
      { word: 'COMPUTER', hint: 'Electronic device for calculation' },
      { word: 'PROGRAMMING', hint: 'Process of creating software' },
      { word: 'INTERNET', hint: 'Global network of computers' },
      { word: 'TECHNOLOGY', hint: 'Application of science in industry' },
      { word: 'SOFTWARE', hint: 'Programs for computer' },
      { word: 'HARDWARE', hint: 'Physical components of computer' },
      { word: 'DATABASE', hint: 'Organized collection of data' },
      { word: 'ALGORITHM', hint: 'Step-by-step problem-solving procedure' },
      { word: 'JAVASCRIPT', hint: 'Web programming language' },
      { word: 'NETWORK', hint: 'Connected system of computers' }
    ]
  };

  const currentWords = words[language] || words.ro;
  const currentWordData = currentWords[currentWordIndex];
  const currentWord = currentWordData?.word || '';
  const currentHint = currentWordData?.hint || '';

  const scrambleWord = (word) => {
    // Convert to array of characters using spread operator for better Unicode support
    const chars = [...word];
    const shuffled = [...chars];
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    const scrambled = shuffled.join('');
    
    // If by chance it's the same as original, shuffle again
    if (scrambled === word) {
      return scrambleWord(word);
    }
    
    return scrambled;
  };

  const [scrambledWord, setScrambledWord] = useState('');

  const initializeGame = () => {
    setGameStarted(true);
    setCurrentWordIndex(0);
    setScore(0);
    setUserInput('');
    setShowResult(false);
    setGameCompleted(false);
    setAttempts(0);
    setCorrectAnswers(0);
    setHints(3);
    setShowHint(false);
    
    // Select first 5 words (not random to ensure consistency)
    const selectedWords = currentWords.slice(0, 5);
    
    setUsedWords(selectedWords);
    setScrambledWord(scrambleWord(selectedWords[0]?.word || ''));
  };

  const handleSubmit = () => {
    if (!userInput.trim() || showResult) return;
    
    const isCorrect = userInput.toUpperCase().trim() === currentWord;
    setAttempts(attempts + 1);
    setShowResult(true);
    
    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
      const timeBonus = Math.max(0, 100 - attempts * 10);
      const hintBonus = showHint ? 0 : hints * 10;
      const roundScore = 50 + timeBonus + hintBonus;
      setScore(score + roundScore);
    }
  };

  const nextWord = () => {
    if (currentWordIndex < usedWords.length - 1) {
      const nextIndex = currentWordIndex + 1;
      const nextScrambled = scrambleWord(usedWords[nextIndex].word);
      
      setCurrentWordIndex(nextIndex);
      setUserInput('');
      setShowResult(false);
      setShowHint(false);
      setScrambledWord(nextScrambled);
    } else {
      setGameCompleted(true);
    }
  };

  const useHint = () => {
    if (hints > 0 && !showResult) {
      setHints(hints - 1);
      setShowHint(true);
    }
  };

  const calculateFinalScore = () => {
    const accuracy = correctAnswers / usedWords.length;
    if (accuracy >= 0.8) return 100;
    if (accuracy >= 0.6) return 80;
    if (accuracy >= 0.4) return 60;
    return 40;
  };

  const getPerformanceMessage = () => {
    const accuracy = correctAnswers / usedWords.length;
    if (accuracy >= 0.8) return language === 'ro' ? 'Excelent!' : 'Excellent!';
    if (accuracy >= 0.6) return language === 'ro' ? 'Foarte bine!' : 'Very good!';
    if (accuracy >= 0.4) return language === 'ro' ? 'Bine!' : 'Good!';
    return language === 'ro' ? 'Mai multă antrenament!' : 'More practice needed!';
  };

  const resetGame = () => {
    initializeGame();
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

  if (gameCompleted) {
    const finalScore = calculateFinalScore();
    const accuracy = Math.round((correctAnswers / usedWords.length) * 100);
    
    return (
      <div className="word-scramble-completed">
        <div className="completion-header">
          <h3>🎯 {language === 'ro' ? 'Joc Terminat!' : 'Game Completed!'}</h3>
          <div className="final-stats">
            <div className="stat-circle">
              <span className="stat-number">{accuracy}%</span>
            </div>
            <p className="stat-details">
              {correctAnswers} / {usedWords.length} {language === 'ro' ? 'cuvinte corecte' : 'correct words'}
            </p>
            <p className="stat-message">{getPerformanceMessage()}</p>
            <div className="final-score-display">
              {language === 'ro' ? 'Scor total:' : 'Total score:'} {score}
            </div>
          </div>
        </div>
        
        <div className="words-review">
          <h4>{language === 'ro' ? 'Cuvinte folosite:' : 'Words used:'}</h4>
          <div className="words-list">
            {usedWords.map((wordData, index) => (
              <div key={index} className="word-item">
                <span className="word-scrambled">{scrambleWord(wordData.word)}</span>
                <span className="word-arrow">→</span>
                <span className="word-correct">{wordData.word}</span>
              </div>
            ))}
          </div>
        </div>
        
        <button onClick={resetGame} className="restart-button">
          {language === 'ro' ? 'Joc nou' : 'New Game'}
        </button>

        <style jsx>{`
          .word-scramble-completed {
            max-width: 600px;
            margin: 0 auto;
            padding: 1rem;
            text-align: center;
          }

          .completion-header {
            margin-bottom: 2rem;
          }

          .completion-header h3 {
            margin: 0 0 1.5rem 0;
            color: var(--text-primary);
            font-size: 1.8rem;
          }

          .final-stats {
            margin-bottom: 2rem;
          }

          .stat-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
          }

          .stat-number {
            color: white;
            font-size: 2rem;
            font-weight: 700;
          }

          .stat-details {
            color: var(--text-secondary);
            margin: 0 0 0.5rem 0;
            font-size: 1.1rem;
          }

          .stat-message {
            color: var(--accent-color);
            font-weight: 600;
            font-size: 1.2rem;
            margin: 0 0 1rem 0;
          }

          .final-score-display {
            font-size: 1.5rem;
            font-weight: 700;
            color: #667eea;
          }

          .words-review {
            margin-bottom: 2rem;
            text-align: left;
          }

          .words-review h4 {
            text-align: center;
            margin-bottom: 1rem;
            color: var(--text-primary);
          }

          .words-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .word-item {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            padding: 0.5rem;
            background: var(--bg-secondary);
            border-radius: 8px;
          }

          .word-scrambled {
            color: var(--text-secondary);
            font-family: monospace;
            font-weight: 600;
          }

          .word-arrow {
            color: var(--accent-color);
            font-weight: 700;
          }

          .word-correct {
            color: #10B981;
            font-weight: 600;
          }

          .restart-button {
            background: var(--accent-color);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.2s ease;
          }

          .restart-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="word-scramble">
      <div className="game-header">
        <h3>{language === 'ro' ? 'Cuvinte Amestecate' : 'Word Scramble'}</h3>
        <div className="game-stats">
          <span>{language === 'ro' ? 'Cuvânt' : 'Word'} {currentWordIndex + 1} / {usedWords.length}</span>
          <span>{language === 'ro' ? 'Scor:' : 'Score:'} {score}</span>
          <span>{language === 'ro' ? 'Indicii:' : 'Hints:'} {hints}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentWordIndex + 1) / usedWords.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="game-container">
        <div className="scrambled-word-container">
        <div className="scrambled-word">
          {scrambledWord.split(/(.)/).filter(Boolean).map((letter, index) => (
            <span key={index} className="letter-tile">
              {letter}
            </span>
          ))}
        </div>
        </div>

        {showHint && (
          <div className="hint-display">
            💡 {currentHint}
          </div>
        )}

        <div className="input-container">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={language === 'ro' ? 'Introdu cuvântul corect...' : 'Enter the correct word...'}
            className="word-input"
            disabled={showResult}
          />
          <button 
            onClick={useHint} 
            className="hint-button"
            disabled={hints === 0 || showResult}
          >
            💡 {language === 'ro' ? 'Indiciu' : 'Hint'}
          </button>
        </div>

        <button 
          onClick={handleSubmit} 
          className="submit-button"
          disabled={!userInput.trim() || showResult}
        >
          {language === 'ro' ? 'Verifică' : 'Check'}
        </button>

        {showResult && (
          <div className="result-feedback">
            <div className={`result-message ${userInput.toUpperCase().trim() === currentWord ? 'correct' : 'incorrect'}`}>
              {userInput.toUpperCase().trim() === currentWord 
                ? `✅ ${language === 'ro' ? 'Corect!' : 'Correct!'}`
                : `❌ ${language === 'ro' ? 'Greșit!' : 'Incorrect!'}`
              }
            </div>
            <div className="correct-answer">
              {language === 'ro' ? 'Răspuns corect:' : 'Correct answer:'} <strong>{currentWord}</strong>
            </div>
            <button onClick={nextWord} className="next-button">
              {currentWordIndex < usedWords.length - 1 
                ? (language === 'ro' ? 'Următorul cuvânt' : 'Next word')
                : (language === 'ro' ? 'Vezi rezultatele' : 'See results')
              }
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .word-scramble {
          max-width: 600px;
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
          font-size: 1.8rem;
        }

        .game-stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--bg-secondary);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s ease;
        }

        .game-container {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 15px;
          padding: 2rem;
        }

        .scrambled-word-container {
          text-align: center;
          margin-bottom: 2rem;
        }

        .scrambled-word {
          display: inline-flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .letter-tile {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          background: var(--accent-color);
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
          transition: all 0.2s ease;
        }

        .letter-tile:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .hint-display {
          background: rgba(255, 193, 7, 0.1);
          border: 2px solid #FFC107;
          border-radius: 10px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          color: #856404;
          font-weight: 500;
          text-align: center;
        }

        .input-container {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .word-input {
          flex: 1;
          padding: 1rem;
          border: 2px solid var(--border-color);
          border-radius: 10px;
          font-size: 1.1rem;
          text-align: center;
          text-transform: uppercase;
          font-weight: 600;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .word-input:focus {
          outline: none;
          border-color: var(--accent-color);
        }

        .word-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .hint-button {
          background: #FFC107;
          color: #856404;
          border: none;
          padding: 1rem 1.5rem;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .hint-button:hover:not(:disabled) {
          background: #E0A800;
          transform: translateY(-2px);
        }

        .hint-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .submit-button {
          width: 100%;
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 10px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 1.5rem;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .result-feedback {
          text-align: center;
        }

        .result-message {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .result-message.correct {
          color: #10B981;
        }

        .result-message.incorrect {
          color: #EF4444;
        }

        .correct-answer {
          margin-bottom: 1.5rem;
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .next-button {
          background: #10B981;
          color: white;
          border: none;
          padding: 0.8rem 2rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .next-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        @media (max-width: 480px) {
          .game-stats {
            gap: 1rem;
            font-size: 0.9rem;
          }

          .letter-tile {
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
          }

          .input-container {
            flex-direction: column;
          }

          .word-input {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default WordScramble;
