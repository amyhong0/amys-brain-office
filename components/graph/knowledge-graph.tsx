'use client';

import React, { useCallback, useMemo, useState } from 'react';
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

const nodeTypes: NodeTypes = {};

export default function KnowledgeGraph({ nodes: initialNodes, edges: initialEdges, onNodeClick }: KnowledgeGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      if (onNodeClick) {
        onNodeClick(node);
      }
    },
    [onNodeClick]
  );

  const styledNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      style: {
        ...node.style,
        background: getNodeColor(node.data?.type || 'default'),
        border: '2px solid #6366f1',
        borderRadius: '12px',
        padding: '10px',
        minWidth: '150px'
      },
      data: {
        ...node.data,
        label: (
          <div className="text-center">
            <div className="font-bold text-sm">{node.data?.metadata?.title || 'Untitled'}</div>
            <div className="text-xs text-gray-600">{node.data?.metadata?.type || 'document'}</div>
          </div>
        )
      }
    }));
  }, [nodes]);

  const styledEdges = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      animated: true,
      style: {
        ...edge.style,
        stroke: '#6366f1',
        strokeWidth: edge.data?.strength || 1
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#6366f1'
      }
    }));
  }, [edges]);

  return (
    <div className="w-full h-[500px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden">
      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
      >
        <Background color="#6366f1" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => getNodeColor(node.data?.type || 'default')}
          className="!bg-slate-800 !border-slate-700"
        />
      </ReactFlow>

      {/* 노드 상세 패널 */}
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border-2 border-purple-400 max-w-xs">
          <button
            onClick={() => setSelectedNode(null)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
          <h3 className="font-bold text-lg mb-2">{selectedNode.data?.metadata?.title || 'Untitled'}</h3>
          <div className="space-y-1 text-sm">
            <div><span className="font-semibold">Type:</span> {selectedNode.data?.metadata?.type}</div>
            <div><span className="font-semibold">Tags:</span> {selectedNode.data?.metadata?.tags?.join(', ') || 'None'}</div>
            <div><span className="font-semibold">Created:</span> {new Date(selectedNode.data?.metadata?.createdAt).toLocaleDateString()}</div>
            {selectedNode.data?.metadata?.url && (
              <div><span className="font-semibold">URL:</span> <a href={selectedNode.data.metadata.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedNode.data.metadata.url}</a></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getNodeColor(type: string): string {
  const colorMap: Record<string, string> = {
    'pdf': '#3b82f6',
    'web': '#10b981',
    'image': '#f59e0b',
    'default': '#8b5cf6'
  };
  return colorMap[type] || colorMap.default;
}
