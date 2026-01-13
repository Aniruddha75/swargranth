import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { ragaService } from '../services/ragaService';
import type { Raga } from '../types/database';

export default function RagaList() {
  const [ragas, setRagas] = useState<Raga[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRagas();
  }, []);

  async function loadRagas() {
    const { data } = await ragaService.getAll();
    if (data) setRagas(data);
    setLoading(false);
  }

  const filteredRagas = ragas.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.thaat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Ragas</h2>
           <p className="text-slate-400 mt-1">Collection of {ragas.length} ragas</p>
        </div>
        <Link to="/ragas/new" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={18} />
          <span>Add Raga</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name or thaat..." 
          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading ragas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRagas.map(raga => (
            <Link key={raga.id} to={`/ragas/${raga.id}`}>
              <div className="group p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10 h-full flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">{raga.name}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">{raga.thaat}</span>
                </div>
                <p className="text-slate-400 text-sm mb-4 line-clamp-3 flex-1">{raga.description}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-800">
                  <span>🕒 {raga.time}</span>
                </div>
              </div>
            </Link>
          ))}
          
          {filteredRagas.length === 0 && (
             <div className="col-span-full text-center py-12 text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                No ragas found matching "{searchTerm}"
             </div>
          )}
        </div>
      )}
    </div>
  );
}
