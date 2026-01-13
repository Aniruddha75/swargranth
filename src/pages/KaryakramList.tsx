import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, MapPin, Music2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Karyakram } from '../types/database';

export default function KaryakramList() {
  const [karyakrams, setKaryakrams] = useState<Karyakram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKaryakrams();
  }, []);

  async function fetchKaryakrams() {
    if (!import.meta.env.VITE_SUPABASE_URL) {
       setLoading(false);
       return;
    }
    
    const { data, error } = await supabase
      .from('karyakrams')
      .select('*')
      .order('date', { ascending: true }); // Upcoming first

    if (!error && data) {
      setKaryakrams(data);
    }
    setLoading(false);
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this Karyakram?')) return;

    const { error } = await supabase
      .from('karyakrams')
      .delete()
      .eq('id', id);

    if (!error) {
      setKaryakrams(prev => prev.filter(k => k.id !== id));
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Date TBD';
    return new Date(dateStr).toLocaleDateString(undefined, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Karyakrams
          </h1>
          <p className="text-slate-400 mt-1">Plan and manage your upcoming performances</p>
        </div>
        <Link 
          to="/karyakrams/new" 
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
        >
          <Plus size={20} />
          Plan New Karyakram
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-900/50 rounded-xl animate-pulse" />)}
        </div>
      ) : karyakrams.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
          <Calendar className="mx-auto h-16 w-16 text-slate-600 mb-4" />
          <h3 className="text-xl font-medium text-slate-300">No Karyakrams Planned</h3>
          <p className="text-slate-500 mt-2">Start planning your next mehfil or concert!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {karyakrams.map((k) => (
            <div key={k.id} className="relative group bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5">
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                  onClick={(e) => { e.preventDefault(); handleDelete(k.id); }}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete Karyakram"
                 >
                    <Trash2 size={18} />
                 </button>
              </div>

              <Link to={`/karyakrams/${k.id}`} className="block space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{k.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                     <Calendar size={14} className="text-emerald-500" />
                     <span>{formatDate(k.date)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                       <MapPin size={14} className="text-cyan-500" />
                       <span className="truncate">{k.venue || 'No venue set'}</span>
                    </div>
                </div>

                <div className="pt-2">
                   <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                      k.status === 'completed' ? 'bg-slate-800 text-slate-500' :
                      k.status === 'draft' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-emerald-500/10 text-emerald-500'
                   }`}>
                      {k.status}
                   </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
