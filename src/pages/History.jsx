import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatDateTime } from '../utils/timeUtils';
import DebugMatch from '../components/DebugMatch';
import MatchStats from '../components/MatchStats';

const History = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('all'); // 'all', 'completed', 'upcoming'
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [groups, setGroups] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    filterMatches();
  }, [view, selectedGroup, matches]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const { data: matchData, error } = await supabase
        .from('match_history')
        .select(`
          *,
          final_score_home,
          final_score_away,
          is_finished,
          group_name,
          team_home,
          team_away,
          flag_home_url,
          flag_away_url,
          match_time,
          tips (
            id,
            score_home,
            score_away,
            profiles (username)
          )
        `)
        .order('match_time', { ascending: false });
      
      if (error) throw error;
      setMatches(matchData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterMatches = () => {
    let filtered = matches;
    if (view === 'completed') {
      filtered = matches.filter(match => match.is_finished);
    } else if (view === 'upcoming') {
      filtered = matches.filter(match => !match.is_finished);
    }

    if (selectedGroup !== 'all') {
      filtered = filtered.filter(match => match.group_name === selectedGroup);
    }

    setFilteredMatches(filtered);
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

  console.log('Rendering with matches:', { matches });

  if (loading) {
    return <div className="text-center py-8">Načítám zápasy...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Historie zápasů</h1>
        
        {/* Přepínač zobrazení */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setView('all')}
            className={`px-4 py-2 rounded ${
              view === 'all' ? 'bg-white shadow' : 'hover:bg-gray-200'
            }`}
          >
            Vše
          </button>
          <button
            onClick={() => setView('completed')}
            className={`px-4 py-2 rounded ${
              view === 'completed' ? 'bg-white shadow' : 'hover:bg-gray-200'
            }`}
          >
            Odehrané
          </button>
          <button
            onClick={() => setView('upcoming')}
            className={`px-4 py-2 rounded ${
              view === 'upcoming' ? 'bg-white shadow' : 'hover:bg-gray-200'
            }`}
          >
            Nadcházející
          </button>
        </div>
      </div>

      {/* Filtr skupin */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedGroup('all')}
          className={`px-3 py-1 rounded ${
            selectedGroup === 'all' ? 'bg-hockey-blue text-white' : 'bg-gray-200'
          }`}
        >
          Všechny skupiny
        </button>
        {groups.map(group => (
          <button
            key={group}
            onClick={() => setSelectedGroup(group)}
            className={`px-3 py-1 rounded ${
              selectedGroup === group ? 'bg-hockey-blue text-white' : 'bg-gray-200'
            }`}
          >
            Skupina {group}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {filteredMatches.map(match => (
          <div 
            key={match.id} 
            className={`bg-white rounded-lg shadow-md p-6 ${
              !match.is_finished 
                ? 'border-l-4 border-yellow-500' // nadcházející zápas
                : match.final_score_home > match.final_score_away
                  ? 'border-l-4 border-green-500' // výhra domácích
                  : match.final_score_home < match.final_score_away
                    ? 'border-r-4 border-green-500' // výhra hostů
                    : 'border-x-4 border-gray-400' // remíza
            }`}
          >
            {/* Hlavička zápasu */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">
                {formatDateTime(match.match_time)}
              </span>
              <div className="flex items-center gap-2">
                {/* Zobrazíme "Naplánováno" pouze pokud is_finished je false */}
                {!match.is_finished && (
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                    Naplánováno
                  </span>
                )}
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  Skupina {match.group_name}
                </span>
              </div>
            </div>

            {/* Výsledek/stav zápasu */}
            <div className="flex items-center justify-between mb-4">
              <TeamDisplay team={match.team_home} flag={match.flag_home_url} />
              <ScoreDisplay match={match} />
              <TeamDisplay team={match.team_away} flag={match.flag_away_url} reverse />
            </div>

            {/* Přidat statistiky zápasu */}
            <MatchStats match={match} />

            {/* Tipy uživatelů */}
            {match.tips?.length > 0 && (
              <TipsSection match={match} />
            )}

            {process.env.NODE_ENV === 'development' && (
              <DebugMatch match={match} />
            )}
          </div>
        ))}
      </div>

      {!filteredMatches.length && (
        <div className="text-center py-8 text-gray-500">
          Zatím nejsou k dispozici žádné zápasy.
        </div>
      )}
    </div>
  );
};

// Pomocné komponenty
const TeamDisplay = ({ team, flag, reverse }) => (
  <div className={`flex items-center gap-3 ${reverse ? 'flex-row-reverse' : ''}`}>
    <img src={flag} alt={team} className="w-10 h-7 object-cover rounded shadow" />
    <span className="font-medium">{team}</span>
  </div>
);

const ScoreDisplay = ({ match }) => (
  <div className="px-6 py-2 bg-gray-50 rounded-lg">
    <div className="text-xs text-gray-500 text-center mb-1">
      {match.is_finished ? 'Konečný výsledek' : 'Začátek v'}
    </div>
    <div className="text-2xl font-bold text-center">
      {match.is_finished && match.final_score_home !== null && match.final_score_away !== null ? (
        `${match.final_score_home} : ${match.final_score_away}`
      ) : (
        new Date(match.match_time).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
      )}
    </div>
  </div>
);

const TipsSection = ({ match }) => (
  <div className="mt-4 pt-4 border-t border-gray-100">
    <h3 className="text-sm font-medium text-gray-700 mb-2">
      Tipy ({match.tips.length}):
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {match.tips.map(tip => (
        <div key={tip.id} className={`p-2 rounded border ${getTipStyle(tip, match)}`}>
          <div className="flex justify-between items-center">
            <span className="text-sm">{tip.profiles.username}</span>
            <span className="font-medium">{tip.score_home}:{tip.score_away}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default History;
