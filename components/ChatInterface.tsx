
import React, { useState, useRef, useEffect } from 'react';
import { Message, Character } from '../types';
import { Send, Loader2, ScrollText, UserCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  messages: Message[];
  party: Character[];
  activeCharacterId: string;
  onSendMessage: (text: string, charId: string) => void;
  isLoading: boolean;
  onSetActiveCharacter: (id: string) => void;
}

const ChatInterface: React.FC<Props> = ({ 
  messages, 
  party, 
  activeCharacterId, 
  onSendMessage, 
  isLoading,
  onSetActiveCharacter
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const activeChar = party.find(c => c.id === activeCharacterId) || party[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input, activeCharacterId);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-800 shadow-inner overflow-hidden">
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText className="text-amber-500 w-5 h-5" />
          <h2 className="fantasy-font text-lg text-slate-100">Chronicle of the Quest</h2>
        </div>
        {party.length > 1 && (
           <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
             Party Size: {party.length}
           </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50 space-y-4">
            <ScrollText size={64} />
            <p className="fantasy-font text-xl">The adventure awaits the party...</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-md ${
              msg.role === 'user' 
                ? 'bg-amber-600 text-white rounded-br-none' 
                : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
            }`}>
              <div className="text-[10px] uppercase font-bold mb-1 opacity-60 flex justify-between gap-4">
                <span className="flex items-center gap-1">
                  {msg.role === 'user' ? (
                    <>
                      <UserCircle size={10} style={{ color: party.find(p => p.id === msg.senderId)?.color }} />
                      {msg.senderName || 'Unknown Hero'}
                    </>
                  ) : 'The Dungeon Master'}
                </span>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="prose prose-invert prose-amber prose-sm max-w-none">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-bl-none px-5 py-4 border border-slate-700 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="animate-pulse">The DM is weaving the fate of the party...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-slate-800 border-t border-slate-700 space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Speaking as:</span>
          {party.map(char => (
            <button
              key={char.id}
              type="button"
              onClick={() => onSetActiveCharacter(char.id)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border ${
                activeCharacterId === char.id 
                  ? 'bg-amber-500 border-amber-400 text-white' 
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {char.name}
            </button>
          ))}
        </div>
        
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`${activeChar?.name || 'Hero'}, what do you do?`}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber-600 transition-colors rounded-lg px-6 py-3 text-white flex items-center justify-center shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
