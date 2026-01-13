import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Calendar } from 'lucide-react';
import type { DiaryEntry } from '../types/database';

export default function DiaryList() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    if (!import.meta.env.VITE_SUPABASE_URL) {
       setEntries([]);
       setLoading(false);
       return;
    }
    const { data } = await supabase.from('diary_entries').select('*').order('created_at', { ascending: false });
    if (data) setEntries(data);
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">My Diary</h2>
           <p className="text-slate-400 mt-1">Reflections, learnings, and musical journey</p>
        </div>
        <Link to="/diary/new" className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
           <Plus size={18} />
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading diary...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {entries.map(entry => (
                <div key={entry.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-amber-500/30 transition-colors flex flex-col">
                    {entry.image_url && (
                        <div className="h-48 w-full overflow-hidden">
                            <img src={entry.image_url} alt={entry.title} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                        </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-xs text-amber-500 mb-2">
                            <Calendar size={12} />
                            {new Date(entry.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{entry.title}</h3>
                        <p className="text-slate-400 text-sm line-clamp-4 leading-relaxed whitespace-pre-wrap flex-1">{entry.content}</p>
                    </div>
                </div>
            ))}
             {entries.length === 0 && (
                <div className="col-span-full text-center py-16 text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No entries yet. Start writing your musical journey!</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
}
