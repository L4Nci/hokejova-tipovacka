import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const teamFlags = {
    CZE: 'https://flagcdn.com/w40/cz.png',
    SVK: 'https://flagcdn.com/w40/sk.png',
    USA: 'https://flagcdn.com/w40/us.png',
    CAN: 'https://flagcdn.com/w40/ca.png',
    FIN: 'https://flagcdn.com/w40/fi.png',
    SWE: 'https://flagcdn.com/w40/se.png',
    LAT: 'https://flagcdn.com/w40/lv.png',
    KAZ: 'https://flagcdn.com/w40/kz.png'
  };

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
        .select(`
          *,
          profiles (
            favorite_team
          )
        `)
        .order('total_points', { ascending: false });

      console.log('Fetched data:', viewData); // Pro debug

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
              username,
              favorite_team
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
              favorite_team: tip.profiles.favorite_team,
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
        // Upravíme data před uložením do state
        const processedData = viewData.map(user => ({
          ...user,
          favorite_team: user.profiles?.favorite_team
        }));
        console.log('Processed data:', processedData); // Pro debug
        setLeaderboardData(processedData);
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
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Žebříček tipérů</h1>
      
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
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-2 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="w-1/3 px-2 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jméno</th>
                  <th className="w-16 px-2 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Body</th>
                  <th className="w-16 px-2 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Přesné</th>
                  <th className="w-16 px-2 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Vítěz</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboardData.map((user, index) => (
                  <tr className={`
                    ${index === 0 ? 'bg-yellow-100 border-l-4 border-yellow-400' : ''}
                    ${index === 1 ? 'bg-gray-100 border-l-4 border-gray-400' : ''}
                    ${index === 2 ? 'bg-orange-100 border-l-4 border-orange-400' : ''}
                  `} key={user.user_id}>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">{index + 1}.</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900 truncate">
                      {user.username}
                      {user.favorite_team && (
                        <img 
                          src={teamFlags[user.favorite_team]} 
                          alt={user.favorite_team}
                          className="inline-block ml-2 h-4 w-6 object-cover"
                        />
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 text-right font-bold">{user.total_points}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{user.perfect_tips}</td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{user.correct_winners}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
