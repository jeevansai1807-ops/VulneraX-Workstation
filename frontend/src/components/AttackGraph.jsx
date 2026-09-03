import React, { useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function AttackGraph({ scanResult }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useMemo(() => {
    if (!scanResult) return;

    const newNodes = [];
    const newEdges = [];

    // Target Node (Root)
    const targetNodeId = 'target';
    newNodes.push({
      id: targetNodeId,
      position: { x: 400, y: 50 },
      data: { 
        label: (
          <div className="text-center font-bold px-3 py-1">
            <div className="text-xs uppercase tracking-widest text-rose-300 font-mono">TARGET APEX</div>
            <div className="text-sm font-black text-white">{scanResult.target}</div>
          </div>
        ) 
      },
      style: {
        background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.35), rgba(139, 92, 246, 0.35))',
        border: '2px solid rgba(244, 63, 94, 0.6)',
        borderRadius: '16px',
        padding: '12px',
        color: '#fff',
        boxShadow: '0 0 25px rgba(244, 63, 94, 0.35)',
      },
    });

    // Vulnerabilities
    if (scanResult.vulnerabilities && scanResult.vulnerabilities.length > 0) {
       scanResult.vulnerabilities.forEach((vuln, index) => {
         const vulnNodeId = `vuln-${index}`;
         let color = '#8b5cf6'; // low / violet
         if (vuln.severity === 'high') color = '#fb923c'; // coral
         if (vuln.severity === 'medium') color = '#d946ef'; // magenta
         if (vuln.severity === 'critical') color = '#f43f5e'; // fuchsia

         newNodes.push({
            id: vulnNodeId,
            position: { x: 80 + (index * 210), y: 260 },
            data: {
               label: (
                  <div className="text-center px-2 py-1">
                    <div className="font-black text-[10px] font-mono tracking-widest" style={{ color }}>
                      {vuln.severity.toUpperCase()}
                    </div>
                    <div className="text-xs font-bold text-white truncate max-w-[140px]">{vuln.name}</div>
                  </div>
               )
            },
            style: {
              background: 'rgba(18, 15, 36, 0.85)',
              border: `1.5px solid ${color}`,
              borderRadius: '14px',
              padding: '10px',
              color: '#fff',
              boxShadow: `0 0 15px ${color}35`,
            }
         });

         newEdges.push({
           id: `e-target-${vulnNodeId}`,
           source: targetNodeId,
           target: vulnNodeId,
           animated: true,
           style: { stroke: color, strokeWidth: 2 },
           markerEnd: {
             type: MarkerType.ArrowClosed,
             color: color,
           },
         });
       });
    }

    // Ports
    if (scanResult.ports && scanResult.ports.length > 0) {
      scanResult.ports.forEach((port, index) => {
        const portNodeId = `port-${index}`;
        newNodes.push({
           id: portNodeId,
           position: { x: 680 + (index * 140), y: 160 },
           data: {
             label: (
                <div className="text-center text-xs">
                  <div className="font-bold text-white">Port {port.port}</div>
                  <div className="text-[10px] font-mono text-purple-300">{port.service || 'open'}</div>
                </div>
             )
           },
           style: {
             background: 'rgba(139, 92, 246, 0.15)',
             border: '1.5px solid rgba(139, 92, 246, 0.5)',
             borderRadius: '50%',
             padding: '12px',
             color: '#fff',
             width: 76,
             height: 76,
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             boxShadow: '0 0 15px rgba(139, 92, 246, 0.25)',
           }
        });
        
        newEdges.push({
          id: `e-target-${portNodeId}`,
          source: targetNodeId,
          target: portNodeId,
          style: { stroke: 'rgba(139, 92, 246, 0.5)', strokeWidth: 1.5 },
        });
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [scanResult, setNodes, setEdges]);

  if (!scanResult) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground font-mono text-xs uppercase tracking-wider">
        No telemetry available for attack graph
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        colorMode="dark"
      >
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Background variant="dots" gap={16} size={1.2} color="rgba(244, 63, 94, 0.2)" />
      </ReactFlow>
    </div>
  );
}
