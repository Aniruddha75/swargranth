import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { ragaService } from '../services/ragaService';
import { supabase } from '../lib/supabase';
import type { Raga } from '../types/database';
import { BANDISH_TYPES, TAAL_OPTIONS } from '../constants/musicConstants';

export default function EditBandish() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ragas, setRagas] = useState<Raga[]>([]);
  const [existingComposers, setExistingComposers] = useState<string[]>([]);
  const [existingTalas, setExistingTalas] = useState<string[]>([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('khayal');
  const [ragaId, setRagaId] = useState<string>('');
  const [composer, setComposer] = useState('');
  const [tala, setTala] = useState('');
  const [tempo, setTempo] = useState('madhya');
  const [content, setContent] = useState('');
  
  // Media State
  const [audioUrl, setAudioUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  
  useEffect(() => {
    loadRagas();
    loadBandish();
    loadSuggestions();
  }, [id]);

  async function loadSuggestions() {
    const { data } = await supabase.from('bandishes').select('composer, tala');
    if (data) {
        const composers: string[] = Array.from<string>(
          data.reduce((acc: Map<string, string>, b) => {
            const val = b.composer?.trim();
            if (val && !acc.has(val.toLowerCase())) acc.set(val.toLowerCase(), val);
            return acc;
          }, new Map<string, string>()).values()
        ).sort();

        const talas: string[] = Array.from<string>(
          data.reduce((acc: Map<string, string>, b) => {
            const val = b.tala?.trim();
            if (val && !acc.has(val.toLowerCase())) acc.set(val.toLowerCase(), val);
            return acc;
          }, new Map<string, string>()).values()
        ).sort();

        setExistingComposers(composers);
        setExistingTalas(talas);
    }
  }

  async function loadRagas() {
    const { data } = await ragaService.getAll();
    if (data) setRagas(data);
  }

  async function loadBandish() {
    if (!id || !import.meta.env.VITE_SUPABASE_URL) {
      setDataLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('bandishes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      setError('Failed to load bandish');
      setDataLoading(false);
      return;
    }

    if (data) {
      setTitle(data.title || '');
      setType(data.type || 'khayal');
      setRagaId(data.raga_id || '');
      setComposer(data.composer || '');
      setTala(data.tala || '');
      setTempo(data.tempo || 'madhya');
      setContent(data.lyrics || '');
      setAudioUrl(data.audio_url || '');
      setExistingImageUrl(data.notation_image_url || '');
      setPreviewUrl(data.notation_image_url || null);
    }
    setDataLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        let uploadedImageUrl = existingImageUrl;
        
        // Handle Image Upload if new file selected
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, imageFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);
                
            uploadedImageUrl = publicUrl;
        }

        const updatePayload = {
            title,
            type: type as any,
            lyrics: content,
            raga_id: ragaId || null,
            tempo: tempo as any,
            tala: tala,
            composer: composer,
            audio_url: audioUrl,
            notation_image_url: uploadedImageUrl
        };

        const { data, error } = await supabase
            .from('bandishes')
            .update(updatePayload)
            .eq('id', id)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('No bandish found to update');
        
        console.log('Bandish update successful:', data);
        navigate('/notes');
    } catch (err: any) {
      console.error('Error updating bandish:', err);
      setError(err.message || 'Failed to update bandish.');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return <div className="text-center py-12 text-slate-500">Loading bandish...</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Cancel</span>
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-white text-right">Edit Bandish</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Title *</label>
          <input 
            required
            type="text"
            placeholder="e.g., Bandish in Teentaal"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
               <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                {BANDISH_TYPES.map(t => (
                  <option key={t} value={t.toLowerCase().replace(/\s+/g, '_') === 'khayal' ? 'khayal' : t.toLowerCase()}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Related Raga *</label>
               <select 
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                value={ragaId}
                onChange={e => setRagaId(e.target.value)}
              >
                <option value="">Select Raga...</option>
                {ragas.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Composer (Optional)</label>
              <input 
                type="text"
                list="composer-list"
                placeholder="e.g. Sadarang"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                value={composer}
                onChange={e => setComposer(e.target.value)}
              />
              <datalist id="composer-list">
                {existingComposers.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Tala (Optional)</label>
              <input 
                type="text"
                list="tala-list"
                placeholder="e.g. Teentaal"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                value={tala}
                onChange={e => setTala(e.target.value)}
              />
              <datalist id="tala-list">
                {TAAL_OPTIONS.map(t => <option key={t} value={t} />)}
                {existingTalas.filter(t => !TAAL_OPTIONS.includes(t)).map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Tempo</label>
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                value={tempo}
                onChange={e => setTempo(e.target.value)}
              >
                <option value="vilambit">Vilambit (Slow)</option>
                <option value="madhya">Madhya (Medium)</option>
                <option value="drut">Drut (Fast)</option>
              </select>
            </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-400 mb-1">Content / Lyrics</label>
           <textarea 
             rows={6}
             className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none resize-none font-sans"
             placeholder="Write your bandish lyrics here..."
             value={content}
             onChange={e => setContent(e.target.value)}
           />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Audio URL (Optional)</label>
                <input 
                    type="url"
                    placeholder="https://youtube.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                    value={audioUrl}
                    onChange={e => setAudioUrl(e.target.value)}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Notation Image (Optional)</label>
                <div className="relative">
                    <input 
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="notation-upload"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setImageFile(e.target.files[0]);
                                setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                            }
                        }}
                    />
                    <label 
                        htmlFor="notation-upload"
                        className="flex items-center gap-2 w-full bg-slate-950 border border-slate-800 border-dashed rounded-lg p-3 text-slate-400 hover:text-white hover:border-emerald-500 cursor-pointer transition-colors"
                    >
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="h-6 w-6 object-cover rounded" />
                        ) : (
                            <div className="h-6 w-6 bg-slate-800 rounded flex items-center justify-center text-xs">+</div>
                        )}
                        <span className="text-sm truncate">{imageFile ? imageFile.name : existingImageUrl ? 'Current image (click to change)' : 'Click to upload image'}</span>
                    </label>
                </div>
             </div>
        </div>

        {error && <div className="text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-900/50">{error}</div>}

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : <><Save size={20} /> Update Bandish</>}
          </button>
        </div>

      </form>
    </div>
  );
}
