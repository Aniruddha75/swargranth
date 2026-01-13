import { ArrowLeft, Music, User, Clock } from 'lucide-react';

interface BandishDetailProps {
  bandish: any;
  onClose: () => void;
}

export default function BandishDetail({ bandish, onClose }: BandishDetailProps) {
  if (!bandish) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black overflow-y-auto">
      {/* Content */}
      <div className="w-full max-w-4xl mx-auto p-6 py-8 space-y-8">
        {/* Back Button */}
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Library</span>
        </button>

        {/* Raga Badge */}
        {bandish.ragas?.name && (
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
              <Music size={16} />
              Raga {bandish.ragas.name}
            </span>
          </div>
        )}

        {/* Title */}
        <div className="text-center space-y-3">
          <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-tight">
            {bandish.title}
          </h2>
          
          {/* Metadata */}
          <div className="flex flex-wrap justify-center gap-3 text-slate-400">
            <span className="px-3 py-1 bg-slate-900 rounded-full text-sm uppercase font-bold">
              {bandish.type?.replace('_', ' ')}
            </span>
            {bandish.composer && (
              <span className="px-3 py-1 bg-slate-900 rounded-full text-sm flex items-center gap-1">
                <User size={14} /> {bandish.composer}
              </span>
            )}
            {bandish.tala && (
              <span className="px-3 py-1 bg-slate-900 rounded-full text-sm">
                {bandish.tala}
              </span>
            )}
            {bandish.tempo && (
              <span className="px-3 py-1 bg-slate-900 rounded-full text-sm flex items-center gap-1">
                <Clock size={14} /> {bandish.tempo}
              </span>
            )}
          </div>
        </div>

        {/* Lyrics */}
        {bandish.lyrics && (
          <div className="bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-slate-800">
            <h3 className="text-lg font-bold text-emerald-400 mb-4">Lyrics</h3>
            <p className="text-xl md:text-2xl leading-relaxed text-slate-200 whitespace-pre-wrap font-serif">
              {bandish.lyrics}
            </p>
          </div>
        )}

        {/* Notation Image */}
        {bandish.notation_image_url && (
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-lg font-bold text-cyan-400 mb-4">Notation</h3>
            <img
              src={bandish.notation_image_url}
              alt="Notation"
              className="w-full rounded-lg border border-slate-700"
            />
          </div>
        )}

        {/* Audio */}
        {bandish.audio_url && (
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-lg font-bold text-purple-400 mb-4">Audio</h3>
            <audio controls src={bandish.audio_url} className="w-full rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
}
