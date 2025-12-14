'use client';

import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

// Placeholder messaging UI for DS to contact GS officers
export default function DSMessagesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const threads = [
    { id: 'gs-1', name: 'GS Officer - Section A', last: 'Pending certificates ready' },
    { id: 'gs-2', name: 'GS Officer - Section B', last: 'Need NIC copy from applicant' },
  ];

  const handleSend = () => {
    if (!selected || !message.trim()) return;
    setMessage('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-600">Chat with GS officers</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${selected === t.id ? 'bg-purple-50' : ''}`}
            >
              <p className="font-semibold text-gray-900">{t.name}</p>
              <p className="text-xs text-gray-600 truncate">{t.last}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
        {selected ? (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <MessageSquare className="text-purple-600" />
              <p className="font-bold text-gray-900">Conversation</p>
            </div>
            <div className="flex-1 p-4 overflow-y-auto text-gray-500 text-sm">
              Select a message thread to view history. (Persistence pending backend endpoint.)
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2"
              >
                <Send size={16} /> Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <MessageSquare size={48} className="opacity-40 mb-3" />
            <p>Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
