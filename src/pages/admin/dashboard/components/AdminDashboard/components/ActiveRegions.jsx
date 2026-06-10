import SafeIcon from '../../../../../../common/SafeIcon';
import Skeleton from './Skeleton';

const ActiveRegions = ({ regionData = [], loading }) => {
  const maxVal = regionData[0]?.livesImpacted || 1;

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-10 h-10 bg-[#f1f1f3] rounded-xl flex items-center justify-center flex-shrink-0">
          <SafeIcon icon="FiGlobe" className="text-gray-400 text-base" />
        </div>
        <h3 className="text-sm font-black text-[#0B0D0F]">Active Regions</h3>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="py-2 flex items-center gap-3">
              <Skeleton className="w-5 h-3" />
              <div className="flex-1">
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-1.5 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : regionData.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No location data yet.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {regionData.map(({ country, livesImpacted }, i) => (
            <div key={country} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
              <span className="text-[11px] font-bold text-gray-400 w-5 flex-shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-[#0B0D0F]">{country}</span>
                  <span className="text-sm font-bold text-[#0B0D0F]">{livesImpacted.toLocaleString()}</span>
                </div>
                <div className="w-[90%] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#E52321] rounded-full"
                    style={{ width: `${(livesImpacted / maxVal) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-100 mt-3 pt-4">
        <p className="text-[#E52321] text-xs font-black text-center">
          {regionData.length > 0
            ? `${regionData.length} region${regionData.length !== 1 ? 's' : ''} tracked`
            : 'No regions yet'}
        </p>
      </div>
    </div>
  );
};

export default ActiveRegions;
