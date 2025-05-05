import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function UserTipHistory({ user }) {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserTips();
    }
  }, [user]);

  const fetchUserTips = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tips')
        .select(`
          *,
          matches (
            id,
            team_home,
            team_away,
            flag_home_url,
            flag_away_url,
            match_time,
            group_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTips(data || []);
    } catch (error) {
      console.error('Chyba při načítání tipů:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Načítám historii tipů...</div>;
  }

  if (!tips.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Zatím jste nezadali žádné tipy</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Historie vašich tipů</h1>
      
      <div className="space-y-4">
        {tips.map((tip) => (
          <div 
            key={tip.id} 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">
                {new Date(tip.matches.match_time).toLocaleDateString('cs-CZ', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                Skupina {tip.matches.group_name}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={tip.matches.flag_home_url} 
                  alt={tip.matches.team_home}
                  className="w-10 h-7 object-cover rounded"
                />
                <span className="font-medium">{tip.matches.team_home}</span>
              </div>

              <div className="px-6 py-2 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 text-center mb-1">Váš tip</div>
                <div className="flex items-center gap-3 text-xl font-bold">
                  <span>{tip.score_home}</span>
                  <span className="text-gray-400">:</span>
                  <span>{tip.score_away}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-medium">{tip.matches.team_away}</span>
                <img 
                  src={tip.matches.flag_away_url}
                  alt={tip.matches.team_away}
                  className="w-10 h-7 object-cover rounded"
                />
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Tip zadán: {new Date(tip.created_at).toLocaleString('cs-CZ')}
              {tip.updated_at && tip.updated_at !== tip.created_at && (
                <span className="ml-2">
                  • Upraveno: {new Date(tip.updated_at).toLocaleString('cs-CZ')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
