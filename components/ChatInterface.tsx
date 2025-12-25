
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { Send, Loader2, ScrollText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<Props> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-800 shadow-inner overflow-hidden">
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center gap-2">
        <ScrollText className="text-amber-500 w-5 h-5" />
        <h2 className="fantasy-font text-lg text-slate-100">Chronicle of the Quest</h2>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50 space-y-4">
            <ScrollText size={64} />
            <p className="fantasy-font text-xl">The adventure awaits...</p>
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
              <div className="text-[10px] uppercase font-bold mb-1 opacity-50 flex justify-between">
                <span>{msg.role === 'user' ? 'The Adventurer' : 'Dungeon Master'}</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="prose prose-invert prose-amber max-w-none">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-bl-none px-5 py-4 border border-slate-700 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="animate-pulse">The DM is weaving the tapestry of fate...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-slate-800 border-t border-slate-700 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What do you do next?"
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
      </form>
    </div>
  );
};

export default ChatInterface;
