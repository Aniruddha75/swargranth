import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AddDiaryEntry() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.from('diary_entries').insert({
        title,
        content,
        image_url: imageUrl || null
    });

    if (error) {
        console.error(error);
        setError('Failed to save entry');
        setLoading(false);
    } else {
        navigate('/diary');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Cancel</span>
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-white text-right">New Diary Entry</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
         <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
          <input 
            required
            type="text"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-400 mb-1">Content</label>
           <textarea 
             rows={10}
             required
             className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-amber-500 outline-none resize-none font-sans"
             placeholder="Dear Diary..."
             value={content}
             onChange={e => setContent(e.target.value)}
           />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
             <ImageIcon size={14} /> Cover Image URL (Optional)
          </label>
          <input 
            type="url"
            placeholder="https://..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
          />
          {imageUrl && (
              <div className="mt-2 h-40 rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = '')} />
              </div>
          )}
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : <><Save size={20} /> Save Entry</>}
          </button>
        </div>
      </form>
    </div>
  );
}
