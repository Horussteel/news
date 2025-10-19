import Layout from '../components/Layout';
import FinancialTracker from '../components/FinancialTracker';
import { useTranslation } from '../contexts/LanguageContext';

const FinancialPage = () => {
  const { t } = useTranslation();
  
  return (
    <Layout 
      title={`${t('financial.title')} - AI News`} 
      description={t('financial.description')}
      keywords={t('financial.keywords')}
    >
      <div className="financial-page">
        <FinancialTracker />
        <style jsx global>{`
          .financial-page {
            min-height: 100vh;
            background: var(--bg-primary);
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default FinancialPage;
