'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';

interface KnowledgeGraphProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick?: (node: Node) => void;
}

interface GraphNodeData {
  label: string;
  type?: string;
  metadata?: {
    title?: string;
    type?: string;
    tags?: string[];
    createdAt?: string;
    url?: string;
  };
  [key: string]: unknown;
}

// Obsidian-inspired color palette
const OBSIDIAN_COLORS = {
  bg: '#1a1a2e',
  node: {
    default: '#8b5cf6',
    pdf: '#60a5fa',
    web: '#34d399',
    image: '#fbbf24',
  },
  edge: {
    default: 'rgba(139, 92, 246, 0.2)',
    connected: 'rgba(167, 139, 250, 0.35)',
  },
};

function getNodeColor(type: string): string {
  const colorMap: Record<string, string> = {
    pdf: OBSIDIAN_COLORS.node.pdf,
    web: OBSIDIAN_COLORS.node.web,
    image: OBSIDIAN_COLORS.node.image,
    default: OBSIDIAN_COLORS.node.default,
  };
  return colorMap[type] || colorMap.default;
}

// Obsidian-style custom node component (small glowing dot)
function ObsidianNode({ data }: { data: GraphNodeData }) {
  const nodeColor = getNodeColor(data.type || 'default');
  const connectionCount = data.metadata?.tags?.length || 0;
  const size = Math.max(8, Math.min(20, 6 + connectionCount * 2));
  const label = data.metadata?.title || data.label || 'Untitled';
  const isSelected = data.selected === true;

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="rounded-full transition-all duration-300 ease-out cursor-pointer"
        style={{
          width: size * 2 + 'px',
          height: size * 2 + 'px',
          background: 'radial-gradient(circle at 35% 35%, ' + nodeColor + 'ee, ' + nodeColor + '88)',
          boxShadow: isSelected
            ? '0 0 20px ' + nodeColor + '88, 0 0 40px ' + nodeColor + '44, inset 0 0 8px rgba(255,255,255,0.15)'
            : '0 0 8px ' + nodeColor + '33, inset 0 0 4px rgba(255,255,255,0.06)',
          border: isSelected
            ? '2px solid ' + nodeColor
            : '1px solid rgba(255,255,255,0.06)',
          transform: isSelected ? 'scale(1.15)' : 'scale(1)',
        }}
      />
      <div
        className="absolute top-full mt-1.5 px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap transition-all duration-200 pointer-events-none"
        style={{
          background: 'rgba(26, 26, 46, 0.92)',
          color: nodeColor,
          border: '1px solid ' + nodeColor + '44',
          opacity: isSelected ? 1 : 0,
        }}
      >
        {label.length > 22 ? label.slice(0, 20) + '...' : label}
      </div>
    </div>
  );
}

const nodeTypes: NodeTypes = { obsidianNode: ObsidianNode };

