import React from 'react';

const MatchStats = ({ match }) => {
  return (
    <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <span className="block text-sm text-gray-500">Celkem tipů</span>
        <span className="text-xl font-bold">{match.total_tips || 0}</span>
      </div>
      <div className="text-center">
        <span className="block text-sm text-gray-500">Přesné tipy</span>
        <span className="text-xl font-bold text-green-600">{match.perfect_tips || 0}</span>
      </div>
      <div className="text-center">
        <span className="block text-sm text-gray-500">Správní vítězové</span>
        <span className="text-xl font-bold text-blue-600">{match.correct_tips || 0}</span>
      </div>
    </div>
  );
};

export default MatchStats;
