import React from 'react';
import { Skull, Zap, Shield } from 'lucide-react';

interface Props {
  onLogin: () => void;
  onGuest: () => void;
}

const LoginScreen: React.FC<Props> = ({ onLogin, onGuest }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2544&auto=format&fit=crop')] bg-cover bg-center relative overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      
      <div className="relative z-10 max-w-md w-full bg-slate-900/90 border border-slate-700 p-10 rounded-[40px] shadow-2xl space-y-8 text-center animate-in zoom-in duration-500">
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/50">
             <Skull className="text-slate-900 w-12 h-12" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="fantasy-font text-6xl text-amber-500 tracking-wide">Mythos DM</h1>
          <p className="text-slate-400 text-lg font-serif italic">Enter the Astral Gate</p>
        </div>

        <div className="space-y-4 pt-4">
          <button 
            onClick={onLogin}
            className="w-full py-4 bg-white hover:bg-slate-200 text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg text-lg group"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
            Sign in with Google
          </button>
          
          <button 
            onClick={onGuest}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl font-bold text-sm uppercase tracking-widest transition-all"
          >
            Play as Guest (Limited)
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-8 border-t border-slate-800">
           <div className="text-center space-y-1">
              <Zap className="mx-auto text-sky-500 w-5 h-5" />
              <p className="text-[10px] text-slate-500 uppercase font-bold">Fast AI</p>
           </div>
           <div className="text-center space-y-1">
              <Shield className="mx-auto text-emerald-500 w-5 h-5" />
              <p className="text-[10px] text-slate-500 uppercase font-bold">Secure</p>
           </div>
           <div className="text-center space-y-1">
              <Skull className="mx-auto text-rose-500 w-5 h-5" />
              <p className="text-[10px] text-slate-500 uppercase font-bold">Deadly</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
