import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Clock, Music } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Karyakram, KaryakramItem } from '../types/database';

export default function KaryakramPerformance() {
  const { id } = useParams<{ id: string }>();
  const [karyakram, setKaryakram] = useState<Karyakram | null>(null);
  const [items, setItems] = useState<KaryakramItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    if (!id) return;
    const { data: kData } = await supabase.from('karyakrams').select('*').eq('id', id).single();
    if (kData) setKaryakram(kData);

    const { data: iData } = await supabase
       .from('karyakram_items')
       .select('*, bandish:bandishes(*, raga:ragas(name, thaat))')
       .eq('karyakram_id', id)
       .order('sequence_order', { ascending: true });
    
    if (iData) setItems(iData);
    setLoading(false);
  }

  const currentItem = items[currentIndex];
  // Helper to safely access bandish data
  const bandish = currentItem?.bandish as any;

  if (loading) return <div className="text-center p-20">Loading Performance Mode...</div>;
  if (!karyakram) return <div>Not found</div>;

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white overflow-y-auto">
        {/* Top Bar */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between">
            <div>
                <h1 className="text-lg font-bold text-slate-200">{karyakram.title}</h1>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Clock size={12} /> Live Performance Mode
                </p>
            </div>
            
            <div className="flex items-center gap-4">
                 <div className="text-sm font-mono text-emerald-500">
                    {currentIndex + 1} / {items.length}
                 </div>
                 <Link to={`/karyakrams/${id}`} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                    <X size={24} />
                 </Link>
            </div>
        </div>

        {items.length === 0 ? (
            <div className="h-[80vh] flex flex-col items-center justify-center text-slate-500">
                <Music size={48} className="mb-4 opacity-50" />
                <p>No songs in this setlist yet.</p>
            </div>
        ) : (
            <div className="max-w-4xl mx-auto p-6 space-y-8 pb-32">
                 
                 {/* Song Content */}
                 <div className="space-y-6">
                    <div className="text-center space-y-2">
                        <span className="inline-block px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-sm text-slate-400 font-medium uppercase tracking-widest">
                            {bandish?.raga?.name}
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-tight">
                            {bandish?.title}
                        </h2>
                        <div className="flex justify-center gap-4 text-slate-400 text-lg">
                             <span>{bandish?.type}</span>
                             <span>•</span>
                             <span>{bandish?.tala}</span>
                             <span>•</span>
                             <span>{bandish?.tempo}</span>
                        </div>
                    </div>

                    {bandish?.lyrics && (
                        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 text-center">
                            <p className="text-2xl md:text-3xl leading-relaxed font-serif text-slate-200 whitespace-pre-wrap">
                                {bandish.lyrics}
                            </p>
                        </div>
                    )}

                    {bandish?.notation_image_url && (
                        <div className="mt-8">
                            <img 
                                src={bandish.notation_image_url} 
                                alt="Notation" 
                                className="w-full rounded-xl border border-slate-800 select-none pointer-events-none"
                            />
                        </div>
                    )}
                    
                     {bandish?.audio_url && (
                        <div className="flex justify-center mt-8">
                            <audio controls src={bandish.audio_url} className="w-full max-w-md rounded-lg" />
                        </div>
                    )}
                 </div>

            </div>
        )}

        {/* Bottom Controls */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent">
             <div className="max-w-md mx-auto flex items-center justify-between gap-8">
                 <button 
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="p-4 rounded-full bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                 >
                    <ChevronLeft size={32} />
                 </button>
                 
                 <div className="text-center">
                    <div className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">Up Next</div>
                    <div className="text-sm font-medium text-slate-300 truncate max-w-[200px]">
                        {items[currentIndex + 1] ? items[currentIndex + 1].bandish?.title : 'End of Set'}
                    </div>
                 </div>

                 <button 
                    onClick={() => setCurrentIndex(prev => Math.min(items.length - 1, prev + 1))}
                    disabled={currentIndex === items.length - 1}
                    className="p-4 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-slate-900 disabled:text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xl shadow-emerald-900/50"
                 >
                    <ChevronRight size={32} />
                 </button>
             </div>
        </div>
    </div>
  );
}
