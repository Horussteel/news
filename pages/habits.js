import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import HabitTracker from '../components/HabitTracker';

export default function HabitsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Layout title="Habits - AI News" description="Track your daily habits and build consistency">
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
      title="Habits - AI News" 
      description="Track your daily habits, build consistency, and achieve your goals"
      keywords="habits, tracker, productivity, goals, daily routine"
    >
      <HabitTracker />
    </Layout>
  );
}
