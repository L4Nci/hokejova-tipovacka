import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const UserTips = ({ user }) => {
  const [matches, setMatches] = useState([]);
  const [tips, setTips] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingTip, setSavingTip] = useState({});
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());

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
      
      // Načtení nadcházejících zápasů (do týdne)
      const currentDate = new Date().toISOString();
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .gt('match_time', currentDate)
        .lt('match_time', oneWeekFromNow.toISOString())
        .order('match_time', { ascending: true });
      
      if (matchesError) throw matchesError;

      // Načtení tipů uživatele
      if (user) {
        const { data: tipsData, error: tipsError } = await supabase
          .from('tips')
          .select('*')
          .eq('user_id', user.id);
        
        if (tipsError) throw tipsError;
        
        // Převedení tipů na objekt pro snazší přístup
        const tipsMap = {};
        tipsData?.forEach(tip => {
          tipsMap[tip.match_id] = {
            id: tip.id,  // Přidáme ID tipu pro pozdější aktualizaci
            scoreHome: tip.score_home,
            scoreAway: tip.score_away
          };
        });
        
        setTips(tipsMap);
      }
      
      setMatches(matchesData || []);
    } catch (error) {
      console.error('Chyba při načítání dat:', error);
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
      
      {!user && (
        <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
          <p className="font-medium">Pro ukládání tipů je potřeba se přihlásit.</p>
          <Link to="/login" className="text-blue-600 hover:underline">Přihlásit se</Link>
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        {matches.map(match => {
          const tipData = tips[match.id] || { scoreHome: 0, scoreAway: 0 };
          const canTip = user && isTipTimeValid(match.match_time);
          const remainingTime = formatRemainingTime(match.match_time);
          
          return (
            <div key={match.id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-600">{formatDateTime(match.match_time)}</span>
                <span className="text-sm font-semibold text-gray-700">Skupina {match.group_name}</span>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {match.flag_home_url && (
                    <img src={match.flag_home_url} alt={match.team_home} className="w-8 h-6 mr-2" />
                  )}
                  <span className="font-medium">{match.team_home}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={tipData.scoreHome}
                    onChange={(e) => handleTipChange(match.id, 'home', e.target.value)}
                    disabled={!canTip}
                    className="w-12 p-1 text-center border rounded"
                  />
                  <span className="text-xl">:</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={tipData.scoreAway}
                    onChange={(e) => handleTipChange(match.id, 'away', e.target.value)}
                    disabled={!canTip}
                    className="w-12 p-1 text-center border rounded"
                  />
                </div>
                
                <div className="flex items-center">
                  <span className="font-medium">{match.team_away}</span>
                  {match.flag_away_url && (
                    <img src={match.flag_away_url} alt={match.team_away} className="w-8 h-6 ml-2" />
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <div className={`text-sm ${!canTip ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                  {canTip ? `Zbývá: ${remainingTime}` : "Čas pro tipování vypršel"}
                </div>
                
                <div className="flex items-center">
                  {success[match.id] && (
                    <div className="text-green-600 mr-3 text-sm flex items-center">
                      <span className="mr-1">✓</span> Tip uložen
                    </div>
                  )}
                  
                  {canTip && (
                    <button
                      onClick={() => saveTip(match.id)}
                      disabled={savingTip[match.id]}
                      className="bg-hockey-blue text-white px-4 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {savingTip[match.id] ? 'Ukládání...' : tipData.id ? 'Aktualizovat' : 'Uložit tip'}
                    </button>
                  )}
                </div>
              </div>
              
              {errors[match.id] && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                  {errors[match.id]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserTips;
