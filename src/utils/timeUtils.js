/**
 * Formátuje datum a čas podle českého formátu
 * @param {string|Date} dateTimeStr - Datum jako string nebo objekt Date
 * @returns {string} Formátované datum a čas
 */
export const formatDateTime = (dateTimeStr) => {
  const date = new Date(dateTimeStr);
  return new Intl.DateTimeFormat('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Formátuje datum a čas včetně roku podle českého formátu
 * @param {string|Date} dateTimeStr - Datum jako string nebo objekt Date
 * @returns {string} Formátované datum a čas s rokem
 */
export const formatDateTimeWithYear = (dateTimeStr) => {
  const date = new Date(dateTimeStr);
  return new Intl.DateTimeFormat('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Kontroluje, zda je ještě možné tipovat (5 minut před zápasem)
 * @param {string|Date} matchTime - Čas zápasu
 * @param {Date} currentTime - Aktuální čas
 * @returns {boolean} True pokud lze ještě tipovat, jinak false
 */
export const isTipTimeValid = (matchTime, currentTime = new Date()) => {
  const matchDate = new Date(matchTime);
  matchDate.setMinutes(matchDate.getMinutes() - 5); // 5 minut před zápasem
  return currentTime < matchDate;
};

/**
 * Formátuje zbývající čas do deadlinu
 * @param {string|Date} matchTime - Čas zápasu
 * @param {Date} currentTime - Aktuální čas
 * @returns {string} Formátovaný zbývající čas
 */
export const formatRemainingTime = (matchTime, currentTime = new Date()) => {
  // Převod času zápasu na Date objekt (pokud již není)
  const matchDate = matchTime instanceof Date ? matchTime : new Date(matchTime);
  
  // Výpočet rozdílu v milisekundách
  const diff = matchDate - currentTime;
  
  // Pokud je rozdíl záporný, zápas již proběhl
  if (diff <= 0) {
    return "Probíhá";
  }
  
  // Převod milisekund na dny, hodiny, minuty a sekundy
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
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

/**
 * Vrací český skloňovaný text pro body
 * @param {number} points - Počet bodů
 * @returns {string} Správně skloňovaný text
 */
export const formatPointsText = (points) => {
  if (points === 1) return 'bod';
  if (points >= 2 && points <= 4) return 'body';
  return 'bodů';
};
