'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TelemetryData, SupportedLanguage, ChatMessage } from '@/domain/types';
import { TRANSLATIONS } from '@/domain/i18n';
import { Bot, User, Send, Sparkles, AlertCircle } from 'lucide-react';

interface StreamingChatProps {
  telemetry: TelemetryData | null;
  language: SupportedLanguage;
}

export const StreamingChat: React.FC<StreamingChatProps> = ({
  telemetry,
  language,
}) => {
  const t = TRANSLATIONS[language];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial',
      role: 'assistant',
      content:
        language === 'ta'
          ? `வணக்கம்! நான் உங்கள் ஏரிஸ்பல்ஸ் (AerisPulse) நிகழ்நேர காற்று சுகாதார உதவியாளர். தற்போதைய ${telemetry?.cityName ?? 'நகர'} வளிமண்டல அளவீடுகள் சார்ந்து என்னிடம் ஆலோசனை கேட்கலாம்.`
          : language === 'hi'
          ? `नमस्ते! मैं आपका एरिसपल्स (AerisPulse) वास्तविक समय वायु स्वास्थ्य सहायक हूँ। वर्तमान ${telemetry?.cityName ?? 'शहर'} के वायु गुणवत्ता डेटा के आधार पर मुझसे कोई भी प्रश्न पूछ सकते हैं।`
          : `Hello! I am your AerisPulse real-time atmospheric health assistant. Ask me questions grounded strictly in current telemetry for ${telemetry?.cityName ?? 'your city'}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = [
    language === 'ta' ? 'இப்போது வெளியில் ஓட்டப்பயிற்சி செய்யலாமா?' : language === 'hi' ? 'क्या अभी बाहर दौड़ना सुरक्षित है?' : 'Is it safe to jog outside right now?',
    language === 'ta' ? 'நான் என்ன முகமூடி அணிய வேண்டும்?' : language === 'hi' ? 'मुझे कौन सा मास्क पहनना चाहिए?' : 'Which mask grade should I wear?',
    language === 'ta' ? 'குழந்தைகளுக்கான முன்னெச்சரிக்கை என்ன?' : language === 'hi' ? 'बच्चों और बुजुर्गों के लिए क्या सावधानी बरतें?' : 'Protective tips for children and elderly?',
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText ?? input;
    if (!textToSend.trim() || isStreaming || !telemetry) return;

    setStreamError(null);
    setInput('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMsgId = `assistant-${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      groundedTelemetryAqi: telemetry.usAqi,
    };

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          cityName: telemetry.cityName,
          aqi: telemetry.usAqi,
          dominantPollutant: telemetry.dominantPollutant,
          pm25: telemetry.pollutants.pm25,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Readable stream not supported');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const lines = chunkText.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawData = line.replace('data: ', '').trim();
            if (rawData === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(rawData) as { chunk?: string };
              if (parsed.chunk) {
                accumulated += parsed.chunk;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg
                  )
                );
              }
            } catch {
              // Ignore non-json chunk lines
            }
          }
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Chat stream error';
      setStreamError(errMsg);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  language === 'ta'
                    ? 'மன்னிக்கவும், தரவு பெறுவதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
                    : language === 'hi'
                    ? 'क्षमा करें, प्रतिक्रिया प्राप्त करने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
                    : 'Apologies, a streaming connection error occurred. Please try again.',
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <section
      aria-labelledby="chat-heading"
      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col h-[520px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 mb-4">
        <div className="flex items-center space-x-2.5">
          <Bot className="w-5 h-5 text-blue-500" aria-hidden="true" />
          <div>
            <h2 id="chat-heading" className="text-base font-bold text-slate-900 dark:text-white">
              {t.assistantTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grounded strictly in verified {telemetry?.cityName ?? 'city'} atmospheric feeds
            </p>
          </div>
        </div>
        {telemetry && (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            AQI {telemetry.usAqi} • PM2.5: {telemetry.pollutants.pm25} µg
          </span>
        )}
      </div>

      {/* Messages Stream Container */}
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

      {/* Error alert if any */}
      {streamError && (
        <div className="my-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{streamError}</span>
        </div>
      )}

      {/* Quick Prompts */}
      <div className="pt-2 pb-2 flex flex-wrap gap-1.5" role="toolbar" aria-label="Quick suggestion queries">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(prompt)}
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
          handleSend();
        }}
        className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.chatPlaceholder}
          disabled={isStreaming || !telemetry}
          aria-label={t.chatPlaceholder}
          className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || isStreaming || !telemetry}
          aria-label={t.sendChat}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
};
