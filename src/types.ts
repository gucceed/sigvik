export interface Signal {
  id?: string;
  brf_name?: string;
  orgnr?: string;
  type: string;
  description: string;
  weight: 'Primary' | 'Secondary';
  date: string;
  source_url?: string;
  fetched_at?: string;
  confidence?: number;
}

export interface BRF {
  orgnr: string;
  name: string;
  street?: string;
  city?: string;
  postal_code?: string;
  building_year?: number;
  num_apartments?: number;
  intent_score?: number;
  intent_score_confidence?: number;
  municipality_name?: string;
  avgift_change_pct?: number;
  lan_change_pct?: number;
  mentions_tak?: boolean;
  mentions_fasad?: boolean;
  mentions_stammar?: boolean;
  stammar_year_mentioned?: number;
  energiklass?: string;
  eu_deadline_pressure?: boolean;
  // Legacy fields for mock data compatibility
  id?: string;
  address?: string;
  district?: string;
  municipality?: string;
  builtYear?: number;
  apartments?: number;
  intentScore?: number;
  financialScore?: number;
  maintenanceLiability?: number;
  energyClass?: string;
  debtPerUnit?: number;
  feePerKvm?: number;
  feeTrajectory?: string;
  maintenancePlanStatus?: string;
  predictedProject?: string;
  timeHorizon?: string;
  coordinates?: { lat: number; lng: number };
  signals?: any[];
  history?: any[];
}

export interface Arsredovisning {
  fiscal_year: number;
  nettoomsattning: number;
  resultat_efter_finansiella_poster: number;
  langfristiga_skulder: number;
  avgift_change_pct: number;
  total_lan: number;
  lan_change_pct: number;
  arsresultat: number;
  underhallsfond: number;
  mentions_stammar: boolean;
  stammar_year_mentioned?: number;
  maintenance_plan_raw: string;
}

export interface Energideklaration {
  energiklass: string;
  eu_deadline_pressure: boolean;
  utford: string;
  giltig_till: string;
  primarenergital: string;
}

export interface BRFDetail {
  brf: BRF;
  arsredovisningar: Arsredovisning[];
  energideklaration: Energideklaration;
}

export interface Municipality {
  kommunkod: string;
  name: string;
  county: string;
}

export interface Stats {
  brfs_total: number;
  brfs_scored: number;
  avg_score: number;
  high_signal_count: number;
  ingested_today: number;
}

export interface HistoryItem {
  year: number;
  goal: string;
  outcome: string;
  status: 'Uppfyllt' | 'Delvis' | 'Ej uppfyllt' | 'Okänt';
  source: string;
  confidence: 'Hög' | 'Medel' | 'Låg';
}

export type Language = 'sv' | 'en';

