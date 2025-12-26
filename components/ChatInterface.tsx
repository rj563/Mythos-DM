import React, { useState, useRef, useEffect } from 'react';
import { Message, Character, SessionMode } from '../types';
import { Send, Loader2, ScrollText, UserCircle, Wand2, ShieldCheck, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  messages: Message[];
  party: Character[];
  activeCharacterId: string;
  onSendMessage: (text: string, charId: string) => void;
  isLoading: boolean;
  onSetActiveCharacter: (id: string) => void;
  onRoll: (type: string) => void;
  myPlayerId: string;
  isHost: boolean;
  sessionMode?: SessionMode;
}

const ChatInterface: React.FC<Props> = ({ 
  messages, 
  party, 
  activeCharacterId, 
  onSendMessage, 
  isLoading,
  onSetActiveCharacter,
  onRoll,
  myPlayerId,
  isHost,
  sessionMode
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messages.length, isLoading]);

  const activeChar = party.find(c => c.id === activeCharacterId) || party[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input, activeCharacterId);
      setInput('');
    }
  };

  const availableCharacters = party.filter(char => {
    if (!sessionMode || sessionMode === 'solo') return true;
    if (char.ownerId === myPlayerId) return true;
    if (isHost && !char.ownerId) return true; 
    return false;
  });

  useEffect(() => {
    if (availableCharacters.length > 0 && !availableCharacters.find(c => c.id === activeCharacterId)) {
      onSetActiveCharacter(availableCharacters[0].id);
    }
  }, [availableCharacters, activeCharacterId, onSetActiveCharacter]);

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-[32px] border border-slate-800 shadow-inner overflow-hidden relative">
      <div className="p-5 bg-slate-800 border-b border-slate-700 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <ScrollText className="text-amber-500 w-5 h-5" />
          <h2 className="fantasy-font text-xl text-slate-100">Chronicle of the Quest</h2>
        </div>
        <div className="flex items-center gap-3">
          {party.length > 1 && (
             <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest bg-slate-900 px-4 py-1.5 rounded-full border border-slate-700">
               Fellowship: {party.length}
             </div>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth custom-scrollbar">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-6 animate-pulse">
            <ScrollText size={80} />
            <p className="fantasy-font text-2xl tracking-widest">The saga awaits your first step...</p>
          </div>
        )}
        
        {messages.map((msg, idx) => {
          const isLast = idx === messages.length - 1;
          return (
            <div 
              key={idx} 
              ref={isLast ? lastMessageRef : null}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
            >
              <div className={`max-w-[85%] rounded-[32px] px-8 py-6 shadow-2xl relative ${
                msg.role === 'user' 
                  ? 'bg-amber-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
              }`}>
                <div className="text-[10px] uppercase font-bold mb-3 opacity-60 flex justify-between gap-6 tracking-widest">
                  <span className="flex items-center gap-2">
                    {msg.role === 'user' ? (
                      <>
                        <UserCircle size={14} style={{ color: party.find(p => p.id === msg.senderId)?.color }} />
                        {msg.senderName || 'Adventurer'}
                      </>
                    ) : (
                      <>
                        <Wand2 size={14} className="text-amber-500" />
                        The Dungeon Master
                      </>
                    )}
                  </span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="prose prose-invert prose-amber prose-sm max-w-none font-serif text-lg leading-relaxed">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>

                {msg.hasSheetUpdate && (
                   <div className="mt-4 pt-4 border-t border-white/10 text-emerald-400 text-xs font-bold tracking-widest flex items-center gap-2 animate-pulse">
                     <RefreshCw size={12}/> Character sheet updated
                   </div>
                )}

                {msg.suggestedRoll && (
                  <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-3">
                    <div className="flex flex-col gap-1 mb-2">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">
                         Game Event: {msg.suggestedRoll} Check
                       </p>
                       <p className="text-sm text-slate-300 italic">
                         "Describe how your character attempts this action in the chat, then click below."
                       </p>
                    </div>
                    <button 
                      onClick={() => onRoll(msg.suggestedRoll!)}
                      className="group flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 px-6 py-4 rounded-2xl transition-all border border-white/5 active:scale-95"
                    >
                      <ShieldCheck className="text-amber-400 group-hover:scale-110 transition-transform" />
                      <span className="font-bold uppercase text-xs tracking-[0.2em]">Roll for {msg.suggestedRoll}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start animate-in fade-in duration-300" ref={lastMessageRef}>
            <div className="bg-slate-800 text-slate-400 rounded-[32px] rounded-bl-none px-8 py-6 border border-slate-700 flex items-center gap-4 shadow-xl">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <span className="font-serif italic text-lg tracking-wide">The Weave of Fate is shifting...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 bg-slate-800 border-t border-slate-700 space-y-4">
        {availableCharacters.length > 0 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter whitespace-nowrap">Identity:</span>
            {availableCharacters.map(char => (
              <button
                key={char.id}
                type="button"
                onClick={() => onSetActiveCharacter(char.id)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all border shadow-sm ${
                  activeCharacterId === char.id 
                    ? 'bg-amber-500 border-amber-400 text-white' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {char.name.toUpperCase()}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={availableCharacters.length > 0 ? `Tell the story, ${availableCharacters.find(c => c.id === activeCharacterId)?.name || 'Hero'}...` : "Spectating..."}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-6 py-4 text-slate-200 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-serif text-lg disabled:opacity-50"
            disabled={isLoading || availableCharacters.length === 0}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || availableCharacters.length === 0}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 transition-all rounded-2xl px-8 flex items-center justify-center shadow-xl shadow-amber-900/20 active:scale-95 group"
          >
            <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;