import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import MatchDetails from './pages/MatchDetails';
import UserHistory from './pages/UserHistory';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';
import UserTips from './pages/UserTips';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        
        // Get session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session Error:', sessionError);
          return;
        }

        if (session?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Profile Error:', profileError);
          } else {
            setUserRole(profileData?.role);
            setUser(session.user);
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hockey-blue"></div>
      </div>
    );
  }

  return (
    <Layout user={user}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        
        {/* Protected routes */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} />
            </ProtectedRoute>
          } 
        />
        <Route path="/match/:id" element={<MatchDetails />} />
        <Route path="/history" element={<UserHistory user={user} />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route 
          path="/admin" 
          element={
            <AdminRoute user={user} userRole={userRole}>
              <AdminPanel />
            </AdminRoute>
          } 
        />
        <Route path="/tips" element={<UserTips user={user} />} />
      </Routes>
    </Layout>
  );
}

export default App;
