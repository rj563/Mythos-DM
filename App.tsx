
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Message, Character, DiceRoll } from './types';
import { createNewCharacter, generateRoomCode } from './constants';
import { dmService } from './services/geminiService';
import ChatInterface from './components/ChatInterface';
import CharacterSheet from './components/CharacterSheet';
import DiceRoller from './components/DiceRoller';
import { Sword, AlertCircle, Download, Upload, Save, Plus, Users, Share2, Globe, Link } from 'lucide-react';
import Gun from 'gun';

// Public Gun relays for peer connectivity
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('mythos-dm-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, sessionId: undefined }; // Reset session on fresh load unless joining
      } catch (e) { console.error(e); }
    }
    const firstChar = createNewCharacter(0);
    return {
      party: [firstChar],
      activeCharacterId: firstChar.id,
      history: [],
      isStarted: false
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isRemoteChange = useRef(false);

  // Sync with Gun.js if sessionId is active
  useEffect(() => {
    if (!gameState.sessionId) return;

    setIsSyncing(true);
    const room = gun.get('mythos-dm-session-' + gameState.sessionId);

    // Listen for remote changes
    room.on((data) => {
      if (data && data.state) {
        try {
          const remoteState = JSON.parse(data.state);
          isRemoteChange.current = true;
          setGameState(prev => ({
            ...prev,
            party: remoteState.party || prev.party,
            history: remoteState.history || prev.history,
            isStarted: remoteState.isStarted ?? prev.isStarted
          }));
          setTimeout(() => { isRemoteChange.current = false; }, 100);
        } catch (e) { console.error("Sync error", e); }
      }
    });

    return () => { room.off(); };
  }, [gameState.sessionId]);

  // Push local changes to Gun.js
  useEffect(() => {
    if (gameState.sessionId && !isRemoteChange.current) {
      const room = gun.get('mythos-dm-session-' + gameState.sessionId);
      room.put({ state: JSON.stringify({
        party: gameState.party,
        history: gameState.history,
        isStarted: gameState.isStarted
      }) });
    }
    localStorage.setItem('mythos-dm-state', JSON.stringify(gameState));
  }, [gameState.party, gameState.history, gameState.isStarted, gameState.sessionId]);

  const handleStartAdventure = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const initialText = await dmService.startAdventure(gameState.history);
      if (gameState.history.length === 0 || initialText.includes("*(")) {
        const newMsg: Message = {
          role: 'model',
          text: initialText,
          timestamp: Date.now()
        };
        setGameState(prev => ({
          ...prev,
          history: [...prev.history, newMsg],
          isStarted: true
        }));
      } else {
        setGameState(prev => ({ ...prev, isStarted: true }));
      }
    } catch (err: any) {
      setError("Dungeon Master connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string, charId: string) => {
    const char = gameState.party.find(c => c.id === charId);
    const enrichedText = `**${char?.name || 'Adventurer'}**: ${text}`;
    
    const userMsg: Message = {
      role: 'user',
      text: enrichedText,
      senderId: charId,
      senderName: char?.name,
      timestamp: Date.now()
    };

    setGameState(prev => ({
      ...prev,
      history: [...prev.history, userMsg]
    }));

    setIsLoading(true);
    try {
      let dmResponseText = "";
      await dmService.streamMessage(enrichedText, (chunk) => {
        dmResponseText += chunk;
      });

      const dmMsg: Message = {
        role: 'model',
        text: dmResponseText,
        timestamp: Date.now()
      };

      setGameState(prev => ({
        ...prev,
        history: [...prev.history, dmMsg]
      }));
    } catch (err: any) {
      setError("The DM's voice faded...");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHostSaga = () => {
    const code = generateRoomCode();
    setGameState(prev => ({ ...prev, sessionId: code }));
  };

  const handleJoinSaga = () => {
    if (joinCode.trim()) {
      setGameState(prev => ({ ...prev, sessionId: joinCode.trim().toUpperCase() }));
    }
  };

  const handleRollDice = (roll: DiceRoll) => {
    const char = gameState.party.find(c => c.id === roll.characterId);
    const rollText = `${char?.name} rolls a d${roll.sides}. Result: ${roll.result} ${roll.bonus >= 0 ? '+' : ''}${roll.bonus} = **${roll.total}**`;
    handleSendMessage(rollText, roll.characterId);
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    setGameState(prev => ({
      ...prev,
      party: prev.party.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const addCharacter = () => {
    const newChar = createNewCharacter(gameState.party.length);
    setGameState(prev => ({
      ...prev,
      party: [...prev.party, newChar],
      activeCharacterId: newChar.id
    }));
  };

  const removeCharacter = (id: string) => {
    if (gameState.party.length <= 1) return alert("Every saga needs a hero.");
    if (confirm("Retire this adventurer?")) {
      setGameState(prev => {
        const newParty = prev.party.filter(c => c.id !== id);
        return {
          ...prev,
          party: newParty,
          activeCharacterId: prev.activeCharacterId === id ? newParty[0].id : prev.activeCharacterId
        };
      });
    }
  };

  const activeChar = gameState.party.find(c => c.id === gameState.activeCharacterId) || gameState.party[0];

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-amber-600 p-2 rounded-lg shadow-inner">
            <Sword className="text-white w-6 h-6" />
          </div>
          <h1 className="fantasy-font text-2xl font-bold tracking-wider text-slate-100">MYTHOS DM</h1>
          {gameState.sessionId && (
            <div className="ml-4 flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-emerald-500/30">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 tracking-tighter uppercase">Live Session: {gameState.sessionId}</span>
              <button 
                onClick={() => { navigator.clipboard.writeText(gameState.sessionId!); alert("Code copied!"); }}
                className="hover:text-white text-slate-500 transition-colors"
              >
                <Share2 size={12} />
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
             <button onClick={() => { if(confirm("This will erase your current session data locally. Proceed?")) { localStorage.clear(); window.location.reload(); } }} className="hover:text-rose-500 transition-colors text-xs border border-slate-800 px-3 py-1 rounded">
               New Saga
             </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Party Sidebar */}
        <aside className="hidden lg:flex flex-col w-[420px] border-r border-slate-800 bg-slate-950/50">
          <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
            <h3 className="fantasy-font text-slate-300 flex items-center gap-2">
              <Users size={18} className="text-amber-500" /> The Party
            </h3>
            <button 
              onClick={addCharacter}
              className="p-1.5 bg-amber-600/20 text-amber-500 hover:bg-amber-600 hover:text-white rounded-md transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
            >
              <Plus size={14} /> Add Adventurer
            </button>
          </div>

          <div className="flex border-b border-slate-800 bg-slate-900/20 overflow-x-auto no-scrollbar">
            {gameState.party.map(char => (
              <button
                key={char.id}
                onClick={() => setGameState(prev => ({ ...prev, activeCharacterId: char.id }))}
                className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all relative min-w-[100px] text-center ${
                  gameState.activeCharacterId === char.id 
                    ? 'text-amber-500 bg-slate-800' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {char.name}
                {gameState.activeCharacterId === char.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {activeChar && (
              <>
                <CharacterSheet 
                  character={activeChar} 
                  onUpdate={updateCharacter} 
                  onRemove={removeCharacter}
                />
                <DiceRoller onRoll={(roll) => handleRollDice({ ...roll, characterId: activeChar.id })} />
              </>
            )}
          </div>
        </aside>

        <section className="flex-1 flex flex-col p-4 lg:p-6 bg-[#0c111d] relative">
          {!gameState.isStarted && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-8 text-center">
              <div className="max-w-2xl space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="space-y-4">
                  <h2 className="fantasy-font text-5xl text-amber-500 tracking-tighter">Mythos Live</h2>
                  <p className="text-lg text-slate-300 leading-relaxed max-w-lg mx-auto">
                    A collaborative storytelling engine. Host a session for your friends or join an existing chronicle in real-time.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* Host Section */}
                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
                    <Globe className="mx-auto text-amber-500" size={32} />
                    <h3 className="fantasy-font text-xl text-white">Master the Tale</h3>
                    <p className="text-xs text-slate-500">Start a new saga and generate a code for your friends to join.</p>
                    <button 
                      onClick={gameState.sessionId ? handleStartAdventure : handleHostSaga}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-all"
                    >
                      {gameState.sessionId ? "Venture Forth" : "Host Session"}
                    </button>
                  </div>

                  {/* Join Section */}
                  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
                    <Link className="mx-auto text-sky-500" size={32} />
                    <h3 className="fantasy-font text-xl text-white">Join the Party</h3>
                    <p className="text-xs text-slate-500">Enter a Saga Code to connect to your friend's live session.</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="CODE-123"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 text-sm text-center font-mono uppercase focus:ring-1 focus:ring-sky-500 outline-none"
                      />
                      <button 
                        onClick={handleJoinSaga}
                        className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg font-bold text-sm"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                </div>

                {gameState.sessionId && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-pulse">
                    <p className="text-emerald-400 font-bold text-sm">CONNECTED TO: {gameState.sessionId}</p>
                    <p className="text-[10px] text-emerald-600 mt-1">Tell your friends to join using this code!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-rose-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-2xl">
              <AlertCircle size={20} />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <ChatInterface 
            messages={gameState.history} 
            party={gameState.party}
            activeCharacterId={gameState.activeCharacterId}
            onSendMessage={handleSendMessage} 
            isLoading={isLoading}
            onSetActiveCharacter={(id) => setGameState(prev => ({ ...prev, activeCharacterId: id }))}
          />
        </section>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 p-2 flex justify-between items-center text-[10px] text-slate-500 font-mono">
        <div className="flex gap-4 items-center">
          <span className={`flex items-center gap-1 ${gameState.sessionId ? 'text-emerald-500' : 'text-slate-600'}`}>
            <Globe size={10} /> {gameState.sessionId ? 'LIVE_SYNC_ACTIVE' : 'OFFLINE_MODE'}
          </span>
          <span className="text-slate-700">|</span>
          <span>PARTY_MEMBERS: {gameState.party.length}</span>
        </div>
        <div className="flex gap-2 items-center">
          {isSyncing && <div className="w-1 h-1 bg-amber-500 rounded-full animate-ping" />}
          <span>CORE: GEMINI-3-PRO // RELAY: MANHATTAN</span>
        </div>
      </footer>
    </div>
  );
};

export default App;

const Loader2 = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);
