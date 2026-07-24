'use client';

import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
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

const PALETTE = ['#f87171', '#60a5fa', '#a78bfa', '#fb923c', '#34d399', '#facc15'];

function resolveColor(type?: string, index = 0): string {
  if (type === 'pdf') return '#60a5fa';
  if (type === 'image') return '#fb923c';
  return PALETTE[index % PALETTE.length];
}

// ── Force-directed-ish positioning ────────────────────────────────
function layoutNodes(nodes: Node[], edges: Edge[]): Node[] {
  const positions = new Map<string, { x: number; y: number }>();
  const intensities = new Map<string, number>();

  // Initialize positions in a circle
  nodes.forEach((node, i) => {
    const angle = (i * Math.PI * 2) / nodes.length;
    positions.set(node.id, {
      x: 300 + Math.cos(angle) * 160,
      y: 220 + Math.sin(angle) * 160,
    });
    intensities.set(node.id, 0);
  });

  // Simple force simulation
  for (let iter = 0; iter < 60; iter++) {
    const forces = new Map<string, { x: number; y: number }>();
    nodes.forEach((n) => forces.set(n.id, { x: 0, y: 0 }));

    // Repulsion between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = positions.get(nodes[i].id)!;
        const b = positions.get(nodes[j].id)!;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 2500 / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        forces.set(nodes[i].id, { x: forces.get(nodes[i].id)!.x - fx, y: forces.get(nodes[i].id)!.y - fy });
        forces.set(nodes[j].id, { x: forces.get(nodes[j].id)!.x + fx, y: forces.get(nodes[j].id)!.y + fy });
      }
    }

    // Attraction along edges
    edges.forEach((edge) => {
      const a = positions.get(edge.source);
      const b = positions.get(edge.target);
      if (!a || !b) return;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - 120) * 0.04;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      forces.set(edge.source, { x: forces.get(edge.source)!.x + fx, y: forces.get(edge.source)!.y + fy });
      forces.set(edge.target, { x: forces.get(edge.target)!.x - fx, y: forces.get(edge.target)!.y - fy });
    });

    // Center gravity + integrate
    positions.forEach((pos, id) => {
      const f = forces.get(id)!;
      const v = 0.08;
      pos.x += f.x * v + (300 - pos.x) * 0.005;
      pos.y += f.y * v + (220 - pos.y) * 0.005;
    });
  }

  return nodes.map((node) => ({
    ...node,
    position: positions.get(node.id) || node.position,
  }));
}

// ── Animated Mindmap Node ─────────────────────────────────────────
function MindmapNode({ data, selected }: NodeProps) {
  const type = (data?.type as string) || 'default';
  const idx = (data?.metadata as { idx?: number })?.idx ?? 0;
  const color = resolveColor(type, idx);
  const title = ((data?.metadata as { title?: string })?.title || data?.label || '') + '';
  const short = title.length > 6 ? title.slice(0, 6) + '…' : title;

  return (
    <div className="relative flex items-center justify-center">
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />

      <motion.div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: 44,
          height: 44,
          background: `radial-gradient(circle at 35% 35%, ${color}33, ${color}11)`,
          border: `1.5px solid ${color}88`,
          boxShadow: selected
            ? `0 0 0 2px ${color}55, 0 0 20px ${color}33`
            : `0 0 10px ${color}22`,
          cursor: 'pointer',
        }}
        animate={selected ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* inner core */}
        <div
          className="rounded-full"
          style={{
            width: '45%',
            height: '45%',
            background: `radial-gradient(circle, ${color}cc, ${color}44)`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </motion.div>

      {/* label below */}
      <div
        className="absolute whitespace-nowrap text-[8px] font-semibold tracking-wide pointer-events-none"
        style={{
          top: 'calc(100% + 3px)',
          left: '50%',
          transform: 'translateX(-50%)',
          color: selected ? '#f1f5f9' : '#cbd5e1',
          textShadow: '0 0 6px rgba(0,0,0,0.95)',
        }}
      >
        {short}
      </div>
    </div>
  );
}

