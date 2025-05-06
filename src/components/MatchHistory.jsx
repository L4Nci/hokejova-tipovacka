import React from 'react';

const MatchHistory = ({ matches }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Historie zápasů</h2>
      
      {matches?.map((match) => (
        <div key={match.id} className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">
              {formatDate(match.match_time)}
            </span>
            <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
              Skupina {match.group_name}
            </span>
          </div>

          {/* Upravený layout pro výsledek */}
          <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
            <div className="flex items-center gap-2 justify-end">
              <img 
                src={match.flag_home_url} 
                alt={match.team_home} 
                className="w-8 h-6 object-cover"
              />
              <span className="font-medium text-right">{match.team_home}</span>
            </div>

            <div className="px-4 py-2 bg-gray-50 rounded-lg font-bold text-xl text-center min-w-[100px] mx-auto">
              {match.results ? (
                `${match.results.final_score_home} : ${match.results.final_score_away}`
              ) : (
                '- : -'
              )}
            </div>

            <div className="flex items-center gap-2 justify-start">
              <span className="font-medium text-left">{match.team_away}</span>
              <img 
                src={match.flag_away_url} 
                alt={match.team_away} 
                className="w-8 h-6 object-cover"
              />
            </div>
          </div>

          {match.results && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Nejlepší tipy:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {match.best_tips?.slice(0, 6).map((tip) => (
                  <div 
                    key={tip.id}
                    className="text-sm bg-gray-50 p-2 rounded flex justify-between"
                  >
                    <span>{tip.username}</span>
                    <span className="font-medium">
                      {tip.score_home}:{tip.score_away}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MatchHistory;
