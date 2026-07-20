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

// 지식 데이터베이스 (클릭 가능한 형태로 저장)
function getKnowledgeDatabase() {
  return {
    nvidia: {
      title: 'NVIDIA AI GPU 아키텍처 분석',
      content: `**Blackwell GPU 아키텍처**\n\n• 성능: 이전 세대 대비 2.5x 향상\n• 메모리: HBM3E 사용, 대용량 데이터 처리\n• 연결: NVLink 4.0 인터커넥트 지원\n• 최적화: AI 추론 전용 Tensor Core\n\n**CUDA 플랫폼**\n\n• 병렬 컴퓨팅 프레임워크\n• PyTorch, TensorFlow와 통합\n• GPU 메모리 관리 최적화\n\n관련 태그: #NVIDIA #GPU #딥러닝`,
    },
    mcp: {
      title: 'MCP 프로토콜 기술 문서',
      content: `**Model Context Protocol**\n\n• AI 에이전트와 외부 도구 연결 표준\n• JSON-RPC 2.0 기반 통신\n• 세 가지 프리미티브: 도구, 리소스, 프롬프트\n\n**적용 사례**\n\n• 파일 시스템 접근\n• 웹 검색 엔진 연동\n• 데이터베이스 쿼리\n\n관련 태그: #MCP #프로토콜 #AI`,
    },
    ai: {
      title: 'AI 시스템 설계 가이드',
      content: `**멀티 에이전트 시스템**\n\n• Orchestrator Pattern\n• Task Distribution 전략\n• Memory Retrieval 메커니즘\n\n**최신 동향**\n\n• 대규모 언어 모델 최적화\n• RAG(Retrieval-Augmented Generation)\n• AI 안전성 및 윤리\n\n관련 태그: #AI #머신러닝 #딥러닝`,
    },
  };
}

// LLM 기반 의미 이해 응답 생성
function generateResponse(message: string): string {
  const msg = message.toLowerCase();

  // 시간/요약 관련 표현 감지
  const wantsSummary = /(요약|정리|모아|이번주|최근|요즘)/.test(message);
  
  // NVIDIA/엔비디아 관련 표현 감지
  const wantsNVIDIA = /(nvidia|엔비디아|rtx|gpu|블랙웰|blackwell|cuda|그래픽)/i.test(message);
  
  // AI/인공지능 관련 표현 감지
  const wantsAI = /(ai|인공지능|딥러닝|머신러닝|신경망|neural|딥러닝)/i.test(message);

// 종합 의도 분석: 시간+주제 요청
  if (wantsSummary) {
    if (wantsNVIDIA) {
      return `🔍 NVIDIA 관련 지식을 정리해드립니다!\n\n📄 **관련 지식**\n\n1. **[NVIDIA AI GPU 아키텍처 분석](/knowledge/nvidia)** (2026-07-20)\n   - Blackwell GPU, CUDA 최적화\n   - 태그: #NVIDIA #GPU #AI\n\n2. **[NVIDIA 관련 기술 문서](/knowledge/nvidia-related)** (2026-07-19)\n   - 그래픽 처리 및 AI 가속\n   - 태그: #HW #딥러닝\n\n💡 제목을 클릭하여 전체 내용을 확인하세요!`;
    }
    if (wantsAI) {
      return `🔍 AI 관련 지식을 정리해드립니다!\n\n📄 **관련 지식**\n\n1. **[NVIDIA AI GPU 아키텍처 분석](/knowledge/nvidia)** (2026-07-20)\n   - Blackwell GPU 구조 분석\n   - 태그: #AI #GPU #NVIDIA\n\n2. **[MCP 프로토콜 기술 문서](/knowledge/mcp)** (2026-07-19)\n   - AI 에이전트 연결 표준\n   - 태그: #MCP #AI\n\n💡 제목을 클릭하여 전체 내용을 확인하세요!`;
    }
    return `🔍 요청하신 지식을 정리해드립니다!\n\n관련 문서를 찾았습니다. 구체적인 주제를 알려주시면 더 자세히 찾아드릴게요.`;
  }
  
  // 단순 주제 요청 - 클릭 가능한 형태로 제공
  if (wantsNVIDIA) {
    return `🖥️ [NVIDIA AI GPU 아키텍처 분석](/knowledge/nvidia) 관련 내용입니다:\n\n**Blackwell GPU**: 성능 2.5x 향상\n**CUDA**: 병렬 컴퓨팅 최적화\n\n자세한 내용은 제목을 클릭해주세요!`;
  }
  
  if (wantsAI) {
    return `🤖 [AI 시스템 설계 가이드](/knowledge/ai) 관련 내용입니다:\n\n**멀티 에이전트**: Orchestrator Pattern\n**RAG**: 검색 증강 생성\n\n자세한 내용은 제목을 클릭해주세요!`;
  }
  
  // MCP
  if (/(mcp|프로토콜)/i.test(message)) {
    return `🔌 MCP(Model Context Protocol) 관련 내용:\n\n**MCP 프로토콜 개요**\n- AI 에이전트와 외부 도구 연결 표준\n- JSON-RPC 기반 통신\n\n현재 이 시스템도 MCP를 활용 중입니다!`;
  }
  
  // 문서 추가
  if (/(추가|저장|올려|업로드)/.test(message)) {
    return `✅ 문서 추가 요청입니다!\n\n파일 업로드 또는 웹 링크 입력으로 지식을 추가할 수 있어요.`;
  }
  
  // 인사
  if (/(안녕|hello|hi)/i.test(message)) {
    return `안녕하세요! 🧙‍♂️\n\n저는 당신의 지식 관리를 도와드리는 AI 에이전트입니다.`;
  }

  return `🧙‍♂️ "${message}"에 대해 검색 중입니다...\n\n무엇이든 도와드릴 수 있도록 말씀해주세요!`;
}

