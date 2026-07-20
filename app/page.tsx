'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import WizardTower from '@/components/agents/wizard-tower';
import KnowledgeGraph from '@/components/graph/knowledge-graph';
import ChatInterface, { Message } from '@/components/chat/chat-interface';
import KnowledgeHistory from '@/components/knowledge/knowledge-history';
import { AgentState } from '@/lib/agents/types';
import { Node, Edge } from 'reactflow';
import { Upload, Link, LayoutDashboard, Share2, Archive } from 'lucide-react';

type Tab = 'dashboard' | 'graph' | 'history';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: '대시보드', icon: <LayoutDashboard size={14}/> },
  { id: 'graph',     label: '지식 그래프', icon: <Share2 size={14}/> },
  { id: 'history',   label: '지식 보관소', icon: <Archive size={14}/> },
];

const BASE_AGENTS: AgentState[] = [
  { id: 'cauldron',  name: '마법 가마솥',  role: '중앙 통제',   emoji: '🧙‍♂️', status: 'idle', position: { x: 50, y: 10 }, floor: 5 },
  { id: 'desk',      name: '마법사의 책상', role: '지식 분석',   emoji: '🔮',  status: 'idle', position: { x: 50, y: 20 }, floor: 4 },
  { id: 'library',   name: '비전 도서관',   role: '데이터 분석', emoji: '⚗️',  status: 'idle', position: { x: 50, y: 30 }, floor: 3 },
  { id: 'debug',     name: '흑마법 연구실', role: '버그 치료',   emoji: '🦹',  status: 'idle', position: { x: 50, y: 80 }, floor: 0 },
];

// ── 간단한 키워드 기반 AI 응답 생성 ────────────────────────────────────────
function generateResponse(message: string): string {
  const msg = message.toLowerCase();

  // 이번주 AI 관련 내용 요청 (다양한 표현 지원)
  if (msg.includes('이번주') || msg.includes('이번 주') || msg.includes('주간') || 
      msg.includes('금주') || msg.includes('이번 주에') || msg.includes('저번주')) {
    if (msg.includes('ai') || msg.includes('인공지능') || msg.includes('딥러닝') || 
        msg.includes('머신러닝') || msg.includes('머신 러닝')) {
      return `🔍 이번 주 수집된 AI 관련 지식을 검색했습니다!\n\n📄 **수집된 내용 (5건)**\n\n1. **NVIDIA AI GPU 아키텍처** (2026-07-20)\n   - Blackwell GPU 구조 분석\n   - 태그: #AI #GPU #NVIDIA\n\n2. **MCP 프로토콜 기술 문서** (2026-07-19)\n   - Model Context Protocol 공식 문서\n   - 태그: #MCP #프로토콜 #AI\n\n3. **멀티 에이전트 시스템 설계** (2026-07-17)\n   - 다중 AI 에이전트 오케스트레이션 패턴\n   - 태그: #AI #에이전트 #아키텍처\n\n💡 더 자세한 내용이 필요하신가요?`;
    }
    return `🔍 이번 주 수집된 지식을 검색했습니다!\n\n총 5개의 문서가 발견되었습니다. 특정 주제를 말씀해주시면 더 정확하게 찾아드릴게요.`;
  }

  if (msg.includes('nvidia') || msg.includes('gpu')) {
    return `🖥️ NVIDIA 관련 수집된 내용입니다:\n\n**NVIDIA AI GPU 아키텍처 분석**\n- Blackwell GPU: 이전 세대 대비 성능 2.5x 향상\n- NVLink 4.0 인터커넥트 지원\n- AI 추론 최적화 아키텍처\n\n관련 태그: #NVIDIA #GPU #딥러닝`;
  }

  if (msg.includes('mcp') || msg.includes('프로토콜')) {
    return `🔌 MCP(Model Context Protocol) 관련 수집된 내용:\n\n**MCP 프로토콜 개요**\n- AI 에이전트와 외부 도구 연결 표준\n- JSON-RPC 기반 통신\n- 도구/리소스/프롬프트 3가지 프리미티브\n\n현재 이 시스템도 MCP를 활용하고 있습니다! 🧙‍♂️`;
  }

  if (msg.includes('추가') || msg.includes('저장')) {
    return `✅ 문서 추가 요청을 받았습니다!\n\n파일 업로드 또는 웹 링크 입력으로 지식을 추가할 수 있어요.\n아래 "지식 추가" 패널을 이용해주세요.`;
  }

  if (msg.includes('안녕') || msg.includes('hello') || msg.includes('hi')) {
    return `안녕하세요! 🧙‍♂️ Amy의 Brain Office에 오신 걸 환영합니다!\n\n저는 당신의 지식 관리를 도와드리는 AI 에이전트입니다.\n\n**할 수 있는 것들:**\n- 📄 PDF 문서 분석\n- 🌐 웹페이지 내용 추출\n- 🔍 저장된 지식 검색\n- 🧠 지식 간 연관성 분석\n\n무엇을 도와드릴까요?`;
  }

  if (msg.includes('검색') || msg.includes('찾아')) {
    return `🔍 검색 기능을 사용하시겠어요?\n\n구체적인 키워드나 주제를 입력해 주시면 저장된 지식에서 관련 내용을 찾아드립니다.\n\n예시: "AI 논문 검색해줘", "지난달 수집한 Python 자료 알려줘"`;
  }

  // 기본 응답
  return `🧙‍♂️ 말씀하신 내용을 분석했습니다.\n\n현재 저장된 지식 데이터베이스에서 "${message.slice(0, 20)}..." 관련 정보를 찾고 있습니다.\n\n더 구체적인 키워드를 입력하시면 정확한 결과를 드릴 수 있어요! (예: "AI", "이번주", "NVIDIA" 등)`;
}

