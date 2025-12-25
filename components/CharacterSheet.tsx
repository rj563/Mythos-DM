
import React from 'react';
import { Character, Stats } from '../types';
import { Shield, Heart, User, Briefcase, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

interface Props {
  character: Character;
  onUpdate: (id: string, updates: Partial<Character>) => void;
  onRemove?: (id: string) => void;
}

const CharacterSheet: React.FC<Props> = ({ character, onUpdate, onRemove }) => {
  const statLabels: { [key in keyof Stats]: string } = {
    str: "Strength",
    dex: "Dexterity",
    con: "Constitution",
    int: "Intelligence",
    wis: "Wisdom",
    cha: "Charisma"
  };

  const updateStat = (key: keyof Stats, delta: number) => {
    onUpdate(character.id, {
      stats: {
        ...character.stats,
        [key]: Math.max(1, character.stats[key] + delta)
      }
    });
  };

  const calculateModifier = (val: number) => {
    const mod = Math.floor((val - 10) / 2);
    return mod >= 0 ? `+${mod}` : mod;
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="flex items-start justify-between border-b border-slate-700 pb-4 gap-4">
        <div className="flex-1">
          <input 
            className="fantasy-font text-2xl text-amber-500 bg-transparent border-none outline-none focus:ring-1 focus:ring-amber-500/20 rounded w-full"
            value={character.name}
            onChange={(e) => onUpdate(character.id, { name: e.target.value })}
            placeholder="Character Name"
          />
          <div className="flex gap-2 mt-1">
            <input 
              className="text-xs text-slate-400 bg-transparent border-none outline-none w-20"
              value={character.race}
              onChange={(e) => onUpdate(character.id, { race: e.target.value })}
              placeholder="Race"
            />
            <input 
              className="text-xs text-slate-400 bg-transparent border-none outline-none w-24"
              value={character.class}
              onChange={(e) => onUpdate(character.id, { class: e.target.value })}
              placeholder="Class"
            />
          </div>
        </div>
        {onRemove && (
          <button 
            onClick={() => onRemove(character.id)}
            className="text-slate-600 hover:text-rose-500 transition-colors pt-1"
            title="Retire Character"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 flex flex-col items-center">
          <Heart className="w-5 h-5 text-rose-500 mb-1" />
          <span className="text-[10px] uppercase text-slate-500 font-bold">Health Points</span>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={() => onUpdate(character.id, { hp: Math.max(0, character.hp - 1) })} className="hover:text-rose-400">-</button>
            <span className="text-xl font-bold">{character.hp} / {character.maxHp}</span>
            <button onClick={() => onUpdate(character.id, { hp: Math.min(character.maxHp, character.hp + 1) })} className="hover:text-emerald-400">+</button>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 flex flex-col items-center">
          <Shield className="w-5 h-5 text-sky-500 mb-1" />
          <span className="text-[10px] uppercase text-slate-500 font-bold">Armor Class</span>
          <div className="flex items-center gap-2 mt-1">
             <button onClick={() => onUpdate(character.id, { ac: Math.max(0, character.ac - 1) })} className="hover:text-sky-400">-</button>
            <span className="text-xl font-bold">{character.ac}</span>
            <button onClick={() => onUpdate(character.id, { ac: character.ac + 1 })} className="hover:text-sky-400">+</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(character.stats) as Array<keyof Stats>).map((key) => (
          <div key={key} className="bg-slate-900 p-2 rounded border border-slate-700 flex flex-col items-center relative group">
            <span className="text-[10px] uppercase text-slate-500 font-bold">{statLabels[key].slice(0, 3)}</span>
            <span className="text-lg font-bold">{character.stats[key]}</span>
            <span className="text-xs text-amber-400">{calculateModifier(character.stats[key])}</span>
            
            <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 flex flex-col">
              <button onClick={() => updateStat(key, 1)} className="hover:text-white"><ChevronUp size={12}/></button>
              <button onClick={() => updateStat(key, -1)} className="hover:text-white"><ChevronDown size={12}/></button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-[10px] uppercase text-slate-500 font-bold flex items-center gap-2">
          <Briefcase className="w-4 h-4" /> Inventory
        </h3>
        <ul className="text-sm space-y-1 bg-slate-900/50 p-3 rounded border border-slate-700 max-h-32 overflow-y-auto">
          {character.inventory.map((item, i) => (
            <li key={i} className="text-slate-300 flex justify-between group">
              <span>• {item}</span>
              <button 
                onClick={() => onUpdate(character.id, { inventory: character.inventory.filter((_, idx) => idx !== i)})}
                className="opacity-0 group-hover:opacity-100 text-rose-500 text-xs"
              >
                Drop
              </button>
            </li>
          ))}
          <li className="pt-2">
             <input 
              type="text" 
              placeholder="Add item..." 
              className="w-full bg-transparent border-b border-slate-700 focus:border-amber-500 outline-none text-xs py-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  onUpdate(character.id, { inventory: [...character.inventory, e.currentTarget.value] });
                  e.currentTarget.value = '';
                }
              }}
             />
          </li>
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="text-[10px] uppercase text-slate-500 font-bold">Character Notes</h3>
        <textarea 
          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-300 min-h-[80px] focus:ring-1 focus:ring-amber-500 outline-none"
          value={character.notes}
          onChange={(e) => onUpdate(character.id, { notes: e.target.value })}
        />
      </div>
    </div>
  );
};

export default CharacterSheet;
