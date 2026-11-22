'use client';

import React from 'react';
import { ChatMessage } from '@/domain/types';
import { Sparkles, User } from 'lucide-react';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isStreaming,
  messagesEndRef,
}) => {
  return (
    <div
      className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 focus:outline-none"
      tabIndex={0}
      aria-live="polite"
      aria-label="Conversation messages"
    >
      {messages.map((msg) => {
        const isUser = msg.role === 'user';
        return (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isUser ? (
                <User className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Sparkles className="w-4 h-4 text-blue-500" aria-hidden="true" />
              )}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                isUser
                  ? 'bg-blue-600 text-white rounded-br-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-bl-xs'
              }`}
            >
              {msg.content === '' && isStreaming ? (
                <div className="flex items-center space-x-1 py-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
              <span
                className={`block text-[10px] mt-1 text-right ${
                  isUser ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
