import Dashboard from '../components/Dashboard';
import Layout from '../components/Layout';
import { useTranslation } from '../contexts/LanguageContext';

const DashboardPage = () => {
  const { t } = useTranslation();
  
  return (
    <Layout 
      title={`${t('dashboard.title')} - AI News`} 
      description={t('dashboard.description')}
      keywords={t('dashboard.keywords')}
    >
      <div className="dashboard-page">
        <Dashboard />
        <style jsx global>{`
          .dashboard-page {
            min-height: 100vh;
            background: var(--bg-primary);
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default DashboardPage;
