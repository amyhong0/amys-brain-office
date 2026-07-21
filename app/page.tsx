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
  { id: 'cauldron',  name: '대마법사',  role: 'Central Control',   emoji: '🧙‍♂️', status: 'idle', position: { x: 50, y: 10 }, floor: 5 },
  { id: 'desk',      name: '현자',       role: 'Knowledge Analysis', emoji: '🔮',  status: 'idle', position: { x: 50, y: 20 }, floor: 4 },
  { id: 'library',   name: '서고관리자',      role: 'Data Discovery',    emoji: '⚗️',  status: 'idle', position: { x: 50, y: 30 }, floor: 3 },
  { id: 'debug',     name: '정령사',      role: 'Bug Hunter',        emoji: '🦹',  status: 'idle', position: { x: 50, y: 80 }, floor: 0 },
  { id: 'archive',   name: '기록가',     role: 'Data Storage',      emoji: '📚',  status: 'idle', position: { x: 50, y: 90 }, floor: 1 },
];

interface SpellLog {
  id: number;
  time: string;
  spell: string;
  type: 'success' | 'warning';
  zoneId: string;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function generateResponse(message: string): string {
  const msg = message.toLowerCase();
  const wantsSummary = /(요약|정리|모아|이번주|최근|요즘)/.test(message);
  const wantsNVIDIA = /(nvidia|엔비디아|rtx|gpu|블랙웰|blackwell|cuda|그래픽)/i.test(message);
  const wantsAI = /(ai|인공지능|딥러닝|머신러닝|신경망|neural)/i.test(message);

  if (wantsSummary) {
    if (wantsNVIDIA) {
      return `🔍 NVIDIA 관련 지식을 정리해드립니다!

📄 **관련 지식**

1. **[NVIDIA AI GPU 아키텍처 분석](/knowledge/nvidia)** (2026-07-20)
   - Blackwell GPU, CUDA 최적화
   - 태그: #NVIDIA #GPU #AI

2. **[NVIDIA 관련 기술 문서](/knowledge/nvidia-related)** (2026-07-19)
   - 그래픽 처리 및 AI 가속
   - 태그: #HW #딥러닝

💡 제목을 클릭하여 전체 내용을 확인하세요!`;
    }
    if (wantsAI) {
      return `🔍 AI 관련 지식을 정리해드립니다!

📄 **관련 지식**

1. **[NVIDIA AI GPU 아키텍처 분석](/knowledge/nvidia)** (2026-07-20)
   - Blackwell GPU 구조 분석
   - 태그: #AI #GPU #NVIDIA

2. **[MCP 프로토콜 기술 문서](/knowledge/mcp)** (2026-07-19)
   - AI 에이전트 연결 표준
   - 태그: #MCP #AI

💡 제목을 클릭하여 전체 내용을 확인하세요!`;
    }
    return `🔍 요청하신 지식을 정리해드립니다!

관련 문서를 찾았습니다. 구체적인 주제를 알려주시면 더 자세히 찾아드릴게요.`;
  }
  
  if (wantsNVIDIA) {
    return `🖥️ [NVIDIA AI GPU 아키텍처 분석](/knowledge/nvidia) 관련 내용입니다:

**Blackwell GPU**: 성능 2.5x 향상
**CUDA**: 병렬 컴퓨팅 최적화

자세한 내용은 제목을 클릭해주세요!`;
  }
  
  if (wantsAI) {
    return `🤖 [AI 시스템 설계 가이드](/knowledge/ai) 관련 내용입니다:

**멀티 에이전트**: Orchestrator Pattern
**RAG**: 검색 증강 생성

자세한 내용은 제목을 클릭해주세요!`;
  }
  
  if (/(mcp|프로토콜)/i.test(message)) {
    return `🔌 MCP(Model Context Protocol) 관련 내용:

**MCP 프로토콜 개요**
- AI 에이전트와 외부 도구 연결 표준
- JSON-RPC 기반 통신

현재 이 시스템도 MCP를 활용 중입니다!`;
  }
  
  if (/(추가|저장|올려|업로드)/.test(message)) {
    return `✅ 문서 추가 요청입니다!

파일 업로드 또는 웹 링크 입력으로 지식을 추가할 수 있어요.`;
  }
  
  if (/(안녕|hello|hi)/i.test(message)) {
    return `안녕하세요! 🧙‍♂️

저는 당신의 지식 관리를 도와드리는 AI 에이전트입니다.`;
  }

  return `🧙‍♂️ "${message}"에 대해 검색 중입니다...

무엇이든 도와드릴 수 있도록 말씀해주세요!`;
}

const WELCOME_MSG: Message = {
  id: 'welcome',
  role: 'system',
  content: '안녕하세요! Amy\'s Brain Office에 오신 것을 환영합니다. 🧙‍♂️\n저장된 지식을 검색하거나 문서를 추가해보세요!',
  timestamp: new Date('2024-01-01T00:00:00'),
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [agents, setAgents] = useState<AgentState[]>(BASE_AGENTS);
  const [graphNodes, setGraphNodes] = useState<Node[]>([]);
  const [graphEdges, setGraphEdges] = useState<Edge[]>([]);
  const [selectedGraphNode, setSelectedGraphNode] = useState<Node | null>(null);
  const [showFullGraphContent, setShowFullGraphContent] = useState(false);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [error, setError] = useState('');
  const [spellLogs, setSpellLogs] = useState<SpellLog[]>([]);
  const spellLogIdRef = useRef(0);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Load saved spell logs from localStorage
  useEffect(() => {
    const savedLogs = localStorage.getItem('spellLogs');
    if (savedLogs) {
      try {
        setSpellLogs(JSON.parse(savedLogs));
      } catch (e) {}
    }
    const savedLogId = localStorage.getItem('spellLogId');
    if (savedLogId) {
      try {
        spellLogIdRef.current = parseInt(savedLogId, 10);
      } catch (e) {}
    }
  }, []);

  // Save spell logs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('spellLogs', JSON.stringify(spellLogs));
    localStorage.setItem('spellLogId', spellLogIdRef.current.toString());
  }, [spellLogs]);

  type KnowledgeDoc = {
    id: string;
    title: string;
    type: 'pdf' | 'web' | 'image';
    tags: string[];
    createdAt: string;
    summary?: string;
    content?: string;
    url?: string;
  };

  // 지식 그래프 재구성
  const rebuildGraph = useCallback((docs: KnowledgeDoc[]) => {
    const nodes = docs.map((doc, idx) => ({
      id: doc.id,
      position: { x: (idx % 5) * 180 - 360, y: Math.floor(idx / 5) * 120 - 120 },
      data: {
        label: doc.title || 'Untitled',
        type: doc.type,
        metadata: { title: doc.title, type: doc.type, tags: doc.tags, createdAt: doc.createdAt, url: doc.url },
      },
      style: {
        width: 10,
        height: 10,
        background: doc.type === 'pdf' ? 'radial-gradient(circle, #60a5fadd, #60a5fa99)' :
                    doc.type === 'image' ? 'radial-gradient(circle, #fbbf24dd, #fbbf2499)' :
                    'radial-gradient(circle, #34d399dd, #34d39999)',
        border: 'none',
        borderRadius: '50%',
        boxShadow: doc.type === 'pdf' ? '0 0 10px #60a5fa88' :
                   doc.type === 'image' ? '0 0 10px #fbbf2488' :
                   '0 0 10px #34d39988',
      },
    }));
    const edges: Edge[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const tagsA = nodes[i].data?.metadata?.tags || [];
        const tagsB = nodes[j].data?.metadata?.tags || [];
        const sharedTags = tagsA.filter(tag => tagsB.includes(tag));
        const typeMatch = nodes[i].data?.metadata?.type === nodes[j].data?.metadata?.type ? 1 : 0;
        const strength = sharedTags.length + typeMatch;
        if (strength > 0) {
          edges.push({
            id: `edge-${i}-${j}`,
            source: nodes[i].id,
            target: nodes[j].id,
            data: { strength },
            style: { stroke: `rgba(139, 92, 246, ${0.3 + strength * 0.1})`, strokeWidth: 0.5 + strength * 0.2 },
            type: 'straight',
          });
        }
      }
    }
    setGraphNodes(nodes);
    setGraphEdges(edges);
  }, [setGraphNodes, setGraphEdges]);

  // knowledgeDocs가 변경되면 그래프 재구성
  useEffect(() => {
    if (knowledgeDocs.length > 0) {
      rebuildGraph(knowledgeDocs);
    }
  }, [knowledgeDocs, rebuildGraph]);

  // 초기 로드: API에서 지식 불러오기
  useEffect(() => {
    fetch('/api/knowledge')
      .then(res => res.json())
      .then(data => {
        const docs = (data.documents || []) as KnowledgeDoc[];
        setKnowledgeDocs(docs);
      })
      .catch(console.error);
  }, []);

  const addMessage = useCallback((msg: Message) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const addSpellLog = useCallback((zoneId: string, agentName: string, spell: string, type: 'success' | 'warning') => {
    spellLogIdRef.current += 1;
    setSpellLogs(prev => [...prev.slice(-49), {
      id: spellLogIdRef.current,
      time: formatTime(new Date()),
      spell: `[${agentName}] ${spell}`,
      type,
      zoneId,
    }]);
  }, []);

  const simulate = async (steps: [string, number, string?, string?][]) => {
    for (const [task, pct, agentId, spellLog] of steps) {
      setCurrentTask(task);
      setProgress(pct);
      if (agentId && spellLog) {
        const agent = agents.find(a => a.id === agentId);
        const agentName = agent?.name || agentId;
        setAgents(prev => prev.map(a =>
          a.id === agentId ? { ...a, status: 'working', currentTask: task } : a
        ));
        addSpellLog(agentId, agentName, spellLog, 'success');
      }
      await new Promise(r => setTimeout(r, 600));
    }
  };

  const handleSendMessage = useCallback(async (text: string) => {
    setIsLoading(true);
    setError('');
    try {
      await simulate([
        ['🧙‍♂️ 마법사들에게 지시 중...', 15, 'cauldron', '마법사들에게 지시 중...'],
        ['🔮 지식 문서 검색 중...', 30, 'desk', '지식 데이터베이스 검색 중...'],
        ['🔎 관련 문서 분석 중...', 55, 'library', '관련 문서 발견! 분석 시작...'],
        ['📖 LLM이 답변 생성 중...', 80, 'desk', '답변 생성 중...'],
        ['✨ 마법 완성 중...', 95, 'cauldron', '주문 완성!'],
      ]);

      // 1. 지식 문서 로드
      const res = await fetch('/api/knowledge');
      const json = await res.json();
      const docs = (json.documents || []) as KnowledgeDoc[];
      
      // 3. 서버 API로 LLM 답변 요청 (SSE 스트리밍)
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          knowledgeDocs: docs,
        }),
      });

      if (!chatRes.ok) {
        throw new Error('Chat API error');
      }

      const aiMsgId = `ai-${Date.now()}`;
      
      // 빈 assistant 메시지 먼저 추가
      addMessage({
        id: aiMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      });

      // SSE 스트리밍 읽기
      const reader = chatRes.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let buffer = '';
        let fullReply = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.content || '';
                if (content) {
                  fullReply += content;
                  // messages 상태 직접 업데이트
                  setMessages(prev => {
                    const newMsgs = [...prev];
                    const idx = newMsgs.findIndex(m => m.id === aiMsgId);
                    if (idx >= 0) {
                      newMsgs[idx] = { ...newMsgs[idx], content: fullReply };
                    }
                    return newMsgs;
                  });
                }
              } catch (e) {}
            }
          }
        }

        // 최종 메시지가 비어있으면 fallback
        if (!fullReply) {
          setMessages(prev => {
            const newMsgs = [...prev];
            const idx = newMsgs.findIndex(m => m.id === aiMsgId);
            if (idx >= 0) {
              newMsgs[idx] = { ...newMsgs[idx], content: generateResponse(text) };
            }
            return newMsgs;
          });
        }
      }
    } catch (err) {
      // LLM 실패 시 기존 fallback
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
  }, [addMessage, addSpellLog, agents, knowledgeDocs]);

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
                <WizardTower agents={agents} spellLogs={spellLogs} />
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
              <div className="glass-card p-5">
                <div className="section-title mb-3">지식 추가</div>
                <div className="flex gap-2">
                  <input
                    ref={urlInputRef}
                    type="text"
                    placeholder="URL을 입력하세요 (예: https://example.com)"
                    className="flex-1 px-3 py-2 bg-white/5 border border-purple-500/30 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
                  />
                  <button
                    onClick={async () => {
                      if (urlInputRef.current?.value.trim()) {
                        const url = urlInputRef.current.value.trim();
                        setAgents(prev => prev.map(a =>
                          a.id === 'archive' ? { ...a, status: 'working', currentTask: '지식 영속화 중...' } : a
                        ));
                        addSpellLog('archive', '기록가', '지식 영속화 준비 중...', 'success');
                        
                        try {
                          const response = await fetch('/api/knowledge', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              title: '',
                              type: 'web',
                              url: url,
                            }),
                          });
                          if (response.ok) {
                            const data = await response.json();
                            addMessage({
                              id: `system-${Date.now()}`,
                              role: 'system',
                              content: `지식이 저장되었습니다: ${data.document?.title || url}`,
                              timestamp: new Date(),
                            });
                            addSpellLog('archive', '기록가', '지식 영속화 완료!', 'success');
                            
                            // 저장 후 그래프 갱신을 위해 knowledgeDocs를 다시 로드
                            const res = await fetch('/api/knowledge');
                            const json = await res.json();
                            const docs = (json.documents || []) as KnowledgeDoc[];
                            setKnowledgeDocs(docs);
                          } else {
                            addSpellLog('archive', '기록가', '주문 실패! 다시 시도해라', 'warning');
                          }
                        } catch (error) {
                          addSpellLog('archive', '기록가', '마법진 오류! 주문이 깨졌다', 'warning');
                        } finally {
                          setAgents(prev => prev.map(a =>
                            a.id === 'archive' ? { ...a, status: 'idle', currentTask: '' } : a
                          ));
                          if (urlInputRef.current) urlInputRef.current.value = '';
                        }
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-all font-medium"
                  >
                    추가하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'graph' && (
          <div className="glass-card p-6">
            <div className="section-title mb-5">지식 그래프</div>
            <div className="relative">
              <KnowledgeGraph 
                nodes={graphNodes} 
                edges={graphEdges} 
                onNodeClick={(node) => {
                  setSelectedGraphNode(node);
                  setShowFullGraphContent(false);
                }}
              />
              
              {selectedGraphNode && !showFullGraphContent && (
                <div className="absolute bottom-4 left-4 z-10">
                  <div 
                    className="px-4 py-2 rounded-lg bg-purple-900/60 border border-purple-500/50 cursor-pointer hover:bg-purple-800/70 transition-all backdrop-blur-sm"
                    onClick={() => setShowFullGraphContent(true)}
                  >
                    <span className="text-white text-sm font-medium">
                      {((selectedGraphNode.data?.metadata as { title?: string })?.title) || (selectedGraphNode.data?.label as string) || 'Untitled'}
                    </span>
                    <span className="text-purple-300 text-xs ml-2">(클릭하여 전체 내용 보기)</span>
                  </div>
                </div>
              )}
              
              {selectedGraphNode && showFullGraphContent && (
                <div 
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                  onClick={() => {
                    setShowFullGraphContent(false);
                    setSelectedGraphNode(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowFullGraphContent(false);
                      setSelectedGraphNode(null);
                    }
                  }}
                >
                  <div className="max-w-md w-full max-h-[80vh] overflow-y-auto rounded-xl p-5" style={{
                    background: 'linear-gradient(135deg, rgba(30, 15, 50, 0.95), rgba(20, 10, 40, 0.95))',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                  }} onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-600/30 flex items-center justify-center text-lg">📄</div>
                      <div>
                        <h3 className="text-white font-bold">{((selectedGraphNode.data?.metadata as { title?: string })?.title) || (selectedGraphNode.data?.label as string) || 'Untitled'}</h3>
                        <span className="text-[10px] text-purple-300">{((selectedGraphNode.data?.metadata as { type?: string })?.type) || '문서'}</span>
                      </div>
                    </div>
                    
                    {(() => {
                      const tags = (selectedGraphNode.data?.metadata as { tags?: string[] })?.tags;
                      return tags && tags.length > 0 && (
                        <div className="mb-3">
                          <span className="text-[10px] text-gray-400 mb-1 block">태그:</span>
                          <div className="flex flex-wrap gap-1">
                            {tags.map((tag, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-purple-500/30 text-purple-200">#{tag}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                    
                    {(selectedGraphNode.data?.metadata as { createdAt?: string })?.createdAt && (
                      <div className="text-[10px] text-gray-400 mb-2">생성일: {(selectedGraphNode.data?.metadata as { createdAt?: string }).createdAt}</div>
                    )}
                    
                    {(selectedGraphNode.data?.metadata as { url?: string })?.url && (
                      <div className="text-[10px] text-blue-400 mb-2 break-all">
                        <a href={(selectedGraphNode.data?.metadata as { url?: string }).url} target="_blank" rel="noopener noreferrer">🔗 {(selectedGraphNode.data?.metadata as { url?: string }).url}</a>
                      </div>
                    )}
                    
                    <div className="text-[11px] text-gray-300 mt-2 pt-2 border-t border-white/10 whitespace-pre-wrap">
                      {((selectedGraphNode.data?.metadata as { title?: string })?.title) || '지식'}에 대한 상세 내용입니다.
                    </div>
                    
                    <button onClick={() => {
                      setShowFullGraphContent(false);
                      setSelectedGraphNode(null);
                    }} className="mt-4 px-4 py-1.5 rounded-lg bg-purple-600/30 text-white text-[11px] hover:bg-purple-600/50">
                      닫기
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'history' && (
          <div className="glass-card p-6">
            <div className="section-title mb-5">지식 보관소</div>
            <KnowledgeHistory
              documents={knowledgeDocs}
              onChange={(docs) => {
                setKnowledgeDocs(docs);
                rebuildGraph(docs);
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}