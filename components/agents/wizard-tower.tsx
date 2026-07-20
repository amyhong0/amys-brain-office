'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  BookOpen,
  ScrollText,
  Sparkles,
  Skull,
  Wrench,
  Search,
  Cpu,
  Zap,
  AlertTriangle,
  X,
  Terminal,
  Play,
  CheckCircle2,
  Clock,
  ChevronRight,
  Disc3,
} from 'lucide-react';
import { AgentState } from '@/lib/agents/types';

// ── Types ─────────────────────────────────────────────────────────
interface ZoneConfig {
  id: string;
  name: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
  neonColor: string;
  gridColor: string;
  tasks: { label: string; icon: string }[];
}

interface SpellLog {
  id: number;
  time: string;
  spell: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'casting';
  zoneId: string;
}

// ── Zone Definitions ──────────────────────────────────────────────
const ZONES: ZoneConfig[] = [
  {
    id: 'cauldron',
    name: '마법 가마솥',
    title: 'Orchestrator Core',
    icon: <FlaskConical size={16} />,
    color: '#9C27B0',
    glowColor: 'rgba(156,39,176,0.4)',
    neonColor: '#CE93D8',
    gridColor: '#4A148C',
    tasks: [
      { label: 'Agent Orchestration', icon: '⚡' },
      { label: 'Task Distribution', icon: '🔀' },
      { label: 'Memory Retrieval', icon: '🧠' },
      { label: 'Priority Queue', icon: '📊' },
    ],
  },
  {
    id: 'desk',
    name: '마법사의 책상',
    title: 'Knowledge Desk',
    icon: <BookOpen size={16} />,
    color: '#4CAF50',
    glowColor: 'rgba(76,175,80,0.4)',
    neonColor: '#A5D6A7',
    gridColor: '#1B5E20',
    tasks: [
      { label: 'Document Parsing', icon: '📄' },
      { label: 'Text Analysis', icon: '🔍' },
      { label: 'Data Extraction', icon: '📋' },
      { label: 'Knowledge Graph', icon: '🔗' },
    ],
  },
  {
    id: 'library',
    name: '비전 도서관',
    title: 'Arcane Library',
    icon: <ScrollText size={16} />,
    color: '#2196F3',
    glowColor: 'rgba(33,150,243,0.4)',
    neonColor: '#90CAF9',
    gridColor: '#0D47A1',
    tasks: [
      { label: 'Semantic Search', icon: '🔎' },
      { label: 'Pattern Matching', icon: '📐' },
      { label: 'Classification', icon: '🏷️' },
      { label: 'Report Generation', icon: '📝' },
    ],
  },
  {
    id: 'debug',
    name: '흑마법 연구실',
    title: 'Debug Dungeon',
    icon: <Skull size={16} />,
    color: '#F44336',
    glowColor: 'rgba(244,67,54,0.4)',
    neonColor: '#EF9A9A',
    gridColor: '#B71C1C',
    tasks: [
      { label: 'Error Diagnosis', icon: '🐛' },
      { label: 'Stack Trace', icon: '🔍' },
      { label: 'Log Analysis', icon: '📊' },
      { label: 'System Repair', icon: '🔧' },
    ],
  },
];

