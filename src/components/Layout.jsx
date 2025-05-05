import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Layout = ({ children, user }) => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-hockey-blue text-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <Link to="/" className="text-xl font-bold">MS Hokej 2025</Link>
            
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
      <div className="md:hidden bg-gray-50 shadow-inner">
        <div className="container mx-auto px-4">
          <div className="flex justify-between py-2">
            <Link to="/" className="text-hockey-blue px-3 py-1">Domů</Link>
            <Link to="/tips" className="text-hockey-blue px-3 py-1">Tipovat</Link>
            <Link to="/leaderboard" className="text-hockey-blue px-3 py-1">Žebříček</Link>
            {user && (
              <>
                <Link to="/history" className="text-hockey-blue px-3 py-1">Zápasy</Link>
                {userRole === 'admin' && (
                  <Link to="/admin" className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <main className="container mx-auto py-6 px-4">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">Hokejová tipovačka MS 2025 &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
