'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
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

// Generate cosmic/star-like scattered positions
function generateCosmicPositions(nodes: Node[]): Node[] {
  // Create star field distribution - random but within view
  return nodes.map((node, index) => {
    const type = (node.data?.type as string) || 'default';
    const tags = (node.data?.metadata as { tags?: string[] })?.tags || [];
    const tagCount = tags.length || 1;
    const size = Math.max(8, Math.min(16, 6 + tagCount * 2));
    const color = getNodeColor(type);

    // Scatter nodes in a cosmic pattern
    const angle = (index * Math.PI * 2) / nodes.length;
    const radius = 80 + Math.random() * 60;
    const centerX = 200;
    const centerY = 150;
    
    const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 30;
    const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 30;

    return {
      ...node,
      position: { x, y },
      style: {
        width: size * 2,
        height: size * 2,
        background: `radial-gradient(circle, ${color}cc, ${color}88)`,
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '50%',
        boxShadow: `0 0 8px ${color}66`,
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
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-600/30 flex items-center justify-center text-lg">
            📄
          </div>
          <div>
            <h3 className="text-white font-bold">{metadata?.title || node.data?.label || 'Untitled'}</h3>
            <span className="text-[10px] text-purple-300">{typeLabels[metadata?.type] || '문서'}</span>
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

export default function KnowledgeGraph({ nodes: propNodes, edges: propEdges, onNodeClick }: KnowledgeGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    setNodes(generateCosmicPositions(propNodes));
    setEdges(propEdges);
  }, []);

  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (selectedNode?.id === node.id) {
        // Clicking on already selected node - show details
        setSelectedNode(node);
      } else {
        // First click - select node (show title)
        setSelectedNode(node);
      }
    },
    [selectedNode]
  );

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden bg-[#020010]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClickHandler}
        fitView
        minZoom={0.3}
        maxZoom={3}
        defaultEdgeOptions={{
          style: { stroke: 'rgba(139, 92, 246, 0.3)', strokeWidth: 1 },
          type: 'straight',
        }}
      >
        <Background
          color="rgba(139, 92, 246, 0.05)"
          gap={30}
          size={1}
        />
        <Controls />
        <MiniMap
          style={{ backgroundColor: 'rgba(10, 5, 20, 0.8)' }}
        />
      </ReactFlow>

      {/* Selected node title displayed below graph */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 z-10">
          <div 
            className="px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/40 cursor-pointer hover:bg-purple-600/50 transition-colors"
            onClick={() => {
              const metadata = selectedNode.data?.metadata as { title?: string } | undefined;
              if (metadata?.title) {
                setSelectedNode(selectedNode); // Trigger modal to show
              }
            }}
          >
            <span className="text-white text-sm font-medium">
              {((selectedNode.data?.metadata as { title?: string })?.title) || (selectedNode.data?.label as string) || 'Untitled'}
            </span>
          </div>
        </div>
      )}

      {/* Full content modal - shown when clicking title */}
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