// ── Spell Log Generator ───────────────────────────────────────────
const SPELL_TEMPLATES: Record<string, { info: string[]; success: string[]; warning: string[]; error: string[] }> = {
  cauldron: {
    info: ['오케스트레이션 마법을 준비 중...', '에이전트 큐를 스캔하는 중...', '메모리 영역을 활성화하는 중...'],
    success: ['에이전트가 성공적으로 할당됨 ✓', '태스크 분배 완료! 모든 노드 활성화', '메모리 검색 완료 → 결과 반환'],
    warning: ['에이전트 응답 지연 발생... 재시도 중', '메모리 캐시 만료 → 재색인 필요'],
    error: ['오케스트레이션 실패: 에이전트 응답 없음 ✗', '메모리 접근 오류: 세그먼트 폴트'],
  },
  desk: {
    info: ['문서 파싱 주문을 외우는 중...', '텍스트 마법진을 그리는 중...', '데이터 추출 룬 활성화 중...'],
    success: ['문서 파싱 완료! 마법의 지식이 추출됨 ✓', '텍스트 분석 완료 → 의미 구조 발견', '데이터 추출 성공!'],
    warning: ['문서 형식이 불완전합니다... 일부 누락', '인코딩 불일치 가능성 있음'],
    error: ['문서 파싱 실패: 손상된 파일 ✗', '텍스트 분석 오류: 너무 큰 문서'],
  },
  library: {
    info: ['의미론 검색 마법을 시전하는 중...', '지식 그래프를 탐색하는 중...', '패턴 매칭 알고리즘 활성화...'],
    success: ['검색 완료! 가장 관련성 높은 결과 발견 ✓', '패턴 매칭 성공 → 유사도 98%', '분류 완료: 3개 카테고리 식별'],
    warning: ['검색 결과가 부족합니다... 유사도 임계값 낮춤', '지식 그래프에 순환 참조 발견'],
    error: ['의미론 검색 오류: 인덱스 손상 ✗', '지식 그래프 접근 불가: 연결 끊김'],
  },
  debug: {
    info: ['디버깅 마법을 준비하는 중...', '스택 트레이스를 추적하는 중...', '오류 로그를 분석하는 중...'],
    success: ['버그 발견 및 수정 완료! 시스템 안정화 ✓', '메모리 누수 패치 완료', '예외 처리 개선 완료'],
    warning: ['스택 트레이스에 순환 참조 발견...', '메모리 사용량이 임계값에 도달'],
    error: ['디버깅 실패: 크리티컬 에러 ✗', '시스템 복구 불가 → 수동 개입 필요'],
  },
};

const getRandomSpell = (zoneId: string, type: 'info' | 'success' | 'warning' | 'error'): string => {
  const templates = SPELL_TEMPLATES[zoneId]?.[type];
  if (!templates || templates.length === 0) return `${type} spell cast...`;
  return templates[Math.floor(Math.random() * templates.length)];
};

