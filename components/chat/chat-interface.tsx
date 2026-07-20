'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  addMessage: (msg: Message) => void;
  isLoading?: boolean;
  progress?: number;
  currentTask?: string;
  error?: string;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  addMessage,
  isLoading = false,
  progress = 0,
  currentTask,
  error,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');

    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    });

    try {
      await onSendMessage(text);
    } catch (err) {
      addMessage({
        id: `err-${Date.now()}`,
        role: 'system',
        content: `⚠️ 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
        timestamp: new Date(),
      });
    }
  }, [input, isLoading, onSendMessage, addMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex flex-col" style={{ height: 420 }}>
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-br-sm'
                : msg.role === 'system'
                  ? 'bg-white/6 border border-white/10 text-gray-300 rounded-bl-sm'
                  : 'bg-indigo-900/40 border border-indigo-500/20 text-indigo-100 rounded-bl-sm'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-purple-200' : 'text-gray-500'} text-right`}>
                {msg.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {/* 로딩 버블 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/6 border border-white/10 text-gray-300 rounded-2xl rounded-bl-sm px-4 py-3 text-sm max-w-[80%]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"/>
                <span className="text-purple-300 text-xs animate-pulse">{currentTask || '처리 중...'}</span>
              </div>
              {progress > 0 && (
                <div className="magic-progress mt-1">
                  <div className="magic-progress-bar" style={{ width: `${progress}%` }}/>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <div className="bg-red-900/30 border border-red-500/30 text-red-300 rounded-2xl px-4 py-2.5 text-xs max-w-[80%]">
              ⚠️ {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef}/>
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-white/8 pt-3">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요... (Enter로 전송)"
            rows={2}
            disabled={isLoading}
            className="flex-1 magic-input resize-none text-sm leading-relaxed"
            style={{ minHeight: 56 }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="btn-magic px-5 py-3 self-stretch flex items-center gap-1.5"
          >
            <span>전송</span>
            <span>↑</span>
          </button>
        </div>
      </div>
    </div>
  );
}
