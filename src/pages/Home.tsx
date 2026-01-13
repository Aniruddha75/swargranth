import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Plus, Library, FileText, ListMusic, Book, Music, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

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
      if (search.length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      const term = `%${search}%`;
      if (!import.meta.env.VITE_SUPABASE_URL) return;
      
      // Fetch Ragas
      const { data: ragas } = await supabase
        .from('ragas')
        .select('id, name, type:thaat')
        .ilike('name', term)
        .limit(3);

      // Fetch Bandishes
      const { data: bandishes } = await supabase
        .from('bandishes')
        .select('id, title, raga_id, type')
        .ilike('title', term)
        .limit(3);

      const results = [
        ...(ragas || []).map(r => ({ ...r, category: 'Raga', link: `/ragas/${r.id}` })),
        ...(bandishes || []).map(b => ({ ...b, category: 'Bandish', link: `/notes?search=${encodeURIComponent(b.title)}` }))
      ];

      setSearchResults(results);
      setShowDropdown(true);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/notes?search=${encodeURIComponent(search)}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-start pt-4 md:pt-0 md:justify-center md:min-h-[80vh] space-y-4 md:space-y-12">
      
      <div className="text-center space-y-4">
        {/* Title - Hidden on mobile, shown on desktop */}
        <h1 className="hidden md:block text-7xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent pb-2">
          Swar Granth
        </h1>
        {/* Hidden on small screens to save space */}
        <p className="text-lg md:text-xl text-slate-400 hidden md:block">Your personal universe of Ragas and Notes.</p>
      </div>

      {/* 1) Prominent Search Bar with Dropdown */}
      <div className="w-full max-w-2xl relative group z-20" ref={searchRef}>
        <form onSubmit={handleSearch} className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors" size={28} />
            <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-16 pr-6 py-4 md:py-6 text-lg md:text-xl text-white placeholder-slate-500 focus:outline-none focus:bg-slate-950 transition-colors shadow-2xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => search.length >= 2 && setShowDropdown(true)}
            />
            </div>
        </form>

        {/* Instant Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
                {searchResults.map((result, idx) => (
                    <Link 
                        key={`${result.category}-${result.id}-${idx}`} 
                        to={result.link}
                        className="flex items-center justify-between p-4 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0 text-left"
                    >
                        <div>
                            <div className="font-medium text-slate-200 text-lg">{result.name || result.title}</div>
                            <div className="text-sm text-slate-500">{result.category} • {result.type}</div>
                        </div>
                        <span className="text-xs text-slate-600">Jump ↵</span>
                    </Link>
                ))}
            </div>
        )}
      </div>

      {/* Buttons Grid - 2 per row on mobile now */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6 w-full max-w-3xl">
         {/* 2) Add Raga */}
         <Link to="/ragas/new" className="group p-3 md:p-6 bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 rounded-2xl flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 transition-all hover:bg-slate-900 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 text-center md:text-left">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
               <Plus size={24} className="md:w-8 md:h-8" />
            </div>
            <div>
               <h3 className="text-sm md:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Add Raga</h3>
               <p className="text-slate-500 text-[10px] md:text-sm hidden md:block">Create a new Raga entry</p>
            </div>
         </Link>

         {/* 3) Add Bandish */}
         <Link to="/notes/new" className="group p-3 md:p-6 bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 rounded-2xl flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 transition-all hover:bg-slate-900 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1 text-center md:text-left">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
               <FileText size={24} className="md:w-8 md:h-8" />
            </div>
            <div>
               <h3 className="text-sm md:text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">Add Bandish</h3>
               <p className="text-slate-500 text-[10px] md:text-sm hidden md:block">Add compositions to a raag</p>
            </div>
         </Link>

         {/* 4) View Ragas */}
         <Link to="/ragas" className="group p-3 md:p-6 bg-slate-900/50 border border-slate-800 hover:border-purple-500/50 rounded-2xl flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 transition-all hover:bg-slate-900 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 text-center md:text-left">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
               <Library size={24} className="md:w-8 md:h-8" />
            </div>
            <div>
               <h3 className="text-sm md:text-lg font-bold text-white group-hover:text-purple-400 transition-colors">View Ragas</h3>
               <p className="text-slate-500 text-[10px] md:text-sm hidden md:block">Browse your collection</p>
            </div>
         </Link>

         {/* 5) View Bandish Library */}
         <Link to="/notes" className="group p-3 md:p-6 bg-slate-900/50 border border-slate-800 hover:border-pink-500/50 rounded-2xl flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 transition-all hover:bg-slate-900 hover:shadow-lg hover:shadow-pink-500/10 hover:-translate-y-1 text-center md:text-left">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
               <ListMusic size={24} className="md:w-8 md:h-8" />
            </div>
            <div>
               <h3 className="text-sm md:text-lg font-bold text-white group-hover:text-pink-400 transition-colors">View Bandishes</h3>
               <p className="text-slate-500 text-[10px] md:text-sm hidden md:block">See all compositions</p>
            </div>
         </Link>

         {/* 6) My Diary */}
         <Link to="/diary" className="group p-3 md:p-6 bg-slate-900/50 border border-slate-800 hover:border-amber-500/50 rounded-2xl flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 transition-all hover:bg-slate-900 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 text-center md:text-left">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
               <Book size={24} className="md:w-8 md:h-8" />
            </div>
            <div>
               <h3 className="text-sm md:text-lg font-bold text-white group-hover:text-amber-400 transition-colors">My Diary</h3>
               <p className="text-slate-500 text-[10px] md:text-sm hidden md:block">Personal notes & thoughts</p>
            </div>
         </Link>

         {/* 7) Swara Search */}
         <Link to="/search/swara" className="group p-3 md:p-6 bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 rounded-2xl flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 transition-all hover:bg-slate-900 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 text-center md:text-left">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
               <Music size={24} className="md:w-8 md:h-8" />
            </div>
            <div>
               <h3 className="text-sm md:text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Swara Search</h3>
               <p className="text-slate-500 text-[10px] md:text-sm hidden md:block">Find Ragas by notes</p>
            </div>
         </Link>

          {/* 8) New Karyakram */}
          <Link to="/karyakrams" className="group p-3 md:p-6 bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 rounded-2xl flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 transition-all hover:bg-slate-900 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 text-center md:text-left">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
               <Calendar size={24} className="md:w-8 md:h-8" />
            </div>
            <div>
               <h3 className="text-sm md:text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">Plan Karyakram</h3>
               <p className="text-slate-500 text-[10px] md:text-sm hidden md:block">Organize your Mehfils</p>
            </div>
         </Link>
      </div>

    </div>
  );
}
