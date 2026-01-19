import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Plus, Music, Trash2, Filter, X } from 'lucide-react';
import BandishDetail from '../components/BandishDetail';

export default function BandishList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bandishes, setBandishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBandish, setSelectedBandish] = useState<any>(null);
  
  // Initialize from URL param
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  
  // Filter state
  const [composerFilter, setComposerFilter] = useState('');
  const [talaFilter, setTalaFilter] = useState('');
  const [tempoFilter, setTempoFilter] = useState('');

  useEffect(() => {
    // Sync local state if URL changes (e.g. from global search)
    const query = searchParams.get('search') || '';
    setSearchTerm(query);
  }, [searchParams]);

  useEffect(() => {
    // Update URL when typing (debounced ideally, but simple here)
    if (searchTerm) {
        setSearchParams({ search: searchTerm });
    } else {
        setSearchParams({});
    }
  }, [searchTerm, setSearchParams]);

  useEffect(() => {
    loadBandishes();
  }, []);

  async function loadBandishes() {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setBandishes([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('bandishes')
      .select('*, ragas(name)')
      .order('created_at', { ascending: false }); // Newest first
      
    if (data) setBandishes(data);
    setLoading(false);
  }

  // Extract unique values for filters (case-insensitive normalization)
  const uniqueComposers: string[] = Array.from<string>(
    bandishes.reduce((acc: Map<string, string>, b) => {
      const val = b.composer?.trim();
      if (val && !acc.has(val.toLowerCase())) acc.set(val.toLowerCase(), val);
      return acc;
    }, new Map<string, string>()).values()
  ).sort();

  const uniqueTalas: string[] = Array.from<string>(
    bandishes.reduce((acc: Map<string, string>, b) => {
      const val = b.tala?.trim();
      if (val && !acc.has(val.toLowerCase())) acc.set(val.toLowerCase(), val);
      return acc;
    }, new Map<string, string>()).values()
  ).sort();

  const uniqueTempos: string[] = Array.from<string>(new Set(bandishes.map(b => b.tempo).filter(Boolean))).sort();
  
  const filtered = bandishes.filter(b => {
    const term = searchTerm.toLowerCase();
    const ragaName = b.ragas?.name?.toLowerCase() || '';
    const title = b.title?.toLowerCase() || '';
    const lyrics = b.lyrics?.toLowerCase() || '';
    const composer = b.composer?.toLowerCase() || '';
    const tala = b.tala?.toLowerCase() || '';
    
    // Search filter
    const matchesSearch = !term || 
      title.includes(term) || 
      ragaName.includes(term) || 
      lyrics.includes(term) ||
      composer.includes(term) ||
      tala.includes(term);
    
    // Attribute filters
    const matchesComposer = !composerFilter || b.composer === composerFilter;
    const matchesTala = !talaFilter || b.tala === talaFilter;
    const matchesTempo = !tempoFilter || b.tempo === tempoFilter;
    
    return matchesSearch && matchesComposer && matchesTala && matchesTempo;
  });
  
  const clearFilters = () => {
    setComposerFilter('');
    setTalaFilter('');
    setTempoFilter('');
  };
  
  const hasActiveFilters = composerFilter || talaFilter || tempoFilter;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Bandish Library</h2>
            <p className="text-slate-400 mt-1">Manage your compositions</p>
         </div>
         <Link to="/notes/new" className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus size={18} />
            <span>Add Bandish</span>
         </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by title, raga, or lyrics..." 
          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Filter size={16} className="text-cyan-400" />
            Filters
          </h3>
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <X size={14} />
              Clear All
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Composer</label>
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
              value={composerFilter}
              onChange={(e) => setComposerFilter(e.target.value)}
            >
              <option value="">All Composers</option>
              {uniqueComposers.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Tala</label>
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
              value={talaFilter}
              onChange={(e) => setTalaFilter(e.target.value)}
            >
              <option value="">All Talas</option>
              {uniqueTalas.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Tempo</label>
            <select 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
              value={tempoFilter}
              onChange={(e) => setTempoFilter(e.target.value)}
            >
              <option value="">All Tempos</option>
              {uniqueTempos.map(t => (
                <option key={t} value={t}>{t?.charAt(0).toUpperCase() + t?.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading bandishes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((b, i) => (
            <div 
              key={i} 
              onClick={() => setSelectedBandish(b)}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/50 transition-colors flex flex-col h-full relative group cursor-pointer active:scale-[0.98]"
            >
                <button
                    onClick={async (e) => {
                        e.preventDefault();
                        if (window.confirm('Delete this bandish?')) {
                            const { error } = await supabase.from('bandishes').delete().eq('id', b.id);
                            if (!error) loadBandishes();
                        }
                    }}
                    className="absolute top-4 right-4 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                    <Trash2 size={16} />
                </button>

                <div className="flex justify-between items-start mb-2 gap-2 pr-6">
                    <div className="flex-1">
                        <h3 className="font-bold text-white text-lg line-clamp-1" title={b.title}>{b.title}</h3>
                        {b.ragas?.name && (
                            <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                                <Music size={12} /> Raga {b.ragas.name}
                            </span>
                        )}
                    </div>
                </div>
                 <div className="mb-2 flex gap-2">
                    <span className="text-[10px] uppercase bg-slate-950 px-2 py-1 rounded text-slate-500 font-bold whitespace-nowrap">{b.type?.replace('_', ' ')}</span>
                    {b.composer && <span className="text-[10px] bg-slate-950 px-2 py-1 rounded text-slate-400 border border-slate-800">By {b.composer}</span>}
                 </div>
                
                {b.lyrics && (
                    <p className="text-slate-400 text-sm line-clamp-4 mb-4 whitespace-pre-wrap flex-1 bg-slate-950/30 p-2 rounded-lg border border-slate-800/50">
                        {b.lyrics}
                    </p>
                )}
                
                {!b.lyrics && <div className="flex-1"></div>}

                <div className="flex gap-2 mt-4 text-xs pt-4 border-t border-slate-800 flex-wrap">
                    {b.audio_url && <a href={b.audio_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Audio</a>}
                    
                    {b.notation_image_url && (
                        <div className="w-full mt-2">
                             <img src={b.notation_image_url} alt="Notation" className="w-full h-auto rounded-lg border border-slate-800" />
                        </div>
                    )}

                    {!b.audio_url && !b.notation_image_url && <span className="text-slate-600 italic">No media attached</span>}
                </div>
            </div>
            ))}
            {filtered.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                    No notes found matching "{searchTerm}"
                </div>
            )}
        </div>
      )}
      
      {selectedBandish && (
        <BandishDetail 
          bandish={selectedBandish} 
          onClose={() => setSelectedBandish(null)} 
        />
      )}
    </div>
  );
}
