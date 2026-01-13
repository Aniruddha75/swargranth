import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save, Keyboard } from 'lucide-react';
import { ragaService } from '../services/ragaService';
import SwaraKeyboard from '../components/SwaraKeyboard';
import type { RagaInput, BandishInput } from '../types/database';

export default function AddRaga() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    // Add space if needed
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

  // Bandishes State
  const [bandishes, setBandishes] = useState<BandishInput[]>([]);

  const addBandish = () => {
    setBandishes([
      ...bandishes,
      {
        raga_id: '', // Will be set on submit
        title: '',
        type: 'khayal',
        tempo: 'madhya',
        tala: '',
        lyrics: '',
        composer: '',
        audio_url: '',
        notation_image_url: '',
      }
    ]);
  };

  const updateBandish = (index: number, field: keyof BandishInput, value: string) => {
    const newBandishes = [...bandishes];
    // @ts-expect-error - Typescript is strict about generic string assignment to union types
    newBandishes[index][field] = value;
    setBandishes(newBandishes);
  };

  const removeBandish = (index: number) => {
    setBandishes(bandishes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await ragaService.createWithBandishes(raga, bandishes);
      
      if (error) throw error;
      
      if (data) {
        navigate(`/ragas/${data.id}`);
      }
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to create Raga. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Cancel</span>
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-white text-right">Add New Raga</h1>
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

        {/* Bandishes Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-cyan-400">Compositions (Bandishes)</h2>
            <button 
              type="button"
              onClick={addBandish}
              className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 text-cyan-400 px-3 py-2 rounded-lg transition-colors border border-slate-700"
            >
              <Plus size={16} /> Add Bandish
            </button>
          </div>

          {bandishes.map((bandish, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 relative group">
              <button
                type="button" 
                onClick={() => removeBandish(idx)}
                className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={18} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Title</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-cyan-500 outline-none"
                      value={bandish.title}
                      onChange={e => updateBandish(idx, 'title', e.target.value)}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Type</label>
                      <select 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-cyan-500 outline-none"
                        value={bandish.type}
                        onChange={e => updateBandish(idx, 'type', e.target.value)}
                      >
                         <option value="khayal">Khayal</option>
                         <option value="dhrupad">Dhrupad</option>
                         <option value="thumri">Thumri</option>
                         <option value="bhajan">Bhajan</option>
                      </select>
                    </div>
                     <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Tempo</label>
                      <select 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-cyan-500 outline-none"
                        value={bandish.tempo}
                        onChange={e => updateBandish(idx, 'tempo', e.target.value)}
                      >
                         <option value="vilambit">Vilambit</option>
                         <option value="madhya">Madhya</option>
                         <option value="drut">Drut</option>
                      </select>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Composer (Bandishkaar)</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-cyan-500 outline-none"
                      value={bandish.composer || ''}
                      onChange={e => updateBandish(idx, 'composer', e.target.value)}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Tala</label>
                    <input 
                      type="text"
                      placeholder="e.g. Teentaal"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-cyan-500 outline-none"
                      value={bandish.tala || ''}
                      onChange={e => updateBandish(idx, 'tala', e.target.value)}
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Lyrics</label>
                   <textarea
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-cyan-500 outline-none resize-none"
                      value={bandish.lyrics}
                      onChange={e => updateBandish(idx, 'lyrics', e.target.value)}
                   />
                </div>
                <div className="space-y-2">
                   <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Audio URL (e.g., YouTube/Drive)</label>
                      <input 
                        type="url"
                        placeholder="https://..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-cyan-500 outline-none"
                        value={bandish.audio_url || ''}
                        onChange={e => updateBandish(idx, 'audio_url', e.target.value)}
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Notation Image URL</label>
                      <input 
                        type="url"
                        placeholder="https://..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:border-cyan-500 outline-none"
                        value={bandish.notation_image_url || ''}
                        onChange={e => updateBandish(idx, 'notation_image_url', e.target.value)}
                      />
                   </div>
                </div>
              </div>

            </div>
          ))}

          {bandishes.length === 0 && (
             <div className="text-center py-8 bg-slate-900/30 rounded-xl border border-dashed border-slate-800 text-slate-500">
               No compositions added. Click "Add Bandish" to start.
             </div>
          )}
        </section>

        {error && <div className="text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-900/50">{error}</div>}

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : <><Save size={20} /> Save Raga</>}
          </button>
        </div>

      </form>
    </div>
  );
}
