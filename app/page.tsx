'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import WizardTower from '@/components/agents/wizard-tower';
import KnowledgeGraph from '@/components/graph/knowledge-graph';
import ChatInterface, { Message } from '@/components/chat/chat-interface';
import KnowledgeHistory from '@/components/knowledge/knowledge-history';
import { AgentState } from '@/lib/agents/types';
import { Node, Edge } from 'reactflow';
import { Upload, Link, LayoutDashboard, Share2, Archive } from 'lucide-react';
import { ThinkingOrb } from '@/components/ThinkingOrb';

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

  const toTopic = (doc: KnowledgeDoc) => {
    const raw = (doc as any).metadata?.topic;
    if (raw && raw !== 'web') return raw;
    const fromTags = Array.isArray(doc.tags) ? doc.tags.find((t) => t && t !== 'web') : undefined;
    if (fromTags) return fromTags;
    const token = (doc.title || '').split(' ')[0];
    return token || 'topic';
  };

  // 지식 그래프 재구성
  const rebuildGraph = useCallback((docs: KnowledgeDoc[]) => {
    const nodes = docs.map((doc, idx) => ({
      id: doc.id,
      position: { x: (idx % 5) * 180 - 360, y: Math.floor(idx / 5) * 120 - 120 },
      data: {
        label: doc.title || 'Untitled',
        type: doc.type,
        metadata: {
          title: doc.title,
          entityType: toTopic(doc),
          topic: toTopic(doc),
          tags: doc.tags,
          createdAt: doc.createdAt,
          url: doc.url,
          content: doc.content,
        },
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
        const tagsA = (nodes[i].data?.metadata as any)?.tags || [];
        const tagsB = (nodes[j].data?.metadata as any)?.tags || [];
        const sharedTags = tagsA.filter((tag: string) => tagsB.includes(tag));
        const strength = sharedTags.length;
        if (strength >= 2) {
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

  // 멀티 에이전트 워크플로우 시뮬레이션
  const runAgentWorkflow = useCallback(async (message: string) => {
    const steps: Array<{
      agentId: string;
      task: string;
      spellLog: string;
      delay: number;
    }> = [];

    steps.push({
      agentId: 'cauldron',
      task: `사용자 메시지 분석: "${message.substring(0, 30)}..."`,
      spellLog: `사용자 입력을 분석하여 적합한 에이전트에 작업 분배`,
      delay: 800,
    });

    steps.push({
      agentId: 'desk',
      task: '지식 베이스에서 관련 문서 검색 중...',
      spellLog: '지식 베이스에서 관련 문서 검색 및 분석',
      delay: 1200,
    });

    steps.push({
      agentId: 'library',
      task: '의미 기반 검색 및 문서 매칭...',
      spellLog: '의미 기반 검색으로 가장 관련성 높은 문서 선별',
      delay: 1000,
    });

    steps.push({
      agentId: 'cauldron',
      task: '검색 결과 취합 및 LLM 응답 생성...',
      spellLog: '모든 에이전트의 결과를 취합하여 최종 응답 생성',
      delay: 1500,
    });

    steps.push({
      agentId: 'archive',
      task: '대화 컨텍스트 저장 중...',
      spellLog: '대화 기록을 지식 보관소에 저장',
      delay: 500,
    });

    return steps;
  }, []);

  // 지식 추가 중 로딩 상태
  const [isKnowledgeAdding, setIsKnowledgeAdding] = useState(false);

  const handleSendMessage = useCallback(async (text: string) => {
    setIsLoading(true);
    setError('');
    setCurrentTask('멀티 에이전트 워크플로우 시작...');
    setProgress(10);

    try {
      // 멀티 에이전트 워크플로우 실행
      const workflowSteps = await runAgentWorkflow(text);
      
      // 각 에이전트 순차 실행
      for (const step of workflowSteps) {
        setCurrentTask(step.task);
        
        // 에이전트 상태 업데이트
        setAgents(prev => prev.map(a =>
          a.id === step.agentId ? { ...a, status: 'working', currentTask: step.task } : a
        ));
        
        const agent = agents.find(a => a.id === step.agentId);
        addSpellLog(step.agentId, agent?.name || step.agentId, step.spellLog, 'success');
        
        await new Promise(r => setTimeout(r, step.delay));
        
        // 에이전트를 idle로 되돌리지 않음 (마법진 유지)
      }

      setProgress(50);

      // 실제 LLM API 호출
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, knowledgeDocs }),
      });

      if (!response.ok) {
        throw new Error('AI 응답을 가져오는데 실패했습니다');
      }

      const aiMsgId = `ai-${Date.now()}`;
      const data = await response.json();
      const replyContent = data.response;

      // LLM이 인용한 문서 제목 찾기 - [참조: 제목] 형식
      const citedTitles: string[] = [];
      const citeRegex = /\[참조:\s*([^\]]+)\]/g;
      let citeMatch;
      while ((citeMatch = citeRegex.exec(replyContent)) !== null) {
        citedTitles.push(citeMatch[1].trim());
      }

      // 인용된 문서들만 필터링, 인용이 없으면 모든 문서 반환
      const allDocs = data.documents || [];
      const matchedDocs = citedTitles.length > 0
        ? allDocs.filter((doc: any) => citedTitles.some(t => doc.title.includes(t) || t.includes(doc.title)))
        : allDocs;

      addMessage({
        id: aiMsgId,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date(),
        documents: matchedDocs.map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          tags: doc.tags || [],
          createdAt: doc.createdAt,
          url: doc.url,
        })),
      });

      addSpellLog('cauldron', '대마법사', '최종 응답 생성 완료', 'success');
      setProgress(100);
    } catch (err) {
      addSpellLog('cauldron', '대마법사', '워크플로우 중 오류 발생', 'warning');
      addMessage({
        id: `err-${Date.now()}`,
        role: 'system',
        content: `⚠️ 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`,
        timestamp: new Date(),
      });
    } finally {
      // 모든 에이전트를 idle로
      setAgents(prev => prev.map(a => ({ ...a, status: 'idle', currentTask: undefined })));
      setIsLoading(false);
      setProgress(0);
      setCurrentTask('');
    }
  }, [addMessage, knowledgeDocs, agents, addSpellLog, runAgentWorkflow]);

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
                    disabled={isKnowledgeAdding}
                  />
                  <button
                    onClick={async () => {
                      if (urlInputRef.current?.value.trim()) {
                        const url = urlInputRef.current.value.trim();
                        setIsKnowledgeAdding(true);
                        setCurrentTask('멀티 에이전트가 지식 분석 중...');
                        
                        // 1. 오케스트레이터가 작업 할당
                        addSpellLog('cauldron', '대마법사', '새 URL 지식 추가 작업을 에이전트에 분배', 'success');
                        setAgents(prev => prev.map(a =>
                          a.id === 'cauldron' ? { ...a, status: 'working', currentTask: '작업 분배 중...' } : a
                        ));
                        await new Promise(r => setTimeout(r, 500));

                        // 2. 현자가 웹 문서 분석
                        setAgents(prev => prev.map(a =>
                          a.id === 'desk' ? { ...a, status: 'working', currentTask: '웹 문서 분석 중...' } : a
                        ));
                        addSpellLog('desk', '현자', '웹 페이지에서 콘텐츠 추출 및 분석 시작', 'success');
                        await new Promise(r => setTimeout(r, 800));

                        // 3. 서고관리자가 의미 분석
                        setAgents(prev => prev.map(a =>
                          a.id === 'library' ? { ...a, status: 'working', currentTask: '의미 분석 및 태그 생성...' } : a
                        ));
                        addSpellLog('library', '서고관리자', '추출된 콘텐츠의 의미 분석 및 키워드 추출', 'success');
                        await new Promise(r => setTimeout(r, 600));

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
                            
                            // 4. 기록가가 저장
                            setAgents(prev => prev.map(a =>
                              a.id === 'archive' ? { ...a, status: 'working', currentTask: '지식 저장 중...' } : a
                            ));
                            addSpellLog('archive', '기록가', `새로운 지식 저장 완료: ${data.document?.title || url}`, 'success');
                            await new Promise(r => setTimeout(r, 400));

                            addMessage({
                              id: `system-${Date.now()}`,
                              role: 'system',
                              content: `지식이 저장되었습니다: ${data.document?.title || url}`,
                              timestamp: new Date(),
                            });
                            
                            // 저장 후 그래프 갱신을 위해 knowledgeDocs를 다시 로드
                            const res = await fetch('/api/knowledge');
                            const json = await res.json();
                            const docs = (json.documents || []) as KnowledgeDoc[];
                            setKnowledgeDocs(docs);
                            
                            addSpellLog('cauldron', '대마법사', '지식 추가 워크플로우 완료', 'success');
                          }
                        } catch (error) {
                          addSpellLog('desk', '현자', '지식 추출 중 오류가 발생했습니다.', 'warning');
                          addMessage({
                            id: `err-${Date.now()}`,
                            role: 'system',
                            content: `⚠️ 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
                            timestamp: new Date(),
                          });
                        } finally {
                          setIsKnowledgeAdding(false);
                          setCurrentTask('');
                          setAgents(prev => prev.map(a => ({ ...a, status: 'idle', currentTask: undefined })));
                          if (urlInputRef.current) urlInputRef.current.value = '';
                        }
                      }
                    }}
                    disabled={isKnowledgeAdding}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <span>추가하기</span>
                  </button>
                </div>
                {isKnowledgeAdding && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-purple-300 text-xs">
                    <ThinkingOrb state="working" size={20} theme="dark" />
                    <span>진행중...</span>
                  </div>
                )}
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
                  setShowFullGraphContent(true);
                }}
              />

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
                      {(() => {
                        const raw = (selectedGraphNode.data?.metadata as any)?.content;
                        if (typeof raw === 'string') {
                          return (
                            <>
                              <div className="text-[10px] text-gray-400 mb-1">본문</div>
                              <div className="whitespace-pre-wrap text-gray-300">{raw}</div>
                            </>
                          );
                        }
                        return ((selectedGraphNode.data?.metadata as { title?: string })?.title) || '지식';
                      })()}
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