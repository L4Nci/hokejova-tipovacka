import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatDateTime } from '../utils/timeUtils';
import { Link } from 'react-router-dom';

const MatchHistory = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchMatchHistory();
  }, []);
  
  const fetchMatchHistory = async () => {
    try {
      setLoading(true);
      
      // Získáme všechny zápasy, které mají výsledky (jsou tedy odehrané)
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          id,
          team_home,
          team_away,
          flag_home_url,
          flag_away_url,
          group_name,
          match_time,
          results (
            final_score_home,
            final_score_away
          )
        `)
        .order('match_time', { ascending: false })
        .not('results', 'is', null);
      
      if (matchesError) throw matchesError;

      // Pro každý zápas získáme tipy a body uživatelů
      const matchesWithTips = await Promise.all(matchesData.map(async (match) => {
        const { data: tipsData, error: tipsError } = await supabase
          .from('tips')
          .select(`
            id, 
            score_home, 
            score_away,
            profiles (
              username
            ),
            points (
              points
            )
          `)
          .eq('match_id', match.id);
        
        if (tipsError) throw tipsError;
        
        // Zpracování dat tipů pro přehlednou strukturu
        const userTips = tipsData.map(tip => ({
          id: tip.id,
          username: tip.profiles.username,
          scoreHome: tip.score_home,
          scoreAway: tip.score_away,
          points: tip.points && tip.points.length > 0 ? tip.points[0].points : 0
        }));
        
        // Seřazení tipů podle počtu bodů (sestupně)
        userTips.sort((a, b) => b.points - a.points);
        
        return {
          ...match,
          finalScoreHome: match.results[0].final_score_home,
          finalScoreAway: match.results[0].final_score_away,
          userTips
        };
      }));
      
      setMatches(matchesWithTips);
    } catch (err) {
      console.error('Chyba při načítání historie zápasů:', err);
      setError('Nepodařilo se načíst historii zápasů.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="text-center py-10">Načítání historie zápasů...</div>;
  }
  
  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }
  
  if (matches.length === 0) {
    return <div className="text-center py-10">Zatím nebyly odehrány žádné zápasy.</div>;
  }
  
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
                {match.flag_home_url && (
                  <img src={match.flag_home_url} alt={match.team_home} className="w-8 h-6 mr-2" />
                )}
                <span className="font-medium">{match.team_home}</span>
              </div>
              
              <div className="flex items-center mx-4 text-lg font-bold">
                <span>{match.finalScoreHome}</span>
                <span className="mx-1">:</span>
                <span>{match.finalScoreAway}</span>
              </div>
              
              <div className="flex items-center">
                <span className="font-medium">{match.team_away}</span>
                {match.flag_away_url && (
                  <img src={match.flag_away_url} alt={match.team_away} className="w-8 h-6 ml-2" />
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Tipy uživatelů:</h3>
              {match.userTips.length === 0 ? (
                <p className="text-gray-500 text-sm">Pro tento zápas neexistují žádné tipy.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {match.userTips.map((tip) => (
                    <div 
                      key={tip.id} 
                      className={`p-2 rounded border flex items-center justify-between ${
                        tip.points === 5 ? 'bg-green-100 border-green-300' : 
                        tip.points === 2 ? 'bg-blue-50 border-blue-200' : 
                        'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <span className="font-medium">{tip.username}</span>
                      <div className="flex items-center">
                        <span className="px-2">{tip.scoreHome}:{tip.scoreAway}</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          tip.points === 5 ? 'bg-green-200 text-green-800' : 
                          tip.points === 2 ? 'bg-blue-200 text-blue-800' : 
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {tip.points} {tip.points === 1 ? 'bod' : tip.points >= 2 && tip.points <= 4 ? 'body' : 'bodů'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchHistory;
