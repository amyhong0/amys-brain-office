'use client';

import React from 'react';
import { AgentState } from '@/lib/agents/types';

interface WizardTowerProps {
  agents: AgentState[];
}

// ── 애니메이션 CSS ────────────────────────────────
const ANIMATION_STYLES = `
  @keyframes slime-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
  @keyframes steam-rise { 0%{opacity:0.7;transform:translateY(0) scaleX(1)} 100%{opacity:0;transform:translateY(-12px) scaleX(0.4)} }
  @keyframes potion-bubble { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
  @keyframes book-flip { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(5deg)} }
  @keyframes gem-pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
  @keyframes wand-swing { 0%,100%{transform:rotate(-20deg)} 50%{transform:rotate(20deg)} }
`;

// ── 스타듀밸리 슬라임 캐릭터 (16x16 픽셀 기반) ────────────────────────

/** 5층: 보라색 슬라임 대마법사 - 마법 가마솥 */
function OrchestratorRoom({ isWorking }: { isWorking: boolean }) {
  return (
    <g>
      {/* 방 배경 - 어두운 나무 */}
      <rect x="0" y="0" width="44" height="44" fill="#3E2723"/>
      
      {/* 마법 가마솥 */}
      <g style={{animation: isWorking ? 'potion-bubble 1s ease-in-out infinite' : 'slime-bounce 3s ease-in-out infinite'}}>
        <rect x="28" y="28" width="12" height="6" fill="#5D4037"/>
        <rect x="26" y="26" width="16" height="4" fill="#8D6E63"/>
        <ellipse cx="32" cy="26" rx="8" ry="2" fill="#212121"/>
        <ellipse cx="32" cy="26" rx="6" ry="1.5" fill={isWorking ? '#9C27B0' : '#7B1FA2'}/>
      </g>
      
      {/* 증기 */}
      {isWorking && [30, 34, 38].map((x, i) => (
        <rect key={i} x={x-1} y={16} width="2" height="6" fill="#CE93D8" opacity="0.6"
          style={{animation:`steam-rise ${0.6+i*0.2}s ease-out infinite`}}/>
      ))}
      
      {/* 보라색 슬라임 대마법사 */}
      <ellipse cx="16" cy="16" rx="8" ry="7" fill="#9370DB"/>
      <ellipse cx="16" cy="14" rx="6" ry="5" fill="#9370DB"/>
      <rect x="14" y="12" width="4" height="2" fill="#4A148C"/>
      <rect x="13" y="16" width="6" height="1" fill="#4A148C"/>
      
      {/* 지팡이 - Working 시 휘두름 */}
      <g style={{transformOrigin:'26px 8px', animation: isWorking ? 'wand-swing 1.2s ease-in-out infinite' : 'none'}}>
        <rect x="24" y="4" width="2" height="10" fill="#8D6E63"/>
        <rect x="22" y="2" width="6" height="4" fill="#FFD54F"/>
      </g>
    </g>
  );
}

/** 4층: 초록색 슬라임 백마법사 - 치유 차 */
function DeveloperRoom({ isWorking }: { isWorking: boolean }) {
  return (
    <g>
      {/* 방 배경 - 나무 */}
      <rect x="0" y="0" width="44" height="44" fill="#5D4037"/>
      
      {/* 차 주전기 */}
      <g style={{animation: isWorking ? 'potion-bubble 1.2s ease-in-out infinite' : 'slime-bounce 4s ease-in-out infinite'}}>
        <rect x="12" y="28" width="20" height="6" fill="#5D4037"/>
        <ellipse cx="22" cy="28" rx="10" ry="3" fill={isWorking ? '#4CAF50' : '#8BC34A'}/>
      </g>
      
      {/* 증기 */}
      {isWorking && [16, 22, 28].map((x, i) => (
        <rect key={i} x={x-1} y={20} width="2" height="5" fill="#C8E6C9" opacity="0.5"
          style={{animation:`steam-rise ${0.5+i*0.1}s ease-out infinite`}}/>
      ))}
      
      {/* 초록색 슬라임 백마법사 */}
      <ellipse cx="22" cy="16" rx="8" ry="7" fill="#8BC34A"/>
      <ellipse cx="22" cy="14" rx="6" ry="5" fill="#8BC34A"/>
      <rect x="20" y="12" width="4" height="2" fill="#388E3C"/>
      <rect x="19" y="16" width="6" height="1" fill="#388E3C"/>
    </g>
  );
}

