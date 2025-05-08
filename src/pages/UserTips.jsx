import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { MatchTipForm } from '../components/MatchTipForm';

const UserTips = ({ user }) => {
  const [matches, setMatches] = useState([]);
  const [tips, setTips] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingTip, setSavingTip] = useState({});
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState(null);

  // Aktualizace aktuálního času každou sekundu pro odpočet
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Odstraníme časové omezení a načteme všechny zápasy
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .order('match_time', { ascending: true }); // Seřadíme podle času
      
      if (matchesError) throw matchesError;

      // Načtení tipů uživatele
      if (user) {
        const { data: tipsData, error: tipsError } = await supabase
          .from('tips')
          .select('*')
          .eq('user_id', user.id);
        
        if (tipsError) {
          console.error('Chyba při načítání tipů:', tipsError);
          setError('Nepodařilo se načíst tipy. Zkuste to prosím později.');
          return;
        }
        
        const tipsMap = {};
        tipsData?.forEach(tip => {
          tipsMap[tip.match_id] = {
            id: tip.id,
            scoreHome: tip.score_home,
            scoreAway: tip.score_away
          };
        });
        
        setTips(tipsMap);
      }
      
      setMatches(matchesData || []);
    } catch (error) {
      console.error('Chyba při načítání dat:', error);
      setError('Nepodařilo se načíst data. Zkuste to prosím později.');
    } finally {
      setLoading(false);
    }
  };

  const handleTipChange = (matchId, team, value) => {
    const numValue = parseInt(value, 10) || 0;
    
    setTips(prevTips => ({
      ...prevTips,
      [matchId]: {
        ...prevTips[matchId] || { scoreHome: 0, scoreAway: 0 },
        [team === 'home' ? 'scoreHome' : 'scoreAway']: numValue
      }
    }));
  };

  const saveTip = async (matchId) => {
    if (!user) {
      alert("Pro uložení tipu se prosím přihlaste.");
      return;
    }
    
    try {
      setSavingTip(prev => ({ ...prev, [matchId]: true }));
      setErrors(prev => ({ ...prev, [matchId]: null }));
      
      const tipData = tips[matchId] || { scoreHome: 0, scoreAway: 0 };
      
      // Pokud již existuje ID tipu, použijeme UPDATE, jinak INSERT
      if (tipData.id) {
        // Aktualizace existujícího tipu
        const { error } = await supabase
          .from('tips')
          .update({
            score_home: tipData.scoreHome,
            score_away: tipData.scoreAway,
            updated_at: new Date().toISOString()
          })
          .eq('id', tipData.id);
          
        if (error) throw error;
      } else {
        // Vytvoření nového tipu
        const { error } = await supabase
          .from('tips')
          .insert({
            user_id: user.id,
            match_id: matchId,
            score_home: tipData.scoreHome,
            score_away: tipData.scoreAway
          });
          
        if (error) throw error;
          
        // Po úspěšném uložení znovu načteme tipy, abychom měli ID pro příští aktualizaci
        await fetchData();
      }
      
      setSuccess(prev => ({ ...prev, [matchId]: true }));
      
      setTimeout(() => {
        setSuccess(prev => ({ ...prev, [matchId]: false }));
      }, 3000);
      
    } catch (error) {
      console.error('Chyba při ukládání tipu:', error);
      setErrors(prev => ({ 
        ...prev, 
        [matchId]: `Nepodařilo se uložit tip: ${error.message}` 
      }));
    } finally {
      setSavingTip(prev => ({ ...prev, [matchId]: false }));
    }
  };

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('cs-CZ', {
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };
  
  const isTipTimeValid = (matchTime) => {
    const matchDate = new Date(matchTime);
    const now = currentTime; // Použití aktualizovaného času pro přesný odpočet
    matchDate.setMinutes(matchDate.getMinutes() - 5);
    return now < matchDate;
  };

  const formatRemainingTime = (matchTime) => {
    const deadline = new Date(matchTime);
    deadline.setMinutes(deadline.getMinutes() - 5); // 5 minut před zápasem
    
    const now = currentTime;
    const timeDiff = deadline - now;
    
    if (timeDiff <= 0) {
      return "Čas vypršel";
    }
    
    // Výpočet zbývajícího času
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    // Formátování odpočtu
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hockey-blue"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg mb-4">Žádné nadcházející zápasy k tipování</p>
        <Link to="/" className="text-hockey-blue hover:underline">
          Zpět na přehled
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tipy na nadcházející zápasy</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {!user && (
        <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p className="font-medium">Pro ukládání tipů je potřeba se přihlásit.</p>
          <Link to="/login" className="text-blue-600 hover:underline">Přihlásit se</Link>
        </div>
      )}
      
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {matches.map((match) => (
          <div key={match.id} className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="flex flex-col space-y-4">
              <div className="text-sm text-gray-600 text-center">
                {formatDateTime(match.match_time)}
              </div>
              
              <MatchTipForm
                match={match}
                user={user}
                existingTip={tips[match.id]}
                onTipSaved={() => fetchData()}
                className="w-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserTips;
