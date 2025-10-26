import { useState, useEffect, useRef, useCallback } from 'react';

const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 20;
const INITIAL_SPEED = 200;
const LEVEL_SPEEDS = [200, 150, 100, 75]; // 4 levels, increase speed every 5 foods

const SNAKE_COLORS = {
  head: '#4CAF50',
  body: '#8BC34A',
  tail: '#CDDC39'
};

const FOOD_COLORS = [
  '#FF5722', // Red-Orange
  '#FF9800', // Orange
  '#FFC107', // Amber
  '#FFEB3B', // Yellow
  '#CDDC39', // Lime
  '#8BC34A', // Light Green
  '#4CAF50', // Green
  '#009688', // Teal
  '#03A9F4', // Light Blue
  '#2196F3', // Blue
  '#3F51B5', // Indigo
  '#673AB7'  // Purple
];

const Snake = ({ onGameEnd, language }) => {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [foodEaten, setFoodEaten] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [foodColor, setFoodColor] = useState('#FF5722');
  
  const gameLoopRef = useRef(null);
  const directionRef = useRef(direction);

  // Update direction ref when direction changes
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  // Handle game over and call onGameEnd
  useEffect(() => {
    if (gameOver && gameStarted) {
      if (onGameEnd) {
        onGameEnd(score, `${language === 'ro' ? 'Joc terminat! Scor:' : 'Game over! Score:'} ${score}`);
      }
    }
  }, [gameOver, gameStarted, score, onGameEnd, language]);

  // Generate random food position
  const generateFood = useCallback((currentSnake) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_WIDTH),
        y: Math.floor(Math.random() * BOARD_HEIGHT)
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    return newFood;
  }, []);

  // Check collision
  const checkCollision = (head, snakeBody) => {
    // Wall collision
    if (head.x < 0 || head.x >= BOARD_WIDTH || head.y < 0 || head.y >= BOARD_HEIGHT) {
      return true;
    }
    
    // Self collision
    for (let i = 1; i < snakeBody.length; i++) {
      if (head.x === snakeBody[i].x && head.y === snakeBody[i].y) {
        return true;
      }
    }
    
    return false;
  };

  // Move snake
  const moveSnake = useCallback(() => {
    try {
      if (gameOver || isPaused || !gameStarted) {
        return;
      }

      const currentDirection = directionRef.current;
      if (currentDirection.x === 0 && currentDirection.y === 0) {
        return;
      }

      setSnake(currentSnake => {
        if (!currentSnake || currentSnake.length === 0) {
          return currentSnake;
        }

        const newSnake = [...currentSnake];
        const head = { ...newSnake[0] };
        
        // Move head in current direction
        head.x += currentDirection.x;
        head.y += currentDirection.y;
        
        // Check collision
        if (checkCollision(head, newSnake)) {
          setGameOver(true);
          return currentSnake;
        }
        
        newSnake.unshift(head);
        
        // Check if food is eaten
        if (food && head.x === food.x && head.y === food.y) {
          // Food eaten
          setScore(prev => prev + 10 * level);
          setFoodEaten(prev => {
            const newFoodEaten = prev + 1;
            
            // Check level progression (every 5 foods)
            const newLevel = Math.floor(newFoodEaten / 5) + 1;
            if (newLevel <= 4 && newLevel !== level) {
              setLevel(newLevel);
            }
            
            return newFoodEaten;
          });
          
          // Generate new food with random color
          try {
            const newFood = generateFood(newSnake);
            setFood(newFood);
            setFoodColor(FOOD_COLORS[Math.floor(Math.random() * FOOD_COLORS.length)]);
          } catch (error) {
            console.error('Error generating food:', error);
          }
        } else {
          // Remove tail if no food eaten
          newSnake.pop();
        }
        
        return newSnake;
      });
    } catch (error) {
      console.error('Error in moveSnake:', error);
    }
  }, [gameOver, isPaused, gameStarted, food, score, level, generateFood]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted || gameOver) return;
      
      const currentDirection = directionRef.current;
      let newDirection = null;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDirection.y === 0) {
            newDirection = { x: 0, y: -1 };
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDirection.y === 0) {
            newDirection = { x: 0, y: 1 };
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDirection.x === 0) {
            newDirection = { x: -1, y: 0 };
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDirection.x === 0) {
            newDirection = { x: 1, y: 0 };
          }
          break;
        case 'p':
        case 'P':
        case ' ':
          e.preventDefault();
          setIsPaused(prev => !prev);
          break;
      }
      
      if (newDirection) {
        e.preventDefault();
        setDirection(newDirection);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, gameOver]);

  // Game loop
  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused && (direction.x !== 0 || direction.y !== 0)) {
      const speed = LEVEL_SPEEDS[Math.min(level - 1, 3)];
      gameLoopRef.current = setInterval(moveSnake, speed);
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
  }, [gameStarted, gameOver, isPaused, level, direction, moveSnake]);

  // Start new game
  const startGame = () => {
    const initialSnake = [{ x: 10, y: 10 }];
    const initialFood = { x: 15, y: 15 };
    
    setSnake(initialSnake);
    setFood(initialFood);
    setDirection({ x: 1, y: 0 }); // Start moving right immediately
    setScore(0);
    setLevel(1);
    setFoodEaten(0);
    setGameOver(false);
    setIsPaused(false);
    setFoodColor('#FF5722');
    
    // Start game after a short delay
    setTimeout(() => {
      setGameStarted(true);
    }, 100);
  };

  // Handle direction change for touch controls
  const handleDirectionChange = (newDirection) => {
    if (!gameStarted || gameOver || isPaused) return;
    
    const currentDirection = directionRef.current;
    
    // Prevent reverse direction
    if (
      (newDirection.x === 1 && currentDirection.x === -1) ||
      (newDirection.x === -1 && currentDirection.x === 1) ||
      (newDirection.y === 1 && currentDirection.y === -1) ||
      (newDirection.y === -1 && currentDirection.y === 1)
    ) {
      return;
    }
    
    setDirection(newDirection);
  };

  // Render game board
  const renderBoard = () => {
    const board = [];
    
    // Debug logging
    console.log('Rendering board - Snake:', snake);
    console.log('Rendering board - Food:', food);
    console.log('Rendering board - Game started:', gameStarted);
    
    // Create empty board
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        let cellClass = 'board-cell';
        let cellStyle = {
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--bg-secondary)'
        };
        
        // Check if cell is snake
        const snakeIndex = snake.findIndex(segment => segment.x === x && segment.y === y);
        if (snakeIndex !== -1) {
          if (snakeIndex === 0) {
            // Head
            cellClass += ' snake-head';
            cellStyle.backgroundColor = SNAKE_COLORS.head;
            cellStyle.borderRadius = '40%';
            cellStyle.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
            cellStyle.transform = 'scale(1.1)';
          } else if (snakeIndex === snake.length - 1) {
            // Tail
            cellClass += ' snake-tail';
            cellStyle.backgroundColor = SNAKE_COLORS.tail;
            cellStyle.borderRadius = '20%';
            cellStyle.opacity = '0.8';
          } else {
            // Body
            cellClass += ' snake-body';
            cellStyle.backgroundColor = SNAKE_COLORS.body;
            cellStyle.borderRadius = '30%';
            cellStyle.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.2)';
          }
        } else if (food && food.x === x && food.y === y) {
          // Food
          cellClass += ' food';
          cellStyle.backgroundColor = foodColor;
          cellStyle.borderRadius = '50%';
          cellStyle.boxShadow = '0 0 8px rgba(255, 255, 255, 0.5)';
          cellStyle.animation = 'pulse 1s infinite';
        }
        
        board.push(
          <div
            key={`${x}-${y}`}
            className={cellClass}
            style={cellStyle}
          />
        );
      }
    }
    
    console.log('Board rendered with', board.length, 'cells');
    return board;
  };

  if (!gameStarted) {
    return (
      <div className="snake">
        <div className="game-start">
          <h3>🐍 Snake</h3>
          <p>{language === 'ro' ? 'Mănâncă boabele pentru a crește și evită coliziunile!' : 'Eat the food to grow and avoid collisions!'}</p>
          <div className="controls-info">
            <h4>{language === 'ro' ? 'Controale:' : 'Controls:'}</h4>
            <div className="controls-list">
              <div>↑↓←→ sau WASD {language === 'ro' ? 'Mișcare' : 'Move'}</div>
              <div>P sau Space {language === 'ro' ? 'Pauză' : 'Pause'}</div>
            </div>
          </div>
          <button onClick={startGame} className="start-button">
            {language === 'ro' ? 'Începe Jocul' : 'Start Game'}
          </button>
        </div>

        <style jsx>{`
          .snake {
            max-width: 600px;
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
            background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
          }

          .start-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="snake">
      <div className="game-header">
        <h3>🐍 Snake</h3>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">{language === 'ro' ? 'Scor:' : 'Score:'}</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">{language === 'ro' ? 'Nivel:' : 'Level:'}</span>
            <span className="stat-value">{level}/4</span>
          </div>
          <div className="stat">
            <span className="stat-label">{language === 'ro' ? 'Boabe:' : 'Food:'}</span>
            <span className="stat-value">{foodEaten}</span>
          </div>
        </div>
      </div>

      <div className="game-container">
        <div className="game-board">
          {renderBoard()}
        </div>

        {isPaused && !gameOver && (
          <div className="pause-overlay">
            <div className="pause-message">
              <h4>{language === 'ro' ? 'PAUZĂ' : 'PAUSED'}</h4>
              <p>{language === 'ro' ? 'Pentru a continua, apasă P sau Space' : 'Press P or Space to continue'}</p>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="game-over-overlay">
            <div className="game-over-message">
              <h4>{language === 'ro' ? 'JOC TERMINAT' : 'GAME OVER'}</h4>
              <p>{language === 'ro' ? 'Scor final:' : 'Final Score:'} {score}</p>
              <p>{language === 'ro' ? 'Boabe mâncate:' : 'Food eaten:'} {foodEaten}</p>
              <button onClick={startGame} className="restart-button">
                {language === 'ro' ? 'Joc Nou' : 'New Game'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="controls">
        <div className="direction-controls">
          <button onClick={() => handleDirectionChange({ x: 0, y: -1 })} className="control-button up">↑</button>
          <div className="middle-row">
            <button onClick={() => handleDirectionChange({ x: -1, y: 0 })} className="control-button left">←</button>
            <button onClick={() => setIsPaused(!isPaused)} className="control-button pause">
              {isPaused ? '▶' : '⏸'}
            </button>
            <button onClick={() => handleDirectionChange({ x: 1, y: 0 })} className="control-button right">→</button>
          </div>
          <button onClick={() => handleDirectionChange({ x: 0, y: 1 })} className="control-button down">↓</button>
        </div>
      </div>

      <style jsx>{`
        .snake {
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
          color: #4CAF50;
        }

        .game-container {
          position: relative;
          display: inline-block;
          margin: 0 auto;
        }

        .game-board {
          display: grid;
          grid-template-columns: repeat(20, 1fr);
          grid-template-rows: repeat(20, 1fr);
          gap: 1px;
          background: var(--bg-tertiary);
          padding: 8px;
          border: 3px solid var(--border-color);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          width: 500px;
          height: 500px;
          margin: 0 auto;
        }

        .board-cell {
          background: var(--bg-secondary);
          border-radius: 2px;
          transition: all 0.2s ease;
          width: 100%;
          height: 100%;
        }

        .snake-head {
          border-radius: 40%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          transform: scale(1.1);
        }

        .snake-body {
          border-radius: 30%;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .snake-tail {
          border-radius: 20%;
          opacity: 0.8;
        }

        .food {
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
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
          border-radius: 12px;
        }

        .pause-message, .game-over-message {
          text-align: center;
          color: white;
          background: var(--bg-primary);
          padding: 2rem;
          border-radius: 12px;
          border: 2px solid #4CAF50;
        }

        .pause-message h4, .game-over-message h4 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
          color: #4CAF50;
        }

        .game-over-message p {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
        }

        .restart-button {
          background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
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
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
        }

        .controls {
          display: flex;
          justify-content: center;
          margin-top: 1.5rem;
        }

        .direction-controls {
          display: grid;
          grid-template-columns: repeat(3, 60px);
          grid-template-rows: repeat(3, 60px);
          gap: 8px;
        }

        .control-button {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          color: var(--text-primary);
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.5rem;
          font-weight: 600;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .control-button:hover {
          background: var(--bg-tertiary);
          border-color: #4CAF50;
          transform: translateY(-2px);
        }

        .control-button.up {
          grid-column: 2;
          grid-row: 1;
        }

        .control-button.left {
          grid-column: 1;
          grid-row: 2;
        }

        .control-button.pause {
          grid-column: 2;
          grid-row: 2;
          background: #4CAF50;
          color: white;
          border-color: #4CAF50;
        }

        .control-button.right {
          grid-column: 3;
          grid-row: 2;
        }

        .control-button.down {
          grid-column: 2;
          grid-row: 3;
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
            padding: 4px;
            max-width: 350px;
          }

          .direction-controls {
            grid-template-columns: repeat(3, 50px);
            grid-template-rows: repeat(3, 50px);
            gap: 6px;
          }

          .control-button {
            font-size: 1.2rem;
          }
        }

        @media (max-width: 400px) {
          .game-board {
            max-width: 300px;
          }

          .direction-controls {
            grid-template-columns: repeat(3, 45px);
            grid-template-rows: repeat(3, 45px);
            gap: 4px;
          }

          .control-button {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Snake;
