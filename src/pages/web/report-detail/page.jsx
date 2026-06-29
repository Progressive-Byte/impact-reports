import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SafeIcon from '../../../common/SafeIcon';
import CollapsibleSection from '../../../common/CollapsibleSection';
import { fetchReport } from '../../../services/publicApi';
import { cleanCountryName } from '../../../utils/location';
import MediaLightbox from './components/MediaLightbox';
import StatTile from './components/StatTile';
import DeliverableRow from './components/DeliverableRow';
import TimelineItem from './components/TimelineItem';
import ProjectBrief from './components/ProjectBrief';
import ProjectCountries from './components/ProjectCountries';
import ReportHero from './components/ReportHero';
import ProjectMetaCard from './components/ProjectMetaCard';
import DemographicsCard from './components/DemographicsCard';
import TestimonialSlider from './components/TestimonialSlider';
import FieldDocumentation from './components/FieldDocumentation';
import LocationsSection from './components/LocationsSection';
import ReportCTAFooter from './components/ReportCTAFooter';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1200&q=80';

const ReportDetail = () => {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const [report, setReport]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [openSections, setOpenSections]   = useState({
    deliverables: true,
    timeline:     true,
    locations:    false,
    countries:    true,
  });

  const toggleSection = (key) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setReport(null);

    let cancelled = false;
    (async () => {
      try {
        const data = await fetchReport(slug);
        if (!cancelled) setReport(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load report');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [slug]);

  // Replace ObjectId in the URL with the human-readable slug once the report loads
  useEffect(() => {
    if (report?.slug && report.slug !== slug) {
      navigate(`/report/${report.slug}`, { replace: true });
    }
  }, [report, slug, navigate]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setSelectedIndex(null); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const uniqueCountries = useMemo(() => {
    if (!report) return [];
    return [...new Set((report.countries || []).map(cleanCountryName))].sort();
  }, [report]);

  const fieldReports = useMemo(() => {
    if (!report) return [];
    const items = [];
    if (report.videoUrl) items.push({ type: 'video', url: report.videoUrl });
    (report.images || []).forEach((img) => items.push({ type: 'image', url: img.url }));
    return items;
  }, [report]);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = FALLBACK_IMAGE;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#E52321] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !report) {
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

  const activeLocations = report.locations?.length || report.countries?.length || 0;
  const hasDemographics = (report.demographics?.men || 0) + (report.demographics?.women || 0) + (report.demographics?.children || 0) > 0;

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-24 font-sans [overflow-x:clip]">
      <div className="pt-28 sm:pt-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center text-gray-500 hover:text-[#0B0D0F] transition-colors text-xs font-black tracking-widest uppercase">
            <SafeIcon icon="FiArrowLeft" className="mr-2" /> Back to Home
          </Link>
        </div>

        <ReportHero report={report} onImageError={handleImageError} />

        {/* Stats bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <StatTile title="LIVES IMPACTED"    value={(report.livesImpacted || 0).toLocaleString()} icon="FiUsers"  />
            <StatTile title="COUNTRIES REACHED" value={(report.countries?.length || 0).toLocaleString()}             icon="FiGlobe"  />
            <StatTile title="ACTIVE LOCATIONS"  value={activeLocations}                                              icon="FiMapPin" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10 sm:space-y-12">
            <ProjectBrief report={report} />

            {report.deliverables?.length > 0 && (
              <CollapsibleSection title="Project Deliverables" isOpen={openSections.deliverables} onToggle={() => toggleSection('deliverables')}>
                <div className="p-6 sm:p-8 space-y-3">
                  {report.deliverables.map((item, idx) => <DeliverableRow key={idx} item={item} />)}
                </div>
              </CollapsibleSection>
            )}

            {report.milestones?.length > 0 && (
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
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* <ProjectMetaCard report={report} /> */}
            {hasDemographics && <DemographicsCard demographics={report.demographics} />}
            <TestimonialSlider testimonials={report.testimonials} />
          </div>
        </div>

        <div className="mt-20 space-y-10 sm:space-y-12">
          <FieldDocumentation
            fieldReports={fieldReports}
            onImageError={handleImageError}
            onMediaSelect={(item) => setSelectedIndex(fieldReports.findIndex(f => f === item))}
          />

          <ProjectCountries
            countries={uniqueCountries}
            region={report.region}
            isOpen={openSections.countries}
            onToggle={() => toggleSection('countries')}
          />

          <LocationsSection
            report={report}
            isOpen={openSections.locations}
            onToggle={() => toggleSection('locations')}
          />

          <ReportCTAFooter donationUrl={report.donationUrl} slug={report.slug || slug} projectName={report.projectName} />
        </div>
      </div>

      <MediaLightbox
        mediaList={fieldReports}
        currentIndex={selectedIndex}
        title={report.title}
        onClose={() => setSelectedIndex(null)}
        onNavigate={setSelectedIndex}
      />
    </div>
  );
};

export default ReportDetail;
