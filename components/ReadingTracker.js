import { useState, useEffect } from 'react';
import readingService from '../lib/readingService';
import { useTranslation } from '../contexts/LanguageContext';

const ReadingTracker = () => {
  const { t } = useTranslation();
  const [books, setBooks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [goals, setGoals] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [activeTab, setActiveTab] = useState('books'); // books, sessions, notes, goals, stats
  const [bookFilter, setBookFilter] = useState('all'); // all, reading, completed, paused, abandoned
  const [showAddBookForm, setShowAddBookForm] = useState(false);
  const [showAddSessionForm, setShowAddSessionForm] = useState(false);
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Form states
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: 'Fiction',
    totalPages: 0,
    currentPage: 0,
    coverImage: '',
    description: '',
    status: 'reading',
    rating: 0,
    tags: []
  });

  const [newSession, setNewSession] = useState({
    bookId: '',
    startPage: 0,
    endPage: 0,
    notes: '',
    location: '',
    mood: 'neutral'
  });

  const [newNote, setNewNote] = useState({
    bookId: '',
    content: '',
    pageNumber: 0,
    chapter: '',
    type: 'note',
    tags: [],
    isFavorite: false
  });

  const genres = [
    'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Thriller',
    'Romance', 'Biography', 'History', 'Self-Help', 'Business', 'Technology',
    'Philosophy', 'Poetry', 'Drama', 'Horror', 'Young Adult', 'Children'
  ];

  const moodOptions = [
    { value: 'focused', label: '🎯 Focused' },
    { value: 'relaxed', label: '😌 Relaxed' },
    { value: 'tired', label: '😴 Tired' },
    { value: 'neutral', label: '😐 Neutral' }
  ];

  const noteTypes = [
    { value: 'note', label: '📝 Note' },
    { value: 'quote', label: '💬 Quote' },
    { value: 'question', label: '❓ Question' },
    { value: 'insight', label: '💡 Insight' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (currentSession) {
      const interval = setInterval(() => {
        setCurrentSession(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - sessionStartTime) / 60000)
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentSession, sessionStartTime]);

  const loadData = () => {
    setBooks(readingService.getBooks());
    setSessions(readingService.getSessions());
    setNotes(readingService.getNotes());
    setGoals(readingService.getGoals());
    setStatistics(readingService.getReadingStatistics());
  };

  const handleAddBook = () => {
    if (!newBook.title.trim()) return;

    if (editingBook) {
      readingService.updateBook(editingBook.id, newBook);
      setEditingBook(null);
    } else {
      readingService.addBook(newBook);
    }

    setNewBook({
      title: '',
      author: '',
      isbn: '',
      genre: 'Fiction',
      totalPages: 0,
      currentPage: 0,
      coverImage: '',
      description: '',
      status: 'reading',
      rating: 0,
      tags: []
    });
    setShowAddBookForm(false);
    loadData();
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setNewBook({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      totalPages: book.totalPages,
      currentPage: book.currentPage,
      coverImage: book.coverImage,
      description: book.description,
      status: book.status,
      rating: book.rating,
      tags: book.tags
    });
    setShowAddBookForm(true);
  };

  const handleDeleteBook = (bookId) => {
    if (confirm('Are you sure you want to delete this book and all related data?')) {
      readingService.deleteBook(bookId);
      loadData();
    }
  };

  const handleStartSession = (bookId) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    setCurrentSession({
      id: Date.now().toString(),
      bookId,
      startTime: new Date().toISOString(),
      startPage: book.currentPage,
      duration: 0
    });
    setSessionStartTime(Date.now());
    setNewSession({
      ...newSession,
      bookId,
      startPage: book.currentPage
    });
  };

  const handleEndSession = () => {
    if (!currentSession) return;

    const endSession = {
      ...currentSession,
      endTime: new Date().toISOString(),
      duration: Math.floor((Date.now() - sessionStartTime) / 60000),
      endPage: newSession.endPage,
      pagesRead: newSession.endPage - currentSession.startPage,
      notes: newSession.notes,
      location: newSession.location,
      mood: newSession.mood
    };

    readingService.addSession(endSession);
    setCurrentSession(null);
    setSessionStartTime(null);
    setNewSession({
      bookId: '',
      startPage: 0,
      endPage: 0,
      notes: '',
      location: '',
      mood: 'neutral'
    });
    setShowAddSessionForm(false);
    loadData();
  };

  const handleAddNote = () => {
    if (!newNote.content.trim()) return;

    readingService.addNote(newNote);
    setNewNote({
      bookId: '',
      content: '',
      pageNumber: 0,
      chapter: '',
      type: 'note',
      tags: [],
      isFavorite: false
    });
    setShowAddNoteForm(false);
    loadData();
  };

  const getBookProgress = (book) => {
    if (book.totalPages === 0) return 0;
    return Math.round((book.currentPage / book.totalPages) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reading': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'paused': return '#F59E0B';
      case 'abandoned': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getFilteredBooks = () => {
    return books.filter(book => {
      if (bookFilter === 'all') return true;
      return book.status === bookFilter;
    });
  };

  const handleFilterChange = (filter) => {
    setBookFilter(filter);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const renderBookCard = (book) => {
    const progress = getBookProgress(book);
    const bookSessions = sessions.filter(s => s.bookId === book.id);
    const bookNotes = notes.filter(n => n.bookId === book.id);

    return (
      <div key={book.id} className="book-card">
        <div className="book-header">
          <div className="book-info">
            <div className="book-cover" style={{ backgroundColor: getStatusColor(book.status) }}>
              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title} />
              ) : (
                <div className="book-cover-placeholder">📚</div>
              )}
            </div>
            <div className="book-details">
              <h3>{book.title}</h3>
              <p className="book-author">by {book.author}</p>
              <div className="book-meta">
                <span className="book-genre">{book.genre}</span>
              <span className="book-status" style={{ color: getStatusColor(book.status) }}>
                {t(`reading.statusOptions.${book.status.toLowerCase()}`, book.status)}
              </span>
              </div>
            </div>
          </div>
          <div className="book-actions">
            {currentSession?.bookId === book.id ? (
              <button className="end-session-btn" onClick={handleEndSession}>
                ⏹️ End Session
              </button>
            ) : (
              <button className="start-session-btn" onClick={() => handleStartSession(book.id)}>
                ▶️ Start Reading
              </button>
            )}
            <button className="edit-btn" onClick={() => handleEditBook(book)}>
              ✏️
            </button>
            <button className="delete-btn" onClick={() => handleDeleteBook(book.id)}>
              🗑️
            </button>
          </div>
        </div>

        <div className="book-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%`, backgroundColor: getStatusColor(book.status) }}
            />
          </div>
          <div className="progress-text">
            {book.currentPage} / {book.totalPages} pages ({progress}%)
          </div>
        </div>

        <div className="book-stats">
          <div className="stat">
            <span className="label">Sessions</span>
            <span className="value">{bookSessions.length}</span>
          </div>
          <div className="stat">
            <span className="label">Notes</span>
            <span className="value">{bookNotes.length}</span>
          </div>
          {book.rating > 0 && (
            <div className="stat">
              <span className="label">Rating</span>
              <span className="value">⭐ {book.rating}</span>
            </div>
          )}
        </div>

        {currentSession?.bookId === book.id && (
          <div className="active-session">
            <div className="session-timer">
              ⏱️ {formatDuration(currentSession.duration)}
            </div>
            <div className="session-info">
              Reading since {new Date(currentSession.startTime).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSessionCard = (session) => {
    const book = books.find(b => b.id === session.bookId);
    if (!book) return null;

    return (
      <div key={session.id} className="session-card">
        <div className="session-header">
          <div className="session-book">
            <h4>{book.title}</h4>
            <p className="session-date">
              {new Date(session.startTime).toLocaleDateString()} at {new Date(session.startTime).toLocaleTimeString()}
            </p>
          </div>
          <div className="session-duration">
            ⏱️ {formatDuration(session.duration)}
          </div>
        </div>

        <div className="session-details">
          <div className="session-pages">
            <span>Page {session.startPage} → {session.endPage}</span>
            <span className="pages-read">+{session.pagesRead} pages</span>
          </div>
          
          {session.location && (
            <div className="session-location">
              📍 {session.location}
            </div>
          )}
          
          <div className="session-mood">
            Mood: {moodOptions.find(m => m.value === session.mood)?.label}
          </div>
        </div>

        {session.notes && (
          <div className="session-notes">
            <p>{session.notes}</p>
          </div>
        )}

        <div className="session-actions">
          <button className="edit-btn" onClick={() => {/* Handle edit */}}>
            ✏️
          </button>
          <button className="delete-btn" onClick={() => readingService.deleteSession(session.id)}>
            🗑️
          </button>
        </div>
      </div>
    );
  };

  const renderNoteCard = (note) => {
    const book = books.find(b => b.id === note.bookId);
    if (!book) return null;

    return (
      <div key={note.id} className={`note-card ${note.isFavorite ? 'favorite' : ''}`}>
        <div className="note-header">
          <div className="note-book">
            <h4>{book.title}</h4>
            <div className="note-meta">
              <span className="note-type">
                {noteTypes.find(t => t.value === note.type)?.label}
              </span>
              {note.pageNumber > 0 && (
                <span className="note-page">Page {note.pageNumber}</span>
              )}
              {note.chapter && (
                <span className="note-chapter">Chapter {note.chapter}</span>
              )}
            </div>
          </div>
          <div className="note-actions">
            <button 
              className={`favorite-btn ${note.isFavorite ? 'active' : ''}`}
              onClick={() => readingService.updateNote(note.id, { isFavorite: !note.isFavorite })}
            >
              {note.isFavorite ? '⭐' : '☆'}
            </button>
            <button className="edit-btn" onClick={() => {/* Handle edit */}}>
              ✏️
            </button>
            <button className="delete-btn" onClick={() => readingService.deleteNote(note.id)}>
              🗑️
            </button>
          </div>
        </div>

        <div className="note-content">
          <p>{note.content}</p>
        </div>

        <div className="note-footer">
          <span className="note-date">
            {new Date(note.createdAt).toLocaleDateString()}
          </span>
          {note.tags.length > 0 && (
            <div className="note-tags">
              {note.tags.map((tag, index) => (
                <span key={index} className="tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGoalCard = (goal) => {
    const progressPercentage = goal.target > 0 ? Math.round((goal.progress / goal.target) * 100) : 0;
    
    return (
      <div key={goal.id} className="goal-card">
        <div className="goal-header">
          <div className="goal-info">
            <h3>
              {goal.type === 'books' ? '📚' : goal.type === 'pages' ? '📄' : '⏱️'} 
              {' '}{goal.target} {goal.type}
            </h3>
            <p className="goal-period">
              {goal.period.charAt(0).toUpperCase() + goal.period.slice(1)}
            </p>
          </div>
          <div className="goal-actions">
            <button className="edit-btn" onClick={() => {/* Handle edit */}}>
              ✏️
            </button>
            <button className="delete-btn" onClick={() => readingService.deleteGoal(goal.id)}>
              🗑️
            </button>
          </div>
        </div>

        <div className="goal-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="progress-text">
            {goal.progress} / {goal.target} ({progressPercentage}%)
          </div>
        </div>

        <div className="goal-dates">
          <span>Start: {new Date(goal.startDate).toLocaleDateString()}</span>
          <span>End: {new Date(goal.endDate).toLocaleDateString()}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="reading-tracker">
      <div className="tracker-header">
        <h2>📚 {t('reading.title')}</h2>
        <div className="header-actions">
          <button
            onClick={() => setShowAddBookForm(true)}
            className="add-book-btn"
          >
            + {t('reading.addBook')}
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      {statistics && (
        <div className="stats-overview">
          <div className="stat-card">
            <h3>{t('reading.totalBooks')}</h3>
            <div className="stat-value">{statistics.totalBooks}</div>
            <p>{t('reading.inYourLibrary')}</p>
          </div>
          <div className="stat-card">
            <h3>{t('reading.completed')}</h3>
            <div className="stat-value">{statistics.completedBooks}</div>
            <p>{t('reading.booksFinished')}</p>
          </div>
          <div className="stat-card">
            <h3>{t('reading.readingTime')}</h3>
            <div className="stat-value">{formatDuration(statistics.totalReadingTime)}</div>
            <p>{t('reading.totalTime')}</p>
          </div>
          <div className="stat-card">
            <h3>{t('reading.currentStreak')}</h3>
            <div className="stat-value">{statistics.readingStreak} 🔥</div>
            <p>{t('reading.daysInARow')}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => setActiveTab('books')}
        >
          📚 {t('reading.books')} ({books.length})
        </button>
        <button
          className={`tab ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          ⏱️ {t('reading.sessions')} ({sessions.length})
        </button>
        <button
          className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          📝 {t('reading.notes')} ({notes.length})
        </button>
        <button
          className={`tab ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          🎯 {t('reading.goals')} ({goals.filter(g => g.isActive).length})
        </button>
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 {t('reading.statistics')}
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'books' && (
          <div className="books-section">
            <div className="section-header">
              <h3>{t('reading.yourBooks')}</h3>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${bookFilter === 'all' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('all')}
                >
                  {t('reading.all')}
                </button>
                <button 
                  className={`filter-btn ${bookFilter === 'reading' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('reading')}
                >
                  {t('reading.reading')}
                </button>
                <button 
                  className={`filter-btn ${bookFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('completed')}
                >
                  {t('reading.completed')}
                </button>
                <button 
                  className={`filter-btn ${bookFilter === 'paused' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('paused')}
                >
                  {t('reading.paused')}
                </button>
              </div>
            </div>
            {getFilteredBooks().length === 0 ? (
              <div className="empty-state">
                <p>{t('reading.noBooksFound')}</p>
              </div>
            ) : (
              <div className="books-grid">
                {getFilteredBooks().map(renderBookCard)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="sessions-section">
            <div className="section-header">
              <h3>{t('reading.readingSessions')}</h3>
              <button
                onClick={() => setShowAddSessionForm(true)}
                className="add-session-btn"
              >
                + {t('reading.addSession')}
              </button>
            </div>
            {sessions.length === 0 ? (
              <div className="empty-state">
                <p>{t('reading.noSessionsFound')}</p>
              </div>
            ) : (
              <div className="sessions-list">
                {sessions.map(renderSessionCard)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="notes-section">
            <div className="section-header">
              <h3>{t('reading.readingNotes')}</h3>
              <button
                onClick={() => setShowAddNoteForm(true)}
                className="add-note-btn"
              >
                + {t('reading.addNote')}
              </button>
            </div>
            {notes.length === 0 ? (
              <div className="empty-state">
                <p>{t('reading.noNotesFound')}</p>
              </div>
            ) : (
              <div className="notes-list">
                {notes.map(renderNoteCard)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="goals-section">
            <div className="section-header">
              <h3>{t('reading.readingGoals')}</h3>
              <button
                onClick={() => {/* Handle add goal */}}
                className="add-goal-btn"
              >
                + {t('reading.addGoal')}
              </button>
            </div>
            <div className="goals-list">
              {goals.filter(g => g.isActive).map(renderGoalCard)}
            </div>
          </div>
        )}

        {activeTab === 'stats' && statistics && (
          <div className="stats-section">
            <h3>{t('reading.readingStatistics')}</h3>
            <div className="detailed-stats">
              <div className="stats-grid">
                <div className="stat-item">
                  <h4>Currently Reading</h4>
                  <p>{statistics.currentlyReading} books</p>
                </div>
                <div className="stat-item">
                  <h4>Total Pages Read</h4>
                  <p>{statistics.totalPagesRead.toLocaleString()} pages</p>
                </div>
                <div className="stat-item">
                  <h4>Average Session</h4>
                  <p>{formatDuration(Math.round(statistics.averageSessionTime))}</p>
                </div>
                <div className="stat-item">
                  <h4>Total Notes</h4>
                  <p>{statistics.totalNotes} notes ({statistics.favoriteNotes} favorites)</p>
                </div>
                <div className="stat-item">
                  <h4>This Month</h4>
                  <p>{formatDuration(statistics.currentMonthReadingTime)} reading time</p>
                </div>
                <div className="stat-item">
                  <h4>Books This Month</h4>
                  <p>{statistics.currentMonthBooksCompleted} completed</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Book Modal */}
      {showAddBookForm && (
        <div className="modal-overlay" onClick={() => setShowAddBookForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingBook ? t('reading.editBook') : t('reading.addNewBook')}</h3>
            
            <div className="form-group">
              <label>{t('reading.titleRequired')}</label>
              <input
                type="text"
                value={newBook.title}
                onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                placeholder={t('reading.bookTitlePlaceholder')}
              />
            </div>

            <div className="form-group">
              <label>{t('reading.authorPlaceholder')}</label>
              <input
                type="text"
                value={newBook.author}
                onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                placeholder={t('reading.authorPlaceholder')}
              />
            </div>

            <div className="form-row">
            <div className="form-group">
              <label>{t('reading.genre')}</label>
              <select
                value={newBook.genre}
                onChange={(e) => setNewBook({...newBook, genre: e.target.value})}
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t('reading.status')}</label>
              <select
                value={newBook.status}
                onChange={(e) => setNewBook({...newBook, status: e.target.value})}
              >
                <option value="reading">{t('reading.statusOptions.reading')}</option>
                <option value="completed">{t('reading.statusOptions.completed')}</option>
                <option value="paused">{t('reading.statusOptions.paused')}</option>
                <option value="abandoned">{t('reading.statusOptions.abandoned')}</option>
              </select>
            </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('reading.totalPagesLabel')}</label>
                <input
                  type="number"
                  value={newBook.totalPages}
                  onChange={(e) => setNewBook({...newBook, totalPages: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label>{t('reading.currentPageLabel')}</label>
                <input
                  type="number"
                  value={newBook.currentPage}
                  onChange={(e) => setNewBook({...newBook, currentPage: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('reading.description')}</label>
              <textarea
                value={newBook.description}
                onChange={(e) => setNewBook({...newBook, description: e.target.value})}
                placeholder={t('reading.description')}
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button onClick={() => setShowAddBookForm(false)}>{t('common.cancel')}</button>
              <button onClick={handleAddBook} disabled={!newBook.title.trim()}>
                {editingBook ? t('common.update') : t('common.add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      {showAddSessionForm && (
        <div className="modal-overlay" onClick={() => setShowAddSessionForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t('reading.addSession')}</h3>
            
            <div className="form-group">
              <label>{t('reading.book')} *</label>
              <select
                value={newSession.bookId}
                onChange={(e) => setNewSession({...newSession, bookId: e.target.value})}
              >
                <option value="">{t('reading.selectBook')}</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>{book.title}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('reading.startPage')}</label>
                <input
                  type="number"
                  value={newSession.startPage}
                  onChange={(e) => setNewSession({...newSession, startPage: parseInt(e.target.value) || 0})}
                />
              </div>

              <div className="form-group">
                <label>{t('reading.endPage')}</label>
                <input
                  type="number"
                  value={newSession.endPage}
                  onChange={(e) => setNewSession({...newSession, endPage: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('reading.location')}</label>
              <input
                type="text"
                value={newSession.location}
                onChange={(e) => setNewSession({...newSession, location: e.target.value})}
                placeholder={t('reading.locationPlaceholder')}
              />
            </div>

            <div className="form-group">
              <label>{t('reading.mood')}</label>
              <select
                value={newSession.mood}
                onChange={(e) => setNewSession({...newSession, mood: e.target.value})}
              >
                {moodOptions.map(mood => (
                  <option key={mood.value} value={mood.value}>{t(`reading.moodOptions.${mood.value}`)}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t('reading.notes')}</label>
              <textarea
                value={newSession.notes}
                onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                placeholder={t('reading.sessionNotesPlaceholder')}
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button onClick={() => setShowAddSessionForm(false)}>{t('common.cancel')}</button>
              <button onClick={() => {/* Handle add session */}} disabled={!newSession.bookId}>
                {t('reading.addSession')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showAddNoteForm && (
        <div className="modal-overlay" onClick={() => setShowAddNoteForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t('reading.addNote')}</h3>
            
            <div className="form-group">
              <label>{t('reading.book')} *</label>
              <select
                value={newNote.bookId}
                onChange={(e) => setNewNote({...newNote, bookId: e.target.value})}
              >
                <option value="">{t('reading.selectBook')}</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>{book.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t('reading.noteContent')} *</label>
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                placeholder={t('reading.notePlaceholder')}
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('reading.type')}</label>
                <select
                  value={newNote.type}
                  onChange={(e) => setNewNote({...newNote, type: e.target.value})}
                >
                  {noteTypes.map(type => (
                    <option key={type.value} value={type.value}>{t(`reading.noteTypes.${type.value}`)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('reading.pageNumber')}</label>
                <input
                  type="number"
                  value={newNote.pageNumber}
                  onChange={(e) => setNewNote({...newNote, pageNumber: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('reading.chapter')}</label>
              <input
                type="text"
                value={newNote.chapter}
                onChange={(e) => setNewNote({...newNote, chapter: e.target.value})}
                placeholder={t('reading.chapterPlaceholder')}
              />
            </div>

            <div className="form-actions">
              <button onClick={() => setShowAddNoteForm(false)}>{t('common.cancel')}</button>
              <button onClick={handleAddNote} disabled={!newNote.content.trim()}>
                {t('reading.addNote')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .reading-tracker {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .tracker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          background: linear-gradient(135deg, #10B981, #059669);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .tracker-header h2 {
          margin: 0;
          color: white;
          font-size: 1.8rem;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .add-book-btn {
          background: white;
          color: #10B981;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .add-book-btn:hover {
          background: #f0fdf4;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
        }

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: var(--bg-secondary);
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid var(--border-color);
        }

        .stat-card h3 {
          margin: 0 0 10px 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: var(--accent-color);
          margin-bottom: 5px;
        }

        .stat-card p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .tabs {
          display: flex;
          gap: 5px;
          margin-bottom: 30px;
          border-bottom: 2px solid var(--border-color);
        }

        .tab {
          background: transparent;
          border: none;
          padding: 12px 20px;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--text-secondary);
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .tab:hover {
          color: var(--text-primary);
        }

        .tab.active {
          color: var(--accent-color);
          border-bottom-color: var(--accent-color);
        }

        .tab-content {
          min-height: 400px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .filter-buttons {
          display: flex;
          gap: 5px;
        }

        .filter-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          color: var(--text-primary);
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
          transform: translateY(-1px);
        }

        .filter-btn.active {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
          font-weight: 600;
        }

        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .book-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .book-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .book-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .book-info {
          display: flex;
          gap: 15px;
          flex: 1;
        }

        .book-cover {
          width: 60px;
          height: 80px;
          border-radius: 4px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .book-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .book-cover-placeholder {
          font-size: 24px;
          color: var(--text-secondary);
        }

        .book-details {
          flex: 1;
        }

        .book-details h3 {
          margin: 0 0 5px 0;
          color: var(--text-primary);
          font-size: 1.1rem;
        }

        .book-author {
          margin: 0 0 8px 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .book-meta {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .book-genre {
          background: var(--bg-primary);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .book-status {
          font-size: 0.8rem;
          font-weight: 500;
        }

        .book-actions {
          display: flex;
          gap: 8px;
        }

        .start-session-btn, .end-session-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
        }

        .end-session-btn {
          background: #ef4444;
        }

        .edit-btn, .delete-btn {
          width: 32px;
          height: 32px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .edit-btn:hover {
          border-color: var(--accent-color);
          color: var(--accent-color);
        }

        .delete-btn:hover {
          border-color: #ef4444;
          color: #ef4444;
        }

        .book-progress {
          margin-bottom: 15px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--bg-primary);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 5px;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .book-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 15px;
        }

        .stat {
          text-align: center;
          padding: 8px;
          background: var(--bg-primary);
          border-radius: 6px;
        }

        .stat .label {
          display: block;
          font-size: 0.7rem;
          color: var(--text-secondary);
          margin-bottom: 2px;
        }

        .stat .value {
          font-weight: bold;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .active-session {
          background: linear-gradient(135deg, var(--accent-color), #8b9dc3);
          color: white;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
        }

        .session-timer {
          font-size: 1.2rem;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .session-info {
          font-size: 0.8rem;
          opacity: 0.9;
        }

        .sessions-list, .notes-list, .goals-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .session-card, .note-card, .goal-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .session-card:hover, .note-card:hover, .goal-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .note-card.favorite {
          border-left: 4px solid #f59e0b;
        }

        .session-header, .note-header, .goal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .session-book h4, .note-book h4 {
          margin: 0 0 5px 0;
          color: var(--text-primary);
        }

        .session-date, .note-date {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .session-duration {
          font-size: 0.9rem;
          color: var(--accent-color);
          font-weight: bold;
        }

        .session-details {
          margin-bottom: 15px;
        }

        .session-pages {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .pages-read {
          color: var(--accent-color);
          font-weight: bold;
        }

        .session-location, .session-mood {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 5px;
        }

        .session-notes {
          background: var(--bg-primary);
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 15px;
        }

        .session-notes p {
          margin: 0;
          font-style: italic;
          color: var(--text-secondary);
        }

        .note-meta {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 10px;
        }

        .note-type, .note-page, .note-chapter {
          background: var(--bg-primary);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        .note-content {
          background: var(--bg-primary);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        .note-content p {
          margin: 0;
          line-height: 1.6;
        }

        .note-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .note-tags {
          display: flex;
          gap: 5px;
        }

        .tag {
          background: var(--accent-color);
          color: white;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 0.7rem;
        }

        .favorite-btn {
          width: 32px;
          height: 32px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: transparent;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .favorite-btn.active {
          color: #f59e0b;
          border-color: #f59e0b;
        }

        .goal-info h3 {
          margin: 0 0 5px 0;
          color: var(--text-primary);
        }

        .goal-period {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .goal-progress {
          margin-bottom: 15px;
        }

        .goal-dates {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .detailed-stats {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat-item h4 {
          margin: 0 0 10px 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .stat-item p {
          margin: 0;
          font-size: 1.2rem;
          font-weight: bold;
          color: var(--accent-color);
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: var(--text-secondary);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: var(--bg-primary);
          border-radius: 12px;
          padding: 30px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .modal-content h3 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .form-group textarea {
          resize: vertical;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .form-actions button {
          padding: 10px 20px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          cursor: pointer;
        }

        .form-actions button:last-child {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
        }

        .form-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .tracker-header {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
          }

          .stats-overview {
            grid-template-columns: repeat(2, 1fr);
          }

          .books-grid {
            grid-template-columns: 1fr;
          }

          .book-info {
            flex-direction: column;
            gap: 10px;
          }

          .book-actions {
            flex-wrap: wrap;
          }

          .tabs {
            flex-wrap: wrap;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ReadingTracker;
