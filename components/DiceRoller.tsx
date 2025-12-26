
import React, { useState } from 'react';
import { DiceRoll } from '../types';

interface Props {
  characterId: string;
  onRoll: (roll: DiceRoll) => void;
}

const DiceRoller: React.FC<Props> = ({ characterId, onRoll }) => {
  const [bonus, setBonus] = useState(0);
  const dice = [4, 6, 8, 10, 12, 20, 100];

  const rollDice = (sides: number) => {
    const result = Math.floor(Math.random() * sides) + 1;
    onRoll({
      sides,
      result,
      bonus,
      total: result + bonus,
      characterId
    });
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-xl border border-slate-700 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="fantasy-font text-lg text-amber-500">The Armory of Chance</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Modifier</span>
          <input 
            type="number" 
            value={bonus} 
            onChange={(e) => setBonus(parseInt(e.target.value) || 0)}
            className="w-12 bg-slate-900 border border-slate-700 rounded px-1 py-1 text-center text-amber-400 font-bold"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {dice.map(d => (
          <button
            key={d}
            onClick={() => rollDice(d)}
            className="flex-1 min-w-[50px] bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg py-3 flex flex-col items-center transition-all hover:scale-105 active:scale-95"
          >
            <span className="text-xs text-slate-400">d{d}</span>
            <span className="font-bold text-white text-lg">Roll</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DiceRoller;
