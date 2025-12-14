'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Minimize2, Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/api'; // Use our API Config

type Message = {
  id: number;
  text: string;
  sender: 'bot' | 'user';
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Ayubowan! 🙏 Welcome to Smart Citizen LK.", sender: 'bot' },
    { id: 2, text: "I can help you with Passports, NICs, and more. Ask me anything!", sender: 'bot' }
  ]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput(''); // Clear input immediately

    // 1. Add User Message
    const userMsg: Message = { id: Date.now(), text: userText, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // 2. Call Python Backend
      const res = await fetch(`${API_URL}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();

      // 3. Add Bot Response
      const botMsg: Message = { id: Date.now() + 1, text: data.response, sender: 'bot' };
      setMessages((prev) => [...prev, botMsg]);

    } catch (error) {
      const errorMsg: Message = { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting to the server.", sender: 'bot' };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* 1. Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-700 hover:bg-blue-800 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center gap-2 border-4 border-white"
        >
          <MessageSquare size={28} />
          <span className="font-bold hidden md:block">Help</span>
        </button>
      )}

      {/* 2. Chat Window */}
      {isOpen && (
        <div className="bg-white w-[350px] md:w-[400px] h-[500px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in">
          
          {/* Header */}
          <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full relative">
                <Bot size={24} />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-blue-900 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm">Smart Assistant</h3>
                <p className="text-[10px] text-blue-200">Online | Official Gov AI</p>
              </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setIsOpen(false)} className="text-blue-200 hover:text-white"><Minimize2 size={18} /></button>
                <button onClick={() => setIsOpen(false)} className="text-blue-200 hover:text-white"><X size={18} /></button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                  <Loader2 className="animate-spin w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400">AI is typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 pb-2 bg-gray-50 flex gap-2 overflow-x-auto no-scrollbar">
             <button onClick={() => { setInput('How much is a Passport?'); handleSend(); }} className="whitespace-nowrap px-3 py-1 bg-white border border-blue-200 text-blue-600 text-xs rounded-full hover:bg-blue-50">🛂 Passport Fee</button>
             <button onClick={() => { setInput('How to get NIC?'); handleSend(); }} className="whitespace-nowrap px-3 py-1 bg-white border border-blue-200 text-blue-600 text-xs rounded-full hover:bg-blue-50">🆔 Get NIC</button>
             <button onClick={() => { setInput('Online Payment'); handleSend(); }} className="whitespace-nowrap px-3 py-1 bg-white border border-blue-200 text-blue-600 text-xs rounded-full hover:bg-blue-50">💳 Payments</button>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..." 
              className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl px-4 py-2 text-sm outline-none transition-all"
            />
            <button type="submit" disabled={isTyping} className="bg-blue-700 hover:bg-blue-800 text-white p-2 rounded-xl transition-colors disabled:opacity-50">
              <Send size={20} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}