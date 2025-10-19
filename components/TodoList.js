import { useState, useEffect } from 'react';
import todoService from '../lib/todoService';
import { useTranslation } from '../contexts/LanguageContext';

const TodoList = () => {
  const { t } = useTranslation();
  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [activeTab, setActiveTab] = useState('todos'); // todos, categories, tags, stats
  const [showAddTodoForm, setShowAddTodoForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [filter, setFilter] = useState({
    completed: null,
    priority: '',
    category: '',
    tags: [],
    dueDate: '',
    overdue: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTodos, setExpandedTodos] = useState(new Set());

  // Form states
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    dueTime: '',
    category: 'personal',
    tags: [],
    isRecurring: false,
    recurringPattern: 'daily',
    estimatedTime: 0
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#3B82F6',
    icon: '📁',
    description: ''
  });

  const [newTag, setNewTag] = useState({
    name: '',
    color: '#3B82F6'
  });

  const priorities = [
    { value: 'low', label: '🟢 Low', color: '#10B981' },
    { value: 'medium', label: '🟡 Medium', color: '#F59E0B' },
    { value: 'high', label: '🟠 High', color: '#EF4444' },
    { value: 'urgent', label: '🔴 Urgent', color: '#DC2626' }
  ];

  const recurringPatterns = [
    { value: 'daily', label: '📅 Daily' },
    { value: 'weekly', label: '📆 Weekly' },
    { value: 'monthly', label: '📅 Monthly' }
  ];

  const icons = ['👤', '💼', '🛒', '🏃', '📚', '🏠', '🚗', '✈️', '🎯', '🎨', '🎵', '🍳'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      // Update timers for active todos
      const activeTimers = todos.filter(todo => todo.timerStartTime);
      if (activeTimers.length > 0) {
        loadData();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [todos]);

  const loadData = () => {
    setTodos(todoService.getTodos());
    setCategories(todoService.getCategories());
    setTags(todoService.getTags());
    setStatistics(todoService.getTodoStatistics());
  };

  const handleAddTodo = () => {
    if (!newTodo.title.trim()) return;

    if (editingTodo) {
      todoService.updateTodo(editingTodo.id, newTodo);
      setEditingTodo(null);
    } else {
      todoService.addTodo(newTodo);
    }

    setNewTodo({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      dueTime: '',
      category: 'personal',
      tags: [],
      isRecurring: false,
      recurringPattern: 'daily',
      estimatedTime: 0
    });
    setShowAddTodoForm(false);
    loadData();
  };

  const handleEditTodo = (todo) => {
    setEditingTodo(todo);
    setNewTodo({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      dueDate: todo.dueDate,
      dueTime: todo.dueTime,
      category: todo.category,
      tags: todo.tags,
      isRecurring: todo.isRecurring,
      recurringPattern: todo.recurringPattern,
      estimatedTime: todo.estimatedTime
    });
    setShowAddTodoForm(true);
  };

  const handleDeleteTodo = (todoId) => {
    if (confirm('Are you sure you want to delete this todo?')) {
      todoService.deleteTodo(todoId);
      loadData();
    }
  };

  const handleToggleTodo = (todoId) => {
    const todo = todos.find(t => t.id === todoId);
    if (todo?.isRecurring && !todo.completed) {
      todoService.completeRecurringTodo(todoId);
    } else {
      todoService.toggleTodo(todoId);
    }
    loadData();
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return;

    todoService.addCategory(newCategory);
    setNewCategory({
      name: '',
      color: '#3B82F6',
      icon: '📁',
      description: ''
    });
    loadData();
  };

  const handleDeleteCategory = (categoryId) => {
    if (confirm('Are you sure you want to delete this category?')) {
      todoService.deleteCategory(categoryId);
      loadData();
    }
  };

  const handleAddTag = () => {
    if (!newTag.name.trim()) return;

    todoService.addTag(newTag);
    setNewTag({
      name: '',
      color: '#3B82F6'
    });
    loadData();
  };

  const handleDeleteTag = (tagId) => {
    todoService.deleteTag(tagId);
    loadData();
  };

  const handleAddSubtask = (todoId) => {
    const subtask = {
      title: prompt('Enter subtask title:')
    };
    if (subtask.title) {
      todoService.addSubtask(todoId, subtask);
      loadData();
    }
  };

  const handleToggleSubtask = (todoId, subtaskId) => {
    todoService.toggleSubtask(todoId, subtaskId);
    loadData();
  };

  const handleDeleteSubtask = (todoId, subtaskId) => {
    if (confirm('Are you sure you want to delete this subtask?')) {
      todoService.deleteSubtask(todoId, subtaskId);
      loadData();
    }
  };

  const handleStartTimer = (todoId) => {
    todoService.startTodoTimer(todoId);
    loadData();
  };

  const handleStopTimer = (todoId) => {
    todoService.stopTodoTimer(todoId);
    loadData();
  };

  const toggleTodoExpanded = (todoId) => {
    const newExpanded = new Set(expandedTodos);
    if (newExpanded.has(todoId)) {
      newExpanded.delete(todoId);
    } else {
      newExpanded.add(todoId);
    }
    setExpandedTodos(newExpanded);
  };

  const getPriorityColor = (priority) => {
    const priorityConfig = priorities.find(p => p.value === priority);
    return priorityConfig ? priorityConfig.color : '#6B7280';
  };

  const getCategoryIcon = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.icon : '📁';
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.color : '#6B7280';
  };

  const formatTimer = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isOverdue = (todo) => {
    if (!todo.dueDate || todo.completed) return false;
    const dueDate = new Date(todo.dueDate);
    const now = new Date();
    if (todo.dueTime) {
      const [hours, minutes] = todo.dueTime.split(':');
      dueDate.setHours(parseInt(hours));
      dueDate.setMinutes(parseInt(minutes));
    }
    return dueDate < now;
  };

  const isDueToday = (todo) => {
    if (!todo.dueDate || todo.completed) return false;
    const dueDate = new Date(todo.dueDate);
    const now = new Date();
    return dueDate.toDateString() === now.toDateString();
  };

  const getSubtaskProgress = (subtasks) => {
    if (subtasks.length === 0) return 0;
    const completed = subtasks.filter(st => st.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  };

  const renderTodoCard = (todo) => {
    const isExpanded = expandedTodos.has(todo.id);
    const subtaskProgress = getSubtaskProgress(todo.subtasks || []);
    const isTimerActive = todo.timerStartTime;

    return (
      <div key={todo.id} className={`todo-card ${todo.completed ? 'completed' : ''} ${isOverdue(todo) ? 'overdue' : ''} ${isDueToday(todo) ? 'due-today' : ''}`}>
        <div className="todo-header">
          <div className="todo-info">
            <div className="todo-checkbox">
              <button 
                className={`checkbox ${todo.completed ? 'checked' : ''}`}
                onClick={() => handleToggleTodo(todo.id)}
              >
                {todo.completed ? '✓' : ''}
              </button>
            </div>
            <div className="todo-details">
              <h3 className={todo.completed ? 'completed-title' : ''}>
                {todo.title}
              </h3>
              {todo.description && (
                <p className="todo-description">{todo.description}</p>
              )}
              <div className="todo-meta">
                <span className="priority" style={{ color: getPriorityColor(todo.priority) }}>
                  {priorities.find(p => p.value === todo.priority)?.label}
                </span>
                <span className="category" style={{ color: getCategoryColor(todo.category) }}>
                  {getCategoryIcon(todo.category)} {todo.category}
                </span>
                {todo.tags.map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="todo-actions">
            {isTimerActive ? (
              <button className="timer-btn active" onClick={() => handleStopTimer(todo.id)}>
                ⏹️ {formatTimer(todo.timerStartTime)}
              </button>
            ) : (
              <button className="timer-btn" onClick={() => handleStartTimer(todo.id)}>
                ⏱️
              </button>
            )}
            <button className="expand-btn" onClick={() => toggleTodoExpanded(todo.id)}>
              {isExpanded ? '📂' : '📁'}
            </button>
            <button className="edit-btn" onClick={() => handleEditTodo(todo)}>
              ✏️
            </button>
            <button className="delete-btn" onClick={() => handleDeleteTodo(todo.id)}>
              🗑️
            </button>
          </div>
        </div>

        {/* Quick action bar for pending tasks - always visible */}
        {!todo.completed && (
          <div className="quick-action-bar">
            <button 
              className={`pending-checkbox ${todo.completed ? 'checked' : ''}`}
              onClick={() => handleToggleTodo(todo.id)}
              title="Complete this task"
            >
              {!todo.completed && '✓'}
            </button>
            <span className="quick-actions-info">
              Click to complete • {isDueToday(todo) ? 'Due today' : isOverdue(todo) ? 'Overdue' : 'Pending'}
            </span>
          </div>
        )}

        {todo.estimatedTime > 0 && (
          <div className="todo-time-info">
            <span className="estimated-time">⏱️ {todo.estimatedTime}m estimated</span>
            {todo.actualTime > 0 && (
              <span className="actual-time">✅ {todo.actualTime}m actual</span>
            )}
          </div>
        )}

        {todo.dueDate && (
          <div className="todo-due-info">
            <span className={`due-date ${isOverdue(todo) ? 'overdue' : isDueToday(todo) ? 'due-today' : ''}`}>
              📅 {new Date(todo.dueDate).toLocaleDateString()}
              {todo.dueTime && ` at ${todo.dueTime}`}
            </span>
            {todo.isRecurring && (
              <span className="recurring">🔄 {todo.recurringPattern}</span>
            )}
          </div>
        )}

        {isExpanded && todo.subtasks && todo.subtasks.length > 0 && (
          <div className="todo-subtasks">
            <div className="subtasks-header">
              <h4>{t('todo.subtasks')}</h4>
              <div className="subtasks-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${subtaskProgress}%` }}
                  />
                </div>
                <span>{subtaskProgress}%</span>
              </div>
            </div>
            <div className="subtasks-list">
              {todo.subtasks.map(subtask => (
                <div key={subtask.id} className="subtask">
                  <button 
                    className={`subtask-checkbox ${subtask.completed ? 'checked' : ''}`}
                    onClick={() => handleToggleSubtask(todo.id, subtask.id)}
                  >
                    {subtask.completed ? '✓' : ''}
                  </button>
                  <span className={`subtask-title ${subtask.completed ? 'completed' : ''}`}>
                    {subtask.title}
                  </span>
                  <button 
                    className="delete-subtask-btn"
                    onClick={() => handleDeleteSubtask(todo.id, subtask.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            <button className="add-subtask-btn" onClick={() => handleAddSubtask(todo.id)}>
              + {t('todo.addSubtask')}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderCategoryCard = (category) => {
    const categoryTodos = todos.filter(todo => todo.category === category.name);
    const completedTodos = categoryTodos.filter(todo => todo.completed).length;

    return (
      <div key={category.id} className="category-card">
        <div className="category-header">
          <div className="category-info">
            <div className="category-icon" style={{ backgroundColor: category.color }}>
              {category.icon}
            </div>
            <div className="category-details">
              <h3>{category.name}</h3>
              <p className="category-description">{category.description}</p>
              <div className="category-stats">
                <span className="total-todos">{categoryTodos.length} todos</span>
                <span className="completed-todos">{completedTodos} completed</span>
              </div>
            </div>
          </div>
          <div className="category-actions">
            <button className="delete-btn" onClick={() => handleDeleteCategory(category.id)}>
              🗑️
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTagCard = (tag) => {
    const tagTodos = todos.filter(todo => todo.tags.includes(tag.name));
    const completedTodos = tagTodos.filter(todo => todo.completed).length;

    return (
      <div key={tag.id} className="tag-card">
        <div className="tag-header">
          <div className="tag-name" style={{ backgroundColor: tag.color }}>
            #{tag.name}
          </div>
          <div className="tag-stats">
            <span>{tagTodos.length} todos</span>
            <span>{completedTodos} completed</span>
          </div>
        </div>
        <div className="tag-actions">
          <button className="delete-btn" onClick={() => handleDeleteTag(tag.id)}>
            🗑️
          </button>
        </div>
      </div>
    );
  };

  const filteredTodos = searchQuery 
    ? todoService.searchTodos(searchQuery)
    : todoService.filterTodos(filter);

  return (
    <div className="todo-list">
      <div className="tracker-header">
        <h2>✅ {t('todo.title')}</h2>
        <div className="header-actions">
          <button
            onClick={() => setShowAddTodoForm(true)}
            className="add-todo-btn"
          >
            + {t('todo.addTodo')}
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      {statistics && (
        <div className="stats-overview">
          <div className="stat-card">
            <h3>{t('todo.totalTasks')}</h3>
            <div className="stat-value">{statistics.totalTodos}</div>
            <p>{t('todo.allTasks')}</p>
          </div>
          <div className="stat-card">
            <h3>{t('todo.completed')}</h3>
            <div className="stat-value">{statistics.completedTodos}</div>
            <p>{t('todo.done')}</p>
          </div>
          <div className="stat-card">
            <h3>{t('todo.productivity')}</h3>
            <div className="stat-value">{statistics.productivityScore}%</div>
            <p>{t('todo.completionRate')}</p>
          </div>
          <div className="stat-card">
            <h3>{t('todo.overdue')}</h3>
            <div className="stat-value">{statistics.overdueTodos}</div>
            <p>{t('todo.needAttention')}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'todos' ? 'active' : ''}`}
          onClick={() => setActiveTab('todos')}
        >
          ✅ {t('todo.tasks')} ({filteredTodos.length})
        </button>
        <button
          className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          📁 {t('todo.categories')} ({categories.length})
        </button>
        <button
          className={`tab ${activeTab === 'tags' ? 'active' : ''}`}
          onClick={() => setActiveTab('tags')}
        >
          🏷️ {t('todo.tags')} ({tags.length})
        </button>
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 {t('todo.statistics')}
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'todos' && (
          <div className="todos-section">
            <div className="section-header">
              <h3>{t('todo.yourTasks')}</h3>
              <div className="filters-actions">
                <input
                  type="text"
                  placeholder={t('todo.searchTodos')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <select
                  value={filter.completed}
                  onChange={(e) => setFilter({...filter, completed: e.target.value === '' ? null : e.target.value === 'true'})}
                  className="filter-select"
                >
                  <option value="">{t('todo.allStatus')}</option>
                  <option value="false">{t('todo.pending')}</option>
                  <option value="true">{t('todo.completed')}</option>
                </select>
                <select
                  value={filter.priority}
                  onChange={(e) => setFilter({...filter, priority: e.target.value === '' ? '' : e.target.value})}
                  className="filter-select"
                >
                  <option value="">{t('todo.allPriorities')}</option>
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
                <select
                  value={filter.category}
                  onChange={(e) => setFilter({...filter, category: e.target.value === '' ? '' : e.target.value})}
                  className="filter-select"
                >
                  <option value="">{t('todo.allCategories')}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
                <button 
                  className={`filter-toggle ${filter.overdue ? 'active' : ''}`}
                  onClick={() => setFilter({...filter, overdue: !filter.overdue})}
                >
                  🚨 {t('todo.overdue')}
                </button>
              </div>
            </div>
            {filteredTodos.length === 0 ? (
              <div className="empty-state">
                <p>{t('todo.noTodosFound')}</p>
              </div>
            ) : (
              <div className="todos-list">
                {filteredTodos.map(renderTodoCard)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="categories-section">
            <div className="section-header">
              <h3>{t('todo.categories')}</h3>
              <button
                onClick={() => {/* Handle add category */}}
                className="add-category-btn"
              >
                + {t('todo.addCategory', 'Add Category')}
              </button>
            </div>
            <div className="categories-grid">
              {categories.map(renderCategoryCard)}
            </div>
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="tags-section">
            <div className="section-header">
              <h3>{t('todo.tags')}</h3>
              <button
                onClick={() => {/* Handle add tag */}}
                className="add-tag-btn"
              >
                + {t('todo.addTag', 'Add Tag')}
              </button>
            </div>
            <div className="tags-grid">
              {tags.map(renderTagCard)}
            </div>
          </div>
        )}

        {activeTab === 'stats' && statistics && (
          <div className="stats-section">
            <h3>{t('todo.detailedStatistics', 'Detailed Statistics')}</h3>
            <div className="detailed-stats">
              <div className="stats-grid">
                <div className="stat-item">
                  <h4>Tasks by Priority</h4>
                  <div className="priority-stats">
                    {Object.entries(statistics.byPriority).map(([priority, count]) => (
                      <div key={priority} className="priority-stat">
                        <span className="priority-label">{priority}:</span>
                        <span className="priority-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="stat-item">
                  <h4>Tasks by Category</h4>
                  <div className="category-stats">
                    {Object.entries(statistics.byCategory).map(([category, count]) => (
                      <div key={category} className="category-stat">
                        <span className="category-label">{getCategoryIcon(category)} {category}:</span>
                        <span className="category-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="stat-item">
                  <h4>Today's Tasks</h4>
                  <p>{statistics.todayTodos} tasks due today</p>
                </div>
                <div className="stat-item">
                  <h4>Completed This Week</h4>
                  <p>{statistics.completedThisWeek} tasks completed</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Todo Modal */}
      {showAddTodoForm && (
        <div className="modal-overlay" onClick={() => setShowAddTodoForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingTodo ? t('todo.editTodo') : t('todo.addNewTodo')}</h3>
            
            <div className="form-group">
              <label>{t('todo.titleRequired')}</label>
              <input
                type="text"
                value={newTodo.title}
                onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                placeholder={t('todo.description')}
              />
            </div>

            <div className="form-group">
              <label>{t('todo.description')}</label>
              <textarea
                value={newTodo.description}
                onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
                placeholder={t('todo.descriptionPlaceholder')}
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('todo.priority')}</label>
                <select
                  value={newTodo.priority}
                  onChange={(e) => setNewTodo({...newTodo, priority: e.target.value})}
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('todo.category')}</label>
                <select
                  value={newTodo.category}
                  onChange={(e) => setNewTodo({...newTodo, category: e.target.value})}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('todo.dueDate')}</label>
                <input
                  type="date"
                  value={newTodo.dueDate}
                  onChange={(e) => setNewTodo({...newTodo, dueDate: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>{t('todo.dueTime')}</label>
                <input
                  type="time"
                  value={newTodo.dueTime}
                  onChange={(e) => setNewTodo({...newTodo, dueTime: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('todo.estimatedTime')}</label>
              <input
                type="number"
                value={newTodo.estimatedTime}
                onChange={(e) => setNewTodo({...newTodo, estimatedTime: parseInt(e.target.value) || 0})}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>{t('todo.tags')}</label>
              <input
                type="text"
                value={newTodo.tags.join(', ')}
                onChange={(e) => setNewTodo({...newTodo, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)})}
                placeholder={t('todo.tagsPlaceholder')}
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={newTodo.isRecurring}
                  onChange={(e) => setNewTodo({...newTodo, isRecurring: e.target.checked})}
                />
                {t('todo.recurringTask')}
              </label>
              {newTodo.isRecurring && (
                <select
                  value={newTodo.recurringPattern}
                  onChange={(e) => setNewTodo({...newTodo, recurringPattern: e.target.value})}
                  className="recurring-select"
                >
                  {recurringPatterns.map(pattern => (
                    <option key={pattern.value} value={pattern.value}>{pattern.label}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-actions">
              <button onClick={() => setShowAddTodoForm(false)}>{t('todo.cancel')}</button>
              <button onClick={handleAddTodo} disabled={!newTodo.title.trim()}>
                {editingTodo ? t('todo.update') : t('todo.add')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .todo-list {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .tracker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          background: linear-gradient(135deg, #F59E0B, #D97706);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
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

        .add-todo-btn {
          background: white;
          color: #F59E0B;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .add-todo-btn:hover {
          background: #fffbeb;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
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
          flex-wrap: wrap;
          gap: 15px;
        }

        .section-header h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .filters-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-input {
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-primary);
          color: var(--text-primary);
          min-width: 200px;
        }

        .filter-select, .filter-toggle {
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-primary);
          color: var(--text-primary);
          cursor: pointer;
        }

        .filter-toggle.active {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
        }

        .todos-list, .categories-grid, .tags-grid {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .todo-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
          position: relative;
        }

        .todo-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .todo-card.completed {
          opacity: 0.7;
        }

        .todo-card.completed .completed-title {
          text-decoration: line-through;
          color: var(--text-secondary);
        }

        .todo-card.overdue {
          border-left: 4px solid #ef4444;
        }

        .todo-card.due-today {
          border-left: 4px solid #f59e0b;
        }

        .todo-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .todo-info {
          display: flex;
          gap: 15px;
          flex: 1;
        }

        .todo-checkbox {
          margin-top: 2px;
        }

        /* Add a quick checkbox for pending tasks in the main header */
        .pending-checkbox {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border-color);
          border-radius: 50%;
          background: var(--bg-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          color: var(--text-secondary);
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-right: 10px;
          margin-top: 2px;
        }

        .pending-checkbox:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transform: scale(1.05);
        }

        .pending-checkbox:hover {
          border-color: var(--accent-color);
        }

        .pending-checkbox.checked {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
        }

        .checkbox {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color);
          border-radius: 50%;
          background: var(--bg-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
          color: var(--text-secondary);
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .checkbox:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transform: scale(1.05);
        }

        .checkbox:hover {
          border-color: var(--accent-color);
        }

        .checkbox.checked {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
        }

        .todo-details {
          flex: 1;
        }

        .todo-details h3 {
          margin: 0 0 8px 0;
          color: var(--text-primary);
          font-size: 1.1rem;
          line-height: 1.4;
        }

        .todo-description {
          margin: 0 0 10px 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .todo-meta {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }

        .priority, .category, .tag {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .todo-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .timer-btn {
          padding: 6px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.3s ease;
        }

        .timer-btn.active {
          background: #ef4444;
          color: white;
          border-color: #ef4444;
        }

        .expand-btn, .edit-btn, .delete-btn {
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
          transition: all 0.3s ease;
        }

        .expand-btn:hover, .edit-btn:hover {
          border-color: var(--accent-color);
          color: var(--accent-color);
        }

        .delete-btn:hover {
          border-color: #ef4444;
          color: #ef4444;
        }

        .todo-time-info {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .estimated-time {
          color: var(--accent-color);
        }

        .actual-time {
          color: #10B981;
        }

        .todo-due-info {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
          font-size: 0.8rem;
        }

        .due-date {
          padding: 2px 8px;
          border-radius: 12px;
        }

        .due-date.overdue {
          background: #ef4444;
          color: white;
        }

        .due-date.due-today {
          background: #f59e0b;
          color: white;
        }

        .recurring {
          padding: 2px 8px;
          border-radius: 12px;
          background: var(--accent-color);
          color: white;
        }

        .todo-subtasks {
          background: var(--bg-primary);
          border-radius: 8px;
          padding: 15px;
          margin-top: 15px;
        }

        .subtasks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .subtasks-header h4 {
          margin: 0;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .subtasks-progress {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .progress-bar {
          width: 100px;
          height: 6px;
          background: var(--bg-secondary);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--accent-color);
          transition: width 0.3s ease;
        }

        .subtasks-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .subtask {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          background: var(--bg-secondary);
          border-radius: 6px;
        }

        .subtask-checkbox {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border-color);
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          color: var(--text-secondary);
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .subtask-checkbox:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transform: scale(1.05);
        }

        .subtask-checkbox:hover {
          border-color: var(--accent-color);
        }

        .subtask-checkbox.checked {
          background: var(--accent-color);
          color: white;
          border-color: var(--accent-color);
        }

        .subtask-title {
          flex: 1;
          font-size: 0.8rem;
          color: var(--text-primary);
        }

        .subtask-title.completed {
          text-decoration: line-through;
          color: var(--text-secondary);
        }

        .delete-subtask-btn {
          width: 20px;
          height: 20px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background: transparent;
          cursor: pointer;
          font-size: 10px;
          color: var(--text-secondary);
        }

        .add-subtask-btn {
          margin-top: 10px;
          padding: 8px 16px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.8rem;
          width: 100%;
        }

        .quick-action-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
          padding: 8px 12px;
          background: var(--bg-primary);
          border-radius: 8px;
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
        }

        .quick-action-bar:hover {
          background: var(--bg-secondary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .quick-actions-info {
          font-size: 0.8rem;
          color: var(--text-secondary);
          flex: 1;
        }

        .category-card, .tag-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .category-card:hover, .tag-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .category-header, .tag-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .category-info, .tag-info {
          display: flex;
          gap: 15px;
          flex: 1;
        }

        .category-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
        }

        .category-details, .tag-name {
          flex: 1;
        }

        .category-details h3, .tag-stats {
          margin: 0 0 5px 0;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .category-description {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.8rem;
        }

        .category-stats {
          display: flex;
          gap: 10px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .total-todos, .completed-todos {
          font-weight: 500;
        }

        .tag-name {
          padding: 6px 12px;
          border-radius: 20px;
          color: white;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .tag-stats {
          display: flex;
          gap: 10px;
          font-size: 0.8rem;
          color: white;
        }

        .category-actions, .tag-actions {
          display: flex;
          align-items: center;
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

        .recurring-select {
          margin-top: 5px;
          width: 100%;
        }

        .detailed-stats {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .stat-item h4 {
          margin: 0 0 10px 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .priority-stats {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .priority-stat, .category-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 0;
        }

        .priority-label, .category-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .priority-count, .category-count {
          font-weight: bold;
          color: var(--text-primary);
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

          .filters-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input {
            min-width: auto;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .stats-overview {
            grid-template-columns: 1fr;
          }

          .todo-header {
            flex-direction: column;
            gap: 10px;
          }

          .todo-info {
            flex-direction: column;
            gap: 10px;
          }

          .todo-actions {
            flex-wrap: wrap;
          }

          .todo-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
};

export default TodoList;
