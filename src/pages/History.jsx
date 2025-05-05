import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const History = () => {
  const [pastMatches, setPastMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const now = new Date().toISOString();

        // Fetch past matches - simplified query
        const { data: pastData, error: pastError } = await supabase
          .from('matches')
          .select('*')
          .lt('match_time', now)
          .order('match_time', { ascending: false });

        if (pastError) {
          console.error('Past matches error:', pastError);
          throw pastError;
        }

        // Fetch upcoming matches - simplified query
        const { data: upcomingData, error: upcomingError } = await supabase
          .from('matches')
          .select('*')
          .gte('match_time', now)
          .order('match_time', { ascending: true });

        if (upcomingError) {
          console.error('Upcoming matches error:', upcomingError);
          throw upcomingError;
        }

        console.log('Past matches:', pastData);
        console.log('Upcoming matches:', upcomingData);

        setPastMatches(pastData || []);
        setUpcomingMatches(upcomingData || []);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (isLoading) {
    return <div className="text-center">Načítám zápasy...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">Chyba při načítání zápasů: {error}</div>;
  }

  const MatchesList = ({ matches, isPast }) => (
    <div className="grid gap-4">
      {matches.length === 0 ? (
        <div className="text-gray-500">Žádné zápasy k zobrazení</div>
      ) : (
        matches.map((match) => (
          <div key={match.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <span>{match.team_home} vs {match.team_away}</span>
              <span>{new Date(match.match_time).toLocaleString('cs-CZ')}</span>
            </div>
            {isPast && match.score_home !== null && (
              <div className="mt-2">
                Výsledek: {match.score_home} : {match.score_away}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Nadcházející zápasy</h2>
        <MatchesList matches={upcomingMatches} isPast={false} />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Již odehrané zápasy</h2>
        <MatchesList matches={pastMatches} isPast={true} />
      </div>
    </div>
  );
};

export default History;
