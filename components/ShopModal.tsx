import React from 'react';
import { X, Sparkles, Gem, Zap } from 'lucide-react';

interface Props {
  onClose: () => void;
  balance: number;
}

const ShopModal: React.FC<Props> = ({ onClose, balance }) => {
  const products = [
    { id: 'pouch', name: 'Pouch of Aether', amount: 100000, price: 1.99, icon: Sparkles, color: 'sky' },
    { id: 'chest', name: 'Chest of Aether', amount: 500000, price: 4.99, icon: Gem, color: 'purple', popular: true },
    { id: 'vault', name: 'Vault of Aether', amount: 2000000, price: 14.99, icon: Zap, color: 'amber' },
  ];

  const handleBuy = (id: string) => {
    alert("Merchants are currently restocking. (Payment integration pending)");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="max-w-4xl w-full bg-slate-900 border border-amber-500/30 rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white z-20"><X size={24}/></button>
        
        {/* Left Side: Merchant */}
        <div className="w-full md:w-1/3 bg-slate-950 p-10 flex flex-col justify-center items-center text-center space-y-6 border-b md:border-b-0 md:border-r border-slate-800 relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1628515082187-575510b64d08?q=80&w=2670&auto=format&fit=crop')] bg-cover opacity-20" />
           <div className="relative z-10">
             <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/20">
               <Gem className="text-slate-900 w-10 h-10" />
             </div>
             <h2 className="fantasy-font text-4xl text-amber-500">The Goblin Market</h2>
             <p className="text-slate-400 text-sm">"Knowledge costs power, traveler. My Aether feeds the Oracle."</p>
             
             <div className="mt-8 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
               <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Current Balance</p>
               <p className="text-3xl font-bold text-white font-mono">{balance.toLocaleString()}</p>
               <p className="text-xs text-amber-500 mt-1">Aether Dust</p>
             </div>
           </div>
        </div>

        {/* Right Side: Products */}
        <div className="flex-1 p-10 space-y-8">
           <div>
             <h3 className="fantasy-font text-3xl text-white mb-2">Acquire Aether</h3>
             <p className="text-slate-400 text-sm">Aether is consumed to power the AI Dungeon Master.</p>
           </div>
           
           <div className="grid grid-cols-1 gap-4">
              {products.map(p => (
                <button 
                  key={p.id}
                  onClick={() => handleBuy(p.id)} 
                  className={`relative group flex items-center justify-between p-6 bg-slate-800 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl ${p.popular ? 'border-amber-500/50 bg-amber-900/10' : 'border-slate-700 hover:border-slate-500'}`}
                >
                  {p.popular && <span className="absolute -top-3 left-6 px-3 py-1 bg-amber-500 text-slate-900 text-[10px] font-bold uppercase tracking-widest rounded-full">Best Value</span>}
                  
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${p.color}-500/20 text-${p.color}-500`}>
                      <p.icon size={24} />
                    </div>
                    <div className="text-left">
                       <h4 className="fantasy-font text-xl text-white group-hover:text-amber-400 transition-colors">{p.name}</h4>
                       <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">{p.amount.toLocaleString()} Tokens</p>
                    </div>
                  </div>
                  
                  <div className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-lg group-hover:scale-105 transition-transform">
                    ${p.price}
                  </div>
                </button>
              ))}
           </div>
           
           <p className="text-[10px] text-slate-600 text-center">
              Processing fees included. 30% Oracle tax applied to all generations.
           </p>
        </div>
      </div>
    </div>
  );
};

export default ShopModal;