/** 3층: 파란 슬라임 연금술사 - 포션 */
function AnalyzerRoom({ isWorking }: { isWorking: boolean }) {
  return (
    <g>
      {/* 방 배경 - 어두운 초록 */}
      <rect x="0" y="0" width="44" height="44" fill="#2E7D32"/>
      
      {/* 포션 플라스크 */}
      <g style={{animation: isWorking ? 'potion-bubble 1.5s ease-in-out infinite' : 'slime-bounce 3s ease-in-out infinite'}}>
        <ellipse cx="22" cy="32" rx="7" ry="4" fill="#3E2723" stroke="#4CAF50" strokeWidth="1"/>
        <rect x="18" y="18" width="8" height="14" fill={isWorking ? '#4CAF50' : '#8BC34A'}/>
      </g>
      
      {/* 포션 병들 */}
      <rect x="6" y="6" width="3" height="6" fill="#F44336"/><rect x="12" y="6" width="3" height="6" fill="#4CAF50"/><rect x="18" y="6" width="3" height="6" fill="#2196F3"/>
      
      {/* 파란 슬라임 연금술사 */}
      <ellipse cx="30" cy="14" rx="7" ry="6" fill="#4FC3F7"/>
      <ellipse cx="30" cy="12" rx="5" ry="5" fill="#4FC3F7"/>
      <rect x="28" y="10" width="4" height="2" fill="#0277BD" opacity="0.7"/>
    </g>
  );
}

/** 2층: 빨간 슬라임 사서 - 책 */
function LibrarianRoom({ isWorking }: { isWorking: boolean }) {
  return (
    <g>
      {/* 방 배경 - 갈색 */}
      <rect x="0" y="0" width="44" height="44" fill="#8D6E63"/>
      
      {/* 책장 */}
      <rect x="2" y="2" width="6" height="40" fill="#5D4037"/>
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x="3" y={3+i*7} width="4" height="6"
          fill={['#CD5C5C','#4FC3F7','#8BC34A','#FFD700','#FF8F00','#9370DB'][i]}/>
      ))}
      
      {/* 책들 - Working 시 책 넘김 */}
      <g style={{animation: isWorking ? 'book-flip 2s ease-in-out infinite' : 'slime-bounce 3s ease-in-out infinite'}}>
        <rect x="14" y="16" width="6" height="10" fill="#CD5C5C"/>
        <rect x="22" y="20" width="6" height="8" fill="#4FC3F7"/>
      </g>
      
      {/* 빨간 슬라임 사서 */}
      <ellipse cx="32" cy="14" rx="7" ry="6" fill="#EF5350"/>
      <ellipse cx="32" cy="12" rx="5" ry="5" fill="#EF5350"/>
      <rect x="30" y="10" width="4" height="2" fill="#C62828" opacity="0.7"/>
    </g>
  );
}

/** 지하실: 보라 슬라임 흑마법사 - 어둠 연구 */
function DebuggerRoom({ isWorking }: { isWorking: boolean }) {
  return (
    <g>
      {/* 방 배경 - 검은 돌 */}
      <rect x="0" y="0" width="44" height="44" fill="#1A0000"/>
      
      {/* 돌 타일 */}
      <rect x="0" y="0" width="22" height="22" fill="#222"/><rect x="22" y="0" width="22" height="22" fill="#333"/>
      <rect x="0" y="22" width="22" height="22" fill="#333"/><rect x="22" y="22" width="22" height="22" fill="#222"/>
      
      {/* 어둠 결정 - Working 시 빛나임 */}
      <g style={{transformOrigin:'32px 12px', animation: isWorking ? 'gem-pulse 1.5s ease-in-out infinite' : 'slime-bounce 4s ease-in-out infinite'}}>
        <polygon points="28,8 34,12 28,16 22,12" fill="#000"/>
        <polygon points="34,12 38,16 34,20 30,16" fill={isWorking ? '#9C27B0' : '#4A148C'}/>
      </g>
      
      {/* 보라 슬라임 흑마법사 */}
      <ellipse cx="16" cy="20" rx="8" ry="7" fill="#9370DB"/>
      <ellipse cx="16" cy="18" rx="6" ry="5" fill="#9370DB"/>
      <rect x="14" y="16" width="4" height="2" fill="#4A148C"/>
    </g>
  );
}

const ROOM_COMPONENTS: Record<string, React.ComponentType<{isWorking:boolean}>> = {
  orchestrator: OrchestratorRoom,
  developer: DeveloperRoom,
  'knowledge-analyzer': AnalyzerRoom,
  'document-processor': LibrarianRoom,
  debugger: DebuggerRoom,
};

const FLOOR_COLORS = [
  { id: 'orchestrator',         label: '대마법사',  sublabel: 'Archmage',   roomColor: '#3E2723', windowGlow: '#9370DB' },
  { id: 'developer',            label: '백마법사',  sublabel: 'White Mage', roomColor: '#5D4037', windowGlow: '#8BC34A' },
  { id: 'knowledge-analyzer',  label: '연금술사',  sublabel: 'Alchemist',  roomColor: '#2E7D32', windowGlow: '#4FC3F7' },
  { id: 'document-processor',  label: '사서',     sublabel: 'Librarian',   roomColor: '#8D6E63', windowGlow: '#EF5350' },
  { id: 'debugger',            label: '흑마법사',  sublabel: 'Dark Mage',  roomColor: '#1A0000', windowGlow: '#9370DB' },
];

