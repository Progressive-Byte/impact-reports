import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import { reports } from '../data/mockData';
import { cleanCountryName, getGpsData } from '../utils/location';
import { useLocalStorage } from '../hooks/useLocalStorage';
import CollapsibleSection from '../components/CollapsibleSection';
import MediaLightbox from '../components/MediaLightbox';
import StatTile from '../components/report/StatTile';
import DeliverableRow from '../components/report/DeliverableRow';
import DemographicRow from '../components/report/DemographicRow';
import TimelineItem from '../components/report/TimelineItem';
import ProjectBrief from '../components/report/ProjectBrief';
import ProjectCountries from '../components/report/ProjectCountries';

const ReportDetail = () => {
  const { id } = useParams();
  const report = useMemo(() => reports.find((r) => r.id === id), [id]);
  const [locationViewMode, setLocationViewMode] = useLocalStorage('locationViewMode', 'grid');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [openSections, setOpenSections] = useState({
    deliverables: true,
    timeline: true,
    locations: false,
    countries: true,
  });

  const toggleSection = (key) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setSelectedMedia(null); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const uniqueCountries = useMemo(() => {
    if (!report) return [];
    return [...new Set(report.countries.map(cleanCountryName))].sort();
  }, [report]);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=600&q=80';
  };

  if (!id || !report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] text-center px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <SafeIcon icon="FiAlertCircle" className="text-3xl text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
        <Link to="/" className="bg-[#E52321] text-white px-8 py-3 rounded-full font-bold hover:bg-[#C91D1B] transition-colors">
          Return to Database
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-24 font-sans overflow-x-hidden">
      <div className="pt-28 sm:pt-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center text-gray-500 hover:text-[#0B0D0F] transition-colors text-xs font-black tracking-widest uppercase">
            <SafeIcon icon="FiArrowLeft" className="mr-2" /> Back to Database
          </Link>
        </div>

        {/* Hero image */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-[0_30px_80px_rgba(0,0,0,0.12)]"
          >
            <img src={report.image} alt={report.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
            <div className="relative z-10 p-6 sm:p-10 flex flex-col justify-end min-h-[360px] sm:min-h-[420px]">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                {[
                  { icon: 'FiMapPin', label: report.region },
                  { icon: 'FiLayers', label: report.sector },
                  { icon: 'FiCalendar', label: report.year },
                ].map(({ icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md border border-white/30 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#0B0D0F] shadow-[0_14px_35px_rgba(0,0,0,0.35)]">
                    <SafeIcon icon={icon} className="text-sm text-[#E52321]" />
                    {label}
                  </span>
                ))}
                <span className="inline-flex items-center gap-2 rounded-full bg-[#D1FAE5] text-[#065F46] border border-[#065F46]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em]">
                  <SafeIcon icon="FiCheck" className="text-sm" /> Verified Report
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

        {/* Stats bar */}
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
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10 sm:space-y-12">
            <ProjectBrief report={report} />

            <CollapsibleSection title="Project Deliverables" isOpen={openSections.deliverables} onToggle={() => toggleSection('deliverables')}>
              <div className="p-6 sm:p-8 space-y-3">
                {report.itemsDelivered.map((item, idx) => <DeliverableRow key={idx} item={item} />)}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Implementation Timeline" isOpen={openSections.timeline} onToggle={() => toggleSection('timeline')}>
              <div className="px-6 sm:px-10 py-8">
                <div className="relative pl-8 sm:pl-10">
                  <div className="absolute left-3 sm:left-3.5 top-2 bottom-2 w-px bg-[#E52321] z-0" />
                  <div className="space-y-0">
                    {report.milestones.map((milestone, idx) => (
                      <TimelineItem key={idx} milestone={milestone} isLast={idx === report.milestones.length - 1} />
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          </div>

          {/* Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-28 self-start">
            {/* Demographics */}
            <section>
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-6 flex items-center gap-3 border-b border-gray-50">
                  <div className="w-10 h-10 rounded-2xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center">
                    <SafeIcon icon="FiUsers" className="text-[#E52321] text-lg" />
                  </div>
                  <h2 className="text-[11px] font-black text-[#0B0D0F] uppercase tracking-widest">Recipient Demographics</h2>
                </div>
                <div className="p-6 space-y-6">
                  <DemographicRow label="Men" percentage={report.demographics.men} icon="FiUser" color="bg-gray-300" />
                  <DemographicRow label="Women" percentage={report.demographics.women} icon="FiUser" color="bg-[#0B0D0F]" />
                  <DemographicRow label="Children (< 18)" percentage={report.demographics.children} icon="FiSmile" color="bg-[#E52321]" />
                </div>
              </div>
            </section>

            {/* Testimonial */}
            <section>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] overflow-hidden"
              >
                <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center">
                    <SafeIcon icon="FiMessageSquare" className="text-[#E52321] text-lg" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Testimonial</p>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <SafeIcon icon="FiQuote" className="text-[#E52321] text-xl" />
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-[#0B0D0F] leading-relaxed">
                      "{report.testimonial.quote}"
                    </p>
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
          {/* Field documentation */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_18px_50px_rgba(0,0,0,0.05)] border border-gray-100"
          >
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
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
                    <SafeIcon icon={report.fieldReports[0].type === 'video' ? 'FiPlay' : 'FiMaximize2'} className="text-white text-3xl ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="lg:w-1/3 grid grid-cols-2 lg:grid-cols-1 gap-5">
                {[report.fieldReports[1], report.fieldReports[2]].map((fr, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden shadow-md h-full min-h-[140px] cursor-pointer group"
                    data-cursor-label="VIEW"
                    onClick={() => setSelectedMedia(fr)}
                  >
                    <img src={fr.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          <ProjectCountries countries={uniqueCountries} region={report.region} isOpen={openSections.countries} onToggle={() => toggleSection('countries')} />

          <CollapsibleSection
            title="Locations Implemented"
            subtitle="Geographic footprint of the verified project sites."
            isOpen={openSections.locations}
            onToggle={() => toggleSection('locations')}
            headerRight={
              <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
                {['grid', 'list'].map((mode) => (
                  <button
                    key={mode}
                    onClick={(e) => { e.stopPropagation(); setLocationViewMode(mode); }}
                    className={`p-2 rounded-lg transition-all duration-300 ${locationViewMode === mode ? 'bg-white text-[#E52321] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <SafeIcon icon={mode === 'grid' ? 'FiGrid' : 'FiList'} className="text-lg" />
                  </button>
                ))}
              </div>
            }
          >
            <div className="p-6 sm:p-10">
              <motion.div
                layout
                className={locationViewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'flex flex-col space-y-3'}
              >
                <AnimatePresence mode="popLayout">
                  {report.countries.map((location, idx) => (
                    <motion.div
                      layout
                      key={`${location}-${idx}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center group transition-all duration-300 ${locationViewMode === 'grid' ? 'p-5' : 'p-4'}`}
                    >
                      <div className="w-10 h-10 bg-white border border-gray-100 flex items-center justify-center mr-4 shadow-sm group-hover:bg-[#E52321] group-hover:text-white transition-colors duration-300 flex-shrink-0">
                        <SafeIcon icon="FiMapPin" className="text-sm text-[#E52321] group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex flex-col text-left overflow-hidden">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 truncate">
                          {getGpsData(location, report.region)}
                        </span>
                        <span className="text-sm font-bold text-[#0B0D0F] truncate">{location}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </CollapsibleSection>

          {/* CTA footer */}
          <footer className="bg-white rounded-[2.5rem] p-10 md:p-14 text-left relative overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.06)] border border-gray-100">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#E52321]/10 rounded-full blur-[90px]" />
            <div className="absolute -bottom-28 -left-28 w-96 h-96 bg-black/5 rounded-full blur-[100px]" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E52321] text-white flex items-center justify-center flex-shrink-0">
                  <SafeIcon icon="FiHeart" className="text-2xl" />
                </div>
                <div>
                  <h3 className="mt-1 text-2xl sm:text-3xl font-black text-[#0B0D0F] tracking-tight">Support This Mission</h3>
                  <p className="mt-3 text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                    Your partnership allows our teams to remain on the ground and expand our reach to those who need it most.
                  </p>
                </div>
              </div>
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
                <button className="w-full bg-[#E52321] hover:bg-[#C91D1B] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.25em] shadow-lg shadow-red-500/20 active:scale-95 transition-transform">
                  Donate Now
                </button>
                <button className="w-full bg-white border border-gray-200 text-[#0B0D0F] hover:border-[#E52321]/30 hover:text-[#E52321] px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.25em] transition-colors">
                  Share Report
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <MediaLightbox media={selectedMedia} title={report.title} onClose={() => setSelectedMedia(null)} />
    </div>
  );
};

export default ReportDetail;
