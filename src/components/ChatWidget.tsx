import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ChatWidgetProps {
  bookingId?: string;
  recipientId?: string;
  recipientName?: string;
}

interface MockMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'guest';
  content: string;
  createdAt: string;
  read: boolean;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ bookingId, recipientId, recipientName }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<MockMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock messages for demo
  useEffect(() => {
    if (user && isOpen) {
      const mockMessages: MockMessage[] = [
        {
          id: '1',
          senderId: 'admin1',
          senderName: 'Vilakazi Props Host',
          senderRole: 'admin',
          content: 'Welcome! How can I help you with your booking?',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          read: true
        },
        {
          id: '2',
          senderId: user.id,
          senderName: user.name,
          senderRole: user.role,
          content: 'Hi! I have a question about check-in procedures.',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          read: true
        },
        {
          id: '3',
          senderId: 'admin1',
          senderName: 'Vilakazi Props Host',
          senderRole: 'admin',
          content: 'Of course! Check-in is from 3:00 PM onwards. I\'ll send you the access code 24 hours before your arrival.',
          createdAt: new Date(Date.now() - 900000).toISOString(),
          read: true
        }
      ];
      setMessages(mockMessages);
    }
  }, [user, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const message: MockMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      content: newMessage,
      createdAt: new Date().toISOString(),
      read: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate host response after a delay
    if (user.role === 'guest') {
      setTimeout(() => {
        const hostResponse: MockMessage = {
          id: (Date.now() + 1).toString(),
          senderId: 'admin1',
          senderName: 'Vilakazi Props Host',
          senderRole: 'admin',
          content: 'Thanks for your message! I\'ll get back to you shortly.',
          createdAt: new Date().toISOString(),
          read: false
        };
        setMessages(prev => [...prev, hostResponse]);
      }, 2000);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 z-40 transform hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            3
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transition-all duration-200 ${
          isMinimized ? 'h-14' : 'h-96'
        } w-80`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div>
              <h3 className="font-semibold">
                {recipientName || (user.role === 'admin' ? 'Guest Support' : 'Host Chat')}
              </h3>
              {bookingId && <p className="text-xs text-blue-100">Booking #{bookingId.slice(-6)}</p>}
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                <span className="text-xs text-blue-100">Online</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-blue-700 rounded transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-blue-700 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 p-4 h-64 overflow-y-auto bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Start a conversation</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="max-w-xs">
                          {message.senderId !== user.id && (
                            <p className="text-xs text-gray-500 mb-1">{message.senderName}</p>
                          )}
                          <div
                            className={`px-3 py-2 rounded-lg text-sm ${
                              message.senderId === user.id
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                            }`}
                          >
                            <p>{message.content}</p>
                          </div>
                          <p className={`text-xs mt-1 ${
                            message.senderId === user.id ? 'text-right text-gray-400' : 'text-gray-400'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {user.role === 'guest' ? 'Chat with your host' : 'Chat with guest'}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;