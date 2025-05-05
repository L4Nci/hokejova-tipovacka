import React from 'react';

const UserStats = ({ userData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Úspěšnost tipování</h3>
        <p className="text-2xl font-bold">{userData.success_rate}%</p>
      </div>
      // ...další statistiky
    </div>
  );
};

export default UserStats;
