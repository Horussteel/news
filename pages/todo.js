import { useState, useEffect } from 'react';
import TodoList from '../components/TodoList';
import Layout from '../components/Layout';

export default function TodoPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Layout title="To-Do List - AI News" description="Manage your tasks, increase productivity, and achieve your goals">
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
        <style jsx>{`
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 50vh;
          }
          .spinner {
            border: 4px solid var(--bg-secondary);
            border-top: 4px solid var(--accent-color);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Layout>
    );
  }

  return (
    <Layout 
      title="To-Do List - AI News" 
      description="Manage your tasks, increase productivity, and achieve your goals"
      keywords="todo, tasks, productivity, goals, planner, organizer"
    >
      <TodoList />
    </Layout>
  );
}
