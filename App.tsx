import React, { useState, useEffect, useRef } from 'react';
import { GameState, GameState as GameStateType, Message, Character, DiceRoll, SessionMode, GeminiModelId, AppPhase, PlayerStatus, SavedSaga, LevelUpChoice, UserProfile } from './types';
import { generateRoomCode, PREMADE_HEROES, CHARACTER_COLORS, DND_RACES, RACE_DETAILS } from './constants';
import { dmService, ClassSuggestion } from './services/geminiService';
import ChatInterface from './components/ChatInterface';
import CharacterSheet from './components/CharacterSheet';
import LoginScreen from './components/LoginScreen';
import ShopModal from './components/ShopModal';
import { Sword, AlertCircle, Plus, Users, Share2, Globe, User, Users2, Flame, Tent, Battery, Key, ShieldCheck, Zap, Brain, Sparkles, Check, X, ShieldAlert, ChevronRight, RefreshCw, Wand2, Shield, Scroll, Loader2, Heart, Briefcase, Wand, Save, BookMarked, Download, Upload, History, Trash2, Layout, BookOpen, Crown, Menu, LogOut, Settings, ArrowLeft, Search, Lock, Feather, Skull, Gem } from 'lucide-react';
import Gun from 'gun';

// In a real implementation, you would import these from firebase.ts
// import { auth, db } from './firebase';
// import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
// import { doc, getDoc, setDoc } from 'firebase/firestore';

const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const MAX_SAGA_TOKENS = 1000000; 

// Markup Multiplier: 30% Profit Margin
const TOKEN_MARKUP = 1.3;

const MODEL_OPTIONS: { id: GeminiModelId, name: string, icon: any, desc: string, sub: string, color: string }[] = [
  { id: 'gemini-3-pro-preview', name: 'The Arch-Mage', icon: Brain, desc: 'Deepest reasoning. Best for complex logic.', sub: 'Model: Gemini 3 Pro (Higher Cost)', color: 'amber' },
  { id: 'gemini-3-flash-preview', name: 'The Swift Rogue', icon: Zap, desc: 'Balanced and fast. Ideal for storytelling.', sub: 'Model: Gemini 3 Flash (Balanced)', color: 'sky' },
  { id: 'gemini-flash-lite-latest', name: 'The Nimble Sprite', icon: Sparkles, desc: 'Ultra-efficient. Conserves saga energy.', sub: 'Model: Flash Lite (Lowest Cost)', color: 'emerald' }
];

const FloatingTooltip = ({ title, meta, desc, stats, pos }: any) => (
  <div 
    className="fixed z-[100] pointer-events-none bg-slate-950/95 border border-amber-500/30 p-4 rounded-xl shadow-2xl w-64 animate-in fade-in duration-150 backdrop-blur-md"
    style={{ top: pos.y + 16, left: pos.x + 16 }}
  >
    <h4 className="fantasy-font text-lg text-white mb-1">{title}</h4>
    <p className="text-[10px] text-amber-500 font-bold uppercase mb-3 tracking-widest">{meta}</p>
    {stats && (
      <div className="grid grid-cols-3 gap-1 mb-3">
         {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="bg-slate-900 p-1.5 rounded border border-slate-800 text-center">
               <div className="text-[8px] text-slate-500 uppercase font-bold">{k}</div>
               <div className="text-white font-bold text-xs">{v as number}</div>
            </div>
         ))}
      </div>
    )}
    <p className="text-xs text-slate-400 italic leading-relaxed font-serif">{desc}</p>
  </div>
);

