import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const UserHistory = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (user) {
      fetchUserTips();
    }
  }, [user]);

  const fetchUserTips = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching matches with results...');
      
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          results (
            final_score_home,
            final_score_away
          ),
          tips (
            score_home,
            score_away,
            profiles (username)
          )
        `)
        .order('match_time', { ascending: false });
      
      if (error) {
        console.error('Error fetching matches:', error);
        throw error;
      }

      console.log('Fetched matches:', data);
      
      setMatches(data || []);
    } catch (error) {
      console.error('Error:', error);
      setError('Nepodařilo se načíst zápasy');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hockey-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">{error}</div>
    );
  }

  if (!matches.length) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Historie zápasů</h2>
        <p className="text-gray-500">Zatím zde nejsou žádné odehrané zápasy s tipy.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Historie vašich tipů</h1>
      
      <div className="space-y-4">
        {matches.map((match) => (
          <div 
            key={match.id}  // <-- Toto je důležité
            className={`bg-white rounded-lg shadow p-6 
              ${match.isFinished ? 'border-l-4 border-gray-500' : 'border-l-4 border-hockey-blue'}`}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">{formatDateTime(match.match_time)}</span>
              <span className={`text-sm font-medium px-3 py-1 rounded-full 
                ${match.isFinished ? 'bg-gray-100' : 'bg-blue-100'}`}>
                {match.isFinished ? 'Odehráno' : 'Naplánováno'} • Skupina {match.group_name}
              </span>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <img 
                  src={match.flag_home_url} 
                  alt={match.team_home} 
                  className="w-10 h-7 object-cover rounded shadow" 
                />
                <span className="font-medium">{match.team_home}</span>
              </div>
              
              <div className="px-6 py-2 bg-gray-50 rounded-lg text-xl font-bold">
                {match.current_score_home} : {match.current_score_away}
              </div>
              
              <div className="flex items-center gap-3">
                <span className="font-medium">{match.team_away}</span>
                <img 
                  src={match.flag_away_url} 
                  alt={match.team_away} 
                  className="w-10 h-7 object-cover rounded shadow"
                />
              </div>
            </div>

            {match.tips && match.tips.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">
                  Tipy ({match.tips.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {match.tips.map((tip) => (
                    <div key={tip.id} 
                      className="p-2 rounded bg-gray-50 border border-gray-200 flex justify-between">
                      <span className="text-sm">{tip.profiles.username}</span>
                      <span className="font-medium">{tip.score_home}:{tip.score_away}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserHistory;
