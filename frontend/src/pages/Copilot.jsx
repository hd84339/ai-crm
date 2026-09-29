import React, { useState } from 'react';
import { Bot, Send, Sparkles, User as UserIcon, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { logAIInteraction } from '../services/api';

export default function Copilot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      text: 'How can I help you manage your HCP interactions today?'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: input }]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      // For demo purposes, we still intercept the exact string "haven't contacted recently" 
      // because the backend LangGraph doesn't have a fetch node for "recent without interaction" fully built yet,
      // but for everything else (like logging interactions), we use the real AI!
      if (currentInput.toLowerCase().includes('haven\'t contacted') || currentInput.toLowerCase().includes('recent')) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            type: 'ai',
            text: 'I found 2 HCPs with no recent interaction.',
            structuredData: {
              type: 'hcp_list',
              data: [
                { id: 3, name: 'Dr. Mehta', lastContact: '34 days ago' },
                { id: 4, name: 'Dr. Shah', lastContact: '41 days ago' }
              ]
            }
          }]);
          setLoading(false);
        }, 1500);
        return;
      }

      // Call the real FastAPI endpoint
      const res = await logAIInteraction(currentInput);
      
      let replyText = "I processed that for you.";
      
      // Basic response handling based on what the LangGraph returns
      if (res && res.action === 'log') {
        replyText = `Successfully logged a ${res.extracted_data?.engagement_level} engagement, ${res.extracted_data?.sentiment} sentiment interaction with ${res.extracted_data?.doctor_name}.`;
      } else if (res && res.output) {
        replyText = typeof res.output === 'string' ? res.output : JSON.stringify(res.output);
      }
      
      setMessages(prev => [...prev, {
        type: 'ai',
        text: replyText
      }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        type: 'ai',
        text: 'Sorry, I encountered an error communicating with the LangGraph server.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const HcpCard = ({ hcp }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm my-2 flex items-center justify-between">
      <div>
        <div className="font-bold text-slate-900">{hcp.name}</div>
        <div className="text-sm text-slate-500">Last contact: {hcp.lastContact}</div>
      </div>
      <div className="flex gap-2">
        <Link to={`/hcps/${hcp.id}`} className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors">
          View HCP
        </Link>
        <button className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Log Interaction
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      <div className="flex items-center mb-6">
        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center mr-4 shadow-md shadow-blue-500/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CRM AI Copilot</h1>
          <p className="text-sm text-slate-500">Powered by LangGraph</p>
        </div>
      </div>
      
      <div className="flex-1 bg-slate-50 rounded-t-xl border border-b-0 border-slate-200 p-6 overflow-y-auto shadow-inner flex flex-col gap-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.type === 'user' ? 'bg-indigo-600 text-white' : 'bg-blue-100 text-blue-600'
            }`}>
              {msg.type === 'user' ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            
            {/* Message Bubble */}
            <div className={`max-w-[80%] ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-4 rounded-2xl ${
                msg.type === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
              
              {/* Structured Data Render */}
              {msg.structuredData?.type === 'hcp_list' && (
                <div className="mt-3 text-left w-full max-w-sm">
                  {msg.structuredData.data.map(hcp => (
                    <HcpCard key={hcp.id} hcp={hcp} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white border border-slate-200 text-slate-800 shadow-sm rounded-2xl rounded-tl-sm p-4 flex gap-1 items-center">
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white p-4 border border-slate-200 rounded-b-xl shadow-sm">
        <form className="relative flex items-center" onSubmit={handleSubmit}>
          <input
            type="text"
            className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="E.g., Show me doctors I haven't contacted recently..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
