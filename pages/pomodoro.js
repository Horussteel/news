import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PomodoroTimer from '../components/PomodoroTimer';

export default function PomodoroPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Layout title="Pomodoro Timer - AI News" description="Boost your productivity with the Pomodoro technique">
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
      title="🍅 Pomodoro Timer - AI News" 
      description="Boost your productivity with the Pomodoro technique. Focus on your tasks and track your progress with our timer."
      keywords="pomodoro, timer, productivity, focus, time management, work sessions"
    >
      <PomodoroTimer />
    </Layout>
  );
}
