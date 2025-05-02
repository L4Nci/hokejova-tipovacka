import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const UpcomingMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    async function fetchMatches() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .order('match_time', { ascending: true });
          
        if (error) throw error;
        
        // Extract unique groups - změnili jsme "group" na "group_name"
        const uniqueGroups = [...new Set(data.map(match => match.group_name))].filter(Boolean);
        setGroups(uniqueGroups);
        setMatches(data || []);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, []);

  const filteredMatches = selectedGroup === 'all' 
    ? matches 
    : matches.filter(match => match.group_name === selectedGroup);

  const groupByDate = (matches) => {
    const grouped = {};
    
    matches.forEach(match => {
      const date = new Date(match.match_time).toLocaleDateString('cs-CZ');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(match);
    });
    
    return grouped;
  };

  const groupedMatches = groupByDate(filteredMatches);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hockey-blue"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Zápasy MS 2025</h1>
      
      {/* Filter by group */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button 
            className={`px-3 py-1 rounded ${selectedGroup === 'all' ? 'bg-hockey-blue text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedGroup('all')}
          >
            Všechny zápasy
          </button>
          
          {groups.map(group => (
            <button
              key={group}
              className={`px-3 py-1 rounded ${selectedGroup === group ? 'bg-hockey-blue text-white' : 'bg-gray-200'}`}
              onClick={() => setSelectedGroup(group)}
            >
              Skupina {group}
            </button>
          ))}
        </div>
      </div>
      
      {Object.keys(groupedMatches).length === 0 ? (
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p>Žádné zápasy k zobrazení</p>
        </div>
      ) : (
        Object.entries(groupedMatches).map(([date, dayMatches]) => (
          <div key={date} className="mb-8">
            <h2 className="text-lg font-bold mb-3">{date}</h2>
            
            <div className="space-y-3">
              {dayMatches.map(match => (
                <Link
                  key={match.id}
                  to={`/matches/${match.id}`}
                  className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {match.flag_home_url && (
                        <img src={match.flag_home_url} alt={match.team_home} className="w-8 h-6 object-cover" />
                      )}
                      <span className="font-medium">{match.team_home}</span>
                    </div>
                    
                    <div className="text-center">
                      <span className="mx-2">vs</span>
                      <div className="text-xs text-gray-500">
                        {new Date(match.match_time).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {match.group_name && (
                        <div className="text-xs font-semibold bg-gray-100 px-2 rounded mt-1">
                          Skupina {match.group_name}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{match.team_away}</span>
                      {match.flag_away_url && (
                        <img src={match.flag_away_url} alt={match.team_away} className="w-8 h-6 object-cover" />
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default UpcomingMatches;
