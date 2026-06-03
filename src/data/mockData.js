export const taxonomies = {
  regions: ["Africa", "Middle East", "South Asia", "Southeast Asia", "Global"],
  sectors: [
    "WASH",
    "Education",
    "Healthcare",
    "Emergency Relief",
    "Livelihoods",
  ],
  years: ["2024", "2023", "2022", "2021"],
};

export const reports = [
  {
    id: "rep-001",
    title: "Clean Water Initiative: Rift Valley",
    region: "Africa",
    sector: "WASH",
    year: "2023",
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1600",
    summary:
      "Establishing sustainable water infrastructure for remote communities, reducing waterborne diseases by 60%.",
    metrics: {
      beneficiaries: 45000,
      budget: 850000,
      locations: 12,
    },
    countries: [
      "Kenya (Baringo)",
      "Kenya (Nakuru)",
      "Kenya (Narok)",
      "Kenya (Kajiado)",
      "Kenya (Kericho)",
      "Kenya (Bomet)",
      "Ethiopia (Oromia)",
      "Ethiopia (Sidama)",
      "Tanzania (Arusha)",
      "Tanzania (Manyara)",
      "Uganda (Karamoja)",
      "Uganda (Teso)",
    ],
    demographics: {
      children: 45,
      women: 35,
      men: 20,
    },
    itemsDelivered: [
      { name: "Solar Water Wells", count: 12, icon: "FiSun" },
      { name: "Filtration Systems", count: 450, icon: "FiFilter" },
      { name: "Hygiene Kits", count: 15000, icon: "FiPackage" },
    ],
    milestones: [
      {
        date: "Q1 2023",
        title: "Community Assessment & Planning",
        description: "Engaged local leaders to identify optimal well sites.",
      },
      {
        date: "Q2 2023",
        title: "Infrastructure Drilling",
        description: "Completed drilling for all 12 primary solar wells.",
      },
      {
        date: "Q4 2023",
        title: "Handover & Training",
        description: "Trained local committees on maintenance and hygiene.",
      },
    ],
    testimonial: {
      quote:
        "Before the well, my daughters walked 4 hours daily for water. Now they are in school, and our community is healthy.",
      author: "Amina J.",
      role: "Community Leader, Kenya",
      image:
        "https://images.unsplash.com/photo-1531123897727-8f129e1bfa8ea?auto=format&fit=crop&w=400&q=80",
    },
    fieldReports: [
      {
        type: "video",
        url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
        title: "Raw Distribution Footage",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1520962922320-2038eebab146?auto=format&fit=crop&w=1200&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1504712598893-24159a89200e?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1516905041604-a527f4d22181?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    id: "rep-002",
    title: "Emergency Medical Support",
    region: "Middle East",
    sector: "Healthcare",
    year: "2024",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=1600",
    summary:
      "Deploying mobile clinics and critical medical supplies to conflict-affected zones.",
    metrics: {
      beneficiaries: 120000,
      budget: 2100000,
      locations: 5,
    },
    countries: [
      "Gaza (North)",
      "Gaza (Khan Yunis)",
      "West Bank",
      "Lebanon (Bekaa)",
      "Syria (Idlib)",
    ],
    demographics: {
      children: 30,
      women: 40,
      men: 30,
    },
    itemsDelivered: [
      { name: "Mobile Clinics Deployed", count: 5, icon: "FiTruck" },
      { name: "Trauma Kits", count: 2000, icon: "FiBriefcase" },
      { name: "Surgeries Performed", count: 850, icon: "FiActivity" },
    ],
    milestones: [
      {
        date: "Jan 2024",
        title: "Rapid Deployment",
        description: "First mobile clinic operational within 48 hours.",
      },
      {
        date: "Mar 2024",
        title: "Supply Chain Established",
        description: "Secured continuous flow of essential medicines.",
      },
      {
        date: "Ongoing",
        title: "Specialized Care",
        description: "Providing pediatric and trauma surgery.",
      },
    ],
    testimonial: {
      quote:
        "The mobile clinic arrived when we had no other options. They saved my son's life.",
      author: "Tariq M.",
      role: "Father, Gaza",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    },
    fieldReports: [
      {
        type: "video",
        url: "https://images.unsplash.com/photo-1516841273335-e39b37888115?auto=format&fit=crop&w=1200&q=80",
        title: "Clinic Operations Footage",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1551076805-e16760c26446?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    id: "rep-003",
    title: "Girls Education Access Program",
    region: "South Asia",
    sector: "Education",
    year: "2023",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1600",
    summary:
      "Building schools and providing scholarships to ensure girls complete secondary education.",
    metrics: {
      beneficiaries: 8500,
      budget: 600000,
      locations: 24,
    },
    countries: [
      "Uttar Pradesh",
      "Bihar",
      "Rajasthan",
      "Madhya Pradesh",
      "West Bengal",
      "Jharkhand",
      "Odisha",
      "Chhattisgarh",
      "Punjab",
      "Haryana",
      "Maharashtra",
      "Gujarat",
      "Karnataka",
      "Tamil Nadu",
      "Andhra Pradesh",
      "Telangana",
      "Kerala",
      "Assam",
      "Manipur",
      "Meghalaya",
      "Tripura",
      "Nagaland",
      "Sikkim",
      "Arunachal Pradesh",
    ],
    demographics: {
      children: 90,
      women: 10,
      men: 0,
    },
    itemsDelivered: [
      { name: "Schools Constructed", count: 4, icon: "FiHome" },
      { name: "Scholarships Awarded", count: 2500, icon: "FiAward" },
      { name: "Teachers Trained", count: 120, icon: "FiUsers" },
    ],
    milestones: [
      {
        date: "Feb 2023",
        title: "Scholarship Distribution",
        description: "Awarded grants to 2,500 at-risk girls.",
      },
      {
        date: "Aug 2023",
        title: "School Openings",
        description: "Inaugurated 4 new secondary schools.",
      },
      {
        date: "Dec 2023",
        title: "Year-End Assessment",
        description: "Recorded a 95% retention rate among scholars.",
      },
    ],
    testimonial: {
      quote:
        "I am the first in my family to attend high school. I want to become a doctor and help my village.",
      author: "Priya S.",
      role: "Student, Rural India",
      image:
        "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&w=400&q=80",
    },
    fieldReports: [
      {
        type: "video",
        url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
        title: "School Inauguration",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1511629091441-ee46146481b6?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    id: "rep-004",
    title: "Sustainable Agriculture Initiative",
    region: "Southeast Asia",
    sector: "Livelihoods",
    year: "2022",
    image:
      "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&q=80&w=1600",
    summary:
      "Empowering smallholder farmers with climate-resilient seeds and modern irrigation techniques.",
    metrics: {
      beneficiaries: 15000,
      budget: 450000,
      locations: 8,
    },
    countries: [
      "Indonesia (Java)",
      "Indonesia (Sumatra)",
      "Vietnam (Mekong)",
      "Thailand (Isan)",
      "Cambodia (Siem Reap)",
      "Laos (Vientiane)",
      "Philippines (Luzon)",
      "Myanmar (Shan)",
    ],
    demographics: {
      children: 10,
      women: 45,
      men: 45,
    },
    itemsDelivered: [
      { name: "Seed Packets", count: 30000, icon: "FiPackage" },
      { name: "Irrigation Systems", count: 150, icon: "FiDroplet" },
      { name: "Farming Tools", count: 5000, icon: "FiTool" },
    ],
    milestones: [
      {
        date: "Mar 2022",
        title: "Seed Distribution",
        description:
          "Delivered climate-resilient seeds before planting season.",
      },
      {
        date: "Jun 2022",
        title: "Irrigation Setup",
        description: "Installed drip irrigation in key communal farms.",
      },
      {
        date: "Nov 2022",
        title: "Harvest Festival",
        description: "Celebrated a 40% increase in crop yield.",
      },
    ],
    testimonial: {
      quote:
        "The new seeds and irrigation have doubled our harvest. We can finally sell the surplus at the market.",
      author: "Budi W.",
      role: "Farmer, Indonesia",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    },
    fieldReports: [
      {
        type: "video",
        url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
        title: "Harvest Documentation",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1505471768190-275e2ad7b3f9?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    id: "rep-005",
    title: "Emergency Food Security Program: Horn of Africa",
    region: "Africa",
    sector: "Food Security",
    year: "2024",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1600",
    summary:
      "Providing emergency food assistance, nutrition support, and agricultural recovery programs to drought-affected communities across the Horn of Africa.",
    metrics: {
      beneficiaries: 68000,
      budget: 1250000,
      locations: 14,
    },
    countries: [
      "Kenya (Turkana)",
      "Kenya (Marsabit)",
      "Kenya (Samburu)",
      "Ethiopia (Somali Region)",
      "Ethiopia (Oromia)",
      "Ethiopia (Afar)",
      "Somalia (Banadir)",
      "Somalia (Bay)",
      "Somalia (Lower Shabelle)",
      "Uganda (Karamoja)",
      "South Sudan (Jonglei)",
      "South Sudan (Upper Nile)",
      "Djibouti (Ali Sabieh)",
      "Djibouti (Dikhil)",
    ],
    demographics: {
      children: 52,
      women: 31,
      men: 17,
    },
    itemsDelivered: [
      { name: "Food Packages", count: 18000, icon: "FiPackage" },
      { name: "Nutrition Kits", count: 12000, icon: "FiHeart" },
      { name: "Drought-Resistant Seed Packs", count: 8500, icon: "FiLeaf" },
    ],
    milestones: [
      {
        date: "Q1 2024",
        title: "Rapid Needs Assessment",
        description:
          "Field teams assessed food insecurity levels and identified the most vulnerable communities.",
      },
      {
        date: "Q2 2024",
        title: "Emergency Food Distribution",
        description:
          "Delivered essential food supplies to households impacted by prolonged drought conditions.",
      },
      {
        date: "Q4 2024",
        title: "Agricultural Recovery Support",
        description:
          "Distributed seed packs and provided training to help families restore local food production.",
      },
    ],
    testimonial: {
      quote:
        "The food assistance helped our family survive the drought. The seeds we received are helping us rebuild our future.",
      author: "Fatuma H.",
      role: "Farmer & Mother, Somalia",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    },
    fieldReports: [
      {
        type: "video",
        url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
        title: "Emergency Food Distribution Operations",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    id: "rep-006",
    title: "Rural Healthcare Outreach Program",
    region: "Asia",
    sector: "Healthcare",
    year: "2024",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=1600",
    summary:
      "Expanding access to primary healthcare services through mobile clinics and community health education in underserved rural areas.",
    metrics: {
      beneficiaries: 32000,
      budget: 720000,
      locations: 18,
    },
    countries: [
      "Bangladesh (Kurigram)",
      "Bangladesh (Sunamganj)",
      "Bangladesh (Gaibandha)",
      "Nepal (Karnali)",
      "Nepal (Lumbini)",
      "India (Assam)",
      "India (West Bengal)",
      "India (Bihar)",
      "Pakistan (Sindh)",
      "Pakistan (Punjab)",
      "Sri Lanka (Eastern Province)",
      "Sri Lanka (Northern Province)",
      "Bhutan (Trashigang)",
      "Bhutan (Mongar)",
      "Myanmar (Shan)",
      "Myanmar (Kayin)",
      "Cambodia (Battambang)",
      "Cambodia (Siem Reap)",
    ],
    demographics: {
      children: 40,
      women: 42,
      men: 18,
    },
    itemsDelivered: [
      { name: "Medical Kits", count: 8500, icon: "FiPackage" },
      { name: "Mobile Clinic Visits", count: 220, icon: "FiTruck" },
      { name: "Vaccination Doses", count: 28000, icon: "FiShield" },
    ],
    milestones: [
      {
        date: "Q1 2024",
        title: "Community Health Survey",
        description:
          "Conducted health assessments and identified priority needs.",
      },
      {
        date: "Q2 2024",
        title: "Mobile Clinic Deployment",
        description:
          "Launched mobile healthcare units across targeted districts.",
      },
      {
        date: "Q4 2024",
        title: "Health Worker Training",
        description:
          "Trained local volunteers on preventive healthcare practices.",
      },
    ],
    testimonial: {
      quote:
        "The clinic reached our village for the first time. Many children received treatment they urgently needed.",
      author: "Rashida B.",
      role: "Mother of Three, Bangladesh",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    },
    fieldReports: [
      {
        type: "video",
        url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
        title: "Mobile Healthcare Mission",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    id: "rep-007",
    title: "Education for Every Child Initiative",
    region: "Africa",
    sector: "Education",
    year: "2024",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1600",
    summary:
      "Improving access to quality education through school rehabilitation, learning materials, and teacher training programs.",
    metrics: {
      beneficiaries: 54000,
      budget: 980000,
      locations: 21,
    },
    countries: [
      "Kenya (Kisumu)",
      "Kenya (Migori)",
      "Uganda (Gulu)",
      "Uganda (Lira)",
      "Tanzania (Mwanza)",
      "Tanzania (Shinyanga)",
      "Rwanda (Kigali Rural)",
      "Rwanda (Nyagatare)",
      "Malawi (Mzimba)",
      "Malawi (Lilongwe)",
      "Zambia (Eastern Province)",
      "Zambia (Copperbelt)",
      "Ghana (Northern Region)",
      "Ghana (Upper East)",
      "Sierra Leone (Bo)",
      "Sierra Leone (Kenema)",
      "Liberia (Bong)",
      "Liberia (Nimba)",
      "Ethiopia (Amhara)",
      "Ethiopia (Tigray)",
      "Mozambique (Nampula)",
    ],
    demographics: {
      children: 82,
      women: 12,
      men: 6,
    },
    itemsDelivered: [
      { name: "School Kits", count: 25000, icon: "FiBook" },
      { name: "Classroom Renovations", count: 95, icon: "FiHome" },
      { name: "Teacher Training Sessions", count: 180, icon: "FiUsers" },
    ],
    milestones: [
      {
        date: "Q1 2024",
        title: "School Infrastructure Assessment",
        description: "Identified facilities requiring urgent rehabilitation.",
      },
      {
        date: "Q2 2024",
        title: "Learning Material Distribution",
        description:
          "Distributed books and school supplies to thousands of students.",
      },
      {
        date: "Q4 2024",
        title: "Teacher Capacity Building",
        description: "Delivered training workshops for educators.",
      },
    ],
    testimonial: {
      quote:
        "Our children now have books, desks, and a safe classroom to learn in.",
      author: "Grace N.",
      role: "School Principal, Uganda",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    },
    fieldReports: [
      {
        type: "video",
        url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
        title: "School Support Program",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    id: "rep-008",
    title: "Flood Emergency Relief & Shelter Project",
    region: "South Asia",
    sector: "Disaster Relief",
    year: "2024",
    image:
      "https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg",
    summary:
      "Providing emergency shelter, food supplies, and recovery assistance to families displaced by severe flooding.",
    metrics: {
      beneficiaries: 78000,
      budget: 1650000,
      locations: 24,
    },
    countries: [
      "Bangladesh (Sylhet)",
      "Bangladesh (Sunamganj)",
      "Bangladesh (Kurigram)",
      "India (Assam)",
      "India (Bihar)",
      "India (West Bengal)",
      "Nepal (Koshi)",
      "Nepal (Madhesh)",
      "Pakistan (Sindh)",
      "Pakistan (Balochistan)",
      "Sri Lanka (Batticaloa)",
      "Sri Lanka (Ampara)",
      "Myanmar (Rakhine)",
      "Myanmar (Ayeyarwady)",
      "Bhutan (Sarpang)",
      "Bhutan (Tsirang)",
      "Maldives (Addu)",
      "Maldives (Fuvahmulah)",
      "Afghanistan (Baghlan)",
      "Afghanistan (Kunduz)",
      "Indonesia (Aceh)",
      "Indonesia (West Java)",
      "Philippines (Leyte)",
      "Philippines (Samar)",
    ],
    demographics: {
      children: 48,
      women: 33,
      men: 19,
    },
    itemsDelivered: [
      { name: "Emergency Shelter Kits", count: 12000, icon: "FiHome" },
      { name: "Food Parcels", count: 35000, icon: "FiPackage" },
      { name: "Hygiene Kits", count: 22000, icon: "FiDroplet" },
    ],
    milestones: [
      {
        date: "Q1 2024",
        title: "Rapid Emergency Response",
        description: "Deployed relief teams within 72 hours of flooding.",
      },
      {
        date: "Q2 2024",
        title: "Shelter Distribution",
        description:
          "Provided temporary shelter materials to displaced families.",
      },
      {
        date: "Q4 2024",
        title: "Recovery & Resilience Support",
        description:
          "Assisted communities with rebuilding and preparedness training.",
      },
    ],
    testimonial: {
      quote:
        "After losing our home to the floods, the shelter kit gave us safety and hope.",
      author: "Mohammad A.",
      role: "Flood Survivor, Bangladesh",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    },
    fieldReports: [
      {
        type: "video",
        url: "https://images.unsplash.com/photo-1504712598893-24159a89200e?auto=format&fit=crop&w=1200&q=80",
        title: "Flood Relief Operations",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
];
