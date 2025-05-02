import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Dashboard = ({ user }) => {
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        
        // Načtení nadcházejících zápasů (do týdne)
        const currentDate = new Date().toISOString();
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
        
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .gt('match_time', currentDate)
          .lt('match_time', oneWeekFromNow.toISOString())
          .order('match_time', { ascending: true })
          .limit(5);
        
        if (error) throw error;
        
        setUpcomingMatches(data || []);
      } catch (error) {
        console.error('Chyba při načítání zápasů:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
  }, []);

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Hokejová tipovačka MS 2025</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Vítejte v hokejové tipovačce</h2>
        <p className="mb-4">
          Tipujte výsledky zápasů mistrovství světa v hokeji 2025 a soutěžte s ostatními fanoušky.
        </p>
        {user ? (
          <Link
            to="/tips"
            className="bg-hockey-blue text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Začít tipovat
          </Link>
        ) : (
          <Link
            to="/login"
            className="bg-hockey-blue text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Přihlásit se pro tipování
          </Link>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Nadcházející zápasy</h2>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hockey-blue"></div>
          </div>
        ) : upcomingMatches.length === 0 ? (
          <p className="text-center text-gray-500">Žádné nadcházející zápasy</p>
        ) : (
          <div className="space-y-4">
            {upcomingMatches.map(match => (
              <div key={match.id} className="border-b pb-3 last:border-b-0">
                <div className="text-sm text-gray-600 mb-1">{formatDateTime(match.match_time)}</div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {match.flag_home_url && (
                      <img src={match.flag_home_url} alt={match.team_home} className="w-6 h-4 mr-2" />
                    )}
                    <span>{match.team_home}</span>
                  </div>
                  <div className="mx-2">vs</div>
                  <div className="flex items-center">
                    <span>{match.team_away}</span>
                    {match.flag_away_url && (
                      <img src={match.flag_away_url} alt={match.team_away} className="w-6 h-4 ml-2" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
