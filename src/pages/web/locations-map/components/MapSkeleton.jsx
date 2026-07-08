import React from 'react';
import SafeIcon from '../../../../common/SafeIcon';

const MapSkeleton = ({ minHeight = '500px' }) => (
  <div className="relative rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 bg-gray-100 animate-pulse flex items-center justify-center" style={{ minHeight }}>
    <SafeIcon icon="FiMap" className="text-4xl text-gray-300" />
  </div>
);

export default MapSkeleton;
