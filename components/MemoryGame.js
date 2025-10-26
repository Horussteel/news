import { useState, useEffect } from 'react';

const MemoryGame = ({ onGameEnd, language }) => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  const symbols = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎬', '🎵', '🎸'];

  const initializeGame = () => {
    const gameCards = [];
    symbols.forEach((symbol, index) => {
      gameCards.push({ id: index * 2, symbol, matched: false });
      gameCards.push({ id: index * 2 + 1, symbol, matched: false });
    });
    
    // Shuffle cards
    const shuffled = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setGameStarted(true);
    setGameCompleted(false);
  };

  const handleCardClick = (cardId) => {
    if (!gameStarted || flippedCards.length === 2 || matchedCards.includes(cardId)) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);

      if (firstCard.symbol === secondCard.symbol) {
        // Match found
        setTimeout(() => {
          setMatchedCards([...matchedCards, first, second]);
          setFlippedCards([]);
          
          // Check if game is completed
          if (matchedCards.length + 2 === cards.length) {
            setGameCompleted(true);
            const score = Math.max(100 - moves * 2, 10);
            onGameEnd(score);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    initializeGame();
  }, []);

  if (!gameStarted || cards.length === 0) {
    return (
      <div className="game-loading">
        <p>{language === 'ro' ? 'Se pregătește jocul...' : 'Preparing game...'}</p>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div className="game-completed">
        <h3>🎉 {language === 'ro' ? 'Joc Terminat!' : 'Game Completed!'}</h3>
        <p>{language === 'ro' ? 'Mișcări:' : 'Moves:'} {moves}</p>
        <button onClick={initializeGame} className="restart-button">
          {language === 'ro' ? 'Joacă din nou' : 'Play Again'}
        </button>
      </div>
    );
  }

  return (
    <div className="memory-game">
      <div className="game-stats">
        <span>{language === 'ro' ? 'Mișcări:' : 'Moves:'} {moves}</span>
        <span>{language === 'ro' ? 'Perechi găsite:' : 'Pairs found:'} {matchedCards.length / 2}</span>
      </div>
      
      <div className="cards-grid">
        {cards.map(card => (
          <div
            key={card.id}
            className={`card ${flippedCards.includes(card.id) || matchedCards.includes(card.id) ? 'flipped' : ''} ${matchedCards.includes(card.id) ? 'matched' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="card-front">?</div>
            <div className="card-back">{card.symbol}</div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .memory-game {
          max-width: 600px;
          margin: 0 auto;
          padding: 1rem;
        }

        .game-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }

        .card {
          aspect-ratio: 1;
          cursor: pointer;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
          border-radius: 8px;
        }

        .card.flipped {
          transform: rotateY(180deg);
        }

        .card.matched {
          opacity: 0.7;
          cursor: default;
        }

        .card-front,
        .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          border-radius: 8px;
          border: 2px solid var(--border-color);
        }

        .card-front {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .card-back {
          background: var(--accent-color);
          color: white;
          transform: rotateY(180deg);
        }

        .game-completed {
          text-align: center;
          padding: 2rem;
        }

        .restart-button {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 1rem;
          font-weight: 600;
        }

        @media (max-width: 480px) {
          .cards-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          
          .card-front,
          .card-back {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MemoryGame;
