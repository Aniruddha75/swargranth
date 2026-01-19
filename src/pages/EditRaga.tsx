import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Keyboard } from 'lucide-react';
import { ragaService } from '../services/ragaService';
import SwaraKeyboard from '../components/SwaraKeyboard';
import type { RagaInput } from '../types/database';
import { supabase } from '../lib/supabase';

export default function EditRaga() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Raga State
  const [raga, setRaga] = useState<RagaInput>({
    name: '',
    thaat: '',
    time: '',
    vadi: '',
    samvadi: '',
    aroha: '',
    avroha: '',
    pakad: '',
    description: '',
  });

  // Keyboard Logic
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeField, setActiveField] = useState<keyof RagaInput | null>(null);

  const handleSwaraInput = (swara: string) => {
    if (!activeField) return;
    const currentValue = raga[activeField] as string;
    const newValue = currentValue ? `${currentValue} ${swara}` : swara;
    setRaga({ ...raga, [activeField]: newValue });
  };

  const handleBackspace = () => {
    if (!activeField) return;
    const currentValue = raga[activeField] as string;
    if (!currentValue) return;
    setRaga({ ...raga, [activeField]: currentValue.slice(0, -1) });
  };

  const handleSpace = () => {
    if (!activeField) return;
    const currentValue = raga[activeField] as string;
    setRaga({ ...raga, [activeField]: currentValue + ' ' });
  };

  const clearField = () => {
     if (!activeField) return;
     setRaga({ ...raga, [activeField]: '' });
  };

  useEffect(() => {
    loadRaga();
  }, [id]);

  async function loadRaga() {
    if (!id) {
      setDataLoading(false);
      return;
    }
    
    const { data, error } = await ragaService.getById(id);
    
    if (error || !data) {
      setError('Failed to load raga');
      setDataLoading(false);
      return;
    }

    setRaga({
      name: data.name || '',
      thaat: data.thaat || '',
      time: data.time || '',
      vadi: data.vadi || '',
      samvadi: data.samvadi || '',
      aroha: data.aroha || '',
      avroha: data.avroha || '',
      pakad: data.pakad || '',
      description: data.description || '',
    });
    
    setDataLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!id) throw new Error('No raga ID provided');
      
      const { error } = await supabase
        .from('ragas')
        .update(raga)
        .eq('id', id);
      
      if (error) throw error;
      
      navigate(`/ragas/${id}`);
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to update Raga. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return <div className="text-center py-12 text-slate-500">Loading raga...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Cancel</span>
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-white text-right">Edit Raga</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Raga Details Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 relative">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h2 className="text-xl font-semibold text-emerald-400">Basic Information</h2>
            <button 
              type="button"
              onClick={() => setShowKeyboard(!showKeyboard)}
              className={`flex items-center gap-2 text-xs md:text-sm px-2 md:px-3 py-1.5 rounded-lg transition-colors border ${showKeyboard ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
            >
              <Keyboard size={16} />
              <span className="hidden sm:inline">{showKeyboard ? 'Hide' : 'Show'} Keyboard</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Raga Name *</label>
              <input 
                required
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                value={raga.name}
                onChange={e => setRaga({...raga, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Thaat *</label>
              <select 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                value={raga.thaat}
                onChange={e => setRaga({...raga, thaat: e.target.value})}
              >
                <option value="">Select Thaat...</option>
                {['Bilawal', 'Khamaj', 'Kafi', 'Asavari', 'Bhairavi', 'Kalyan', 'Marwa', 'Purvi', 'Todi', 'Bhairav'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Time of Day</label>
               <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                value={raga.time}
                onChange={e => setRaga({...raga, time: e.target.value})}
              >
                <option value="">Select Time...</option>
                {['Dawn (4 AM - 7 AM)', 'Morning (7 AM - 10 AM)', 'Late Morning (10 AM - 1 PM)', 'Afternoon (1 PM - 4 PM)', 'Late Afternoon (4 PM - 7 PM)', 'Evening (7 PM - 10 PM)', 'Night (10 PM - 1 AM)', 'Late Night (1 AM - 4 AM)'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Vadi</label>
              <input 
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                value={raga.vadi}
                onChange={e => setRaga({...raga, vadi: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Samvadi</label>
              <input 
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                value={raga.samvadi}
                onChange={e => setRaga({...raga, samvadi: e.target.value})}
              />
            </div>
           </div>

           <div className="space-y-4">
             <div>
               <label className={`block text-sm font-medium mb-1 transition-colors ${activeField === 'aroha' ? 'text-emerald-400' : 'text-slate-400'}`}>Aroha *</label>
               <input 
                 type="text"
                 className={`w-full bg-slate-950 border rounded-lg p-3 text-white font-mono text-sm outline-none transition-colors ${activeField === 'aroha' ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-slate-800 focus:border-emerald-500'}`}
                 value={raga.aroha}
                 onChange={e => setRaga({...raga, aroha: e.target.value})}
                 onFocus={() => { setActiveField('aroha'); setShowKeyboard(true); }}
               />
               {showKeyboard && activeField === 'aroha' && (
                 <div className="mt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30">
                       <p className="text-xs text-emerald-400 mb-2 text-center uppercase tracking-widest font-bold">
                         Swara Keyboard
                       </p>
                       <SwaraKeyboard 
                         onSwaraClick={handleSwaraInput} 
                         onBackspace={handleBackspace}
                         onSpace={handleSpace}
                         onClear={clearField}
                       />
                    </div>
                 </div>
               )}
             </div>
             <div>
               <label className={`block text-sm font-medium mb-1 transition-colors ${activeField === 'avroha' ? 'text-emerald-400' : 'text-slate-400'}`}>Avroha *</label>
               <input 
                 type="text"
                 className={`w-full bg-slate-950 border rounded-lg p-3 text-white font-mono text-sm outline-none transition-colors ${activeField === 'avroha' ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-slate-800 focus:border-emerald-500'}`}
                 value={raga.avroha}
                 onChange={e => setRaga({...raga, avroha: e.target.value})}
                 onFocus={() => { setActiveField('avroha'); setShowKeyboard(true); }}
               />
               {showKeyboard && activeField === 'avroha' && (
                 <div className="mt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30">
                       <p className="text-xs text-emerald-400 mb-2 text-center uppercase tracking-widest font-bold">
                         Swara Keyboard
                       </p>
                       <SwaraKeyboard 
                         onSwaraClick={handleSwaraInput} 
                         onBackspace={handleBackspace}
                         onSpace={handleSpace}
                         onClear={clearField}
                       />
                    </div>
                 </div>
               )}
             </div>
              <div>
               <label className={`block text-sm font-medium mb-1 transition-colors ${activeField === 'pakad' ? 'text-emerald-400' : 'text-slate-400'}`}>Pakad *</label>
               <input 
                 type="text"
                 className={`w-full bg-slate-950 border rounded-lg p-3 text-white font-mono text-sm outline-none transition-colors ${activeField === 'pakad' ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-slate-800 focus:border-emerald-500'}`}
                 value={raga.pakad}
                 onChange={e => setRaga({...raga, pakad: e.target.value})}
                 onFocus={() => { setActiveField('pakad'); setShowKeyboard(true); }}
               />
               {showKeyboard && activeField === 'pakad' && (
                 <div className="mt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30">
                       <p className="text-xs text-emerald-400 mb-2 text-center uppercase tracking-widest font-bold">
                         Swara Keyboard
                       </p>
                       <SwaraKeyboard 
                         onSwaraClick={handleSwaraInput} 
                         onBackspace={handleBackspace}
                         onSpace={handleSpace}
                         onClear={clearField}
                       />
                    </div>
                 </div>
               )}
             </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
              <textarea 
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none resize-none"
                value={raga.description || ''}
                onChange={e => setRaga({...raga, description: e.target.value})}
              />
           </div>
        </section>

        {error && <div className="text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-900/50">{error}</div>}

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : <><Save size={20} /> Update Raga</>}
          </button>
        </div>

      </form>
    </div>
  );
}
