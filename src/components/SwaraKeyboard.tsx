import type { MouseEvent } from 'react';

interface SwaraKeyboardProps {
  onSwaraClick: (swara: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSpace: () => void;
}

export default function SwaraKeyboard({ onSwaraClick, onBackspace, onClear, onSpace }: SwaraKeyboardProps) {
  const swaras = [
    { label: 'Sa', value: 'S', type: 'shuddha' },
    { label: 're', value: 'r', type: 'komal' },
    { label: 'Re', value: 'R', type: 'shuddha' },
    { label: 'ga', value: 'g', type: 'komal' },
    { label: 'Ga', value: 'G', type: 'shuddha' },
    { label: 'Ma', value: 'M', type: 'shuddha' },
    { label: 'ma', value: 'm', type: 'tivra' },
    { label: 'Pa', value: 'P', type: 'shuddha' },
    { label: 'dha', value: 'd', type: 'komal' },
    { label: 'Dha', value: 'D', type: 'shuddha' },
    { label: 'ni', value: 'n', type: 'komal' },
    { label: 'Ni', value: 'N', type: 'shuddha' },
  ];

  const handleMouseDown = (e: MouseEvent, action: () => void) => {
    e.preventDefault(); // Prevent focus loss from input
    action();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl select-none">
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
        {swaras.map((swara) => (
          <button
            type="button"
            key={swara.value}
            onMouseDown={(e) => handleMouseDown(e, () => onSwaraClick(swara.value))}
            className={`
              h-12 rounded-lg font-bold text-lg shadow-sm transition-all active:scale-95
              ${swara.type === 'shuddha' ? 'bg-slate-800 text-white hover:bg-slate-700' : ''}
              ${swara.type === 'komal' ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 hover:bg-slate-700' : ''}
              ${swara.type === 'tivra' ? 'bg-slate-800 text-pink-400 border border-pink-500/30 hover:bg-slate-700' : ''}
            `}
          >
            {swara.label}
          </button>
        ))}
      </div>
      
      <div className="flex gap-2">
        <button 
           type="button"
           onMouseDown={(e) => handleMouseDown(e, onSpace)}
           className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 h-10 rounded-lg text-sm font-medium uppercase tracking-wider"
        >
          Key Space
        </button>
        <button 
           type="button"
           onMouseDown={(e) => handleMouseDown(e, onClear)}
           className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 hover:border-slate-600 h-10 rounded-lg text-xs font-medium uppercase tracking-wider"
        >
          Clear
        </button>
        <button 
           type="button"
           onMouseDown={(e) => handleMouseDown(e, onBackspace)}
           className="px-6 bg-slate-800 hover:bg-red-900/30 text-red-400 border border-slate-700 hover:border-red-500/30 h-10 rounded-lg text-sm font-medium"
        >
          ⌫
        </button>
      </div>
      
      <div className="mt-3 flex gap-4 text-xs text-slate-500 justify-center">
         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-400"></div> Shuddha</div>
         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Komal (Lower)</div>
         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pink-400"></div> Tivra (Higher)</div>
      </div>
    </div>
  );
}
