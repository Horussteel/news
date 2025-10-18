class FinancialService {
  constructor() {
    this.EXPENSES_KEY = 'financial_expenses';
    this.INCOME_KEY = 'financial_income';
    this.BUDGETS_KEY = 'financial_budgets';
    this.GOALS_KEY = 'financial_goals';
    this.BILLS_KEY = 'financial_bills';
    this.CATEGORIES_KEY = 'financial_categories';
    this.LOANS_KEY = 'financial_loans';
    this.LOAN_PAYMENTS_KEY = 'financial_loan_payments';
  }

  // Default categories
  getDefaultCategories() {
    return {
      expenses: [
        { id: 'food', name: 'Mâncare', icon: '🍔', color: '#EF4444' },
        { id: 'transport', name: 'Transport', icon: '🚗', color: '#3B82F6' },
        { id: 'utilities', name: 'Utilități', icon: '💡', color: '#F59E0B' },
        { id: 'entertainment', name: 'Divertisment', icon: '🎮', color: '#8B5CF6' },
        { id: 'health', name: 'Sănătate', icon: '🏥', color: '#10B981' },
        { id: 'shopping', name: 'Cumpărături', icon: '🛍️', color: '#EC4899' },
        { id: 'education', name: 'Educație', icon: '📚', color: '#06B6D4' },
        { id: 'other', name: 'Altele', icon: '📌', color: '#6B7280' }
      ],
      income: [
        { id: 'salary', name: 'Salariu', icon: '💰', color: '#10B981' },
        { id: 'freelance', name: 'Freelance', icon: '💻', color: '#3B82F6' },
        { id: 'investments', name: 'Investiții', icon: '📈', color: '#8B5CF6' },
        { id: 'business', name: 'Afaceri', icon: '🏢', color: '#F59E0B' },
        { id: 'other_income', name: 'Altele', icon: '💵', color: '#6B7280' }
      ]
    };
  }

  // Categories management
  getCategories() {
    try {
      const categories = localStorage.getItem(this.CATEGORIES_KEY);
      return categories ? JSON.parse(categories) : this.getDefaultCategories();
    } catch (error) {
      console.error('Error getting categories:', error);
      return this.getDefaultCategories();
    }
  }

  addCategory(type, category) {
    try {
      const categories = this.getCategories();
      const newCategory = {
        id: Date.now().toString(),
        ...category,
        createdAt: new Date().toISOString()
      };
      
      categories[type].push(newCategory);
      localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      return null;
    }
  }

  // Expenses management
  getExpenses(month = null, year = null) {
    try {
      const expenses = localStorage.getItem(this.EXPENSES_KEY);
      let allExpenses = expenses ? JSON.parse(expenses) : [];
      
      if (month && year) {
        allExpenses = allExpenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() + 1 === parseInt(month) && 
                 expenseDate.getFullYear() === parseInt(year);
        });
      }
      
      return allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Error getting expenses:', error);
      return [];
    }
  }

  addExpense(expense) {
    try {
      const expenses = this.getExpenses();
      const newExpense = {
        id: Date.now().toString(),
        amount: parseFloat(expense.amount),
        category: expense.category,
        description: expense.description || '',
        date: expense.date || new Date().toISOString().split('T')[0],
        paymentMethod: expense.paymentMethod || 'cash',
        tags: expense.tags || [],
        createdAt: new Date().toISOString()
      };
      
      expenses.push(newExpense);
      localStorage.setItem(this.EXPENSES_KEY, JSON.stringify(expenses));
      
      // Check if this expense is related to a bill
      this.checkBillPayment(newExpense);
      
      return newExpense;
    } catch (error) {
      console.error('Error adding expense:', error);
      return null;
    }
  }

  updateExpense(id, updates) {
    try {
      const expenses = this.getExpenses();
      const index = expenses.findIndex(expense => expense.id === id);
      if (index > -1) {
        expenses[index] = { ...expenses[index], ...updates };
        localStorage.setItem(this.EXPENSES_KEY, JSON.stringify(expenses));
        return expenses[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating expense:', error);
      return null;
    }
  }

  deleteExpense(id) {
    try {
      const expenses = this.getExpenses();
      const updatedExpenses = expenses.filter(expense => expense.id !== id);
      localStorage.setItem(this.EXPENSES_KEY, JSON.stringify(updatedExpenses));
      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      return false;
    }
  }

  // Income management
  getIncome(month = null, year = null) {
    try {
      const income = localStorage.getItem(this.INCOME_KEY);
      let allIncome = income ? JSON.parse(income) : [];
      
      if (month && year) {
        allIncome = allIncome.filter(item => {
          const incomeDate = new Date(item.date);
          return incomeDate.getMonth() + 1 === parseInt(month) && 
                 incomeDate.getFullYear() === parseInt(year);
        });
      }
      
      return allIncome.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Error getting income:', error);
      return [];
    }
  }

  addIncome(incomeItem) {
    try {
      const income = this.getIncome();
      const newIncome = {
        id: Date.now().toString(),
        amount: parseFloat(incomeItem.amount),
        category: incomeItem.category,
        description: incomeItem.description || '',
        date: incomeItem.date || new Date().toISOString().split('T')[0],
        isRecurring: incomeItem.isRecurring || false,
        recurringPeriod: incomeItem.recurringPeriod || null,
        tags: incomeItem.tags || [],
        createdAt: new Date().toISOString()
      };
      
      income.push(newIncome);
      localStorage.setItem(this.INCOME_KEY, JSON.stringify(income));
      return newIncome;
    } catch (error) {
      console.error('Error adding income:', error);
      return null;
    }
  }

  updateIncome(id, updates) {
    try {
      const income = this.getIncome();
      const index = income.findIndex(item => item.id === id);
      if (index > -1) {
        income[index] = { ...income[index], ...updates };
        localStorage.setItem(this.INCOME_KEY, JSON.stringify(income));
        return income[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating income:', error);
      return null;
    }
  }

  deleteIncome(id) {
    try {
      const income = this.getIncome();
      const updatedIncome = income.filter(item => item.id !== id);
      localStorage.setItem(this.INCOME_KEY, JSON.stringify(updatedIncome));
      return true;
    } catch (error) {
      console.error('Error deleting income:', error);
      return false;
    }
  }

  // Budgets management
  getBudgets() {
    try {
      const budgets = localStorage.getItem(this.BUDGETS_KEY);
      return budgets ? JSON.parse(budgets) : this.getDefaultBudgets();
    } catch (error) {
      console.error('Error getting budgets:', error);
      return this.getDefaultBudgets();
    }
  }

  getDefaultBudgets() {
    const categories = this.getCategories();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    return categories.expenses.map(category => ({
      id: Date.now().toString() + Math.random(),
      categoryId: category.id,
      categoryName: category.name,
      month: currentMonth,
      year: currentYear,
      amount: 1000, // Default budget amount
      spent: 0,
      remaining: 1000,
      isActive: true
    }));
  }

  addBudget(budget) {
    try {
      const budgets = this.getBudgets();
      const newBudget = {
        id: Date.now().toString(),
        categoryId: budget.categoryId,
        categoryName: budget.categoryName,
        month: budget.month,
        year: budget.year,
        amount: parseFloat(budget.amount),
        spent: 0,
        remaining: parseFloat(budget.amount),
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      budgets.push(newBudget);
      localStorage.setItem(this.BUDGETS_KEY, JSON.stringify(budgets));
      
      // Update spent amount
      this.updateBudgetSpending(newBudget);
      
      return newBudget;
    } catch (error) {
      console.error('Error adding budget:', error);
      return null;
    }
  }

  updateBudget(id, updates) {
    try {
      const budgets = this.getBudgets();
      const index = budgets.findIndex(budget => budget.id === id);
      if (index > -1) {
        budgets[index] = { ...budgets[index], ...updates };
        localStorage.setItem(this.BUDGETS_KEY, JSON.stringify(budgets));
        
        // Update spent amount if needed
        this.updateBudgetSpending(budgets[index]);
        
        return budgets[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating budget:', error);
      return null;
    }
  }

  deleteBudget(id) {
    try {
      const budgets = this.getBudgets();
      const updatedBudgets = budgets.filter(budget => budget.id !== id);
      localStorage.setItem(this.BUDGETS_KEY, JSON.stringify(updatedBudgets));
      return true;
    } catch (error) {
      console.error('Error deleting budget:', error);
      return false;
    }
  }

  updateBudgetSpending(budget) {
    try {
      const expenses = this.getExpenses(budget.month, budget.year);
      const categories = this.getCategories();
      const category = categories.expenses.find(cat => cat.id === budget.categoryId);
      
      if (category) {
        const spent = expenses
          .filter(expense => expense.category === budget.categoryId)
          .reduce((total, expense) => total + expense.amount, 0);
        
        budget.spent = spent;
        budget.remaining = budget.amount - spent;
        
        // Save updated budget
        const budgets = this.getBudgets();
        const index = budgets.findIndex(b => b.id === budget.id);
        if (index > -1) {
          budgets[index] = budget;
          localStorage.setItem(this.BUDGETS_KEY, JSON.stringify(budgets));
        }
      }
    } catch (error) {
      console.error('Error updating budget spending:', error);
    }
  }

  // Financial Goals management
  getGoals() {
    try {
      const goals = localStorage.getItem(this.GOALS_KEY);
      return goals ? JSON.parse(goals) : [];
    } catch (error) {
      console.error('Error getting goals:', error);
      return [];
    }
  }

  addGoal(goal) {
    try {
      const goals = this.getGoals();
      const newGoal = {
        id: Date.now().toString(),
        name: goal.name,
        description: goal.description || '',
        targetAmount: parseFloat(goal.targetAmount),
        currentAmount: parseFloat(goal.currentAmount) || 0,
        category: goal.category || 'savings',
        deadline: goal.deadline || null,
        priority: goal.priority || 'medium',
        isActive: true,
        createdAt: new Date().toISOString(),
        achievedAt: null
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
        goals[index] = { ...goals[index], ...updates };
        
        // Check if goal is achieved
        if (goals[index].currentAmount >= goals[index].targetAmount && !goals[index].achievedAt) {
          goals[index].achievedAt = new Date().toISOString();
        }
        
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

  contributeToGoal(goalId, amount) {
    try {
      const goals = this.getGoals();
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        goal.currentAmount += parseFloat(amount);
        if (goal.currentAmount >= goal.targetAmount && !goal.achievedAt) {
          goal.achievedAt = new Date().toISOString();
        }
        
        localStorage.setItem(this.GOALS_KEY, JSON.stringify(goals));
        
        // Add this as a savings expense
        this.addExpense({
          amount: parseFloat(amount),
          category: 'savings',
          description: `Contribuție pentru obiectiv: ${goal.name}`,
          date: new Date().toISOString().split('T')[0],
          tags: ['savings', 'goal']
        });
        
        return goal;
      }
      return null;
    } catch (error) {
      console.error('Error contributing to goal:', error);
      return null;
    }
  }

  // Bills management
  getBills() {
    try {
      const bills = localStorage.getItem(this.BILLS_KEY);
      return bills ? JSON.parse(bills) : [];
    } catch (error) {
      console.error('Error getting bills:', error);
      return [];
    }
  }

  addBill(bill) {
    try {
      const bills = this.getBills();
      const newBill = {
        id: Date.now().toString(),
        name: bill.name,
        amount: parseFloat(bill.amount),
        category: bill.category || 'utilities',
        dueDate: bill.dueDate,
        frequency: bill.frequency || 'monthly', // weekly, monthly, yearly
        isRecurring: bill.isRecurring !== false,
        isPaid: false,
        paidDate: null,
        reminderDays: bill.reminderDays || 3,
        autoPay: bill.autoPay || false,
        createdAt: new Date().toISOString()
      };
      
      bills.push(newBill);
      localStorage.setItem(this.BILLS_KEY, JSON.stringify(bills));
      
      // Create todo item as reminder
      this.createBillReminderTodo(newBill);
      
      return newBill;
    } catch (error) {
      console.error('Error adding bill:', error);
      return null;
    }
  }

  updateBill(id, updates) {
    try {
      const bills = this.getBills();
      const index = bills.findIndex(bill => bill.id === id);
      if (index > -1) {
        bills[index] = { ...bills[index], ...updates };
        localStorage.setItem(this.BILLS_KEY, JSON.stringify(bills));
        return bills[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating bill:', error);
      return null;
    }
  }

  markBillAsPaid(id, paidDate = new Date().toISOString().split('T')[0]) {
    try {
      const bills = this.getBills();
      const bill = bills.find(b => b.id === id);
      if (bill) {
        bill.isPaid = true;
        bill.paidDate = paidDate;
        
        localStorage.setItem(this.BILLS_KEY, JSON.stringify(bills));
        
        // Add as expense
        this.addExpense({
          amount: bill.amount,
          category: bill.category,
          description: `Plată factură: ${bill.name}`,
          date: paidDate,
          tags: ['bill', 'utility']
        });
        
        // Create next bill if recurring
        if (bill.isRecurring && bill.frequency) {
          this.createNextRecurringBill(bill);
        }
        
        return bill;
      }
      return null;
    } catch (error) {
      console.error('Error marking bill as paid:', error);
      return null;
    }
  }

  createNextRecurringBill(paidBill) {
    try {
      const nextDueDate = this.calculateNextDueDate(paidBill.dueDate, paidBill.frequency);
      if (nextDueDate) {
        this.addBill({
          name: paidBill.name,
          amount: paidBill.amount,
          category: paidBill.category,
          dueDate: nextDueDate,
          frequency: paidBill.frequency,
          isRecurring: true,
          reminderDays: paidBill.reminderDays,
          autoPay: paidBill.autoPay
        });
      }
    } catch (error) {
      console.error('Error creating next recurring bill:', error);
    }
  }

  calculateNextDueDate(currentDueDate, frequency) {
    try {
      const date = new Date(currentDueDate);
      
      switch (frequency) {
        case 'weekly':
          date.setDate(date.getDate() + 7);
          break;
        case 'monthly':
          date.setMonth(date.getMonth() + 1);
          break;
        case 'yearly':
          date.setFullYear(date.getFullYear() + 1);
          break;
        default:
          return null;
      }
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error calculating next due date:', error);
      return null;
    }
  }

  checkBillPayment(expense) {
    try {
      const bills = this.getBills();
      const unpaidBills = bills.filter(bill => !bill.isPaid);
      
      unpaidBills.forEach(bill => {
        if (expense.description.includes(bill.name) && 
            Math.abs(expense.amount - bill.amount) < 0.01) {
          this.markBillAsPaid(bill.id, expense.date);
        }
      });
    } catch (error) {
      console.error('Error checking bill payment:', error);
    }
  }

  createBillReminderTodo(bill) {
    try {
      // This would integrate with the existing todo service
      if (typeof window !== 'undefined' && window.todoService) {
        const dueDate = new Date(bill.dueDate);
        const reminderDate = new Date(dueDate);
        reminderDate.setDate(reminderDate.getDate() - bill.reminderDays);
        
        const todoText = `Plătește factura "${bill.name}" - ${bill.amount} RON (scadent: ${bill.dueDate})`;
        
        window.todoService.addTodo({
          title: todoText,
          description: `Factură ${bill.name} în valoare de ${bill.amount} RON cu scadența ${bill.dueDate}`,
          priority: 'high',
          category: 'bills',
          dueDate: reminderDate.toISOString().split('T')[0],
          tags: ['bill', 'reminder', bill.category]
        });
      }
    } catch (error) {
      console.error('Error creating bill reminder todo:', error);
    }
  }

  // Analytics and Reports
  getMonthlySummary(month = null, year = null) {
    try {
      const currentDate = new Date();
      month = month || currentDate.getMonth() + 1;
      year = year || currentDate.getFullYear();
      
      const expenses = this.getExpenses(month, year);
      const income = this.getIncome(month, year);
      
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
      const netIncome = totalIncome - totalExpenses;
      
      // Expenses by category
      const expensesByCategory = {};
      expenses.forEach(expense => {
        expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount;
      });
      
      // Income by category
      const incomeByCategory = {};
      income.forEach(item => {
        incomeByCategory[item.category] = (incomeByCategory[item.category] || 0) + item.amount;
      });
      
      return {
        month,
        year,
        totalExpenses,
        totalIncome,
        netIncome,
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0,
        expensesByCategory,
        incomeByCategory,
        expenseCount: expenses.length,
        incomeCount: income.length
      };
    } catch (error) {
      console.error('Error getting monthly summary:', error);
      return null;
    }
  }

  getYearlySummary(year = null) {
    try {
      const currentDate = new Date();
      year = year || currentDate.getFullYear();
      
      let yearlyData = {
        totalExpenses: 0,
        totalIncome: 0,
        netIncome: 0,
        monthlyData: [],
        expensesByCategory: {},
        incomeByCategory: {}
      };
      
      for (let month = 1; month <= 12; month++) {
        const monthlySummary = this.getMonthlySummary(month, year);
        if (monthlySummary) {
          yearlyData.totalExpenses += monthlySummary.totalExpenses;
          yearlyData.totalIncome += monthlySummary.totalIncome;
          yearlyData.monthlyData.push(monthlySummary);
          
          // Aggregate categories
          Object.entries(monthlySummary.expensesByCategory).forEach(([category, amount]) => {
            yearlyData.expensesByCategory[category] = (yearlyData.expensesByCategory[category] || 0) + amount;
          });
          
          Object.entries(monthlySummary.incomeByCategory).forEach(([category, amount]) => {
            yearlyData.incomeByCategory[category] = (yearlyData.incomeByCategory[category] || 0) + amount;
          });
        }
      }
      
      yearlyData.netIncome = yearlyData.totalIncome - yearlyData.totalExpenses;
      yearlyData.savingsRate = yearlyData.totalIncome > 0 ? 
        ((yearlyData.totalIncome - yearlyData.totalExpenses) / yearlyData.totalIncome * 100) : 0;
      
      return yearlyData;
    } catch (error) {
      console.error('Error getting yearly summary:', error);
      return null;
    }
  }

  getSpendingTrends(months = 6) {
    try {
      const trends = [];
      const currentDate = new Date();
      
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        const summary = this.getMonthlySummary(month, year);
        if (summary) {
          trends.push({
            month,
            year,
            monthName: date.toLocaleDateString('ro-RO', { month: 'long' }),
            ...summary
          });
        }
      }
      
      return trends;
    } catch (error) {
      console.error('Error getting spending trends:', error);
      return [];
    }
  }

  getUpcomingBills(days = 30) {
    try {
      const bills = this.getBills();
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      
      return bills
        .filter(bill => !bill.isPaid)
        .filter(bill => {
          const dueDate = new Date(bill.dueDate);
          return dueDate >= today && dueDate <= futureDate;
        })
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } catch (error) {
      console.error('Error getting upcoming bills:', error);
      return [];
    }
  }

  getGoalsProgress() {
    try {
      const goals = this.getGoals();
      return goals
        .filter(goal => goal.isActive)
        .map(goal => ({
          ...goal,
          progressPercentage: (goal.currentAmount / goal.targetAmount) * 100,
          isAchieved: goal.currentAmount >= goal.targetAmount,
          daysRemaining: goal.deadline ? 
            Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null
        }))
        .sort((a, b) => b.progressPercentage - a.progressPercentage);
    } catch (error) {
      console.error('Error getting goals progress:', error);
      return [];
    }
  }

  // Export/Import functionality
  exportFinancialData() {
    try {
      const data = {
        expenses: this.getExpenses(),
        income: this.getIncome(),
        budgets: this.getBudgets(),
        goals: this.getGoals(),
        bills: this.getBills(),
        categories: this.getCategories(),
        exportedAt: new Date().toISOString()
      };
      return data;
    } catch (error) {
      console.error('Error exporting financial data:', error);
      return null;
    }
  }

  importFinancialData(data) {
    try {
      if (data.expenses) {
        localStorage.setItem(this.EXPENSES_KEY, JSON.stringify(data.expenses));
      }
      if (data.income) {
        localStorage.setItem(this.INCOME_KEY, JSON.stringify(data.income));
      }
      if (data.budgets) {
        localStorage.setItem(this.BUDGETS_KEY, JSON.stringify(data.budgets));
      }
      if (data.goals) {
        localStorage.setItem(this.GOALS_KEY, JSON.stringify(data.goals));
      }
      if (data.bills) {
        localStorage.setItem(this.BILLS_KEY, JSON.stringify(data.bills));
      }
      if (data.categories) {
        localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(data.categories));
      }
      return true;
    } catch (error) {
      console.error('Error importing financial data:', error);
      return false;
    }
  }

  // Loans Management
  getLoans() {
    try {
      const loans = localStorage.getItem(this.LOANS_KEY);
      return loans ? JSON.parse(loans) : [];
    } catch (error) {
      console.error('Error getting loans:', error);
      return [];
    }
  }

  addLoan(loan) {
    try {
      const loans = this.getLoans();
      const newLoan = {
        id: Date.now().toString(),
        type: loan.type, // 'given' or 'received'
        personName: loan.personName,
        principalAmount: parseFloat(loan.principalAmount),
        interestRate: parseFloat(loan.interestRate) || 0,
        startDate: loan.startDate || new Date().toISOString().split('T')[0],
        dueDate: loan.dueDate || null,
        description: loan.description || '',
        status: 'active', // active, completed, overdue
        currentBalance: parseFloat(loan.principalAmount),
        totalPaid: 0,
        createdAt: new Date().toISOString(),
        completedAt: null
      };
      
      loans.push(newLoan);
      localStorage.setItem(this.LOANS_KEY, JSON.stringify(loans));
      return newLoan;
    } catch (error) {
      console.error('Error adding loan:', error);
      return null;
    }
  }

  updateLoan(id, updates) {
    try {
      const loans = this.getLoans();
      const index = loans.findIndex(loan => loan.id === id);
      if (index > -1) {
        loans[index] = { ...loans[index], ...updates };
        localStorage.setItem(this.LOANS_KEY, JSON.stringify(loans));
        return loans[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating loan:', error);
      return null;
    }
  }

  deleteLoan(id) {
    try {
      const loans = this.getLoans();
      const updatedLoans = loans.filter(loan => loan.id !== id);
      localStorage.setItem(this.LOANS_KEY, JSON.stringify(updatedLoans));
      
      // Also delete all payments for this loan
      const payments = this.getLoanPayments();
      const updatedPayments = payments.filter(payment => payment.loanId !== id);
      localStorage.setItem(this.LOAN_PAYMENTS_KEY, JSON.stringify(updatedPayments));
      
      return true;
    } catch (error) {
      console.error('Error deleting loan:', error);
      return false;
    }
  }

  // Loan Payments Management
  getLoanPayments(loanId = null) {
    try {
      const payments = localStorage.getItem(this.LOAN_PAYMENTS_KEY);
      let allPayments = payments ? JSON.parse(payments) : [];
      
      if (loanId) {
        allPayments = allPayments.filter(payment => payment.loanId === loanId);
      }
      
      return allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Error getting loan payments:', error);
      return [];
    }
  }

  addLoanPayment(payment) {
    try {
      const payments = this.getLoanPayments();
      const loans = this.getLoans();
      const loan = loans.find(l => l.id === payment.loanId);
      
      if (!loan) {
        throw new Error('Loan not found');
      }
      
      const paymentAmount = parseFloat(payment.amount);
      if (paymentAmount <= 0) {
        throw new Error('Payment amount must be positive');
      }
      
      if (paymentAmount > loan.currentBalance) {
        throw new Error('Payment amount cannot exceed remaining balance');
      }
      
      // Calculate interest and principal portions
      let interestPaid = 0;
      let principalPaid = paymentAmount;
      
      if (loan.interestRate > 0) {
        // Simple interest calculation
        const daysSinceStart = Math.ceil((new Date() - new Date(loan.startDate)) / (1000 * 60 * 60 * 24));
        const dailyRate = loan.interestRate / 100 / 365;
        const accruedInterest = loan.currentBalance * dailyRate * daysSinceStart;
        interestPaid = Math.min(accruedInterest, paymentAmount * 0.3); // Cap interest at 30% of payment
        principalPaid = paymentAmount - interestPaid;
      }
      
      const newPayment = {
        id: Date.now().toString(),
        loanId: payment.loanId,
        amount: paymentAmount,
        principalPaid: principalPaid,
        interestPaid: interestPaid,
        date: payment.date || new Date().toISOString().split('T')[0],
        note: payment.note || '',
        createdAt: new Date().toISOString()
      };
      
      payments.push(newPayment);
      localStorage.setItem(this.LOAN_PAYMENTS_KEY, JSON.stringify(payments));
      
      // Update loan balance and status
      loan.currentBalance -= principalPaid;
      loan.totalPaid += paymentAmount;
      
      if (loan.currentBalance <= 0) {
        loan.status = 'completed';
        loan.completedAt = new Date().toISOString();
        loan.currentBalance = 0;
      }
      
      localStorage.setItem(this.LOANS_KEY, JSON.stringify(loans));
      
      return { payment: newPayment, loan: loan };
    } catch (error) {
      console.error('Error adding loan payment:', error);
      throw error;
    }
  }

  deleteLoanPayment(paymentId) {
    try {
      const payments = this.getLoanPayments();
      const payment = payments.find(p => p.id === paymentId);
      
      if (!payment) {
        throw new Error('Payment not found');
      }
      
      const loans = this.getLoans();
      const loan = loans.find(l => l.id === payment.loanId);
      
      if (!loan) {
        throw new Error('Associated loan not found');
      }
      
      // Reverse the payment effect on loan
      loan.currentBalance += payment.principalPaid;
      loan.totalPaid -= payment.amount;
      
      if (loan.status === 'completed') {
        loan.status = 'active';
        loan.completedAt = null;
      }
      
      // Remove payment
      const updatedPayments = payments.filter(p => p.id !== paymentId);
      localStorage.setItem(this.LOAN_PAYMENTS_KEY, JSON.stringify(updatedPayments));
      localStorage.setItem(this.LOANS_KEY, JSON.stringify(loans));
      
      return true;
    } catch (error) {
      console.error('Error deleting loan payment:', error);
      throw error;
    }
  }

  // Loan Analytics
  getLoansSummary() {
    try {
      const loans = this.getLoans();
      const payments = this.getLoanPayments();
      
      const loansGiven = loans.filter(loan => loan.type === 'given');
      const loansReceived = loans.filter(loan => loan.type === 'received');
      
      const totalAssets = loansGiven.reduce((sum, loan) => sum + loan.currentBalance, 0);
      const totalLiabilities = loansReceived.reduce((sum, loan) => sum + loan.currentBalance, 0);
      const netWorth = totalAssets - totalLiabilities;
      
      const activeLoans = loans.filter(loan => loan.status === 'active');
      const completedLoans = loans.filter(loan => loan.status === 'completed');
      
      const totalPrincipalGiven = loansGiven.reduce((sum, loan) => sum + loan.principalAmount, 0);
      const totalPrincipalReceived = loansReceived.reduce((sum, loan) => sum + loan.principalAmount, 0);
      
      const totalReceived = loansGiven.reduce((sum, loan) => sum + loan.totalPaid, 0);
      const totalPaid = loansReceived.reduce((sum, loan) => sum + loan.totalPaid, 0);
      
      return {
        totalAssets,
        totalLiabilities,
        netWorth,
        activeLoansCount: activeLoans.length,
        completedLoansCount: completedLoans.length,
        totalPrincipalGiven,
        totalPrincipalReceived,
        totalReceived,
        totalPaid,
        loansGiven: loansGiven.length,
        loansReceived: loansReceived.length,
        overdueLoans: this.getOverdueLoans().length
      };
    } catch (error) {
      console.error('Error getting loans summary:', error);
      return null;
    }
  }

  getOverdueLoans() {
    try {
      const loans = this.getLoans();
      const today = new Date();
      
      return loans.filter(loan => {
        return loan.status === 'active' && 
               loan.dueDate && 
               new Date(loan.dueDate) < today;
      });
    } catch (error) {
      console.error('Error getting overdue loans:', error);
      return [];
    }
  }

  getUpcomingLoanPayments(days = 30) {
    try {
      const loans = this.getLoans();
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      
      return loans
        .filter(loan => loan.status === 'active')
        .filter(loan => {
          return loan.dueDate && 
                 new Date(loan.dueDate) >= today && 
                 new Date(loan.dueDate) <= futureDate;
        })
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } catch (error) {
      console.error('Error getting upcoming loan payments:', error);
      return [];
    }
  }

  getAssetsBreakdown() {
    try {
      const loansGiven = this.getLoans().filter(loan => loan.type === 'given');
      
      return loansGiven.map(loan => {
        const payments = this.getLoanPayments(loan.id);
        const totalReceived = payments.reduce((sum, payment) => sum + payment.amount, 0);
        
        return {
          id: loan.id,
          name: loan.personName,
          originalAmount: loan.principalAmount,
          currentBalance: loan.currentBalance,
          totalReceived: totalReceived,
          progressPercentage: (totalReceived / loan.principalAmount) * 100,
          status: loan.status,
          startDate: loan.startDate,
          dueDate: loan.dueDate
        };
      }).sort((a, b) => b.currentBalance - a.currentBalance);
    } catch (error) {
      console.error('Error getting assets breakdown:', error);
      return [];
    }
  }

  getLiabilitiesBreakdown() {
    try {
      const loansReceived = this.getLoans().filter(loan => loan.type === 'received');
      
      return loansReceived.map(loan => {
        const payments = this.getLoanPayments(loan.id);
        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
        
        return {
          id: loan.id,
          name: loan.personName,
          originalAmount: loan.principalAmount,
          currentBalance: loan.currentBalance,
          totalPaid: totalPaid,
          progressPercentage: (totalPaid / loan.principalAmount) * 100,
          status: loan.status,
          startDate: loan.startDate,
          dueDate: loan.dueDate
        };
      }).sort((a, b) => b.currentBalance - a.currentBalance);
    } catch (error) {
      console.error('Error getting liabilities breakdown:', error);
      return [];
    }
  }

  getFinancialHealthMetrics() {
    try {
      const summary = this.getLoansSummary();
      if (!summary) return null;
      
      const debtToAssetRatio = summary.totalAssets > 0 ? 
        (summary.totalLiabilities / summary.totalAssets) : 0;
      
      const liquidityRatio = summary.totalLiabilities > 0 ? 
        (summary.totalAssets / summary.totalLiabilities) : 0;
      
      return {
        debtToAssetRatio: debtToAssetRatio * 100, // as percentage
        liquidityRatio: liquidityRatio,
        financialHealthScore: this.calculateFinancialHealthScore(debtToAssetRatio, liquidityRatio),
        riskLevel: this.assessRiskLevel(debtToAssetRatio, liquidityRatio)
      };
    } catch (error) {
      console.error('Error getting financial health metrics:', error);
      return null;
    }
  }

  calculateFinancialHealthScore(debtToAssetRatio, liquidityRatio) {
    try {
      let score = 100;
      
      // Penalize high debt-to-asset ratio
      if (debtToAssetRatio > 0.5) {
        score -= (debtToAssetRatio - 0.5) * 100;
      }
      
      // Reward high liquidity ratio
      if (liquidityRatio > 1) {
        score += Math.min((liquidityRatio - 1) * 10, 20);
      } else if (liquidityRatio < 1) {
        score -= (1 - liquidityRatio) * 30;
      }
      
      return Math.max(0, Math.min(100, Math.round(score)));
    } catch (error) {
      console.error('Error calculating financial health score:', error);
      return 50;
    }
  }

  assessRiskLevel(debtToAssetRatio, liquidityRatio) {
    try {
      if (debtToAssetRatio > 0.8 || liquidityRatio < 0.5) {
        return 'high';
      } else if (debtToAssetRatio > 0.5 || liquidityRatio < 1) {
        return 'medium';
      } else {
        return 'low';
      }
    } catch (error) {
      console.error('Error assessing risk level:', error);
      return 'medium';
    }
  }

  // Update export/import to include loans
  exportFinancialData() {
    try {
      const data = {
        expenses: this.getExpenses(),
        income: this.getIncome(),
        budgets: this.getBudgets(),
        goals: this.getGoals(),
        bills: this.getBills(),
        categories: this.getCategories(),
        loans: this.getLoans(),
        loanPayments: this.getLoanPayments(),
        exportedAt: new Date().toISOString()
      };
      return data;
    } catch (error) {
      console.error('Error exporting financial data:', error);
      return null;
    }
  }

  importFinancialData(data) {
    try {
      if (data.expenses) {
        localStorage.setItem(this.EXPENSES_KEY, JSON.stringify(data.expenses));
      }
      if (data.income) {
        localStorage.setItem(this.INCOME_KEY, JSON.stringify(data.income));
      }
      if (data.budgets) {
        localStorage.setItem(this.BUDGETS_KEY, JSON.stringify(data.budgets));
      }
      if (data.goals) {
        localStorage.setItem(this.GOALS_KEY, JSON.stringify(data.goals));
      }
      if (data.bills) {
        localStorage.setItem(this.BILLS_KEY, JSON.stringify(data.bills));
      }
      if (data.categories) {
        localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(data.categories));
      }
      if (data.loans) {
        localStorage.setItem(this.LOANS_KEY, JSON.stringify(data.loans));
      }
      if (data.loanPayments) {
        localStorage.setItem(this.LOAN_PAYMENTS_KEY, JSON.stringify(data.loanPayments));
      }
      return true;
    } catch (error) {
      console.error('Error importing financial data:', error);
      return false;
    }
  }

  // Updated Statistics to include loans
  getFinancialStatistics() {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const monthlySummary = this.getMonthlySummary(currentMonth, currentYear);
      const yearlySummary = this.getYearlySummary(currentYear);
      const upcomingBills = this.getUpcomingBills();
      const goalsProgress = this.getGoalsProgress();
      const loansSummary = this.getLoansSummary();
      const financialHealth = this.getFinancialHealthMetrics();
      
      return {
        currentMonth: monthlySummary,
        currentYear: yearlySummary,
        upcomingBills: upcomingBills.length,
        totalBillsAmount: upcomingBills.reduce((sum, bill) => sum + bill.amount, 0),
        activeGoals: goalsProgress.length,
        achievedGoals: goalsProgress.filter(goal => goal.isAchieved).length,
        averageMonthlyExpenses: yearlySummary ? yearlySummary.totalExpenses / 12 : 0,
        averageMonthlyIncome: yearlySummary ? yearlySummary.totalIncome / 12 : 0,
        loans: loansSummary,
        financialHealth: financialHealth
      };
    } catch (error) {
      console.error('Error getting financial statistics:', error);
      return null;
    }
  }
}

// Create and export singleton instance
const financialService = new FinancialService();
export default financialService;
