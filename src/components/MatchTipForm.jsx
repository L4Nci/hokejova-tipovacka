import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const MatchTipForm = ({ match, user, existingTip, onTipSaved }) => {
  const [scores, setScores] = useState({
    homeScore: existingTip?.score_home || '',
    awayScore: existingTip?.score_away || ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchTips = async () => {
    try {
      const { data: tips, error } = await supabase
        .from('tips')
        .select(`
          id,
          score_home,
          score_away,
          user_id,
          profiles (username)
        `)
        .eq('match_id', match.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return tips;
    } catch (err) {
      console.error('Chyba při načítání tipů:', err);
      throw new Error('Nepodařilo se načíst tipy. Zkuste to prosím později.');
    }
  };

  const loadTips = async () => {
    try {
      setLoading(true);
      const tipsData = await fetchTips();
      setTips(tipsData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTips();
  }, [match.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Pro zadání tipu se musíte přihlásit');
      return;
    }

    if (scores.homeScore === '' || scores.awayScore === '') {
      setError('Vyplňte prosím obě skóre');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const tipData = {
        user_id: user.id,
        match_id: match.id,
        score_home: parseInt(scores.homeScore),
        score_away: parseInt(scores.awayScore),
        created_at: new Date().toISOString()
      };

      let result;
      if (existingTip) {
        result = await supabase
          .from('tips')
          .update({
            score_home: tipData.score_home,
            score_away: tipData.score_away,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingTip.id);
      } else {
        result = await supabase
          .from('tips')
          .insert([tipData]);
      }

      if (result.error) throw result.error;
      
      onTipSaved?.();
      
      navigate('/history');
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const canTip = new Date(match.match_time) > new Date(Date.now() + 5 * 60000);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Team sections with responsive layout */}
        <div className="flex items-center justify-center sm:justify-start space-x-3">
          <img src={match.flag_home_url} alt={match.team_home} 
               className="w-8 h-6 sm:w-10 sm:h-7 object-cover rounded shadow" />
          <span className="text-sm sm:text-base font-medium">{match.team_home}</span>
        </div>

        {/* Score inputs */}
        <div className="flex justify-center items-center space-x-4">
          <input
            type="number"
            min="0"
            value={scores.homeScore}
            onChange={(e) => setScores(prev => ({ ...prev, homeScore: e.target.value }))}
            className="w-14 h-14 md:w-16 md:h-16 text-xl md:text-2xl text-center border-2"
            disabled={!canTip || submitting}
            required
          />
          <span className="font-bold text-xl md:text-2xl text-gray-600">:</span>
          <input
            type="number"
            min="0"
            value={scores.awayScore}
            onChange={(e) => setScores(prev => ({ ...prev, awayScore: e.target.value }))}
            className="w-14 h-14 md:w-16 md:h-16 text-xl md:text-2xl text-center border-2"
            disabled={!canTip || submitting}
            required
          />
        </div>

        <div className="flex items-center justify-center sm:justify-end space-x-3">
          <span className="text-sm sm:text-base font-medium">{match.team_away}</span>
          <img src={match.flag_away_url} alt={match.team_away}
               className="w-8 h-6 sm:w-10 sm:h-7 object-cover rounded shadow" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500">
          {canTip 
            ? `Tip můžete zadat do ${new Date(match.match_time).toLocaleTimeString()}`
            : 'Čas pro zadání tipu vypršel'
          }
        </span>
        
        <button
          type="submit"
          disabled={!canTip || submitting}
          className={`
            px-6 py-3 rounded-lg font-medium text-white
            transform transition-all duration-200
            ${!canTip || submitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-hockey-blue hover:bg-blue-700 hover:scale-105 active:scale-95'
            }
          `}
        >
          {submitting 
            ? <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Ukládám...
              </span>
            : existingTip 
              ? 'Upravit tip' 
              : 'Zadat tip'
          }
        </button>
      </div>
    </form>
  );
};

export default MatchTipForm;
