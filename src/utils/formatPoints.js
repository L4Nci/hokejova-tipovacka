export const getPointsExplanation = (tip, result) => {
  if (!result) return 'Čeká se na výsledek';
  
  if (tip.score_home === result.final_score_home && 
      tip.score_away === result.final_score_away) {
    return 'Přesný tip (5 bodů)';
  }
  
  const tipWinner = Math.sign(tip.score_home - tip.score_away);
  const resultWinner = Math.sign(result.final_score_home - result.final_score_away);
  
  if (tipWinner === resultWinner) {
    return 'Správný vítěz (2 body)';
  }
  
  return 'Špatný tip (0 bodů)';
};
