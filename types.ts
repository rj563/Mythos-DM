
export interface Stats {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface Character {
  id: string;
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
  color: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  senderId?: string;
  senderName?: string;
  timestamp: number;
}

export type SessionMode = 'solo' | 'online';

export interface GameState {
  party: Character[];
  activeCharacterId: string;
  history: Message[];
  isStarted: boolean;
  sessionId?: string;
  sessionMode?: SessionMode;
  totalTokensUsed: number;
}

export interface DiceRoll {
  sides: number;
  result: number;
  bonus: number;
  total: number;
  characterId: string;
}
