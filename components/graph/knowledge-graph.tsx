'use client';

import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeProps,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface KnowledgeGraphProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick?: (node: Node) => void;
}

function getNodeColor(type: string): string {
  const colors: Record<string, string> = {
    pdf: '#60a5fa',
    web: '#34d399',
    image: '#fbbf24',
    default: '#8b5cf6',
  };
  return colors[type] || colors.default;
}

// ── Custom Node Component ──────────────────────────────────────────
function KnowledgeNode({ data, selected }: NodeProps) {
  const type = (data?.type as string) || 'default';
  const tags = (data?.metadata as { tags?: string[] })?.tags || [];
  const tagCount = tags.length || 1;
  const size = Math.max(14, Math.min(24, 12 + tagCount * 2));
  const color = getNodeColor(type);
  const label = (data?.label as string) || '';
  const title = (data?.metadata as { title?: string })?.title || label;

  return (
    <div className="relative flex items-center justify-center">
      {/* 우주 별빛 glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: size + 16,
          height: size + 16,
          background: `radial-gradient(circle, ${color}22, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* 메인 노드 (행성) */}
      <div
        className="relative rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 35% 35%, ${color}ee, ${color}88)`,
          boxShadow: selected
            ? `0 0 20px ${color}aa, 0 0 40px ${color}44`
            : `0 0 12px ${color}66, inset 0 0 8px ${color}44`,
          border: selected ? `2px solid ${color}cc` : '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
        }}
      >
        {/* 행성 표면 디테일 */}
        <div
          className="absolute rounded-full opacity-30"
          style={{
            width: '40%',
            height: '40%',
            top: '15%',
            left: '20%',
            background: `radial-gradient(circle, ${color}88, transparent)`,
          }}
        />
      </div>

      {/* 연결 핸들 */}
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

// ── Starfield Background ──────────────────────────────────────────
function Starfield() {
  const stars = useMemo(() => {
    return Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 3 + 1,
      delay: Math.random() * 3,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [star.opacity * 0.3, star.opacity, star.opacity * 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: star.speed,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* 은하수 흐림 효과 */}
      <div
        className="absolute w-[80%] h-[60%] opacity-[0.04] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, #8b5cf6, #3b82f6, transparent)',
          top: '20%',
          left: '10%',
        }}
      />
      <div
        className="absolute w-[60%] h-[40%] opacity-[0.03] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, #06b6d4, #10b981, transparent)',
          bottom: '10%',
          right: '5%',
        }}
      />
    </div>
  );
}

// ── Custom Edge ───────────────────────────────────────────────────
function GlowingEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
}: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  style?: React.CSSProperties;
}) {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: sourceX,
        top: sourceY,
        width: length,
        height: 1,
        transformOrigin: '0 0',
        transform: `rotate(${angle}deg)`,
        ...style,
      }}
    >
      <div
        className="w-full h-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${(style?.stroke as string) || 'rgba(139, 92, 246, 0.4)'}, transparent)`,
          boxShadow: `0 0 6px ${(style?.stroke as string) || 'rgba(139, 92, 246, 0.2)'}`,
        }}
      />
    </div>
  );
}

