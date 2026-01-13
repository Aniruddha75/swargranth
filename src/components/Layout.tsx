import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Music, Search, X, Menu } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import bgImage from '../assets/BG.png';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (globalSearch.length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      const term = `%${globalSearch}%`;
      
      if (!import.meta.env.VITE_SUPABASE_URL) return;

      // Fetch Ragas
      const { data: ragas } = await supabase
        .from('ragas')
        .select('id, name, type:thaat')
        .ilike('name', term)
        .limit(5);

      // Fetch Bandishes
      const { data: bandishes } = await supabase
        .from('bandishes')
        .select('id, title, raga_id, type')
        .ilike('title', term)
        .limit(5);

      const results = [
        ...(ragas || []).map(r => ({ ...r, category: 'Raga', link: `/ragas/${r.id}` })),
        ...(bandishes || []).map(b => ({ ...b, category: 'Bandish', link: `/notes?search=${encodeURIComponent(b.title)}` }))
      ];

      setSearchResults(results);
      setShowDropdown(true);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [globalSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      setShowDropdown(false);
      navigate(`/notes?search=${encodeURIComponent(globalSearch)}`); 
    }
  };

  const clearSearch = () => {
    setGlobalSearch('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 bg-cover bg-center bg-fixed bg-no-repeat relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
        {/* Dark Overlay for readability */}
        <div className="absolute inset-0 bg-slate-950/80 fixed pointer-events-none z-0"></div>
        
        <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                
                <Link to="/" className="flex items-center gap-2 group">
                    <Music className="text-emerald-500 group-hover:rotate-12 transition-transform" size={28} />
                    <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        स्वरग्रंथ
                    </span>
                </Link>

                {/* Desktop Search */}
                <div className="hidden md:block flex-1 max-w-md relative" ref={searchRef}>
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="text"
                            placeholder="Search ragas, bandishes..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            onFocus={() => globalSearch.length >= 2 && setShowDropdown(true)}
                        />
                         {globalSearch && (
                            <button 
                                type="button"
                                onClick={clearSearch} 
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </form>
                    
                    {/* Instant Search Results Dropdown */}
                    {showDropdown && searchResults.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
                             {searchResults.map((result, idx) => (
                                <Link 
                                    key={`${result.category}-${result.id}-${idx}`} 
                                    to={result.link}
                                    onClick={() => setShowDropdown(false)}
                                    className="flex items-center justify-between p-3 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0"
                                >
                                    <div>
                                        <div className="font-medium text-slate-200">{result.name || result.title}</div>
                                        <div className="text-xs text-slate-500">{result.category} • {result.type}</div>
                                    </div>
                                    <span className="text-xs text-slate-600">Jump to ↵</span>
                                </Link>
                            ))}
                            <div 
                                onClick={(e) => handleSearch(e as any)}
                                className="p-2 text-center text-xs text-emerald-400 bg-slate-950 cursor-pointer hover:bg-slate-900"
                            >
                                View all results for "{globalSearch}"
                            </div>
                        </div>
                    )}
                </div>
            
                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link to="/ragas" className="text-slate-400 hover:text-white transition-colors">Ragas</Link>
                    <Link to="/notes" className="text-slate-400 hover:text-white transition-colors">Bandishes</Link>
                    <Link to="/karyakrams" className="text-slate-400 hover:text-emerald-400 transition-colors">Karyakram</Link>
                    <Link to="/diary" className="text-slate-400 hover:text-amber-400 transition-colors">Diary</Link>
                    <Link to="/search/swara" className="text-slate-400 hover:text-pink-400 transition-colors">Swara Search</Link>
                </nav>

                {/* Mobile Menu Toggle */}
                <button 
                  className="md:hidden text-slate-400 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isMobileMenuOpen && (
              <div className="md:hidden bg-slate-950 border-t border-slate-900 p-4 space-y-4 animate-in slide-in-from-top-4">
                 <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-3 pl-9 pr-4 text-base focus:outline-none focus:border-emerald-500 transition-colors"
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                        />
                  </form>
                  <nav className="flex flex-col space-y-2">
                    <Link to="/ragas" className="block px-4 py-3 rounded-lg bg-slate-900/50 hover:bg-slate-900 text-slate-300 hover:text-white">Ragas</Link>
                    <Link to="/notes" className="block px-4 py-3 rounded-lg bg-slate-900/50 hover:bg-slate-900 text-slate-300 hover:text-white">Bandishes</Link>
                    <Link to="/karyakrams" className="block px-4 py-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400">Karyakram</Link>
                    <Link to="/diary" className="block px-4 py-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400">Diary</Link>
                    <Link to="/search/swara" className="block px-4 py-3 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400">Swara Search</Link>
                  </nav>
              </div>
            )}
        </header>

        <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto relative z-10">
            <Outlet />
        </main>
    </div>
  );
}
