'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface KnowledgeDoc {
  id: string;
  title: string;
  type: 'pdf' | 'web' | 'image';
  tags: string[];
  createdAt: string; // ISO 문자열로 변경
  summary?: string;
  content?: string;
}

interface KnowledgeHistoryProps {
  documents?: KnowledgeDoc[];
}

const TYPE_CONFIG = {
  pdf: { icon: '📄', color: 'bg-blue-500/20 border-blue-500/40 text-blue-300', label: 'PDF' },
  web: { icon: '🌐', color: 'bg-green-500/20 border-green-500/40 text-green-300', label: '웹' },
  image: { icon: '🖼️', color: 'bg-orange-500/20 border-orange-500/40 text-orange-300', label: '이미지' },
};

// 데모용 샘플 데이터 (클라이언트에서만 날짜 처리)
const SAMPLE_DOCS_RAW: Omit<KnowledgeDoc, 'createdAt'> & { date: string }[] = [
  { id: '1', title: 'NVIDIA AI GPU 아키텍처', type: 'web', tags: ['AI', 'GPU', 'NVIDIA'], date: '2026-07-20', summary: 'Blackwell GPU 아키텍처 분석', content: `## NVIDIA AI GPU 아키텍처 분석

### 개요
NVIDIA Blackwell GPU는 AI 작업을 위한 차세대 아키텍처입니다.

### 주요 특징
- 성능 2.5배 향상
- NVLink 4.0 인터커넥트 지원
- AI 추론 최적화

### 적용 사례
딥러닝 모델 훈련 및 추론에 활용됩니다.` },
  { id: '2', title: 'MCP 프로토콜 기술 문서', type: 'pdf', tags: ['MCP', '프로토콜', 'AI'], date: '2026-07-19', summary: 'Model Context Protocol 공식 문서', content: `## Model Context Protocol

### 프로토콜 개요
AI 에이전트와 외부 도구 연결 표준 프로토콜입니다.` },
  { id: '3', title: 'Next.js 14 App Router 가이드', type: 'web', tags: ['Next.js', '프론트엔드'], date: '2026-07-18', summary: 'App Router 마이그레이션 가이드' },
  { id: '4', title: '멀티 에이전트 시스템 설계', type: 'pdf', tags: ['AI', '에이전트', '아키텍처'], date: '2026-07-17', summary: '다중 AI 에이전트 오케스트레이션 패턴' },
  { id: '5', title: 'React Flow 3D 시각화', type: 'web', tags: ['React', '시각화', '그래프'], date: '2026-07-16', summary: '지식 그래프 3D 렌더링 기법' },
];

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export default function KnowledgeHistory({ documents }: KnowledgeHistoryProps) {
  // 클라이언트에서만 상태 초기화
  const [activeTab, setActiveTab] = useState<'date' | 'topic'>('date');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDoc | null>(null);
  
  // 서버에서 받은 documents 또는 기본 데이터 사용
  const docs = useMemo(() => {
    if (documents) return documents;
    // 기본 데이터는 클라이언트에서만 생성
    return SAMPLE_DOCS_RAW.map(d => ({
      ...d,
      createdAt: d.date
    }));
  }, [documents]);

  // 모든 태그 수집
  const allTags = useMemo(() => {
    const tagMap = new Map<string, number>();
    docs.forEach(doc => doc.tags.forEach(tag => tagMap.set(tag, (tagMap.get(tag) || 0) + 1)));
    return Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]);
  }, [docs]);

  // 날짜별 그룹핑
  const byDate = useMemo(() => {
    const grouped = new Map<string, KnowledgeDoc[]>();
    const sorted = [...docs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    sorted.forEach(doc => {
      const key = formatDate(doc.createdAt);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(doc);
    });
    return grouped;
  }, [docs]);

  // 주제별 필터링
  const byTopic = useMemo(() => {
    return selectedTag
      ? docs.filter(doc => doc.tags.includes(selectedTag))
      : docs;
  }, [docs, selectedTag]);

  return (
    <>
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-purple-500/20 overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <span className="text-lg">🗄️</span>
            <span className="text-white font-bold text-sm">지식 보관소</span>
            <span className="bg-purple-500/30 text-purple-200 text-xs px-2 py-0.5 rounded-full">{docs.length}개</span>
          </div>
          {/* 탭 */}
          <div className="flex bg-white/10 rounded-lg p-0.5 gap-0.5">
            {(['date', 'topic'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-xs rounded-md transition-all font-medium ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'date' ? '📅 날짜별' : '🏷️ 주제별'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 max-h-64 overflow-y-auto custom-scrollbar">
          {/* 날짜별 뷰 */}
          {activeTab === 'date' && (
            <div className="space-y-3">
              {Array.from(byDate.entries()).map(([dateLabel, items]) => (
                <div key={dateLabel}>
                  <div className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <div className="h-px bg-gray-700 flex-1" />
                    <span>{dateLabel}</span>
                    <div className="h-px bg-gray-700 flex-1" />
                  </div>
                  <div className="space-y-1">
                    {items.map(doc => (
                      <DocItem key={doc.id} doc={doc} onSelect={() => setSelectedDoc(doc)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 주제별 뷰 */}
          {activeTab === 'topic' && (
            <div>
              {/* 태그 필터 */}
              <div className="flex flex-wrap gap-1 mb-3">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-2 py-0.5 rounded-full text-[10px] transition-all border ${
                    !selectedTag ? 'bg-purple-600 border-purple-500 text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'
                  }`}
                >
                  전체
                </button>
                {allTags.map(([tag, count]) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-2 py-0.5 rounded-full text-[10px] transition-all border ${
                      selectedTag === tag ? 'bg-purple-600 border-purple-500 text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {tag} <span className="opacity-60">{count}</span>
                  </button>
                ))}
              </div>
              <div className="space-y-1">
                {byTopic.map(doc => (
                  <DocItem key={doc.id} doc={doc} onSelect={() => setSelectedDoc(doc)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 전체 내용 모달 */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDoc(null)}>
          <div className="bg-slate-900 rounded-xl border border-purple-500/30 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedDoc.title}</h2>
                  <div className="text-gray-400 text-sm mt-1">{formatDate(selectedDoc.createdAt)} • {TYPE_CONFIG[selectedDoc.type].label}</div>
                </div>
                <button onClick={() => setSelectedDoc(null)} className="text-gray-500 hover:text-gray-300 text-xl">✕</button>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {selectedDoc.tags.map(tag => (
                  <span key={tag} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="text-gray-300 whitespace-pre-wrap font-sans text-sm leading-relaxed bg-white/5 p-4 rounded-lg overflow-x-auto">
                  {selectedDoc.content || selectedDoc.summary || '내용 없음'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DocItem({ doc, onSelect }: {
  doc: KnowledgeDoc;
  onSelect: () => void;
}) {
  const typeConf = TYPE_CONFIG[doc.type];

  return (
    <div
      className={`rounded-lg border transition-all cursor-pointer ${typeConf.color} hover:brightness-125 hover:bg-white/10`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 px-2 py-1.5">
        <span className="text-sm">{typeConf.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-white text-xs font-medium truncate">{doc.title}</div>
          <div className="flex gap-1 mt-0.5 flex-wrap">
            {doc.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[9px] bg-white/10 rounded px-1 text-gray-300">{tag}</span>
            ))}
          </div>
        </div>
        <span className="text-gray-500 text-[9px] whitespace-nowrap">{formatDate(doc.createdAt)}</span>
        <span className="text-purple-400 text-xs">👁️</span>
      </div>
    </div>
  );
}