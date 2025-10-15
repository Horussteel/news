class ReadingService {
  constructor() {
    this.BOOKS_KEY = 'readingBooks';
    this.SESSIONS_KEY = 'readingSessions';
    this.NOTES_KEY = 'readingNotes';
    this.GOALS_KEY = 'readingGoals';
  }

  // Books operations
  getBooks() {
    try {
      const books = localStorage.getItem(this.BOOKS_KEY);
      return books ? JSON.parse(books) : this.getDefaultBooks();
    } catch (error) {
      console.error('Error getting books:', error);
      return this.getDefaultBooks();
    }
  }

  addBook(book) {
    try {
      const books = this.getBooks();
      const newBook = {
        id: Date.now().toString(),
        title: book.title,
        author: book.author || 'Unknown Author',
        isbn: book.isbn || '',
        genre: book.genre || 'Fiction',
        totalPages: book.totalPages || 0,
        currentPage: book.currentPage || 0,
        coverImage: book.coverImage || '',
        description: book.description || '',
        startDate: book.startDate || new Date().toISOString(),
        endDate: book.endDate || null,
        status: book.status || 'reading', // reading, completed, paused, abandoned
        rating: book.rating || 0,
        tags: book.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      books.unshift(newBook);
      localStorage.setItem(this.BOOKS_KEY, JSON.stringify(books));
      return newBook;
    } catch (error) {
      console.error('Error adding book:', error);
      return null;
    }
  }

  updateBook(id, updates) {
    try {
      const books = this.getBooks();
      const index = books.findIndex(book => book.id === id);
      if (index > -1) {
        books[index] = { 
          ...books[index], 
          ...updates, 
          updatedAt: new Date().toISOString() 
        };
        localStorage.setItem(this.BOOKS_KEY, JSON.stringify(books));
        return books[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating book:', error);
      return null;
    }
  }

  deleteBook(id) {
    try {
      const books = this.getBooks();
      const updatedBooks = books.filter(book => book.id !== id);
      localStorage.setItem(this.BOOKS_KEY, JSON.stringify(updatedBooks));
      
      // Also delete related sessions and notes
      this.deleteSessionsForBook(id);
      this.deleteNotesForBook(id);
      
      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      return false;
    }
  }

  // Reading sessions operations
  getSessions() {
    try {
      const sessions = localStorage.getItem(this.SESSIONS_KEY);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  }

  addSession(session) {
    try {
      const sessions = this.getSessions();
      const newSession = {
        id: Date.now().toString(),
        bookId: session.bookId,
        startTime: session.startTime || new Date().toISOString(),
        endTime: session.endTime || new Date().toISOString(),
        duration: session.duration || 0, // in minutes
        pagesRead: session.pagesRead || 0,
        startPage: session.startPage || 0,
        endPage: session.endPage || 0,
        notes: session.notes || '',
        location: session.location || '',
        mood: session.mood || 'neutral', // focused, relaxed, tired, neutral
        createdAt: new Date().toISOString()
      };
      
      sessions.unshift(newSession);
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
      
      // Update book progress
      this.updateBookProgress(session.bookId, session.endPage);
      
      return newSession;
    } catch (error) {
      console.error('Error adding session:', error);
      return null;
    }
  }

  updateSession(id, updates) {
    try {
      const sessions = this.getSessions();
      const index = sessions.findIndex(session => session.id === id);
      if (index > -1) {
        sessions[index] = { ...sessions[index], ...updates };
        localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
        return sessions[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating session:', error);
      return null;
    }
  }

  deleteSession(id) {
    try {
      const sessions = this.getSessions();
      const updatedSessions = sessions.filter(session => session.id !== id);
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(updatedSessions));
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  deleteSessionsForBook(bookId) {
    try {
      const sessions = this.getSessions();
      const updatedSessions = sessions.filter(session => session.bookId !== bookId);
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(updatedSessions));
      return true;
    } catch (error) {
      console.error('Error deleting sessions for book:', error);
      return false;
    }
  }

  // Notes operations
  getNotes() {
    try {
      const notes = localStorage.getItem(this.NOTES_KEY);
      return notes ? JSON.parse(notes) : [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  }

  addNote(note) {
    try {
      const notes = this.getNotes();
      const newNote = {
        id: Date.now().toString(),
        bookId: note.bookId,
        content: note.content || '',
        pageNumber: note.pageNumber || 0,
        chapter: note.chapter || '',
        type: note.type || 'note', // note, quote, question, insight
        tags: note.tags || [],
        isFavorite: note.isFavorite || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      notes.unshift(newNote);
      localStorage.setItem(this.NOTES_KEY, JSON.stringify(notes));
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      return null;
    }
  }

  updateNote(id, updates) {
    try {
      const notes = this.getNotes();
      const index = notes.findIndex(note => note.id === id);
      if (index > -1) {
        notes[index] = { 
          ...notes[index], 
          ...updates, 
          updatedAt: new Date().toISOString() 
        };
        localStorage.setItem(this.NOTES_KEY, JSON.stringify(notes));
        return notes[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating note:', error);
      return null;
    }
  }

  deleteNote(id) {
    try {
      const notes = this.getNotes();
      const updatedNotes = notes.filter(note => note.id !== id);
      localStorage.setItem(this.NOTES_KEY, JSON.stringify(updatedNotes));
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  }

  deleteNotesForBook(bookId) {
    try {
      const notes = this.getNotes();
      const updatedNotes = notes.filter(note => note.bookId !== bookId);
      localStorage.setItem(this.NOTES_KEY, JSON.stringify(updatedNotes));
      return true;
    } catch (error) {
      console.error('Error deleting notes for book:', error);
      return false;
    }
  }

  // Goals operations
  getGoals() {
    try {
      const goals = localStorage.getItem(this.GOALS_KEY);
      return goals ? JSON.parse(goals) : this.getDefaultGoals();
    } catch (error) {
      console.error('Error getting goals:', error);
      return this.getDefaultGoals();
    }
  }

  addGoal(goal) {
    try {
      const goals = this.getGoals();
      const newGoal = {
        id: Date.now().toString(),
        type: goal.type || 'books', // books, pages, time
        target: goal.target || 12, // number of books/pages/hours
        period: goal.period || 'year', // week, month, quarter, year
        startDate: goal.startDate || new Date().toISOString(),
        endDate: goal.endDate || this.calculateEndDate(goal.period),
        progress: goal.progress || 0,
        isActive: goal.isActive !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      goals.push(newGoal);
      localStorage.setItem(this.GOALS_KEY, JSON.stringify(goals));
      return newGoal;
    } catch (error) {
      console.error('Error adding goal:', error);
      return null;
    }
  }

  updateGoal(id, updates) {
    try {
      const goals = this.getGoals();
      const index = goals.findIndex(goal => goal.id === id);
      if (index > -1) {
        goals[index] = { 
          ...goals[index], 
          ...updates, 
          updatedAt: new Date().toISOString() 
        };
        localStorage.setItem(this.GOALS_KEY, JSON.stringify(goals));
        return goals[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating goal:', error);
      return null;
    }
  }

  deleteGoal(id) {
    try {
      const goals = this.getGoals();
      const updatedGoals = goals.filter(goal => goal.id !== id);
      localStorage.setItem(this.GOALS_KEY, JSON.stringify(updatedGoals));
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  }

  // Statistics
  getReadingStatistics() {
    try {
      const books = this.getBooks();
      const sessions = this.getSessions();
      const notes = this.getNotes();
      
      const totalBooks = books.length;
      const completedBooks = books.filter(book => book.status === 'completed').length;
      const currentlyReading = books.filter(book => book.status === 'reading').length;
      
      const totalPagesRead = books.reduce((sum, book) => sum + book.currentPage, 0);
      const totalPagesInBooks = books.reduce((sum, book) => sum + book.totalPages, 0);
      
      const totalReadingTime = sessions.reduce((sum, session) => sum + session.duration, 0);
      const averageSessionTime = sessions.length > 0 ? totalReadingTime / sessions.length : 0;
      
      const totalNotes = notes.length;
      const favoriteNotes = notes.filter(note => note.isFavorite).length;
      
      // Current month stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const currentMonthSessions = sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear;
      });
      
      const currentMonthReadingTime = currentMonthSessions.reduce((sum, session) => sum + session.duration, 0);
      const currentMonthBooksCompleted = books.filter(book => {
        if (!book.endDate) return false;
        const endDate = new Date(book.endDate);
        return endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear;
      }).length;
      
      return {
        totalBooks,
        completedBooks,
        currentlyReading,
        totalPagesRead,
        totalPagesInBooks,
        totalReadingTime,
        averageSessionTime,
        totalNotes,
        favoriteNotes,
        currentMonthReadingTime,
        currentMonthBooksCompleted,
        readingStreak: this.calculateReadingStreak(sessions)
      };
    } catch (error) {
      console.error('Error getting reading statistics:', error);
      return null;
    }
  }

  getBookProgress(bookId) {
    try {
      const book = this.getBooks().find(b => b.id === bookId);
      if (!book || book.totalPages === 0) return 0;
      
      return Math.round((book.currentPage / book.totalPages) * 100);
    } catch (error) {
      console.error('Error getting book progress:', error);
      return 0;
    }
  }

  // Helper methods
  updateBookProgress(bookId, newPage) {
    try {
      const book = this.getBooks().find(b => b.id === bookId);
      if (!book) return;
      
      const updates = { currentPage: newPage };
      
      // Check if book is completed
      if (newPage >= book.totalPages && book.status !== 'completed') {
        updates.status = 'completed';
        updates.endDate = new Date().toISOString();
      }
      
      this.updateBook(bookId, updates);
    } catch (error) {
      console.error('Error updating book progress:', error);
    }
  }

  calculateReadingStreak(sessions) {
    try {
      if (sessions.length === 0) return 0;
      
      const sortedSessions = sessions
        .map(session => new Date(session.startTime).toDateString())
        .filter((date, index, array) => array.indexOf(date) === index) // Remove duplicates
        .sort((a, b) => new Date(b) - new Date(a));
      
      let streak = 0;
      const today = new Date().toDateString();
      
      for (let i = 0; i < sortedSessions.length; i++) {
        const sessionDate = sortedSessions[i];
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (sessionDate === expectedDate.toDateString()) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }
      
      return streak;
    } catch (error) {
      console.error('Error calculating reading streak:', error);
      return 0;
    }
  }

  calculateEndDate(period) {
    try {
      const endDate = new Date();
      switch (period) {
        case 'week':
          endDate.setDate(endDate.getDate() + 7);
          break;
        case 'month':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'quarter':
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case 'year':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        default:
          endDate.setFullYear(endDate.getFullYear() + 1);
      }
      return endDate.toISOString();
    } catch (error) {
      console.error('Error calculating end date:', error);
      return new Date().toISOString();
    }
  }

  // Default data
  getDefaultBooks() {
    return [];
  }

  getDefaultGoals() {
    return [
      {
        id: '1',
        type: 'books',
        target: 12,
        period: 'year',
        startDate: new Date().toISOString(),
        endDate: this.calculateEndDate('year'),
        progress: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'pages',
        target: 6000,
        period: 'year',
        startDate: new Date().toISOString(),
        endDate: this.calculateEndDate('year'),
        progress: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // Export/Import
  exportReadingData() {
    try {
      const data = {
        books: this.getBooks(),
        sessions: this.getSessions(),
        notes: this.getNotes(),
        goals: this.getGoals(),
        exportedAt: new Date().toISOString()
      };
      return data;
    } catch (error) {
      console.error('Error exporting reading data:', error);
      return null;
    }
  }

  importReadingData(data) {
    try {
      if (data.books) {
        localStorage.setItem(this.BOOKS_KEY, JSON.stringify(data.books));
      }
      if (data.sessions) {
        localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(data.sessions));
      }
      if (data.notes) {
        localStorage.setItem(this.NOTES_KEY, JSON.stringify(data.notes));
      }
      if (data.goals) {
        localStorage.setItem(this.GOALS_KEY, JSON.stringify(data.goals));
      }
      return true;
    } catch (error) {
      console.error('Error importing reading data:', error);
      return false;
    }
  }
}

// Create and export singleton instance
const readingService = new ReadingService();
export default readingService;
