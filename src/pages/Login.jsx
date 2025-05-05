import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Odstranění mezer z emailu
      const trimmedEmail = email.trim();

      // Přímé přihlášení přes Supabase auth
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password
      });

      if (error) {
        console.error('Auth Error:', error);
        throw error;
      }

      if (!user) {
        throw new Error('Přihlášení selhalo - uživatel není definován');
      }

      // Ověření existence profilu
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile Error:', profileError);
        throw new Error('Chyba při načítání profilu');
      }

      if (!profile) {
        throw new Error('Profil nenalezen');
      }

      navigate('/');
      
    } catch (error) {
      console.error('Login Error:', error);
      setError(error.message === 'Invalid login credentials' 
        ? 'Nesprávný email nebo heslo'
        : error.message || 'Při přihlášení došlo k chybě'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Pro reset hesla zadejte email');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      alert('Email pro reset hesla byl odeslán');
    } catch (error) {
      setError('Nepodařilo se odeslat email pro reset hesla');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-hockey-blue mb-2">
            MS Hokej 2025
          </h1>
          <p className="text-gray-600">Přihlášení do tipovačky</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
            <p className="font-medium">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hockey-blue focus:border-transparent"
              placeholder="vas@email.cz"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Heslo
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hockey-blue focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-hockey-blue text-white py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Přihlašování...
              </span>
            ) : 'Přihlásit se'}
          </button>
        </form>
        
        <div className="mt-6 flex flex-col space-y-4 text-center text-sm">
          <button
            onClick={handleResetPassword}
            className="text-hockey-blue hover:text-blue-700 font-medium"
            disabled={loading}
          >
            Zapomenuté heslo?
          </button>
          
          <div className="text-gray-600">
            Nemáte účet?{' '}
            <Link to="/register" className="text-hockey-blue hover:text-blue-700 font-medium">
              Zaregistrujte se
            </Link>
          </div>

          <Link to="/" className="text-gray-500 hover:text-gray-700">
            Zpět na hlavní stránku
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
