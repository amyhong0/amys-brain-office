'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
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

// Generate Obsidian-style scattered positions
function generateObsidianPositions(nodes: Node[]): Node[] {
  return nodes.map((node, index) => {
    const type = (node.data?.type as string) || 'default';
    const tags = (node.data?.metadata as { tags?: string[] })?.tags || [];
    const tagCount = tags.length || 1;
    const size = Math.max(14, Math.min(24, 12 + tagCount * 2));
    const color = getNodeColor(type);

    // Force-directed style layout - scattered but organized
    const angle = (index * Math.PI * 2) / nodes.length;
    const radius = 120 + Math.random() * 100;
    const centerX = 250;
    const centerY = 200;
    
    const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 60;
    const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 60;

    return {
      ...node,
      position: { x, y },
      style: {
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}dd, ${color}99)`,
        border: 'none',
        borderRadius: '50%',
        boxShadow: `0 0 15px ${color}66`,
        color: '#fff',
        fontSize: '9px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
        cursor: 'pointer',
      },
      data: {
        ...node.data,
        label: (node.data?.label as string)?.substring(0, 10) || 'Node',
      },
    };
  });
}

// Knowledge Detail Modal - shows full content
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

  // ESC 키 처리
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Simulated knowledge base content
  const knowledgeContent = metadata?.content || 
    `${metadata?.title || '지식'}에 대한 상세 내용입니다.\n\n이 지식은 ${metadata?.createdAt || '알 수 없는 시점'}에 수집되었습니다.\n태그: ${metadata?.tags?.join(', ') || '없음'}\n\n더 자세한 내용은 실제 문서를 참조해주세요.`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
      onKeyDown={(e: React.KeyboardEvent) => e.key === 'Escape' && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="max-w-md w-full max-h-[80vh] overflow-y-auto rounded-xl p-5"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 15, 50, 0.95), rgba(20, 10, 40, 0.95))',
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-600/30 flex items-center justify-center text-lg">📄</div>
          <div>
            <h3 className="text-white font-bold">{metadata?.title || node.data?.label || 'Untitled'}</h3>
            <span className="text-[10px] text-purple-300">{metadata?.type ? typeLabels[metadata.type] : '문서'}</span>
          </div>
        </div>

        {metadata?.tags && metadata.tags.length > 0 && (
          <div className="mb-3">
            <span className="text-[10px] text-gray-400 mb-1 block">태그:</span>
            <div className="flex flex-wrap gap-1">
              {metadata.tags.map((tag, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-purple-500/30 text-purple-200">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {metadata?.createdAt && (
          <div className="text-[10px] text-gray-400 mb-2">
            생성일: {metadata.createdAt}
          </div>
        )}

        {metadata?.url && (
          <div className="text-[10px] text-blue-400 mb-2 break-all">
            <a href={metadata.url} target="_blank" rel="noopener noreferrer">🔗 {metadata.url}</a>
          </div>
        )}

        <div className="text-[11px] text-gray-300 mt-2 pt-2 border-t border-white/10 whitespace-pre-wrap">
          {knowledgeContent}
        </div>

        <button
          onClick={onClose}
          className="mt-4 px-4 py-1.5 rounded-lg bg-purple-600/30 text-white text-[11px] hover:bg-purple-600/50"
        >
          닫기
        </button>
      </motion.div>
    </motion.div>
  );
}

// 노드 hover 툴팁 컴포넌트
function NodeTooltip({ node, position }: { node: Node | null; position: { x: number; y: number } | null }) {
  if (!node || !position) return null;
  
  const metadata = node.data?.metadata as {
    title?: string;
    tags?: string[];
    type?: string;
    createdAt?: string;
  } | undefined;

  return (
    <div 
      className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
      style={{
        left: position.x,
        top: position.y - 10,
      }}
    >
      <div className="px-3 py-2 rounded-lg bg-slate-900/95 border border-purple-500/50 text-white text-xs max-w-xs mb-2">
        <div className="font-bold">{metadata?.title || node.data?.label || 'Untitled'}</div>
        <div className="text-[10px] text-purple-300 mt-1">{metadata?.createdAt && `📅 ${metadata.createdAt}`}</div>
        {metadata?.tags && metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {metadata.tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-[9px] bg-purple-500/30 px-1 rounded">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function KnowledgeGraph({ nodes: propNodes, edges: propEdges, onNodeClick }: KnowledgeGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 외부에서 전달받은 nodes에서 실제 지식 내용 찾기
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

  useEffect(() => {
    setNodes(generateObsidianPositions(propNodes));
    setEdges(propEdges);
  }, [propNodes, propEdges, setNodes, setEdges]);

  const onNodeClickHandler = useCallback(
    async (event: React.MouseEvent, node: Node) => {
      // 실제 지식 내용 가져오기
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

  const onNodeMouseEnter = useCallback((event: React.MouseEvent, node: Node) => {
    setHoveredNode(node);
    const target = event.target as HTMLElement;
    const nodeElement = target.closest('.react-flow__node');
    if (nodeElement && containerRef.current) {
      const nodeRect = nodeElement.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: nodeRect.left - containerRect.left + nodeRect.width / 2,
        y: nodeRect.top - containerRect.top
      });
    }
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
    setTooltipPosition(null);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[500px] rounded-lg overflow-hidden bg-[#0a0a0f]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClickHandler}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        fitView
        minZoom={0.3}
        maxZoom={3}
        defaultEdgeOptions={{
          style: { 
            stroke: 'rgba(139, 92, 246, 0.6)', 
            strokeWidth: 2,
          },
          type: 'straight',
        }}
        connectionLineStyle={{
          stroke: 'rgba(139, 92, 246, 0.4)',
          strokeWidth: 2,
        }}
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Background
          color="rgba(139, 92, 246, 0.05)"
          gap={30}
          size={0.5}
        />
        <Controls 
          style={{ 
            backgroundColor: 'rgba(10, 10, 15, 0.8)', 
            border: '1px solid rgba(139, 92, 246, 0.3)' 
          }}
        />
        <MiniMap
          style={{ backgroundColor: 'rgba(10, 10, 15, 0.9)' }}
          maskColor="rgba(0, 0, 0, 0.6)"
          nodeColor={(node) => getNodeColor(node.data?.type as string)}
          nodeStrokeWidth={3}
        />
      </ReactFlow>

      {/* Hover 툴팁 - 노드 옆에 표시 */}
      {hoveredNode && tooltipPosition && (
        <NodeTooltip node={hoveredNode} position={tooltipPosition} />
      )}

      {/* Full content modal - shown when clicking node */}
      <AnimatePresence>
        {selectedNode && selectedNode.data?.metadata ? (
          <KnowledgeDetailModal
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}