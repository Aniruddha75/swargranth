import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { ragaService } from '../services/ragaService';
import { supabase } from '../lib/supabase';
import type { BandishInput, Raga } from '../types/database';

import { useSearchParams } from 'react-router-dom';

export default function AddBandish() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ragas, setRagas] = useState<Raga[]>([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('khayal');
  const [ragaId, setRagaId] = useState<string>(searchParams.get('ragaId') || '');
  const [composer, setComposer] = useState('');
  const [tala, setTala] = useState('');
  const [content, setContent] = useState(''); // Maps to lyrics
  
  // Media State
  const [audioUrl, setAudioUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  useEffect(() => {
    loadRagas();
  }, []);

  async function loadRagas() {
    const { data } = await ragaService.getAll();
    if (data) setRagas(data);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        let uploadedImageUrl = '';
        
        // Handle Image Upload
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

        const payload: BandishInput = {
            title,
            type: type as any,
            lyrics: content,
            // Only include raga_id if it's set and not empty string
            raga_id: (ragaId || null) as string | null, 
            tempo: 'madhya', // defaults
            tala: tala,
            composer: composer,
            audio_url: audioUrl,
            notation_image_url: uploadedImageUrl
        };

        // If 'general_note', explicitly set raga_id to null if the type definition allows undefined, 
        // but for Supabase insert we might need null.
        // Let's coerce undefined to null for the DB if needed, but TypeScript might complain.
        // Actually, let's just use the Supabase client directly.
        
        const dbPayload = {
            ...payload,
            raga_id: ragaId || null
        };

        const { error } = await supabase
            .from('bandishes')
            .insert(dbPayload);

        if (error) throw error;
        
        navigate('/notes');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save note.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Cancel</span>
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-white text-right">Add New Bandish</h1>
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
                <option value="khayal">Khayal</option>
                <option value="dhrupad">Dhrupad</option>
                <option value="thumri">Thumri</option>
                <option value="bhajan">Bhajan</option>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Composer (Optional)</label>
              <input 
                type="text"
                placeholder="e.g. Sadarang"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                value={composer}
                onChange={e => setComposer(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Tala (Optional)</label>
              <input 
                type="text"
                placeholder="e.g. Teentaal"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                value={tala}
                onChange={e => setTala(e.target.value)}
              />
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
                        <span className="text-sm truncate">{imageFile ? imageFile.name : 'Click to upload image'}</span>
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
            {loading ? 'Saving...' : <><Save size={20} /> Save Bandish</>}
          </button>
        </div>

      </form>
    </div>
  );
}
