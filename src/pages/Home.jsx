import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold mb-6">MS v hokeji 2025</h1>
      <p className="mb-8">Tipovací soutěž pro fanoušky hokeje</p>
      <Link 
        to="/tips" 
        className="bg-hockey-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Začít tipovat
      </Link>
    </div>
  );
};

export default Home;
