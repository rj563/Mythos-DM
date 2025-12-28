import React, { useRef, useEffect, useState } from 'react';
import { Message, Character, SessionMode } from '../types';
import { Send, Loader2, User, UserCircle, Bot, Shield } from 'lucide-react';
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
  textSize?: 'normal' | 'large';
}

const ChatInterface: React.FC<Props> = ({ 
  messages, party, activeCharacterId, onSendMessage, isLoading, 
  onSetActiveCharacter, onRoll, myPlayerId, isHost, sessionMode, textSize = 'normal'
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input, activeCharacterId);
      setInput('');
    }
  };

  const availableChars = party.filter(c => (!sessionMode || sessionMode === 'solo') || (c.ownerId === myPlayerId) || (isHost && !c.ownerId));

  return (
    <div className="flex flex-col h-full bg-slate-950/50 relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar pb-32" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-4 opacity-50">
            <div className="w-20 h-20 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center">
               <Bot size={32}/>
            </div>
            <p className="font-serif italic text-lg">The story begins...</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-6 relative shadow-lg ${
              msg.role === 'user' 
                ? 'bg-amber-950/30 border border-amber-500/20 text-amber-50 rounded-tr-none' 
                : 'bg-slate-900/90 border border-slate-700 text-slate-200 rounded-tl-none'
            }`}>
              {/* Header */}
              <div className="flex items-center gap-2 mb-3 opacity-60 text-[10px] uppercase font-bold tracking-widest border-b border-white/5 pb-2">
                {msg.role === 'user' ? (
                   <><UserCircle size={12}/> {msg.senderName || 'Player'}</>
                ) : (
                   <><Bot size={12} className="text-amber-500"/> Dungeon Master</>
                )}
                <span className="ml-auto">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              
              {/* Content */}
              <div className={`prose prose-invert max-w-none font-serif leading-relaxed ${textSize === 'large' ? 'text-lg prose-p:text-lg' : 'text-base prose-p:text-base'}`}>
                 <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-3 text-slate-400 text-sm">
                <Loader2 className="animate-spin text-amber-500" size={16} />
                <span className="animate-pulse font-mono uppercase text-xs">Writing fate...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-md border-t border-slate-800 p-4 pb-6 z-20">
         <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex flex-col gap-3">
           {availableChars.length > 0 && (
             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
               {availableChars.map(char => (
                 <button 
                   key={char.id} 
                   type="button" 
                   onClick={() => onSetActiveCharacter(char.id)}
                   className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${activeCharacterId === char.id ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-900'}`}
                 >
                   {char.name}
                 </button>
               ))}
             </div>
           )}
           <div className="flex gap-2">
             <input 
               value={input}
               onChange={e => setInput(e.target.value)}
               placeholder={availableChars.length ? `Speak as ${availableChars.find(c => c.id === activeCharacterId)?.name}...` : "Observer"}
               className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:border-amber-500 outline-none font-serif text-lg placeholder-slate-600"
               disabled={!availableChars.length || isLoading}
             />
             <button disabled={!input.trim() || isLoading} className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white p-3 rounded-xl transition-all shadow-lg shadow-amber-900/20">
               <Send size={20} />
             </button>
           </div>
         </form>
      </div>
    </div>
  );
};

export default ChatInterface;