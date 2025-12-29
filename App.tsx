import React, { useState, useEffect, useRef } from 'react';
import { GameState, UserProfile, SavedSaga, LevelUpChoice, Character, ClassSuggestion, GeminiModelId } from './types';
import { generateRoomCode, PREMADE_HEROES, CHARACTER_COLORS, DND_RACES, RACE_DETAILS } from './constants';
import { dmService } from './services/geminiService';
import ChatInterface from './components/ChatInterface';
import CharacterSheet from './components/CharacterSheet';
import LoginScreen from './components/LoginScreen';
import ShopModal from './components/ShopModal';
import { 
  Sword, Shield, Scroll, Crown, Users, ArrowLeft, Save, 
  Layout, LogOut, Settings, Gem, Zap, Sparkles, Brain, 
  ChevronRight, History, Trash2, Plus, Skull, Feather, 
  Search, BookMarked, User, Upload, Menu, X, Check, Loader2, Play, Globe, Map, Clock, Type, Home, FileText
} from 'lucide-react';
import Gun from 'gun';

const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const TOKEN_MARKUP = 1.3;

const MODEL_OPTIONS = [
  { id: 'gemini-3-pro-preview', name: 'The Arch-Mage', icon: Brain, desc: 'Deepest reasoning. Best for complex logic.', cost: 'High', color: 'text-amber-500', border: 'border-amber-500/50' },
  { id: 'gemini-3-flash-preview', name: 'The Swift Rogue', icon: Zap, desc: 'Balanced and fast. Ideal for storytelling.', cost: 'Med', color: 'text-sky-500', border: 'border-sky-500/50' },
  { id: 'gemini-flash-lite-latest', name: 'The Nimble Sprite', icon: Sparkles, desc: 'Ultra-efficient. Conserves saga energy.', cost: 'Low', color: 'text-emerald-500', border: 'border-emerald-500/50' }
];