const IDLE_MSGS: Record<string, string> = {
  orchestrator: '마법 가마솥 옆에서 수프 끓이는 중 💜',
  developer: '차를 우려내는 중 🍵',
  'knowledge-analyzer': '포션을 손질하는 중 💧',
  'document-processor': '책장을 정돌하는 중 📚',
  debugger: '어둠의 결정을 연구하는 중 🌑',
};

const WORKING_MSGS: Record<string, string> = {
  orchestrator: '지팡이로 마법을 외치는 중! ⚡',
  developer: '치유 주문을 외치는 중! 💚',
  'knowledge-analyzer': '포션을 혼합하는 중! 🔬',
  'document-processor': '책을 뒤지는 중! 📖',
  debugger: '검은 마법으로 치료하는 중! 🩸',
};

export default function WizardTower({ agents }: WizardTowerProps) {
  const agentMap = new Map(agents.map(a => [a.id, a]));
  const workingCount = agents.filter(a => a.status === 'working').length;

  return (
    <div className="relative w-full select-none">
      <style>{ANIMATION_STYLES}</style>

      <div className="relative bg-gradient-to-b from-[#050510] via-[#0D0820] to-[#1A0A2E] rounded-t-xl pt-3 pb-0 px-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-purple-300 text-[10px] font-bold tracking-widest">🏰 Wizard Tower</span>
          <span className={`text-[9px] px-2 py-0.5 rounded-full ${workingCount > 0 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-800 text-gray-400'}`}>
            {workingCount > 0 ? `⚡ ${workingCount} WORKING` : '🌙 ALL IDLE'}
          </span>
        </div>
      </div>

      <div className="relative bg-gradient-to-b from-[#1A0A2E] to-[#0D0820]">
        <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#2A1A3A] to-[#1A0A2E]"
          style={{backgroundImage:'repeating-linear-gradient(180deg, #2A1A3A 0px, #2A1A3A 14px, #1E0E2E 14px, #1E0E2E 16px)'}}/>
        <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#2A1A3A] to-[#1A0A2E]"
          style={{backgroundImage:'repeating-linear-gradient(180deg, #2A1A3A 0px, #2A1A3A 14px, #1E0E2E 14px, #1E0E2E 16px)'}}/>

        {FLOOR_COLORS.map(({ id, label, sublabel, roomColor, windowGlow }) => {
          const agent = agentMap.get(id);
          const RoomComp = ROOM_COMPONENTS[id];
          const isWorking = agent?.status === 'working';
          const isBasement = id === 'debugger';
          const taskMsg = agent?.currentTask || (isWorking ? WORKING_MSGS[id] : IDLE_MSGS[id]);

          return (
            <div key={id} className="relative mx-6">
              <div className="h-px bg-gradient-to-r from-transparent via-purple-800/50 to-transparent"/>
              {isBasement && (
                <div className="flex items-center gap-2 py-0.5">
                  <div className="flex-1 h-px bg-gray-700"/>
                  <span className="text-[8px] text-gray-500 px-2">지하실</span>
                  <div className="flex-1 h-px bg-gray-700"/>
                </div>
              )}

              <div className="relative flex items-stretch gap-0" style={{ minHeight: 100 }}>
                <div className="flex-1 relative overflow-hidden rounded-sm"
                  style={{ background: roomColor }}>
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ boxShadow: `inset 0 0 20px ${windowGlow}22` }}/>
                  <svg
                    viewBox="0 0 44 44"
                    className="w-full"
                    style={{ minHeight: 90 }}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {RoomComp && <RoomComp isWorking={isWorking}/>}
                  </svg>
                </div>

                <div className="w-28 flex flex-col justify-center px-2 py-2 gap-1"
                  style={{ background: `${roomColor}CC` }}>
                  <div>
                    <div className="text-white text-[11px] font-bold leading-tight">{label}</div>
                    <div className="text-gray-500 text-[9px] font-mono">{sublabel}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      isWorking ? 'bg-yellow-400 animate-pulse' :
                      agent?.status === 'completed' ? 'bg-green-400' : 'bg-gray-600'
                    }`}/>
                    <span className={`text-[8px] ${isWorking ? 'text-yellow-300' : agent?.status === 'completed' ? 'text-green-300' : 'text-gray-500'}`}>
                      {isWorking ? 'working' : agent?.status === 'completed' ? 'done' : 'idle'}
                    </span>
                  </div>
                  <div className={`text-[8px] leading-snug px-2 py-1.5 rounded-lg rounded-tl-none border ${
                    isWorking
                      ? 'bg-yellow-900/40 border-yellow-600/30 text-yellow-200'
                      : 'bg-white/5 border-white/10 text-gray-500 italic'
                  }`}>
                    {taskMsg}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-3 bg-gradient-to-b from-[#2A1A3A] to-[#1A0A2E] rounded-b-xl"
        style={{backgroundImage:'repeating-linear-gradient(90deg, #2A1A3A 0px, #2A1A3A 18px, #1E0E2E 18px, #1E0E2E 20px)'}}/>
    </div>
  );
}