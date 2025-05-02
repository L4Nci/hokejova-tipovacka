import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Layout = ({ children, user }) => {
  const navigate = useNavigate();
  
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
                <Link to="/history" className="hover:text-gray-200">Historie tipů</Link>
              )}
            </nav>
            
            <div>
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="hidden md:block text-sm">
                    {user.email}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="bg-white text-hockey-blue px-3 py-1 rounded text-sm hover:bg-gray-100"
                  >
                    Odhlásit
                  </button>
                </div>
              ) : (
                <Link to="/login" className="bg-white text-hockey-blue px-3 py-1 rounded text-sm hover:bg-gray-100">
                  Přihlásit
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="md:hidden bg-gray-50 shadow-inner">
        <div className="container mx-auto px-4">
          <div className="flex justify-between py-2">
            <Link to="/" className="text-hockey-blue px-3 py-1">Domů</Link>
            <Link to="/tips" className="text-hockey-blue px-3 py-1">Tipovat</Link>
            <Link to="/leaderboard" className="text-hockey-blue px-3 py-1">Žebříček</Link>
            {user && (
              <Link to="/history" className="text-hockey-blue px-3 py-1">Historie</Link>
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
