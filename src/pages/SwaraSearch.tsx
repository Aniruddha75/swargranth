import { useState } from 'react';
import { Link } from 'react-router-dom';
import SwaraKeyboard from '../components/SwaraKeyboard';
import { supabase } from '../lib/supabase';
import { Search } from 'lucide-react';
import type { Raga } from '../types/database';

export default function SwaraSearch() {
  const [swaras, setSwaras] = useState('');
  const [results, setResults] = useState<Raga[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSwaraInput = (swara: string) => {
    setSwaras(prev => prev ? `${prev} ${swara}` : swara);
  };

  const handleBackspace = () => {
    setSwaras(prev => prev.slice(0, -2)); // Rough approximation, better to split by space
  };

  const handleSpace = () => {
    setSwaras(prev => prev + ' ');
  };

  const clearField = () => {
    setSwaras('');
    setResults([]);
    setHasSearched(false);
  };

  const handleSearch = async () => {
    if (!swaras.trim()) return;
    setLoading(true);
    setHasSearched(true);
    
    // We search if the sequence exists in aroha, avroha, or pakad
    // Note: This is a simple text match. For advanced musicology, we'd need normalized comparison.
    const term = `%${swaras.trim()}%`;
    const { data } = await supabase
      .from('ragas')
      .select('*')
      .or(`aroha.like.${term},avroha.like.${term},pakad.like.${term}`);

    if (data) setResults(data);
    setLoading(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Search by Swaras</h2>
        <p className="text-slate-400 mt-1">Find ragas by their notes (Aroha, Avroha, or Pakad)</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 min-h-[60px] flex items-center justify-center text-xl font-mono text-white tracking-wider">
           {swaras || <span className="text-slate-600 italic text-sm">Tap keys to add notes...</span>}
        </div>

        <SwaraKeyboard 
            onSwaraClick={handleSwaraInput}
            onBackspace={handleBackspace}
            onSpace={handleSpace}
            onClear={clearField}
        />

        <button 
           onClick={handleSearch}
           disabled={loading || !swaras}
           className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
        >
           {loading ? 'Searching...' : <><Search size={20} /> Find Ragas</>}
        </button>
      </div>

      <div className="space-y-4">
        {hasSearched && (
            <h3 className="text-xl font-semibold text-slate-300">
                Found {results.length} Ragas
            </h3>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map(raga => (
                <Link key={raga.id} to={`/ragas/${raga.id}`}>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-pink-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-semibold text-slate-200">{raga.name}</h3>
                            <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">{raga.thaat}</span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-2">
                            <p>Aroha: {raga.aroha}</p>
                            <p>Pakad: {raga.pakad}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
        
        {hasSearched && results.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                No ragas found with that sequence. Try a shorter sequence.
            </div>
        )}
      </div>
    </div>
  );
}
