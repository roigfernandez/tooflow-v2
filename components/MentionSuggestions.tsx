
'use client';
import { useEffect, useRef } from 'react';

interface User {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}

interface MentionSuggestionsProps {
  users: User[];
  onSelect: (user: User) => void;
  onClose: () => void;
}

export default function MentionSuggestions({ users, onSelect, onClose }: MentionSuggestionsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (users.length === 0) return null;

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10"
    >
      <div className="py-2">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelect(user)}
            className="w-full px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-left transition-colors"
          >
            <div className="relative flex-shrink-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              {user.online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">
                {user.online ? 'En línea' : 'Desconectado'}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
