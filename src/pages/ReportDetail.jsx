import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import SafeIcon from '../common/SafeIcon';
import { reports } from '../data/mockData';

// Fix for Leaflet default icon paths
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ReportDetail = () => {
  const { id } = useParams();
  const report = useMemo(() => reports.find((r) => r.id === id), [id]);
  const [locationViewMode, setLocationViewMode] = useState(() => {
    return localStorage.getItem('locationViewMode') || 'grid';
  });

  const [selectedMedia, setSelectedMedia] = useState(null);

  const [openSections, setOpenSections] = useState({
    deliverables: true,
    timeline: true,
    locations: false,
    countries: true
  });

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    localStorage.setItem('locationViewMode', locationViewMode);
  }, [locationViewMode]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Handle Escape key for Lightbox
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectedMedia(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const uniqueCountries = useMemo(() => {
    if (!report) return [];
    return [...new Set(report.countries.map(loc => {
      if (loc.includes('(')) return loc.split('(')[0].trim();
      const indianStates = ['Uttar Pradesh', 'Bihar', 'Rajasthan', 'Madhya Pradesh', 'West Bengal', 'Jharkhand', 'Odisha', 'Chhattisgarh', 'Punjab', 'Haryana', 'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Assam', 'Manipur', 'Meghalaya', 'Tripura', 'Nagaland', 'Sikkim', 'Arunachal Pradesh'];
      if (indianStates.includes(loc)) return 'India';
      if (loc === 'West Bank' || loc.includes('Gaza')) return 'Palestine';
      return loc;
    }))].sort();
  }, [report]);

  const getGpsData = (location) => {
    let hash = 0;
    for (let i = 0; i < location.length; i++) {
      hash = location.charCodeAt(i) + ((hash << 5) - hash);
    }
    const bases = {
      'Africa': { lat: 0.0236, lng: 37.9062 },
      'Middle East': { lat: 31.9522, lng: 35.2332 },
      'South Asia': { lat: 20.5937, lng: 78.9629 },
      'Southeast Asia': { lat: 0.7893, lng: 113.9213 },
      'Global': { lat: 38.9072, lng: -77.0369 }
    };
    const base = bases[report.region] || bases['Global'];
    const offsetLat = (hash % 100) / 25;
    const offsetLng = ((hash >> 8) % 100) / 25;
    return `${(base.lat + offsetLat).toFixed(4)}, ${(base.lng + offsetLng).toFixed(4)}`;
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=600&q=80';
  };

  if (!id || !report) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] text-center px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <SafeIcon icon="FiAlertCircle" className="text-3xl text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
      <Link to="/" className="bg-[#E52321] text-white px-8 py-3 rounded-full font-bold hover:bg-[#C91D1B] transition-colors">Return to Database</Link>
    </div>
  );

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-24 font-sans overflow-x-hidden">
      <div className="pt-28 sm:pt-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center text-gray-500 hover:text-[#0B0D0F] transition-colors text-xs font-black tracking-widest uppercase">
            <SafeIcon icon="FiArrowLeft" className="mr-2" /> Back to Database
          </Link>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-[0_30px_80px_rgba(0,0,0,0.12)]">
            <img src={report.image} alt={report.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

            <div className="relative z-10 p-6 sm:p-10 flex flex-col justify-end min-h-[360px] sm:min-h-[420px]">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/85">
                  <SafeIcon icon="FiMapPin" className="text-sm" />
                  {report.region}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/85">
                  <SafeIcon icon="FiLayers" className="text-sm" />
                  {report.sector}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/85">
                  <SafeIcon icon="FiCalendar" className="text-sm" />
                  {report.year}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#D1FAE5] text-[#065F46] border border-[#065F46]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em]">
                  <SafeIcon icon="FiCheck" className="text-sm" />
                  Verified Report
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.05] max-w-4xl text-left">
                {report.title}
              </h1>
              <p className="mt-4 text-sm sm:text-base md:text-lg text-white/80 max-w-3xl leading-relaxed text-left">
                {report.summary}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <StatTile title="LIVES IMPACTED" value={report.metrics.beneficiaries.toLocaleString()} icon="FiUsers" />
            <StatTile title="PROJECT BUDGET" value={`$${report.metrics.budget.toLocaleString()}`} icon="FiDollarSign" />
            <StatTile title="ACTIVE LOCATIONS" value={report.metrics.locations} icon="FiMapPin" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10 sm:space-y-12">
            <ProjectBrief report={report} />
            <CollapsibleContainer title="Project Deliverables" isOpen={openSections.deliverables} onToggle={() => toggleSection('deliverables')}>
              <div className="p-6 sm:p-8 space-y-3">
                {report.itemsDelivered.map((item, idx) => <DeliverableRow key={idx} item={item} />)}
              </div>
            </CollapsibleContainer>
            <CollapsibleContainer title="Implementation Timeline" isOpen={openSections.timeline} onToggle={() => toggleSection('timeline')}>
              <div className="px-6 sm:px-10 py-2 sm:py-4">
                {report.milestones.map((milestone, idx) => <TimelineItem key={idx} milestone={milestone} isLast={idx === report.milestones.length - 1} />)}
              </div>
            </CollapsibleContainer>
          </div>

          <div className="space-y-8 lg:sticky lg:top-28 self-start">
            <section>
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-6 flex items-center justify-between border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center">
                      <SafeIcon icon="FiUsers" className="text-[#E52321] text-lg" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-[11px] font-black text-[#0B0D0F] uppercase tracking-widest text-left">Recipient Demographics</h2>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                <DemographicRow label="Men" percentage={report.demographics.men} icon="FiUser" color="bg-gray-300" />
                <DemographicRow label="Women" percentage={report.demographics.women} icon="FiUser" color="bg-[#0B0D0F]" />
                <DemographicRow label="Children (< 18)" percentage={report.demographics.children} icon="FiSmile" color="bg-[#E52321]" />
              </div>
              </div>
            </section>
            
            <section>
              <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }} className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center">
                      <SafeIcon icon="FiMessageSquare" className="text-[#E52321] text-lg" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Testimonial</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <SafeIcon icon="FiQuote" className="text-[#E52321] text-xl" />
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-[#0B0D0F] leading-relaxed">“{report.testimonial.quote}”</p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-4">
                    <img
                      src={report.testimonial.image}
                      alt={report.testimonial.author}
                      onError={handleImageError}
                      className="w-12 h-12 rounded-2xl object-cover border border-gray-100 flex-shrink-0"
                    />
                    <div className="min-w-0 text-left">
                      <p className="font-black text-[#0B0D0F] text-sm sm:text-base leading-none truncate">{report.testimonial.author}</p>
                      <p className="mt-1 text-[10px] text-gray-500 uppercase tracking-[0.25em] font-black truncate">{report.testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>
          </div>
        </div>

        <div className="mt-20 space-y-10 sm:space-y-12">
          {/* FIELD REPORTS */}
          <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_18px_50px_rgba(0,0,0,0.05)] border border-gray-100" >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0B0D0F] text-white flex items-center justify-center flex-shrink-0">
                  <SafeIcon icon="FiCamera" className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0B0D0F] tracking-tight text-left uppercase">Field Documentation</h2>
                  <p className="text-gray-500 mt-1 text-left text-sm">Verified visual evidence from our active ground teams.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 self-start md:self-auto">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Live Updates</span>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-5 mb-5">
              <div 
                className="lg:w-2/3 relative rounded-2xl overflow-hidden min-h-[300px] md:min-h-[450px] group cursor-pointer shadow-lg"
                data-cursor-label={report.fieldReports[0].type === 'video' ? 'PLAY' : 'VIEW'}
                onClick={() => setSelectedMedia(report.fieldReports[0])}
              >
                <img src={report.fieldReports[0].url} alt="Feature field" className="w-full h-full absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
                    <SafeIcon icon={report.fieldReports[0].type === 'video' ? "FiPlay" : "FiMaximize2"} className="text-white text-3xl ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="lg:w-1/3 grid grid-cols-2 lg:grid-cols-1 gap-5">
                <div 
                  className="rounded-2xl overflow-hidden shadow-md h-full min-h-[140px] cursor-pointer group"
                  data-cursor-label="VIEW"
                  onClick={() => setSelectedMedia(report.fieldReports[1])}
                >
                  <img src={report.fieldReports[1].url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div 
                  className="rounded-2xl overflow-hidden shadow-md h-full min-h-[140px] cursor-pointer group"
                  data-cursor-label="VIEW"
                  onClick={() => setSelectedMedia(report.fieldReports[2])}
                >
                  <img src={report.fieldReports[2].url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>
            </div>
          </motion.section>

          <ProjectCountries countries={uniqueCountries} region={report.region} isOpen={openSections.countries} onToggle={() => toggleSection('countries')} />

          <CollapsibleContainer 
            title="Locations Implemented" 
            subtitle="Geographic footprint of the verified project sites."
            isOpen={openSections.locations} 
            onToggle={() => toggleSection('locations')}
            extraHeader={
              <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
                <button onClick={(e) => { e.stopPropagation(); setLocationViewMode('grid'); }} className={`p-2 rounded-lg transition-all duration-300 ${locationViewMode === 'grid' ? 'bg-white text-[#E52321] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`} >
                  <SafeIcon icon="FiGrid" className="text-lg" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setLocationViewMode('list'); }} className={`p-2 rounded-lg transition-all duration-300 ${locationViewMode === 'list' ? 'bg-white text-[#E52321] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`} >
                  <SafeIcon icon="FiList" className="text-lg" />
                </button>
              </div>
            }
          >
            <div className="p-6 sm:p-10">
              <motion.div layout className={locationViewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col space-y-3"} >
                <AnimatePresence mode="popLayout">
                  {report.countries.map((location, idx) => (
                    <motion.div layout key={`${location}-${idx}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center group transition-all duration-300 ${locationViewMode === 'grid' ? 'p-5' : 'p-4'}`} >
                      <div className="w-10 h-10 bg-white border border-gray-100 flex items-center justify-center mr-4 shadow-sm group-hover:bg-[#E52321] group-hover:text-white transition-colors duration-300 flex-shrink-0">
                        <SafeIcon icon="FiMapPin" className="text-sm text-[#E52321] group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex flex-col text-left overflow-hidden">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 truncate">{getGpsData(location)}</span>
                        <span className="text-sm font-bold text-[#0B0D0F] truncate">{location}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </CollapsibleContainer>

          <footer className="bg-white rounded-[2.5rem] p-10 md:p-14 text-left relative overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.06)] border border-gray-100">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#E52321]/10 rounded-full blur-[90px]" />
            <div className="absolute -bottom-28 -left-28 w-96 h-96 bg-black/5 rounded-full blur-[100px]" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E52321] text-white flex items-center justify-center flex-shrink-0">
                    <SafeIcon icon="FiHeart" className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="mt-1 text-2xl sm:text-3xl font-black text-[#0B0D0F] tracking-tight">Support This Mission</h3>
                    <p className="mt-3 text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl">Your partnership allows our teams to remain on the ground and expand our reach to those who need it most.</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
                <button className="w-full bg-[#E52321] hover:bg-[#C91D1B] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.25em] shadow-lg shadow-red-500/20 active:scale-95 transition-transform">Donate Now</button>
                <button className="w-full bg-white border border-gray-200 text-[#0B0D0F] hover:border-[#E52321]/30 hover:text-[#E52321] px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.25em] transition-colors">Share Report</button>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 sm:p-8 md:p-12 cursor-zoom-out"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-7xl max-h-full w-full flex items-center justify-center cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedMedia(null)}
                className="absolute -top-12 right-0 sm:-top-4 sm:-right-12 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors group"
                title="Close Lightbox"
              >
                <SafeIcon icon="FiX" className="text-2xl group-hover:rotate-90 transition-transform" />
              </button>
              
              {selectedMedia.type === 'video' ? (
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
                  {/* Since these are Unsplash URLs, we treat them as high-res images with a 'Video' placeholder feel */}
                  <img src={selectedMedia.url} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-[#E52321] w-20 h-20 rounded-full flex items-center justify-center shadow-2xl">
                      <SafeIcon icon="FiPlay" className="text-white text-3xl ml-1" />
                    </div>
                  </div>
                </div>
              ) : (
                <img 
                  src={selectedMedia.url} 
                  className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10" 
                  alt="Documentation"
                />
              )}
              
              <div className="absolute -bottom-12 left-0 right-0 text-center">
                <p className="text-white/60 text-xs font-black uppercase tracking-[0.2em]">
                  {selectedMedia.type === 'video' ? 'Field Footage' : 'On-Site Documentation'} • {report.title}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatTile = ({ title, value, icon }) => (
  <div className="p-6 sm:p-8 flex items-center gap-4 text-left">
    <div className="w-12 h-12 rounded-2xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center flex-shrink-0">
      <SafeIcon icon={icon} className="text-[#E52321] text-xl" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 truncate">{title}</p>
      <p className="mt-1 text-2xl sm:text-3xl font-black text-[#0B0D0F] tracking-tight leading-none truncate">{value}</p>
    </div>
  </div>
);

const ProjectCountries = ({ countries, region, isOpen, onToggle }) => {
  const regionCenters = {
    'Africa': [0.0236, 37.9062],
    'Middle East': [32.0, 35.0],
    'South Asia': [20.5937, 78.9629],
    'Southeast Asia': [1.3521, 103.8198],
    'Global': [20.0, 0.0]
  };

  const countryCoords = {
    'Kenya': [1.2921, 36.8219], 'Ethiopia': [9.145, 40.4897], 'Tanzania': [-6.369, 34.8888], 'Uganda': [1.3733, 32.2903],
    'Palestine': [31.9522, 35.2332], 'Lebanon': [33.8547, 35.8623], 'Syria': [34.8021, 38.9968], 'India': [20.5937, 78.9629],
    'Indonesia': [-0.7893, 113.9213], 'Vietnam': [14.0583, 108.2772], 'Thailand': [15.87, 100.9925], 'Cambodia': [12.5657, 104.991],
    'Laos': [19.8563, 102.4955], 'Philippines': [12.8797, 121.774], 'Myanmar': [21.9162, 95.956]
  };

  const center = regionCenters[region] || regionCenters['Global'];

  return (
    <CollapsibleContainer title="Project Countries" subtitle={`Implementation breadth across ${region}.`} isOpen={isOpen} onToggle={onToggle} >
      <div className="px-6 sm:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <div className="lg:col-span-1 space-y-4 text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Verified Territories</p>
            <div className="grid grid-cols-1 gap-2.5">
              {countries.map((country, idx) => (
                <div key={country} className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-[#E52321]/30 transition-all" >
                  <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center mr-3 group-hover:bg-[#E52321] transition-colors"><SafeIcon icon="FiFlag" className="text-[#E52321] group-hover:text-white transition-colors text-xs" /></div>
                  <span className="font-bold text-[#0B0D0F] text-sm">{country}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 relative rounded-[2rem] overflow-hidden group shadow-lg min-h-[400px] border border-gray-100">
            <MapContainer center={center} zoom={region === 'Global' ? 2 : 4} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 1 }} >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
              {countries.map((country) => {
                const pos = countryCoords[country];
                if (!pos) return null;
                return (
                  <Marker key={country} position={pos}>
                    <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                      <div className="font-sans px-3 py-1">
                        <p className="font-black text-[9px] uppercase tracking-widest text-[#E52321] mb-0.5">Project Country</p>
                        <p className="font-bold text-gray-900 text-xs">{country}</p>
                      </div>
                    </Tooltip>
                  </Marker>
                );
              })}
            </MapContainer>
            <div className="absolute bottom-6 left-6 z-[10] flex items-center space-x-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 shadow-sm">
              <SafeIcon icon="FiMap" className="text-[#E52321] text-sm" />
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Interactive Context Map</span>
            </div>
          </div>
        </div>
      </div>
    </CollapsibleContainer>
  );
};

const CollapsibleContainer = ({ title, subtitle, isOpen, onToggle, children, extraHeader }) => (
  <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-[2rem] shadow-[0_18px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden" >
    <button onClick={onToggle} className="w-full flex items-center justify-between px-6 sm:px-10 py-6 sm:py-8 hover:bg-gray-50/60 transition-colors group text-left" >
      <div className="flex items-start gap-4 pr-4">
        <div className="w-10 h-10 rounded-2xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#E52321]" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#0B0D0F] tracking-tight leading-tight">{title}</h2>
          {subtitle && <p className="text-gray-500 mt-1 text-xs sm:text-sm leading-relaxed">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <div className="hidden sm:block">{extraHeader}</div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border flex items-center justify-center transition-all ${isOpen ? 'bg-[#0B0D0F] border-[#0B0D0F] text-white shadow-sm' : 'bg-white border-gray-100 text-gray-400 group-hover:text-[#E52321] group-hover:border-[#E52321]/20'}`} >
          <SafeIcon icon="FiChevronDown" className="text-lg" />
        </motion.div>
      </div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: 'easeInOut' }} >
          <div className="border-t border-gray-100">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.section>
);

const ProjectBrief = ({ report }) => {
  const [openSections, setOpenSections] = useState({ background: true, response: false });
  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  return (
    <section>
      <div className="bg-white rounded-[2rem] shadow-[0_18px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden text-left">
        <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-b from-gray-50/60 to-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="mt-1 text-xl sm:text-2xl font-black text-[#0B0D0F] tracking-tight">Executive Summary</h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-100 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E52321]" />
              {report.id.toUpperCase()}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white border border-gray-100 p-5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Project ID</p>
              <p className="text-sm font-black text-[#0B0D0F]">{report.id.toUpperCase()}</p>
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 p-5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Primary Sector</p>
              <p className="text-sm font-black text-[#0B0D0F]">{report.sector}</p>
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 p-5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Operational Region</p>
              <p className="text-sm font-black text-[#0B0D0F]">{report.region}</p>
            </div>
          </div>
        </div>

        <CollapsibleBriefItem title="Project Background" isOpen={openSections.background} onToggle={() => toggleSection('background')}>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">The {report.title} was launched to address critical resource gaps in {report.sector.toLowerCase()} services within {report.region}. This initiative focuses on long-term sustainability and community self-reliance.</p>
        </CollapsibleBriefItem>
        <CollapsibleBriefItem title="Strategic Response" isOpen={openSections.response} onToggle={() => toggleSection('response')}>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">Human Concern USA mobilized expert field teams and local partners to implement a phased deployment strategy, ensuring maximum impact for every dollar invested.</p>
        </CollapsibleBriefItem>
      </div>
    </section>
  );
};

const CollapsibleBriefItem = ({ title, children, isOpen, onToggle }) => (
  <div className="border-t border-gray-100 overflow-hidden">
    <button onClick={onToggle} className="w-full flex items-center justify-between px-6 sm:px-8 py-5 hover:bg-gray-50/60 transition-colors group" >
      <h3 className="text-base sm:text-lg font-black text-[#0B0D0F] tracking-tight">{title}</h3>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className={`w-9 h-9 rounded-2xl border flex items-center justify-center transition-all ${isOpen ? 'bg-[#0B0D0F] border-[#0B0D0F] text-white' : 'bg-white border-gray-100 text-gray-400 group-hover:text-[#E52321] group-hover:border-[#E52321]/20'}`} >
        <SafeIcon icon="FiChevronDown" className="text-lg" />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: 'easeInOut' }} >
          <div className="px-6 sm:px-8 pb-6">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const MetricCard = ({ title, value, icon, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }} className="bg-white rounded-[1.5rem] p-6 sm:p-7 shadow-sm border border-gray-100 flex items-center group hover:shadow-xl transition-all" >
    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#0B0D0F] rounded-2xl flex items-center justify-center mr-5 sm:mr-6 group-hover:bg-[#E52321] transition-colors flex-shrink-0"><SafeIcon icon={icon} className="text-white text-xl sm:text-2xl" /></div>
    <div className="text-left overflow-hidden"><p className="text-[10px] text-gray-400 font-black tracking-widest uppercase mb-1 truncate">{title}</p><p className="text-2xl sm:text-3xl font-black text-[#0B0D0F] tracking-tighter leading-none">{value}</p></div>
  </motion.div>
);

const DeliverableRow = ({ item }) => (
  <div className="flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gray-50/60 border border-gray-100 hover:border-[#E52321]/20 hover:bg-white transition-all">
    <div className="flex items-center min-w-0">
      <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mr-4 flex-shrink-0">
        <SafeIcon icon={item.icon} className="text-[#E52321] text-xl" />
      </div>
      <div className="min-w-0 text-left">
        <p className="text-sm sm:text-base font-black text-[#0B0D0F] truncate">{item.name}</p>
      </div>
    </div>
    <div className="text-right flex-shrink-0">
      <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Verified Volume</p>
      <p className="mt-1 text-lg sm:text-xl font-black text-[#0B0D0F]">{item.count.toLocaleString()}</p>
    </div>
  </div>
);

const DemographicRow = ({ label, percentage, icon, color }) => (
  <div className="text-left">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
          <SafeIcon icon={icon} className="text-gray-500 text-sm" />
        </div>
        <span className="text-sm font-black text-gray-700 truncate">{label}</span>
      </div>
      <span className="text-sm font-black text-[#0B0D0F] flex-shrink-0">{percentage}%</span>
    </div>
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} whileInView={{ width: `${percentage}%` }} viewport={{ once: true }} transition={{ duration: 1.0 }} className={`h-full rounded-full ${color}`} />
    </div>
  </div>
);

const TimelineItem = ({ milestone, isLast }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-4 py-6 ${isLast ? '' : 'border-b border-gray-100'} text-left`}>
    <div className="flex items-start sm:justify-start">
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E52321]/10 text-[#E52321] border border-[#E52321]/15 text-[10px] font-black uppercase tracking-[0.25em]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E52321]" />
        {milestone.date}
      </span>
    </div>
    <div className="min-w-0">
      <h4 className="text-base sm:text-lg font-black text-[#0B0D0F] tracking-tight">{milestone.title}</h4>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{milestone.description}</p>
    </div>
  </div>
);

export default ReportDetail;
