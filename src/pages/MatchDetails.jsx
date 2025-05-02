import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatRemainingTime } from '../utils/timeUtils';

const MatchDetails = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [userTip, setUserTip] = useState({ score_home: '', score_away: '' });
  const [allTips, setAllTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [matchHasEnded, setMatchHasEnded] = useState(false);
  
  useEffect(() => {
    async function fetchMatchData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user || !id) return;
        
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select('*')
          .eq('id', id)
          .single();
        
        if (matchError) throw matchError;
        setMatch(matchData);
        
        const matchTime = new Date(matchData.match_time);
        const now = new Date();
        setMatchHasEnded(matchTime < now);
        
        const { data: resultData, error: resultError } = await supabase
          .from('results')
          .select('*')
          .eq('match_id', id)
          .single();
        
        if (!resultError && resultData) {
          setResult(resultData);
        }
        
        const { data: tipData, error: tipError } = await supabase
          .from('tips')
          .select('*')
          .eq('match_id', id)
          .eq('user_id', user.id)
          .single();
        
        if (!tipError && tipData) {
          setUserTip({
            score_home: tipData.score_home.toString(),
            score_away: tipData.score_away.toString()
          });
        }
        
        const { data: allTipsData, error: allTipsError } = await supabase
          .from('tips')
          .select(`
            id,
            score_home,
            score_away,
            profiles (
              username
            )
          `)
          .eq('match_id', id);
        
        if (allTipsError) throw allTipsError;
        setAllTips(allTipsData || []);
      } catch (error) {
        console.error('Error fetching match data:', error);
        setError('Nepodařilo se načíst data zápasu.');
      } finally {
        setLoading(false);
      }
    }

    fetchMatchData();
  }, [id]);
  
  const handleSubmitTip = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    setSubmitting(true);
    
    try {
      if (userTip.score_home === '' || userTip.score_away === '') {
        throw new Error('Zadejte oba výsledky.');
      }
      
      const scoreHome = parseInt(userTip.score_home);
      const scoreAway = parseInt(userTip.score_away);
      
      if (isNaN(scoreHome) || isNaN(scoreAway) || scoreHome < 0 || scoreAway < 0) {
        throw new Error('Výsledek musí být nezáporné číslo.');
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Nejste přihlášeni.');
      }
      
      if (matchHasEnded) {
        throw new Error('Zápas již začal, tipy nelze změnit.');
      }
      
      const { data: existingTip, error: existingTipError } = await supabase
        .from('tips')
        .select('id')
        .eq('match_id', id)
        .eq('user_id', user.id)
        .single();
      
      if (existingTipError && existingTipError.code !== 'PGRST116') {
        throw existingTipError;
      }
      
      if (existingTip) {
        const { error } = await supabase
          .from('tips')
          .update({
            score_home: scoreHome,
            score_away: scoreAway,
            updated_at: new Date()
          })
          .eq('id', existingTip.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tips')
          .insert({
            user_id: user.id,
            match_id: id,
            score_home: scoreHome,
            score_away: scoreAway,
            created_at: new Date(),
            updated_at: new Date()
          });
        
        if (error) throw error;
      }
      
      const { data: allTipsData } = await supabase
        .from('tips')
        .select(`
          id,
          score_home,
          score_away,
          profiles (
            username
          )
        `)
        .eq('match_id', id);
      
      setAllTips(allTipsData || []);
      setSuccess(true);
    } catch (error) {
      console.error('Error submitting tip:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hockey-blue"></div>
        </div>
      ) : !match ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Zápas nenalezen.
        </div>
      ) : (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-center">
            <div className="flex items-center justify-center space-x-4">
              <img src={match.flag_home_url} alt={match.team_home} className="w-10" />
              <span>{match.team_home}</span>
              <span className="text-gray-500">vs</span>
              <span>{match.team_away}</span>
              <img src={match.flag_away_url} alt={match.team_away} className="w-10" />
            </div>
          </h1>
          
          <div className="bg-gray-100 p-4 rounded text-center">
            <p className="text-lg">Skupina {match.group_name}</p>
            <p className="text-2xl font-semibold">
              {new Date(match.match_time).toLocaleDateString('cs-CZ')}{' '}
              {new Date(match.match_time).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-sm text-gray-600">
              {!matchHasEnded && (
                <>Začíná za: {formatRemainingTime(match.match_time)}</>
              )}
              {matchHasEnded && !result && (
                <span className="text-yellow-600">Zápas již začal, výsledek zatím není k dispozici.</span>
              )}
              {result && (
                <span className="font-bold text-lg">
                  Výsledek: {result.final_score_home} : {result.final_score_away}
                </span>
              )}
            </p>
          </div>
          
          {!matchHasEnded && (
            <div className="bg-white shadow-md rounded p-6">
              <h2 className="text-xl font-bold mb-4">Váš tip</h2>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  Váš tip byl úspěšně uložen!
                </div>
              )}
              <form onSubmit={handleSubmitTip} className="space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <div className="text-center">
                    <p>{match.team_home}</p>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={userTip.score_home}
                      onChange={(e) => setUserTip({...userTip, score_home: e.target.value})}
                      className="border-2 rounded w-16 h-16 text-center text-2xl"
                      placeholder="0"
                      required
                    />
                  </div>
                  <span className="text-xl">:</span>
                  <div className="text-center">
                    <p>{match.team_away}</p>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={userTip.score_away}
                      onChange={(e) => setUserTip({...userTip, score_away: e.target.value})}
                      className="border-2 rounded w-16 h-16 text-center text-2xl"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-hockey-blue hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                  >
                    {submitting ? 'Ukládám...' : 'Uložit tip'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="bg-white shadow-md rounded p-6">
            <h2 className="text-xl font-bold mb-4">Tipy ostatních</h2>
            {matchHasEnded ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Uživatel</th>
                      <th className="py-2 px-4 border-b">Tip</th>
                      <th className="py-2 px-4 border-b">Body</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTips.map((tip) => (
                      <tr key={tip.id}>
                        <td className="py-2 px-4 border-b">{tip.profiles?.username}</td>
                        <td className="py-2 px-4 border-b text-center">
                          {tip.score_home} : {tip.score_away}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {result && (
                            <div className="inline-block bg-gray-100 px-2 py-1 rounded">
                              -
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-600">
                Tipy ostatních budou viditelné až po začátku zápasu.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDetails;
