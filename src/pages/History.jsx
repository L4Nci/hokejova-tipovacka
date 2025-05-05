import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatDateTime } from '../utils/timeUtils';
import DebugMatch from '../components/DebugMatch';

const History = () => {
  const [futureMatches, setFutureMatches] = useState([]);
  const [completedMatches, setCompletedMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      // Načtení pouze dokončených zápasů
      const { data: completedData, error: completedError } = await supabase
        .from('matches')
        .select(`
          *,
          results (
            final_score_home,
            final_score_away
          ),
          tips (
            id,
            score_home,
            score_away,
            profiles (username)
          )
        `)
        .eq('is_finished', true)
        .order('match_time', { ascending: false });

      if (completedError) throw completedError;
      setCompletedMatches(completedData || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTipStyle = (tip, match) => {
    if (!match.results?.[0]) return "bg-gray-50";

    const exactMatch =
      tip.score_home === match.results[0].final_score_home &&
      tip.score_away === match.results[0].final_score_away;

    if (exactMatch) return "bg-green-100 border-green-300";

    const tipDiff = tip.score_home - tip.score_away;
    const resultDiff = match.results[0].final_score_home - match.results[0].final_score_away;
    const correctWinner = (tipDiff > 0 && resultDiff > 0) ||
                         (tipDiff < 0 && resultDiff < 0) ||
                         (tipDiff === 0 && resultDiff === 0);

    return correctWinner ? "bg-blue-50 border-blue-200" : "bg-gray-50";
  };

  console.log('Rendering with matches:', { 
    completedMatches, 
    futureMatches 
  });

  if (loading) {
    return <div className="text-center py-8">Načítám zápasy...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Nadcházející zápasy */}
      {futureMatches.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Nadcházející zápasy</h2>
          <div className="grid gap-6">
            {futureMatches.map(match => (
              <div key={match.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">{formatDateTime(match.match_time)}</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    Skupina {match.group_name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={match.flag_home_url} alt="" className="w-10 h-7 object-cover rounded" />
                    <span className="font-medium">{match.team_home}</span>
                  </div>
                  <span className="text-xl font-bold">vs</span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{match.team_away}</span>
                    <img src={match.flag_away_url} alt="" className="w-10 h-7 object-cover rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Odehrané zápasy */}
      {completedMatches.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Odehrané zápasy</h2>
          <div className="grid gap-6">
            {completedMatches.map(match => (
              <div key={match.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">{formatDateTime(match.match_time)}</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    Dokončeno • Skupina {match.group_name}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <img src={match.flag_home_url} alt="" className="w-10 h-7 object-cover rounded" />
                    <span className="font-medium">{match.team_home}</span>
                  </div>
                  <div className="px-6 py-2 bg-gray-100 rounded-lg">
                    <div className="text-xs text-gray-500 text-center mb-1">Konečný výsledek</div>
                    <div className="text-2xl font-bold text-green-700">
                      {match.results?.[0] ? 
                        `${match.results[0].final_score_home} : ${match.results[0].final_score_away}` :
                        '- : -'
                      }
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{match.team_away}</span>
                    <img src={match.flag_away_url} alt="" className="w-10 h-7 object-cover rounded" />
                  </div>
                </div>

                {/* Tipy uživatelů */}
                {match.tips && match.tips.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Tipy uživatelů:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {match.tips.map((tip) => (
                        <div 
                          key={tip.id}
                          className={`text-sm p-2 rounded border flex justify-between ${getTipStyle(tip, match)}`}
                        >
                          <span>{tip.profiles.username}</span>
                          <span>{tip.score_home}:{tip.score_away}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {process.env.NODE_ENV === 'development' && (
                  <DebugMatch match={match} />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {!futureMatches.length && !completedMatches.length && (
        <div className="text-center py-8 text-gray-500">
          Zatím nejsou k dispozici žádné zápasy.
        </div>
      )}
    </div>
  );
};

export default History;
