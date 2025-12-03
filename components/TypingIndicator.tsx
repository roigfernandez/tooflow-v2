
'use client';

interface TypingIndicatorProps {
  users: string[];
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const getUsersText = () => {
    if (users.length === 1) {
      return users[0] === 'Tú' ? 'Escribiendo' : `${users[0]} está escribiendo`;
    }
    if (users.length === 2) {
      return `${users.join(' y ')} están escribiendo`;
    }
    return `${users.length} personas están escribiendo`;
  };

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <i className="ri-more-line text-sm text-gray-400"></i>
        </div>
      </div>
      
      <div className="flex flex-col items-start">
        <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-lg">
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600">{getUsersText()}</span>
            <div className="flex gap-1 ml-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
