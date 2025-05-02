import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { formatDateTimeWithYear } from '../utils/timeUtils';

const UserTipHistory = ({ user }) => {
  const [tipHistory, setTipHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (user) {
      fetchUserTips(user.id);
    } else {
      setLoading(false);
    }
  }, [user]);
  
  const fetchUserTips = async (userId) => {
    try {
      setLoading(true);
      
      // Získání tipů uživatele včetně souvisejících dat
      const { data, error } = await supabase
        .from('tips')
        .select(`
          id,
          score_home,
          score_away,
          created_at,
          updated_at,
          matches:match_id (
            id,
            team_home,
            team_away,
            flag_home_url,
            flag_away_url,
            match_time,
            group_name
          ),
          points (
            points
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Získání výsledků pro každý zápas
      const matchIds = data.map(tip => tip.matches.id);
      const { data: resultsData, error: resultsError } = await supabase
        .from('results')
        .select('*')
        .in('match_id', matchIds);
      
      if (resultsError) throw resultsError;

      // Vytvoření mapy výsledků pro rychlý přístup
      const resultsMap = {};
      resultsData?.forEach(result => {
        resultsMap[result.match_id] = {
          final_score_home: result.final_score_home,
          final_score_away: result.final_score_away
        };
      });

      // Zpracování dat pro zobrazení
      const processedData = data.map(tip => ({
        id: tip.id,
        tipScoreHome: tip.score_home,
        tipScoreAway: tip.score_away,
        matchId: tip.matches.id,
        teamHome: tip.matches.team_home,
        teamAway: tip.matches.team_away,
        flagHomeUrl: tip.matches.flag_home_url,
        flagAwayUrl: tip.matches.flag_away_url,
        matchTime: tip.matches.match_time,
        groupName: tip.matches.group_name,
        finalScoreHome: resultsMap[tip.matches.id]?.final_score_home,
        finalScoreAway: resultsMap[tip.matches.id]?.final_score_away,
        points: tip.points?.[0]?.points || 0,
        createdAt: tip.created_at,
        updatedAt: tip.updated_at,
        // Přidáme informaci, zda je zápas v budoucnosti a zda lze ještě tipovat
        isFuture: new Date(tip.matches.match_time) > new Date(),
        canStillTip: new Date(tip.matches.match_time) > new Date(new Date().getTime() + 5 * 60000)
      }));
      
      setTipHistory(processedData);
    } catch (err) {
      console.error('Chyba při načítání historie tipů:', err);
      setError('Nepodařilo se načíst historii tipů.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Načítání historie tipů...</div>;
  }
  
  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-lg mb-4">Pro zobrazení historie tipů se musíte přihlásit</p>
        <Link to="/login" className="text-hockey-blue hover:underline">
          Přejít na přihlášení
        </Link>
      </div>
    );
  }
  
  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }
  
  if (tipHistory.length === 0) {
    return <div className="text-center py-10">Zatím jste nezadali žádné tipy.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Historie mých tipů</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {tipHistory.map((tip) => (
          <div key={tip.id} className={`border rounded-lg p-4 shadow-sm ${tip.isFuture ? 'bg-blue-50' : ''}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">{formatDateTimeWithYear(tip.matchTime)}</span>
              <span className="text-sm font-medium">Skupina {tip.groupName}</span>
            </div>
            
            {tip.isFuture && tip.canStillTip && (
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm mb-3">
                <Link to="/tips" className="flex items-center">
                  <span>Můžete ještě upravit</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            )}
            
            {tip.isFuture && !tip.canStillTip && (
              <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm mb-3">
                Čas na úpravu vypršel
              </div>
            )}
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                {tip.flagHomeUrl && (
                  <img src={tip.flagHomeUrl} alt={tip.teamHome} className="w-8 h-6 mr-2" />
                )}
                <span className="font-medium">{tip.teamHome}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Váš tip</div>
                  <div className="flex items-center">
                    <span className="w-8 text-center font-medium">{tip.tipScoreHome}</span>
                    <span className="mx-1">:</span>
                    <span className="w-8 text-center font-medium">{tip.tipScoreAway}</span>
                  </div>
                </div>
                
                {(tip.finalScoreHome !== undefined && tip.finalScoreAway !== undefined) && (
                  <div className="text-center ml-4">
                    <div className="text-xs text-gray-500 mb-1">Výsledek</div>
                    <div className="flex items-center">
                      <span className="w-8 text-center font-bold">{tip.finalScoreHome}</span>
                      <span className="mx-1">:</span>
                      <span className="w-8 text-center font-bold">{tip.finalScoreAway}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center">
                <span className="font-medium">{tip.teamAway}</span>
                {tip.flagAwayUrl && (
                  <img src={tip.flagAwayUrl} alt={tip.teamAway} className="w-8 h-6 ml-2" />
                )}
              </div>
            </div>
            
            {(tip.finalScoreHome !== undefined && tip.finalScoreAway !== undefined) ? (
              <div className="flex justify-end">
                <span className={`px-3 py-1 rounded-full ${tip.points > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {tip.points} {tip.points === 1 ? 'bod' : tip.points >= 2 && tip.points <= 4 ? 'body' : 'bodů'}
                </span>
              </div>
            ) : tip.isFuture ? (
              <div className="flex justify-end">
                <span className="text-sm text-gray-500">Čeká se na zápas</span>
              </div>
            ) : (
              <div className="flex justify-end">
                <span className="text-sm text-gray-500">Čeká se na výsledek</span>
              </div>
            )}
            
            <div className="text-xs text-gray-400 mt-2">
              Tip vytvořen: {formatDateTimeWithYear(tip.createdAt)}
              {tip.updatedAt !== tip.createdAt && (
                <span className="ml-2">• Aktualizováno: {formatDateTimeWithYear(tip.updatedAt)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserTipHistory;
