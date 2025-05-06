import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Layout = ({ children, user }) => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function getUserRole() {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (!error && data) {
          setUserRole(data.role);
        }
      }
    }
    getUserRole();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-hockey-blue text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <Link to="/" className="text-xl font-bold">MS Hokej 2025</Link>
            
            {/* Hamburger menu pro mobily */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop menu */}
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="hover:text-gray-200">Domů</Link>
              <Link to="/tips" className="hover:text-gray-200">Tipovat</Link>
              <Link to="/leaderboard" className="hover:text-gray-200">Žebříček</Link>
              {user && (
                <>
                  <Link to="/history" className="hover:text-gray-200">Zápasy</Link>
                  {userRole === 'admin' && (
                    <Link to="/admin" className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">
                      Admin
                    </Link>
                  )}
                </>
              )}
              {user ? (
                <button onClick={handleLogout} className="hover:text-gray-200">
                  Odhlásit
                </button>
              ) : (
                <Link to="/login" className="hover:text-gray-200">
                  Přihlásit
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobilní menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} bg-hockey-blue text-white`}>
        <div className="px-4 py-2 space-y-2">
          <Link to="/" className="block py-2 hover:bg-blue-700 px-3 rounded" onClick={() => setIsMobileMenuOpen(false)}>Domů</Link>
          <Link to="/tips" className="block py-2 hover:bg-blue-700 px-3 rounded" onClick={() => setIsMobileMenuOpen(false)}>Tipovat</Link>
          <Link to="/leaderboard" className="block py-2 hover:bg-blue-700 px-3 rounded" onClick={() => setIsMobileMenuOpen(false)}>Žebříček</Link>
          {user && (
            <>
              <Link to="/history" className="block py-2 hover:bg-blue-700 px-3 rounded" onClick={() => setIsMobileMenuOpen(false)}>Zápasy</Link>
              {userRole === 'admin' && (
                <Link to="/admin" className="block py-2 bg-red-600 hover:bg-red-700 px-3 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                  Admin
                </Link>
              )}
            </>
          )}
          {user ? (
            <button 
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:bg-blue-700 px-3 rounded"
            >
              Odhlásit
            </button>
          ) : (
            <Link to="/login" className="block py-2 hover:bg-blue-700 px-3 rounded" onClick={() => setIsMobileMenuOpen(false)}>
              Přihlásit
            </Link>
          )}
        </div>
      </div>

      <main className="flex-1 container mx-auto py-4 px-3 md:py-6 md:px-4 max-w-7xl">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">Hokejová tipovačka MS 2025 &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
