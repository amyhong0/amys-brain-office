'use client';

import React, { useCallback, useState, useEffect, useMemo } from 'react';
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
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface KnowledgeGraphProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick?: (node: Node) => void;
}

// Obsidian-ish palette
const PALETTE = ['#f87171', '#60a5fa', '#a78bfa', '#fb923c', '#34d399', '#facc15'];

function resolveColor(type?: string, index = 0): string {
  if (type === 'pdf') return '#60a5fa';
  if (type === 'image') return '#fb923c';
  return PALETTE[index % PALETTE.length];
}

// ── Node: plain colored circle + centered label ──────────────────
function ObsidianNode({ data, selected }: NodeProps) {
  const type = (data?.type as string) || 'default';
  const idx = (data?.metadata as { idx?: number })?.idx ?? 0;
  const color = resolveColor(type, idx);
  const title = ((data?.metadata as { title?: string })?.title || data?.label || '') + '';
  const short = title.length > 8 ? title.slice(0, 8) + '…' : title;

  return (
    <div
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: 40,
        height: 40,
        background: `radial-gradient(circle at 35% 35%, ${color}44, ${color}18)`,
        border: `1.5px solid ${color}aa`,
        color,
        fontSize: 8,
        fontWeight: 600,
        textAlign: 'center',
        lineHeight: 1.1,
        boxShadow: selected ? `0 0 0 2px ${color}55, 0 0 14px ${color}22` : `0 0 8px ${color}18`,
      }}
    >
      {!short ? null : (
        <span
          style={{
            color: '#e2e8f0',
            textShadow: '0 0 4px rgba(0,0,0,0.9)',
            padding: 4,
            wordBreak: 'break-all',
          }}
        >
          {short}
        </span>
      )}

      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

// ── Modal: minimal dark panel ─────────────────────────────────────
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

// ── Positions: scatter with preserved idx coloring ────────────────
function generateObsidianPositions(nodes: Node[]): Node[] {
  return nodes.map((node, index) => {
    const angle = (index * Math.PI * 2) / nodes.length;
    const radius = 160 + Math.random() * 80;
    const centerX = 300;
    const centerY = 240;

    const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 40;
    const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 40;

    return {
      ...node,
      position: { x, y },
      data: { ...node.data, metadata: { ...(node.data?.metadata || {}), idx: index } },
      type: 'obsidianNode',
    };
  });
}

// ── Main ──────────────────────────────────────────────────────────
export default function KnowledgeGraph({ nodes: propNodes, edges: propEdges, onNodeClick }: KnowledgeGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

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

  const nodeTypes = useMemo(() => ({ obsidianNode: ObsidianNode }), []);

  useEffect(() => {
    setNodes(generateObsidianPositions(propNodes));
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
        fitView
        minZoom={0.5}
        maxZoom={2.5}
        defaultEdgeOptions={{
          type: 'straight',
          style: { stroke: 'rgba(148, 163, 184, 0.1)', strokeWidth: 1 },
          animated: false,
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

      <AnimatePresence>
        {selectedNode && selectedNode.data?.metadata ? (
          <KnowledgeDetailModal node={selectedNode} onClose={() => setSelectedNode(null)} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}