// ── Animated Edge ─────────────────────────────────────────────────
function AnimatedEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
}: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  style?: React.CSSProperties;
  markerEnd?: any;
}) {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: sourceX,
        top: sourceY,
        width: length,
        height: 1.2,
        transformOrigin: '0 50%',
        transform: `rotate(${angle}deg)`,
        opacity: 0.35,
        ...style,
      }}
    >
      <motion.div
        className="w-full h-full rounded-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${(style?.stroke as string) || 'rgba(148,163,184,0.4)'}, transparent)`,
          boxShadow: `0 0 6px ${(style?.stroke as string) || 'rgba(148,163,184,0.2)'}`,
        }}
        animate={{
          opacity: [0.15, 0.6, 0.15],
          scaleX: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

// ── Summary Panel (DeepSeek-style side panel) ────────────────────
function SummaryPanel({ nodes, edges, onClose }: { nodes: Node[]; edges: Edge[]; onClose: () => void }) {
  const topNodes = useMemo(() => {
    return [...nodes]
      .sort((a, b) => ((b.data?.metadata as any)?.tags?.length || 0) - ((a.data?.metadata as any)?.tags?.length || 0))
      .slice(0, 5);
  }, [nodes]);

  const topEdges = useMemo(() => {
    return [...edges]
      .sort((a, b) => ((b.data?.strength as number) || 0) - ((a.data?.strength as number) || 0))
      .slice(0, 5);
  }, [edges]);

  return (
    <motion.div
      className="absolute right-4 top-4 z-20 w-64 max-h-[520px] overflow-y-auto rounded-xl p-4"
      style={{
        background: 'linear-gradient(180deg, rgba(15,15,25,0.95), rgba(10,10,20,0.95))',
        border: '1px solid rgba(148,163,184,0.1)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-slate-200 text-xs font-bold tracking-wide">MIND MAP</div>
          <div className="text-[10px] text-slate-500">DeepSeek-style summary</div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1 rounded-md hover:bg-slate-800/50 transition-colors">✕</button>
      </div>

      <div className="mb-3">
        <div className="text-[10px] text-slate-500 mb-1.5">핵심 노드</div>
        <div className="space-y-1.5">
          {topNodes.map((node, i) => {
            const color = resolveColor(node.data?.type as string, (node.data?.metadata as { idx?: number })?.idx ?? i);
            const title = (node.data?.metadata as { title?: string })?.title || (node.data?.label as string) || 'Node';
            return (
              <div key={node.id} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}66` }} />
                <div className="text-[10px] text-slate-400 truncate">{title}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-[10px] text-slate-500 mb-1.5">주요 연결</div>
        <div className="space-y-1.5">
          {topEdges.map((edge, i) => (
            <div key={edge.id || i} className="text-[10px] text-slate-500 flex items-center gap-1">
              <span className="text-slate-600">↔</span>
              <span className="text-slate-400">strength: {(edge.data?.strength as number) || 1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-700/40">
        <div className="text-[10px] text-slate-500 leading-relaxed">
          총 {nodes.length}개 노드, {edges.length}개 연결
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          그래프는 force-directed 방식으로 배치됩니다.
        </div>
      </div>
    </motion.div>
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
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        className="max-w-md w-full max-h-[80vh] overflow-y-auto rounded-xl p-5"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 15, 25, 0.98), rgba(10, 10, 20, 0.98))',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${resolveColor(metadata?.type, 0)}aa, ${resolveColor(metadata?.type, 0)}44)`,
            }}
          >
            {metadata?.type === 'pdf' ? '📄' : metadata?.type === 'image' ? '🖼️' : '🌐'}
          </div>
          <div>
            <h3 className="text-slate-100 font-bold text-sm">{metadata?.title || node.data?.label || 'Untitled'}</h3>
            <span className="text-[10px] text-slate-400">{metadata?.type ? typeLabels[metadata.type] : '문서'}</span>
          </div>
        </div>

        {metadata?.tags && metadata.tags.length > 0 && (
          <div className="mb-3">
            <span className="text-[10px] text-slate-500 mb-1 block">태그:</span>
            <div className="flex flex-wrap gap-1">
              {metadata.tags.map((tag, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-300 border border-slate-600/30">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {metadata?.createdAt && (
          <div className="text-[10px] text-slate-500 mb-2">
            생성일: {metadata.createdAt}
          </div>
        )}

        {metadata?.url && (
          <div className="text-[10px] text-sky-400/80 mb-2 break-all">
            <a href={metadata.url} target="_blank" rel="noopener noreferrer" className="hover:text-sky-300 transition-colors">
              🔗 {metadata.url}
            </a>
          </div>
        )}

        <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-700/50 whitespace-pre-wrap leading-relaxed">
          {knowledgeContent}
        </div>

        <button
          onClick={onClose}
          className="mt-4 px-4 py-1.5 rounded-full bg-slate-700/40 text-slate-200 text-[11px] hover:bg-slate-600/40 transition-all border border-slate-600/30"
        >
          닫기
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function KnowledgeGraph({ nodes: propNodes, edges: propEdges, onNodeClick }: KnowledgeGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showSummary, setShowSummary] = useState(false);

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

  const nodeTypes = useMemo(() => ({ mindmapNode: MindmapNode }), []);
  const edgeTypes = useMemo(() => ({ animatedEdge: AnimatedEdge as any }), []);

  useEffect(() => {
    const positioned = layoutNodes(propNodes, propEdges);
    const withIdx = positioned.map((node, idx) => ({
      ...node,
      data: { ...node.data, metadata: { ...(node.data?.metadata || {}), idx } },
      type: 'mindmapNode',
    }));
    setNodes(withIdx);
    setEdges(propEdges);
  }, [propNodes, propEdges, setNodes]);

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
    <div className="relative w-full h-[550px] rounded-xl overflow-hidden bg-[#0a0a0f]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.5}
        maxZoom={2.5}
        defaultEdgeOptions={{
          type: 'animatedEdge',
          style: { stroke: 'rgba(148, 163, 184, 0.25)', strokeWidth: 1 },
          animated: true,
        }}
        connectionLineStyle={{ stroke: 'rgba(148, 163, 184, 0.1)', strokeWidth: 1 }}
      >
        <Background color="rgba(148, 163, 184, 0.03)" gap={35} size={0.4} />
        <Controls
          style={{
            backgroundColor: 'rgba(15, 15, 25, 0.9)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '6px',
            color: '#cbd5e1',
          }}
        />
        <MiniMap
          style={{
            backgroundColor: 'rgba(15, 15, 25, 0.9)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '6px',
          }}
          maskColor="rgba(0, 0, 0, 0.6)"
          nodeColor={(node) => resolveColor(node.data?.type as string, (node.data?.metadata as { idx?: number })?.idx ?? 0)}
          nodeStrokeWidth={1}
        />
      </ReactFlow>

      {/* Toggle summary panel */}
      <motion.button
        className="absolute right-4 top-4 z-20 px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide bg-slate-900/80 text-slate-300 border border-slate-700/50 hover:bg-slate-800/80 transition-colors"
        onClick={() => setShowSummary((v) => !v)}
      >
        {showSummary ? '요약 닫기' : '요약 열기'}
      </motion.button>

      <AnimatePresence>
        {showSummary && (
          <SummaryPanel nodes={nodes} edges={edges} onClose={() => setShowSummary(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedNode && selectedNode.data?.metadata ? (
          <KnowledgeDetailModal node={selectedNode} onClose={() => setSelectedNode(null)} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}