import React from 'react';
import SafeIcon from '../../../../common/SafeIcon';

const MapSkeleton = () => (
  <div className="relative rounded-[2rem] overflow-hidden shadow-lg min-h-[500px] border border-gray-100 bg-gray-100 animate-pulse flex items-center justify-center">
    <SafeIcon icon="FiMap" className="text-4xl text-gray-300" />
  </div>
);

export default MapSkeleton;
