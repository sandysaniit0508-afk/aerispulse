'use client';

import React from 'react';
import { Send } from 'lucide-react';

interface ChatInputBarProps {
  input: string;
  setInput: (value: string) => void;
  isStreaming: boolean;
  canSend: boolean;
  quickPrompts: string[];
  placeholder: string;
  sendLabel: string;
  onSend: (messageText?: string) => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  input,
  setInput,
  isStreaming,
  canSend,
  quickPrompts,
  placeholder,
  sendLabel,
  onSend,
}) => {
  return (
    <>
      {/* Quick Prompts */}
      <div className="pt-2 pb-2 flex flex-wrap gap-1.5" role="toolbar" aria-label="Quick suggestion queries">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSend(prompt)}
            disabled={isStreaming}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={isStreaming || !canSend}
          aria-label={placeholder}
          className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || isStreaming || !canSend}
          aria-label={sendLabel}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </button>
      </form>
    </>
  );
};
