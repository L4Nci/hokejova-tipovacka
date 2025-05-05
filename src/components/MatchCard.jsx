import React from 'react';
import { formatDateTime } from '../utils/timeUtils';

const MatchCard = ({ match }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-600">
          {formatDateTime(match.match_time)}
        </span>
        // ...rest of the component
      </div>
    </div>
  );
};

export default MatchCard;
