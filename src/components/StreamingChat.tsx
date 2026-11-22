'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TelemetryData, SupportedLanguage, ChatMessage } from '@/domain/types';
import { TRANSLATIONS } from '@/domain/i18n';
import { Bot, AlertCircle } from 'lucide-react';
import { ChatMessageList } from './ChatMessageList';
import { ChatInputBar } from './ChatInputBar';
import { consumeChatStream } from './chat-stream-consumer';

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
      let accumulated = '';

      await consumeChatStream(reader, (chunk) => {
        accumulated += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg
          )
        );
      });
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
      <ChatMessageList
        messages={messages}
        isStreaming={isStreaming}
        messagesEndRef={messagesEndRef}
      />

      {/* Error alert if any */}
      {streamError && (
        <div className="my-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{streamError}</span>
        </div>
      )}

      {/* Quick Prompts & Input Bar */}
      <ChatInputBar
        input={input}
        setInput={setInput}
        isStreaming={isStreaming}
        canSend={Boolean(telemetry)}
        quickPrompts={quickPrompts}
        placeholder={t.chatPlaceholder}
        sendLabel={t.sendChat}
        onSend={handleSend}
      />
    </section>
  );
};
