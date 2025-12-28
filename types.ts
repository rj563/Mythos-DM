

export interface Stats {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface ClassSuggestion {
  className: string;
  subclassName: string;
  flavorText: string;
  stats: Stats;
}

export interface Character {
  id: string;
  ownerId?: string; // The UUID of the real-world player controlling this character
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
  suggestedRoll?: string;
  triggerLevelUp?: boolean;
  hasSheetUpdate?: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  aetherBalance: number; // The currency for API tokens
}

export type SessionMode = 'solo' | 'online';

export type GeminiModelId = 'gemini-3-pro-preview' | 'gemini-3-flash-preview' | 'gemini-flash-lite-latest';

export type AppPhase = 'LOGIN' | 'MODE_SELECT' | 'MODEL_SELECT' | 'CHAR_SELECT' | 'CHAR_FORGE' | 'CHAR_REVIEW' | 'LOBBY' | 'ADVENTURE';

export interface PlayerStatus {
  id: string;
  name: string;
  character: Character;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface GameState {
  party: Character[];
  activeCharacterId: string;
  history: Message[];
  isStarted: boolean;
  sessionId?: string;
  sessionMode?: SessionMode;
  totalTokensUsed: number;
  modelId: GeminiModelId;
  phase: AppPhase;
  players: Record<string, PlayerStatus>;
  isHost: boolean;
  lastSavedAt?: number;
  showLevelUp?: boolean;
}

export interface DiceRoll {
  sides: number;
  result: number;
  bonus: number;
  total: number;
  characterId: string;
}

export interface SavedSaga {
  id: string;
  name: string;
  state: GameState;
  timestamp: number;
}

export interface LevelUpChoice {
  category: string;
  name: string;
  description: string;
}