import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('matches');
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingResult, setSavingResult] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (activeTab === 'matches') {
      fetchMatches();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    const debugAdminAccess = async () => {
      console.log('Admin status:', {
        user: user?.id,
        role: userRole,
        session: await supabase.auth.getSession()
      });

      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .limit(1);

      console.log('Test matches query:', { data, error });
    };

    debugAdminAccess();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*, results(*)')
        .order('match_time', { ascending: true });
      
      if (matchesError) throw matchesError;
      
      const resultsMap = {};
      matchesData.forEach(match => {
        if (match.results) {
          resultsMap[match.id] = {
            homeScore: match.results.final_score_home,
            awayScore: match.results.final_score_away
          };
        }
      });
      
      setMatches(matchesData || []);
      setResults(resultsMap);
    } catch (error) {
      console.error('Chyba při načítání zápasů:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error('Chyba při načítání uživatelů:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultChange = (matchId, team, value) => {
    const numValue = parseInt(value) || 0;
    
    setResults(prevResults => ({
      ...prevResults,
      [matchId]: {
        ...(prevResults[matchId] || { homeScore: 0, awayScore: 0 }),
        [team === 'home' ? 'homeScore' : 'awayScore']: numValue
      }
    }));
  };

  const saveResult = async (matchId) => {
    try {
      setSavingResult(prev => ({ ...prev, [matchId]: true }));
      
      // 1. Uložíme výsledek do results tabulky
      const { error: resultError } = await supabase
        .from('results')
        .upsert({
          match_id: matchId,
          final_score_home: results[matchId]?.homeScore || 0,
          final_score_away: results[matchId]?.awayScore || 0
        }, {
          onConflict: 'match_id'
        });

      if (resultError) throw resultError;

      // updated_at se aktualizuje automaticky díky triggeru
      const { error: matchError } = await supabase
        .from('matches')
        .update({ 
          is_finished: true,
          final_score_home: results[matchId]?.homeScore || 0,
          final_score_away: results[matchId]?.awayScore || 0
        })
        .eq('id', matchId);

      if (matchError) throw matchError;

      await fetchMatches();

    } catch (error) {
      console.error('Error saving result:', error);
      setErrors(prev => ({
        ...prev,
        [matchId]: `Chyba při ukládání: ${error.message}`
      }));
    } finally {
      setSavingResult(prev => ({ ...prev, [matchId]: false }));
    }
  };

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('cs-CZ', {
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };

  const renderMatchesTab = () => {
    if (loading) {
      return <div className="text-center py-10">Načítání zápasů...</div>;
    }

    return (
      <>
        <h2 className="text-xl font-semibold mb-4">Správa zápasů a výsledků</h2>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zápas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum a čas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skupina
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Výsledek
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {matches.map(match => {
                const resultData = results[match.id] || { homeScore: 0, awayScore: 0 };
                const hasResult = !!match.results;
                
                return (
                  <tr key={match.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {match.flag_home_url && <img src={match.flag_home_url} alt={match.team_home} className="h-5 w-8 mr-2" />}
                          <span>{match.team_home}</span>
                        </div>
                        <span className="mx-2">vs</span>
                        <div className="flex items-center">
                          <span>{match.team_away}</span>
                          {match.flag_away_url && <img src={match.flag_away_url} alt={match.team_away} className="h-5 w-8 ml-2" />}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDateTime(match.match_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {match.group_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={resultData.homeScore}
                          onChange={(e) => handleResultChange(match.id, 'home', e.target.value)}
                          className="w-12 p-1 text-center border rounded"
                        />
                        <span className="text-xl">:</span>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={resultData.awayScore}
                          onChange={(e) => handleResultChange(match.id, 'away', e.target.value)}
                          className="w-12 p-1 text-center border rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => saveResult(match.id)}
                        disabled={savingResult[match.id]}
                        className={`px-4 py-1 rounded font-medium text-white ${
                          hasResult ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                        } disabled:opacity-50`}
                      >
                        {savingResult[match.id] 
                          ? 'Ukládání...' 
                          : (hasResult ? 'Aktualizovat výsledek' : 'Uložit výsledek')}
                      </button>
                      
                      {errors[match.id] && (
                        <div className="mt-2 text-sm text-red-600">{errors[match.id]}</div>
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {matches.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Žádné zápasy k zobrazení.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderUsersTab = () => {
    if (loading) {
      return <div className="text-center py-10">Načítání uživatelů...</div>;
    }

    return (
      <>
        <h2 className="text-xl font-semibold mb-4">Správa uživatelů</h2>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uživatel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum registrace
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('cs-CZ')}
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    Žádní uživatelé k zobrazení.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Administrátorský panel</h1>
      
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'matches' ? 'border-b-2 border-hockey-blue text-hockey-blue' : 'text-gray-600'}`}
          onClick={() => setActiveTab('matches')}
        >
          Zápasy a výsledky
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'users' ? 'border-b-2 border-hockey-blue text-hockey-blue' : 'text-gray-600'}`}
          onClick={() => setActiveTab('users')}
        >
          Uživatelé
        </button>
      </div>
      
      {activeTab === 'matches' && renderMatchesTab()}
      {activeTab === 'users' && renderUsersTab()}
    </div>
  );
};

export default AdminPanel;
