import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, Plus, ArrowUp, ArrowDown, Trash2, Play, Music, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Karyakram, KaryakramItem } from '../types/database';

export default function KaryakramPlanner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const [details, setDetails] = useState<Partial<Karyakram>>({
    title: '',
    status: 'planned',
    date: new Date().toISOString().split('T')[0],
    venue: '',
    notes: ''
  });

  const [items, setItems] = useState<KaryakramItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      fetchKaryakram();
    }
  }, [id]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
       if (searchTerm.length < 2) {
         setSearchResults([]);
         return;
       }
       if (!import.meta.env.VITE_SUPABASE_URL) return;

       const { data } = await supabase
         .from('bandishes')
         .select('id, title, type, raga:ragas(name)')
         .ilike('title', `%${searchTerm}%`)
         .limit(5);
       
       setSearchResults(data || []);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  async function fetchKaryakram() {
    if (!id) return;
    const { data: kData } = await supabase.from('karyakrams').select('*').eq('id', id).single();
    if (kData) setDetails(kData);

    const { data: iData } = await supabase
       .from('karyakram_items')
       .select('*, bandish:bandishes(id, title, type, raga:ragas(name))')
       .eq('karyakram_id', id)
       .order('sequence_order', { ascending: true });
    
    if (iData) setItems(iData);
  }

  const handleCreate = async () => {
    setSaving(true);
    const { data, error } = await supabase
      .from('karyakrams')
      .insert([details])
      .select()
      .single();
    
    if (!error && data) {
      navigate(`/karyakrams/${data.id}`);
    } else {
        alert('Error creating karyakram');
    }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!id) return;
    setSaving(true);
    await supabase.from('karyakrams').update(details).eq('id', id);
    
    // items are updated individually, so just stop saving
    setSaving(false);
    alert('Details saved!');
  };

  const addItem = async (bandish: any) => {
    if (!id) return;
    
    const newOrder = items.length + 1;
    const newItem = {
        karyakram_id: id,
        bandish_id: bandish.id,
        sequence_order: newOrder,
        bandish: bandish // optimistic UI
    };
    
    // Optimistic update
    setItems([...items, newItem as any]);
    setSearchTerm('');
    setSearchResults([]);

    await supabase.from('karyakram_items').insert({
        karyakram_id: id,
        bandish_id: bandish.id,
        sequence_order: newOrder
    });
    
    // Refresh to ensure ID is correct
    fetchKaryakram();
  };

  const removeItem = async (itemId: string) => {
    const newItems = items.filter(i => i.id !== itemId);
    setItems(newItems);
    await supabase.from('karyakram_items').delete().eq('id', itemId);
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    // Update sequence numbers locally
    newItems.forEach((item, idx) => item.sequence_order = idx + 1);
    setItems(newItems);

    // Persist all changes (simpler than selective update)
    // In a real app, maybe batch this. Here we loop.
    for (const item of newItems) {
        if(item.id) {
            await supabase.from('karyakram_items').update({ sequence_order: item.sequence_order }).eq('id', item.id);
        }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {isNew ? 'New Karyakram' : 'Plan Karyakram'}
            </h1>
            
            {!isNew && (
                <div className="flex flex-col sm:flex-row gap-3">
                     <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
                     >
                        <Save size={18} />
                        Save Details
                     </button>
                     <Link
                        to={`/karyakrams/${id}/perform`}
                        className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                     >
                        <Play size={18} fill="currentColor" />
                        Performance Mode
                     </Link>
                </div>
            )}
        </div>

        {/* Details Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Title</label>
                <input 
                    type="text" 
                    value={details.title}
                    onChange={e => setDetails({...details, title: e.target.value})}
                    placeholder="e.g. Diwali Baithak 2024"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 focus:outline-none focus:border-purple-500 transition-colors"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Date</label>
                <input 
                    type="date" // Native date picker is easiest for mobile
                    value={details.date ? details.date.split('T')[0] : ''}
                    onChange={e => setDetails({...details, date: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 focus:outline-none focus:border-purple-500 transition-colors text-white"
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Venue</label>
                <input 
                    type="text" 
                    value={details.venue || ''}
                    onChange={e => setDetails({...details, venue: e.target.value})}
                    placeholder="e.g. Home, Community Hall"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 focus:outline-none focus:border-purple-500 transition-colors"
                />
            </div>
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Status</label>
                <select 
                    value={details.status}
                    onChange={e => setDetails({...details, status: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 focus:outline-none focus:border-purple-500 transition-colors text-white"
                >
                    <option value="planned">Planned</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
            
             <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-slate-400">Notes</label>
                <textarea 
                    value={details.notes || ''}
                    onChange={e => setDetails({...details, notes: e.target.value})}
                    placeholder="General notes about the event..."
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
            </div>

            {isNew && (
                <div className="col-span-1 md:col-span-2 flex justify-end">
                    <button 
                        onClick={handleCreate}
                        disabled={!details.title || saving}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Creating...' : 'Create Karyakram'}
                    </button>
                </div>
            )}
        </div>

        {/* Setlist Builder (Only visible if not new) */}
        {!isNew && (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Music size={24} className="text-purple-400" />
                    Setlist
                </h2>

                {/* Add Item Search */}
                <div className="relative z-20">
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 focus-within:border-purple-500 transition-colors">
                        <Search className="ml-3 text-slate-500" size={20} />
                        <input 
                            type="text"
                            placeholder="Search bandishes to add..."
                            className="w-full bg-transparent p-3 focus:outline-none text-white placeholder-slate-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2">
                            {searchResults.map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => addItem(b)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0 text-left"
                                >
                                    <div>
                                        <div className="font-bold text-white">{b.title}</div>
                                        <div className="text-xs text-slate-400">{b.raga?.name} • {b.type}</div>
                                    </div>
                                    <Plus size={18} className="text-emerald-500" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* List of Items */}
                <div className="space-y-3">
                    {items.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                            Add some bandishes to start building your setlist!
                        </div>
                    ) : (
                        items.map((item, index) => (
                            <div key={item.id || index} className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 rounded-xl p-4 group hover:bg-slate-900 transition-colors">
                                <span className="text-2xl font-bold text-slate-700 w-8 text-center">{index + 1}</span>
                                
                                <div className="flex-1">
                                    <h3 className="font-bold text-white text-lg">{item.bandish?.title}</h3>
                                    <p className="text-sm text-slate-400">{(item.bandish as any)?.raga?.name} • {(item.bandish as any)?.type}</p>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => moveItem(index, 'up')}
                                        disabled={index === 0}
                                        className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30"
                                    >
                                        <ArrowUp size={18} />
                                    </button>
                                    <button 
                                        onClick={() => moveItem(index, 'down')}
                                        disabled={index === items.length - 1}
                                        className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30"
                                    >
                                        <ArrowDown size={18} />
                                    </button>
                                    <div className="w-px h-6 bg-slate-800 mx-2"></div>
                                    <button 
                                        onClick={() => item.id && removeItem(item.id)}
                                        className="p-2 hover:bg-red-500/10 rounded text-slate-400 hover:text-red-400"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}
    </div>
  );
}
