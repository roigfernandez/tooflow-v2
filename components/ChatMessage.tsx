
'use client';

interface Message {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: Date;
  mentions: string[];
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isOwn = message.author === 'Tú';
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'ahora';
    if (minutes < 60) return `hace ${minutes}m`;
    if (hours < 24) return `hace ${hours}h`;
    
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessageContent = (content: string, mentions: string[]) => {
    if (mentions.length === 0) return content;
    
    let result = content;
    mentions.forEach(mention => {
      const mentionRegex = new RegExp(`@${mention.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
      result = result.replace(mentionRegex, `<span class="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1 rounded font-medium">@${mention}</span>`);
    });
    
    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && (
        <div className="flex-shrink-0">
          <img
            src={message.avatar}
            alt={message.author}
            className="w-8 h-8 rounded-full"
          />
        </div>
      )}
      
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
        {!isOwn && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{message.author}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(message.timestamp)}</span>
          </div>
        )}
        
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-blue-500 text-white rounded-br-lg'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-lg'
          }`}
        >
          <div className={`text-sm ${isOwn ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
            {renderMessageContent(message.content, message.mentions)}
          </div>
        </div>
        
        {isOwn && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTime(message.timestamp)}</span>
        )}
      </div>
    </div>
  );
}