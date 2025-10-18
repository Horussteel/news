class DataExportService {
  constructor() {
    this.EXPORT_HISTORY_KEY = 'exportHistory';
    this.IMPORT_HISTORY_KEY = 'importHistory';
  }

  // Get all application data
  getAllData() {
    try {
      // Access services from global scope or window
      const storageService = window.storageService || { 
        getBookmarks: () => [],
        getHistory: () => [],
        getPreferences: () => ({}),
        getHabits: () => [],
        getHabitCompletions: () => []
      };
      
      const todoService = window.todoService || {
        getTodos: () => [],
        getCategories: () => [],
        getTags: () => []
      };
      
      const readingService = window.readingService || {
        getBooks: () => [],
        getSessions: () => [],
        getNotes: () => [],
        getGoals: () => []
      };
      
      const pomodoroService = window.pomodoroService || {
        getSettings: () => ({}),
        getStats: () => ({})
      };

      const financialService = window.financialService || {
        getExpenses: () => [],
        getIncome: () => [],
        getBudgets: () => [],
        getGoals: () => [],
        getBills: () => [],
        getLoans: () => [],
        getLoanPayments: () => [],
        getCategories: () => ({ expenses: [], income: [] })
      };

      const data = {
        // Bookmarks and history
        bookmarks: storageService.getBookmarks(),
        history: storageService.getHistory(),
        preferences: storageService.getPreferences(),
        
        // Todos
        todos: todoService.getTodos(),
        todoCategories: todoService.getCategories(),
        todoTags: todoService.getTags(),
        
        // Reading
        books: readingService.getBooks(),
        readingSessions: readingService.getSessions(),
        readingNotes: readingService.getNotes(),
        readingGoals: readingService.getGoals(),
        
        // Habits
        habits: storageService.getHabits(),
        habitCompletions: storageService.getHabitCompletions(),
        
        // Pomodoro
        pomodoroSettings: pomodoroService.getSettings(),
        pomodoroStats: pomodoroService.getStats(),
        
        // Financial
        transactions: [...financialService.getExpenses(), ...financialService.getIncome()],
        accounts: [], // Financial accounts not implemented yet
        budgets: financialService.getBudgets(),
        financialGoals: financialService.getGoals(),
        bills: financialService.getBills(),
        loans: financialService.getLoans(),
        loanPayments: financialService.getLoanPayments(),
        financialCategories: financialService.getCategories(),
        
        // Metadata
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        dataType: 'fullExport'
      };

      return data;
    } catch (error) {
      console.error('Error getting all data:', error);
      return null;
    }
  }

  // Export data to file
  exportData(format = 'json', filename = null) {
    try {
      const data = this.getAllData();
      if (!data) {
        throw new Error('Failed to collect data');
      }

      let content, mimeType, fileExtension;
      
      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        fileExtension = 'json';
      } else if (format === 'csv') {
        content = this.convertToCSV(data);
        mimeType = 'text/csv';
        fileExtension = 'csv';
      } else {
        throw new Error('Unsupported format');
      }

      // Generate filename if not provided
      if (!filename) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        filename = `data-backup-${timestamp}.${fileExtension}`;
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Save to export history
      this.saveToExportHistory({
        filename,
        format,
        size: content.length,
        timestamp: new Date().toISOString(),
        dataTypes: this.getDataTypesIncluded(data)
      });

      return {
        success: true,
        filename,
        size: content.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Import data from file
  importData(file) {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const content = e.target.result;
            let data;

            // Try to parse as JSON first
            try {
              data = JSON.parse(content);
            } catch (jsonError) {
              // If JSON fails, try CSV (limited support)
              if (file.name.endsWith('.csv')) {
                data = this.parseCSV(content);
              } else {
                throw new Error('Invalid file format');
              }
            }

            // Validate data structure
            if (!this.validateImportData(data)) {
              throw new Error('Invalid data structure');
            }

            // Import data to all services
            const importResult = this.importDataToServices(data);

            // Save to import history
            this.saveToImportHistory({
              filename: file.name,
              size: content.length,
              timestamp: new Date().toISOString(),
              dataTypes: this.getDataTypesIncluded(data),
              result: importResult
            });

            resolve({
              success: true,
              imported: importResult,
              filename: file.name
            });
          } catch (error) {
            console.error('Error processing imported data:', error);
            reject(new Error(`Failed to process file: ${error.message}`));
          }
        };

        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Import data to respective services
  importDataToServices(data) {
    const results = {};

    try {
      // Import storage service data
      if (data.bookmarks || data.history || data.preferences) {
        if (data.bookmarks) {
          localStorage.setItem('bookmarks', JSON.stringify(data.bookmarks));
          results.bookmarks = data.bookmarks.length;
        }
        if (data.history) {
          localStorage.setItem('readHistory', JSON.stringify(data.history));
          results.history = data.history.length;
        }
        if (data.preferences) {
          localStorage.setItem('userPreferences', JSON.stringify(data.preferences));
          results.preferences = 1;
        }
      }

      // Import todo data
      if (data.todos || data.todoCategories || data.todoTags) {
        if (data.todos) {
          localStorage.setItem('todos', JSON.stringify(data.todos));
          results.todos = data.todos.length;
        }
        if (data.todoCategories) {
          localStorage.setItem('todoCategories', JSON.stringify(data.todoCategories));
          results.todoCategories = data.todoCategories.length;
        }
        if (data.todoTags) {
          localStorage.setItem('todoTags', JSON.stringify(data.todoTags));
          results.todoTags = data.todoTags.length;
        }
      }

      // Import reading data
      if (data.books || data.readingSessions || data.readingNotes || data.readingGoals) {
        if (data.books) {
          localStorage.setItem('readingBooks', JSON.stringify(data.books));
          results.books = data.books.length;
        }
        if (data.readingSessions) {
          localStorage.setItem('readingSessions', JSON.stringify(data.readingSessions));
          results.readingSessions = data.readingSessions.length;
        }
        if (data.readingNotes) {
          localStorage.setItem('readingNotes', JSON.stringify(data.readingNotes));
          results.readingNotes = data.readingNotes.length;
        }
        if (data.readingGoals) {
          localStorage.setItem('readingGoals', JSON.stringify(data.readingGoals));
          results.readingGoals = data.readingGoals.length;
        }
      }

      // Import habits data
      if (data.habits || data.habitCompletions) {
        if (data.habits) {
          localStorage.setItem('habits', JSON.stringify(data.habits));
          results.habits = data.habits.length;
        }
        if (data.habitCompletions) {
          localStorage.setItem('habitCompletions', JSON.stringify(data.habitCompletions));
          results.habitCompletions = data.habitCompletions.length;
        }
      }

      // Import pomodoro data
      if (data.pomodoroSettings || data.pomodoroStats) {
        if (data.pomodoroSettings) {
          localStorage.setItem('pomodoroSettings', JSON.stringify(data.pomodoroSettings));
          results.pomodoroSettings = 1;
        }
        if (data.pomodoroStats) {
          localStorage.setItem('pomodoroStats', JSON.stringify(data.pomodoroStats));
          results.pomodoroStats = 1;
        }
      }

      // Import financial data
      if (data.transactions || data.accounts || data.budgets || data.financialGoals || data.bills || data.loans || data.loanPayments || data.financialCategories) {
        if (data.transactions) {
          // Separate expenses and income
          const expenses = data.transactions.filter(t => t.amount < 0 || t.type === 'expense');
          const income = data.transactions.filter(t => t.amount > 0 || t.type === 'income');
          localStorage.setItem('financial_expenses', JSON.stringify(expenses));
          localStorage.setItem('financial_income', JSON.stringify(income));
          results.transactions = data.transactions.length;
        }
        if (data.accounts) {
          localStorage.setItem('financialAccounts', JSON.stringify(data.accounts));
          results.accounts = data.accounts.length;
        }
        if (data.budgets) {
          localStorage.setItem('financial_budgets', JSON.stringify(data.budgets));
          results.budgets = data.budgets.length;
        }
        if (data.financialGoals) {
          localStorage.setItem('financial_goals', JSON.stringify(data.financialGoals));
          results.financialGoals = data.financialGoals.length;
        }
        if (data.bills) {
          localStorage.setItem('financial_bills', JSON.stringify(data.bills));
          results.bills = data.bills.length;
        }
        if (data.loans) {
          localStorage.setItem('financial_loans', JSON.stringify(data.loans));
          results.loans = data.loans.length;
        }
        if (data.loanPayments) {
          localStorage.setItem('financial_loan_payments', JSON.stringify(data.loanPayments));
          results.loanPayments = data.loanPayments.length;
        }
        if (data.financialCategories) {
          localStorage.setItem('financial_categories', JSON.stringify(data.financialCategories));
          results.financialCategories = 1;
        }
      }

      return results;
    } catch (error) {
      console.error('Error importing data to services:', error);
      throw error;
    }
  }

  // Validate imported data
  validateImportData(data) {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Check if it has at least one expected data type
    const expectedKeys = [
      'bookmarks', 'history', 'preferences', 'todos', 'books', 
      'habits', 'pomodoroSettings', 'pomodoroStats', 
      'transactions', 'accounts', 'budgets', 'financialGoals', 'bills',
      'loans', 'loanPayments', 'financialCategories'
    ];

    return expectedKeys.some(key => data.hasOwnProperty(key));
  }

  // Convert data to CSV format
  convertToCSV(data) {
    const csvRows = [];
    
    // Add metadata
    csvRows.push('# Data Export');
    csvRows.push(`# Exported: ${data.exportedAt}`);
    csvRows.push(`# Version: ${data.version}`);
    csvRows.push('');

    // Bookmarks
    if (data.bookmarks && data.bookmarks.length > 0) {
      csvRows.push('# Bookmarks');
      csvRows.push('Type,Title,URL,Source,Category,Saved At');
      data.bookmarks.forEach(bookmark => {
        csvRows.push([
          'Bookmark',
          `"${bookmark.title || ''}"`,
          `"${bookmark.url || ''}"`,
          `"${bookmark.source || ''}"`,
          `"${bookmark.category || ''}"`,
          bookmark.savedAt || ''
        ].join(','));
      });
      csvRows.push('');
    }

    // Todos
    if (data.todos && data.todos.length > 0) {
      csvRows.push('# Todos');
      csvRows.push('Type,Title,Description,Priority,Category,Status,Created At');
      data.todos.forEach(todo => {
        csvRows.push([
          'Todo',
          `"${todo.title || ''}"`,
          `"${todo.description || ''}"`,
          todo.priority || '',
          `"${todo.category || ''}"`,
          todo.completed ? 'Completed' : 'Pending',
          todo.createdAt || ''
        ].join(','));
      });
      csvRows.push('');
    }

    // Books
    if (data.books && data.books.length > 0) {
      csvRows.push('# Books');
      csvRows.push('Type,Title,Author,Genre,Status,Current Page,Total Pages,Created At');
      data.books.forEach(book => {
        csvRows.push([
          'Book',
          `"${book.title || ''}"`,
          `"${book.author || ''}"`,
          `"${book.genre || ''}"`,
          book.status || '',
          book.currentPage || 0,
          book.totalPages || 0,
          book.createdAt || ''
        ].join(','));
      });
      csvRows.push('');
    }

    // Habits
    if (data.habits && data.habits.length > 0) {
      csvRows.push('# Habits');
      csvRows.push('Type,Name,Category,Frequency,Target Count,Streak,Created At');
      data.habits.forEach(habit => {
        csvRows.push([
          'Habit',
          `"${habit.name || ''}"`,
          `"${habit.category || ''}"`,
          habit.frequency || '',
          habit.targetCount || 1,
          habit.streak || 0,
          habit.createdAt || ''
        ].join(','));
      });
      csvRows.push('');
    }

    // Financial Transactions
    if (data.transactions && data.transactions.length > 0) {
      csvRows.push('# Financial Transactions');
      csvRows.push('Type,Amount,Description,Category,Date,Account,Status');
      data.transactions.forEach(transaction => {
        csvRows.push([
          'Transaction',
          transaction.amount || 0,
          `"${transaction.description || ''}"`,
          `"${transaction.category || ''}"`,
          transaction.date || '',
          `"${transaction.account || ''}"`,
          transaction.type || ''
        ].join(','));
      });
      csvRows.push('');
    }

    // Financial Accounts
    if (data.accounts && data.accounts.length > 0) {
      csvRows.push('# Financial Accounts');
      csvRows.push('Type,Name,Account Type,Balance,Currency,Created At');
      data.accounts.forEach(account => {
        csvRows.push([
          'Account',
          `"${account.name || ''}"`,
          `"${account.type || ''}"`,
          account.balance || 0,
          `"${account.currency || 'RON'}"`,
          account.createdAt || ''
        ].join(','));
      });
      csvRows.push('');
    }

    // Financial Budgets
    if (data.budgets && data.budgets.length > 0) {
      csvRows.push('# Financial Budgets');
      csvRows.push('Type,Category Name,Amount,Spent,Period,Month,Year,Created At');
      data.budgets.forEach(budget => {
        csvRows.push([
          'Budget',
          `"${budget.categoryName || ''}"`,
          budget.amount || 0,
          budget.spent || 0,
          `"${budget.period || ''}"`,
          budget.month || '',
          budget.year || '',
          budget.createdAt || ''
        ].join(','));
      });
      csvRows.push('');
    }

    // Financial Goals
    if (data.financialGoals && data.financialGoals.length > 0) {
      csvRows.push('# Financial Goals');
      csvRows.push('Type,Name,Target Amount,Current Amount,Category,Priority,Target Date,Created At');
      data.financialGoals.forEach(goal => {
        csvRows.push([
          'Financial Goal',
          `"${goal.name || ''}"`,
          goal.targetAmount || 0,
          goal.currentAmount || 0,
          `"${goal.category || ''}"`,
          `"${goal.priority || ''}"`,
          goal.deadline || '',
          goal.createdAt || ''
        ].join(','));
      });
      csvRows.push('');
    }

    // Financial Bills
    if (data.bills && data.bills.length > 0) {
      csvRows.push('# Financial Bills');
      csvRows.push('Type,Name,Amount,Category,Due Date,Is Paid,Is Recurring,Frequency,Created At');
      data.bills.forEach(bill => {
        csvRows.push([
          'Bill',
          `"${bill.name || ''}"`,
          bill.amount || 0,
          `"${bill.category || ''}"`,
          bill.dueDate || '',
          bill.isPaid || false,
          bill.isRecurring || false,
          `"${bill.frequency || ''}"`,
          bill.createdAt || ''
        ].join(','));
      });
      csvRows.push('');
    }

    // Loans
    if (data.loans && data.loans.length > 0) {
      csvRows.push('# Loans');
      csvRows.push('Type,Person Name,Principal Amount,Interest Rate,Type,Status,Start Date,Due Date,Current Balance,Total Paid,Created At');
      data.loans.forEach(loan => {
        csvRows.push([
          'Loan',
          `"${loan.personName || ''}"`,
          loan.principalAmount || 0,
          loan.interestRate || 0,
          `"${loan.type || ''}"`,
          `"${loan.status || ''}"`,
          loan.startDate || '',
          loan.dueDate || '',
          loan.currentBalance || 0,
          loan.totalPaid || 0,
          loan.createdAt || ''
        ].join(','));
      });
      csvRows.push('');
    }

    // Loan Payments
    if (data.loanPayments && data.loanPayments.length > 0) {
      csvRows.push('# Loan Payments');
      csvRows.push('Type,Loan ID,Amount,Date,Note,Created At');
      data.loanPayments.forEach(payment => {
        csvRows.push([
          'Loan Payment',
          payment.loanId || '',
          payment.amount || 0,
          payment.date || '',
          `"${payment.note || ''}"`,
          payment.createdAt || ''
        ].join(','));
      });
      csvRows.push('');
    }

    return csvRows.join('\n');
  }

  // Parse CSV data (basic implementation)
  parseCSV(content) {
    const lines = content.split('\n');
    const data = {
      bookmarks: [],
      todos: [],
      books: [],
      habits: [],
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      dataType: 'csvImport'
    };

    let currentSection = null;

    lines.forEach(line => {
      line = line.trim();
      
      if (line.startsWith('#')) {
        if (line.includes('Bookmarks')) currentSection = 'bookmarks';
        else if (line.includes('Todos')) currentSection = 'todos';
        else if (line.includes('Books')) currentSection = 'books';
        else if (line.includes('Habits')) currentSection = 'habits';
        return;
      }

      if (!line || line.startsWith('Type,')) return;

      const columns = line.split(',').map(col => col.replace(/^"|"$/g, ''));
      if (columns.length < 2) return;

      const item = {
        id: Date.now().toString() + Math.random(),
        createdAt: new Date().toISOString()
      };

      switch (currentSection) {
        case 'bookmarks':
          if (columns[0] === 'Bookmark') {
            item.title = columns[1] || '';
            item.url = columns[2] || '';
            item.source = columns[3] || '';
            item.category = columns[4] || '';
            item.savedAt = columns[5] || new Date().toISOString();
            data.bookmarks.push(item);
          }
          break;
        case 'todos':
          if (columns[0] === 'Todo') {
            item.title = columns[1] || '';
            item.description = columns[2] || '';
            item.priority = columns[3] || 'medium';
            item.category = columns[4] || 'personal';
            item.completed = columns[5] === 'Completed';
            item.updatedAt = item.createdAt;
            data.todos.push(item);
          }
          break;
        case 'books':
          if (columns[0] === 'Book') {
            item.title = columns[1] || '';
            item.author = columns[2] || '';
            item.genre = columns[3] || '';
            item.status = columns[4] || 'reading';
            item.currentPage = parseInt(columns[5]) || 0;
            item.totalPages = parseInt(columns[6]) || 0;
            data.books.push(item);
          }
          break;
        case 'habits':
          if (columns[0] === 'Habit') {
            item.name = columns[1] || '';
            item.category = columns[2] || 'personal';
            item.frequency = columns[3] || 'daily';
            item.targetCount = parseInt(columns[4]) || 1;
            item.streak = parseInt(columns[5]) || 0;
            item.isActive = true;
            item.totalCompletions = 0;
            data.habits.push(item);
          }
          break;
      }
    });

    return data;
  }

  // Get data types included in export/import
  getDataTypesIncluded(data) {
    const types = [];
    if (data.bookmarks && data.bookmarks.length > 0) types.push('bookmarks');
    if (data.history && data.history.length > 0) types.push('history');
    if (data.preferences) types.push('preferences');
    if (data.todos && data.todos.length > 0) types.push('todos');
    if (data.todoCategories && data.todoCategories.length > 0) types.push('todoCategories');
    if (data.todoTags && data.todoTags.length > 0) types.push('todoTags');
    if (data.books && data.books.length > 0) types.push('books');
    if (data.readingSessions && data.readingSessions.length > 0) types.push('readingSessions');
    if (data.readingNotes && data.readingNotes.length > 0) types.push('readingNotes');
    if (data.readingGoals && data.readingGoals.length > 0) types.push('readingGoals');
    if (data.habits && data.habits.length > 0) types.push('habits');
    if (data.habitCompletions && data.habitCompletions.length > 0) types.push('habitCompletions');
    if (data.pomodoroSettings) types.push('pomodoroSettings');
    if (data.pomodoroStats) types.push('pomodoroStats');
    if (data.transactions && data.transactions.length > 0) types.push('transactions');
    if (data.accounts && data.accounts.length > 0) types.push('accounts');
    if (data.budgets && data.budgets.length > 0) types.push('budgets');
    if (data.financialGoals && data.financialGoals.length > 0) types.push('financialGoals');
    if (data.bills && data.bills.length > 0) types.push('bills');
    if (data.loans && data.loans.length > 0) types.push('loans');
    if (data.loanPayments && data.loanPayments.length > 0) types.push('loanPayments');
    if (data.financialCategories) types.push('financialCategories');
    return types;
  }

  // Save export to history
  saveToExportHistory(exportInfo) {
    try {
      const history = this.getExportHistory();
      history.unshift({
        ...exportInfo,
        id: Date.now().toString()
      });
      
      // Keep only last 50 exports
      const trimmedHistory = history.slice(0, 50);
      localStorage.setItem(this.EXPORT_HISTORY_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Error saving export history:', error);
    }
  }

  // Save import to history
  saveToImportHistory(importInfo) {
    try {
      const history = this.getImportHistory();
      history.unshift({
        ...importInfo,
        id: Date.now().toString()
      });
      
      // Keep only last 50 imports
      const trimmedHistory = history.slice(0, 50);
      localStorage.setItem(this.IMPORT_HISTORY_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Error saving import history:', error);
    }
  }

  // Get export history
  getExportHistory() {
    try {
      const history = localStorage.getItem(this.EXPORT_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting export history:', error);
      return [];
    }
  }

  // Get import history
  getImportHistory() {
    try {
      const history = localStorage.getItem(this.IMPORT_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting import history:', error);
      return [];
    }
  }

  // Clear export history
  clearExportHistory() {
    try {
      localStorage.removeItem(this.EXPORT_HISTORY_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing export history:', error);
      return false;
    }
  }

  // Clear import history
  clearImportHistory() {
    try {
      localStorage.removeItem(this.IMPORT_HISTORY_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing import history:', error);
      return false;
    }
  }

  // Get export/import statistics
  getStatistics() {
    try {
      const exportHistory = this.getExportHistory();
      const importHistory = this.getImportHistory();
      const data = this.getAllData();

      return {
        totalExports: exportHistory.length,
        totalImports: importHistory.length,
        lastExport: exportHistory.length > 0 ? exportHistory[0].timestamp : null,
        lastImport: importHistory.length > 0 ? importHistory[0].timestamp : null,
        currentDataSize: JSON.stringify(data).length,
        dataTypes: this.getDataTypesIncluded(data)
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return null;
    }
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Format date
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ro-RO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  }
}

// Create and export singleton instance
const dataExportService = new DataExportService();
export default dataExportService;
