import { ArrowLeft, Calendar, BookOpen, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

interface DiaryDetailProps {
  entry: any;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function DiaryDetail({ entry, onClose, onDeleted }: DiaryDetailProps) {
  const [deleting, setDeleting] = useState(false);

  if (!entry) return null;

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', entry.id);

      if (error) throw error;
      if (onDeleted) onDeleted();
      onClose();
    } catch (err) {
      console.error('Error deleting entry:', err);
      alert('Failed to delete entry');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black overflow-y-auto">
      {/* Content */}
      <div className="w-full max-w-4xl mx-auto p-6 pt-12 pb-8 space-y-8">
        {/* Top Actions */}
        <div className="flex items-center justify-between">
            <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
            >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            {/* <span>Back to Diary</span> */}
            </button>

            <div className="flex items-center gap-3">
                <Link
                to={`/diary/edit/${entry.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors border border-slate-700"
                >
                <Edit2 size={16} />
                <span>Edit</span>
                </Link>
                <button
                disabled={deleting}
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors border border-red-500/20 disabled:opacity-50"
                >
                <Trash2 size={16} />
                <span>{deleting ? 'Deleting...' : 'Delete'}</span>
                </button>
            </div>
        </div>

        {/* Date Badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium">
            <Calendar size={16} />
            {new Date(entry.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </span>
        </div>

        {/* Title */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-tight">
            {entry.title}
          </h2>
        </div>

        {/* Image */}
        {entry.image_url && (
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <img
              src={entry.image_url}
              alt={entry.title}
              className="w-full rounded-lg border border-slate-700"
            />
          </div>
        )}

        {/* Content */}
        {entry.content && (
          <div className="bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-slate-800">
            <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
              <BookOpen size={18} />
              Entry
            </h3>
            <p className="text-xl md:text-2xl leading-relaxed text-slate-200 whitespace-pre-wrap font-serif">
              {entry.content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
