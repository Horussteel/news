import { useState, useEffect } from 'react';
import ReadingTracker from '../components/ReadingTracker';
import Layout from '../components/Layout';
import { useTranslation } from '../contexts/LanguageContext';

export default function ReadingPage() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Layout title={t('reading.title')} description={t('reading.description')}>
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
      title={t('reading.title')} 
      description={t('reading.description')}
      keywords={t('reading.keywords')}
    >
      <ReadingTracker />
    </Layout>
  );
}
