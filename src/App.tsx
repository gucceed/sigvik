import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  BarChart3, 
  Map as MapIcon, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  ChevronRight, 
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Calendar,
  Info,
  Globe,
  Radio,
  Plus,
  Check,
  X,
  Zap,
  Filter,
  ChevronLeft
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { MOCK_BRFS, BRF, Signal, Language, TRANSLATIONS } from './types';

import { List } from 'react-window';

// --- Components ---

const Header = ({ activeTab, setActiveTab, lang, setLang, setShowInfo }: { 
  activeTab: string, 
  setActiveTab: (t: string) => void,
  lang: Language,
  setLang: (l: Language) => void,
  setShowInfo: (s: boolean) => void
}) => {
  const t = TRANSLATIONS[lang];
  return (
    <header className="border-b border-sigvik-line p-4 md:p-6 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-sigvik-ink flex items-center justify-center text-sigvik-bg font-bold text-xl">S</div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tighter uppercase">{t.app_name}</h1>
      </div>
      <nav className="hidden md:flex gap-8 items-center">
        <button 
          onClick={() => setActiveTab('public')}
          className={cn("text-xs uppercase tracking-widest font-semibold transition-opacity", activeTab === 'public' ? "opacity-100 border-b-2 border-sigvik-ink" : "opacity-40 hover:opacity-70")}
        >
          {t.brf_tool}
        </button>
        <button 
          onClick={() => setActiveTab('contractor')}
          className={cn("text-xs uppercase tracking-widest font-semibold transition-opacity", activeTab === 'contractor' ? "opacity-100 border-b-2 border-sigvik-ink" : "opacity-40 hover:opacity-70")}
        >
          {t.signal_engine}
        </button>
        <div className="h-4 w-px bg-sigvik-line/20 mx-2" />
        <button 
          onClick={() => setShowInfo(true)}
          className="text-xs uppercase tracking-widest font-semibold opacity-40 hover:opacity-100 transition-opacity"
        >
          {t.project_info}
        </button>
        <div className="h-4 w-px bg-sigvik-line/20 mx-2" />
        <button 
          onClick={() => setLang(lang === 'sv' ? 'en' : 'sv')}
          className="flex items-center gap-2 text-[10px] font-bold uppercase opacity-60 hover:opacity-100 transition-opacity"
        >
          <Globe size={12} /> {lang === 'sv' ? 'EN' : 'SV'}
        </button>
      </nav>
      <div className="flex md:hidden items-center gap-4">
        <button 
          onClick={() => setLang(lang === 'sv' ? 'en' : 'sv')}
          className="flex items-center gap-2 text-[10px] font-bold uppercase opacity-60"
        >
          <Globe size={12} /> {lang === 'sv' ? 'EN' : 'SV'}
        </button>
      </div>
      <div className="hidden md:flex items-center gap-4 text-[10px] font-mono opacity-50 uppercase">
        <span>{t.version} 1.0</span>
        <span>•</span>
        <span>{t.location}</span>
      </div>
    </header>
  );
};

const BottomNav = ({ activeTab, setActiveTab, setShowInfo, lang }: {
  activeTab: string,
  setActiveTab: (t: string) => void,
  setShowInfo: (s: boolean) => void,
  lang: Language
}) => {
  const t = TRANSLATIONS[lang];
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-100 z-[60] flex items-center justify-around pb-safe pb-0">
      <button 
        onClick={() => setActiveTab('public')}
        className={cn("flex flex-col items-center gap-1 transition-colors", activeTab === 'public' ? "text-sigvik-accent" : "text-gray-400")}
      >
        <Building2 size={20} />
        <span className="text-[10px] font-medium">{lang === 'sv' ? 'Föreningar' : 'Associations'}</span>
        {activeTab === 'public' && <div className="w-1 h-1 bg-sigvik-accent rounded-full" />}
      </button>
      <button 
        onClick={() => setActiveTab('contractor')}
        className={cn("flex flex-col items-center gap-1 transition-colors", activeTab === 'contractor' ? "text-sigvik-accent" : "text-gray-400")}
      >
        <Radio size={20} />
        <span className="text-[10px] font-medium">{lang === 'sv' ? 'Signaler' : 'Signals'}</span>
        {activeTab === 'contractor' && <div className="w-1 h-1 bg-sigvik-accent rounded-full" />}
      </button>
      <button 
        onClick={() => setShowInfo(true)}
        className="flex flex-col items-center gap-1 text-gray-400"
      >
        <Info size={20} />
        <span className="text-[10px] font-medium">Info</span>
      </button>
    </nav>
  );
};

const InfoModal = ({ lang, onClose }: { lang: Language, onClose: () => void }) => {
  const t = TRANSLATIONS[lang];
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-sigvik-ink/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white border border-sigvik-line max-w-2xl w-full p-12 relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 opacity-40 hover:opacity-100 transition-opacity uppercase font-mono text-xs"
        >
          [ Close ]
        </button>
        
        <div className="space-y-12">
          <div>
            <h2 className="font-serif italic text-4xl mb-6">{t.project_description_title}</h2>
            <p className="text-lg leading-relaxed opacity-80">{t.project_description_text}</p>
          </div>
          
          <div className="pt-12 border-t border-sigvik-line/10">
            <h3 className="col-header mb-6">{t.ui_ux_title}</h3>
            <p className="text-sm leading-relaxed opacity-70">{t.ui_ux_text}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 pt-12 border-t border-sigvik-line/10">
            <div>
              <span className="col-header">Stack</span>
              <p className="text-xs font-mono mt-2">React, TypeScript, Tailwind, Lucide, Recharts, Motion</p>
            </div>
            <div>
              <span className="col-header">Status</span>
              <p className="text-xs font-mono mt-2">Production Ready v1.0</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ScoreBadge = ({ score, label }: { score: number, label: string }) => {
  const color = score > 70 ? 'text-green-600' : score > 40 ? 'text-amber-600' : 'text-red-600';
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase opacity-50 font-bold leading-tight">{label}</span>
      <span className={cn("text-2xl font-mono font-bold", color)}>{score}</span>
    </div>
  );
};

