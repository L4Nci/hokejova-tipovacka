import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatDateTime } from '../utils/timeUtils';

const MatchHistory = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchMatches() {
      try {
        // Načtení ukončených zápasů s výsledky
        const { data: matchesData, error } = await supabase
          .from('matches')
          .select(`
            *,
            results ( final_score_home, final_score_away ),
            tips (
              score_home,
              score_away,
              profiles ( username ),
              points ( points )
            )
          `)
          .lt('match_time', new Date().toISOString()) // Pouze zápasy v minulosti
          .not('results', 'is', null) // Pouze zápasy s výsledkem
          .order('match_time', { ascending: false });

        if (error) throw error;
        setMatches(matchesData || []);
      } catch (err) {
        console.error('Chyba při načítání historie zápasů:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, []);

  if (loading) return <div className="text-center py-10">Načítání historie zápasů...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!matches.length) return <div className="text-center py-10">Zatím nebyly odehrány žádné zápasy.</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Historie zápasů</h1>
      
      <div className="space-y-6">
        {matches.map((match) => (
          <div key={match.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">{formatDateTime(match.match_time)}</span>
              <span className="text-sm font-medium">Skupina {match.group_name}</span>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <img src={match.flag_home_url} alt={match.team_home} className="w-8 h-6 mr-2" />
                <span className="font-medium">{match.team_home}</span>
              </div>
              
              <div className="flex items-center mx-4 text-lg font-bold">
                <span>{match.results[0]?.final_score_home}</span>
                <span className="mx-1">:</span>
                <span>{match.results[0]?.final_score_away}</span>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium">{match.team_away}</span>
                <img src={match.flag_away_url} alt={match.team_away} className="w-8 h-6 ml-2" />
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Tipy uživatelů:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {match.tips.map((tip, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded border flex items-center justify-between ${
                      tip.points?.[0]?.points === 5 ? 'bg-green-100 border-green-300' : 
                      tip.points?.[0]?.points === 2 ? 'bg-blue-50 border-blue-200' : 
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <span className="font-medium">{tip.profiles.username}</span>
                    <div className="flex items-center">
                      <span className="px-2">{tip.score_home}:{tip.score_away}</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        tip.points?.[0]?.points === 5 ? 'bg-green-200 text-green-800' : 
                        tip.points?.[0]?.points === 2 ? 'bg-blue-200 text-blue-800' : 
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {tip.points?.[0]?.points} b
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchHistory;
