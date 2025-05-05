import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login = () => {
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  console.log('Current location:', location.pathname);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('User already logged in, redirecting...');
        navigate('/dashboard');
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = userEmail.trim();
    const password = userPassword;

    if (!email || !password) {
      setError("Email nebo heslo nejsou vyplněny");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email, 
        password,
      });

      if (signInError) throw signInError;

      console.log("Login successful, redirecting...");
      navigate('/dashboard');

    } catch (error) {
      console.error("Auth error:", error);
      setError('Nesprávný email nebo heslo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Přihlášení</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={userEmail}
              onChange={e => setUserEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Heslo</label>
            <input
              type="password"
              value={userPassword}
              onChange={e => setUserPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Přihlašování...' : 'Přihlásit se'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