export default function KnowledgeGraph({ nodes: initialNodes, edges: initialEdges, onNodeClick }: KnowledgeGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Find connected node IDs for highlight
  const connectedNodeIds = useMemo(() => {
    const activeId = hoveredNodeId || selectedNode?.id || null;
    if (!activeId) return new Set<string>();
    const connected = new Set<string>([activeId]);
    edges.forEach(edge => {
      if (edge.source === activeId) connected.add(edge.target);
      if (edge.target === activeId) connected.add(edge.source);
    });
    return connected;
  }, [hoveredNodeId, selectedNode, edges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(prev => prev?.id === node.id ? null : node);
      if (onNodeClick) onNodeClick(node);
    },
    [onNodeClick]
  );

  const onNodeMouseEnter = useCallback((event: React.MouseEvent, node: Node) => {
    setHoveredNodeId(node.id);
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  // Apply Obsidian-like styling to nodes
  const styledNodes = useMemo(() => {
    const activeId = hoveredNodeId || selectedNode?.id || null;
    return nodes.map((node) => {
      const isActive = connectedNodeIds.has(node.id);
      const isHighlighted = node.id === activeId;
      const connectionCount = node.data?.metadata?.tags?.length || 0;
      const size = Math.max(8, Math.min(20, 6 + connectionCount * 2));

      return {
        ...node,
        type: 'obsidianNode',
        style: {
          ...node.style,
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          padding: 0,
          width: size * 3 + 'px',
          height: size * 3 + 'px',
          opacity: activeId ? (isActive ? 1 : 0.15) : 0.85,
          transition: 'opacity 0.3s ease',
        },
        data: {
          ...node.data,
          type: node.data?.type || 'default',
          label: node.data?.label || '',
          metadata: node.data?.metadata || {},
          selected: isHighlighted,
        } as GraphNodeData,
      };
    });
  }, [nodes, connectedNodeIds, hoveredNodeId, selectedNode]);

  const styledEdges = useMemo(() => {
    const activeId = hoveredNodeId || selectedNode?.id || null;
    return edges.map((edge) => {
      const isConnected = activeId && (edge.source === activeId || edge.target === activeId);
      return {
        ...edge,
        animated: !!isConnected,
        style: {
          ...edge.style,
          stroke: isConnected ? OBSIDIAN_COLORS.edge.connected : OBSIDIAN_COLORS.edge.default,
          strokeWidth: isConnected ? 1.5 : 0.6,
          transition: 'all 0.3s ease',
        },
        markerEnd: activeId ? {
          type: MarkerType.ArrowClosed,
          color: isConnected ? OBSIDIAN_COLORS.edge.connected : OBSIDIAN_COLORS.edge.default,
          width: isConnected ? 10 : 6,
          height: isConnected ? 6 : 4,
        } : undefined,
      };
    });
  }, [edges, hoveredNodeId, selectedNode]);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden"
      style={{ background: OBSIDIAN_COLORS.bg }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.03) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClickHandler}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3}
        maxZoom={2.5}
        className="bg-transparent"
        defaultEdgeOptions={{
          style: { stroke: OBSIDIAN_COLORS.edge.default, strokeWidth: 0.6 },
          type: 'straight',
        }}
      >
        <Background
          color="rgba(139, 92, 246, 0.06)"
          gap={24}
          size={1}
        />
        <Controls
          className="bg-[#1a1a2e] border-[#2d2d4a] rounded-lg shadow-lg shadow-black/30"
          style={{
            '--xy-controls-button-bg': '#2d2d4a',
            '--xy-controls-button-hover-bg': '#3d3d5c',
            '--xy-controls-button-color': '#a78bfa',
          } as React.CSSProperties}
        />
        <MiniMap
          nodeColor={(node) => getNodeColor(node.data?.type || 'default')}
          className="bg-[#1a1a2e] border-[#2d2d4a] rounded-lg shadow-lg"
          style={{ filter: 'opacity(0.7)' } as React.CSSProperties}
          maskColor="rgba(26, 26, 46, 0.8)"
        />
      </ReactFlow>

      {/* Obsidian-style detail panel */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 z-50 max-w-xs"
          style={{
            background: 'rgba(26, 26, 46, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="px-3 py-2.5 border-b border-purple-500/10">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: getNodeColor(selectedNode.data?.type || 'default'),
                  boxShadow: '0 0 6px ' + getNodeColor(selectedNode.data?.type || 'default') + '66',
                }}
              />
              <span className="text-gray-200 text-sm font-medium">
                {selectedNode.data?.metadata?.title || 'Untitled'}
              </span>
            </div>
            <span className="text-[10px] text-gray-500 ml-4">
              {selectedNode.data?.metadata?.type || 'document'}
            </span>
          </div>
          <div className="px-3 py-2 space-y-1">
            {selectedNode.data?.metadata?.tags && selectedNode.data.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedNode.data.metadata.tags.map((tag: string, i: number) => (
                  <span key={i}
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      color: '#a78bfa',
                      border: '1px solid rgba(139, 92, 246, 0.15)',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {selectedNode.data?.metadata?.createdAt && (
              <div className="text-[10px] text-gray-500">
                {new Date(selectedNode.data.metadata.createdAt).toLocaleDateString('ko-KR')}
              </div>
            )}
            {selectedNode.data?.metadata?.url && (
              <a href={selectedNode.data.metadata.url} target="_blank" rel="noopener noreferrer"
                className="block text-[10px] text-blue-400 hover:text-blue-300 truncate"
              >
                {selectedNode.data.metadata.url}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Connection count badge */}
      {selectedNode && (
        <div className="absolute bottom-4 right-4 z-50 px-2 py-1 rounded text-[10px]"
          style={{
            background: 'rgba(26, 26, 46, 0.9)',
            border: '1px solid rgba(139, 92, 246, 0.1)',
            color: '#a78bfa',
          }}
        >
          {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length} connections
        </div>
      )}
    </div>
  );
}