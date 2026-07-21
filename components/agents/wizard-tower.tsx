'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  BookOpen,
  ScrollText,
  Sparkles,
  Skull,
  Zap,
  X,
  Terminal,
  CheckCircle2,
  Clock,
  ChevronRight,
  Disc3,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { AgentState } from '@/lib/agents/types';

// ── Types ─────────────────────────────────────────────────────────
interface ZoneConfig {
  id: string;
  name: string;
  title: string;
  emoji: string;
  color: string;
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
    emoji: '🧙‍♂️',
    color: '#9C27B0',
    tasks: [
      { label: 'Agent Orchestration', icon: '⚡' },
      { label: 'Task Distribution', icon: '🔀' },
    ],
  },
  {
    id: 'desk',
    name: '마법사의 책상',
    title: 'Knowledge Desk',
    emoji: '🔮',
    color: '#4CAF50',
    tasks: [
      { label: 'Document Parsing', icon: '📄' },
      { label: 'Data Extraction', icon: '📋' },
    ],
  },
  {
    id: 'library',
    name: '비전 도서관',
    title: 'Arcane Library',
    emoji: '⚗️',
    color: '#2196F3',
    tasks: [
      { label: 'Semantic Search', icon: '🔎' },
      { label: 'Pattern Matching', icon: '📐' },
    ],
  },
  {
    id: 'debug',
    name: '흑마법 연구실',
    title: 'Debug Dungeon',
    emoji: '🦹',
    color: '#F44336',
    tasks: [
      { label: 'Error Diagnosis', icon: '🐛' },
      { label: 'System Repair', icon: '🔧' },
    ],
  },
];

// ── Spell Log Generator ───────────────────────────────────────────
const SPELL_TEMPLATES: Record<string, { info: string[]; success: string[]; warning: string[]; error: string[] }> = {
  cauldron: {
    info: ['오케스트레이션 마법을 준비 중...', '에이전트 큐를 스캔하는 중...'],
    success: ['에이전트가 성공적으로 할당됨 ✓', '태스크 분배 완료! 모든 노드 활성화'],
    warning: ['에이전트 응답 지연 발생... 재시도 중'],
    error: ['오케스트레이션 실패: 에이전트 응답 없음 ✗'],
  },
  desk: {
    info: ['문서 파싱 주문을 외우는 중...', '데이터 추출 룬 활성화 중...'],
    success: ['문서 파싱 완료! 마법의 지식이 추출됨 ✓', '데이터 추출 성공!'],
    warning: ['문서 형식이 불완전합니다... 일부 누락'],
    error: ['문서 파싱 실패: 손상된 파일 ✗'],
  },
  library: {
    info: ['의미론 검색 마법을 시전하는 중...', '지식 그래프를 탐색하는 중...'],
    success: ['검색 완료! 가장 관련성 높은 결과 발견 ✓', '패턴 매칭 성공!'],
    warning: ['검색 결과가 부족합니다... 유사도 임계값 낮춤'],
    error: ['의미론 검색 오류: 인덱스 손상 ✗'],
  },
  debug: {
    info: ['디버깅 마법을 준비하는 중...', '오류 로그를 분석하는 중...'],
    success: ['버그 발견 및 수정 완료! 시스템 안정화 ✓'],
    warning: ['스택 트레이스에 순환 참조 발견...'],
    error: ['디버깅 실패: 크리티컬 에러 ✗'],
  },
};

const getRandomSpell = (zoneId: string, type: 'info' | 'success' | 'warning' | 'error'): string => {
  const templates = SPELL_TEMPLATES[zoneId]?.[type];
  if (!templates || templates.length === 0) return `${type} spell cast...`;
  return templates[Math.floor(Math.random() * templates.length)];
};

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

