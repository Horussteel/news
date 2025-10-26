import { useState, useEffect } from 'react';

const QuizMaster = ({ onGameEnd, language }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [answers, setAnswers] = useState([]);

  // Questions in both languages
  const questions = {
    ro: [
      {
        question: "Care este capitala României?",
        options: ["București", "Cluj-Napoca", "Iași", "Timișoara"],
        correct: 0
      },
      {
        question: "Câți ani are un an bisect?",
        options: ["364", "365", "366", "367"],
        correct: 2
      },
      {
        question: "Ce planetă este cea mai apropiată de Soare?",
        options: ["Venus", "Pământ", "Marte", "Mercur"],
        correct: 3
      },
      {
        question: "Cine a pictat Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        correct: 2
      },
      {
        question: "Care este cel mai mare ocean de pe Pământ?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correct: 3
      }
    ],
    en: [
      {
        question: "What is the capital of Romania?",
        options: ["Bucharest", "Cluj-Napoca", "Iași", "Timișoara"],
        correct: 0
      },
      {
        question: "How many days are in a leap year?",
        options: ["364", "365", "366", "367"],
        correct: 2
      },
      {
        question: "Which planet is closest to the Sun?",
        options: ["Venus", "Earth", "Mars", "Mercury"],
        correct: 3
      },
      {
        question: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        correct: 2
      },
      {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correct: 3
      }
    ]
  };

  const currentQuestions = questions[language] || questions.ro;
  const currentQuestion = currentQuestions[currentQuestionIndex];

  const initializeGame = () => {
    setGameStarted(true);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameCompleted(false);
    setAnswers([]);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (showResult || gameCompleted) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === currentQuestion.correct;
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setAnswers([...answers, {
      questionIndex: currentQuestionIndex,
      selectedAnswer: answerIndex,
      correct: currentQuestion.correct,
      isCorrect
    }]);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameCompleted(true);
    }
  };

  const calculateFinalScore = () => {
    const percentage = (score / currentQuestions.length) * 100;
    if (percentage >= 80) return 100;
    if (percentage >= 60) return 80;
    if (percentage >= 40) return 60;
    return 40;
  };

  const getScoreMessage = () => {
    const percentage = (score / currentQuestions.length) * 100;
    if (percentage >= 80) return language === 'ro' ? 'Excelent!' : 'Excellent!';
    if (percentage >= 60) return language === 'ro' ? 'Foarte bine!' : 'Very good!';
    if (percentage >= 40) return language === 'ro' ? 'Bine!' : 'Good!';
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
        <p>{language === 'ro' ? 'Se pregătește quiz-ul...' : 'Preparing quiz...'}</p>
      </div>
    );
  }

  if (gameCompleted) {
    const finalScore = calculateFinalScore();
    const percentage = Math.round((score / currentQuestions.length) * 100);
    
    return (
      <div className="quiz-completed">
        <div className="completion-header">
          <h3>🎉 {language === 'ro' ? 'Quiz Terminat!' : 'Quiz Completed!'}</h3>
          <div className="final-score">
            <div className="score-circle">
              <span className="score-number">{percentage}%</span>
            </div>
            <p className="score-details">
              {score} / {currentQuestions.length} {language === 'ro' ? 'răspunsuri corecte' : 'correct answers'}
            </p>
            <p className="score-message">{getScoreMessage()}</p>
          </div>
        </div>
        
        <div className="answers-review">
          <h4>{language === 'ro' ? 'Revizuire răspunsuri:' : 'Answers Review:'}</h4>
          <div className="answers-list">
            {answers.map((answer, index) => {
              const question = currentQuestions[answer.questionIndex];
              return (
                <div key={index} className={`answer-review ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="question-text">
                    <strong>{index + 1}.</strong> {question.question}
                  </div>
                  <div className="answer-details">
                    <div className="selected-answer">
                      {language === 'ro' ? 'Răspunsul tău:' : 'Your answer:'} {question.options[answer.selectedAnswer]}
                    </div>
                    <div className="correct-answer">
                      {language === 'ro' ? 'Răspuns corect:' : 'Correct answer:'} {question.options[answer.correct]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <button onClick={resetGame} className="restart-button">
          {language === 'ro' ? 'Joc nou' : 'New Game'}
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-master">
      <div className="quiz-header">
        <h3>{language === 'ro' ? 'Maestrul Quiz' : 'Quiz Master'}</h3>
        <div className="quiz-progress">
          <span>{language === 'ro' ? 'Întrebare' : 'Question'} {currentQuestionIndex + 1} / {currentQuestions.length}</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="quiz-score">
          {language === 'ro' ? 'Scor:' : 'Score:'} {score}
        </div>
      </div>

      <div className="question-container">
        <div className="question-text">
          {currentQuestion.question}
        </div>
        
        <div className="options-grid">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={`option-button ${selectedAnswer === index ? 'selected' : ''} ${showResult ? (index === currentQuestion.correct ? 'correct' : 'incorrect') : ''}`}
              onClick={() => handleAnswerSelect(index)}
              disabled={showResult}
            >
              <span className="option-label">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>

        {showResult && (
          <div className="result-feedback">
            <div className={`feedback-message ${selectedAnswer === currentQuestion.correct ? 'correct' : 'incorrect'}`}>
              {selectedAnswer === currentQuestion.correct 
                ? (language === 'ro' ? '✅ Corect!' : '✅ Correct!')
                : (language === 'ro' ? '❌ Greșit!' : '❌ Incorrect!')
              }
            </div>
            <button onClick={nextQuestion} className="next-button">
              {currentQuestionIndex < currentQuestions.length - 1 
                ? (language === 'ro' ? 'Următoarea întrebare' : 'Next question')
                : (language === 'ro' ? 'Vezi rezultatele' : 'See results')
              }
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .quiz-master {
          max-width: 700px;
          margin: 0 auto;
          padding: 1rem;
        }

        .quiz-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .quiz-header h3 {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
          font-size: 1.8rem;
        }

        .quiz-progress {
          margin-bottom: 1rem;
        }

        .quiz-progress span {
          display: block;
          margin-bottom: 0.5rem;
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

        .quiz-score {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--accent-color);
        }

        .question-container {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 15px;
          padding: 2rem;
        }

        .question-text {
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2rem;
          text-align: center;
          line-height: 1.4;
        }

        .options-grid {
          display: grid;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .option-button {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 2px solid var(--border-color);
          border-radius: 10px;
          background: var(--bg-primary);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          width: 100%;
        }

        .option-button:hover:not(:disabled) {
          border-color: var(--accent-color);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .option-button.selected {
          border-color: var(--accent-color);
          background: rgba(102, 126, 234, 0.1);
        }

        .option-button.correct {
          border-color: #10B981;
          background: rgba(16, 185, 129, 0.1);
        }

        .option-button.incorrect {
          border-color: #EF4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .option-button:disabled {
          cursor: not-allowed;
        }

        .option-label {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--accent-color);
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .option-button.correct .option-label {
          background: #10B981;
        }

        .option-button.incorrect .option-label {
          background: #EF4444;
        }

        .option-text {
          flex: 1;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .result-feedback {
          text-align: center;
        }

        .feedback-message {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .feedback-message.correct {
          color: #10B981;
        }

        .feedback-message.incorrect {
          color: #EF4444;
        }

        .next-button {
          background: var(--accent-color);
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
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .quiz-completed {
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

        .final-score {
          margin-bottom: 2rem;
        }

        .score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .score-number {
          color: white;
          font-size: 2rem;
          font-weight: 700;
        }

        .score-details {
          color: var(--text-secondary);
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
        }

        .score-message {
          color: var(--accent-color);
          font-weight: 600;
          font-size: 1.2rem;
          margin: 0;
        }

        .answers-review {
          text-align: left;
          margin-bottom: 2rem;
        }

        .answers-review h4 {
          text-align: center;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .answers-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .answer-review {
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 10px;
          padding: 1rem;
        }

        .answer-review.correct {
          border-color: #10B981;
        }

        .answer-review.incorrect {
          border-color: #EF4444;
        }

        .question-text {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .answer-details {
          font-size: 0.9rem;
        }

        .selected-answer {
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }

        .correct-answer {
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

        @media (max-width: 480px) {
          .quiz-master {
            padding: 0.5rem;
          }

          .question-container {
            padding: 1.5rem;
          }

          .question-text {
            font-size: 1.1rem;
          }

          .option-button {
            padding: 0.8rem;
          }

          .score-circle {
            width: 100px;
            height: 100px;
          }

          .score-number {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default QuizMaster;
