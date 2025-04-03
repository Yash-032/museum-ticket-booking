import React from 'react';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
}

const ChatBubble: React.FC = ({ message, isUser }) => {
  return (
    <div className={`flex items-start ${isUser ? 'justify-end' : ''}`}>
      <div 
        className={`rounded-lg py-2 px-4 max-w-xs ${
          isUser 
            ? 'bg-neutral-100 text-neutral-800' 
            : 'bg-primary-600 text-white'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message}</p>
      </div>
    </div>
  );
};

export default ChatBubble;