const App: React.FC = () => {
  const myPlayerId = useRef(crypto.randomUUID());
  
  // User State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true); // Default to true since we handle tokens now

  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('mythos-dm-state-current');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      party: [],
      activeCharacterId: '',
      history: [],
      isStarted: false,
      totalTokensUsed: 0,
      modelId: 'gemini-3-pro-preview',
      phase: 'LOGIN', // Start at Login now
      players: {},
      isHost: true
    };
  });

  const [savedSagas, setSavedSagas] = useState<SavedSaga[]>(() => {
    const saved = localStorage.getItem('mythos-dm-vault');
    return saved ? JSON.parse(saved) : [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showQuickStats, setShowQuickStats] = useState(false);
  const [levelUpOptions, setLevelUpOptions] = useState<LevelUpChoice[]>([]);
  const [isLeveling, setIsLeveling] = useState(false);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Tooltip State
  const [hoveredHero, setHoveredHero] = useState<any | null>(null);
  const [hoveredRace, setHoveredRace] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const [adventureTone, setAdventureTone] = useState<'action' | 'mystery'>('action');
  const [difficulty, setDifficulty] = useState<'story' | 'standard' | 'deadly'>('standard');
  
  const isRemoteChange = useRef(false);

  // Character Forge State
  const [forgeStep, setForgeStep] = useState(0);
  const [forgeStyle, setForgeStyle] = useState<'classic' | 'wild'>('classic');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [classConcept, setClassConcept] = useState(''); 
  const [classSuggestion, setClassSuggestion] = useState<ClassSuggestion | null>(null);
  const [forgeData, setForgeData] = useState<Partial<Character>>({
    name: '', race: '', class: '', notes: '', level: 1, hp: 10, maxHp: 10, ac: 12,
    stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    inventory: ["Explorer's Pack"], color: CHARACTER_COLORS[0]
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Initialize DM Service
  useEffect(() => {
    if (process.env.API_KEY) {
      dmService.setApiKey(process.env.API_KEY);
    }
  }, []);

  const handleLogin = async () => {
    // MOCK LOGIN FOR UI DEMO - Replace with Firebase Auth logic
    setUser({
      uid: "mock-user-123",
      displayName: "Adventurer",
      email: "hero@example.com",
      photoURL: null,
      aetherBalance: 50000 // Starting balance
    });
    setGameState(prev => ({ ...prev, phase: 'MODE_SELECT' }));
  };

  const handleGuestLogin = () => {
     setUser({
      uid: "guest-" + crypto.randomUUID(),
      displayName: "Guest",
      email: null,
      photoURL: null,
      aetherBalance: 10000 // Small starting balance
    });
    setGameState(prev => ({ ...prev, phase: 'MODE_SELECT' }));
  }

  // Cost Logic: Deduct tokens with 30% markup
  const deductTokens = (rawTokens: number) => {
    if (!user) return;
    const cost = Math.ceil(rawTokens * TOKEN_MARKUP);
    setUser(prev => prev ? ({ ...prev, aetherBalance: prev.aetherBalance - cost }) : null);
    // In real app: await updateDoc(doc(db, "users", user.uid), { aetherBalance: increment(-cost) });
  };

  // Set initial tab
  useEffect(() => {
    if (gameState.party.length > 0 && !activeTabId) {
      setActiveTabId(gameState.party[0].id);
    }
  }, [gameState.party]);

  useEffect(() => {
    const recover = async () => {
      if (gameState.phase === 'ADVENTURE' && gameState.isStarted && !dmService.isActive()) {
        try {
          await dmService.startAdventure(gameState.party, gameState.history, gameState.modelId, 'action', 'standard'); // Default to standard on recovery
        } catch (e) {
          setError("Failed to reconnect to the Dungeon Master.");
        }
      }
    };
    recover();
  }, [gameState.phase, gameState.isStarted]);

  useEffect(() => {
    if (gameState.sessionMode !== 'online' || !gameState.sessionId) return;
    setIsSyncing(true);
    const room = gun.get('mythos-dm-session-' + gameState.sessionId);
    room.on((data) => {
      if (data && data.state) {
        try {
          const remoteState = JSON.parse(data.state);
          isRemoteChange.current = true;
          setGameState(prev => ({
            ...prev,
            ...remoteState,
            phase: prev.phase === 'LOGIN' || prev.phase === 'MODE_SELECT' || prev.phase === 'LOBBY' ? remoteState.phase : prev.phase
          }));
          setTimeout(() => { isRemoteChange.current = false; }, 100);
        } catch (e) { console.error("Sync error", e); }
      }
    });
    return () => { room.off(); };
  }, [gameState.sessionId, gameState.sessionMode]);

  useEffect(() => {
    localStorage.setItem('mythos-dm-state-current', JSON.stringify(gameState));
    if (gameState.sessionMode === 'online' && gameState.sessionId && !isRemoteChange.current) {
      gun.get('mythos-dm-session-' + gameState.sessionId).put({ state: JSON.stringify(gameState) });
    }
  }, [gameState]);

  const handleSaveSaga = () => {
    const name = gameState.party[0]?.name ? `Saga of ${gameState.party[0].name}` : `Saga ${new Date().toLocaleDateString()}`;
    const newSaga: SavedSaga = {
      id: gameState.sessionId || crypto.randomUUID(),
      name,
      state: { ...gameState, lastSavedAt: Date.now() },
      timestamp: Date.now()
    };
    const updated = [newSaga, ...savedSagas.filter(s => s.id !== newSaga.id)].slice(0, 10);
    setSavedSagas(updated);
    localStorage.setItem('mythos-dm-vault', JSON.stringify(updated));
    setSaveStatus("Etched in Vault");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const loadSaga = (saga: SavedSaga) => {
    setGameState({
      ...saga.state,
      isStarted: true,
      phase: 'ADVENTURE'
    });
  };

  const handleExportSaga = () => {
    const dataStr = JSON.stringify(gameState, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mythos_saga_${gameState.party[0]?.name || 'adventure'}.json`;
    link.click();
  };

  const handleImportSaga = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const state = JSON.parse(event.target?.result as string);
        setGameState({ ...state, phase: 'ADVENTURE' });
      } catch (err) { alert("Failed to read the Scroll."); }
    };
    reader.readAsText(file);
  };

  const deleteSaga = (id: string) => {
    const updated = savedSagas.filter(s => s.id !== id);
    setSavedSagas(updated);
    localStorage.setItem('mythos-dm-vault', JSON.stringify(updated));
  };

  const handleStartAdventure = async () => {
    if (user && user.aetherBalance <= 0) {
       setError("Insufficient Aether. Please visit the Goblin Market.");
       setIsShopOpen(true);
       return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const finalParty = gameState.party;
      const sessionId = gameState.sessionMode === 'online' ? (gameState.sessionId || generateRoomCode()) : undefined;
      
      const { text, tokens } = await dmService.startAdventure(finalParty, gameState.history, gameState.modelId, adventureTone, difficulty);
      
      if (tokens) deductTokens(tokens);

      setGameState(prev => ({
        ...prev, 
        party: finalParty,
        history: gameState.history.length === 0 ? [{ role: 'model', text, timestamp: Date.now() }] : prev.history,
        isStarted: true, 
        phase: 'ADVENTURE', 
        activeCharacterId: finalParty[0]?.id || '',
        totalTokensUsed: tokens ? prev.totalTokensUsed + tokens : prev.totalTokensUsed,
        sessionId: sessionId
      }));
    } catch (err: any) { 
      if (err.message === "API_KEY_EXPIRED") {
        setHasApiKey(false);
        setError("Your API Key has expired or was revoked. Please reconnect.");
      } else {
        setError("The DM could not be summoned."); 
      }
    } finally { setIsLoading(false); }
  };

  const handleJoinSession = () => {
    if (!joinCodeInput) return;
    setGameState(prev => ({
      ...prev,
      sessionMode: 'online',
      sessionId: joinCodeInput,
      phase: 'LOBBY',
      isHost: false
    }));
  };

  const handleSendMessage = async (text: string, charId: string) => {
    if (user && user.aetherBalance <= 0) {
       setError("Insufficient Aether.");
       setIsShopOpen(true);
       return;
    }

    const char = gameState.party.find(c => c.id === charId);
    const enrichedText = `**${char?.name || 'Adventurer'}**: ${text}`;
    setGameState(prev => ({ ...prev, history: [...prev.history, { role: 'user', text: enrichedText, senderId: charId, senderName: char?.name, timestamp: Date.now() }] }));
    setIsLoading(true);
    try {
      let fullText = "";
      await dmService.streamMessage(enrichedText, (chunk) => { fullText += chunk; }, (tokens) => {
        setGameState(prev => ({ ...prev, totalTokensUsed: tokens }));
        deductTokens(tokens);
      });
      
      // Robust Regex for multi-line JSON with loose spacing. Matches {{UPDATE_SHEET: ... }} across newlines
      const sheetUpdateRegex = /\{\{\s*UPDATE_SHEET\s*:([\s\S]+?)\}\}/g;
      const sheetUpdates: any[] = [];
      let match;
      
      while ((match = sheetUpdateRegex.exec(fullText)) !== null) {
        try {
          let jsonStr = match[1].trim();
          // Sanitize: Remove markdown code blocks if the model ignored instructions and wrapped JSON in ```json ... ```
          if (jsonStr.startsWith('```')) {
             jsonStr = jsonStr.replace(/^```(?:json)?/, '').replace(/```$/, '');
          }
          const updates = JSON.parse(jsonStr);
          sheetUpdates.push(updates);
        } catch (e) { console.error("Sheet update parse error", e); }
      }

      if (sheetUpdates.length > 0) {
        setGameState(prev => {
          let updatedParty = [...prev.party];
          sheetUpdates.forEach(update => {
            updatedParty = updatedParty.map(c => c.id === update.id ? { ...c, ...update } : c);
          });
          return { ...prev, party: updatedParty };
        });
      }

      // Capture triggers before cleaning
      const rollMatch = fullText.match(/\{\{\s*ROLL\s*:\s*([^}]+)\s*\}\}/i);
      const levelUpMatch = fullText.match(/\{\{\s*LEVEL_UP\s*\}\}/);

      // Clean text - Remove artifacts aggressively
      // Ensure we consume the patterns completely, including newlines inside them
      const processedText = fullText
        .replace(/\{\{\s*ROLL\s*:[\s\S]*?\}\}/gi, '')
        .replace(/\{\{\s*LEVEL_UP\s*\}\}/gi, '')
        .replace(/\{\{\s*UPDATE_SHEET\s*:[\s\S]*?\}\}/gi, '')
        .trim();

      setGameState(prev => ({ 
        ...prev, 
        history: [...prev.history, { 
          role: 'model', 
          text: processedText, 
          timestamp: Date.now(),
          suggestedRoll: rollMatch ? rollMatch[1].trim() : undefined,
          triggerLevelUp: !!levelUpMatch,
          hasSheetUpdate: sheetUpdates.length > 0
        }],
        showLevelUp: !!levelUpMatch || prev.showLevelUp
      }));
    } catch (err: any) { 
      if (err.message === "API_KEY_EXPIRED" || err.message?.includes("API_KEY")) {
        setHasApiKey(false);
        setError("Your API Key has expired. Please reconnect.");
      } else {
        setError("DM connection lost."); 
      }
    } finally { setIsLoading(false); }
  };

  const handleSuggestClasses = async () => {
    if (!classConcept || !forgeData.race) return;
    setIsSuggesting(true);
    try {
      const suggestion = await dmService.suggestClasses(classConcept, forgeData.race, forgeStyle, gameState.modelId);
      if (suggestion) {
        setClassSuggestion(suggestion);
        setForgeData(prev => ({...prev, stats: suggestion.stats}));
        setForgeStep(4);
      }
    } catch (e: any) {
      if (e.message?.includes("API_KEY") || e.message?.includes("API_KEY_MISSING")) {
         setHasApiKey(false);
         setError("API Key Required.");
      } else {
         setError("The Oracle is silent. Try again later.");
      }
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleFinalizeForge = async () => {
    if (!classSuggestion) return;
    setIsLoading(true);
    try {
      const sheet = await dmService.generateCharacterSheet(
        forgeData.name || '',
        forgeData.race || '',
        `${classSuggestion.className} (${classSuggestion.subclassName})`,
        classConcept,
        forgeData.stats,
        gameState.modelId
      );
      const newChar = { ...forgeData, ...sheet, class: `${classSuggestion.className} (${classSuggestion.subclassName})`, notes: sheet.notes, ownerId: myPlayerId.current };
      setForgeData(newChar);
      setGameState(prev => ({ ...prev, phase: 'CHAR_REVIEW' }));
    } catch (e) {
      setError("Character manifestation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLevelUp = async () => {
    const char = gameState.party.find(c => c.id === gameState.activeCharacterId) || gameState.party[0];
    setIsLeveling(true);
    try {
      const options = await dmService.getLevelUpOptions(char, gameState.modelId);
      setLevelUpOptions(options);
    } catch (e) { setError("Failed to fetch level up options."); } finally { setIsLeveling(false); }
  };

  const acceptLevelUp = (choice: LevelUpChoice) => {
    const char = gameState.party.find(c => c.id === gameState.activeCharacterId);
    if (char) {
      handleSendMessage(`I choose to learn **${choice.name}** (${choice.category}). Please update my character sheet, roll my Hit Die for HP increase, and describe my new powers!`, char.id);
    }
    setLevelUpOptions([]);
    setGameState(prev => ({ ...prev, showLevelUp: false }));
  };

  const handleReturnToMenu = () => {
    if (gameState.phase === 'ADVENTURE' && gameState.party.length > 0) {
      const id = gameState.sessionId || crypto.randomUUID();
      const name = gameState.party[0]?.name ? `Saga of ${gameState.party[0].name}` : `Saga ${new Date().toLocaleDateString()}`;
      
      const newSaga: SavedSaga = {
        id,
        name,
        state: { ...gameState, sessionId: id, lastSavedAt: Date.now() },
        timestamp: Date.now()
      };
      
      const updated = [newSaga, ...savedSagas.filter(s => s.id !== id)].slice(0, 10);
      setSavedSagas(updated);
      localStorage.setItem('mythos-dm-vault', JSON.stringify(updated));
    }

    setGameState({
      party: [],
      activeCharacterId: '',
      history: [],
      isStarted: false,
      totalTokensUsed: 0,
      modelId: 'gemini-3-pro-preview',
      phase: 'MODE_SELECT',
      players: {},
      isHost: true
    });
    setIsMenuOpen(false);
  };

  const renderPhase = () => {
    switch (gameState.phase) {
      case 'LOGIN':
         return <LoginScreen onLogin={handleLogin} onGuest={handleGuestLogin} />

      case 'MODE_SELECT':
        return (
          <div className="max-w-6xl w-full grid grid-cols-1 gap-16 animate-in fade-in duration-700 pt-28 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-12">
                <h2 className="fantasy-font text-8xl text-amber-500 tracking-tighter">Gateway</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button onClick={() => setGameState(prev => ({ ...prev, sessionMode: 'solo', phase: 'MODEL_SELECT', isHost: true }))} className="group bg-slate-900 border border-slate-800 hover:border-amber-500 p-8 rounded-[32px] flex flex-col items-center gap-6 transition-all hover:-translate-y-2 shadow-xl">
                    <User size={60} className="text-slate-600 group-hover:text-amber-500" />
                    <div className="text-center">
                      <h3 className="fantasy-font text-2xl text-white">Lone Hero</h3>
                      <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Local Saga</p>
                    </div>
                  </button>
                  <div className="group bg-slate-900 border border-slate-800 hover:border-sky-500 p-8 rounded-[32px] flex flex-col items-center gap-6 transition-all hover:-translate-y-2 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Users2 size={60} className="text-slate-600 group-hover:text-sky-500" />
                    <div className="text-center w-full z-10 space-y-4">
                      <h3 className="fantasy-font text-2xl text-white">The Fellowship</h3>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => setGameState(prev => ({ ...prev, sessionMode: 'online', phase: 'MODEL_SELECT', isHost: true }))} className="w-full py-3 bg-slate-800 hover:bg-sky-600 text-sky-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all">Host Saga</button>
                        <div className="flex gap-2">
                          <input 
                            value={joinCodeInput} 
                            onChange={(e) => setJoinCodeInput(e.target.value)} 
                            placeholder="Code..." 
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-xs font-mono uppercase focus:border-sky-500 outline-none"
                          />
                          <button onClick={handleJoinSession} className="px-4 py-3 bg-slate-800 hover:bg-sky-600 text-white rounded-xl"><ChevronRight size={16}/></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-8 border-t border-slate-900">
                   <label className="flex items-center gap-4 px-8 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-sm font-bold uppercase tracking-widest cursor-pointer transition-all shadow-xl w-full">
                      <Upload size={20} className="text-amber-500" />
                      Restore from Scroll (JSON)
                      <input type="file" accept=".json" onChange={handleImportSaga} className="hidden" />
                   </label>
                </div>
              </div>

              <div className="space-y-6 bg-slate-900/50 p-8 rounded-[40px] border border-slate-900 shadow-2xl overflow-hidden flex flex-col h-[500px]">
                <div className="flex items-center gap-3 text-amber-500">
                  <History size={28} />
                  <h3 className="fantasy-font text-3xl">Hall of Heroes</h3>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                  {savedSagas.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-slate-700 font-mono uppercase tracking-widest text-xs italic">
                      "No inscriptions yet. Your deeds await."
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {savedSagas.map(saga => (
                        <div key={saga.id} className="group relative bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:border-amber-500/50 transition-all flex items-center justify-between">
                          <button onClick={() => loadSaga(saga)} className="flex-1 text-left flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center text-amber-500 font-bold border border-slate-800 text-sm">
                                {saga.state.party[0]?.name[0] || '?'}
                            </div>
                            <div>
                              <h4 className="fantasy-font text-lg text-slate-200 group-hover:text-amber-500 transition-colors truncate w-40">{saga.name}</h4>
                              <p className="text-[9px] text-slate-500 uppercase tracking-tighter">Lv.{saga.state.party[0]?.level || 1} • {new Date(saga.timestamp).toLocaleDateString()}</p>
                            </div>
                          </button>
                          <button onClick={() => deleteSaga(saga.id)} className="p-2 text-slate-700 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'MODEL_SELECT':
        return (
          <div className="max-w-5xl w-full space-y-12 animate-in slide-in-from-bottom-8 duration-500 pt-24">
            <h2 className="fantasy-font text-6xl text-amber-500 text-center">Chamber of Spirits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {MODEL_OPTIONS.map(m => (
                <button key={m.id} onClick={() => setGameState(prev => ({ ...prev, modelId: m.id, phase: 'CHAR_SELECT' }))} className={`group p-8 rounded-[32px] border transition-all text-left flex flex-col gap-6 bg-slate-900/50 border-slate-800 hover:border-${m.color}-500/50`}>
                  <div className={`p-4 rounded-2xl bg-${m.color}-500/20 text-${m.color}-500`}><m.icon size={40} /></div>
                  <h4 className="fantasy-font text-2xl text-white">{m.name}</h4>
                  <p className="text-sm text-slate-400">{m.desc}</p>
                  <div className="mt-auto pt-4 border-t border-white/5">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 group-hover:text-slate-300">{m.sub}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex justify-center">
               <button onClick={() => setGameState(prev => ({ ...prev, phase: 'MODE_SELECT' }))} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-bold text-xs tracking-widest"><ArrowLeft size={16}/> Back</button>
            </div>
          </div>
        );

      case 'CHAR_SELECT':
        return (
          <div className="max-w-7xl w-full grid grid-cols-1 gap-12 animate-in fade-in duration-700 pt-24 pb-12 relative">
            {hoveredHero && (
               <FloatingTooltip 
                  title={hoveredHero.name} 
                  meta={`${hoveredHero.race} • ${hoveredHero.class}`} 
                  desc={hoveredHero.notes}
                  stats={hoveredHero.stats}
                  pos={mousePos}
               />
            )}
            
            <div className="space-y-10">
              <div className="flex justify-between items-center">
                  <h2 className="fantasy-font text-6xl text-amber-500">Manifest Hero</h2>
                  <button onClick={() => { setForgeStep(0); setGameState(prev => ({ ...prev, phase: 'CHAR_FORGE' })); }} className="py-4 px-8 border-2 border-dashed border-amber-600/50 rounded-[24px] text-amber-500 hover:text-white hover:bg-amber-600 transition-all font-bold flex items-center gap-3 bg-slate-900/50">
                    <Plus size={24} /> <span>Open The Forge (Custom)</span>
                  </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PREMADE_HEROES.map((hero, i) => (
                  <button 
                     key={i} 
                     onClick={() => { 
                       const char = { ...hero, id: crypto.randomUUID(), ownerId: myPlayerId.current } as Character; 
                       setForgeData(char); // Load into forge data for review
                       setGameState(prev => ({ ...prev, phase: 'CHAR_REVIEW' })); 
                     }} 
                     onMouseEnter={() => setHoveredHero(hero)}
                     onMouseLeave={() => setHoveredHero(null)}
                     className="w-full flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-[24px] hover:border-amber-500 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg" style={{ backgroundColor: hero.color }}>{hero.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="fantasy-font text-lg text-white truncate group-hover:text-amber-400 transition-colors">{hero.name}</h4>
                      <p className="text-[10px] text-slate-500 uppercase truncate">{hero.race} • {hero.class}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-center pt-8">
               <button onClick={() => setGameState(prev => ({ ...prev, phase: 'MODEL_SELECT' }))} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-bold text-xs tracking-widest"><ArrowLeft size={16}/> Back</button>
            </div>
            </div>
          </div>
        );

      case 'CHAR_FORGE':
        return (
          <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-[50px] p-16 shadow-2xl animate-in zoom-in duration-500 pt-16 relative">
             {hoveredRace && RACE_DETAILS[hoveredRace] && (
               <FloatingTooltip 
                  title={hoveredRace}
                  meta={RACE_DETAILS[hoveredRace].bonus}
                  desc={RACE_DETAILS[hoveredRace].desc}
                  pos={mousePos}
               />
             )}
            <div className="space-y-12">
               <div className="flex gap-2 mb-10">
                  {[0,1,2,3,4].map(i => <div key={i} className={`h-1 w-12 rounded-full ${i <= forgeStep ? 'bg-amber-500' : 'bg-slate-800'}`} />)}
               </div>

               {forgeStep === 0 && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-right-8">
                   <h2 className="fantasy-font text-5xl text-amber-500">Choose your Path</h2>
                   <div className="grid grid-cols-2 gap-6">
                     <button onClick={() => { setForgeStyle('classic'); setForgeStep(1); }} className="p-8 bg-slate-950 border border-slate-800 hover:border-amber-500 rounded-3xl text-left transition-all hover:-translate-y-1 group">
                        <Shield className="w-12 h-12 text-sky-500 mb-4 group-hover:scale-110 transition-transform"/>
                        <h3 className="fantasy-font text-3xl text-white mb-2">Classic Hero</h3>
                        <p className="text-slate-400 text-sm">Reliable archetypes from the core rules. Best for traditional adventures.</p>
                     </button>
                     <button onClick={() => { setForgeStyle('wild'); setForgeStep(1); }} className="p-8 bg-slate-950 border border-slate-800 hover:border-amber-500 rounded-3xl text-left transition-all hover:-translate-y-1 group">
                        <Flame className="w-12 h-12 text-rose-500 mb-4 group-hover:scale-110 transition-transform"/>
                        <h3 className="fantasy-font text-3xl text-white mb-2">Wild Soul</h3>
                        <p className="text-slate-400 text-sm">Exotic, unconventional, and experimental builds. Expect the unexpected.</p>
                     </button>
                   </div>
                   <button onClick={() => setGameState(prev => ({...prev, phase: 'CHAR_SELECT'}))} className="text-slate-600 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2"><ArrowLeft size={14}/> Cancel Forge</button>
                 </div>
               )}

               {forgeStep === 1 && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                    <h2 className="fantasy-font text-5xl text-amber-500">What is your name?</h2>
                    <input autoFocus className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-8 py-6 text-2xl text-white focus:border-amber-500 outline-none" placeholder="Name..." value={forgeData.name} onChange={e => setForgeData({...forgeData, name: e.target.value})} onKeyDown={e => e.key === 'Enter' && setForgeStep(2)} />
                    <button onClick={() => setForgeStep(0)} className="text-slate-600 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2"><ArrowLeft size={14}/> Back</button>
                 </div>
               )}
               {forgeStep === 2 && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                    <h2 className="fantasy-font text-5xl text-amber-500">Of what race?</h2>
                    <div className="grid grid-cols-3 gap-4">
                      {DND_RACES.map(r => (
                        <button 
                          key={r} 
                          onClick={() => { setForgeData({...forgeData, race: r}); setForgeStep(3); }} 
                          onMouseEnter={() => setHoveredRace(r)}
                          onMouseLeave={() => setHoveredRace(null)}
                          className="py-4 bg-slate-950 border border-slate-800 hover:border-amber-500 text-white rounded-xl uppercase text-xs font-bold tracking-widest"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setForgeStep(1)} className="text-slate-600 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2"><ArrowLeft size={14}/> Back</button>
                 </div>
               )}
               {forgeStep === 3 && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                    <h2 className="fantasy-font text-5xl text-amber-500">The Legend Begins...</h2>
                    <div className="space-y-2">
                      <p className="text-slate-400 text-sm">Describe your character's concept, combat style, and origin story in one go. The DM will suggest the perfect class and stats.</p>
                      <textarea autoFocus className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-8 py-6 text-xl text-white min-h-[200px] outline-none focus:border-amber-500" placeholder="Ex: I was a street urchin who found a cursed tome. I want to blast enemies with fire but also be sneaky..." value={classConcept} onChange={e => setClassConcept(e.target.value)} />
                    </div>
                    <button onClick={handleSuggestClasses} disabled={isSuggesting} className="w-full py-5 bg-sky-600 rounded-2xl text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-sky-500 transition-all">{isSuggesting ? <Loader2 className="animate-spin"/> : <Sparkles/>} Reveal Destiny ({forgeStyle})</button>
                    <button onClick={() => setForgeStep(2)} className="text-slate-600 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2"><ArrowLeft size={14}/> Back</button>
                 </div>
               )}
               {forgeStep === 4 && classSuggestion && (
                 <div className="space-y-8 animate-in zoom-in">
                    <div className="p-10 rounded-[40px] bg-slate-950 border-2 border-amber-500 shadow-2xl text-center space-y-6">
                       <div>
                         <h4 className="fantasy-font text-4xl text-amber-500 mb-2">{classSuggestion.className}</h4>
                         <p className="text-sky-400 font-bold uppercase text-xs mb-4">{classSuggestion.subclassName}</p>
                         <p className="text-slate-300 italic">"{classSuggestion.flavorText}"</p>
                       </div>
                       
                       <div className="pt-6 border-t border-slate-800">
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-4">Projected Attributes</p>
                          <div className="grid grid-cols-6 gap-2">
                             {Object.entries(classSuggestion.stats).map(([k, v]) => (
                               <div key={k} className="bg-slate-900 border border-slate-800 rounded-lg p-2">
                                  <div className="text-[10px] uppercase text-slate-500 font-bold">{k}</div>
                                  <div className="text-xl text-white font-bold">{v}</div>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setForgeStep(3)} className="flex-1 py-6 bg-slate-800 rounded-2xl text-slate-400 hover:text-white font-bold uppercase border border-slate-700 hover:bg-slate-700">Try Again</button>
                      <button onClick={handleFinalizeForge} disabled={isLoading} className="flex-[2] py-6 bg-emerald-600 rounded-2xl text-white font-bold uppercase flex items-center justify-center gap-3 shadow-xl hover:bg-emerald-500 transition-all">{isLoading ? <Loader2 className="animate-spin"/> : <Check />} Accept Destiny</button>
                    </div>
                 </div>
               )}
            </div>
          </div>
        );

      case 'CHAR_REVIEW':
        return (
          <div className="max-w-4xl w-full space-y-8 animate-in zoom-in py-8">
            <div className="w-full flex justify-start">
               <button onClick={() => setGameState(prev => ({ ...prev, phase: 'CHAR_SELECT' }))} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-bold text-xs tracking-widest px-4 py-2 rounded-lg hover:bg-slate-800"><ArrowLeft size={16}/> Back to Selection</button>
            </div>
            <h2 className="fantasy-font text-7xl text-amber-500 text-center">Chronicle Entry</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-[50px] overflow-hidden shadow-2xl p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-6">
                  <div className="w-24 h-24 rounded-3xl bg-slate-950 flex items-center justify-center text-4xl font-bold text-white border-2 border-slate-800" style={{ backgroundColor: forgeData.color }}>{forgeData.name?.[0]}</div>
                  <h3 className="fantasy-font text-4xl text-white">{forgeData.name}</h3>
                  <p className="text-amber-500 uppercase text-xs font-bold tracking-widest">{forgeData.race} • {forgeData.class}</p>
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    {Object.entries(forgeData.stats || {}).map(([s, v]) => <div key={s} className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center"><span className="text-[10px] uppercase text-slate-600 block">{s}</span><span className="font-bold text-white">{v as number}</span></div>)}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-8">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="pt-6 border-t border-slate-800 space-y-4">
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Adventure Tone</p>
                          <div className="grid grid-cols-1 gap-2">
                            <button onClick={() => setAdventureTone('action')} className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${adventureTone === 'action' ? 'bg-amber-600/20 border-amber-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                                <Sword size={16} className={adventureTone === 'action' ? 'text-amber-500' : 'text-slate-600'} />
                                <div className="text-left">
                                  <div className="font-bold text-xs uppercase">Action</div>
                                </div>
                            </button>
                            <button onClick={() => setAdventureTone('mystery')} className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${adventureTone === 'mystery' ? 'bg-sky-600/20 border-sky-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                                <Search size={16} className={adventureTone === 'mystery' ? 'text-sky-500' : 'text-slate-600'} />
                                <div className="text-left">
                                  <div className="font-bold text-xs uppercase">Mystery</div>
                                </div>
                            </button>
                          </div>
                      </div>
                      
                      <div className="pt-6 border-t border-slate-800 space-y-4">
                          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Challenge Level</p>
                          <div className="grid grid-cols-1 gap-2">
                            <button onClick={() => setDifficulty('story')} className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${difficulty === 'story' ? 'bg-emerald-600/20 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                                <Feather size={16} className={difficulty === 'story' ? 'text-emerald-500' : 'text-slate-600'} />
                                <div className="text-left">
                                  <div className="font-bold text-xs uppercase">Story Mode</div>
                                  <div className="text-[9px] opacity-70">Focus on narrative. Enemies are weaker.</div>
                                </div>
                            </button>
                            <button onClick={() => setDifficulty('standard')} className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${difficulty === 'standard' ? 'bg-amber-600/20 border-amber-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                                <Shield size={16} className={difficulty === 'standard' ? 'text-amber-500' : 'text-slate-600'} />
                                <div className="text-left">
                                  <div className="font-bold text-xs uppercase">Standard</div>
                                  <div className="text-[9px] opacity-70">Balanced combat rules.</div>
                                </div>
                            </button>
                            <button onClick={() => setDifficulty('deadly')} className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${difficulty === 'deadly' ? 'bg-rose-600/20 border-rose-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                                <Skull size={16} className={difficulty === 'deadly' ? 'text-rose-500' : 'text-slate-600'} />
                                <div className="text-left">
                                  <div className="font-bold text-xs uppercase">Deadly</div>
                                  <div className="text-[9px] opacity-70">Ruthless tactics & tougher foes.</div>
                                </div>
                            </button>
                          </div>
                      </div>
                   </div>

                   <div>
                     <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-2 mt-4"><Briefcase size={12}/> Equipment</h4>
                     <div className="flex flex-wrap gap-2">{forgeData.inventory?.map((it, i) => <span key={i} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300">• {it}</span>)}</div>
                   </div>
                   
                   <button onClick={() => { const char = { ...forgeData, id: crypto.randomUUID(), ownerId: myPlayerId.current } as Character; setGameState(prev => ({ ...prev, party: [char], phase: 'LOBBY' })); }} className="w-full py-6 bg-amber-600 rounded-2xl text-white font-bold uppercase text-lg shadow-xl hover:bg-amber-500 transition-all">Embark on Quest</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'LOBBY':
        return (
          <div className="max-w-md w-full space-y-12 text-center animate-in zoom-in pt-24">
             <BookMarked className="mx-auto text-amber-500" size={100} />
             <div className="space-y-4">
               <h2 className="fantasy-font text-5xl text-white">The Party Circle</h2>
               {gameState.sessionId && <p className="text-emerald-500 font-bold tracking-[0.2em] uppercase text-xl animate-pulse">Code: {gameState.sessionId}</p>}
             </div>
             
             {gameState.isHost ? (
               <button onClick={handleStartAdventure} disabled={isLoading} className="w-full py-8 bg-amber-600 rounded-[32px] text-white font-bold text-2xl shadow-2xl hover:bg-amber-500 transition-all flex items-center justify-center gap-4">
                 {isLoading ? <Loader2 className="animate-spin"/> : <Crown />} Begin Saga
               </button>
             ) : (
               <div className="w-full py-8 bg-slate-900 border border-slate-800 rounded-[32px] flex flex-col items-center justify-center gap-4 animate-pulse">
                 <Loader2 className="animate-spin text-sky-500" size={32} />
                 <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Waiting for Host...</span>
               </div>
             )}

             <button onClick={() => setGameState(prev => ({ ...prev, phase: 'MODE_SELECT' }))} className="text-slate-600 hover:text-white text-xs font-bold uppercase tracking-widest">Return to Gateway</button>
          </div>
        );

      default: return null;
    }
  };

  const activeCharInGame = gameState.party.find(c => c.id === gameState.activeCharacterId) || gameState.party[0];
  const selectedModel = MODEL_OPTIONS.find(m => m.id === gameState.modelId) || MODEL_OPTIONS[0];

  const currentHeroForTab = gameState.party.find(p => p.id === activeTabId) || gameState.party[0];

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-6 flex items-center justify-between z-10 shadow-2xl absolute top-0 left-0 w-full">
        <div className="flex items-center gap-4">
          <div className="relative">
             <button 
               onClick={() => setIsMenuOpen(!isMenuOpen)} 
               className="bg-amber-600 hover:bg-amber-500 p-3 rounded-2xl shadow-inner transition-all relative z-50"
             >
               {isMenuOpen ? <X className="text-white w-7 h-7" /> : <Sword className="text-white w-7 h-7" />}
             </button>
             {isMenuOpen && (
               <div className="absolute top-16 left-0 w-64 bg-slate-900 border border-amber-500/50 rounded-2xl shadow-2xl p-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                  <button onClick={handleReturnToMenu} className="w-full text-left p-4 hover:bg-slate-800 rounded-xl flex items-center gap-3 text-amber-500 hover:text-amber-400 transition-colors">
                     <LogOut size={18} />
                     <span className="font-bold uppercase tracking-widest text-xs">Return to Main Menu</span>
                  </button>
               </div>
             )}
          </div>
          <h1 className="fantasy-font text-3xl font-bold tracking-widest text-slate-100 uppercase">Mythos DM</h1>
        </div>
        <div className="flex gap-4 items-center">
          {user && (
             <button 
               onClick={() => setIsShopOpen(true)}
               className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500 px-4 py-2 rounded-xl transition-all group"
             >
               <div className="text-right">
                  <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">Aether Balance</p>
                  <p className="text-sm font-bold text-white group-hover:text-amber-500 transition-colors font-mono">{user.aetherBalance.toLocaleString()}</p>
               </div>
               <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-900 transition-all">
                  <Gem size={16} />
               </div>
             </button>
          )}

          {user && gameState.phase === 'ADVENTURE' && (
            <div className="flex gap-2 relative">
              {saveStatus && (
                <div className="absolute -bottom-10 right-0 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em] bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-500/30 animate-in fade-in slide-in-from-top-2">
                  {saveStatus}
                </div>
              )}
              <button 
                onClick={() => setShowQuickStats(!showQuickStats)} 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all shadow-lg ${showQuickStats ? 'bg-amber-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
              >
                <Layout size={14}/> Stats
              </button>
              <button onClick={handleSaveSaga} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase transition-all shadow-lg"><Save size={14}/> Inscribe</button>
            </div>
          )}
        </div>
      </header>

      {/* Shop Modal */}
      {isShopOpen && user && <ShopModal onClose={() => setIsShopOpen(false)} balance={user.aetherBalance} />}

      <main className="flex-1 flex overflow-hidden relative pt-[88px]">
        {gameState.phase !== 'ADVENTURE' ? (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950 p-8 overflow-y-auto custom-scrollbar">
            {renderPhase()}
          </div>
        ) : (
          <>
            <aside className="hidden lg:flex flex-col w-[500px] border-r border-slate-800 bg-slate-950/50 shadow-2xl">
              <div className="p-2 bg-slate-900 border-b border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar">
                {gameState.party.map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => setActiveTabId(p.id)}
                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all whitespace-nowrap group ${activeTabId === p.id ? 'bg-slate-800 text-amber-500 border border-slate-700' : 'text-slate-500 hover:bg-slate-800/50'}`}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="fantasy-font text-lg tracking-wide">{p.name}</span>
                    <span className="text-[10px] opacity-40">Lv.{p.level}</span>
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {currentHeroForTab && <CharacterSheet character={currentHeroForTab} />}
              </div>
            </aside>
            <section className="flex-1 flex flex-col p-6 bg-[#0c111d] relative">
              {error && <div className="mb-6 bg-rose-500/90 text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl animate-in slide-in-from-top-4 z-50"><div className="flex items-center gap-3"><AlertCircle size={24}/> <span className="font-bold tracking-wide">{error}</span></div><button onClick={()=>setError(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">×</button></div>}
              
              <div className="flex items-center justify-end mb-4 h-12">
                {gameState.showLevelUp && (
                  <button 
                    onClick={handleLevelUp}
                    disabled={isLeveling}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold uppercase text-xs shadow-xl animate-pulse ring-4 ring-amber-500/20"
                  >
                    {isLeveling ? <Loader2 className="animate-spin" size={16}/> : <Zap size={16}/>}
                    Ascension Ready!
                  </button>
                )}
              </div>

              <ChatInterface 
                messages={gameState.history} 
                party={gameState.party} 
                activeCharacterId={gameState.activeCharacterId} 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading} 
                onSetActiveCharacter={(id) => setGameState(prev => ({ ...prev, activeCharacterId: id }))} 
                onRoll={(type) => {
                  const roll = Math.floor(Math.random() * 20) + 1;
                  handleSendMessage(`Performs a **${type}** check. Roll: ${roll}`, activeCharInGame.id);
                }}
                myPlayerId={myPlayerId.current}
                isHost={gameState.isHost}
                sessionMode={gameState.sessionMode}
              />
            </section>

            {/* Quick Stat Panel Overlay */}
            {showQuickStats && (
              <div className="fixed inset-0 z-[55] bg-slate-950/90 backdrop-blur-xl p-6 overflow-y-auto animate-in fade-in slide-in-from-bottom-8 pt-32">
                 <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
                    <h3 className="fantasy-font text-4xl text-amber-500">The Hall of Heroes</h3>
                    <button onClick={() => setShowQuickStats(false)} className="p-4 bg-slate-800 rounded-2xl text-white"><X size={24}/></button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {gameState.party.map(char => (
                      <CharacterSheet key={char.id} character={char} />
                    ))}
                 </div>
              </div>
            )}

            {levelUpOptions.length > 0 && (
              <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-8 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
                <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-[40px] p-10 shadow-2xl space-y-8">
                  <div className="text-center space-y-2">
                    <h3 className="fantasy-font text-5xl text-amber-500">The Hall of Ascension</h3>
                    <p className="text-slate-400 font-serif italic text-lg">Choose the next path in your legend.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {levelUpOptions.map((opt, i) => (
                      <button 
                        key={i} 
                        onClick={() => acceptLevelUp(opt)}
                        className="group p-6 bg-slate-950 border border-slate-800 rounded-3xl hover:border-amber-500 text-left transition-all hover:-translate-y-1 shadow-lg"
                      >
                        <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">{opt.category}</span>
                        <h4 className="fantasy-font text-2xl text-white group-hover:text-amber-500 transition-colors mt-1">{opt.name}</h4>
                        <p className="text-sm text-slate-400 font-serif italic mt-2 leading-relaxed">{opt.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 p-3 flex justify-between items-center text-[10px] text-slate-500 font-mono tracking-widest uppercase">
        <div className="flex gap-6 items-center pl-4">
          <span className={`flex items-center gap-1.5 ${gameState.sessionId ? 'text-emerald-500' : 'text-slate-700'}`}><Globe size={12} /> {gameState.sessionId ? ' fellowship' : ' local'}</span>
        </div>
        <div className="flex gap-4 items-center pr-4">
          <span className="flex items-center gap-2 tracking-[0.3em]"><selectedModel.icon size={12}/> {selectedModel.name.toUpperCase()}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