// ── Knowledge Detail Modal ─────────────────────────────────────────
function KnowledgeDetailModal({ node, onClose }: { node: Node; onClose: () => void }) {
  const metadata = node.data?.metadata as {
    title?: string;
    tags?: string[];
    type?: string;
    createdAt?: string;
    url?: string;
    content?: string;
  } | undefined;

  const typeLabels: Record<string, string> = {
    pdf: 'PDF 문서',
    web: '웹 문서',
    image: '이미지',
    default: '문서',
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const knowledgeContent = metadata?.content ||
    `${metadata?.title || '지식'}에 대한 상세 내용입니다.\n\n이 지식은 ${metadata?.createdAt || '알 수 없는 시점'}에 수집되었습니다.\n태그: ${metadata?.tags?.join(', ') || '없음'}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="max-w-md w-full max-h-[80vh] overflow-y-auto rounded-xl p-5"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 5, 30, 0.97), rgba(5, 2, 20, 0.97))',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 0 60px rgba(139, 92, 246, 0.1), inset 0 0 60px rgba(139, 92, 246, 0.03)',
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* 행성 아이콘 */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${getNodeColor(metadata?.type || 'default')}aa, ${getNodeColor(metadata?.type || 'default')}44)`,
              boxShadow: `0 0 20px ${getNodeColor(metadata?.type || 'default')}44`,
            }}
          >
            {metadata?.type === 'pdf' ? '📄' : metadata?.type === 'image' ? '🖼️' : '🌐'}
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">{metadata?.title || node.data?.label || 'Untitled'}</h3>
            <span className="text-[10px] text-purple-300">{metadata?.type ? typeLabels[metadata.type] : '문서'}</span>
          </div>
        </div>

        {metadata?.tags && metadata.tags.length > 0 && (
          <div className="mb-3">
            <span className="text-[10px] text-gray-500 mb-1 block">태그:</span>
            <div className="flex flex-wrap gap-1">
              {metadata.tags.map((tag, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/20">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {metadata?.createdAt && (
          <div className="text-[10px] text-gray-500 mb-2 flex items-center gap-1">
            <span className="text-purple-400">✦</span> 생성일: {metadata.createdAt}
          </div>
        )}

        {metadata?.url && (
          <div className="text-[10px] text-blue-400/80 mb-2 break-all">
            <a href={metadata.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">
              🔗 {metadata.url}
            </a>
          </div>
        )}

        <div className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-purple-900/30 whitespace-pre-wrap leading-relaxed">
          {knowledgeContent}
        </div>

        <button
          onClick={onClose}
          className="mt-4 px-4 py-1.5 rounded-full bg-purple-600/20 text-white text-[11px] hover:bg-purple-600/40 transition-all border border-purple-500/20"
        >
          닫기
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Generate positions ────────────────────────────────────────────
function generateObsidianPositions(nodes: Node[]): Node[] {
  return nodes.map((node, index) => {
    const type = (node.data?.type as string) || 'default';
    const tags = (node.data?.metadata as { tags?: string[] })?.tags || [];
    const tagCount = tags.length || 1;
    const size = Math.max(14, Math.min(24, 12 + tagCount * 2));

    const angle = (index * Math.PI * 2) / nodes.length;
    const radius = 120 + Math.random() * 100;
    const centerX = 300;
    const centerY = 220;

    const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 60;
    const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 60;

    return {
      ...node,
      position: { x, y },
      style: { width: size, height: size },
      data: {
        ...node.data,
        label: (node.data?.label as string) || 'Node',
        type,
      },
      type: 'knowledgeNode',
    };
  });
}

// ── Main Component ────────────────────────────────────────────────
export default function KnowledgeGraph({ nodes: propNodes, edges: propEdges, onNodeClick }: KnowledgeGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const findKnowledgeContent = async (nodeId: string, docId: string) => {
    try {
      const response = await fetch(`/api/knowledge?id=${docId}`);
      if (response.ok) {
        const data = await response.json();
        return data.documents?.find((d: { id: string }) => d.id === docId);
      }
    } catch (error) {
      console.error('Failed to load knowledge content:', error);
    }
    return null;
  };

  // Custom edge styles for space theme
  const styledEdges = useMemo(() => {
    return propEdges.map((edge) => {
      const strength = (edge.data?.strength as number) || 1;
      const opacity = Math.min(0.3 + strength * 0.1, 0.7);
      const strokeWidth = Math.min(0.5 + strength * 0.3, 2);
      return {
        ...edge,
        style: {
          stroke: `rgba(139, 92, 246, ${opacity})`,
          strokeWidth,
          filter: `blur(0.5px)`,
        },
        animated: strength >= 3,
        type: 'smoothstep' as const,
      };
    });
  }, [propEdges]);

  useEffect(() => {
    setNodes(generateObsidianPositions(propNodes));
    setEdges(styledEdges);
  }, [propNodes, styledEdges, setNodes, setEdges]);

  const nodeTypes = useMemo(() => ({ knowledgeNode: KnowledgeNode }), []);

  const onNodeClickHandler = useCallback(
    async (event: React.MouseEvent, node: Node) => {
      const metadata = node.data?.metadata as { id?: string } | undefined;
      if (metadata?.id) {
        const doc = await findKnowledgeContent(node.id, metadata.id);
        if (doc) {
          node.data = { ...node.data, metadata: { ...metadata, ...doc } };
        }
      }
      setSelectedNode(node);
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  return (
    <div ref={containerRef} className="relative w-full h-[550px] rounded-xl overflow-hidden" style={{
      background: 'linear-gradient(135deg, #050510 0%, #0a0518 30%, #080820 60%, #050510 100%)',
    }}>
      {/* 우주 배경 */}
      <Starfield />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3}
        maxZoom={3}
        defaultEdgeOptions={{
          style: {
            stroke: 'rgba(139, 92, 246, 0.3)',
            strokeWidth: 1,
          },
          type: 'smoothstep',
        }}
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Background
          color="rgba(139, 92, 246, 0.03)"
          gap={40}
          size={0.3}
        />
        <Controls
          style={{
            backgroundColor: 'rgba(10, 5, 20, 0.9)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
        <MiniMap
          style={{
            backgroundColor: 'rgba(10, 5, 20, 0.9)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '8px',
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
          nodeColor={(node) => getNodeColor(node.data?.type as string)}
          nodeStrokeWidth={2}
        />
      </ReactFlow>

      {/* Full content modal */}
      <AnimatePresence>
        {selectedNode && selectedNode.data?.metadata ? (
          <KnowledgeDetailModal
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        ) : null}
      </AnimatePresence>

      {/* 우주 좌표 표시 */}
      <div className="absolute bottom-3 right-3 text-[9px] text-purple-500/40 font-mono pointer-events-none select-none">
        ◆ SPACE SECTOR
      </div>
    </div>
  );
}