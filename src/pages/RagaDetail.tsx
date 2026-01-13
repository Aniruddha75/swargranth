import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Music2 } from 'lucide-react';
import { ragaService } from '../services/ragaService';
import type { Raga } from '../types/database';

export default function RagaDetail() {
  const { id } = useParams<{ id: string }>();
  const [raga, setRaga] = useState<Raga | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRaga() {
      if (!id) return;
      const { data } = await ragaService.getById(id);
      if (data) setRaga(data);
      setLoading(false);
    }
    loadRaga();
  }, [id]);

  if (loading) return <div className="text-center py-12 text-slate-500">Loading details...</div>;
  if (!raga) return <div className="text-center py-12 text-red-400">Raga not found</div>;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <Link to="/ragas" className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors">
        <ArrowLeft size={16} /> Back to Ragas
      </Link>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
             <h1 className="text-4xl font-bold text-white mb-2">{raga.name}</h1>
             <p className="text-xl text-emerald-400">{raga.thaat} Thaat</p>
           </div>
           <div className="flex gap-4 items-center">
             <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 flex items-center gap-2 text-slate-300">
               <Clock size={18} className="text-emerald-500" />
               <span>{raga.time}</span>
             </div>
             <button 
                onClick={async () => {
                   if (window.confirm('Are you sure you want to delete this Raga? This cannot be undone.')) {
                      await ragaService.delete(raga.id);
                      window.location.href = '/ragas';
                   }
                }}
                className="bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 px-3 py-2 rounded-lg transition-colors"
             >
                Delete
             </button>
           </div>
        </div>
        
        <p className="text-slate-300 leading-relaxed text-lg">{raga.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Technical Details Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Music2 size={20} className="text-emerald-500" />
            Structure
          </h3>
          
          <div className="space-y-3">
             <div>
               <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Aroha</label>
               <p className="text-slate-200 font-mono text-lg">{raga.aroha}</p>
             </div>
             <div>
               <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Avroha</label>
               <p className="text-slate-200 font-mono text-lg">{raga.avroha}</p>
             </div>
             <div>
               <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Pakad</label>
               <p className="text-emerald-300 font-mono text-lg">{raga.pakad}</p>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
             <div>
               <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Vadi</label>
               <p className="text-slate-200 font-medium">{raga.vadi}</p>
             </div>
             <div>
               <label className="text-xs uppercase text-slate-500 font-bold tracking-wider">Samvadi</label>
               <p className="text-slate-200 font-medium">{raga.samvadi}</p>
             </div>
          </div>
        </div>

        {/* Bandishes Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xl">🎵</div>
                <h3 className="text-xl font-semibold text-white">Compositions (Bandishes)</h3>
             </div>
             <Link 
               to={`/notes/new?ragaId=${raga.id}`}
               className="text-emerald-400 hover:text-emerald-300 text-sm font-medium border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
             >
               + Add Composition
             </Link>
           </div>
           
           {(raga as any).bandishes?.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {(raga as any).bandishes.map((b: any, i: number) => (
                      <div key={i} className="bg-slate-950/50 rounded-lg p-4 border border-slate-800 hover:border-emerald-500/50 transition-colors group relative">
                          <Link to={`/notes?search=${encodeURIComponent(b.title)}`} className="absolute inset-0 z-0" />
                          
                          <div className="flex justify-between items-start mb-2 relative z-10 pointer-events-none">
                             <h4 className="font-bold text-cyan-400 group-hover:text-emerald-400 transition-colors">{b.title}</h4>
                             <span className="text-xs uppercase bg-slate-900 px-2 py-1 rounded text-slate-500 font-bold tracking-wider">{b.type}</span>
                          </div>
                          <div className="flex gap-2 text-xs text-slate-400 mb-3 relative z-10 pointer-events-none">
                              <span>🎼 {b.tala || 'Tala N/A'}</span>
                              <span>•</span>
                              <span>Running: {b.tempo}</span>
                          </div>
                          {b.lyrics && <p className="text-sm text-slate-300 italic mb-3 relative z-10 pointer-events-none">"{b.lyrics.substring(0, 60)}..."</p>}
                          
                          <div className="flex gap-2 mt-auto relative z-20">
                              {b.audio_url && (
                                <a href={b.audio_url} target="_blank" rel="noreferrer" className="flex-1 text-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs py-2 rounded transition-colors">
                                  ▶ Play Audio
                                </a>
                              )}
                              {b.notation_image_url && (
                                <a href={b.notation_image_url} target="_blank" rel="noreferrer" className="flex-1 text-center bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs py-2 rounded transition-colors">
                                  📝 Notation
                                </a>
                              )}
                          </div>
                      </div>
                  ))}
               </div>
           ) : (
                <div className="text-center py-8 text-slate-500">
                    <p>No compositions added yet.</p>
                </div>
           )}
        </div>
      </div>
    </div>
  );
}
