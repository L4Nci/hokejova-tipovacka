import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatRemainingTime } from '../utils/timeUtils';

// Vytvoříme DEADLINE v lokálním čase
const DEADLINE = (() => {
  const deadline = new Date(2024, 4, 9, 16, 20); // Měsíce jsou 0-based, takže 4 = květen
  return deadline;
})();

// Záložní seznam týmů pro případ problémů s DB
const DEFAULT_TEAMS = [
  { id: 1, team_name: 'Česko' },
  { id: 2, team_name: 'Slovensko' },
  { id: 3, team_name: 'Finsko' },
  { id: 4, team_name: 'Švédsko' },
  { id: 5, team_name: 'Kanada' },
  { id: 6, team_name: 'USA' },
  { id: 7, team_name: 'Švýcarsko' },
  { id: 8, team_name: 'Německo' },
  // ... další týmy
];

// Definice týmů s URL vlajek
const TEAMS_LIST = [
  { 
    team_name: 'Česko',
    flag_url: 'https://raw.githubusercontent.com/lipis/flag-icons/master/flags/4x3/cz.svg'
  },
  { 
    team_name: 'Slovensko',
    flag_url: 'https://raw.githubusercontent.com/lipis/flag-icons/master/flags/4x3/sk.svg'
  },
  { 
    team_name: 'Finsko',
    flag_url: 'https://raw.githubusercontent.com/lipis/flag-icons/master/flags/4x3/fi.svg'
  },
  { 
    team_name: 'Švédsko',
    flag_url: 'https://raw.githubusercontent.com/lipis/flag-icons/master/flags/4x3/se.svg'
  },
  { 
    team_name: 'Lotyšsko',
    flag_url: 'https://raw.githubusercontent.com/lipis/flag-icons/master/flags/4x3/lv.svg'
  },
  { 
    team_name: 'Rakousko',
    flag_url: 'https://raw.githubusercontent.com/lipis/flag-icons/master/flags/4x3/at.svg'
  },
  { 
    team_name: 'Francie',
    flag_url: 'https://raw.githubusercontent.com/lipis/flag-icons/master/flags/4x3/fr.svg'
  },
  { 
    team_name: 'Slovinsko',
    flag_url: 'https://raw.githubusercontent.com/lipis/flag-icons/master/flags/4x3/si.svg'
  },
  { 
    team_name: 'Švýcarsko',
    flag_url: 'https://raw.githubusercontent.com/lipis/flag-icons/master/flags/4x3/ch.svg'
  },
  { 
    team_name: 'USA',
    flag_url: 'https://raw.githubusercontent.com/lipis/flag-icons/master/flags/4x3/us.svg'
  },
  { 
    team_name: 'Německo',
    flag_url: 'https://raw.githubusercontent.com/lipis/flag-icons/master/flags/4x3/de.svg'
  },
  { 
    team_name: 'Dánsko',
    flag_url: 'https://raw.githubusercontent.com/lipis/flag-icons/master/flags/4x3/dk.svg'
  },
  { 
    team_name: 'Norsko',
    flag_url: 'https://raw.githubusercontent.com/lipis/flag-icons/master/flags/4x3/no.svg'
  },
  { 
    team_name: 'Kazachstán',
    flag_url: 'https://raw.githubusercontent.com/lipis/flag-icons/master/flags/4x3/kz.svg'
  },
  { 
    team_name: 'Maďarsko',
    flag_url: 'https://raw.githubusercontent.com/lipis/flag-icons/master/flags/4x3/hu.svg'
  },
  { 
    team_name: 'Kanada',
    flag_url: 'https://raw.githubusercontent.com/lipis/flag-icons/master/flags/4x3/ca.svg'
  }
].sort((a, b) => a.team_name.localeCompare(b.team_name));

export const TournamentWinnerTip = ({ user }) => {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [existingTip, setExistingTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [teams, setTeams] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState('');

  const isDeadlinePassed = () => {
    const now = new Date();
    return now > DEADLINE;
  };

  useEffect(() => {
    fetchTeams();
    fetchExistingTip();
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isDeadlinePassed()) {
        setTimeRemaining(formatRemainingTime(DEADLINE));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchTeams = async () => {
    setTeams(TEAMS_LIST);
    setLoading(false);
  };

  const fetchExistingTip = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('tournament_winner_tips')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (!error && data) {
      setExistingTip(data);
      setSelectedTeam(data.team_name);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !selectedTeam) return;

    setSaving(true);
    setError(null);

    try {
      const tipData = {
        user_id: user.id,
        team_name: selectedTeam
      };

      const { error } = existingTip 
        ? await supabase
            .from('tournament_winner_tips')
            .update(tipData)
            .eq('id', existingTip.id)
        : await supabase
            .from('tournament_winner_tips')
            .insert([tipData]);

      if (error) throw error;
      
      await fetchExistingTip(); // Aktualizujeme data
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Načítám...</div>;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Tip na celkového vítěze turnaje</h2>
      
      {isDeadlinePassed() ? (
        <div className="text-gray-600">
          {existingTip ? (
            <div className="flex items-center gap-2">
              <span>Váš tip:</span>
              <img 
                src={teams.find(t => t.team_name === existingTip.team_name)?.flag_url} 
                alt="" 
                className="w-6 h-4 object-cover rounded"
              />
              <span className="font-semibold">{existingTip.team_name}</span>
            </div>
          ) : (
            <p>Deadline pro zadání tipu vypršel</p>
          )}
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vyberte tým:
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Vyberte tým...</option>
                {teams.map(team => (
                  <option key={team.team_name} value={team.team_name} className="flex items-center gap-2">
                    {team.team_name}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedTeam && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <img 
                  src={teams.find(t => t.team_name === selectedTeam)?.flag_url} 
                  alt="" 
                  className="w-8 h-6 object-cover rounded"
                />
                <span className="font-medium">{selectedTeam}</span>
              </div>
            )}
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            <button
              type="submit"
              disabled={saving || !selectedTeam}
              className="bg-hockey-blue text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Ukládám...' : existingTip ? 'Upravit tip' : 'Zadat tip'}
            </button>
          </form>
          
          <div className="mt-4 text-sm">
            <span className="text-gray-500">Zbývající čas: </span>
            <span className="font-medium text-hockey-blue">{timeRemaining}</span>
          </div>
        </>
      )}
      
      <div className="mt-4 text-sm text-gray-500">
        Tip lze zadat do 9. 5. 2024 16:20
      </div>
    </div>
  );
};

export default TournamentWinnerTip;
