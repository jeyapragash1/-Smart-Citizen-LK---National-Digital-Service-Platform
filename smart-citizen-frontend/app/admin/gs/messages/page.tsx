'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Loader2, Search, Send, Trash2 } from 'lucide-react';
import { getGSMessages, sendGSMessage } from '@/lib/api';

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getGSMessages();
        setMessages(Array.isArray(data) ? data : []);
        setSelectedChat(null);
      } catch (err: any) {
        setError(err?.message || 'Failed to load messages');
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredMessages = messages.filter(msg => 
    (msg.person || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const persist = async () => {
      try {
        await sendGSMessage({
          sender: 'gs',
          recipient: selectedChat.person || 'recipient',
          text: newMessage
        });
      } catch (err: any) {
        setError(err?.message || 'Failed to send message');
      }
    };

    const updatedMessages = messages.map(msg => {
      if (msg.id === selectedChat.id) {
        return {
          ...msg,
          conversation: [...(msg.conversation || []), { from: 'Me', text: newMessage, time: 'just now' }],
          lastMessage: newMessage,
          unread: 0
        };
      }
      return msg;
    });
    setMessages(updatedMessages);
    setSelectedChat(updatedMessages.find(msg => msg.id === selectedChat.id));
    setNewMessage('');
    persist();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Messages List */}
      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">💬 Messages</h1>
          <div className="mt-4 flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="bg-transparent w-full outline-none text-gray-900"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Message List */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm border-b border-red-200">{error}</div>
        )}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.length === 0 && (
              <div className="p-6 text-center text-gray-500">No conversations yet.</div>
            )}
            {filteredMessages.map(msg => (
              <div
                key={msg.id}
                onClick={() => setSelectedChat(msg)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition ${
                  selectedChat?.id === msg.id 
                    ? 'bg-blue-50 border-l-4 border-l-blue-600' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                    {msg.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-semibold text-gray-900 truncate">{msg.person}</p>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{msg.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">{msg.lastMessage}</p>
                  </div>
                  {msg.unread > 0 && (
                    <div className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {msg.unread}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                  {selectedChat.avatar}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selectedChat.person}</p>
                  <p className="text-xs text-gray-500">Active now</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                <Trash2 size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {selectedChat.conversation.map((msg: any, idx: number) => (
                <div key={idx} className={`flex ${msg.from === 'Me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-3 rounded-lg ${
                    msg.from === 'Me' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                  }`}>
                    <p>{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.from === 'Me' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  onClick={handleSendMessage}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                >
                  <Send size={18} /> Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <MessageSquare size={64} className="opacity-30 mb-4" />
            <p className="text-lg font-medium">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
