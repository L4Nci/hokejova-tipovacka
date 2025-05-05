import { useState } from 'react';
import { supabase } from '../lib/supabase';

const TipInput = ({ match, user, existingTip, onTipSaved }) => {
  const [scores, setScores] = useState({
    home: existingTip?.score_home || '',
    away: existingTip?.score_away || ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Pro zadání tipu se musíte přihlásit');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const tipData = {
        user_id: user.id,
        match_id: match.id,
        score_home: parseInt(scores.home),
        score_away: parseInt(scores.away)
      };

      let result;
      if (existingTip) {
        // Aktualizace existujícího tipu
        result = await supabase
          .from('tips')
          .update({
            score_home: tipData.score_home,
            score_away: tipData.score_away
          })
          .eq('id', existingTip.id);
      } else {
        // Vytvoření nového tipu
        result = await supabase
          .from('tips')
          .insert([tipData]);
      }

      if (result.error) throw result.error;
      
      onTipSaved && onTipSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const canTip = new Date(match.match_time) > new Date(Date.now() + 5 * 60000); // 5 minut před zápasem

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-4">
      <input
        type="number"
        min="0"
        max="99"
        value={scores.home}
        onChange={(e) => setScores(prev => ({ ...prev, home: e.target.value }))}
        disabled={!canTip || saving}
        className="w-16 text-center border rounded p-2"
        required
      />
      <span className="text-xl">:</span>
      <input
        type="number" 
        min="0"
        max="99"
        value={scores.away}
        onChange={(e) => setScores(prev => ({ ...prev, away: e.target.value }))}
        disabled={!canTip || saving}
        className="w-16 text-center border rounded p-2"
        required
      />

      <button
        type="submit"
        disabled={!canTip || saving}
        className="bg-hockey-blue text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {saving ? 'Ukládám...' : existingTip ? 'Upravit tip' : 'Zadat tip'}
      </button>

      {error && <div className="text-red-500 text-sm">{error}</div>}
      {!canTip && <div className="text-red-500 text-sm">Čas pro zadání tipu vypršel</div>}
    </form>
  );
};

export default TipInput;