export const TRANSLATIONS = {
  sv: {
    app_name: 'SIGVIK',
    tagline: 'Upphandlingsintelligens för Sveriges bostadsmarknad',
    brf_tool: 'BRF-Verktyg',
    signal_engine: 'Signalmotor (B2B)',
    find_report: 'Hitta din förenings rapportkort',
    search_placeholder: 'Sök BRF (t.ex. Slottet 1)...',
    search_results: 'Sökresultat',
    financial_health: 'Finansiell Hälsa',
    maintenance_liability: 'Underhållsskuld',
    building_info: 'Byggnadsinformation',
    built_year: 'Byggår',
    apartments: 'Antal lägenheter',
    municipality: 'Kommun',
    comparison: 'Jämförelse (Kommun)',
    recommended_actions: 'Rekommenderade åtgärder',
    weekly_intelligence: 'Veckans Intelligens',
    project_forecast: 'Projektprognos',
    intent_score: 'Intent Score',
    time_horizon: 'Tidshorisont',
    market_insight: 'Marknadsinsikt',
    live_signals: 'Live-signaler',
    version: 'Version',
    location: 'Malmö, Sverige',
    select_brf: 'Välj en förening för att se detaljerad analys',
    new_signals: 'Nya signaler denna vecka',
    region: 'Region: Malmö',
    list: 'Lista',
    map: 'Karta',
    legend: 'Teckenförklaring',
    high_intent: 'Hög Intent',
    med_intent: 'Medium Intent',
    loading: 'Laddar data...',
    privacy: 'Integritetspolicy',
    terms: 'Användarvillkor',
    gdpr: 'GDPR (LIA)',
    project_info: 'Projektinformation',
    project_description_title: 'Om SIGVIK',
    project_description_text: 'SIGVIK är en avancerad analysplattform designad för att överbrygga gapet mellan bostadsrättsföreningar (BRF) och entreprenörer. Genom att analysera publika data, årsredovisningar och fastighetssignaler identifierar vi underhållsbehov innan de blir akuta problem.',
    ui_ux_title: 'UI/UX Designfilosofi',
    ui_ux_text: 'Gränssnittet följer en "Technical Dashboard"-estetik med fokus på precision och läsbarhet. Vi använder en kombination av monospaced typsnitt för data och eleganta seriffer för redaktionellt innehåll, vilket skapar en känsla av både auktoritet och tillgänglighet.',
    generate_analysis: 'Generera Bedömning',
    analysis_title: 'Projektbedömning',
    confidence_level: 'Konfidensgrad',
    signal_pattern: 'Signalmönster',
    action_recommendation: 'Handlingsrekommendation',
    uncertainty_factors: 'Osäkerhetsfaktorer',
    signals_available: 'av 6 signaler tillgängliga',
    mandatory_disclaimer: 'Informationen på denna sida är hämtad från offentliga källor — Bolagsverkets årsredovisningar, Boverkets energideklarationer och Lantmäteriets fastighetsregister. Den tillhandahålls i informationssyfte och utgör inte finansiell, juridisk eller värderingsrådgivning. Data kan vara upp till 18 månader gammal. Begär alltid den senaste årsredovisningen direkt från föreningen eller din mäklare innan köpbeslut. SIGVIK AB ansvarar inte för beslut fattade på basis av informationen på denna sida.',
    add_missing_brf: 'Lägg till saknad BRF',
    flag_error: 'Flagga felaktig data',
    org_number: 'Organisationsnummer',
    submit: 'Skicka in',
    submission_success: 'Tack! Vi verifierar organisationsnumret mot Bolagsverket. Du får besked inom 10 arbetsdagar.',
    flag_success: 'Tack! Flaggan granskas inom 10 arbetsdagar. Fältet markeras "Data under granskning" tills felet är åtgärdat.',
    role_board: 'Styrelsemedlem',
    role_resident: 'Boende',
    role_manager: 'Förvaltare',
    role_contractor: 'Entreprenör',
    role_buyer: 'Prospektiv köpare',
    role_other: 'Annat',
    your_role: 'Din roll',
    brf_name_official: 'Föreningens namn (officiellt)',
    debt_per_unit: 'Skuld per lägenhet',
    fee_per_kvm: 'Avgift per kvm/mån',
    maintenance_plan: 'Underhållsplan',
    energy_class: 'Energiklass',
    trajectory: 'Avgiftsutveckling',
    district: 'Stadsdel',
    sample_size: 'jämfört med {count} liknande föreningar i Skåne',
    insufficient_data: 'Otillräckligt jämförelseunderlag för denna kategori',
    market_overview: 'Marknadsöversikt',
    total_brfs: 'Totalt antal BRF:er',
    avg_financial_score: 'Genomsnittlig finansiell hälsa',
    active_signals: 'Aktiva signaler',
    malmo_stats: 'Malmö Statistik',
    top_districts: 'Toppstadsdelar',
    // Phase 2 Filters
    filter_municipality: 'Kommun / Stadsdel',
    filter_apartments: 'Antal lägenheter',
    filter_built_year: 'Byggnadsår',
    filter_project_type: 'Projekttyp',
    filter_fee_trajectory: 'Avgiftsutveckling',
    filter_debt: 'Skuld per lägenhet',
    filter_energy_class: 'Energiklass',
    filter_maintenance_status: 'Underhållsplansstatus',
    // Sorting
    sort_alphabetical: 'Alfabetiskt (A–Ö)',
    sort_newest: 'Nyast data först',
    sort_debt_low: 'Lägst skuld per lägenhet',
    sort_debt_high: 'Högst skuld per lägenhet',
    sort_year_oldest: 'Byggnadsår (äldst först)',
    sort_year_newest: 'Byggnadsår (nyast först)',
    // History
    history_title: 'Föreningens historik',
    history_year: 'År',
    history_goal: 'Uttalat mål',
    history_outcome: 'Dokumenterat utfall',
    history_status: 'Status',
    history_source: 'Källa',
    history_confidence: 'Konfidens',
    history_pattern: 'Mönster att notera',
    history_questions: 'Öppna frågor för köparen',
    history_data_quality: 'Datakvalitet',
    history_disclaimer: 'Informationen baseras på offentliga Bolagsverket-handlingar. Kontrollera alltid uppgifter med mäklaren och begär senaste årsredovisningen direkt från föreningen.',
    phase2_notice: 'Den funktionen lanseras i fas 2 när vi har täckning i Stockholm och Göteborg. I prototypen visas Malmö.',
    insufficient_comparable_data: 'Otillräckligt jämförelseunderlag för denna kategori',
    data_under_review: 'Data under granskning',
    verified_registry: 'Verifierad — publika register',
    verified_community: 'Verifierad — community',
    limited_data: 'Begränsad data'
  },
  en: {
    app_name: 'SIGVIK',
    tagline: 'Procurement intelligence for Sweden\'s housing market',
    brf_tool: 'BRF Tooling',
    signal_engine: 'Signal Engine (B2B)',
    find_report: 'Find your association\'s report card',
    search_placeholder: 'Search BRF (e.g. Slottet 1)...',
    search_results: 'Search Results',
    financial_health: 'Financial Health',
    maintenance_liability: 'Maintenance Liability',
    building_info: 'Building Information',
    built_year: 'Built Year',
    apartments: 'Number of apartments',
    municipality: 'Municipality',
    comparison: 'Comparison (Municipality)',
    recommended_actions: 'Recommended Actions',
    weekly_intelligence: 'Weekly Intelligence',
    project_forecast: 'Project Forecast',
    intent_score: 'Intent Score',
    time_horizon: 'Time Horizon',
    market_insight: 'Market Insight',
    live_signals: 'Live Signals',
    version: 'Version',
    location: 'Malmö, Sweden',
    select_brf: 'Select an association to see detailed analysis',
    new_signals: 'New signals this week',
    region: 'Region: Malmö',
    list: 'List',
    map: 'Map',
    legend: 'Legend',
    high_intent: 'High Intent',
    med_intent: 'Medium Intent',
    loading: 'Loading data...',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    gdpr: 'GDPR (LIA)',
    project_info: 'Project Info',
    project_description_title: 'About SIGVIK',
    project_description_text: 'SIGVIK is an advanced analytics platform designed to bridge the gap between housing cooperatives (BRF) and contractors. By analyzing public data, annual reports, and property signals, we identify maintenance needs before they become acute problems.',
    ui_ux_title: 'UI/UX Design Philosophy',
    ui_ux_text: 'The interface follows a "Technical Dashboard" aesthetic with a focus on precision and readability. We use a combination of monospaced fonts for data and elegant serifs for editorial content, creating a sense of both authority and accessibility.',
    generate_analysis: 'Generate Assessment',
    analysis_title: 'Project Assessment',
    confidence_level: 'Confidence Level',
    signal_pattern: 'Signal Pattern',
    action_recommendation: 'Action Recommendation',
    uncertainty_factors: 'Uncertainty Factors',
    signals_available: 'of 6 signals available',
    mandatory_disclaimer: 'The information on this page is gathered from public sources — Bolagsverket annual reports, Boverket energy declarations, and Lantmäteriet property registers. It is provided for informational purposes only and does not constitute financial, legal, or valuation advice. Data may be up to 18 months old. Always request the latest annual report directly from the association or your broker before making a purchase decision. SIGVIK AB is not responsible for decisions made based on the information on this page.',
    add_missing_brf: 'Add missing BRF',
    flag_error: 'Flag data error',
    org_number: 'Organization Number',
    submit: 'Submit',
    submission_success: 'Thank you! We are verifying the organization number against Bolagsverket. You will receive an update within 10 working days.',
    flag_success: 'Thank you! The flag will be reviewed within 10 working days. The field will be marked "Data under review" until the error is corrected.',
    role_board: 'Board Member',
    role_resident: 'Resident',
    role_manager: 'Property Manager',
    role_contractor: 'Contractor',
    role_buyer: 'Prospective Buyer',
    role_other: 'Other',
    your_role: 'Your role',
    brf_name_official: 'Association name (official)',
    debt_per_unit: 'Debt per unit',
    fee_per_kvm: 'Fee per sqm/month',
    maintenance_plan: 'Maintenance Plan',
    energy_class: 'Energy Class',
    trajectory: 'Fee Trajectory',
    district: 'District',
    sample_size: 'compared to {count} similar associations in Skåne',
    insufficient_data: 'Insufficient comparable data for this category',
    market_overview: 'Market Overview',
    total_brfs: 'Total Associations',
    avg_financial_score: 'Average Financial Health',
    active_signals: 'Active Signals',
    malmo_stats: 'Malmö Statistics',
    top_districts: 'Top Districts',
    // Phase 2 Filters
    filter_municipality: 'Municipality / District',
    filter_apartments: 'Number of apartments',
    filter_built_year: 'Built Year',
    filter_project_type: 'Project Type',
    filter_fee_trajectory: 'Fee Trajectory',
    filter_debt: 'Debt per apartment',
    filter_energy_class: 'Energy Class',
    filter_maintenance_status: 'Maintenance Plan Status',
    // Sorting
    sort_alphabetical: 'Alphabetical (A–Z)',
    sort_newest: 'Newest data first',
    sort_debt_low: 'Lowest debt per apartment',
    sort_debt_high: 'Highest debt per apartment',
    sort_year_oldest: 'Built year (oldest first)',
    sort_year_newest: 'Built year (newest first)',
    // History
    history_title: 'Association History',
    history_year: 'Year',
    history_goal: 'Stated Goal',
    history_outcome: 'Documented Outcome',
    history_status: 'Status',
    history_source: 'Source',
    history_confidence: 'Confidence',
    history_pattern: 'Patterns to note',
    history_questions: 'Open questions for the buyer',
    history_data_quality: 'Data Quality',
    history_disclaimer: 'Information is based on public Bolagsverket documents. Always check information with the broker and request the latest annual report directly from the association.',
    phase2_notice: 'This function will be launched in phase 2 when we have coverage in Stockholm and Gothenburg. The prototype shows Malmö.',
    insufficient_comparable_data: 'Insufficient comparable data for this category',
    data_under_review: 'Data under review',
    verified_registry: 'Verified — public registers',
    verified_community: 'Verified — community',
    limited_data: 'Limited data'
  }
};
