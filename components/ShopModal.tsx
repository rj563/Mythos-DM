import React from 'react';
import { X, Gem } from 'lucide-react';

interface Props { onClose: () => void; balance: number; }

const ShopModal: React.FC<Props> = ({ onClose, balance }) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-8 relative shadow-2xl overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X/></button>
        
        <div className="text-center mb-8">
           <Gem size={48} className="mx-auto text-amber-500 mb-4 animate-bounce" />
           <h2 className="fantasy-font text-4xl text-white mb-2">Goblin Market</h2>
           <p className="text-slate-400">"Shiny tokens for shiny stories!"</p>
           <div className="mt-4 px-4 py-2 bg-slate-950 rounded-lg inline-block border border-slate-800">
              <span className="text-slate-500 text-xs font-bold uppercase mr-2">Balance:</span>
              <span className="text-amber-500 font-mono font-bold">{balance.toLocaleString()}</span>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {[
             { name: "Pouch", amount: "100K", price: "$1.99" },
             { name: "Chest", amount: "500K", price: "$4.99", popular: true },
             { name: "Vault", amount: "2M", price: "$14.99" },
           ].map((item, i) => (
             <button key={i} className={`p-6 rounded-2xl border flex flex-col items-center gap-4 transition-all hover:bg-slate-800 ${item.popular ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-950 border-slate-800'}`}>
                {item.popular && <span className="text-[9px] bg-amber-500 text-black font-bold uppercase px-2 py-0.5 rounded-full">Best Value</span>}
                <div className="font-bold text-2xl text-white">{item.amount}</div>
                <div className="text-slate-500 text-xs uppercase font-bold">Tokens</div>
                <div className="mt-auto bg-white text-slate-900 font-bold px-6 py-2 rounded-lg">{item.price}</div>
             </button>
           ))}
        </div>
        <p className="text-center text-slate-600 text-xs mt-6 uppercase tracking-widest">Mock Payment System</p>
      </div>
    </div>
  );
};
export default ShopModal;