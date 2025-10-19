import HomePage from '../components/HomePage';
import Layout from '../components/Layout';
import { useTranslation } from '../contexts/LanguageContext';

const Home = () => {
  const { t } = useTranslation();
  
  return (
    <Layout 
      title={`${t('layout.title')} - Centrul tău de comandă inteligent`} 
      description="Panoul de control principal pentru productivitate, resurse și administrare"
    >
      <HomePage />
    </Layout>
  );
};

export default Home;