const WELCOME_MSG: Message = {
  id: 'welcome',
  role: 'system',
  content: '안녕하세요! Amy의 Brain Office에 오신 것을 환영합니다. 🧙‍♂️\n저장된 지식을 검색하거나 문서를 추가해보세요!',
  timestamp: new Date(),
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  // ── 채팅 상태: 탭 간 유지 ──
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [agents, setAgents] = useState<AgentState[]>(BASE_AGENTS);
  const [graphNodes, setGraphNodes] = useState<Node[]>([]);
  const [graphEdges, setGraphEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [error, setError] = useState('');
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGraphNodes([{ id: 'mock-1', position: { x: 100, y: 100 }, data: { label: 'Knowledge Node' } }]);
  }, []);

  const addMessage = useCallback((msg: Message) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const simulate = async (steps: [string, number, string?][]) => {
    for (const [task, pct, agentId] of steps) {
      setCurrentTask(task);
      setProgress(pct);
      if (agentId) {
        setAgents(prev => prev.map(a =>
          a.id === agentId ? { ...a, status: 'working', currentTask: task } : a
        ));
      }
      await new Promise(r => setTimeout(r, 600));
    }
  };

  const handleSendMessage = useCallback(async (text: string) => {
    setIsLoading(true);
    setError('');

    try {
      // 가마솥 → 도서관 에이전트 시뮬레이션
      await simulate([
        ['🧙‍♂️ 가마솥에서 요청을 분석하는 중...', 20, 'cauldron'],
        ['🔮 책상에서 지식을 분석하는 중...', 50, 'desk'],
        ['🔎 도서관에서 검색 주문을 외우는 중...', 75, 'library'],
        ['✅ 결과를 정리하고 있어요', 90, 'cauldron'],
      ]);

      // AI 응답 생성
      const response = generateResponse(text);
      addMessage({
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
      setCurrentTask('');
      setAgents(BASE_AGENTS);
    }
  }, [addMessage]);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true); setError('');
    addMessage({ id: `user-file-${Date.now()}`, role: 'user', content: `📄 파일 업로드: ${file.name}`, timestamp: new Date() });
    try {
      await simulate([
        ['📄 파일을 업로드하는 중...', 20, 'desk'],
        ['📖 텍스트를 추출하는 중...', 50, 'desk'],
        ['🔬 지식을 분석하는 중...', 80, 'library'],
        ['✅ 완료!', 100, 'cauldron'],
      ]);
      addMessage({
        id: `ai-file-${Date.now()}`,
        role: 'assistant',
        content: `✅ **${file.name}** 파일이 성공적으로 처리되었습니다!\n\n지식 그래프에 추가되었고, 이제 검색이 가능합니다.`,
        timestamp: new Date(),
      });
    } finally { setIsLoading(false); setProgress(0); setCurrentTask(''); setAgents(BASE_AGENTS); }
  };

  const handleUrlSubmit = async () => {
    const url = urlInputRef.current?.value?.trim();
    if (!url) return;
    setIsLoading(true); setError('');
    addMessage({ id: `user-url-${Date.now()}`, role: 'user', content: `🌐 웹 스크래핑: ${url}`, timestamp: new Date() });
    if (urlInputRef.current) urlInputRef.current.value = '';
    try {
      await simulate([
        ['🌐 웹페이지를 스크래핑하는 중...', 30, 'desk'],
        ['📖 본문을 추출하는 중...', 60, 'desk'],
        ['🔬 지식을 분석하는 중...', 85, 'library'],
        ['✅ 완료!', 100, 'cauldron'],
      ]);
      addMessage({
        id: `ai-url-${Date.now()}`,
        role: 'assistant',
        content: `✅ **${url}** 페이지의 내용이 성공적으로 추출되었습니다!\n\n지식 보관소에 저장되었고 검색이 가능합니다.`,
        timestamp: new Date(),
      });
    } finally { setIsLoading(false); setProgress(0); setCurrentTask(''); setAgents(BASE_AGENTS); }
  };

  return (
    <div className="magic-bg min-h-screen">
      {/* ── Header ── */}
      <header className="header-glass sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center text-base shadow-lg glow-purple">
                🧙‍♂️
              </div>
              <div>
                <h1 className="font-cinzel text-base font-bold text-white tracking-wide leading-none">
                  Amy&apos;s Brain Office
                </h1>
                <p className="text-[10px] text-purple-400 mt-0.5 tracking-widest uppercase">Personal Knowledge System</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
              <span className="text-[11px] text-gray-400">System Online</span>
            </div>
          </div>
          <div className="flex gap-1 mt-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`tab-btn flex items-center gap-1.5 ${activeTab === tab.id ? 'active' : ''}`}>
                {tab.icon}<span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-6 animate-fade-in">
        {/* ══ 대시보드 ══ */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-5 xl:col-span-4">
              <div className="section-title mb-3">작업 현황</div>
              <div className="glow-purple rounded-xl overflow-hidden">
                <WizardTower agents={agents} />
              </div>
            </div>

            <div className="col-span-7 xl:col-span-8 flex flex-col gap-5">
              <div className="glass-card p-5 flex-1">
                <div className="section-title mb-4">AI 채팅</div>
                <ChatInterface
                  messages={messages}
                  addMessage={addMessage}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  progress={progress}
                  currentTask={currentTask}
                  error={error}
                />
              </div>

              <div className="glass-card p-5">
                <div className="section-title mb-4">지식 추가</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-dashed border-purple-500/20 bg-purple-900/10 p-4 hover:border-purple-500/40 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-purple-600/20 flex items-center justify-center">
                        <Upload size={13} className="text-purple-400"/>
                      </div>
                      <span className="text-white text-sm font-medium">파일 업로드</span>
                    </div>
                    <input type="file" accept=".pdf"
                      onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      className="magic-file w-full text-xs text-gray-400" disabled={isLoading}/>
                    <p className="text-purple-400/60 text-[11px] mt-2">PDF 파일을 지원합니다</p>
                  </div>
                  <div className="rounded-xl border border-dashed border-blue-500/20 bg-blue-900/10 p-4 hover:border-blue-500/40 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center">
                        <Link size={13} className="text-blue-400"/>
                      </div>
                      <span className="text-white text-sm font-medium">웹페이지 링크</span>
                    </div>
                    <div className="flex gap-2">
                      <input ref={urlInputRef} type="url" placeholder="https://example.com"
                        className="magic-input text-xs flex-1" disabled={isLoading}/>
                      <button onClick={handleUrlSubmit} disabled={isLoading} className="btn-magic">추가</button>
                    </div>
                    <p className="text-blue-400/60 text-[11px] mt-2">기사·블로그 본문을 추출합니다</p>
                  </div>
                </div>
                {isLoading && (
                  <div className="mt-4">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-purple-300 text-xs animate-pulse">{currentTask}</span>
                      <span className="text-purple-400 text-xs">{progress}%</span>
                    </div>
                    <div className="magic-progress"><div className="magic-progress-bar" style={{ width: `${progress}%` }}/></div>
                  </div>
                )}
                {error && <div className="mt-3 px-3 py-2.5 rounded-lg bg-red-900/20 border border-red-500/20 text-red-300 text-xs">⚠️ {error}</div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'graph' && (
          <div className="glass-card p-6">
            <div className="section-title mb-5">지식 그래프</div>
            <KnowledgeGraph nodes={graphNodes} edges={graphEdges} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="glass-card p-6">
            <div className="section-title mb-5">지식 보관소</div>
            <KnowledgeHistory />
          </div>
        )}
      </main>
    </div>
  );
}
