import React, { useEffect, useState, useRef } from 'react';
import { Character, Stats } from '../types';
import { Shield, Heart, User, Briefcase, Scroll, Sparkles, RefreshCw } from 'lucide-react';

interface Props {
  character: Character;
}

const CharacterSheet: React.FC<Props> = ({ character }) => {
  const [isUpdated, setIsUpdated] = useState(false);
  const prevCharRef = useRef(JSON.stringify(character));

  // Detect changes to character data to trigger visual feedback
  useEffect(() => {
    const currentCharStr = JSON.stringify(character);
    if (prevCharRef.current !== currentCharStr) {
      setIsUpdated(true);
      const timer = setTimeout(() => setIsUpdated(false), 2000);
      prevCharRef.current = currentCharStr;
      return () => clearTimeout(timer);
    }
  }, [character]);

  const statLabels: { [key in keyof Stats]: string } = {
    str: "Strength",
    dex: "Dexterity",
    con: "Constitution",
    int: "Intelligence",
    wis: "Wisdom",
    cha: "Charisma"
  };

  const calculateModifier = (val: number) => {
    const mod = Math.floor((val - 10) / 2);
    return mod >= 0 ? `+${mod}` : mod;
  };

  const hpPercent = Math.min(100, Math.max(0, (character.hp / character.maxHp) * 100));

  return (
    <div className={`relative bg-slate-900/50 p-6 rounded-[32px] border shadow-inner space-y-8 transition-all duration-500 ${isUpdated ? 'border-emerald-500/50 shadow-emerald-900/20 bg-emerald-900/10' : 'border-slate-800'}`}>
      
      {/* Update Badge */}
      <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-emerald-500 text-emerald-950 text-[10px] font-bold uppercase tracking-widest rounded-full transition-opacity duration-500 ${isUpdated ? 'opacity-100' : 'opacity-0'}`}>
        <RefreshCw size={12} className="animate-spin" />
        Updated
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-bold border-2 border-slate-800 shadow-lg relative overflow-hidden" style={{ backgroundColor: character.color }}>
            {character.name[0]}
            {isUpdated && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
          </div>
          <div>
            <h3 className="fantasy-font text-3xl text-white tracking-wide">{character.name}</h3>
            <p className="text-[10px] text-amber-500 font-bold uppercase tracking-[0.2em]">{character.race} • {character.class} • Level {character.level}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 h-full bg-rose-600/20 transition-all duration-1000" style={{ width: `${hpPercent}%` }} />
          <div className="absolute bottom-0 left-0 h-1 bg-rose-500 transition-all duration-1000" style={{ width: `${hpPercent}%` }} />
          <div className="relative z-10">
            <Heart className="w-5 h-5 text-rose-500 mb-2 opacity-80" />
            <span className="text-[10px] uppercase text-slate-500 font-bold block">Health Points</span>
            <span className="text-2xl font-bold text-white">{character.hp} <span className="text-slate-500 text-lg">/ {character.maxHp}</span></span>
          </div>
        </div>
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 flex flex-col justify-center relative overflow-hidden">
          <Shield className="w-5 h-5 text-sky-500 mb-2 opacity-80" />
          <span className="text-[10px] uppercase text-slate-500 font-bold block">Armor Class</span>
          <span className="text-2xl font-bold text-white">{character.ac}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(character.stats) as Array<keyof Stats>).map((key) => (
          <div key={key} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col items-center hover:border-slate-700 transition-colors">
            <span className="text-[9px] uppercase text-slate-600 font-bold mb-1">{statLabels[key].slice(0, 3)}</span>
            <span className="text-lg font-bold text-slate-100">{character.stats[key]}</span>
            <span className={`text-xs font-bold ${calculateModifier(character.stats[key]) !== 0 ? 'text-amber-500' : 'text-slate-600'}`}>
              {calculateModifier(character.stats[key])}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] uppercase text-slate-500 font-bold flex items-center gap-2 tracking-widest">
          <Briefcase className="w-3 h-3" /> Equipment
        </h4>
        <div className="flex flex-wrap gap-2">
          {character.inventory.length > 0 ? character.inventory.map((item, i) => (
            <span key={i} className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 font-serif italic hover:border-slate-600 transition-colors cursor-default">
              • {item}
            </span>
          )) : <span className="text-xs text-slate-700 italic">No items found...</span>}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] uppercase text-slate-500 font-bold flex items-center gap-2 tracking-widest">
          <Scroll className="w-3 h-3" /> Features & Spells
        </h4>
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-3xl text-sm text-slate-400 italic whitespace-pre-wrap font-serif leading-relaxed h-48 overflow-y-auto custom-scrollbar shadow-inner">
          {character.notes || "The chronicle for this hero is empty."}
        </div>
      </div>
    </div>
  );
};

export default CharacterSheet;