const BrfCard = ({ brf, isSelected, onClick, lang }: { brf: BRF, isSelected: boolean, onClick: () => void, lang: Language }) => {
  const t = TRANSLATIONS[lang];
  return (
    <motion.div
      layout
      onClick={onClick}
      className={cn(
        "p-4 border-b border-sigvik-line cursor-pointer transition-colors active:bg-sigvik-ink/10",
        isSelected ? "bg-sigvik-ink text-white" : "hover:bg-sigvik-ink/5"
      )}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold truncate text-sm uppercase tracking-tight">{brf.name}</h3>
          <p className={cn("text-[10px] font-mono uppercase opacity-60 truncate", isSelected ? "text-white/60" : "text-sigvik-ink/60")}>
            {brf.address}, {brf.district}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className={cn(
            "text-lg font-mono font-bold",
            isSelected ? "text-white" : brf.intentScore > 70 ? "text-green-600" : brf.intentScore > 40 ? "text-amber-600" : "text-red-600"
          )}>
            {brf.intentScore}
          </div>
          <div className={cn("text-[8px] font-mono uppercase opacity-50", isSelected ? "text-white/50" : "text-sigvik-ink/50")}>
            {t.intent_score}
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-3">
          <div className="flex flex-col">
            <span className={cn("text-[8px] font-mono uppercase opacity-50", isSelected ? "text-white/50" : "text-sigvik-ink/50")}>{t.apartments}</span>
            <span className="text-xs font-bold">{brf.apartments}</span>
          </div>
          <div className="flex flex-col">
            <span className={cn("text-[8px] font-mono uppercase opacity-50", isSelected ? "text-white/50" : "text-sigvik-ink/50")}>{t.built_year}</span>
            <span className="text-xs font-bold">{brf.builtYear}</span>
          </div>
        </div>
        {brf.predictedProject && (
          <div className={cn(
            "px-2 py-0.5 rounded-full text-[8px] font-mono uppercase font-bold border",
            isSelected ? "bg-white/10 border-white/20 text-white" : "bg-sigvik-ink/5 border-sigvik-ink/10 text-sigvik-ink"
          )}>
            {brf.predictedProject}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- Views ---

const BrfRow = ({ index, style, filtered, selectedBrfId, setSelectedBrfId, lang }: any) => {
  const brf = filtered[index];
  if (!brf) return null;
  return (
    <div style={style}>
      <BrfCard 
        brf={brf} 
        isSelected={selectedBrfId === brf.id} 
        onClick={() => setSelectedBrfId(brf.id)} 
        lang={lang}
      />
    </div>
  );
};

const PublicView = ({ lang }: { lang: Language }) => {
  const t = TRANSLATIONS[lang];
  const [search, setSearch] = useState('');
  const [selectedBrfId, setSelectedBrfId] = useState<string | null>(null);
  const [showF3Modal, setShowF3Modal] = useState<'add' | 'flag' | null>(null);
  const [f3Status, setF3Status] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [disclaimerExpanded, setDisclaimerExpanded] = useState(false);
  const [persona, setPersona] = useState<'buyer' | 'board' | 'contractor' | null>(null);
  const [showPersonaPrompt, setShowPersonaPrompt] = useState(true);
  const [scrollCount, setScrollCount] = useState(0);
  const [showNavGuidance, setShowNavGuidance] = useState<string | null>(null);

  // Navigation Guidance Logic
  useEffect(() => {
    const handleScroll = () => {
      setScrollCount(prev => prev + 1);
      if (scrollCount > 500 && !selectedBrfId) {
        setShowNavGuidance(lang === 'sv' 
          ? 'Hittar du inte föreningen du söker? Prova att söka på gatunamnet istället för föreningens namn — många föreningar är lättare att hitta den vägen.'
          : 'Can\'t find the association you\'re looking for? Try searching for the street name instead of the association name — many associations are easier to find that way.');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollCount, selectedBrfId, lang]);
  
  // Phase 2 Filters
  const [filterMunicipality, setFilterMunicipality] = useState<string[]>([]);
  const [filterApartments, setFilterApartments] = useState<[number, number]>([32, 180]);
  const [filterBuiltYear, setFilterBuiltYear] = useState<string[]>([]);
  const [filterProjectType, setFilterProjectType] = useState<string[]>([]);
  const [filterFeeTrajectory, setFilterFeeTrajectory] = useState<string[]>([]);
  const [filterDebt, setFilterDebt] = useState<[number, number]>([45000, 185000]);
  const [filterEnergyClass, setFilterEnergyClass] = useState<string[]>([]);
  const [filterMaintenanceStatus, setFilterMaintenanceStatus] = useState<string[]>([]);
  
  const [sortBy, setSortBy] = useState<'name' | 'newest' | 'debt_low' | 'debt_high' | 'year_oldest' | 'year_newest'>('name');

  const filtered = useMemo(() => {
    return MOCK_BRFS.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || 
                           b.address.toLowerCase().includes(search.toLowerCase());
      
      const matchesMunicipality = filterMunicipality.length === 0 || filterMunicipality.includes(b.district);
      const matchesApartments = b.apartments >= filterApartments[0] && b.apartments <= filterApartments[1];
      
      let matchesYear = true;
      if (filterBuiltYear.length > 0) {
        matchesYear = filterBuiltYear.some(range => {
          if (range === 'pre-1960') return b.builtYear < 1960;
          if (range === '1960-1985') return b.builtYear >= 1960 && b.builtYear <= 1985;
          if (range === '1986-2000') return b.builtYear >= 1986 && b.builtYear <= 2000;
          if (range === '2001+') return b.builtYear >= 2001;
          return false;
        });
      }
      
      const matchesProject = filterProjectType.length === 0 || (b.predictedProject && filterProjectType.includes(b.predictedProject));
      const matchesFee = filterFeeTrajectory.length === 0 || filterFeeTrajectory.includes(b.feeTrajectory);
      const matchesDebt = b.debtPerUnit >= filterDebt[0] && b.debtPerUnit <= filterDebt[1];
      const matchesEnergy = filterEnergyClass.length === 0 || filterEnergyClass.includes(b.energyClass);
      const matchesMaintenance = filterMaintenanceStatus.length === 0 || filterMaintenanceStatus.includes(b.maintenancePlanStatus);

      return matchesSearch && matchesMunicipality && matchesApartments && matchesYear && 
             matchesProject && matchesFee && matchesDebt && matchesEnergy && matchesMaintenance;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'newest') return 0; // Mock newest
      if (sortBy === 'debt_low') return a.debtPerUnit - b.debtPerUnit;
      if (sortBy === 'debt_high') return b.debtPerUnit - a.debtPerUnit;
      if (sortBy === 'year_oldest') return a.builtYear - b.builtYear;
      if (sortBy === 'year_newest') return b.builtYear - a.builtYear;
      return 0;
    });
  }, [search, filterMunicipality, filterApartments, filterBuiltYear, filterProjectType, filterFeeTrajectory, filterDebt, filterEnergyClass, filterMaintenanceStatus, sortBy]);

  const selectedBrf = MOCK_BRFS.find(b => b.id === selectedBrfId);

  useEffect(() => {
    if (filtered.length > 50) {
      setShowNavGuidance(lang === 'sv'
        ? 'Du kan lägga till stadsdelen för att filtrera — till exempel "Pilen Limhamn" istället för bara "Pilen".'
        : 'You can add the district to filter — for example "Pilen Limhamn" instead of just "Pilen".');
    } else {
      setShowNavGuidance(null);
    }
  }, [filtered.length, lang]);

  const handleF3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setF3Status('submitting');
    setTimeout(() => {
      setF3Status('success');
      setTimeout(() => {
        setShowF3Modal(null);
        setF3Status('idle');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Persona Onboarding */}
      <AnimatePresence>
        {showPersonaPrompt && !persona && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 w-[calc(100%-2rem)] md:w-80 bg-sigvik-ink text-sigvik-bg p-6 shadow-2xl border border-sigvik-line/20"
          >
            <p className="text-sm mb-4 leading-relaxed">
              {lang === 'sv' 
                ? 'Letar du efter information om en specifik förening du funderar på att köpa in i, eller vill du förstå hur en förening du redan tillhör sköts?' 
                : 'Are you looking for information about a specific association you are considering buying into, or do you want to understand how an association you already belong to is managed?'}
            </p>
            <div className="space-y-2">
              <button 
                onClick={() => { setPersona('buyer'); setShowPersonaPrompt(false); }}
                className="w-full text-left p-3 md:p-2 text-xs border border-sigvik-bg/20 hover:bg-sigvik-bg hover:text-sigvik-ink transition-colors"
              >
                {lang === 'sv' ? 'Jag är en prospektiv köpare' : 'I am a prospective buyer'}
              </button>
              <button 
                onClick={() => { setPersona('board'); setShowPersonaPrompt(false); }}
                className="w-full text-left p-3 md:p-2 text-xs border border-sigvik-bg/20 hover:bg-sigvik-bg hover:text-sigvik-ink transition-colors"
              >
                {lang === 'sv' ? 'Jag är styrelsemedlem / boende' : 'I am a board member / resident'}
              </button>
              <button 
                onClick={() => { setPersona('contractor'); setShowPersonaPrompt(false); }}
                className="w-full text-left p-3 md:p-2 text-xs border border-sigvik-bg/20 hover:bg-sigvik-bg hover:text-sigvik-ink transition-colors"
              >
                {lang === 'sv' ? 'Jag är förvaltare / entreprenör' : 'I am a manager / contractor'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mandatory Disclaimer */}
      <div className={cn(
        "mb-4 md:mb-8 transition-all duration-300 overflow-hidden",
        "md:bg-sigvik-ink md:text-sigvik-bg md:text-[10px] md:leading-relaxed md:uppercase md:tracking-wider md:border-l-4 md:border-sigvik-line md:p-4",
        "bg-amber-50 text-amber-800 border-b border-amber-200 md:border-none"
      )}>
        <div className={cn(
          "flex justify-between items-center md:items-start gap-3",
          disclaimerExpanded ? "p-4 md:p-0" : "h-9 px-4 md:h-auto md:p-0"
        )}>
          <div className="flex items-center md:items-start gap-3 flex-1">
            <Info size={16} className="shrink-0 opacity-60 md:opacity-100" />
            <div className="flex-1">
              {!disclaimerExpanded ? (
                <p className="text-[10px] font-medium md:font-normal truncate md:whitespace-normal">
                  {lang === 'sv' ? 'Informationen baseras på offentliga källor. Tryck för mer.' : 'Information is based on public sources. Press for more.'}
                </p>
              ) : (
                <p className="text-[10px] leading-relaxed uppercase tracking-wider md:normal-case md:tracking-normal">
                  {t.mandatory_disclaimer}
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={() => setDisclaimerExpanded(!disclaimerExpanded)}
            className="shrink-0 p-2 -mr-2 md:m-0"
          >
            {disclaimerExpanded ? (
              <span className="hidden md:inline font-bold hover:underline">[ - ]</span>
            ) : (
              <span className="hidden md:inline font-bold hover:underline">[ + ]</span>
            )}
            <ChevronRight size={16} className={cn("md:hidden transition-transform", disclaimerExpanded && "rotate-90")} />
          </button>
        </div>
      </div>
      
      {/* Market Overview Strip - Mobile Only */}
      <div className="flex md:hidden mb-4 bg-gray-50 border-y border-gray-100 overflow-x-auto no-scrollbar">
        <div className="flex-1 border-r border-gray-200 py-3 px-4 min-w-[120px]">
          <span className="text-[10px] text-gray-500 uppercase block mb-1">{t.total_brfs}</span>
          <span className="text-lg font-semibold text-sigvik-accent">14,204</span>
        </div>
        <div className="flex-1 border-r border-gray-200 py-3 px-4 min-w-[120px]">
          <span className="text-[10px] text-gray-500 uppercase block mb-1">{t.avg_financial_score}</span>
          <span className="text-lg font-semibold text-sigvik-accent">68.4</span>
        </div>
        <div className="flex-1 py-3 px-4 min-w-[120px]">
          <span className="text-[10px] text-gray-500 uppercase block mb-1">{lang === 'sv' ? 'Aktiva signaler' : 'Active signals'}</span>
          <span className="text-lg font-semibold text-sigvik-accent">142</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-8">
        <div className="flex-1">
          <h2 className="font-serif italic text-3xl md:text-5xl mb-4 tracking-tight">
            {persona === 'buyer' 
              ? (lang === 'sv' ? 'Hitta din framtida förening' : 'Find your future association')
              : persona === 'board'
              ? (lang === 'sv' ? 'Förstå din förenings data' : 'Understand your association\'s data')
              : (lang === 'sv' ? 'Marknadsöversikt Malmö' : 'Market Overview Malmö')}
          </h2>
          <p className="max-w-2xl text-base md:text-lg opacity-70 leading-relaxed">
            {persona === 'buyer'
              ? (lang === 'sv' ? 'Välkommen. Sök på föreningens namn — t.ex. "BRF Pilen".' : 'Welcome. Search for the association\'s name — e.g. "BRF Pilen".')
              : persona === 'board'
              ? (lang === 'sv' ? 'Sök på din förenings namn för att se vår data. Flagga om något är fel.' : 'Search for your association\'s name to see our data. Flag if something is wrong.')
              : (lang === 'sv' ? 'Realtidsdata från Malmös bostadsrättsföreningar.' : 'Real-time data from Malmö\'s housing associations.')}
          </p>
        </div>
        <div className="hidden lg:flex gap-12 border-l border-sigvik-line/10 pl-12 py-2">
          <div>
            <span className="col-header block mb-1">{t.total_brfs}</span>
            <span className="text-2xl font-mono font-bold tracking-tighter">14,204</span>
          </div>
          <div>
            <span className="col-header block mb-1">{t.avg_financial_score}</span>
            <span className="text-2xl font-mono font-bold tracking-tighter">68.4</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="sticky top-[73px] md:relative md:top-0 z-40 bg-white md:bg-transparent mb-8 flex flex-col md:flex-row gap-4 shadow-sm md:shadow-none -mx-4 px-4 py-3 md:m-0 md:p-0 md:mb-12">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
          <input 
            type="text" 
            placeholder={lang === 'sv' ? 'Sök förening...' : 'Search association...'}
            className="w-full h-12 md:h-16 bg-sigvik-bg md:bg-white border border-sigvik-line/10 md:border-sigvik-line/20 p-4 pl-12 font-mono text-base md:text-xl focus:outline-none focus:border-sigvik-ink transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 p-2"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <div className="flex items-center gap-2 px-4 h-10 md:h-16 bg-sigvik-bg md:bg-white border border-sigvik-line/10 md:border-sigvik-line/20 whitespace-nowrap">
            <span className="text-[10px] font-bold uppercase opacity-40">Sort:</span>
            <select 
              className="bg-transparent text-[10px] font-bold uppercase outline-none cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="name">{t.sort_alphabetical}</option>
              <option value="newest">{t.sort_newest}</option>
              <option value="debt_low">{t.sort_debt_low}</option>
              <option value="debt_high">{t.sort_debt_high}</option>
              <option value="year_oldest">{t.sort_year_oldest}</option>
              <option value="year_newest">{t.sort_year_newest}</option>
            </select>
          </div>
          <button className="md:hidden flex items-center gap-2 px-4 h-10 bg-sigvik-bg border border-sigvik-line/10 whitespace-nowrap text-[10px] font-bold uppercase">
            <Filter size={14} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden min-h-[600px]">
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-4 gap-8 transition-transform duration-250 ease-out",
          selectedBrfId && "translate-x-[-100%] md:translate-x-0"
        )}>
          <div className="md:col-span-1 space-y-8">
            {/* Filters Section - Hidden on mobile for now or moved */}
            <div className="hidden md:block bg-white border border-sigvik-line p-6 space-y-6">
              <h3 className="col-header border-b border-sigvik-line/10 pb-2 mb-4">Filter</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase opacity-40 block mb-2">{t.filter_municipality}</label>
                  <div className="flex flex-wrap gap-2">
                    {['Husie', 'Limhamn', 'Centrum', 'Västra Hamnen', 'Hyllie', 'Segevång', 'Oxie', 'Rosengård', 'Fosie', 'Kirseberg'].map(d => (
                      <button 
                        key={d}
                        onClick={() => setFilterMunicipality(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])}
                        className={cn("px-2 py-1 text-[10px] border transition-all", filterMunicipality.includes(d) ? "bg-sigvik-ink text-sigvik-bg border-sigvik-ink" : "border-sigvik-line/20 opacity-60 hover:opacity-100")}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase opacity-40 block mb-2">{t.filter_apartments} (32–180)</label>
                  <input 
                    type="range" min="32" max="180" 
                    value={filterApartments[1]} 
                    onChange={(e) => setFilterApartments([32, parseInt(e.target.value)])}
                    className="w-full accent-sigvik-ink"
                  />
                  <div className="flex justify-between text-[10px] font-mono opacity-40 mt-1">
                    <span>32</span>
                    <span>{filterApartments[1]}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase opacity-40 block mb-2">{t.filter_built_year}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['pre-1960', '1960-1985', '1986-2000', '2001+'].map(range => (
                      <button 
                        key={range}
                        onClick={() => setFilterBuiltYear(prev => prev.includes(range) ? prev.filter(x => x !== range) : [...prev, range])}
                        className={cn("px-2 py-1 text-[10px] border transition-all", filterBuiltYear.includes(range) ? "bg-sigvik-ink text-sigvik-bg border-sigvik-ink" : "border-sigvik-line/20 opacity-60 hover:opacity-100")}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase opacity-40 block mb-2">{t.filter_project_type}</label>
                  <div className="flex flex-wrap gap-2">
                    {['Stambyte', 'Fasad', 'Fönster', 'Tak', 'Energi', 'Hiss'].map(p => (
                      <button 
                        key={p}
                        onClick={() => setFilterProjectType(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                        className={cn("px-2 py-1 text-[10px] border transition-all", filterProjectType.includes(p) ? "bg-sigvik-ink text-sigvik-bg border-sigvik-ink" : "border-sigvik-line/20 opacity-60 hover:opacity-100")}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase opacity-40 block mb-2">{t.filter_fee_trajectory}</label>
                  <div className="flex flex-wrap gap-2">
                    {['Stable', 'Rising 1-5%', 'Rising 6-15%', 'Rising 16%+', 'Falling'].map(f => (
                      <button 
                        key={f}
                        onClick={() => setFilterFeeTrajectory(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])}
                        className={cn("px-2 py-1 text-[10px] border transition-all", filterFeeTrajectory.includes(f) ? "bg-sigvik-ink text-sigvik-bg border-sigvik-ink" : "border-sigvik-line/20 opacity-60 hover:opacity-100")}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase opacity-40 block mb-2">{t.filter_debt} (45k–185k)</label>
                  <input 
                    type="range" min="45000" max="185000" step="5000"
                    value={filterDebt[1]} 
                    onChange={(e) => setFilterDebt([45000, parseInt(e.target.value)])}
                    className="w-full accent-sigvik-ink"
                  />
                  <div className="flex justify-between text-[10px] font-mono opacity-40 mt-1">
                    <span>45k</span>
                    <span>{Math.round(filterDebt[1]/1000)}k</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase opacity-40 block mb-2">{t.filter_maintenance_status}</label>
                  <div className="flex flex-wrap gap-2">
                    {['Aktuell', 'Föråldrad', 'Saknas', 'Okänd'].map(s => (
                      <button 
                        key={s}
                        onClick={() => setFilterMaintenanceStatus(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                        className={cn("px-2 py-1 text-[10px] border transition-all", filterMaintenanceStatus.includes(s) ? "bg-sigvik-ink text-sigvik-bg border-sigvik-ink" : "border-sigvik-line/20 opacity-60 hover:opacity-100")}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase opacity-40 block mb-2">{t.filter_energy_class}</label>
                  <div className="flex flex-wrap gap-2">
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(c => (
                      <button 
                        key={c}
                        onClick={() => setFilterEnergyClass(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                        className={cn("w-6 h-6 flex items-center justify-center text-[10px] border transition-all", filterEnergyClass.includes(c) ? "bg-sigvik-ink text-sigvik-bg border-sigvik-ink" : "border-sigvik-line/20 opacity-60 hover:opacity-100")}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 px-4 md:px-0">
                <span className="col-header">{t.search_results}</span>
                <div className="flex gap-4 md:hidden">
                  <button onClick={() => setShowF3Modal('add')} className="p-2 text-sigvik-accent">
                    <Plus size={20} />
                  </button>
                  <button onClick={() => setShowF3Modal('flag')} className="p-2 text-sigvik-accent">
                    <AlertTriangle size={20} />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-100 md:space-y-2 md:divide-y-0">
                {filtered.length > 50 ? (
                  <List
                    rowCount={filtered.length}
                    rowHeight={100}
                    rowProps={{ filtered, selectedBrfId, setSelectedBrfId, lang }}
                    rowComponent={BrfRow}
                    style={{ height: window.innerWidth < 768 ? window.innerHeight - 250 : 600, width: '100%' }}
                  />
                ) : (
                  filtered.map(brf => (
                    <BrfCard 
                      key={brf.id}
                      brf={brf} 
                      isSelected={selectedBrfId === brf.id} 
                      onClick={() => setSelectedBrfId(brf.id)} 
                      lang={lang}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="hidden md:block pt-6 border-t border-sigvik-line/10 space-y-3">
              <button 
                onClick={() => setShowF3Modal('add')}
                className="w-full flex items-center justify-between p-4 border border-dashed border-sigvik-line/30 hover:border-sigvik-ink transition-colors group"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest">{t.add_missing_brf}</span>
                <Plus size={14} className="opacity-30 group-hover:opacity-100" />
              </button>
              <button 
                onClick={() => setShowF3Modal('flag')}
                className="w-full flex items-center justify-between p-4 border border-dashed border-sigvik-line/30 hover:border-sigvik-ink transition-colors group"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest">{t.flag_error}</span>
                <AlertTriangle size={14} className="opacity-30 group-hover:opacity-100" />
              </button>
            </div>
          </div>

          <div className={cn(
            "md:col-span-3 fixed inset-0 z-50 bg-white md:relative md:inset-auto md:z-0 transition-transform duration-300 ease-in-out",
            selectedBrfId ? "translate-x-0" : "translate-x-full md:translate-x-0"
          )}>
            <AnimatePresence mode="wait">
              {selectedBrf ? (
                <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="h-full flex flex-col bg-white"
                >
                  {/* Mobile Back Button */}
                  <div className="md:hidden sticky top-0 z-50 h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-4">
                    <button 
                      onClick={() => setSelectedBrfId(null)}
                      className="p-2 -ml-2 text-sigvik-ink"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <span className="text-sm font-bold uppercase tracking-tight truncate flex-1 text-center pr-8">
                      {selectedBrf.name}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter">{selectedBrf.name}</h3>
                        <p className="font-mono text-sm opacity-50">{selectedBrf.address}, {selectedBrf.district}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-sigvik-bg text-[8px] font-bold uppercase border border-sigvik-line/10">{t.verified_registry}</span>
                          {selectedBrf.maintenancePlanStatus === 'Aktuell' && <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[8px] font-bold uppercase border border-green-200">Verifierad — community</span>}
                        </div>
                      </div>
                      <div className="flex gap-8 w-full md:w-auto justify-between md:justify-start border-t border-gray-100 pt-4 md:border-none md:pt-0">
                        <ScoreBadge label={t.financial_health} score={selectedBrf.financialScore} />
                        <ScoreBadge label={t.maintenance_liability} score={selectedBrf.maintenanceLiability} />
                      </div>
                    </div>

                    {/* Board Member Callout */}
                    {persona === 'board' && (
                      <div className="mb-8 p-4 bg-sigvik-accent/5 border border-sigvik-accent/20">
                        <p className="text-xs font-bold uppercase text-sigvik-accent mb-2">
                          {lang === 'sv' ? 'Stämmer inte datan?' : 'Is the data incorrect?'}
                        </p>
                        <p className="text-sm opacity-80 mb-3">
                          {lang === 'sv' 
                            ? 'Om du ser information som är felaktig eller saknas kan du flagga det direkt.' 
                            : 'If you see information that is incorrect or missing, you can flag it directly.'}
                        </p>
                        <button 
                          onClick={() => setShowF3Modal('flag')}
                          className="text-[10px] font-bold uppercase tracking-widest underline hover:no-underline"
                        >
                          {t.flag_error}
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-12">
                      <div className="p-4 md:p-6 bg-sigvik-bg/30 border border-sigvik-line/5">
                        <h4 className="col-header mb-4">{t.building_info}</h4>
                        <div className="space-y-4 md:space-y-3">
                          <div className="flex justify-between items-center md:items-start text-sm border-b border-gray-100 pb-4 md:border-none md:pb-0">
                            <span className="opacity-50">{t.built_year}</span>
                            <span className="font-mono font-semibold md:font-normal text-sigvik-accent md:text-inherit">{selectedBrf.builtYear}</span>
                          </div>
                          <div className="flex justify-between items-center md:items-start text-sm border-b border-gray-100 pb-4 md:border-none md:pb-0">
                            <span className="opacity-50">{t.apartments}</span>
                            <span className="font-mono font-semibold md:font-normal text-sigvik-accent md:text-inherit">{selectedBrf.apartments}</span>
                          </div>
                          <div className="flex justify-between items-center md:items-start text-sm border-b border-gray-100 pb-4 md:border-none md:pb-0">
                            <span className="opacity-50">{t.municipality}</span>
                            <span className="font-mono font-semibold md:font-normal text-sigvik-accent md:text-inherit">{selectedBrf.municipality}</span>
                          </div>
                          <div className="flex justify-between items-center md:items-start text-sm border-b border-gray-100 pb-4 md:border-none md:pb-0">
                            <span className="opacity-50">{t.energy_class}</span>
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-mono font-semibold md:font-normal text-sigvik-accent md:text-inherit">{selectedBrf.energyClass}</span>
                              {persona === 'buyer' && (
                                <span className="text-[10px] opacity-40 italic max-w-[150px] text-right">
                                  {['E', 'F', 'G'].includes(selectedBrf.energyClass)
                                    ? (lang === 'sv' ? 'Kan behöva investera i energieffektivisering före 2030.' : 'May need to invest in energy efficiency before 2030.')
                                    : (lang === 'sv' ? 'God energiprestanda.' : 'Good energy performance.')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center md:items-start text-sm border-b border-gray-100 pb-4 md:border-none md:pb-0">
                            <span className="opacity-50">{t.debt_per_unit}</span>
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold md:font-normal text-sigvik-accent md:text-inherit">{selectedBrf.debtPerUnit.toLocaleString()} kr</span>
                                <span className="px-1 py-0.5 bg-sigvik-ink/5 text-[6px] font-bold uppercase border border-sigvik-line/10" title="NLP Confidence: High">Hög</span>
                              </div>
                              <span className="text-[10px] opacity-40 italic">
                                {selectedBrf.debtPerUnit < 100000 
                                  ? (lang === 'sv' ? 'Normal skuldnivå.' : 'Normal debt level.')
                                  : (lang === 'sv' ? 'Högre skuldnivå.' : 'Higher debt level.')}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center md:items-start text-sm">
                            <span className="opacity-50">{t.trajectory}</span>
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-mono font-semibold md:font-normal text-sigvik-accent md:text-inherit">{selectedBrf.feeTrajectory}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 md:p-6 bg-sigvik-bg/30 border border-sigvik-line/5">
                        <h4 className="col-header mb-4">{t.comparison}</h4>
                        <div className="h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                              { name: 'Avg', value: 65 },
                              { name: selectedBrf.name, value: selectedBrf.financialScore }
                            ]}>
                              <XAxis dataKey="name" hide />
                              <Tooltip />
                              <Bar dataKey="value">
                                { [0, 1].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index === 1 ? '#141414' : '#14141444'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="mt-4 text-[10px] font-mono opacity-40 uppercase">
                          {142 < 5 ? t.insufficient_comparable_data : t.sample_size.replace('{count}', '142')}
                        </p>
                      </div>
                    </div>

                    {/* Association History Section */}
                    {selectedBrf.history && (
                      <div className="mb-12">
                        <div className="flex justify-between items-end mb-6">
                          <h4 className="col-header">{t.history_title}</h4>
                          <div className="text-[10px] font-mono opacity-40 uppercase hidden md:block">
                            {t.history_data_quality}: <span className="text-sigvik-ink font-bold">Hög (iXBRL)</span>
                          </div>
                        </div>
                        
                        {/* Desktop Table */}
                        <div className="hidden md:block border border-sigvik-line/10 overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-sigvik-bg/50 border-b border-sigvik-line/10">
                              <tr>
                                <th className="p-3 font-bold uppercase tracking-wider">{t.history_year}</th>
                                <th className="p-3 font-bold uppercase tracking-wider">{t.history_goal}</th>
                                <th className="p-3 font-bold uppercase tracking-wider">{t.history_outcome}</th>
                                <th className="p-3 font-bold uppercase tracking-wider">{t.history_status}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-sigvik-line/5">
                              {selectedBrf.history.map((item, i) => (
                                <tr key={i} className="hover:bg-sigvik-bg/20 transition-colors">
                                  <td className="p-3 font-mono">{item.year}</td>
                                  <td className="p-3 opacity-80 italic">"{item.goal}"</td>
                                  <td className="p-3 opacity-80">{item.outcome}</td>
                                  <td className="p-3">
                                    <span className={cn(
                                      "px-2 py-0.5 text-[8px] font-bold uppercase border",
                                      item.status === 'Uppfyllt' ? "bg-green-50 text-green-700 border-green-200" :
                                      item.status === 'Ej uppfyllt' ? "bg-red-50 text-red-700 border-red-200" :
                                      "bg-amber-50 text-amber-700 border-amber-200"
                                    )}>
                                      {item.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4">
                          {selectedBrf.history.map((item, i) => (
                            <div key={i} className="p-4 border border-gray-100 bg-gray-50/30 space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="font-mono font-bold text-lg">{item.year}</span>
                                <span className={cn(
                                  "px-2 py-0.5 text-[8px] font-bold uppercase border",
                                  item.status === 'Uppfyllt' ? "bg-green-50 text-green-700 border-green-200" :
                                  item.status === 'Ej uppfyllt' ? "bg-red-50 text-red-700 border-red-200" :
                                  "bg-amber-50 text-amber-700 border-amber-200"
                                )}>
                                  {item.status}
                                </span>
                              </div>
                              <p className="text-sm italic opacity-80">"{item.goal}"</p>
                              <p className="text-sm opacity-70">{item.outcome}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <span className="text-[10px] font-bold uppercase opacity-40 block mb-2">{t.history_pattern}</span>
                            <p className="text-sm italic opacity-70 leading-relaxed">
                              {lang === 'sv' 
                                ? 'Föreningen uppvisar ett mönster av att prioritera akuta läckage framför planerade energibesparingsmål.'
                                : 'The association shows a pattern of prioritizing acute leaks over planned energy saving goals.'}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase opacity-40 block mb-2">{t.history_questions}</span>
                            <ul className="text-sm space-y-2 opacity-70 list-disc pl-4">
                              <li>{lang === 'sv' ? 'Finns en aktuell underhållsplan?' : 'Is there a current maintenance plan?'}</li>
                              <li>{lang === 'sv' ? 'Vad är status för stambytet?' : 'What is the status of the pipe replacement?'}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="mt-8 text-[9px] opacity-40 leading-relaxed italic border-t border-sigvik-line/10 pt-4">
                      {t.history_disclaimer}
                    </p>

                    <div className="border-t border-sigvik-line/10 pt-8">
                      <h4 className="col-header mb-4">{t.recommended_actions}</h4>
                      <div className="space-y-4">
                        <div className="flex gap-4 items-start p-4 bg-amber-50 border border-amber-100">
                          <div className="p-2 bg-amber-100 text-amber-700 rounded">
                            <AlertTriangle size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-sm">
                              {lang === 'sv' ? 'Begär förtydligande om underhållsplan' : 'Request clarification on maintenance plan'}
                            </p>
                            <p className="text-xs opacity-60">
                              {lang === 'sv' 
                                ? 'Föreningens underhållsplan är markerad som föråldrad.' 
                                : 'The association\'s maintenance plan is marked as outdated.'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Persona A - Questions for Broker */}
                      <div className="mt-8 pt-8 border-t border-sigvik-line/5">
                        <h5 className="text-[10px] font-bold uppercase opacity-40 mb-4">{lang === 'sv' ? 'Tre frågor att ställa till mäklaren' : 'Three questions to ask the broker'}</h5>
                        <ul className="space-y-4 md:space-y-3">
                          {[
                            lang === 'sv' ? 'Finns det en aktuell underhållsplan?' : 'Is there a current maintenance plan?',
                            lang === 'sv' ? `Hur ser planen ut för energiklass ${selectedBrf.energyClass}?` : `What is the plan for energy class ${selectedBrf.energyClass}?`,
                            lang === 'sv' ? 'Finns det några beslutade avgiftshöjningar?' : 'Are there any decided fee increases?'
                          ].map((q, i) => (
                            <li key={i} className="flex gap-3 items-start text-sm opacity-70 italic">
                              <span className="font-mono text-sigvik-ink font-bold">{i+1}.</span>
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Mobile Flag Error */}
                      <div className="md:hidden mt-12 pt-8 border-t border-gray-100 text-center">
                        <p className="text-sm opacity-60 mb-2">{lang === 'sv' ? 'Ser du ett fel i datan?' : 'See an error in the data?'}</p>
                        <button 
                          onClick={() => setShowF3Modal('flag')}
                          className="text-sigvik-accent font-bold uppercase text-xs tracking-widest"
                        >
                          {lang === 'sv' ? 'Flagga fel' : 'Flag error'}
                        </button>
                      </div>

                      <div className="mt-12 flex flex-col md:flex-row gap-4">
                        <button className="w-full md:flex-1 bg-sigvik-ink text-sigvik-bg py-4 font-bold uppercase tracking-widest text-xs">
                          {lang === 'sv' ? 'Ladda ner fullständig rapport' : 'Download Full Report'}
                        </button>
                        <p className="text-[10px] opacity-40 text-center md:text-left md:max-w-[200px]">
                          {lang === 'sv' ? 'Rapporten inkluderar iXBRL-data och fullständig historik.' : 'Report includes iXBRL data and full history.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="hidden md:block h-full space-y-8">
                  {persona !== 'buyer' ? (
                    <>
                      <div className="p-8 bg-white border border-sigvik-line shadow-sm">
                        <h4 className="col-header mb-6">{t.market_overview}</h4>
                        <div className="space-y-6">
                          <div className="flex justify-between items-end border-b border-sigvik-line/5 pb-4">
                            <span className="text-sm opacity-50">{t.total_brfs} (Malmö)</span>
                            <span className="font-mono text-xl font-bold">2,104</span>
                          </div>
                          <div className="flex justify-between items-end border-b border-sigvik-line/5 pb-4">
                            <span className="text-sm opacity-50">{t.avg_financial_score}</span>
                            <span className="font-mono text-xl font-bold">71.2</span>
                          </div>
                          <div className="flex justify-between items-end border-b border-sigvik-line/5 pb-4">
                            <span className="text-sm opacity-50">{lang === 'sv' ? 'Aktiva signaler (24h)' : 'Active signals (24h)'}</span>
                            <span className="font-mono text-xl font-bold text-sigvik-accent">142</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-8 bg-sigvik-ink text-sigvik-bg">
                        <h4 className="col-header text-sigvik-bg/50 mb-6">{t.top_districts}</h4>
                        <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                          <div className="flex justify-between opacity-80"><span>Västra Hamnen</span><span>84.2</span></div>
                          <div className="flex justify-between opacity-80"><span>Slottsstaden</span><span>79.1</span></div>
                          <div className="flex justify-between opacity-80"><span>Limhamn</span><span>76.5</span></div>
                          <div className="flex justify-between opacity-80"><span>Möllevången</span><span>62.8</span></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-12 border-2 border-dashed border-sigvik-line/10 text-center bg-white/50 h-full flex flex-col items-center justify-center">
                      <Building2 size={48} className="mb-4 opacity-10" />
                      <p className="font-serif italic text-xl opacity-40 mb-4">{t.select_brf}</p>
                      <p className="text-xs opacity-30 max-w-xs mx-auto leading-relaxed">
                        {lang === 'sv' 
                          ? 'Välj en förening i listan till vänster för att se detaljerad information om ekonomi, underhåll och historik.' 
                          : 'Select an association from the list on the left to see detailed information about finances, maintenance, and history.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* F3 Modal */}
      <AnimatePresence>
        {showF3Modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowF3Modal(null)}
              className="absolute inset-0 bg-sigvik-ink/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-sigvik-bg w-full max-w-lg p-8 border border-sigvik-line shadow-2xl"
            >
              <button 
                onClick={() => setShowF3Modal(null)}
                className="absolute top-4 right-4 opacity-40 hover:opacity-100"
              >
                <X size={20} />
              </button>

              <h2 className="font-serif italic text-3xl mb-6">
                {showF3Modal === 'add' ? t.add_missing_brf : t.flag_error}
              </h2>

              {f3Status === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center"
                >
                  <div className="w-16 h-16 bg-sigvik-ink text-sigvik-bg rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={32} />
                  </div>
                  <p className="font-bold">{showF3Modal === 'add' ? t.submission_success : t.flag_success}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleF3Submit} className="space-y-6">
                  <div>
                    <label className="col-header block mb-2">{t.brf_name_official}</label>
                    <input required type="text" className="w-full bg-white border border-sigvik-line p-3 focus:outline-none focus:ring-1 focus:ring-sigvik-ink" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="col-header block mb-2">{t.org_number}</label>
                      <input required type="text" placeholder="XXXXXX-XXXX" className="w-full bg-white border border-sigvik-line p-3 focus:outline-none focus:ring-1 focus:ring-sigvik-ink" />
                    </div>
                    <div>
                      <label className="col-header block mb-2">{t.municipality}</label>
                      <input required type="text" className="w-full bg-white border border-sigvik-line p-3 focus:outline-none focus:ring-1 focus:ring-sigvik-ink" />
                    </div>
                  </div>
                  <div>
                    <label className="col-header block mb-2">{t.your_role}</label>
                    <select className="w-full bg-white border border-sigvik-line p-3 focus:outline-none focus:ring-1 focus:ring-sigvik-ink">
                      <option value="board">{t.role_board}</option>
                      <option value="resident">{t.role_resident}</option>
                      <option value="manager">{t.role_manager}</option>
                      <option value="contractor">{t.role_contractor}</option>
                      <option value="buyer">{t.role_buyer}</option>
                      <option value="other">{t.role_other}</option>
                    </select>
                  </div>
                  {showF3Modal === 'flag' && (
                    <div>
                      <label className="col-header block mb-2">{lang === 'sv' ? 'Beskriv felet' : 'Describe the error'}</label>
                      <textarea required className="w-full bg-white border border-sigvik-line p-3 h-24 focus:outline-none focus:ring-1 focus:ring-sigvik-ink" />
                    </div>
                  )}
                  <button 
                    type="submit"
                    disabled={f3Status === 'submitting'}
                    className="w-full bg-sigvik-ink text-sigvik-bg py-4 font-bold uppercase tracking-widest text-xs hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {f3Status === 'submitting' ? t.loading : t.submit}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ContractorDashboard = ({ lang }: { lang: Language }) => {
  const t = TRANSLATIONS[lang];
  const [view, setView] = useState<'list' | 'map'>('list');
  const [liveSignals, setLiveSignals] = useState<Signal[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [selectedBrfId, setSelectedBrfId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'intent' | 'name' | 'debt_low' | 'debt_high' | 'year' | 'signals'>('intent');
  const [analyses, setAnalyses] = useState<Record<string, {
    project: string;
    confidence: string;
    pattern: string;
    recommendation: string;
    uncertainties: string;
  }>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedBrf = useMemo(() => MOCK_BRFS.find(b => b.id === selectedBrfId), [selectedBrfId]);

  const sortedBrfs = useMemo(() => {
    return [...MOCK_BRFS].sort((a, b) => {
      if (sortBy === 'intent') return b.intentScore - a.intentScore;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'debt_low') return a.debtPerUnit - b.debtPerUnit;
      if (sortBy === 'debt_high') return b.debtPerUnit - a.debtPerUnit;
      if (sortBy === 'year') return a.builtYear - b.builtYear;
      if (sortBy === 'signals') return b.signals.length - a.signals.length;
      return 0;
    });
  }, [sortBy]);

  // Simulate Live Data Connection
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newSignal: Signal = {
        type: ['Avgiftshöjning', 'Bygglov', 'Låneförändring', 'Energideklaration'][Math.floor(Math.random() * 4)],
        description: lang === 'sv' ? 'Ny signal detekterad via API-pipeline' : 'New signal detected via API pipeline',
        weight: Math.random() > 0.5 ? 'Primary' : 'Secondary',
        date: new Date().toISOString().split('T')[0]
      };
      setLiveSignals(prev => [newSignal, ...prev].slice(0, 5));
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive, lang]);

  const generateAnalysis = (brf: BRF) => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      const analysis = {
        project: `${brf.predictedProject || 'Underhåll'} inom ${brf.timeHorizon || '6-18 månader'}`,
        confidence: `${brf.signals.length} ${t.signals_available}`,
        pattern: brf.id === '3' 
          ? 'Föreningen har nyligen tagit upp ett betydande lån på 4 miljoner SEK, vilket korrelerar direkt med en specifik notering i årsredovisningen om läckage i vindsutrymmet. Byggnadsåret 1965 indikerar dessutom att takets tekniska livslängd är uppnådd.'
          : brf.id === '1'
          ? 'Planerad avgiftshöjning på 12% indikerar förberedelse för kapitalintensivt projekt. Bygglovsansökan för ställningsbygge bekräftar att fasadarbete är i nära förestående planeringsfas.'
          : 'Energideklarationens rekommendationer pekar på behov av injustering eller byte av värmesystem. Byggnadens ålder (2005) tyder på att tekniska system närmar sig sin första stora översyn.',
        recommendation: brf.id === '3'
          ? 'Optimal timing för kontakt är omgående. Referera till byggnadens livscykel och erbjuda en teknisk statusbesiktning av vindsbjälklaget för att hjälpa styrelsen precisera omfattningen.'
          : 'Kontakta fastighetsansvarig för att diskutera referensprojekt inom fasadrenovering. Fokusera på energieffektivisering som ett resultat av projektet.',
        uncertainties: 'Data saknas för aktuella bygglovsansökningar och specifika styrelsebeslut rörande entreprenörsval.'
      };
      
      setAnalyses(prev => ({ ...prev, [brf.id]: analysis }));
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-88px)] flex flex-col">
      <div className="border-b border-sigvik-line p-4 flex justify-between items-center bg-white/30">
        <div className="flex gap-4">
          <button 
            onClick={() => setView('list')}
            className={cn("flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest", view === 'list' ? "bg-sigvik-ink text-sigvik-bg" : "hover:bg-sigvik-ink/5")}
          >
            <LayoutDashboard size={14} /> {t.list}
          </button>
          <button 
            onClick={() => setView('map')}
            className={cn("flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest", view === 'map' ? "bg-sigvik-ink text-sigvik-bg" : "hover:bg-sigvik-ink/5")}
          >
            <MapIcon size={14} /> {t.map}
          </button>
        </div>
        
        <div className="hidden xl:flex gap-8 items-center border-x border-sigvik-line/10 px-8 mx-8">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold uppercase opacity-40 leading-none mb-1">Avg Intent</span>
            <span className="font-mono text-sm font-bold">74.2</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-bold uppercase opacity-40 leading-none mb-1">Market Vol</span>
            <span className="font-mono text-sm font-bold">14.2M SEK</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase opacity-40">Sort:</span>
            <select 
              className="bg-transparent text-[10px] font-bold uppercase outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="intent">{t.intent_score}</option>
              <option value="name">A-Ö</option>
              <option value="debt_low">{t.debt_per_unit} (Low)</option>
              <option value="debt_high">{t.debt_per_unit} (High)</option>
              <option value="year">{t.built_year}</option>
              <option value="signals">{t.new_signals}</option>
            </select>
          </div>
          <div className="h-4 w-px bg-sigvik-line/20" />
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase opacity-60">
            <TrendingUp size={12} /> {t.new_signals}
          </div>
          <div className="h-4 w-px bg-sigvik-line/20" />
          <div className="text-[10px] font-bold uppercase opacity-60">{t.region}</div>
          <button 
            onClick={() => setIsLive(!isLive)}
            className={cn("flex items-center gap-2 text-[10px] font-bold uppercase transition-colors", isLive ? "text-green-600" : "opacity-40")}
          >
            <Radio size={12} className={cn(isLive && "animate-pulse")} /> {isLive ? 'LIVE' : 'OFFLINE'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {view === 'list' ? (
          <div className="flex-1 overflow-y-auto p-8 bg-sigvik-bg/20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="mb-8 flex justify-between items-end">
                  <div>
                    <h2 className="font-serif italic text-4xl tracking-tight">{t.weekly_intelligence}</h2>
                    <p className="text-sm opacity-50 mt-1">{lang === 'sv' ? 'Föreningar med starkast köpsignaler i Malmö-regionen.' : 'Associations with strongest purchase signals in the Malmö region.'}</p>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] uppercase opacity-40 font-bold">Active Signals</span>
                      <span className="font-mono font-bold text-xl">1,402</span>
                    </div>
                    <div className="h-8 w-px bg-sigvik-line/10" />
                    <span className="px-3 py-1.5 bg-sigvik-ink text-sigvik-bg text-[10px] font-mono tracking-widest">B2B ENGINE v4.2</span>
                  </div>
                </div>

                <div className="bg-white border border-sigvik-line shadow-sm overflow-hidden">
                  <div className="grid grid-cols-[40px_1.5fr_1fr_1fr_1fr_60px] p-4 border-b border-sigvik-line/10 bg-sigvik-bg/10">
                    <span className="col-header">#</span>
                    <span className="col-header">BRF</span>
                    <span className="col-header">{t.project_forecast}</span>
                    <span className="col-header">{t.intent_score}</span>
                    <span className="col-header">{t.time_horizon}</span>
                    <span className="col-header"></span>
                  </div>
                  {sortedBrfs.map((brf, i) => (
                    <div 
                      key={brf.id} 
                      onClick={() => setSelectedBrfId(brf.id)}
                      className={cn("data-row grid grid-cols-[40px_1.5fr_1fr_1fr_1fr_60px] items-center p-4", selectedBrfId === brf.id && "bg-sigvik-ink text-sigvik-bg")}
                    >
                      <span className="data-value opacity-30">0{i+1}</span>
                      <div>
                        <div className="font-bold">{brf.name}</div>
                        <div className="text-[10px] font-mono opacity-50 uppercase">{brf.address}, {brf.district}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-sigvik-bg text-[10px] font-bold uppercase text-sigvik-ink border border-sigvik-line/10">
                          {brf.predictedProject}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="data-value font-bold text-lg leading-none">{brf.intentScore}</span>
                        <span className="text-[8px] font-mono opacity-50 mt-1">{brf.signals.length} {t.signals_available}</span>
                      </div>
                      <div className="text-xs font-mono opacity-70">
                        {brf.timeHorizon}
                      </div>
                      <div className="flex justify-end">
                        <ChevronRight size={16} className="opacity-30" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-1 space-y-8">
                <AnimatePresence mode="wait">
                  {selectedBrf ? (
                    <motion.div 
                      key={selectedBrf.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-white border border-sigvik-line shadow-xl flex flex-col h-[600px]"
                    >
                      <div className="p-8 border-b border-sigvik-line/10 bg-sigvik-bg/10">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-2xl font-bold uppercase tracking-tighter">{selectedBrf.name}</h3>
                            <p className="font-mono text-xs opacity-50">{selectedBrf.address}</p>
                          </div>
                          <div className="bg-sigvik-ink text-sigvik-bg px-3 py-1 font-mono text-xs font-bold">
                            {selectedBrf.intentScore}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div className="bg-white p-3 border border-sigvik-line/5">
                            <span className="col-header block mb-1">{t.debt_per_unit}</span>
                            <span className="font-mono text-sm font-bold">{selectedBrf.debtPerUnit.toLocaleString()} kr</span>
                          </div>
                          <div className="bg-white p-3 border border-sigvik-line/5">
                            <span className="col-header block mb-1">{t.built_year}</span>
                            <span className="font-mono text-sm font-bold">{selectedBrf.builtYear}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-8 flex-1 overflow-y-auto space-y-8">
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="col-header">{t.analysis_title}</h4>
                            <span className="text-[10px] font-mono opacity-40 uppercase">{t.confidence_level}: {selectedBrf.signals.length}/6</span>
                          </div>
                          
                          {!analyses[selectedBrf.id] ? (
                            <button 
                              onClick={() => generateAnalysis(selectedBrf)}
                              disabled={isGenerating}
                              className="w-full py-12 border-2 border-dashed border-sigvik-line/20 hover:border-sigvik-ink transition-all flex flex-col items-center justify-center gap-3 group"
                            >
                              <Zap size={24} className={cn("opacity-20 group-hover:opacity-100 group-hover:text-sigvik-accent transition-all", isGenerating && "animate-pulse")} />
                              <span className="text-xs font-bold uppercase tracking-widest">{isGenerating ? t.loading : t.generate_analysis}</span>
                            </button>
                          ) : (
                            <div className="space-y-6">
                              <div className="p-4 bg-sigvik-bg/30 border-l-2 border-sigvik-ink">
                                <span className="text-[10px] font-bold uppercase opacity-40 block mb-2">{t.analysis_title}</span>
                                <p className="font-serif italic text-lg leading-snug tracking-tight">{analyses[selectedBrf.id].project}</p>
                              </div>
                              
                              <div>
                                <span className="text-[10px] font-bold uppercase opacity-40 block mb-2">{t.confidence_level}</span>
                                <p className="text-xs font-mono opacity-80">{analyses[selectedBrf.id].confidence}</p>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold uppercase opacity-40 block mb-2">{t.signal_pattern}</span>
                                <p className="text-sm leading-relaxed opacity-80">{analyses[selectedBrf.id].pattern}</p>
                              </div>

                              <div className="p-4 bg-sigvik-accent/5 border border-sigvik-accent/20">
                                <span className="text-[10px] font-bold uppercase text-sigvik-accent block mb-2">{t.action_recommendation}</span>
                                <p className="text-sm leading-relaxed font-medium">{analyses[selectedBrf.id].recommendation}</p>
                              </div>

                              <div>
                                <span className="text-[10px] font-bold uppercase opacity-40 block mb-2">{t.uncertainty_factors}</span>
                                <p className="text-xs opacity-60 leading-relaxed italic">{analyses[selectedBrf.id].uncertainties}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-[600px] flex flex-col space-y-8">
                      <div className="flex-1 border-2 border-dashed border-sigvik-line/10 flex flex-col items-center justify-center p-12 text-center opacity-30">
                        <Search size={48} className="mb-4" />
                        <p className="font-serif italic text-lg">{t.select_brf}</p>
                      </div>
                      
                      <div className="p-8 bg-white border border-sigvik-line shadow-sm">
                        <h4 className="col-header mb-6">{t.market_insight}</h4>
                        <div className="space-y-4">
                          <div className="flex gap-4 items-start">
                            <div className="p-2 bg-sigvik-bg rounded">
                              <TrendingUp size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-tight">Malmö Trend</p>
                              <p className="text-xs opacity-60 mt-1 leading-relaxed">
                                {lang === 'sv' 
                                  ? 'Ökad frekvens av fönsterbyten i Slottsstaden. 12% fler bygglovsansökningar än föregående kvartal.'
                                  : 'Increased frequency of window replacements in Slottsstaden. 12% more building permit applications than previous quarter.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </AnimatePresence>

                <div className="p-8 bg-white border border-sigvik-line">
                  <h3 className="col-header mb-8">{t.live_signals}</h3>
                  <div className="space-y-8">
                    <AnimatePresence initial={false}>
                      {liveSignals.length > 0 ? liveSignals.map((s, idx) => (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex gap-6 group"
                        >
                          <div className={cn("w-1 h-12 shrink-0", s.weight === 'Primary' ? "bg-sigvik-ink" : "bg-sigvik-ink/10")} />
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest">{s.type}</span>
                              <span className="text-[10px] font-mono opacity-30">{s.date}</span>
                            </div>
                            <p className="text-sm font-serif italic leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{s.description}</p>
                          </div>
                        </motion.div>
                      )) : (
                        <div className="text-xs opacity-40 font-mono italic py-12 text-center">{t.loading}</div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-sigvik-bg/10 relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center opacity-20">
                <MapIcon size={120} strokeWidth={0.5} className="mx-auto mb-4" />
                <p className="font-serif italic text-2xl">{lang === 'sv' ? 'Interaktiv Territoriekarta' : 'Interactive Territory Map'}</p>
                <p className="text-sm font-mono uppercase tracking-widest">{t.loading}</p>
              </div>
            </div>
            
            {MOCK_BRFS.map(brf => (
              <div 
                key={brf.id}
                className="absolute p-2 bg-white border border-sigvik-line shadow-lg cursor-pointer hover:scale-110 transition-transform"
                style={{ 
                  left: `${(brf.coordinates.lng - 12.9) * 2000}px`, 
                  top: `${(55.7 - brf.coordinates.lat) * 2000}px` 
                }}
              >
                <div className="w-3 h-3 bg-sigvik-ink rounded-full mb-1" />
                <div className="text-[8px] font-bold uppercase whitespace-nowrap">{brf.name}</div>
                <div className="text-[10px] font-mono font-bold">{brf.intentScore}</div>
              </div>
            ))}

            <div className="absolute bottom-8 right-8 w-64 bg-white border border-sigvik-line p-4 shadow-xl">
              <h4 className="col-header mb-3">{t.legend}</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
                  <div className="w-3 h-3 bg-sigvik-ink rounded-full" /> {t.high_intent} (70+)
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
                  <div className="w-3 h-3 bg-sigvik-ink/30 rounded-full" /> {t.med_intent} (40-70)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('public');
  const [lang, setLang] = useState<Language>('sv');
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        lang={lang} 
        setLang={setLang} 
        setShowInfo={setShowInfo}
      />
      <main className="flex-1 pb-14 md:pb-0">
        {activeTab === 'public' ? <PublicView lang={lang} /> : <ContractorDashboard lang={lang} />}
      </main>

      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setShowInfo={setShowInfo} 
        lang={lang} 
      />

      <AnimatePresence>
        {showInfo && <InfoModal lang={lang} onClose={() => setShowInfo(false)} />}
      </AnimatePresence>
      
      <footer className="border-t border-sigvik-line p-6 bg-white/50 text-[10px] font-mono uppercase opacity-40 flex justify-between">
        <div>© 2026 SIGVIK AB • {TRANSLATIONS[lang].location}</div>
        <div className="flex gap-6">
          <a href="#" className="hover:opacity-100">{TRANSLATIONS[lang].privacy}</a>
          <a href="#" className="hover:opacity-100">{TRANSLATIONS[lang].terms}</a>
          <a href="#" className="hover:opacity-100">{TRANSLATIONS[lang].gdpr}</a>
        </div>
      </footer>
    </div>
  );
}