// ── Medieval Great Hall Background Component (Fantasy Illustration Style) ──
function MedievalGreatHallBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Modern gothic background gradient */}
      <div className="w-full h-full" style={{
        background: `
          linear-gradient(180deg, 
            rgba(26, 26, 46, 0.95) 0%, 
            rgba(22, 33, 62, 0.9) 50%, 
            rgba(26, 26, 46, 0.95) 100%
          ),
          radial-gradient(ellipse at 50% 30%, rgba(60, 40, 80, 0.1) 0%, transparent 50%)
        `,
      }} />
      
      {/* Minimalist geometric stone pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 100px,
            rgba(0, 0, 0, 0.05) 100px,
            rgba(0, 0, 0, 0.05) 102px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 80px,
            rgba(0, 0, 0, 0.04) 80px,
            rgba(0, 0, 0, 0.04) 82px
          )
        `,
      }} />

      {/* Modern vertical lines with gothic arch hints */}
      <div className="absolute inset-0">
        {/* Left modern pillar */}
        <div className="absolute top-0 left-0 w-16 h-full">
          <div className="w-full h-full" style={{
            background: 'linear-gradient(90deg, rgba(30, 25, 45, 0.6), rgba(25, 20, 40, 0.4), transparent)',
          }} />
          <div className="absolute top-0 left-1 w-14 h-3/4" style={{
            background: 'linear-gradient(180deg, rgba(40, 35, 55, 0.3), rgba(35, 30, 50, 0.2))',
            clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)',
            border: '1px solid rgba(80, 60, 100, 0.15)',
          }} />
        </div>
        
        {/* Right modern pillar */}
        <div className="absolute top-0 right-0 w-16 h-full">
          <div className="w-full h-full" style={{
            background: 'linear-gradient(-90deg, rgba(30, 25, 45, 0.6), rgba(25, 20, 40, 0.4), transparent)',
          }} />
          <div className="absolute top-0 right-1 w-14 h-3/4" style={{
            background: 'linear-gradient(180deg, rgba(40, 35, 55, 0.3), rgba(35, 30, 50, 0.2))',
            clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)',
            border: '1px solid rgba(80, 60, 100, 0.15)',
          }} />
        </div>
      </div>

      {/* Modern arched windows with simplified stained glass */}
      <div className="absolute top-4 left-20 w-20 h-36" style={{
        background: 'linear-gradient(180deg, rgba(70, 50, 100, 0.25), rgba(50, 70, 110, 0.2), rgba(70, 50, 100, 0.25))',
        borderRadius: '50% 50% 0 0',
        border: '2px solid rgba(90, 70, 120, 0.3)',
        boxShadow: 'inset 0 0 20px rgba(100, 80, 140, 0.2), 0 0 15px rgba(90, 70, 120, 0.15)',
      }}>
        <div className="absolute inset-2 flex flex-col justify-center items-center gap-1.5">
          <div className="w-8 h-8 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255, 200, 100, 0.3), rgba(255, 150, 50, 0.15))' }} />
          <div className="w-6 h-6 rounded-full" style={{ background: 'radial-gradient(circle, rgba(100, 150, 255, 0.3), rgba(50, 100, 200, 0.15))' }} />
          <div className="w-5 h-5 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255, 100, 150, 0.3), rgba(200, 50, 100, 0.15))' }} />
        </div>
      </div>
      
      <div className="absolute top-4 right-20 w-20 h-36" style={{
        background: 'linear-gradient(180deg, rgba(70, 50, 100, 0.25), rgba(50, 70, 110, 0.2), rgba(70, 50, 100, 0.25))',
        borderRadius: '50% 50% 0 0',
        border: '2px solid rgba(90, 70, 120, 0.3)',
        boxShadow: 'inset 0 0 20px rgba(100, 80, 140, 0.2), 0 0 15px rgba(90, 70, 120, 0.15)',
      }}>
        <div className="absolute inset-2 flex flex-col justify-center items-center gap-1.5">
          <div className="w-8 h-8 rounded-full" style={{ background: 'radial-gradient(circle, rgba(100, 200, 150, 0.3), rgba(50, 150, 100, 0.15))' }} />
          <div className="w-6 h-6 rounded-full" style={{ background: 'radial-gradient(circle, rgba(150, 100, 200, 0.3), rgba(100, 50, 150, 0.15))' }} />
          <div className="w-5 h-5 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255, 180, 100, 0.3), rgba(200, 130, 50, 0.15))' }} />
        </div>
      </div>

      {/* Modern candles with neon glow */}
      <div className="absolute bottom-16 left-1/4 transform -translate-x-1/2">
        <div className="flex flex-col items-center">
          {/* Flames with neon glow */}
          <div className="flex gap-2.5 mb-1">
            <div className="w-1.5 h-3.5 rounded-full" style={{
              background: 'radial-gradient(ellipse at bottom, rgba(255, 200, 100, 0.85), rgba(255, 100, 50, 0.5), transparent)',
              boxShadow: '0 0 8px rgba(255, 150, 50, 0.7), 0 0 16px rgba(147, 51, 234, 0.4), 0 0 24px rgba(147, 51, 234, 0.2)',
              animation: 'flicker 0.5s ease-in-out infinite alternate',
            }} />
            <div className="w-1.5 h-4.5 rounded-full" style={{
              background: 'radial-gradient(ellipse at bottom, rgba(255, 220, 120, 0.85), rgba(255, 120, 60, 0.5), transparent)',
              boxShadow: '0 0 10px rgba(255, 160, 60, 0.7), 0 0 20px rgba(147, 51, 234, 0.4), 0 0 30px rgba(147, 51, 234, 0.2)',
              animation: 'flicker 0.6s ease-in-out infinite alternate',
            }} />
            <div className="w-1.5 h-3.5 rounded-full" style={{
              background: 'radial-gradient(ellipse at bottom, rgba(255, 200, 100, 0.85), rgba(255, 100, 50, 0.5), transparent)',
              boxShadow: '0 0 8px rgba(255, 150, 50, 0.7), 0 0 16px rgba(147, 51, 234, 0.4), 0 0 24px rgba(147, 51, 234, 0.2)',
              animation: 'flicker 0.55s ease-in-out infinite alternate',
            }} />
          </div>
          {/* Modern candle holder */}
          <div className="w-2.5 h-7" style={{ background: 'linear-gradient(90deg, rgba(50, 45, 65, 0.85), rgba(70, 65, 85, 0.75), rgba(50, 45, 65, 0.85))' }} />
          <div className="w-5 h-2.5 rounded" style={{ background: 'linear-gradient(180deg, rgba(60, 55, 75, 0.85), rgba(45, 40, 55, 0.75))' }} />
        </div>
      </div>
      
      <div className="absolute bottom-16 right-1/4 transform translate-x-1/2">
        <div className="flex flex-col items-center">
          {/* Flames with neon glow */}
          <div className="flex gap-2.5 mb-1">
            <div className="w-1.5 h-3.5 rounded-full" style={{
              background: 'radial-gradient(ellipse at bottom, rgba(255, 200, 100, 0.85), rgba(255, 100, 50, 0.5), transparent)',
              boxShadow: '0 0 8px rgba(255, 150, 50, 0.7), 0 0 16px rgba(147, 51, 234, 0.4), 0 0 24px rgba(147, 51, 234, 0.2)',
              animation: 'flicker 0.52s ease-in-out infinite alternate',
            }} />
            <div className="w-1.5 h-4.5 rounded-full" style={{
              background: 'radial-gradient(ellipse at bottom, rgba(255, 220, 120, 0.85), rgba(255, 120, 60, 0.5), transparent)',
              boxShadow: '0 0 10px rgba(255, 160, 60, 0.7), 0 0 20px rgba(147, 51, 234, 0.4), 0 0 30px rgba(147, 51, 234, 0.2)',
              animation: 'flicker 0.58s ease-in-out infinite alternate',
            }} />
            <div className="w-1.5 h-3.5 rounded-full" style={{
              background: 'radial-gradient(ellipse at bottom, rgba(255, 200, 100, 0.85), rgba(255, 100, 50, 0.5), transparent)',
              boxShadow: '0 0 8px rgba(255, 150, 50, 0.7), 0 0 16px rgba(147, 51, 234, 0.4), 0 0 24px rgba(147, 51, 234, 0.2)',
              animation: 'flicker 0.54s ease-in-out infinite alternate',
            }} />
          </div>
          {/* Modern candle holder */}
          <div className="w-2.5 h-7" style={{ background: 'linear-gradient(90deg, rgba(50, 45, 65, 0.85), rgba(70, 65, 85, 0.75), rgba(50, 45, 65, 0.85))' }} />
          <div className="w-5 h-2.5 rounded" style={{ background: 'linear-gradient(180deg, rgba(60, 55, 75, 0.85), rgba(45, 40, 55, 0.75))' }} />
        </div>
      </div>

      {/* Simplified decorative elements - silhouettes */}
      <div className="absolute bottom-28 left-10 w-10 h-6 rounded" style={{
        background: 'linear-gradient(135deg, rgba(70, 40, 90, 0.4), rgba(55, 30, 75, 0.3))',
        border: '1px solid rgba(100, 70, 120, 0.3)',
        transform: 'rotate(-10deg)',
        boxShadow: '0 3px 6px rgba(0, 0, 0, 0.25)',
      }} />
      
      <div className="absolute bottom-30 right-10 w-8 h-8 rounded" style={{
        background: 'linear-gradient(135deg, rgba(35, 55, 90, 0.4), rgba(25, 45, 75, 0.3))',
        border: '1px solid rgba(70, 90, 120, 0.3)',
        transform: 'rotate(6deg)',
        boxShadow: '0 3px 6px rgba(0, 0, 0, 0.25)',
      }} />

      {/* Uniform floating particles */}
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: '3px',
            height: '3px',
            left: `${10 + i * 9}%`,
            top: `${20 + (i % 3) * 25}%`,
            background: `radial-gradient(circle, rgba(140, 90, 200, 0.5), rgba(100, 50, 150, 0.3))`,
            boxShadow: `0 0 6px rgba(140, 90, 200, 0.4)`,
            animation: `float ${4 + Math.random() * 1.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}

      {/* Straight light rays */}
      <div className="absolute top-0 left-16 w-28 h-full" style={{
        background: 'linear-gradient(180deg, rgba(90, 70, 130, 0.12), transparent 55%)',
        transform: 'skewX(-8deg)',
        pointerEvents: 'none',
      }} />
      <div className="absolute top-0 right-16 w-28 h-full" style={{
        background: 'linear-gradient(180deg, rgba(90, 70, 130, 0.12), transparent 55%)',
        transform: 'skewX(8deg)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

// ── Fantasy Character Component (Illustration Style with Movement) ─────
function PixelCharacter({
  x, y, zone, agent, onClick,
}: {
  x: number; y: number; zone: ZoneConfig; agent: AgentState | undefined; onClick: () => void;
}) {
  const isWorking = agent?.status === 'working';
  const characterScale = isWorking ? 1.08 : 1;
  
  // Random movement when working
  const movementRange = isWorking ? 12 : 4;
  const movementDuration = isWorking ? 5 : 10;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.92 }}
      animate={{ scale: characterScale }}
      initial={{ x: 0, y: 0 }}
      animate={{
        x: [0, (Math.random() - 0.5) * movementRange, (Math.random() - 0.5) * movementRange, 0],
        y: [0, (Math.random() - 0.5) * movementRange, (Math.random() - 0.5) * movementRange, 0],
      }}
      transition={{
        duration: movementDuration,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
    >
      {/* Character with shadow on floor */}
      <div className="relative">
        {/* Ground shadow - realistic */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 translate-y-1 w-8 h-2 rounded-full" style={{
          background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.4), transparent)',
        }} />
        
        {/* Character body - fantasy illustration style */}
        <motion.div
          className="w-14 h-14 flex items-center justify-center text-2xl"
          style={{
            background: isWorking 
              ? `radial-gradient(circle at 30% 30%, ${zone.color}dd, ${zone.color}99 60%, ${zone.color}66)`
              : 'radial-gradient(circle at 30% 30%, rgba(80, 70, 90, 0.9), rgba(50, 40, 60, 0.8) 60%, rgba(30, 20, 40, 0.7))',
            boxShadow: isWorking 
              ? `0 0 20px ${zone.color}88, 0 0 40px ${zone.color}44, inset 0 0 15px rgba(255,255,255,0.1)`
              : '0 4px 12px rgba(0,0,0,0.5), inset 0 0 10px rgba(255,255,255,0.05)',
            border: isWorking ? `2px solid ${zone.color}66` : '2px solid rgba(100, 80, 120, 0.3)',
            borderRadius: '50%',
          }}
          animate={isWorking ? { 
            y: [0, -3, 0],
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="drop-shadow-md" style={{ filter: isWorking ? 'brightness(1.2)' : 'brightness(0.9)' }}>{zone.emoji}</span>
          
          {/* Magical aura when working */}
          {isWorking && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{ 
                    backgroundColor: zone.color, 
                    opacity: 0.4,
                    width: '4px',
                    height: '4px',
                  }}
                  initial={{ 
                    x: 50 + Math.random() * 8 - 4, 
                    y: 50 + Math.random() * 8 - 4,
                  }}
                  animate={{
                    y: [null, -20, -35],
                    opacity: [0.4, 0.2, 0],
                    scale: [1, 0.8, 0.5],
                  }}
                  transition={{ 
                    duration: 1 + Math.random() * 0.5, 
                    repeat: Infinity, 
                    delay: i * 0.25 
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Speech bubble - elegant fantasy style */}
        {isWorking && agent?.currentTask && (
          <motion.div
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 px-4 py-2.5 text-white text-[11px] font-medium whitespace-nowrap max-w-[220px]"
            style={{
              background: 'linear-gradient(135deg, rgba(45, 25, 60, 0.95), rgba(30, 15, 45, 0.95))',
              border: '2px solid rgba(120, 80, 150, 0.5)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 0 15px rgba(150, 100, 180, 0.15)',
              borderRadius: '8px',
              position: 'relative',
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Elegant border decoration */}
            <div className="absolute -left-1 top-0 w-1 h-full rounded-l" style={{ background: 'linear-gradient(180deg, rgba(150, 100, 180, 0.6), rgba(100, 60, 140, 0.4))' }} />
            <div className="absolute -right-1 top-0 w-1 h-full rounded-r" style={{ background: 'linear-gradient(180deg, rgba(150, 100, 180, 0.6), rgba(100, 60, 140, 0.4))' }} />
            {agent.currentTask}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────
function AgentModal({
  zone, agent, onClose,
}: {
  zone: ZoneConfig; agent: AgentState | undefined; onClose: () => void;
}) {
  const isWorking = agent?.status === 'working';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-80 rounded-xl p-5"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 15, 50, 0.95), rgba(20, 10, 40, 0.95))',
          border: `1px solid ${zone.color}44`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ background: `${zone.color}33` }}>
            {zone.emoji}
          </div>
          <div>
            <div className="text-white font-bold">{zone.name}</div>
            <div className="text-gray-400 text-[10px] font-mono">{zone.title}</div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {zone.tasks.map((task, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <span>{task.icon}</span>
              <span className="text-gray-300">{task.label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: isWorking ? '#FFD700' : '#4CAF50' }}
            animate={isWorking ? { scale: [1, 1.3, 1] } : {}}
          />
          <span className="text-[10px] text-gray-400">
            {isWorking ? '작업 중' : '대기 중'}
          </span>
        </div>
      </motion.div>
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

// Character positions - roaming freely in the town
const CHARACTER_POSITIONS: Record<string, { x: number; y: number }> = {
  cauldron: { x: 30, y: 42 },
  desk: { x: 70, y: 38 },
  library: { x: 25, y: 65 },
  debug: { x: 75, y: 65 },
};

export default function WizardTower({ agents }: WizardTowerProps) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [spellLogs, setSpellLogs] = useState<SpellLog[]>([]);
  const [isTerminalVisible, setIsTerminalVisible] = useState(true);
  const logIdRef = useRef(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const selectedZoneData = selectedZone ? ZONES.find(z => z.id === selectedZone) : null;
  const selectedAgent = selectedZone ? agents.find(a => a.id === selectedZone) : undefined;

  const workingCount = agents.filter(a => a.status === 'working').length;

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
      logIdRef.current += 1;

      setSpellLogs(prev => [...prev.slice(-49), {
        id: logIdRef.current,
        time: formatTime(new Date()),
        spell,
        type: rawType,
        zoneId: zone.id,
      }]);
    }, 1200);

    return () => clearInterval(interval);
  }, [agents]);

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
            <button onClick={() => setIsTerminalVisible(v => !v)} className="p-1 rounded-md hover:bg-white/10 transition-all">
              <Terminal size={12} className={isTerminalVisible ? 'text-purple-400' : 'text-gray-600'} />
            </button>
            <motion.div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${
                workingCount > 0 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-800 text-gray-500'
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: workingCount > 0 ? '#FFD700' : '#666' }} />
              {workingCount > 0 ? `${workingCount} WORKING` : 'ALL IDLE'}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Medieval Great Hall - characters roaming freely */}
      <div className="relative bg-gradient-to-b from-[#0D0820] via-[#1A0A2E] to-[#0A0518] overflow-hidden rounded-b-xl" style={{ minHeight: 350 }}>
        <MedievalGreatHallBackground />
        
        {/* Characters freely roaming in the town */}
        {ZONES.map((zone) => (
          <PixelCharacter
            key={zone.id}
            x={CHARACTER_POSITIONS[zone.id].x}
            y={CHARACTER_POSITIONS[zone.id].y}
            zone={zone}
            agent={agents.find(a => a.id === zone.id)}
            onClick={() => handleZoneClick(zone.id)}
          />
        ))}
      </div>

      {/* Modal Popup */}
      <AnimatePresence>
        {selectedZone && selectedZoneData && (
          <AgentModal
            zone={selectedZoneData}
            agent={selectedAgent}
            onClose={() => setSelectedZone(null)}
          />
        )}
      </AnimatePresence>

      {/* Terminal */}
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
            <div className="px-4 py-2 font-mono text-[10px] leading-relaxed max-h-40 overflow-y-auto"
              style={{ background: 'rgba(0,0,0,0.6)', borderTop: '1px solid rgba(139,92,246,0.15)' }}>
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-purple-900/30">
                <div className="flex items-center gap-2">
                  <Disc3 size={10} className="text-purple-400" />
                  <span className="text-purple-400 text-[9px] font-bold">SPELL LOG</span>
                </div>
                <span className="text-gray-600 text-[8px]">{spellLogs.length} entries</span>
              </div>
              {spellLogs.length === 0 ? (
                <div className="text-gray-600 text-[9px] italic py-4 text-center">마법 주문 로그가 여기에 표시됩니다...</div>
              ) : (
                spellLogs.map(log => <SpellLogItem key={log.id} log={log} zoneColor={getZoneColor(log.zoneId)} />)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}