export const calculatePoints = (tipHome, tipAway, resultHome, resultAway) => {
  // Přesný výsledek
  if (tipHome === resultHome && tipAway === resultAway) {
    return 5;
  }

  // Správný vítěz nebo remíza
  const tipDiff = Math.sign(tipHome - tipAway);
  const resultDiff = Math.sign(resultHome - resultAway);
  
  if (tipDiff === resultDiff) {
    return 2;
  }

  // Špatný tip
  return 0;
};
