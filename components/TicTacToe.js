import { useState, useEffect } from 'react';

const TicTacToe = ({ onGameEnd, language }) => {
  const [board, setBoard] = useState(Array(9).fill(''));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [moveCount, setMoveCount] = useState(0);

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  const checkWinner = (currentBoard) => {
    // Check for winner
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (currentBoard[a] && 
          currentBoard[a] === currentBoard[b] && 
          currentBoard[a] === currentBoard[c]) {
        return currentBoard[a];
      }
    }
    
    // Check for draw
    if (currentBoard.every(cell => cell !== '')) {
      return 'draw';
    }
    
    return null;
  };

  const handleCellClick = (index) => {
    // Prevent clicks if cell is occupied, game has winner, or game not started
    if (board[index] || winner || !gameStarted) {
      return;
    }

    // Make the move
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setMoveCount(moveCount + 1);

    // Check for winner after the move
    const gameWinner = checkWinner(newBoard);
    
    if (gameWinner) {
      setWinner(gameWinner);
      
      // Calculate score based on game outcome
      let score = 0;
      let details = '';
      
      if (gameWinner === 'draw') {
        score = 50;
        details = language === 'ro' ? 'Remiză!' : 'Draw game!';
      } else {
        score = 100;
        details = `${language === 'ro' ? 'Jucător' : 'Player'} ${gameWinner} ${language === 'ro' ? 'a câștigat!' : 'wins!'}`;
      }
      
      // Call onGameEnd with score and details
      if (onGameEnd) {
        onGameEnd(score, details);
      }
    } else {
      // Switch player for next turn
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(''));
    setCurrentPlayer('X');
    setWinner(null);
    setMoveCount(0);
    setGameStarted(true);
  };

  // Initialize game on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setGameStarted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const getCellStyle = (value) => {
    if (value === 'X') return { color: '#3B82F6' };
    if (value === 'O') return { color: '#EF4444' };
    return {};
  };

  const getCellContent = (value) => {
    if (value === 'X') return '❌';
    if (value === 'O') return '⭕';
    return '';
  };

  if (!gameStarted) {
    return (
      <div className="tic-tac-toe">
        <div className="game-loading">
          <div className="loading-spinner"></div>
          <p>{language === 'ro' ? 'Se pregătește jocul...' : 'Preparing game...'}</p>
        </div>

        <style jsx>{`
          .tic-tac-toe {
            max-width: 400px;
            margin: 0 auto;
            padding: 1rem;
            text-align: center;
          }

          .game-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            padding: 2rem;
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

          .game-loading p {
            color: var(--text-secondary);
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="tic-tac-toe">
      <div className="game-header">
        <h3>
          {language === 'ro' ? 'X și 0' : 'Tic Tac Toe'}
        </h3>
        
        <div className="game-info">
          {winner ? (
            <div className="winner-info">
              <div className="winner-text">
                {winner === 'draw' 
                  ? (language === 'ro' ? '🤝 Remiză!' : '🤝 Draw!')
                  : (
                    <>
                      <span className="winner-symbol">
                        {winner === 'X' ? '❌' : '⭕'}
                      </span>
                      <span>
                        {language === 'ro' ? 'a câștigat!' : 'wins!'}
                      </span>
                    </>
                  )
                }
              </div>
              <div className="moves-count">
                {language === 'ro' ? 'Mișcări:' : 'Moves:'} {moveCount}
              </div>
            </div>
          ) : (
            <div className="turn-info">
              <span className="turn-symbol">
                {currentPlayer === 'X' ? '❌' : '⭕'}
              </span>
              <span>
                {language === 'ro' ? 'Rândul tău' : 'Your turn'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="game-board">
        <div className="board">
          {board.map((cell, index) => (
            <button
              key={index}
              className={`cell ${cell ? 'occupied' : ''} ${winner ? 'disabled' : ''}`}
              onClick={() => handleCellClick(index)}
              disabled={cell !== '' || winner !== null || !gameStarted}
              style={getCellStyle(cell)}
            >
              <span className="cell-content">
                {getCellContent(cell)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="game-controls">
        <button onClick={resetGame} className="restart-button">
          {language === 'ro' ? '🔄 Joacă din nou' : '🔄 Play Again'}
        </button>
      </div>

      <style jsx>{`
        .tic-tac-toe {
          max-width: 450px;
          margin: 0 auto;
          padding: 1rem;
          text-align: center;
        }

        .game-header {
          margin-bottom: 2rem;
        }

        .game-header h3 {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
          font-size: 2rem;
          font-weight: 700;
        }

        .game-info {
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: 12px;
          border: 2px solid var(--border-color);
        }

        .winner-info, .turn-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .winner-symbol, .turn-symbol {
          font-size: 1.5rem;
        }

        .winner-text {
          color: var(--accent-color);
        }

        .moves-count {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-top: 0.5rem;
        }

        .turn-info {
          color: var(--text-primary);
        }

        .game-board {
          margin-bottom: 2rem;
        }

        .board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          background: var(--bg-secondary);
          padding: 12px;
          border-radius: 16px;
          border: 3px solid var(--border-color);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .cell {
          aspect-ratio: 1;
          border: 2px solid var(--border-color);
          border-radius: 12px;
          background: var(--bg-primary);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .cell:hover:not(:disabled):not(.occupied) {
          background: var(--bg-tertiary);
          border-color: var(--accent-color);
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
        }

        .cell:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .cell.occupied {
          cursor: default;
        }

        .cell-content {
          font-size: 2.5rem;
          font-weight: bold;
          line-height: 1;
          transition: all 0.3s ease;
        }

        .cell:hover .cell-content {
          transform: scale(1.1);
        }

        .game-controls {
          display: flex;
          justify-content: center;
        }

        .restart-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .restart-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .restart-button:active {
          transform: translateY(0);
        }

        @media (max-width: 480px) {
          .tic-tac-toe {
            padding: 0.5rem;
          }

          .game-header h3 {
            font-size: 1.5rem;
          }

          .board {
            gap: 6px;
            padding: 8px;
          }

          .cell-content {
            font-size: 2rem;
          }

          .restart-button {
            padding: 0.8rem 1.5rem;
            font-size: 1rem;
          }
        }

        @media (max-width: 380px) {
          .cell-content {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TicTacToe;
