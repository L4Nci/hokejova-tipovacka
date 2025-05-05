import { useState } from 'react';
import { supabase } from '../lib/supabase';

const ResultInput = ({ match, existingResult, onSave }) => {
  const [scores, setScores] = useState({
    home: existingResult?.final_score_home || '',
    away: existingResult?.final_score_away || ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('results')
        .upsert({
          match_id: match.id,
          final_score_home: parseInt(scores.home),
          final_score_away: parseInt(scores.away)
        });

      if (error) throw error;
      onSave?.();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-4">
      <input
        type="number"
        min="0" 
        value={scores.home}
        onChange={(e) => setScores(prev => ({...prev, home: e.target.value}))}
        className="w-16 text-center border rounded p-2"
        required
      />
      <span className="text-xl">:</span>
      <input
        type="number"
        min="0"
        value={scores.away} 
        onChange={(e) => setScores(prev => ({...prev, away: e.target.value}))}
        className="w-16 text-center border rounded p-2"
        required
      />
      <button
        type="submit"
        disabled={saving}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {saving ? 'Ukládám...' : existingResult ? 'Upravit výsledek' : 'Zadat výsledek'}
      </button>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </form>
  );
};

export default ResultInput;
