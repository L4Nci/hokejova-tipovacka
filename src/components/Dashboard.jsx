import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Dashboard = ({ user }) => {
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('matches')
          .select(`
            *,
            tips (
              id,
              score_home,
              score_away,
              user:profiles (
                username
              )
            )
          `)
          .gte('match_time', new Date().toISOString())
          .order('match_time')
          .limit(6);  // Změněno z 5 na 6
        
        if (error) throw error;
        
        setUpcomingMatches(data || []);
      } catch (error) {
        console.error('Chyba při načítání zápasů:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Hokejová tipovačka MS 2025</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Hokeji zdar, tipovací parťáci!</h2>
       
        <p className="mb-4">
        Věřím, že nám tato stránka usnadní zadávání tipů a ukáže naše aktuální pořadí :).
        </p>
        <p className="mb-4">
        Stručně k pravidlům:
        </p>

        <p className="mb-4">
        • Tipy zadáváme a můžeme měnit nejpozději 5 minut před zahájením zápasu
        </p>
        <p className="mb-4">
        • Tip na celkového vítěze turnaje můžeme zadat nejpozději v pátek 9. 5. do 16:00
        </p>
        <p className="mb-4">
        • Za přesný tip na výsledek zápasu (včetně prodloužení a nájezdů) je 5 bodů
        </p>
        <p className="mb-4">
        • Za správný tip na vítěze zápasu (včetně prodloužení a nájezdů) jsou 2 body
        </p>
        <p className="mb-4">
        • Správný tip na celkového vítěze turnaje je za 10 bodů
        </p>
        <p className="mb-4">
        Díky za vaši účast a hodně štěstí!
        </p>

        <p className="mb-4">
        H.
        </p>

        {user ? (
          <Link
            to="/tips"
            className="bg-hockey-blue text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Začít tipovat
          </Link>
        ) : (
          <Link
            to="/login"
            className="bg-hockey-blue text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Přihlásit se pro tipování
          </Link>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Nadcházející zápasy</h2>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hockey-blue"></div>
          </div>
        ) : upcomingMatches.length === 0 ? (
          <p className="text-center text-gray-500">Žádné nadcházející zápasy</p>
        ) : (
          <div className="space-y-6">
            {upcomingMatches.map(match => (
              <div key={match.id} className="border-b pb-4 last:border-b-0">
                <div className="text-sm text-gray-600 mb-2">{formatDateTime(match.match_time)}</div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    {match.flag_home_url && (
                      <img src={match.flag_home_url} alt={match.team_home} className="w-10 h-7 object-cover rounded shadow" />
                    )}
                    <span className="ml-2">{match.team_home}</span>
                  </div>
                  <div className="mx-2">vs</div>
                  <div className="flex items-center">
                    <span className="mr-2">{match.team_away}</span>
                    {match.flag_away_url && (
                      <img src={match.flag_away_url} alt={match.team_away} className="w-10 h-7 object-cover rounded shadow" />
                    )}
                  </div>
                </div>

                {match.tips && match.tips.length > 0 ? (
                  <div className="mt-2 bg-gray-50 p-3 rounded">
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Tipy ostatních:</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {match.tips.map((tip) => (
                        <div 
                          key={tip.id} 
                          className="flex justify-between text-sm py-1 px-2 rounded bg-white"
                        >
                          <span className="text-gray-600">{tip.user?.username}</span>
                          <span className="font-medium">{tip.score_home}:{tip.score_away}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-gray-500 italic">
                    Na tento zápas zatím nikdo netipoval
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
