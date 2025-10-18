import { useState, useEffect } from 'react';
import financialService from '../lib/financialService';
import { useTranslation } from '../contexts/LanguageContext';

const FinancialTracker = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [bills, setBills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loanPayments, setLoanPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddBill, setShowAddBill] = useState(false);
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [showLoanPayment, setShowLoanPayment] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = () => {
    try {
      setLoading(true);
      const [expensesData, incomeData, budgetsData, goalsData, billsData, categoriesData, statsData, loansData, loanPaymentsData] = [
        financialService.getExpenses(),
        financialService.getIncome(),
        financialService.getBudgets(),
        financialService.getGoals(),
        financialService.getBills(),
        financialService.getCategories(),
        financialService.getFinancialStatistics(),
        financialService.getLoans(),
        financialService.getLoanPayments()
      ];

      setExpenses(expensesData);
      setIncome(incomeData);
      setBudgets(budgetsData);
      setGoals(goalsData);
      setBills(billsData);
      setCategories(categoriesData);
      setStatistics(statsData);
      setLoans(loansData);
      setLoanPayments(loanPaymentsData);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = (expenseData) => {
    const newExpense = financialService.addExpense(expenseData);
    if (newExpense) {
      setExpenses([...expenses, newExpense]);
      setShowAddExpense(false);
      loadFinancialData(); // Refresh statistics
    }
  };

  const handleAddIncome = (incomeData) => {
    const newIncome = financialService.addIncome(incomeData);
    if (newIncome) {
      setIncome([...income, newIncome]);
      setShowAddIncome(false);
      loadFinancialData(); // Refresh statistics
    }
  };

  const handleAddBudget = (budgetData) => {
    const newBudget = financialService.addBudget(budgetData);
    if (newBudget) {
      setBudgets([...budgets, newBudget]);
      setShowAddBudget(false);
      loadFinancialData(); // Refresh statistics
    }
  };

  const handleAddGoal = (goalData) => {
    const newGoal = financialService.addGoal(goalData);
    if (newGoal) {
      setGoals([...goals, newGoal]);
      setShowAddGoal(false);
      loadFinancialData(); // Refresh statistics
    }
  };

  const handleAddBill = (billData) => {
    const newBill = financialService.addBill(billData);
    if (newBill) {
      setBills([...bills, newBill]);
      setShowAddBill(false);
      loadFinancialData(); // Refresh statistics
    }
  };

  const handleMarkBillPaid = (billId) => {
    const updatedBill = financialService.markBillAsPaid(billId);
    if (updatedBill) {
      setBills(bills.map(bill => bill.id === billId ? updatedBill : bill));
      loadFinancialData(); // Refresh statistics
    }
  };

  const handleContributeToGoal = (goalId, amount) => {
    const updatedGoal = financialService.contributeToGoal(goalId, amount);
    if (updatedGoal) {
      setGoals(goals.map(goal => goal.id === goalId ? updatedGoal : goal));
      loadFinancialData(); // Refresh statistics
    }
  };

  const handleAddLoan = (loanData) => {
    const newLoan = financialService.addLoan(loanData);
    if (newLoan) {
      setLoans([...loans, newLoan]);
      setShowAddLoan(false);
      loadFinancialData(); // Refresh statistics
    }
  };

  const handleAddLoanPayment = (paymentData) => {
    try {
      const result = financialService.addLoanPayment(paymentData);
      if (result) {
        setLoans(loans.map(loan => loan.id === paymentData.loanId ? result.loan : loan));
        setLoanPayments([...loanPayments, result.payment]);
        setShowLoanPayment(false);
        setSelectedLoan(null);
        loadFinancialData(); // Refresh statistics
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteLoan = (loanId) => {
    if (confirm(t('financial.loans.confirmDeleteLoan'))) {
      const success = financialService.deleteLoan(loanId);
      if (success) {
        setLoans(loans.filter(loan => loan.id !== loanId));
        setLoanPayments(loanPayments.filter(payment => payment.loanId !== loanId));
        loadFinancialData(); // Refresh statistics
      }
    }
  };

  const getLoanPayments = (loanId) => {
    return loanPayments.filter(payment => payment.loanId === loanId);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount);
  };

  const getCategoryIcon = (categoryId, type) => {
    const categoryList = categories[type] || [];
    const category = categoryList.find(cat => cat.id === categoryId);
    return category ? category.icon : '📌';
  };

  const getCategoryColor = (categoryId, type) => {
    const categoryList = categories[type] || [];
    const category = categoryList.find(cat => cat.id === categoryId);
    return category ? category.color : '#6B7280';
  };

  if (loading) {
    return (
      <div className="financial-tracker">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
        <style jsx>{`
          .financial-tracker {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }

          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            text-align: center;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid var(--border-color);
            border-top: 4px solid var(--accent-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .loading-state p {
            color: var(--text-secondary);
            font-size: 1rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="financial-tracker">
      <div className="financial-header">
        <h2>💰 {t('financial.title')}</h2>
        <div className="header-actions">
          <button 
            className="add-btn"
            onClick={() => setShowAddExpense(true)}
          >
            + {t('financial.expense')}
          </button>
          <button 
            className="add-btn"
            onClick={() => setShowAddIncome(true)}
          >
            + {t('financial.income')}
          </button>
          <button 
            className="add-btn"
            onClick={() => setShowAddBill(true)}
          >
            + {t('financial.bills')}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="financial-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 {t('financial.overview')}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          💳 {t('financial.expenses')}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => setActiveTab('income')}
        >
          💰 {t('financial.income')}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'budgets' ? 'active' : ''}`}
          onClick={() => setActiveTab('budgets')}
        >
          📋 {t('financial.budgets')}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          🎯 {t('financial.goals')}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'bills' ? 'active' : ''}`}
          onClick={() => setActiveTab('bills')}
        >
          📄 {t('financial.bills')}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'loans' ? 'active' : ''}`}
          onClick={() => setActiveTab('loans')}
        >
          🏦 {t('financial.loans.title')}
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && statistics && (
        <div className="overview-content">
          <div className="summary-cards">
            <div className="summary-card income">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h3>{t('financial.statistics.totalIncome')}</h3>
                <div className="card-value">{formatCurrency(statistics.currentMonth?.totalIncome || 0)}</div>
                <div className="card-subtitle">{statistics.currentMonth?.incomeCount || 0} {t('financial.overview')}</div>
              </div>
            </div>

            <div className="summary-card expenses">
              <div className="card-icon">💳</div>
              <div className="card-content">
                <h3>{t('financial.statistics.totalExpenses')}</h3>
                <div className="card-value">{formatCurrency(statistics.currentMonth?.totalExpenses || 0)}</div>
                <div className="card-subtitle">{statistics.currentMonth?.expenseCount || 0} tranzacții</div>
              </div>
            </div>

            <div className="summary-card savings">
              <div className="card-icon">🏦</div>
              <div className="card-content">
                <h3>{t('financial.statistics.netIncome')}</h3>
                <div className="card-value">{formatCurrency(statistics.currentMonth?.netIncome || 0)}</div>
                <div className="card-subtitle">{statistics.currentMonth?.savingsRate?.toFixed(1) || 0}% rată</div>
              </div>
            </div>

            <div className="summary-card bills">
              <div className="card-icon">📄</div>
              <div className="card-content">
                <h3>{t('financial.messages.billDueSoon')}</h3>
                <div className="card-value">{statistics.upcomingBills || 0}</div>
                <div className="card-subtitle">{formatCurrency(statistics.totalBillsAmount || 0)}</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h3>{t('financial.overview')}</h3>
            <div className="action-buttons">
              <button 
                className="action-btn"
                onClick={() => setShowAddBudget(true)}
              >
                📋 {t('financial.addBudget')}
              </button>
              <button 
                className="action-btn"
                onClick={() => setShowAddGoal(true)}
              >
                🎯 {t('financial.addGoal')}
              </button>
              <button 
                className="action-btn"
                onClick={() => setActiveTab('bills')}
              >
                📄 {t('financial.bills')}
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="recent-transactions">
            <h3>{t('financial.transactions')}</h3>
            <div className="transaction-list">
              {expenses.slice(0, 5).map(expense => (
                <div key={expense.id} className="transaction-item expense">
                  <div className="transaction-icon" style={{ backgroundColor: getCategoryColor(expense.category, 'expenses') }}>
                    {getCategoryIcon(expense.category, 'expenses')}
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-title">{expense.description}</div>
                    <div className="transaction-date">{expense.date}</div>
                  </div>
                  <div className="transaction-amount negative">
                    -{formatCurrency(expense.amount)}
                  </div>
                </div>
              ))}
              {income.slice(0, 3).map(incomeItem => (
                <div key={incomeItem.id} className="transaction-item income">
                  <div className="transaction-icon" style={{ backgroundColor: getCategoryColor(incomeItem.category, 'income') }}>
                    {getCategoryIcon(incomeItem.category, 'income')}
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-title">{incomeItem.description}</div>
                    <div className="transaction-date">{incomeItem.date}</div>
                  </div>
                  <div className="transaction-amount positive">
                    +{formatCurrency(incomeItem.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="expenses-content">
          <div className="section-header">
            <h3>{t('financial.expenses')}</h3>
            <button 
              className="add-btn"
              onClick={() => setShowAddExpense(true)}
            >
              + {t('financial.addExpense')}
            </button>
          </div>
          <div className="expense-list">
            {expenses.map(expense => (
              <div key={expense.id} className="expense-item">
                <div className="expense-icon" style={{ backgroundColor: getCategoryColor(expense.category, 'expenses') }}>
                  {getCategoryIcon(expense.category, 'expenses')}
                </div>
                <div className="expense-details">
                  <div className="expense-title">{expense.description}</div>
                  <div className="expense-meta">
                    <span className="expense-date">{expense.date}</span>
                    <span className="expense-category">{expense.category}</span>
                  </div>
                </div>
                <div className="expense-amount">
                  -{formatCurrency(expense.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Income Tab */}
      {activeTab === 'income' && (
        <div className="income-content">
          <div className="section-header">
            <h3>{t('financial.income')}</h3>
            <button 
              className="add-btn"
              onClick={() => setShowAddIncome(true)}
            >
              + {t('financial.addIncome')}
            </button>
          </div>
          <div className="income-list">
            {income.map(incomeItem => (
              <div key={incomeItem.id} className="income-item">
                <div className="income-icon" style={{ backgroundColor: getCategoryColor(incomeItem.category, 'income') }}>
                  {getCategoryIcon(incomeItem.category, 'income')}
                </div>
                <div className="income-details">
                  <div className="income-title">{incomeItem.description}</div>
                  <div className="income-meta">
                    <span className="income-date">{incomeItem.date}</span>
                    <span className="income-category">{incomeItem.category}</span>
                  </div>
                </div>
                <div className="income-amount">
                  +{formatCurrency(incomeItem.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budgets Tab */}
      {activeTab === 'budgets' && (
        <div className="budgets-content">
          <div className="section-header">
            <h3>{t('financial.budgets')}</h3>
            <button 
              className="add-btn"
              onClick={() => setShowAddBudget(true)}
            >
              + {t('financial.addBudget')}
            </button>
          </div>
          <div className="budget-list">
            {budgets.map(budget => (
              <div key={budget.id} className="budget-item">
                <div className="budget-header">
                  <h4>{budget.categoryName}</h4>
                  <span className="budget-period">{budget.month}/{budget.year}</span>
                </div>
                <div className="budget-progress">
                  <div className="budget-bar">
                    <div 
                      className="budget-fill"
                      style={{ 
                        width: `${Math.min((budget.spent / budget.amount) * 100, 100)}%`,
                        backgroundColor: budget.spent > budget.amount ? '#EF4444' : '#10B981'
                      }}
                    />
                  </div>
                  <div className="budget-info">
                    <span>{formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}</span>
                    <span className={`budget-status ${budget.spent > budget.amount ? 'over' : 'under'}`}>
                      {budget.spent > budget.amount ? t('financial.messages.budgetExceeded') : t('financial.budgets')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="goals-content">
          <div className="section-header">
            <h3>{t('financial.goals')}</h3>
            <button 
              className="add-btn"
              onClick={() => setShowAddGoal(true)}
            >
              + {t('financial.addGoal')}
            </button>
          </div>
          <div className="goals-list">
            {goals.map(goal => {
              const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal.id} className="goal-item">
                  <div className="goal-header">
                    <h4>{goal.name}</h4>
                    <span className="goal-priority">{goal.priority}</span>
                  </div>
                  <div className="goal-progress">
                    <div className="goal-bar">
                      <div 
                        className="goal-fill"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="goal-info">
                      <span>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                      <span>{progressPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  {goal.deadline && (
                    <div className="goal-deadline">
                      {t('financial.targetDate')}: {new Date(goal.deadline).toLocaleDateString('ro-RO')}
                    </div>
                  )}
                  <div className="goal-actions">
                    <input 
                      type="number" 
                      placeholder={t('financial.amount')}
                      className="contribution-input"
                      id={`contribution-${goal.id}`}
                    />
                    <button 
                      className="contribute-btn"
                      onClick={() => {
                        const input = document.getElementById(`contribution-${goal.id}`);
                        const amount = parseFloat(input.value);
                        if (amount > 0) {
                          handleContributeToGoal(goal.id, amount);
                          input.value = '';
                        }
                      }}
                    >
                      {t('financial.messages.goalAchieved')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bills Tab */}
      {activeTab === 'bills' && (
        <div className="bills-content">
          <div className="section-header">
            <h3>{t('financial.bills')}</h3>
            <button 
              className="add-btn"
              onClick={() => setShowAddBill(true)}
            >
              + {t('financial.addBill')}
            </button>
          </div>
          <div className="bills-list">
            {bills.map(bill => (
              <div key={bill.id} className={`bill-item ${bill.isPaid ? 'paid' : 'unpaid'}`}>
                <div className="bill-header">
                  <h4>{bill.name}</h4>
                  <span className={`bill-status ${bill.isPaid ? 'paid' : 'unpaid'}`}>
                    {bill.isPaid ? t('financial.paid') : t('financial.unpaid')}
                  </span>
                </div>
                <div className="bill-details">
                  <div className="bill-amount">{formatCurrency(bill.amount)}</div>
                  <div className="bill-due">{t('financial.dueDate')}: {bill.dueDate}</div>
                  {bill.isPaid && bill.paidDate && (
                    <div className="bill-paid">{t('financial.paid')}: {bill.paidDate}</div>
                  )}
                </div>
                {!bill.isPaid && (
                  <div className="bill-actions">
                    <button 
                      className="pay-btn"
                      onClick={() => handleMarkBillPaid(bill.id)}
                    >
                      {t('financial.messages.billDueSoon')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loans Tab */}
      {activeTab === 'loans' && (
        <div className="loans-content">
          <div className="section-header">
            <h3>{t('financial.loans.title')}</h3>
            <div className="loan-actions">
              <button 
                className="add-btn loan-given-btn"
                onClick={() => setShowAddLoan('given')}
              >
                + {t('financial.loans.addLoan')}
              </button>
              <button 
                className="add-btn loan-received-btn"
                onClick={() => setShowAddLoan('received')}
              >
                + {t('financial.loans.addDebt')}
              </button>
            </div>
          </div>
          
          {/* Net Worth Summary */}
          {statistics?.loans && (
            <div className="loans-summary">
              <div className="summary-card assets-summary">
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <h4>{t('financial.loans.totalAssets')}</h4>
                  <div className="card-value">{formatCurrency(statistics.loans.totalAssets)}</div>
                  <div className="card-subtitle">{statistics.loans.loansGiven} {t('financial.loans.myLoans')}</div>
                </div>
              </div>
              <div className="summary-card liabilities-summary">
                <div className="card-icon">💳</div>
                <div className="card-content">
                  <h4>{t('financial.loans.totalLiabilities')}</h4>
                  <div className="card-value">{formatCurrency(statistics.loans.totalLiabilities)}</div>
                  <div className="card-subtitle">{statistics.loans.loansReceived} {t('financial.loans.myDebts')}</div>
                </div>
              </div>
              <div className="summary-card net-worth-summary" style={{ 
                background: statistics.loans.netWorth >= 0 ? '#F0FDF4' : '#FEF2F2',
                borderColor: statistics.loans.netWorth >= 0 ? '#10B981' : '#EF4444'
              }}>
                <div className="card-icon" style={{ 
                  background: statistics.loans.netWorth >= 0 ? '#10B981' : '#EF4444',
                  color: 'white'
                }}>📊</div>
                <div className="card-content">
                  <h4>{t('financial.loans.netWorth')}</h4>
                  <div className="card-value" style={{ 
                    color: statistics.loans.netWorth >= 0 ? '#10B981' : '#EF4444'
                  }}>{formatCurrency(statistics.loans.netWorth)}</div>
                  <div className="card-subtitle">
                    {statistics.loans.netWorth >= 0 ? t('financial.loans.assets') : t('financial.loans.liabilities')} {'>'} {t('financial.loans.liabilities')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loans Given */}
          <div className="loans-section">
            <h4>💰 {t('financial.loans.myLoans')}</h4>
            <div className="loans-list">
              {loans.filter(loan => loan.type === 'given').map(loan => {
                const payments = getLoanPayments(loan.id);
                const progressPercentage = (loan.totalPaid / loan.principalAmount) * 100;
                return (
                  <div key={loan.id} className="loan-item asset-item">
                    <div className="loan-header">
                      <h5>{t('financial.loans.loanTo', { name: loan.personName })}</h5>
                      <span className={`loan-status status-${loan.status}`}>
                        {t(`financial.loans.${loan.status}`)}
                      </span>
                    </div>
                    <div className="loan-details">
                      <div className="loan-amounts">
                        <div className="loan-amount-row">
                          <span>{t('financial.loans.originalAmount')}:</span>
                          <span>{formatCurrency(loan.principalAmount)}</span>
                        </div>
                        <div className="loan-amount-row">
                          <span>{t('financial.loans.currentBalance')}:</span>
                          <span className={loan.currentBalance > 0 ? 'positive' : 'neutral'}>
                            {formatCurrency(loan.currentBalance)}
                          </span>
                        </div>
                        <div className="loan-amount-row">
                          <span>{t('financial.loans.amountPaid')}:</span>
                          <span className="positive">{formatCurrency(loan.totalPaid)}</span>
                        </div>
                      </div>
                      <div className="loan-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          />
                        </div>
                        <span>{progressPercentage.toFixed(1)}%</span>
                      </div>
                      {loan.dueDate && (
                        <div className="loan-dates">
                          <span>{t('financial.loans.startDate')}: {loan.startDate}</span>
                          {loan.dueDate && <span>{t('financial.loans.dueDate')}: {loan.dueDate}</span>}
                        </div>
                      )}
                    </div>
                    <div className="loan-actions">
                      <button 
                        className="payment-btn"
                        onClick={() => {
                          setSelectedLoan(loan);
                          setShowLoanPayment(true);
                        }}
                      >
                        {t('financial.loans.addPayment')}
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteLoan(loan.id)}
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                    {payments.length > 0 && (
                      <div className="loan-payments">
                        <h6>{t('financial.loans.paymentHistory')}</h6>
                        {payments.slice(0, 3).map(payment => (
                          <div key={payment.id} className="payment-item">
                            <span>{payment.date}</span>
                            <span className="payment-amount positive">
                              +{formatCurrency(payment.amount)}
                            </span>
                            {payment.note && <span className="payment-note">{payment.note}</span>}
                          </div>
                        ))}
                        {payments.length > 3 && (
                          <div className="more-payments">
                            +{payments.length - 3} {t('financial.loans.morePayments')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {loans.filter(loan => loan.type === 'given').length === 0 && (
                <div className="no-data">
                  <p>{t('financial.loans.noLoans')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Loans Received */}
          <div className="loans-section">
            <h4>💳 {t('financial.loans.myDebts')}</h4>
            <div className="loans-list">
              {loans.filter(loan => loan.type === 'received').map(loan => {
                const payments = getLoanPayments(loan.id);
                const progressPercentage = (loan.totalPaid / loan.principalAmount) * 100;
                return (
                  <div key={loan.id} className="loan-item liability-item">
                    <div className="loan-header">
                      <h5>{t('financial.loans.loanFrom', { name: loan.personName })}</h5>
                      <span className={`loan-status status-${loan.status}`}>
                        {t(`financial.loans.${loan.status}`)}
                      </span>
                    </div>
                    <div className="loan-details">
                      <div className="loan-amounts">
                        <div className="loan-amount-row">
                          <span>{t('financial.loans.originalAmount')}:</span>
                          <span>{formatCurrency(loan.principalAmount)}</span>
                        </div>
                        <div className="loan-amount-row">
                          <span>{t('financial.loans.currentBalance')}:</span>
                          <span className={loan.currentBalance > 0 ? 'negative' : 'neutral'}>
                            {formatCurrency(loan.currentBalance)}
                          </span>
                        </div>
                        <div className="loan-amount-row">
                          <span>{t('financial.loans.amountPaid')}:</span>
                          <span className="positive">{formatCurrency(loan.totalPaid)}</span>
                        </div>
                      </div>
                      <div className="loan-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          />
                        </div>
                        <span>{progressPercentage.toFixed(1)}%</span>
                      </div>
                      {loan.dueDate && (
                        <div className="loan-dates">
                          <span>{t('financial.loans.startDate')}: {loan.startDate}</span>
                          {loan.dueDate && <span>{t('financial.loans.dueDate')}: {loan.dueDate}</span>}
                        </div>
                      )}
                    </div>
                    <div className="loan-actions">
                      <button 
                        className="payment-btn"
                        onClick={() => {
                          setSelectedLoan(loan);
                          setShowLoanPayment(true);
                        }}
                      >
                        {t('financial.loans.addPayment')}
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteLoan(loan.id)}
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                    {payments.length > 0 && (
                      <div className="loan-payments">
                        <h6>{t('financial.loans.paymentHistory')}</h6>
                        {payments.slice(0, 3).map(payment => (
                          <div key={payment.id} className="payment-item">
                            <span>{payment.date}</span>
                            <span className="payment-amount negative">
                              -{formatCurrency(payment.amount)}
                            </span>
                            {payment.note && <span className="payment-note">{payment.note}</span>}
                          </div>
                        ))}
                        {payments.length > 3 && (
                          <div className="more-payments">
                            +{payments.length - 3} {t('financial.loans.morePayments')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {loans.filter(loan => loan.type === 'received').length === 0 && (
                <div className="no-data">
                  <p>{t('financial.loans.noDebts')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <ExpenseModal 
          categories={categories.expenses}
          onSave={handleAddExpense}
          onClose={() => setShowAddExpense(false)}
        />
      )}

      {/* Add Income Modal */}
      {showAddIncome && (
        <IncomeModal 
          categories={categories.income}
          onSave={handleAddIncome}
          onClose={() => setShowAddIncome(false)}
        />
      )}

      {/* Add Budget Modal */}
      {showAddBudget && (
        <BudgetModal 
          categories={categories.expenses}
          onSave={handleAddBudget}
          onClose={() => setShowAddBudget(false)}
        />
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <GoalModal 
          onSave={handleAddGoal}
          onClose={() => setShowAddGoal(false)}
        />
      )}

      {/* Add Bill Modal */}
      {showAddBill && (
        <BillModal 
          categories={categories.expenses}
          onSave={handleAddBill}
          onClose={() => setShowAddBill(false)}
        />
      )}

      {/* Add Loan Modal */}
      {showAddLoan && (
        <LoanModal 
          loanType={showAddLoan}
          onSave={handleAddLoan}
          onClose={() => setShowAddLoan(false)}
        />
      )}

      {/* Add Loan Payment Modal */}
      {showLoanPayment && selectedLoan && (
        <LoanPaymentModal 
          loan={selectedLoan}
          onSave={handleAddLoanPayment}
          onClose={() => {
            setShowLoanPayment(false);
            setSelectedLoan(null);
          }}
        />
      )}

      <style jsx>{`
        .financial-tracker {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .financial-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          background: linear-gradient(135deg, #10B981, #059669);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .financial-header h2 {
          margin: 0;
          color: white;
          font-size: 1.8rem;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .add-btn {
          background: white;
          color: #10B981;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .add-btn:hover {
          background: #f0fdf4;
          transform: translateY(-2px);
        }

        .financial-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          border-bottom: 2px solid var(--border-color);
          overflow-x: auto;
        }

        .tab-btn {
          background: transparent;
          border: none;
          padding: 12px 20px;
          cursor: pointer;
          font-weight: 500;
          color: var(--text-secondary);
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .tab-btn:hover {
          color: var(--text-primary);
        }

        .tab-btn.active {
          color: var(--accent-color);
          border-bottom-color: var(--accent-color);
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .summary-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          transition: all 0.3s ease;
        }

        .summary-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .card-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .income .card-icon {
          background: #10B981;
          color: white;
        }

        .expenses .card-icon {
          background: #EF4444;
          color: white;
        }

        .savings .card-icon {
          background: #3B82F6;
          color: white;
        }

        .bills .card-icon {
          background: #F59E0B;
          color: white;
        }

        .card-content h3 {
          margin: 0 0 5px 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .card-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--text-primary);
        }

        .card-subtitle {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .quick-actions {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .quick-actions h3 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .action-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: #38a169;
          transform: translateY(-1px);
        }

        .recent-transactions {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
        }

        .recent-transactions h3 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
        }

        .transaction-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg-primary);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .transaction-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .transaction-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
        }

        .transaction-details {
          flex: 1;
        }

        .transaction-title {
          font-weight: 600;
          color: var(--text-primary);
        }

        .transaction-date {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .transaction-amount {
          font-weight: bold;
          font-size: 1rem;
        }

        .transaction-amount.positive {
          color: #10B981;
        }

        .transaction-amount.negative {
          color: #EF4444;
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

        .expense-list, .income-list, .budget-list, .goals-list, .bills-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .expense-item, .income-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .expense-item:hover, .income-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .expense-icon, .income-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
        }

        .expense-details, .income-details {
          flex: 1;
        }

        .expense-title, .income-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 5px;
        }

        .expense-meta, .income-meta {
          display: flex;
          gap: 10px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .expense-amount {
          font-weight: bold;
          color: #EF4444;
          font-size: 1.1rem;
        }

        .income-amount {
          font-weight: bold;
          color: #10B981;
          font-size: 1.1rem;
        }

        .budget-item {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 15px;
        }

        .budget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .budget-header h4 {
          margin: 0;
          color: var(--text-primary);
        }

        .budget-period {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .budget-bar {
          width: 100%;
          height: 8px;
          background: var(--bg-primary);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 5px;
        }

        .budget-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .budget-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }

        .budget-status.over {
          color: #EF4444;
        }

        .budget-status.under {
          color: #10B981;
        }

        .goal-item {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 15px;
        }

        .goal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .goal-header h4 {
          margin: 0;
          color: var(--text-primary);
        }

        .goal-priority {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          background: var(--accent-color);
          color: white;
        }

        .goal-bar {
          width: 100%;
          height: 8px;
          background: var(--bg-primary);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 5px;
        }

        .goal-fill {
          height: 100%;
          background: var(--accent-color);
          transition: width 0.3s ease;
        }

        .goal-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          margin-bottom: 10px;
        }

        .goal-deadline {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 10px;
        }

        .goal-actions {
          display: flex;
          gap: 10px;
        }

        .contribution-input {
          flex: 1;
          padding: 8px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .contribute-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .contribute-btn:hover {
          background: #38a169;
        }

        .bill-item {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 15px;
        }

        .bill-item.paid {
          opacity: 0.7;
        }

        .bill-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .bill-header h4 {
          margin: 0;
          color: var(--text-primary);
        }

        .bill-status {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .bill-status.paid {
          background: #10B981;
          color: white;
        }

        .bill-status.unpaid {
          background: #EF4444;
          color: white;
        }

        .bill-details {
          margin-bottom: 10px;
        }

        .bill-amount {
          font-weight: bold;
          color: var(--text-primary);
          margin-bottom: 5px;
        }

        .bill-due, .bill-paid {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .pay-btn {
          background: #10B981;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .pay-btn:hover {
          background: #059669;
        }

        @media (max-width: 768px) {
          .financial-header {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }

          .header-actions {
            justify-content: center;
          }

          .summary-cards {
            grid-template-columns: 1fr;
          }

          .financial-tabs {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .tab-btn {
            flex-shrink: 0;
          }

          .action-buttons {
            justify-content: center;
          }

          .transaction-item {
            padding: 10px;
          }

          .goal-actions {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .financial-tracker {
            padding: 15px;
          }

          .summary-cards {
            gap: 15px;
          }

          .summary-card {
            padding: 15px;
          }

          .card-icon {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }

          .card-value {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
};

// Modal Components with translations
const ExpenseModal = ({ categories, onSave, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    amount: '',
    category: categories[0]?.id || '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.amount && formData.category) {
      onSave(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{t('financial.addTransaction')}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('financial.amount')}</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('financial.category')}</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>{t('financial.description')}</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder={t('financial.description')}
            />
          </div>
          <div className="form-group">
            <label>{t('financial.date')}</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('financial.account')}</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
            >
              <option value="cash">{t('financial.accountTypes.cash')}</option>
              <option value="card">{t('financial.accountTypes.credit')}</option>
              <option value="transfer">{t('financial.transfer')}</option>
              <option value="other">{t('financial.accountTypes.other')}</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>{t('common.cancel')}</button>
            <button type="submit" className="save-btn">{t('common.save')}</button>
          </div>
        </form>
      </div>
      <style jsx>{`
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
        }

        .modal-content {
          background: var(--bg-primary);
          border-radius: 12px;
          padding: 20px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-secondary);
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 1rem;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .cancel-btn {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .save-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .save-btn:hover {
          background: #38a169;
        }
      `}</style>
    </div>
  );
};

const IncomeModal = ({ categories, onSave, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    amount: '',
    category: categories[0]?.id || '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.amount && formData.category) {
      onSave(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{t('financial.addIncome')}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('financial.amount')}</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('financial.category')}</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>{t('financial.description')}</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder={t('financial.description')}
            />
          </div>
          <div className="form-group">
            <label>{t('financial.date')}</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
              />
              {' '}{t('financial.recurring')}
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>{t('common.cancel')}</button>
            <button type="submit" className="save-btn">{t('common.save')}</button>
          </div>
        </form>
      </div>
      <style jsx>{`
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
        }

        .modal-content {
          background: var(--bg-primary);
          border-radius: 12px;
          padding: 20px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-secondary);
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 1rem;
        }

        .form-group input[type="checkbox"] {
          width: auto;
          margin-right: 8px;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .cancel-btn {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .save-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .save-btn:hover {
          background: #38a169;
        }
      `}</style>
    </div>
  );
};

const BudgetModal = ({ categories, onSave, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    categoryId: categories[0]?.id || '',
    categoryName: categories[0]?.name || '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.amount && formData.categoryId) {
      onSave(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{t('financial.addBudget')}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('financial.category')}</label>
            <select
              value={formData.categoryId}
              onChange={(e) => {
                const category = categories.find(cat => cat.id === e.target.value);
                setFormData({
                  ...formData, 
                  categoryId: e.target.value, 
                  categoryName: category?.name || ''
                });
              }}
              required
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>{t('financial.period')}</label>
            <select
              value={formData.month}
              onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}
              required
            >
              <option value={1}>January</option>
              <option value={2}>February</option>
              <option value={3}>March</option>
              <option value={4}>April</option>
              <option value={5}>May</option>
              <option value={6}>June</option>
              <option value={7}>July</option>
              <option value={8}>August</option>
              <option value={9}>September</option>
              <option value={10}>October</option>
              <option value={11}>November</option>
              <option value={12}>December</option>
            </select>
          </div>
          <div className="form-group">
            <label>Year</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
              min="2020"
              max="2030"
              required
            />
          </div>
          <div className="form-group">
            <label>{t('financial.budgetAmount')}</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder={t('financial.budgetAmount')}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>{t('common.cancel')}</button>
            <button type="submit" className="save-btn">{t('common.save')}</button>
          </div>
        </form>
      </div>
      <style jsx>{`
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
        }

        .modal-content {
          background: var(--bg-primary);
          border-radius: 12px;
          padding: 20px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-secondary);
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 1rem;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .cancel-btn {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .save-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .save-btn:hover {
          background: #38a169;
        }
      `}</style>
    </div>
  );
};

const GoalModal = ({ onSave, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    category: 'savings',
    deadline: '',
    priority: 'medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.targetAmount) {
      onSave(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{t('financial.addGoal')}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('financial.goalName')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder={t('financial.goalName')}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('financial.description')}</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder={t('financial.description')}
            />
          </div>
          <div className="form-group">
            <label>{t('financial.targetAmount')}</label>
            <input
              type="number"
              step="0.01"
              value={formData.targetAmount}
              onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
              placeholder={t('financial.targetAmount')}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('financial.currentAmount')}</label>
            <input
              type="number"
              step="0.01"
              value={formData.currentAmount}
              onChange={(e) => setFormData({...formData, currentAmount: e.target.value})}
              placeholder={t('financial.currentAmount')}
            />
          </div>
          <div className="form-group">
            <label>{t('financial.category')}</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="savings">{t('financial.categories.savings')}</option>
              <option value="investment">{t('financial.categories.investments')}</option>
              <option value="purchase">{t('financial.categories.shopping')}</option>
              <option value="emergency">{t('financial.accountTypes.other')}</option>
              <option value="other">{t('financial.categories.other')}</option>
            </select>
          </div>
          <div className="form-group">
            <label>{t('financial.targetDate')}</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>{t('common.cancel')}</button>
            <button type="submit" className="save-btn">{t('common.save')}</button>
          </div>
        </form>
      </div>
      <style jsx>{`
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
        }

        .modal-content {
          background: var(--bg-primary);
          border-radius: 12px;
          padding: 20px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-secondary);
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 1rem;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .cancel-btn {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .save-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .save-btn:hover {
          background: #38a169;
        }
      `}</style>
    </div>
  );
};

const BillModal = ({ categories, onSave, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: categories[0]?.id || 'utilities',
    dueDate: '',
    frequency: 'monthly',
    isRecurring: true,
    reminderDays: 3
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.amount && formData.dueDate) {
      onSave(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{t('financial.addBill')}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('financial.billName')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder={t('financial.billName')}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('financial.amount')}</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder={t('financial.amount')}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('financial.category')}</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>{t('financial.dueDate')}</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('financial.frequency')}</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({...formData, frequency: e.target.value})}
            >
              <option value="weekly">{t('financial.weekly')}</option>
              <option value="monthly">{t('financial.monthly')}</option>
              <option value="yearly">{t('financial.yearly')}</option>
              <option value="once">Once</option>
            </select>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
              />
              {' '}{t('financial.recurring')}
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>{t('common.cancel')}</button>
            <button type="submit" className="save-btn">{t('common.save')}</button>
          </div>
        </form>
      </div>
      <style jsx>{`
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
        }

        .modal-content {
          background: var(--bg-primary);
          border-radius: 12px;
          padding: 20px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-secondary);
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 1rem;
        }

        .form-group input[type="checkbox"] {
          width: auto;
          margin-right: 8px;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .cancel-btn {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .save-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .save-btn:hover {
          background: #38a169;
        }
      `}</style>
    </div>
  );
};

// Loan Modal
const LoanModal = ({ loanType, onSave, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    type: loanType,
    personName: '',
    principalAmount: '',
    interestRate: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.personName && formData.principalAmount) {
      onSave({
        ...formData,
        principalAmount: parseFloat(formData.principalAmount),
        interestRate: parseFloat(formData.interestRate) || 0
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>
            {loanType === 'given' ? t('financial.loans.addLoan') : t('financial.loans.addDebt')}
          </h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              {loanType === 'given' ? t('financial.loans.borrower') : t('financial.loans.lender')}
            </label>
            <input
              type="text"
              value={formData.personName}
              onChange={(e) => setFormData({...formData, personName: e.target.value})}
              placeholder={loanType === 'given' ? t('financial.loans.borrower') : t('financial.loans.lender')}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('financial.loans.principalAmount')}</label>
            <input
              type="number"
              step="0.01"
              value={formData.principalAmount}
              onChange={(e) => setFormData({...formData, principalAmount: e.target.value})}
              placeholder={t('financial.loans.principalAmount')}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('financial.loans.interestRate')} (%)</label>
            <input
              type="number"
              step="0.01"
              value={formData.interestRate}
              onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
              placeholder={t('financial.loans.interestRate')}
            />
          </div>
          <div className="form-group">
            <label>{t('financial.loans.startDate')}</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('financial.loans.dueDate')}</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>{t('financial.description')}</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder={t('financial.description')}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>{t('common.cancel')}</button>
            <button type="submit" className="save-btn">{t('common.save')}</button>
          </div>
        </form>
      </div>
      <style jsx>{`
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
        }

        .modal-content {
          background: var(--bg-primary);
          border-radius: 12px;
          padding: 20px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-secondary);
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 1rem;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .cancel-btn {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .save-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .save-btn:hover {
          background: #38a169;
        }
      `}</style>
    </div>
  );
};

// Loan Payment Modal
const LoanPaymentModal = ({ loan, onSave, onClose }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    loanId: loan.id,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.amount) {
      onSave({
        ...formData,
        amount: parseFloat(formData.amount)
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{t('financial.loans.addPayment')}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('financial.loans.paymentFor')}</label>
            <div className="payment-info">
              <strong>{loan.personName}</strong>
              <span>{t('financial.loans.currentBalance')}: {loan.currentBalance > 0 ? t('financial.loans.amountOwed') : ''}</span>
            </div>
          </div>
          <div className="form-group">
            <label>{t('financial.amount')}</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder={t('financial.amount')}
              required
              max={loan.currentBalance}
            />
          </div>
          <div className="form-group">
            <label>{t('financial.date')}</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('financial.description')}</label>
            <input
              type="text"
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
              placeholder={t('financial.description')}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>{t('common.cancel')}</button>
            <button type="submit" className="save-btn">{t('common.save')}</button>
          </div>
        </form>
      </div>
      <style jsx>{`
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
        }

        .modal-content {
          background: var(--bg-primary);
          border-radius: 12px;
          padding: 20px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .modal-header h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-secondary);
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 1rem;
        }

        .payment-info {
          padding: 10px;
          background: var(--bg-secondary);
          border-radius: 6px;
          margin-bottom: 5px;
        }

        .payment-info strong {
          display: block;
          margin-bottom: 5px;
          color: var(--text-primary);
        }

        .payment-info span {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .cancel-btn {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .save-btn {
          background: var(--accent-color);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .save-btn:hover {
          background: #38a169;
        }
      `}</style>
    </div>
  );
};

export default FinancialTracker;