const WELCOME_MSG: Message = {
  id: 'welcome',
  role: 'system',
  content: '안녕하세요! Amy의 Brain Office에 오신 것을 환영합니다. 🧙‍♂️\n저장된 지식을 검색하거나 문서를 추가해보세요!',
  timestamp: new Date('2024-01-01T00:00:00'),
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
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
    setGraphNodes([
      { id: 'node-1', position: { x: 0, y: 0 }, data: { type: 'pdf', label: 'NVIDIA GPU', metadata: { title: 'NVIDIA AI GPU 아키텍처 분석', type: 'pdf', tags: ['AI', 'GPU', 'NVIDIA'], createdAt: '2026-07-20' } } },
      { id: 'node-2', position: { x: 120, y: -80 }, data: { type: 'pdf', label: 'MCP Protocol', metadata: { title: 'MCP 프로토콜 기술 문서', type: 'pdf', tags: ['MCP', '프로토콜', 'AI'], createdAt: '2026-07-19' } } },
      { id: 'node-3', position: { x: -120, y: 80 }, data: { type: 'web', label: 'Multi-Agent', metadata: { title: '멀티 에이전트 시스템 설계', type: 'web', tags: ['AI', '에이전트', '아키텍처'], createdAt: '2026-07-17', url: 'https://example.com/multi-agent' } } },
      { id: 'node-4', position: { x: 200, y: 100 }, data: { type: 'image', label: 'Architecture', metadata: { title: '시스템 아키텍처 다이어그램', type: 'image', tags: ['아키텍처', '설계'], createdAt: '2026-07-15' } } },
      { id: 'node-5', position: { x: -200, y: -60 }, data: { type: 'web', label: 'Python Guide', metadata: { title: 'Python 비동기 프로그래밍 가이드', type: 'web', tags: ['Python', '비동기'], createdAt: '2026-07-14', url: 'https://example.com/python' } } },
      { id: 'node-6', position: { x: 50, y: -180 }, data: { type: 'pdf', label: 'React Patterns', metadata: { title: 'React 고급 패턴 모음', type: 'pdf', tags: ['React', 'Frontend'], createdAt: '2026-07-12' } } },
    ]);
    setGraphEdges([
      { id: 'edge-1', source: 'node-1', target: 'node-2', data: { strength: 2 } },
      { id: 'edge-2', source: 'node-1', target: 'node-3', data: { strength: 1 } },
      { id: 'edge-3', source: 'node-2', target: 'node-3', data: { strength: 1 } },
      { id: 'edge-4', source: 'node-3', target: 'node-4', data: { strength: 1 } },
    ]);
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
      await simulate([
        ['🧙‍♂️ 가마솥에서 요청을 분석하는 중...', 20, 'cauldron'],
        ['🔮 책상에서 지식을 분석하는 중...', 50, 'desk'],
        ['🔎 도서관에서 검색 주문을 외우는 중...', 75, 'library'],
        ['✅ 결과를 정리하고 있어요', 90, 'cauldron'],
      ]);
      addMessage({
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: generateResponse(text),
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
      setCurrentTask('');
      setAgents(BASE_AGENTS);
    }
  }, [addMessage]);

  return (
    <div className="magic-bg min-h-screen">
      <header className="header-glass sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-violet-800 flex items-center justify-center text-base">
                🧙‍♂️
              </div>
              <div>
                <h1 className="font-cinzel text-base font-bold text-white">Amy's Brain Office</h1>
                <p className="text-[10px] text-purple-400">Personal Knowledge System</p>
              </div>
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

      <main className="max-w-screen-xl mx-auto px-6 py-6">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-5">
              <div className="section-title mb-3">작업 현황</div>
              <div className="glow-purple rounded-xl overflow-hidden">
                <WizardTower agents={agents} />
              </div>
            </div>
            <div className="col-span-7 flex flex-col gap-5">
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