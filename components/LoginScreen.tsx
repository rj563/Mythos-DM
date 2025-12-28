import React from 'react';
import { Zap, Shield, Skull } from 'lucide-react';

interface Props { onLogin: () => void; onGuest: () => void; }

const LoginScreen: React.FC<Props> = ({ onLogin, onGuest }) => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2544&auto=format&fit=crop')] bg-cover bg-center opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
      
      <div className="relative z-10 max-w-md w-full p-8 space-y-8 text-center animate-in zoom-in duration-700">
        <div className="space-y-2">
           <h1 className="fantasy-font text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 drop-shadow-2xl">MYTHOS</h1>
           <p className="text-xl text-slate-400 font-serif tracking-widest uppercase">The AI Dungeon Master</p>
        </div>

        <div className="space-y-4">
           <button onClick={onLogin} className="w-full py-4 bg-white hover:bg-slate-200 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-white/10 flex items-center justify-center gap-3">
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
             Continue with Google
           </button>
           <button onClick={onGuest} className="w-full py-4 bg-slate-800/80 backdrop-blur hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold rounded-xl transition-all uppercase text-sm tracking-widest">
             Enter as Guest
           </button>
        </div>

        <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-4">
           <div className="text-center">
              <Zap className="mx-auto text-amber-500 mb-2" size={20}/>
              <p className="text-[10px] font-bold uppercase text-slate-500">Fast AI</p>
           </div>
           <div className="text-center">
              <Shield className="mx-auto text-emerald-500 mb-2" size={20}/>
              <p className="text-[10px] font-bold uppercase text-slate-500">Secure</p>
           </div>
           <div className="text-center">
              <Skull className="mx-auto text-rose-500 mb-2" size={20}/>
              <p className="text-[10px] font-bold uppercase text-slate-500">Deadly</p>
           </div>
        </div>
      </div>
    </div>
  );
};
export default LoginScreen;