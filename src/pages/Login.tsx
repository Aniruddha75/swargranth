import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Music, Lock } from 'lucide-react';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'swaragandharva') {
      localStorage.setItem('isAuthenticated', 'true');
      window.location.href = '/'; // Force reload to ensuring generic auth state if needed, or just navigate
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Music className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            MusicVault
        </h1>
        <p className="text-slate-500 mt-2">Your Digital Raga Repository</p>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6 shadow-2xl">
         <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Enter Access Code</label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                    type="password"
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
         </div>

         {error && <div className="text-red-400 text-sm text-center bg-red-900/10 p-2 rounded border border-red-900/20">{error}</div>}

         <button 
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02]"
        >
            Unlock Vault
         </button>
      </form>
    </div>
  );
}
