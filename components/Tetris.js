import { useState, useEffect, useRef, useCallback } from 'react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_SPEED = 800;

const TETROMINOS = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: '#00f0f0'
  },
  O: {
    shape: [[1, 1], [1, 1]],
    color: '#f0f000'
  },
  T: {
    shape: [[0, 1, 0], [1, 1, 1]],
    color: '#a000f0'
  },
  S: {
    shape: [[0, 1, 1], [1, 1, 0]],
    color: '#00f000'
  },
  Z: {
    shape: [[1, 1, 0], [0, 1, 1]],
    color: '#f00000'
  },
  J: {
    shape: [[1, 0, 0], [1, 1, 1]],
    color: '#0000f0'
  },
  L: {
    shape: [[0, 0, 1], [1, 1, 1]],
    color: '#f0a000'
  }
};

const LEVEL_SPEEDS = [800, 600, 400, 200]; // 4 levels

const Tetris = ({ onGameEnd, language }) => {
  const [board, setBoard] = useState([]);
  const [currentPiece, setCurrentPiece] = useState(null);
  const [currentPosition, setCurrentPosition] = useState({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const gameLoopRef = useRef(null);
  const boardRef = useRef(board);

  // Initialize empty board
  const createEmptyBoard = () => {
    return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
  };

  // Get random tetromino
  const getRandomTetromino = () => {
    const tetrominos = Object.keys(TETROMINOS);
    const randomType = tetrominos[Math.floor(Math.random() * tetrominos.length)];
    return {
      type: randomType,
      shape: TETROMINOS[randomType].shape,
      color: TETROMINOS[randomType].color
    };
  };

  // Rotate piece
  const rotatePiece = (piece) => {
    const rotated = piece[0].map((_, index) =>
      piece.map(row => row[index]).reverse()
    );
    return rotated;
  };

  // Check if piece is valid at position
  const isValidMove = (piece, position, board) => {
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x]) {
          const newY = position.y + y;
          const newX = position.x + x;

          if (
            newX < 0 || newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  // Merge piece to board
  const mergePieceToBoard = (piece, position, board) => {
    const newBoard = board.map(row => [...row]);
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x]) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }
    return newBoard;
  };

  // Clear completed lines
  const clearLines = (board) => {
    let linesCleared = 0;
    const newBoard = board.filter(row => {
      if (row.every(cell => cell !== 0)) {
        linesCleared++;
        return false;
      }
      return true;
    });

    // Add empty rows at the top
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }

    return { newBoard, linesCleared };
  };

  // Calculate level and speed
  const updateLevel = useCallback(() => {
    const newLevel = Math.floor(lines / 10) + 1;
    const actualLevel = Math.min(newLevel, 4); // Max 4 levels
    setLevel(actualLevel);
    return LEVEL_SPEEDS[actualLevel - 1];
  }, [lines]);

  // Move piece
  const movePiece = useCallback((direction) => {
    if (!gameStarted || gameOver || isPaused || !currentPiece) return;

    const newPosition = { ...currentPosition };
    switch (direction) {
      case 'left':
        newPosition.x--;
        break;
      case 'right':
        newPosition.x++;
        break;
      case 'down':
        newPosition.y++;
        break;
    }

    if (isValidMove(currentPiece.shape, newPosition, boardRef.current)) {
      setCurrentPosition(newPosition);
    } else if (direction === 'down') {
      // Piece can't move down, lock it
      const mergedBoard = mergePieceToBoard(currentPiece.shape, currentPosition, boardRef.current);
      const { newBoard, linesCleared } = clearLines(mergedBoard);
      
      setBoard(newBoard);
      boardRef.current = newBoard;
      
      if (linesCleared > 0) {
        setLines(prev => prev + linesCleared);
        setScore(prev => prev + linesCleared * 100 * level);
        updateLevel();
      }

      // Spawn new piece
      const newPiece = getRandomTetromino();
      const newPiecePosition = { x: 3, y: 0 };
      
      if (!isValidMove(newPiece.shape, newPiecePosition, newBoard)) {
        // Game over
        setGameOver(true);
        if (onGameEnd) {
          onGameEnd(score, `${language === 'ro' ? 'Joc terminat! Scor:' : 'Game over! Score:'} ${score}`);
        }
      } else {
        setCurrentPiece(newPiece);
        setCurrentPosition(newPiecePosition);
      }
    }
  }, [currentPiece, currentPosition, gameStarted, gameOver, isPaused, score, level, onGameEnd, language, updateLevel]);

  // Rotate current piece
  const rotatePieceHandler = useCallback(() => {
    if (!gameStarted || gameOver || isPaused || !currentPiece) return;

    const rotated = rotatePiece(currentPiece.shape);
    if (isValidMove(rotated, currentPosition, boardRef.current)) {
      setCurrentPiece({ ...currentPiece, shape: rotated });
    }
  }, [currentPiece, currentPosition, gameStarted, gameOver, isPaused]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece('right');
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece('down');
          break;
        case 'ArrowUp':
        case ' ':
          e.preventDefault();
          rotatePieceHandler();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePiece, rotatePieceHandler]);

  // Game loop
  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      const speed = LEVEL_SPEEDS[level - 1];
      gameLoopRef.current = setInterval(() => {
        movePiece('down');
      }, speed);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, isPaused, level, movePiece]);

  // Update board ref
  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  // Start new game
  const startGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPiece(getRandomTetromino());
    setCurrentPosition({ x: 3, y: 0 });
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
    setGameStarted(true);
  };

  // Render board
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // Add current piece to display
    if (currentPiece && gameStarted && !gameOver) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPosition.y + y;
            const boardX = currentPosition.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }

    return displayBoard;
  };

  if (!gameStarted) {
    return (
      <div className="tetris">
        <div className="game-start">
          <h3>{language === 'ro' ? 'Tetris' : 'Tetris'}</h3>
          <p>{language === 'ro' ? 'Aranjează piesele pentru a forma linii complete!' : 'Arrange pieces to form complete lines!'}</p>
          <div className="controls-info">
            <h4>{language === 'ro' ? 'Controale:' : 'Controls:'}</h4>
            <div className="controls-list">
              <div>←→ {language === 'ro' ? 'Mișcare' : 'Move'}</div>
              <div>↓ {language === 'ro' ? 'Accelerare' : 'Soft drop'}</div>
              <div>↑/Space {language === 'ro' ? 'Rotește' : 'Rotate'}</div>
              <div>P {language === 'ro' ? 'Pauză' : 'Pause'}</div>
            </div>
          </div>
          <button onClick={startGame} className="start-button">
            {language === 'ro' ? 'Începe Jocul' : 'Start Game'}
          </button>
        </div>

        <style jsx>{`
          .tetris {
            max-width: 500px;
            margin: 0 auto;
            padding: 1rem;
            text-align: center;
          }

          .game-start {
            background: var(--bg-secondary);
            border: 2px solid var(--border-color);
            border-radius: 15px;
            padding: 2rem;
          }

          .game-start h3 {
            margin: 0 0 1rem 0;
            color: var(--text-primary);
            font-size: 2rem;
          }

          .game-start p {
            margin: 0 0 1.5rem 0;
            color: var(--text-secondary);
          }

          .controls-info {
            margin-bottom: 2rem;
            text-align: left;
          }

          .controls-info h4 {
            margin: 0 0 1rem 0;
            color: var(--text-primary);
          }

          .controls-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
            font-family: monospace;
          }

          .start-button {
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

          .start-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          }
        `}</style>
      </div>
    );
  }

  const displayBoard = renderBoard();

  return (
    <div className="tetris">
      <div className="game-header">
        <h3>{language === 'ro' ? 'Tetris' : 'Tetris'}</h3>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">{language === 'ro' ? 'Scor:' : 'Score:'}</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">{language === 'ro' ? 'Linii:' : 'Lines:'}</span>
            <span className="stat-value">{lines}</span>
          </div>
          <div className="stat">
            <span className="stat-label">{language === 'ro' ? 'Nivel:' : 'Level:'}</span>
            <span className="stat-value">{level}/4</span>
          </div>
        </div>
      </div>

      <div className="game-container">
        <div className="game-board">
          {displayBoard.map((row, y) => (
            <div key={y} className="board-row">
              {row.map((cell, x) => (
                <div
                  key={x}
                  className="board-cell"
                  style={{
                    backgroundColor: cell || 'var(--bg-tertiary)',
                    border: cell ? '1px solid rgba(0,0,0,0.2)' : '1px solid var(--border-color)'
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {isPaused && !gameOver && (
          <div className="pause-overlay">
            <div className="pause-message">
              <h4>{language === 'ro' ? 'PAUZĂ' : 'PAUSED'}</h4>
              <p>Pentru a continua, apasă P</p>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="game-over-overlay">
            <div className="game-over-message">
              <h4>{language === 'ro' ? 'JOC TERMINAT' : 'GAME OVER'}</h4>
              <p>{language === 'ro' ? 'Scor final:' : 'Final Score:'} {score}</p>
              <button onClick={startGame} className="restart-button">
                {language === 'ro' ? 'Joc Nou' : 'New Game'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="controls">
        <button onClick={() => movePiece('left')} className="control-button">←</button>
        <button onClick={() => rotatePieceHandler()} className="control-button">↻</button>
        <button onClick={() => movePiece('right')} className="control-button">→</button>
        <button onClick={() => movePiece('down')} className="control-button">↓</button>
        <button onClick={() => setIsPaused(!isPaused)} className="control-button pause">
          {isPaused ? '▶' : '⏸'}
        </button>
      </div>

      <style jsx>{`
        .tetris {
          max-width: 600px;
          margin: 0 auto;
          padding: 1rem;
        }

        .game-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .game-header h3 {
          margin: 0;
          color: var(--text-primary);
          font-size: 1.5rem;
        }

        .game-stats {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--bg-secondary);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .stat-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--accent-color);
        }

        .game-container {
          position: relative;
          display: inline-block;
          margin: 0 auto;
        }

        .game-board {
          display: grid;
          grid-template-rows: repeat(20, 20px);
          gap: 1px;
          background: var(--bg-tertiary);
          padding: 4px;
          border: 3px solid var(--border-color);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .board-row {
          display: grid;
          grid-template-columns: repeat(10, 20px);
          gap: 1px;
        }

        .board-cell {
          width: 20px;
          height: 20px;
          border-radius: 2px;
        }

        .pause-overlay, .game-over-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        .pause-message, .game-over-message {
          text-align: center;
          color: white;
          background: var(--bg-primary);
          padding: 2rem;
          border-radius: 12px;
          border: 2px solid var(--accent-color);
        }

        .pause-message h4, .game-over-message h4 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
          color: var(--accent-color);
        }

        .game-over-message p {
          margin: 0 0 1.5rem 0;
          font-size: 1.2rem;
        }

        .restart-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .restart-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .controls {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }

        .control-button {
          width: 50px;
          height: 50px;
          border: 2px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-primary);
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.2rem;
          font-weight: 600;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .control-button:hover {
          background: var(--bg-tertiary);
          border-color: var(--accent-color);
          transform: translateY(-2px);
        }

        .control-button.pause {
          background: var(--accent-color);
          color: white;
        }

        @media (max-width: 600px) {
          .game-header {
            flex-direction: column;
            text-align: center;
          }

          .game-stats {
            justify-content: center;
          }

          .game-board {
            grid-template-rows: repeat(20, 15px);
            gap: 0.5px;
          }

          .board-row {
            grid-template-columns: repeat(10, 15px);
            gap: 0.5px;
          }

          .board-cell {
            width: 15px;
            height: 15px;
          }

          .control-button {
            width: 45px;
            height: 45px;
            font-size: 1rem;
          }
        }

        @media (max-width: 400px) {
          .game-board {
            grid-template-rows: repeat(20, 12px);
            gap: 0.25px;
          }

          .board-row {
            grid-template-columns: repeat(10, 12px);
            gap: 0.25px;
          }

          .board-cell {
            width: 12px;
            height: 12px;
          }

          .control-button {
            width: 40px;
            height: 40px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Tetris;
