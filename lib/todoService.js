class TodoService {
  constructor() {
    this.TODOS_KEY = 'todos';
    this.CATEGORIES_KEY = 'todoCategories';
    this.TAGS_KEY = 'todoTags';
  }

  // Todos operations
  getTodos() {
    console.log('📋 TodoService: getTodos() called');
    try {
      const todos = localStorage.getItem(this.TODOS_KEY);
      const parsedTodos = todos ? JSON.parse(todos) : this.getDefaultTodos();
      console.log('📋 TodoService: Todos loaded:', parsedTodos.length, 'items');
      return parsedTodos;
    } catch (error) {
      console.error('❌ TodoService: Error getting todos:', error);
      return this.getDefaultTodos();
    }
  }

  addTodo(todo) {
    try {
      const todos = this.getTodos();
      const newTodo = {
        id: Date.now().toString(),
        title: todo.title || '',
        description: todo.description || '',
        completed: false,
        priority: todo.priority || 'medium', // low, medium, high, urgent
        dueDate: todo.dueDate || null,
        dueTime: todo.dueTime || null,
        category: todo.category || 'personal',
        tags: todo.tags || [],
        subtasks: todo.subtasks || [],
        attachments: todo.attachments || [],
        reminder: todo.reminder || null,
        isRecurring: todo.isRecurring || false,
        recurringPattern: todo.recurringPattern || null, // daily, weekly, monthly
        estimatedTime: todo.estimatedTime || 0, // in minutes
        actualTime: todo.actualTime || 0, // in minutes
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null
      };
      
      todos.unshift(newTodo);
      localStorage.setItem(this.TODOS_KEY, JSON.stringify(todos));
      return newTodo;
    } catch (error) {
      console.error('Error adding todo:', error);
      return null;
    }
  }

  updateTodo(id, updates) {
    try {
      const todos = this.getTodos();
      const index = todos.findIndex(todo => todo.id === id);
      if (index > -1) {
        todos[index] = { 
          ...todos[index], 
          ...updates, 
          updatedAt: new Date().toISOString(),
          completedAt: updates.completed ? new Date().toISOString() : todos[index].completedAt
        };
        localStorage.setItem(this.TODOS_KEY, JSON.stringify(todos));
        return todos[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating todo:', error);
      return null;
    }
  }

  deleteTodo(id) {
    try {
      const todos = this.getTodos();
      const updatedTodos = todos.filter(todo => todo.id !== id);
      localStorage.setItem(this.TODOS_KEY, JSON.stringify(updatedTodos));
      return true;
    } catch (error) {
      console.error('Error deleting todo:', error);
      return false;
    }
  }

  toggleTodo(id) {
    try {
      const todo = this.getTodos().find(t => t.id === id);
      if (!todo) return null;
      
      const completed = !todo.completed;
      return this.updateTodo(id, { 
        completed,
        completedAt: completed ? new Date().toISOString() : null
      });
    } catch (error) {
      console.error('Error toggling todo:', error);
      return null;
    }
  }

  // Subtasks operations
  addSubtask(todoId, subtask) {
    try {
      const todo = this.getTodos().find(t => t.id === todoId);
      if (!todo) return null;
      
      const newSubtask = {
        id: Date.now().toString(),
        title: subtask.title || '',
        completed: false,
        createdAt: new Date().toISOString()
      };
      
      const updatedSubtasks = [...(todo.subtasks || []), newSubtask];
      return this.updateTodo(todoId, { subtasks: updatedSubtasks });
    } catch (error) {
      console.error('Error adding subtask:', error);
      return null;
    }
  }

  toggleSubtask(todoId, subtaskId) {
    try {
      const todo = this.getTodos().find(t => t.id === todoId);
      if (!todo) return null;
      
      const updatedSubtasks = (todo.subtasks || []).map(subtask => {
        if (subtask.id === subtaskId) {
          return { ...subtask, completed: !subtask.completed };
        }
        return subtask;
      });
      
      return this.updateTodo(todoId, { subtasks: updatedSubtasks });
    } catch (error) {
      console.error('Error toggling subtask:', error);
      return null;
    }
  }

  deleteSubtask(todoId, subtaskId) {
    try {
      const todo = this.getTodos().find(t => t.id === todoId);
      if (!todo) return null;
      
      const updatedSubtasks = (todo.subtasks || []).filter(subtask => subtask.id !== subtaskId);
      return this.updateTodo(todoId, { subtasks: updatedSubtasks });
    } catch (error) {
      console.error('Error deleting subtask:', error);
      return null;
    }
  }

  // Categories operations
  getCategories() {
    try {
      const categories = localStorage.getItem(this.CATEGORIES_KEY);
      return categories ? JSON.parse(categories) : this.getDefaultCategories();
    } catch (error) {
      console.error('Error getting categories:', error);
      return this.getDefaultCategories();
    }
  }

  addCategory(category) {
    try {
      const categories = this.getCategories();
      const newCategory = {
        id: Date.now().toString(),
        name: category.name || '',
        color: category.color || '#3B82F6',
        icon: category.icon || '📁',
        description: category.description || '',
        createdAt: new Date().toISOString()
      };
      
      categories.push(newCategory);
      localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      return null;
    }
  }

  updateCategory(id, updates) {
    try {
      const categories = this.getCategories();
      const index = categories.findIndex(cat => cat.id === id);
      if (index > -1) {
        categories[index] = { ...categories[index], ...updates };
        localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
        return categories[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating category:', error);
      return null;
    }
  }

  deleteCategory(id) {
    try {
      const categories = this.getCategories();
      const updatedCategories = categories.filter(cat => cat.id !== id);
      localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(updatedCategories));
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }

  // Tags operations
  getTags() {
    try {
      const tags = localStorage.getItem(this.TAGS_KEY);
      return tags ? JSON.parse(tags) : [];
    } catch (error) {
      console.error('Error getting tags:', error);
      return [];
    }
  }

  addTag(tag) {
    try {
      const tags = this.getTags();
      const newTag = {
        id: Date.now().toString(),
        name: tag.name || '',
        color: tag.color || '#3B82F6',
        createdAt: new Date().toISOString()
      };
      
      // Check if tag already exists
      const existingTag = tags.find(t => t.name.toLowerCase() === newTag.name.toLowerCase());
      if (existingTag) return existingTag;
      
      tags.push(newTag);
      localStorage.setItem(this.TAGS_KEY, JSON.stringify(tags));
      return newTag;
    } catch (error) {
      console.error('Error adding tag:', error);
      return null;
    }
  }

  deleteTag(id) {
    try {
      const tags = this.getTags();
      const updatedTags = tags.filter(tag => tag.id !== id);
      localStorage.setItem(this.TAGS_KEY, JSON.stringify(updatedTags));
      return true;
    } catch (error) {
      console.error('Error deleting tag:', error);
      return false;
    }
  }

  // Statistics
  getTodoStatistics() {
    try {
      const todos = this.getTodos();
      
      const totalTodos = todos.length;
      const completedTodos = todos.filter(todo => todo.completed).length;
      const pendingTodos = totalTodos - completedTodos;
      
      // Group by priority
      const byPriority = {
        low: todos.filter(todo => todo.priority === 'low').length,
        medium: todos.filter(todo => todo.priority === 'medium').length,
        high: todos.filter(todo => todo.priority === 'high').length,
        urgent: todos.filter(todo => todo.priority === 'urgent').length
      };
      
      // Group by category
      const byCategory = {};
      todos.forEach(todo => {
        if (!byCategory[todo.category]) {
          byCategory[todo.category] = 0;
        }
        byCategory[todo.category]++;
      });
      
      // Overdue todos
      const now = new Date();
      const overdueTodos = todos.filter(todo => {
        if (!todo.dueDate || todo.completed) return false;
        const dueDate = new Date(todo.dueDate);
        if (todo.dueTime) {
          const [hours, minutes] = todo.dueTime.split(':');
          dueDate.setHours(parseInt(hours));
          dueDate.setMinutes(parseInt(minutes));
        }
        return dueDate < now;
      }).length;
      
      // Due today
      const todayTodos = todos.filter(todo => {
        if (!todo.dueDate || todo.completed) return false;
        const dueDate = new Date(todo.dueDate);
        return dueDate.toDateString() === now.toDateString();
      }).length;
      
      // Completed this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const completedThisWeek = todos.filter(todo => 
        todo.completed && 
        todo.completedAt && 
        new Date(todo.completedAt) >= weekAgo
      ).length;
      
      // Productivity score
      const productivityScore = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
      
      return {
        totalTodos,
        completedTodos,
        pendingTodos,
        productivityScore,
        byPriority,
        byCategory,
        overdueTodos,
        todayTodos,
        completedThisWeek
      };
    } catch (error) {
      console.error('Error getting todo statistics:', error);
      return null;
    }
  }

  // Search and filter
  searchTodos(query) {
    try {
      const todos = this.getTodos();
      const lowercaseQuery = query.toLowerCase();
      
      return todos.filter(todo => 
        todo.title.toLowerCase().includes(lowercaseQuery) ||
        todo.description.toLowerCase().includes(lowercaseQuery) ||
        todo.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
        todo.category.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching todos:', error);
      return [];
    }
  }

  filterTodos(filters) {
    try {
      let todos = this.getTodos();
      
      if (filters.completed !== undefined) {
        todos = todos.filter(todo => todo.completed === filters.completed);
      }
      
      if (filters.priority) {
        todos = todos.filter(todo => todo.priority === filters.priority);
      }
      
      if (filters.category) {
        todos = todos.filter(todo => todo.category === filters.category);
      }
      
      if (filters.tags && filters.tags.length > 0) {
        todos = todos.filter(todo => 
          filters.tags.some(tag => todo.tags.includes(tag))
        );
      }
      
      if (filters.dueDate) {
        const filterDate = new Date(filters.dueDate);
        todos = todos.filter(todo => {
          if (!todo.dueDate) return false;
          const todoDueDate = new Date(todo.dueDate);
          return todoDueDate.toDateString() === filterDate.toDateString();
        });
      }
      
      if (filters.overdue) {
        const now = new Date();
        todos = todos.filter(todo => {
          if (!todo.dueDate || todo.completed) return false;
          const dueDate = new Date(todo.dueDate);
          return dueDate < now;
        });
      }
      
      return todos;
    } catch (error) {
      console.error('Error filtering todos:', error);
      return [];
    }
  }

  // Time tracking
  startTodoTimer(id) {
    try {
      return this.updateTodo(id, { 
        timerStartTime: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Error starting todo timer:', error);
      return null;
    }
  }

  stopTodoTimer(id) {
    try {
      const todo = this.getTodos().find(t => t.id === id);
      if (!todo || !todo.timerStartTime) return null;
      
      const startTime = new Date(todo.timerStartTime);
      const endTime = new Date();
      const duration = Math.round((endTime - startTime) / 1000 / 60); // in minutes
      
      return this.updateTodo(id, {
        timerStartTime: null,
        actualTime: (todo.actualTime || 0) + duration
      });
    } catch (error) {
      console.error('Error stopping todo timer:', error);
      return null;
    }
  }

  // Recurring todos
  completeRecurringTodo(id) {
    try {
      const todo = this.getTodos().find(t => t.id === id);
      if (!todo || !todo.isRecurring) return null;
      
      // Mark current todo as completed
      this.toggleTodo(id);
      
      // Create next occurrence
      const nextDueDate = this.calculateNextDueDate(todo.dueDate, todo.recurringPattern);
      const newTodo = {
        ...todo,
        id: Date.now().toString(),
        completed: false,
        dueDate: nextDueDate,
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Reset subtasks
      newTodo.subtasks = newTodo.subtasks.map(subtask => ({
        ...subtask,
        completed: false,
        id: Date.now().toString() + subtask.id
      }));
      
      this.addTodo(newTodo);
      return newTodo;
    } catch (error) {
      console.error('Error completing recurring todo:', error);
      return null;
    }
  }

  calculateNextDueDate(currentDate, pattern) {
    try {
      const date = new Date(currentDate);
      
      switch (pattern) {
        case 'daily':
          date.setDate(date.getDate() + 1);
          break;
        case 'weekly':
          date.setDate(date.getDate() + 7);
          break;
        case 'monthly':
          date.setMonth(date.getMonth() + 1);
          break;
        default:
          date.setDate(date.getDate() + 1);
      }
      
      return date.toISOString();
    } catch (error) {
      console.error('Error calculating next due date:', error);
      return new Date().toISOString();
    }
  }

  // Default data
  getDefaultTodos() {
    return [
      {
        id: '1',
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the project',
        completed: false,
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'work',
        tags: ['documentation', 'project'],
        subtasks: [
          { id: '1-1', title: 'Setup documentation structure', completed: false, createdAt: new Date().toISOString() },
          { id: '1-2', title: 'Write API documentation', completed: false, createdAt: new Date().toISOString() },
          { id: '1-3', title: 'Add examples and tutorials', completed: false, createdAt: new Date().toISOString() }
        ],
        estimatedTime: 120,
        actualTime: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null
      },
      {
        id: '2',
        title: 'Review pull requests',
        description: 'Review and merge pending pull requests',
        completed: false,
        priority: 'medium',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'work',
        tags: ['github', 'review'],
        estimatedTime: 60,
        actualTime: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null
      },
      {
        id: '3',
        title: 'Buy groceries',
        description: 'Get groceries for the week',
        completed: false,
        priority: 'high',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'personal',
        tags: ['shopping', 'groceries'],
        estimatedTime: 45,
        actualTime: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null
      }
    ];
  }

  getDefaultCategories() {
    return [
      {
        id: '1',
        name: 'Personal',
        color: '#3B82F6',
        icon: '👤',
        description: 'Personal tasks and activities'
      },
      {
        id: '2',
        name: 'Work',
        color: '#EF4444',
        icon: '💼',
        description: 'Work-related tasks and projects'
      },
      {
        id: '3',
        name: 'Shopping',
        color: '#F59E0B',
        icon: '🛒',
        description: 'Shopping lists and purchases'
      },
      {
        id: '4',
        name: 'Health',
        color: '#10B981',
        icon: '🏃',
        description: 'Health and fitness activities'
      },
      {
        id: '5',
        name: 'Learning',
        color: '#8B5CF6',
        icon: '📚',
        description: 'Educational activities and courses'
      }
    ];
  }

  // Export/Import
  exportTodoData() {
    try {
      const data = {
        todos: this.getTodos(),
        categories: this.getCategories(),
        tags: this.getTags(),
        exportedAt: new Date().toISOString()
      };
      return data;
    } catch (error) {
      console.error('Error exporting todo data:', error);
      return null;
    }
  }

  importTodoData(data) {
    try {
      if (data.todos) {
        localStorage.setItem(this.TODOS_KEY, JSON.stringify(data.todos));
      }
      if (data.categories) {
        localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(data.categories));
      }
      if (data.tags) {
        localStorage.setItem(this.TAGS_KEY, JSON.stringify(data.tags));
      }
      return true;
    } catch (error) {
      console.error('Error importing todo data:', error);
      return false;
    }
  }
}

// Create and export singleton instance
const todoService = new TodoService();
export default todoService;
