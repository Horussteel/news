import Layout from '../components/Layout';
import FinancialTracker from '../components/FinancialTracker';

const FinancialPage = () => {
  return (
    <Layout title="Finanțe Personale" description="Gestionează cheltuieli, venituri, bugete și obiective financiare">
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
