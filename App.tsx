
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Message, Character, DiceRoll } from './types';
import { INITIAL_CHARACTER } from './constants';
import { dmService } from './services/geminiService';
import ChatInterface from './components/ChatInterface';
import CharacterSheet from './components/CharacterSheet';
import DiceRoller from './components/DiceRoller';
import { Compass, Sword, BookOpen, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('mythos-dm-state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    return {
      character: INITIAL_CHARACTER,
      history: [],
      isStarted: false
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('mythos-dm-state', JSON.stringify(gameState));
  }, [gameState]);

  const handleStartAdventure = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const initialText = await dmService.startAdventure(gameState.history);
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
    } catch (err: any) {
      setError("Failed to reach the Dungeon Master. Is your API key valid?");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      role: 'user',
      text,
      timestamp: Date.now()
    };

    setGameState(prev => ({
      ...prev,
      history: [...prev.history, userMsg]
    }));

    setIsLoading(true);
    setError(null);

    try {
      let dmResponseText = "";
      await dmService.streamMessage(text, (chunk) => {
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
      setError("The connection to the DM was severed.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollDice = (roll: DiceRoll) => {
    const rollText = `I roll a d${roll.sides}. Result: ${roll.result} ${roll.bonus >= 0 ? '+' : ''}${roll.bonus} = **${roll.total}**`;
    handleSendMessage(rollText);
  };

  const updateCharacter = (updates: Partial<Character>) => {
    setGameState(prev => ({
      ...prev,
      character: { ...prev.character, ...updates }
    }));
  };

  const resetGame = () => {
    if (window.confirm("Are you sure you want to end this chronicle and start anew? All progress will be lost.")) {
      localStorage.removeItem('mythos-dm-state');
      setGameState({
        character: INITIAL_CHARACTER,
        history: [],
        isStarted: false
      });
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden">
      {/* Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-amber-600 p-2 rounded-lg">
            <Sword className="text-white w-6 h-6" />
          </div>
          <h1 className="fantasy-font text-2xl font-bold tracking-wider text-slate-100">MYTHOS DM</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-400">
             <button className="flex items-center gap-1 hover:text-amber-500 transition-colors">
               <BookOpen size={16}/> Rulebook
             </button>
             <button className="flex items-center gap-1 hover:text-amber-500 transition-colors">
               <Compass size={16}/> World Map
             </button>
          </nav>
          <button 
            onClick={resetGame}
            className="text-xs text-rose-500 border border-rose-500/30 hover:bg-rose-500/10 px-3 py-1.5 rounded transition-all"
          >
            Reset Adventure
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Stats & Tools */}
        <aside className="hidden lg:flex flex-col w-[380px] border-r border-slate-800 p-6 space-y-6 overflow-y-auto bg-slate-950/30">
          <CharacterSheet 
            character={gameState.character} 
            onUpdate={updateCharacter} 
          />
          <DiceRoller onRoll={handleRollDice} />
        </aside>

        {/* Center - Chat Adventure */}
        <section className="flex-1 flex flex-col p-4 lg:p-6 bg-[#0c111d] relative">
          {!gameState.isStarted ? (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md p-8 text-center">
              <div className="max-w-2xl space-y-8">
                <div className="space-y-4">
                  <h2 className="fantasy-font text-5xl text-amber-500">Into the Unknown</h2>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    You stand before the threshold of a great adventure. Your Dungeon Master, an ancient intelligence of vast creative power, awaits your first step. Whether you seek glory, gold, or the thrill of magic, your story begins here.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <button 
                    onClick={handleStartAdventure}
                    disabled={isLoading}
                    className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-200 bg-amber-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                  >
                    <span className="absolute inset-0 w-full h-full mt-1 ml-1 transition-all duration-300 ease-in-out bg-amber-900 rounded-xl group-hover:mt-0 group-hover:ml-0"></span>
                    <span className="absolute inset-0 w-full h-full bg-amber-600 rounded-xl"></span>
                    <span className="relative flex items-center gap-2">
                      {isLoading ? <Loader2 className="animate-spin"/> : <Sword />}
                      {isLoading ? "Summoning the DM..." : "Begin Your Adventure"}
                    </span>
                  </button>
                  <p className="text-sm text-slate-500 italic">Compatible with D&D 5th Edition rules</p>
                </div>
              </div>
            </div>
          ) : null}

          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-rose-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-2xl animate-bounce">
              <AlertCircle size={20} />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <ChatInterface 
            messages={gameState.history} 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
          />
        </section>

        {/* Right Sidebar - Mobile/Compact controls could go here or floating */}
        <div className="lg:hidden fixed bottom-24 right-6 flex flex-col gap-4">
           {/* Add a floating character toggle for mobile here if desired */}
        </div>
      </main>

      {/* Footer Info / Mobile Stats Toggle */}
      <footer className="bg-slate-900 border-t border-slate-800 p-2 flex justify-between items-center text-[10px] text-slate-500 font-mono">
        <div>MYTHOS-V1 // ENGINE: GEMINI-3-PRO</div>
        <div className="flex gap-4">
          <span>LATENCY: {isLoading ? 'PENDING' : 'IDLE'}</span>
          <span>SESSION: ACTIVE</span>
        </div>
      </footer>
    </div>
  );
};

export default App;

// Helper to add loader icon in the start button
const Loader2 = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
