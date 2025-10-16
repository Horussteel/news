import Dashboard from '../components/Dashboard';
import Layout from '../components/Layout';

const DashboardPage = () => {
  return (
    <Layout title="Analytics Dashboard" description="View your productivity statistics and analytics">
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
