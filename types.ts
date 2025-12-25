
export interface Stats {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface Character {
  name: string;
  race: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  ac: number;
  stats: Stats;
  inventory: string[];
  notes: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GameState {
  character: Character;
  history: Message[];
  isStarted: boolean;
}

export interface DiceRoll {
  sides: number;
  result: number;
  bonus: number;
  total: number;
}