function formatTime(d: Date): string {
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

// ── Spell Particle Component ──────────────────────────────────────
function SpellParticles({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ opacity: 0, x: 50 + Math.random() * 20, y: 30 + Math.random() * 20 }}
          animate={{
            opacity: [0, 0.8, 0],
            x: [50 + Math.random() * 20, Math.random() * 100],
            y: [30 + Math.random() * 20, Math.random() * 80],
            scale: [0, 1.5, 0],
          }}
          transition={{ duration: 1.5 + Math.random() * 2, repeat: Infinity, delay: i * 0.3, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ── Isometric Grid Tile ───────────────────────────────────────────
function IsometricTile({
  x, y, zone, agent, onClick,
}: {
  x: number; y: number; zone: ZoneConfig; agent: AgentState | undefined; onClick: () => void;
}) {
  const isWorking = agent?.status === 'working';
  const isCompleted = agent?.status === 'completed';
  const isIdle = !isWorking && !isCompleted;
  const statusColor = isWorking ? '#FFD700' : isCompleted ? '#4CAF50' : '#666';

  // Isometric projection
  const isoX = (x - y) * 48;
  const isoY = (x + y) * 24;

  return (
    <motion.g
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      whileHover={{ y: -4, filter: 'brightness(1.3)' }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (x + y) * 0.08 }}
    >
      {/* Isometric Floor Tile */}
      <polygon
        points={`0,-${12} -${44},0 0,${12} ${44},0`}
        fill={zone.gridColor}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="0.5"
        opacity={0.6}
      />

      {/* Isometric Wall (back) */}
      <polygon
        points={`-${44},0 -${44},-${28} 0,-${40} 0,-${12}`}
        fill={zone.color + '33'}
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="0.5"
      />
      <polygon
        points={`0,-${12} 0,-${40} ${44},-${28} ${44},0`}
        fill={zone.color + '22'}
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="0.5"
      />

      {/* Zone Object - varies by zone */}
      {zone.id === 'cauldron' && (
        <g transform={`translate(0,-${18})`}>
          {/* Cauldron */}
          <motion.ellipse cx="0" cy="4" rx="10" ry="5" fill="#5D4037" />
          <motion.ellipse cx="0" cy="2" rx="12" ry="4" fill="#8D6E63" />
          <motion.ellipse cx="0" cy="1" rx="8" ry="3"
            fill={isWorking ? '#CE93D8' : '#7B1FA2'}
            animate={isWorking ? { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] } : {}}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          {/* Steam */}
          {isWorking && [0, 5, -5].map((dx, i) => (
            <motion.rect
              key={i} x={dx - 1} y={-6} width="2" height="8" rx="1"
              fill="#CE93D8" opacity="0.5"
              animate={{ y: [-6, -16], opacity: [0.5, 0] }}
              transition={{ duration: 0.8 + i * 0.2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
          {/* Neon Glow */}
          {isWorking && (
            <motion.ellipse cx="0" cy="2" rx="14" ry="5" fill="none" stroke="#CE93D8" strokeWidth="1"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </g>
      )}

      {zone.id === 'desk' && (
        <g transform={`translate(0,-${16})`}>
          {/* Desk */}
          <motion.rect x="-12" y="2" width="24" height="6" rx="1" fill="#5D4037" />
          <motion.rect x="-10" y="0" width="20" height="3" rx="1" fill="#8D6E63" />
          {/* Books/Scrolls */}
          <motion.rect x="-5" y="-4" width="4" height="5" rx="1" fill="#CD5C5C"
            animate={isWorking ? { rotate: [0, 5, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.rect x="1" y="-3" width="4" height="4" rx="1" fill="#4FC3F7"
            animate={isWorking ? { rotate: [0, -5, 0] } : {}}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          {/* Neon light */}
          {isWorking && (
            <motion.line x1="-14" y1="-2" x2="14" y2="-2" stroke="#A5D6A7" strokeWidth="1"
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </g>
      )}

      {zone.id === 'library' && (
        <g transform={`translate(0,-${18})`}>
          {/* Bookshelf */}
          <motion.rect x="-14" y="-8" width="28" height="16" rx="1" fill="#3E2723" />
          {[0,1,2,3].map(i => (
            <motion.rect key={i} x="-11" y={-5 + i * 4} width="22" height="3" rx="0.5"
              fill={['#CD5C5C','#4FC3F7','#8BC34A','#FFD700'][i]}
              animate={isWorking ? { x: [-11, -8, -11], opacity: [1, 0.7, 1] } : {}}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
          {/* Floating book */}
          {isWorking && (
            <motion.rect x="-2" y="-4" width="4" height="3" rx="0.5" fill="#FFD700"
              animate={{ y: [-4, -8, -4], rotate: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </g>
      )}

      {zone.id === 'debug' && (
        <g transform={`translate(0,-${16})`}>
          {/* Dark altar */}
          <motion.rect x="-10" y="2" width="20" height="6" rx="1" fill="#1A0000" />
          <motion.rect x="-8" y="0" width="16" height="3" rx="1" fill="#333" />
          {/* Crystal */}
          <motion.polygon points="0,-8 -5,-2 5,-2" fill="#F44336"
            animate={isWorking ? { opacity: [0.3, 1, 0.3] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {/* Sparks */}
          {isWorking && [0, 1, 2, 3].map(i => (
            <motion.circle key={i} cx={-4 + i * 3} cy={-3} r="0.8" fill="#FF5252"
              animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </g>
      )}

      {/* Status Indicator above zone */}
      <motion.g transform={`translate(0,-${32})`}>
        <motion.circle
          cx="0" cy="0" r="4"
          fill={statusColor}
          animate={isWorking ? { r: [4, 5.5, 4], opacity: [1, 0.6, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {isWorking && (
          <>
            <motion.circle cx="0" cy="0" r="7" fill="none" stroke={statusColor} strokeWidth="1"
              animate={{ r: [7, 12], opacity: [0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.circle cx="0" cy="0" r="9" fill="none" stroke={statusColor} strokeWidth="0.5"
              animate={{ r: [9, 15], opacity: [0.3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
          </>
        )}
      </motion.g>

      {/* Zone Label on floor */}
      <text x="0" y="20" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="5" fontFamily="monospace">
        {zone.name.slice(0, 4)}
      </text>
    </motion.g>
  );
}

// ── Detail Popup ──────────────────────────────────────────────────
function AgentDetailPopup({
  zone, agent, onClose,
}: {
  zone: ZoneConfig; agent: AgentState | undefined; onClose: () => void;
}) {
  const isWorking = agent?.status === 'working';
  const isCompleted = agent?.status === 'completed';
  const statusText = isWorking ? '작업 중' : isCompleted ? '완료' : '대기';
  const statusColor = isWorking ? '#FFD700' : isCompleted ? '#4CAF50' : '#888';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute z-50 w-72 rounded-xl overflow-hidden shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(20,10,40,0.98), rgba(10,5,30,0.98))',
        border: `1px solid ${zone.color}44`,
        boxShadow: `0 8px 32px ${zone.glowColor}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: `${zone.color}22`, borderBottom: `1px solid ${zone.color}33` }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${zone.color}33`, color: zone.neonColor }}>
            {zone.icon}
          </div>
          <div>
            <div className="text-white text-sm font-bold">{zone.name}</div>
            <div className="text-gray-500 text-[10px] font-mono">{zone.title}</div>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-all">
          <X size={14} className="text-gray-400" />
        </button>
      </div>

      {/* Status */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs">상태</span>
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusColor }}
              animate={isWorking ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-xs font-medium" style={{ color: statusColor }}>{statusText}</span>
          </div>
        </div>
        {agent?.currentTask && (
          <div className="mt-2 px-2 py-1.5 rounded-lg text-[11px]"
            style={{ background: `${zone.color}15`, color: zone.neonColor }}>
            <Zap size={10} className="inline mr-1" />
            {agent.currentTask}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="px-4 py-3">
        <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-2">작업 목록</div>
        <div className="space-y-1">
          {zone.tasks.map((task, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all"
            >
              <span className="text-xs">{task.icon}</span>
              <span className="text-gray-300 text-[11px]">{task.label}</span>
              {isWorking && i === 0 && (
                <motion.div className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: zone.neonColor }}
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 flex items-center gap-2"
        style={{ background: `${zone.color}11`, borderTop: `1px solid ${zone.color}22` }}>
        <Clock size={10} className="text-gray-500" />
        <span className="text-gray-500 text-[10px]">마지막 업데이트: {formatTime(new Date())}</span>
      </div>
    </motion.div>
  );
}

// ── Spell Log Item ────────────────────────────────────────────────
function SpellLogItem({ log, zoneColor }: { log: SpellLog; zoneColor: string }) {
  const typeIcon = {
    info: <ChevronRight size={10} />,
    success: <CheckCircle2 size={10} />,
    warning: <AlertTriangle size={10} />,
    error: <X size={10} />,
    casting: <Play size={10} />,
  };

  const typeColor = {
    info: '#A78BFA',
    success: '#4CAF50',
    warning: '#FFD700',
    error: '#F44336',
    casting: '#CE93D8',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-1.5 py-0.5 group"
    >
      <span className="text-[9px] text-gray-600 font-mono w-14 flex-shrink-0">{log.time}</span>
      <span className="mt-0.5 flex-shrink-0" style={{ color: typeColor[log.type] }}>
        {typeIcon[log.type]}
      </span>
      <span className="text-[10px] font-mono leading-tight" style={{ color: typeColor[log.type] }}>
        {log.spell}
      </span>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────
interface WizardTowerProps {
  agents: AgentState[];
}

export default function WizardTower({ agents }: WizardTowerProps) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [spellLogs, setSpellLogs] = useState<SpellLog[]>([]);
  const [isTerminalVisible, setIsTerminalVisible] = useState(true);
  const logIdRef = useRef(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const selectedZoneData = selectedZone ? ZONES.find(z => z.id === selectedZone) : null;
  const selectedAgent = selectedZone ? agents.find(a => a.id === selectedZone) : undefined;

  const workingCount = agents.filter(a => a.status === 'working').length;

  // ── Simulate spell logs ──
  useEffect(() => {
    const interval = setInterval(() => {
      const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
      const agent = agents.find(a => a.id === zone.id);
      const types: ('info' | 'casting' | 'success' | 'warning')[] = ['info', 'casting'];
      
      if (agent?.status === 'working') {
        types.push('success', 'warning');
      }

      const rawType = types[Math.floor(Math.random() * types.length)] as SpellLog['type'];
      const spell = getRandomSpell(zone.id, rawType === 'casting' ? 'info' : rawType as 'info' | 'success' | 'warning' | 'error');
      const type = rawType;
      logIdRef.current += 1;

      setSpellLogs(prev => {
        const newLog: SpellLog = {
          id: logIdRef.current,
          time: formatTime(new Date()),
          spell,
          type,
          zoneId: zone.id,
        };
        return [...prev.slice(-49), newLog];
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [agents]);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [spellLogs]);

  const handleZoneClick = useCallback((zoneId: string) => {
    setSelectedZone(prev => prev === zoneId ? null : zoneId);
  }, []);

  const getZoneColor = (zoneId: string): string => {
    return ZONES.find(z => z.id === zoneId)?.color || '#666';
  };

  return (
    <div className="relative select-none">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-[#050510] via-[#0D0820] to-[#1A0A2E] rounded-t-xl pt-3 pb-0 px-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-purple-400" />
            <span className="text-purple-300 text-[10px] font-bold tracking-widest uppercase">Arcane Office</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Terminal Toggle */}
            <button
              onClick={() => setIsTerminalVisible(v => !v)}
              className="p-1 rounded-md hover:bg-white/10 transition-all"
            >
              <Terminal size={12} className={isTerminalVisible ? 'text-purple-400' : 'text-gray-600'} />
            </button>
            {/* Status Badge */}
            <motion.div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${
                workingCount > 0 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-800 text-gray-500'
              }`}
              animate={workingCount > 0 ? { boxShadow: ['0 0 0px rgba(255,215,0,0)', '0 0 8px rgba(255,215,0,0.3)', '0 0 0px rgba(255,215,0,0)'] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: workingCount > 0 ? '#FFD700' : '#666' }}
                animate={workingCount > 0 ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
              {workingCount > 0 ? `${workingCount} WORKING` : 'ALL IDLE'}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Tower Grid - Isometric View */}
      <div className="relative bg-gradient-to-b from-[#1A0A2E] to-[#0D0820] overflow-hidden">
        {/* Side pillar decorations */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#2A1A3A]/80 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#2A1A3A]/80 to-transparent" />

        {/* Isometric Grid */}
        <div className="relative py-8 overflow-x-auto">
          <div className="flex justify-center">
            <svg
              viewBox="-120 -50 240 100"
              className="w-full max-w-[400px] h-48"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Background */}
              <defs>
                <radialGradient id="floorGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(156,39,176,0.08)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
              <rect x="-120" y="-50" width="240" height="100" fill="url(#floorGlow)" />

              {/* Grid layout: cauldron(back-left), desk(back-right), library(front-left), debug(front-right) */}
              <IsometricTile x={0} y={0} zone={ZONES[0]} agent={agents.find(a => a.id === 'cauldron')} onClick={() => handleZoneClick('cauldron')} />
              <IsometricTile x={1} y={0} zone={ZONES[1]} agent={agents.find(a => a.id === 'desk')} onClick={() => handleZoneClick('desk')} />
              <IsometricTile x={0} y={1} zone={ZONES[2]} agent={agents.find(a => a.id === 'library')} onClick={() => handleZoneClick('library')} />
              <IsometricTile x={1} y={1} zone={ZONES[3]} agent={agents.find(a => a.id === 'debug')} onClick={() => handleZoneClick('debug')} />
            </svg>
          </div>
        </div>

        {/* Zone Labels below grid */}
        <div className="grid grid-cols-4 gap-1 px-8 pb-2">
          {ZONES.map(zone => {
            const agent = agents.find(a => a.id === zone.id);
            const isWorking = agent?.status === 'working';
            const isCompleted = agent?.status === 'completed';

            return (
              <motion.button
                key={zone.id}
                onClick={() => handleZoneClick(zone.id)}
                className="relative flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all"
                style={{
                  background: selectedZone === zone.id ? `${zone.color}22` : 'transparent',
                  border: `1px solid ${selectedZone === zone.id ? zone.color + '44' : 'transparent'}`,
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Status Dot */}
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isWorking ? '#FFD700' : isCompleted ? '#4CAF50' : '#666' }}
                  animate={isWorking ? { scale: [1, 1.3, 1], boxShadow: ['0 0 0px rgba(255,215,0,0)', '0 0 6px rgba(255,215,0,0.5)', '0 0 0px rgba(255,215,0,0)'] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-gray-400 text-[9px] font-medium">{zone.name}</span>
                <span className="text-gray-600 text-[7px] font-mono">
                  {isWorking ? '⚡' : isCompleted ? '✓' : '○'}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="h-3 bg-gradient-to-b from-[#2A1A3A] to-[#1A0A2E] rounded-b-xl relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ backgroundImage: 'repeating-linear-gradient(90deg, #2A1A3A 0px, #2A1A3A 18px, #1E0E2E 18px, #1E0E2E 20px)' }} />
      </div>

      {/* ── Detail Popup (absolute positioned) ── */}
      <AnimatePresence>
        {selectedZone && selectedZoneData && (
          <div className="absolute top-16 right-4 z-50">
            <AgentDetailPopup
              zone={selectedZoneData}
              agent={selectedAgent}
              onClose={() => setSelectedZone(null)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ── Terminal / Spell Log ── */}
      <AnimatePresence>
        {isTerminalVisible && (
          <motion.div
            ref={terminalRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 py-2 font-mono text-[10px] leading-relaxed max-h-40 overflow-y-auto"
              style={{
                background: 'rgba(0,0,0,0.6)',
                borderTop: '1px solid rgba(139,92,246,0.15)',
                borderBottom: '1px solid rgba(139,92,246,0.15)',
              }}
            >
              {/* Terminal Header */}
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-purple-900/30">
                <div className="flex items-center gap-2">
                  <Disc3 size={10} className="text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
                  <span className="text-purple-400 text-[9px] font-bold tracking-wider">SPELL LOG</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-[8px]">{spellLogs.length} entries</span>
                  <button
                    onClick={() => setSpellLogs([])}
                    className="text-gray-600 hover:text-gray-400 transition-all text-[8px]"
                  >
                    clear
                  </button>
                </div>
              </div>

              {/* Log Entries */}
              {spellLogs.length === 0 ? (
                <div className="text-gray-600 text-[9px] italic py-4 text-center">
                  마법 주문 로그가 여기에 표시됩니다... 주문을 기다리는 중...
                </div>
              ) : (
                spellLogs.map(log => (
                  <SpellLogItem key={log.id} log={log} zoneColor={getZoneColor(log.zoneId)} />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close popup */}
      {selectedZone && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSelectedZone(null)}
          style={{ pointerEvents: 'auto' }}
        />
      )}
    </div>
  );
}