const App: React.FC = () => {
  // --- State Management ---
  const myPlayerId = useRef(crypto.randomUUID());
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');
  
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('mythos-dm-state-current');
    try { return saved ? JSON.parse(saved) : {
      party: [], activeCharacterId: '', history: [], isStarted: false,
      totalTokensUsed: 0, modelId: 'gemini-3-pro-preview', phase: 'LOGIN',
      players: {}, isHost: true
    }; } catch { return { party: [], activeCharacterId: '', history: [], isStarted: false, totalTokensUsed: 0, modelId: 'gemini-3-pro-preview', phase: 'LOGIN', players: {}, isHost: true }; }
  });

  const [savedSagas, setSavedSagas] = useState<SavedSaga[]>(() => {
    try { return JSON.parse(localStorage.getItem('mythos-dm-vault') || '[]'); } catch { return []; }
  });

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  
  // Settings State
  const [dmPersona, setDmPersona] = useState('');
  const [adventureTone, setAdventureTone] = useState<'action' | 'mystery'>('action');
  const [difficulty, setDifficulty] = useState<'story' | 'standard' | 'deadly'>('standard');

  // Forge State
  const [forgeStep, setForgeStep] = useState(0);
  const [forgeData, setForgeData] = useState<Partial<Character>>({});
  const [classConcept, setClassConcept] = useState('');

  // --- Effects ---
  useEffect(() => {
    if (process.env.API_KEY) dmService.setApiKey(process.env.API_KEY);
  }, []);

  useEffect(() => {
    localStorage.setItem('mythos-dm-state-current', JSON.stringify(gameState));
  }, [gameState]);

  // --- Handlers ---
  const handleLogin = () => {
    setUser({ uid: "mock-1", displayName: "Adventurer", email: "hero@test.com", photoURL: null, aetherBalance: 50000 });
    setGameState(prev => ({ ...prev, phase: 'MODE_SELECT' }));
  };

  const deductTokens = (rawTokens: number) => {
    if (user) setUser({ ...user, aetherBalance: Math.max(0, user.aetherBalance - Math.ceil(rawTokens * TOKEN_MARKUP)) });
  };

  const handleStartAdventure = async () => {
    if (user && user.aetherBalance <= 0) { setIsShopOpen(true); return; }
    setIsLoading(true);
    try {
      const sessionId = gameState.sessionMode === 'online' ? (gameState.sessionId || generateRoomCode()) : undefined;
      const { text, tokens } = await dmService.startAdventure(gameState.party, gameState.history, gameState.modelId, adventureTone, difficulty, dmPersona);
      if (tokens) deductTokens(tokens);
      
      setGameState(prev => ({
        ...prev,
        history: prev.history.length === 0 ? [{ role: 'model', text, timestamp: Date.now() }] : prev.history,
        isStarted: true,
        phase: 'ADVENTURE',
        activeCharacterId: prev.party[0]?.id || '',
        sessionId,
        dmPersona // Persist persona
      }));
    } catch (e) { setError("The DM is silent (Check API Key)."); } 
    finally { setIsLoading(false); }
  };

  const handleSendMessage = async (text: string, charId: string) => {
    if (user && user.aetherBalance <= 0) { setIsShopOpen(true); return; }
    
    const char = gameState.party.find(c => c.id === charId);
    const enriched = `**${char?.name || 'Player'}**: ${text}`;
    
    setGameState(prev => ({ ...prev, history: [...prev.history, { role: 'user', text: enriched, senderId: charId, senderName: char?.name, timestamp: Date.now() }] }));
    
    setIsLoading(true);
    try {
      let fullText = "";
      await dmService.streamMessage(enriched, (chunk) => fullText += chunk, (tokens) => deductTokens(tokens));
      
      // Remove SHEET_UPDATE tags and ROLL tags so the user doesn't see them
      const cleanText = fullText
        .replace(/\{\{\s*UPDATE_SHEET\s*:[\s\S]+?\}\}/g, '')
        .replace(/\{\{\s*ROLL\s*:[\s\S]+?\}\}/g, '')
        .trim(); 
      
      setGameState(prev => ({
        ...prev,
        history: [...prev.history, { role: 'model', text: cleanText, timestamp: Date.now() }]
      }));
    } catch { setError("Connection lost."); }
    finally { setIsLoading(false); }
  };

  const handleSave = () => {
    const id = gameState.sessionId || crypto.randomUUID();
    const newSaga = { id, name: `Saga of ${gameState.party[0]?.name || 'Unknown'}`, state: { ...gameState, lastSavedAt: Date.now() }, timestamp: Date.now() };
    const list = [newSaga, ...savedSagas.filter(s => s.id !== id)].slice(0, 10);
    setSavedSagas(list);
    localStorage.setItem('mythos-dm-vault', JSON.stringify(list));
    setSaveStatus("Saved");
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleLoad = (saga: SavedSaga) => {
    setGameState({ ...saga.state, phase: 'ADVENTURE' });
  };

  // Helper to start a completely new game, wiping old state
  const startNewGameFlow = (mode: 'solo' | 'online') => {
    setGameState(prev => ({
      ...prev,
      sessionMode: mode,
      phase: mode === 'online' && !joinCodeInput ? 'MODEL_SELECT' : (mode === 'online' ? 'LOBBY' : 'MODEL_SELECT'), // If joining, skip model select
      isHost: mode === 'solo' || !joinCodeInput,
      sessionId: mode === 'online' && joinCodeInput ? joinCodeInput : undefined,
      // RESET VITAL STATS FOR NEW GAME
      party: [],
      history: [],
      isStarted: false,
      activeCharacterId: ''
    }));
  };

  const activeChar = gameState.party.find(c => c.id === gameState.activeCharacterId) || gameState.party[0];

  if (gameState.phase === 'LOGIN') return <LoginScreen onLogin={handleLogin} onGuest={handleLogin} />;

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* --- TOP BAR --- */}
      <header className="h-16 shrink-0 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shadow-lg z-50 relative">
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-3 select-none cursor-pointer hover:opacity-80 transition-opacity relative" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center shadow-inner">
              <Sword size={18} className="text-white" />
            </div>
            <h1 className="font-fantasy text-2xl font-bold tracking-wider text-amber-500 text-shadow">MYTHOS DM</h1>
            
            {/* SWORD MENU DROPDOWN */}
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }} />
                <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 animate-in slide-in-from-top-2">
                   <button 
                     onClick={() => setGameState(prev => ({...prev, phase: 'MODE_SELECT'}))}
                     className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-slate-800 text-left transition-colors"
                   >
                     <Home size={18} className="text-slate-400"/>
                     <div>
                       <div className="text-sm font-bold text-slate-200">Main Menu</div>
                       <div className="text-[10px] text-slate-500">Return to title screen</div>
                     </div>
                   </button>
                   <div className="h-px bg-slate-800 my-1"/>
                   <div className="px-3 py-2">
                      <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 flex items-center gap-2"><Type size={12}/> Text Size</div>
                      <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                         <button 
                           onClick={() => setTextSize('normal')}
                           className={`flex-1 py-1.5 text-xs font-bold rounded ${textSize === 'normal' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                         >
                           Normal
                         </button>
                         <button 
                           onClick={() => setTextSize('large')}
                           className={`flex-1 py-1.5 text-xs font-bold rounded ${textSize === 'large' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                         >
                           Large
                         </button>
                      </div>
                   </div>
                </div>
              </>
            )}
          </div>

          {gameState.sessionId && (
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-950 rounded-full border border-slate-800">
               <Globe size={12} className="text-emerald-500"/>
               <span className="text-xs font-mono text-emerald-400 tracking-wider">{gameState.sessionId}</span>
             </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {gameState.phase === 'ADVENTURE' && (
             <>
                <button onClick={() => setShowStats(!showStats)} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><Layout size={20}/></button>
                <button onClick={handleSave} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold uppercase transition-all border border-slate-700 hover:border-slate-500">
                  <Save size={14}/>
                  <span className="hidden sm:inline">{saveStatus || "Save"}</span>
                </button>
             </>
          )}
          {user && (
            <button onClick={() => setIsShopOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-amber-500/30 hover:border-amber-500/80 rounded-lg group transition-all">
              <Gem size={14} className="text-amber-500 group-hover:animate-pulse"/>
              <span className="text-sm font-mono font-bold text-amber-500">{user.aetherBalance.toLocaleString()}</span>
            </button>
          )}
        </div>
      </header>

      {/* --- MAIN LAYOUT --- */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR (Desktop) - Stats Panel */}
        {gameState.phase === 'ADVENTURE' && (
          <aside className="hidden lg:flex w-80 bg-slate-900 border-r border-slate-800 flex-col shrink-0 z-40">
             <div className="p-4 border-b border-slate-800 bg-slate-900/50">
               <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Party Members</h3>
               <div className="space-y-2">
                 {gameState.party.map(char => (
                   <button 
                    key={char.id}
                    onClick={() => setGameState(prev => ({...prev, activeCharacterId: char.id}))}
                    className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-all ${activeChar?.id === char.id ? 'bg-amber-500/10 border border-amber-500/50' : 'hover:bg-slate-800 border border-transparent'}`}
                   >
                     <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-sm border border-slate-700" style={{ color: char.color }}>{char.name[0]}</div>
                     <div className="text-left overflow-hidden">
                       <div className="font-bold text-sm truncate text-slate-200">{char.name}</div>
                       <div className="text-[10px] text-slate-500 uppercase truncate">{char.class}</div>
                     </div>
                   </button>
                 ))}
               </div>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-slate-900">
               {activeChar && <CharacterSheet character={activeChar} />}
             </div>
          </aside>
        )}

        {/* CENTER STAGE - Chat & Game */}
        <section className="flex-1 flex flex-col relative bg-slate-950 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
          
          {/* Phase: MODE_SELECT */}
          {gameState.phase === 'MODE_SELECT' && (
             <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-6 flex flex-col items-center">
                <div className="max-w-5xl w-full space-y-12 animate-in py-12">
                  <div className="text-center space-y-4">
                    <h2 className="font-fantasy text-5xl md:text-7xl text-white drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">Begin Your Saga</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">Choose your path, adventurer. Will you brave the dungeons alone, or gather a fellowship?</p>
                  </div>

                  {/* CONTINUE JOURNEY SECTION */}
                  {(gameState.isStarted || savedSagas.length > 0) && (
                    <div className="w-full space-y-4 animate-in slide-in-from-top-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <History size={14}/> Continue Journey
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* 1. Active Session Card (if exists) */}
                        {gameState.isStarted && gameState.history.length > 0 && (
                          <button 
                            onClick={() => setGameState(prev => ({...prev, phase: 'ADVENTURE'}))}
                            className="col-span-1 md:col-span-2 lg:col-span-1 bg-emerald-900/20 border border-emerald-500/40 hover:bg-emerald-900/40 p-4 rounded-xl flex flex-col justify-between transition-all group text-left relative overflow-hidden"
                          >
                            <div className="absolute top-2 right-2 flex gap-1">
                               <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded-full border border-emerald-500/30">Active</span>
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                               <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900">
                                 <Play fill="currentColor" size={16} />
                               </div>
                               <div>
                                 <div className="font-fantasy text-lg text-white">Current Session</div>
                                 <div className="text-[10px] text-emerald-400 uppercase tracking-widest">{gameState.sessionMode === 'online' ? 'The Fellowship' : 'Lone Hero'}</div>
                               </div>
                            </div>
                            <div className="text-xs text-slate-400 font-serif italic truncate w-full">
                               {gameState.history[gameState.history.length-1]?.text.slice(0, 50)}...
                            </div>
                          </button>
                        )}

                        {/* 2. Saved Sagas List */}
                        {savedSagas.map(saga => (
                          <div key={saga.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center group hover:border-slate-600 transition-colors shadow-lg relative">
                            <button onClick={() => handleLoad(saga)} className="flex items-center gap-4 text-left flex-1 min-w-0">
                              <div className="w-10 h-10 bg-slate-950 rounded-lg flex items-center justify-center text-amber-500 font-bold border border-slate-800 shrink-0">
                                {saga.state.party[0]?.name[0] || '?'}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-200 text-sm truncate">{saga.name}</div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {saga.state.sessionMode === 'online' ? (
                                    <span className="text-[9px] bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/20 uppercase font-bold">MP</span>
                                  ) : (
                                    <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase font-bold">Solo</span>
                                  )}
                                  <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock size={10}/> {new Date(saga.timestamp).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </button>
                            <button 
                              onClick={() => { 
                                const s = savedSagas.filter(x => x.id !== saga.id); 
                                setSavedSagas(s); 
                                localStorage.setItem('mythos-dm-vault', JSON.stringify(s)); 
                              }} 
                              className="text-slate-700 hover:text-rose-500 p-2 ml-2 transition-colors"
                              title="Delete Save"
                            >
                              <Trash2 size={14}/>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* START NEW SECTION */}
                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-px bg-slate-800 flex-1"/>
                      <span className="text-slate-600 text-xs font-bold uppercase tracking-widest">Start New Adventure</span>
                      <div className="h-px bg-slate-800 flex-1"/>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Solo Mode */}
                      <button 
                        onClick={() => startNewGameFlow('solo')}
                        className="group relative h-64 bg-slate-900 rounded-3xl border border-slate-800 hover:border-amber-500 p-8 flex flex-col items-center justify-center gap-6 overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                        <User size={56} className="text-slate-600 group-hover:text-amber-500 transition-colors duration-300" />
                        <div className="text-center relative z-10">
                          <h3 className="font-fantasy text-2xl text-white group-hover:text-amber-400 transition-colors">Lone Hero</h3>
                          <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-bold">Single Player</p>
                        </div>
                      </button>

                      {/* Multiplayer Mode */}
                      <div className="relative h-64 bg-slate-900 rounded-3xl border border-slate-800 p-8 flex flex-col items-center justify-center gap-6 overflow-hidden">
                         <Users size={56} className="text-slate-600" />
                         <div className="text-center w-full max-w-xs space-y-4">
                           <h3 className="font-fantasy text-2xl text-white">The Fellowship</h3>
                           <div className="flex gap-2">
                              <input 
                                value={joinCodeInput}
                                onChange={e => setJoinCodeInput(e.target.value)}
                                placeholder="ROOM CODE"
                                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-sm font-mono uppercase tracking-widest focus:border-sky-500 outline-none text-white placeholder-slate-600"
                              />
                              <button 
                                onClick={() => joinCodeInput && startNewGameFlow('online')}
                                className="bg-slate-800 hover:bg-sky-600 text-white p-3 rounded-xl transition-colors"
                              >
                                <ChevronRight/>
                              </button>
                           </div>
                           <button 
                             onClick={() => startNewGameFlow('online')}
                             className="text-xs font-bold text-sky-500 hover:text-sky-400 uppercase tracking-widest hover:underline"
                           >
                             Or Host a New Saga
                           </button>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          )}

          {/* Phase: MODEL_SELECT */}
          {gameState.phase === 'MODEL_SELECT' && (
             <div className="absolute inset-0 overflow-y-auto flex items-center justify-center p-8">
               <div className="max-w-4xl w-full space-y-8 text-center animate-in">
                  <h2 className="font-fantasy text-5xl text-white">Choose Your DM</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {MODEL_OPTIONS.map(opt => (
                      <button 
                        key={opt.id}
                        onClick={() => setGameState(prev => ({ ...prev, modelId: opt.id as any, phase: 'CHAR_SELECT' }))}
                        className={`bg-slate-900 border border-slate-800 hover:${opt.border} p-6 rounded-2xl flex flex-col items-center gap-4 group transition-all hover:-translate-y-1 hover:bg-slate-800`}
                      >
                         <opt.icon size={48} className={`text-slate-600 group-hover:${opt.color} transition-colors`} />
                         <div>
                           <h3 className="font-fantasy text-xl text-white">{opt.name}</h3>
                           <p className="text-xs text-slate-500 mt-2 h-10">{opt.desc}</p>
                         </div>
                         <div className="mt-4 px-3 py-1 bg-slate-950 rounded-full text-[10px] uppercase font-bold tracking-widest text-slate-400">
                           Cost: {opt.cost}
                         </div>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setGameState(prev => ({...prev, phase: 'MODE_SELECT'}))} className="text-slate-500 hover:text-white text-xs uppercase font-bold tracking-widest flex items-center justify-center gap-2"><ArrowLeft size={14}/> Back</button>
               </div>
             </div>
          )}

          {/* Phase: CHAR_SELECT */}
          {gameState.phase === 'CHAR_SELECT' && (
             <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-8">
               <div className="max-w-6xl mx-auto space-y-8">
                  <div className="flex justify-between items-end border-b border-slate-800 pb-6">
                    <div>
                      <h2 className="font-fantasy text-5xl text-white mb-2">Assemble Party</h2>
                      <p className="text-slate-400">Select a pre-made legend or forge your own destiny.</p>
                    </div>
                    <button 
                      onClick={() => {
                        // Clear forge data when starting fresh
                        setForgeData({});
                        setClassConcept('');
                        setForgeStep(0);
                        setGameState(prev => ({ ...prev, phase: 'CHAR_FORGE' }));
                      }}
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold uppercase text-xs tracking-widest flex items-center gap-2 transition-colors shadow-lg shadow-amber-900/20"
                    >
                      <Plus size={16}/> Forge Custom Hero
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PREMADE_HEROES.map((hero, i) => (
                      <button 
                        key={i}
                        onClick={() => {
                          const char: Character = { ...hero, id: crypto.randomUUID(), ownerId: myPlayerId.current } as Character;
                          setForgeData(char);
                          setGameState(prev => ({...prev, phase: 'CHAR_REVIEW'}));
                        }}
                        className="bg-slate-900 border border-slate-800 hover:border-slate-600 p-4 rounded-xl flex items-start gap-4 text-left group transition-all hover:bg-slate-800 h-full"
                      >
                         <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl shadow-inner shrink-0" style={{ backgroundColor: hero.color, color: 'white' }}>
                           {hero.name[0]}
                         </div>
                         <div>
                           <div className="font-bold text-slate-200 group-hover:text-amber-500 transition-colors">{hero.name}</div>
                           <div className="text-xs text-slate-500 uppercase font-bold mb-2">{hero.race} • {hero.class}</div>
                           <div className="text-xs text-slate-400 font-serif leading-relaxed opacity-80">{hero.notes}</div>
                         </div>
                      </button>
                    ))}
                  </div>
               </div>
             </div>
          )}

          {/* Phase: CHAR_FORGE */}
          {gameState.phase === 'CHAR_FORGE' && (
             <div className="absolute inset-0 flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm z-50">
                <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl space-y-6">
                   <h2 className="font-fantasy text-3xl text-amber-500">The Forge</h2>
                   {forgeStep === 0 && (
                      <div className="space-y-4">
                        <input 
                          placeholder="Hero Name" 
                          className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white focus:border-amber-500 outline-none placeholder-slate-600"
                          value={forgeData.name || ''}
                          onChange={e => setForgeData({...forgeData, name: e.target.value})}
                        />
                        <div className="grid grid-cols-3 gap-2 h-40 overflow-y-auto custom-scrollbar">
                           {DND_RACES.map(r => (
                             <button key={r} onClick={() => setForgeData({...forgeData, race: r})} className={`p-2 rounded-lg text-xs font-bold uppercase border ${forgeData.race === r ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                               {r}
                             </button>
                           ))}
                        </div>
                        
                        {/* RACE DETAILS BOX */}
                        <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl min-h-[5rem]">
                          {forgeData.race ? (
                            <>
                              <div className="text-sm font-bold text-amber-500 mb-1">{forgeData.race}</div>
                              <div className="text-xs text-slate-300 font-serif italic mb-2">{RACE_DETAILS[forgeData.race].desc}</div>
                              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Bonus: {RACE_DETAILS[forgeData.race].bonus}</div>
                            </>
                          ) : (
                            <div className="text-slate-600 text-xs italic flex items-center justify-center h-full">Select a race to view details...</div>
                          )}
                        </div>

                        <textarea
                           placeholder="Describe your character concept..."
                           className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white h-32 focus:border-amber-500 outline-none resize-none placeholder-slate-600"
                           value={classConcept}
                           onChange={e => setClassConcept(e.target.value)}
                        />
                        <div className="flex gap-4">
                           <button onClick={() => setGameState(prev => ({...prev, phase: 'CHAR_SELECT'}))} className="flex-1 py-3 text-slate-400 hover:text-white font-bold uppercase text-xs">Cancel</button>
                           <button 
                             disabled={!forgeData.name || !forgeData.race || !classConcept}
                             onClick={async () => {
                               setIsLoading(true);
                               const sugg = await dmService.suggestClasses(classConcept, forgeData.race!, 'classic', gameState.modelId);
                               if (sugg) {
                                  const sheet = await dmService.generateCharacterSheet(forgeData.name!, forgeData.race!, `${sugg.className} (${sugg.subclassName})`, classConcept, sugg.stats, gameState.modelId);
                                  setForgeData({...forgeData, ...sheet, class: `${sugg.className} (${sugg.subclassName})`});
                                  setGameState(prev => ({...prev, phase: 'CHAR_REVIEW'}));
                               }
                               setIsLoading(false);
                             }}
                             className="flex-[2] bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold uppercase text-sm disabled:opacity-50"
                           >
                             {isLoading ? 'Forging...' : 'Reveal Destiny'}
                           </button>
                        </div>
                      </div>
                   )}
                </div>
             </div>
          )}

          {/* Phase: CHAR_REVIEW */}
          {gameState.phase === 'CHAR_REVIEW' && (
            <div className="absolute inset-0 flex items-center justify-center p-8 z-50 bg-black/50">
               <div className="max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-[32px] p-8 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden">
                  <div className="space-y-6 z-10">
                     <div>
                       <h2 className="font-fantasy text-5xl text-white">{forgeData.name}</h2>
                       <p className="text-amber-500 font-bold uppercase tracking-widest text-sm mt-2">{forgeData.race} • {forgeData.class}</p>
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                       {Object.entries(forgeData.stats || {}).map(([k, v]) => (
                         <div key={k} className="bg-slate-950 p-2 rounded border border-slate-800 text-center">
                            <div className="text-[10px] uppercase text-slate-500 font-bold">{k}</div>
                            <div className="font-bold text-white">{v as number}</div>
                         </div>
                       ))}
                     </div>
                  </div>
                  <div className="space-y-6 z-10 flex flex-col justify-center">
                     <div className="space-y-4">
                       <label className="block text-xs font-bold uppercase text-slate-500 tracking-widest">Adventure Tone</label>
                       <div className="flex gap-2">
                          <button onClick={() => setAdventureTone('action')} className={`flex-1 p-3 rounded-xl border text-xs font-bold uppercase ${adventureTone === 'action' ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>Action</button>
                          <button onClick={() => setAdventureTone('mystery')} className={`flex-1 p-3 rounded-xl border text-xs font-bold uppercase ${adventureTone === 'mystery' ? 'bg-sky-500/20 border-sky-500 text-sky-500' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>Mystery</button>
                       </div>
                     </div>
                     <div className="flex gap-4 w-full">
                       <button 
                          onClick={() => setGameState(prev => ({...prev, phase: 'CHAR_FORGE'}))}
                          className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold uppercase tracking-widest"
                       >
                          Edit
                       </button>
                       <button 
                         onClick={() => {
                            const char = { ...forgeData, id: crypto.randomUUID(), ownerId: myPlayerId.current } as Character;
                            setGameState(prev => ({...prev, party: [char], phase: 'LOBBY'}));
                         }}
                         className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-emerald-900/20"
                       >
                         Confirm Character
                       </button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Phase: LOBBY */}
          {gameState.phase === 'LOBBY' && (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-8">
                {/* BACK BUTTON */}
                <div className="absolute top-8 left-8">
                  <button onClick={() => setGameState(prev => ({...prev, phase: 'CHAR_SELECT', party: []}))} className="flex items-center gap-2 text-slate-500 hover:text-white uppercase font-bold text-xs tracking-widest">
                    <ArrowLeft size={14}/> Change Character
                  </button>
                </div>

                <BookMarked size={80} className="text-slate-700 mb-4" />
                <h2 className="font-fantasy text-5xl text-white">The Gathering</h2>
                {gameState.sessionId && (
                   <div className="px-6 py-3 bg-slate-900 rounded-xl border border-dashed border-slate-700">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mr-4">Session Code</span>
                      <span className="text-2xl font-mono text-emerald-500">{gameState.sessionId}</span>
                   </div>
                )}
                
                {/* CAMPAIGN SETTINGS FOR HOST */}
                {gameState.isHost && (
                  <div className="w-full max-w-2xl bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-left animate-in slide-in-from-bottom-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Settings size={14}/> Campaign Settings
                    </h3>
                    <div className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-500 uppercase">Difficulty</label>
                             <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                               {['story', 'standard', 'deadly'].map((d) => (
                                 <button 
                                   key={d}
                                   onClick={() => setDifficulty(d as any)} 
                                   className={`flex-1 py-2 text-[10px] font-bold uppercase rounded transition-all ${difficulty === d ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                                 >
                                   {d}
                                 </button>
                               ))}
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-500 uppercase">Tone</label>
                             <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                               {['action', 'mystery'].map((t) => (
                                 <button 
                                   key={t}
                                   onClick={() => setAdventureTone(t as any)} 
                                   className={`flex-1 py-2 text-[10px] font-bold uppercase rounded transition-all ${adventureTone === t ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                                 >
                                   {t}
                                 </button>
                               ))}
                             </div>
                          </div>
                       </div>
                       
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                             <FileText size={12}/> Dungeon Master Persona
                          </label>
                          <textarea
                             value={dmPersona}
                             onChange={(e) => setDmPersona(e.target.value)}
                             placeholder="E.g. You are the Keeper of the Forgotten Flame, a weary deity who speaks in riddles..."
                             className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-700 h-20 resize-none outline-none focus:border-amber-500/50"
                          />
                       </div>
                    </div>
                  </div>
                )}

                {gameState.isHost ? (
                  <button 
                    onClick={handleStartAdventure}
                    disabled={isLoading}
                    className="px-12 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-bold uppercase text-lg tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-4"
                  >
                    {isLoading ? <Loader2 className="animate-spin"/> : <Crown/>} Begin Saga
                  </button>
                ) : (
                  <div className="text-slate-400 animate-pulse font-mono uppercase text-sm">Waiting for Host...</div>
                )}
             </div>
          )}

          {/* Phase: ADVENTURE */}
          {gameState.phase === 'ADVENTURE' && (
             <ChatInterface 
               messages={gameState.history} 
               party={gameState.party} 
               activeCharacterId={gameState.activeCharacterId} 
               onSendMessage={handleSendMessage} 
               isLoading={isLoading} 
               onSetActiveCharacter={id => setGameState(prev => ({...prev, activeCharacterId: id}))}
               onRoll={(t) => handleSendMessage(`[Rolled for ${t}]`, activeChar.id)} 
               myPlayerId={myPlayerId.current}
               isHost={gameState.isHost}
               sessionMode={gameState.sessionMode}
               textSize={textSize}
             />
          )}

          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-[100] animate-in slide-in-from-top-4">
               <Skull size={18}/> {error} <button onClick={() => setError(null)}><X size={14}/></button>
            </div>
          )}
        </section>

        {/* SHOP MODAL */}
        {isShopOpen && user && <ShopModal onClose={() => setIsShopOpen(false)} balance={user.aetherBalance} />}
      
      </main>

      {/* MOBILE STATS OVERLAY */}
      {showStats && gameState.phase === 'ADVENTURE' && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-6 lg:hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-fantasy text-2xl text-amber-500">Heroes</h3>
            <button onClick={() => setShowStats(false)} className="p-2 bg-slate-800 rounded-lg"><X size={20}/></button>
          </div>
          <div className="overflow-y-auto h-[90%]">
             {gameState.party.map(char => (
               <div key={char.id} className="mb-8 border-b border-slate-800 pb-8">
                 <CharacterSheet character={char} />
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;