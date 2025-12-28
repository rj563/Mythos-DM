import React from 'react';
import { Character, Stats } from '../types';
import { Heart, Shield, Zap, Briefcase, Scroll } from 'lucide-react';

interface Props { character: Character; }

const CharacterSheet: React.FC<Props> = ({ character }) => {
  const hpPercent = (character.hp / character.maxHp) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg border-2 border-white/10" style={{ backgroundColor: character.color }}>
           {character.name[0]}
        </div>
        <div>
          <h2 className="fantasy-font text-2xl text-white leading-tight">{character.name}</h2>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-900/50 px-2 py-1 rounded inline-block mt-1">
             Lv.{character.level} {character.race} {character.class}
          </div>
        </div>
      </div>

      {/* Vitals */}
      <div className="grid grid-cols-2 gap-3">
         <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors"/>
            <div className="absolute bottom-0 left-0 h-1 bg-rose-500 transition-all duration-500" style={{ width: `${hpPercent}%` }} />
            <div className="relative flex justify-between items-end">
               <div>
                  <div className="text-[9px] uppercase font-bold text-rose-400 tracking-wider mb-1">Health</div>
                  <div className="text-xl font-bold text-white">{character.hp} <span className="text-sm text-slate-500">/ {character.maxHp}</span></div>
               </div>
               <Heart size={18} className="text-rose-500 mb-1" />
            </div>
         </div>
         <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
               <div className="text-[9px] uppercase font-bold text-sky-400 tracking-wider mb-1">Armor</div>
               <div className="text-xl font-bold text-white">{character.ac}</div>
            </div>
            <Shield size={18} className="text-sky-500" />
         </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
         {Object.entries(character.stats).map(([key, val]) => {
           const mod = Math.floor(((val as number) - 10) / 2);
           return (
             <div key={key} className="bg-slate-900 border border-slate-800 p-2 rounded-lg text-center">
                <div className="text-[8px] uppercase font-bold text-slate-500">{key}</div>
                <div className="font-bold text-white text-lg leading-none my-1">{val as number}</div>
                <div className={`text-[10px] font-bold ${mod >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{mod >= 0 ? `+${mod}` : mod}</div>
             </div>
           );
         })}
      </div>

      {/* Inventory */}
      <div>
         <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2 flex items-center gap-2"><Briefcase size={12}/> Inventory</h4>
         <div className="flex flex-wrap gap-1.5">
            {character.inventory.map((item, i) => (
              <span key={i} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-300">{item}</span>
            ))}
         </div>
      </div>

      {/* Notes */}
      <div>
         <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2 flex items-center gap-2"><Scroll size={12}/> Notes</h4>
         <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-slate-400 font-serif italic leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
            {character.notes || "No additional notes."}
         </div>
      </div>
    </div>
  );
};
export default CharacterSheet;