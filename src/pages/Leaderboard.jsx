import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Nejdřív zkusíme načíst data přímo z view
      const { data: viewData, error: viewError } = await supabase
        .from('leaderboard')
        .select('*')
        .order('total_points', { ascending: false });

      if (viewError) {
        console.error('Error fetching from view:', viewError);
        
        // Záložní řešení - vypočítat data přímo
        const { data: tipsData, error: tipsError } = await supabase
          .from('tips')
          .select(`
            id,
            score_home,
            score_away,
            user_id,
            profiles!inner (
              id,
              username
            ),
            matches!inner (
              id,
              results (
                final_score_home,
                final_score_away
              )
            )
          `)
          .not('matches.results', 'is', null);

        if (tipsError) throw tipsError;

        // Zpracování dat a výpočet bodů
        const userPoints = {};
        tipsData.forEach(tip => {
          const result = tip.matches.results[0];
          if (!result) return;

          const points = calculatePoints(
            tip.score_home,
            tip.score_away,
            result.final_score_home,
            result.final_score_away
          );

          if (!userPoints[tip.user_id]) {
            userPoints[tip.user_id] = {
              user_id: tip.user_id,
              username: tip.profiles.username,
              total_points: 0,
              perfect_tips: 0,
              correct_winner_tips: 0,
              matches_tipped: new Set()
            };
          }

          userPoints[tip.user_id].matches_tipped.add(tip.matches.id);
          userPoints[tip.user_id].total_points += points;
          if (points === 5) userPoints[tip.user_id].perfect_tips++;
          if (points === 2) userPoints[tip.user_id].correct_winner_tips++;
        });

        const leaderboardArray = Object.values(userPoints)
          .map(user => ({
            ...user,
            matches_tipped: user.matches_tipped.size
          }))
          .sort((a, b) => b.total_points - a.total_points);

        setLeaderboardData(leaderboardArray);
      } else {
        setLeaderboardData(viewData);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Nepodařilo se načíst data žebříčku.');
    } finally {
      setLoading(false);
    }
  };

  const calculatePoints = (tipHome, tipAway, resultHome, resultAway) => {
    if (tipHome === resultHome && tipAway === resultAway) return 5;
    
    const tipDiff = Math.sign(tipHome - tipAway);
    const resultDiff = Math.sign(resultHome - resultAway);
    
    return tipDiff === resultDiff ? 2 : 0;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Žebříček tipérů</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hockey-blue"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pořadí</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uživatel</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-bold">Body celkem</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Přesné tipy</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Správní vítězové</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Počet tipů</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span className="group font-normal">
                    Průměr/zápas
                    <div className="absolute hidden group-hover:block bg-black text-white p-2 rounded text-xs -left-1/2 transform -translate-x-1/2 mt-1">
                      Průměrný počet bodů na odehraný zápas
                    </div>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboardData.map((user, index) => (
                <tr className={`
                  ${index === 0 ? 'bg-yellow-100 border-l-4 border-yellow-400' : ''}
                  ${index === 1 ? 'bg-gray-100 border-l-4 border-gray-400' : ''}
                  ${index === 2 ? 'bg-orange-100 border-l-4 border-orange-400' : ''}
                `} key={user.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}.</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold">{user.total_points}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{user.perfect_tips}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{user.correct_winner_tips}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{user.matches_tipped}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-normal">
                    {(user.total_points / user.matches_tipped || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
