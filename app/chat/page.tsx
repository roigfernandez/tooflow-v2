
'use client';
import { useState, useRef, useEffect } from 'react';
import BottomNavigation from '@/components/BottomNavigation';
import ChatMessage from '@/components/ChatMessage';
import TypingIndicator from '@/components/TypingIndicator';
import MentionSuggestions from '@/components/MentionSuggestions';

interface Message {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: Date;
  mentions: string[];
}

interface User {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      author: 'María García',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20with%20brown%20hair%20smiling%20in%20office%20environment%2C%20business%20portrait%2C%20clean%20background%2C%20natural%20lighting%2C%20confident%20expression%2C%20modern%20workplace&width=40&height=40&seq=maria1&orientation=squarish',
      content: '¡Hola equipo! ¿Cómo van con el proyecto de la nueva app?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      mentions: []
    },
    {
      id: '2',
      author: 'Carlos Rodríguez',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20with%20dark%20hair%20in%20business%20casual%20attire%2C%20friendly%20smile%2C%20office%20background%2C%20natural%20lighting%2C%20approachable%20demeanor&width=40&height=40&seq=carlos1&orientation=squarish',
      content: '@María García Todo bien por acá. Ya terminé los mockups del dashboard.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      mentions: ['María García']
    },
    {
      id: '3',
      author: 'Ana López',
      avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20with%20blonde%20hair%20in%20modern%20office%20setting%2C%20confident%20smile%2C%20business%20attire%2C%20bright%20lighting%2C%20contemporary%20workspace&width=40&height=40&seq=ana1&orientation=squarish',
      content: 'Perfecto Carlos! Yo estoy trabajando en la integración de la API. ¿Para cuándo necesitás que esté lista?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      mentions: []
    },
    {
      id: '4',
      author: 'Diego Martín',
      avatar: 'https://readdy.ai/api/search-image?query=young%20professional%20man%20with%20casual%20shirt%20in%20creative%20workspace%2C%20friendly%20expression%2C%20modern%20office%20background%2C%20natural%20light&width=40&height=40&seq=diego1&orientation=squarish',
      content: '@Ana López Idealmente para el viernes. ¿Te parece factible?',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      mentions: ['Ana López']
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const users: User[] = [
    { id: '1', name: 'María García', avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20with%20brown%20hair%20smiling%20in%20office%20environment%2C%20business%20portrait%2C%20clean%20background%2C%20natural%20lighting%2C%20confident%20expression%2C%20modern%20workplace&width=40&height=40&seq=maria2&orientation=squarish', online: true },
    { id: '2', name: 'Carlos Rodríguez', avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20with%20dark%20hair%20in%20business%20casual%20attire%2C%20friendly%20smile%2C%20office%20background%2C%20natural%20lighting%2C%20approachable%20demeanor&width=40&height=40&seq=carlos2&orientation=squarish', online: true },
    { id: '3', name: 'Ana López', avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20with%20blonde%20hair%20in%20modern%20office%20setting%2C%20confident%20smile%2C%20business%20attire%2C%20bright%20lighting%2C%20contemporary%20workspace&width=40&height=40&seq=ana2&orientation=squarish', online: false },
    { id: '4', name: 'Diego Martín', avatar: 'https://readdy.ai/api/search-image?query=young%20professional%20man%20with%20casual%20shirt%20in%20creative%20workspace%2C%20friendly%20expression%2C%20modern%20office%20background%2C%20natural%20light&width=40&height=40&seq=diego2&orientation=squarish', online: true },
    { id: '5', name: 'Laura Fernández', avatar: 'https://readdy.ai/api/search-image?query=professional%20woman%20with%20short%20hair%20in%20business%20environment%2C%20confident%20posture%2C%20office%20background%2C%20professional%20lighting&width=40&height=40&seq=laura1&orientation=squarish', online: true }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (newMessage.trim()) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [newMessage]);

  useEffect(() => {
    if (isTyping) {
      setTypingUsers(['Tú']);
      const timer = setTimeout(() => {
        setTypingUsers([]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const mentions = extractMentions(newMessage);
      const message: Message = {
        id: Date.now().toString(),
        author: 'Tú',
        avatar: 'https://readdy.ai/api/search-image?query=professional%20person%20with%20friendly%20smile%20in%20modern%20office%20setting%2C%20business%20casual%20attire%2C%20confident%20expression%2C%20contemporary%20workplace&width=40&height=40&seq=user1&orientation=squarish',
        content: newMessage,
        timestamp: new Date(),
        mentions
      };
      setMessages([...messages, message]);
      setNewMessage('');
      setShowMentions(false);
    }
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@([^@\\s]+(?:\\s+[^@\\s]+)*?)(?=\\s|$|@)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowMentions(true);
      setMentionSearch('');
    } else if (lastAtIndex !== -1 && value[lastAtIndex + 1] !== ' ') {
      const searchTerm = value.substring(lastAtIndex + 1);
      if (searchTerm.includes(' ')) {
        setShowMentions(false);
      } else {
        setShowMentions(true);
        setMentionSearch(searchTerm);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (user: User) => {
    const lastAtIndex = newMessage.lastIndexOf('@');
    const beforeMention = newMessage.substring(0, lastAtIndex);
    const afterMention = `@${user.name} `;
    setNewMessage(beforeMention + afterMention);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular actualización de mensajes
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="flex-1 pt-4 pb-24 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Header consistente con dashboard */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 mx-4 rounded-t-xl">
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Chat del Equipo
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Comunícate y colabora en tiempo real
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {users.slice(0, 4).map((user, index) => (
                    <div key={user.id} className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-900"
                      />
                      {user.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900"></div>
                      )}
                    </div>
                  ))}
                  {users.length > 4 && (
                    <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                      <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">+{users.length - 4}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>{users.filter(u => u.online).length} miembros en línea</span>
                  </div>
                  <button className="w-10 h-10 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-more-line text-sm"></i>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area mejorado */}
          <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto bg-white dark:bg-gray-900 mx-4">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <i className="ri-chat-3-line text-cyan-500 dark:text-cyan-400 text-lg"></i>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">¡Sé el primero en escribir!</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Inicia la conversación con tu equipo. Compartí ideas, hacé preguntas o simplemente saludá.
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {typingUsers.length > 0 && (
                  <TypingIndicator users={typingUsers} />
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input mejorado */}
          <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 mx-4 rounded-b-xl">
            {showMentions && (
              <MentionSuggestions
                users={filteredUsers}
                onSelect={handleMentionSelect}
                onClose={() => setShowMentions(false)}
              />
            )}
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribí un mensaje al equipo..."
                  className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  maxLength={1000}
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-emotion-line text-sm"></i>
                  </div>
                </button>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all shadow-lg whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-send-plane-line text-sm"></i>
                </div>
              </button>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
              Presioná Enter para enviar • Shift + Enter para nueva línea • Usa @ para mencionar
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
