import React, { useState, useEffect } from 'react';
import { getParentingAdvice } from '../services/geminiService';
import { Send, User, Bot, Loader2 } from 'lucide-react';

const Coach: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Hi! I'm your StarQuest Coach. I can help you set fair point values, suggest age-appropriate tasks for an 8-year-old, or help you structure this reward system effectively. What's on your mind?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Initial prompt handling if this is first load
  useEffect(() => {
     // Optional: Auto-load the specific user question context if we wanted to
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const advice = await getParentingAdvice(userMsg);
    
    setMessages(prev => [...prev, { role: 'ai', text: advice }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-emerald-600 p-4 text-white">
        <h2 className="font-bold flex items-center gap-2"><Bot size={20}/> Parent Coach</h2>
        <p className="text-emerald-100 text-xs mt-1">AI-powered advice for your reward system</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`p-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Bot size={16}/></div>
             <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none flex items-center">
               <Loader2 className="animate-spin text-gray-400" size={16} />
             </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t bg-gray-50 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask for advice..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default Coach;
