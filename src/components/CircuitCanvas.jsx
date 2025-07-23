import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, Settings, X, Play, Square, Download, Upload, Save, Variable, Database } from 'lucide-react';
import { applyOperation, VariableManager } from '../lib/index.js';
import './CircuitCanvas.css';
import './notifications.css';

const CircuitCanvas = ({ operations, onExecute, input, output, onInputChange, onOutputChange }) => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [dragState, setDragState] = useState({
    isDragging: false,
    nodeId: null,
    offset: { x: 0, y: 0 }
  });
  const [selectedNode, setSelectedNode] = useState(null);
  const [connectionState, setConnectionState] = useState({
    isConnecting: false,
    fromNode: null,
    fromPort: null,
    mousePos: { x: 0, y: 0 }
  });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [variableManager] = useState(() => new VariableManager());
  const [variables, setVariables] = useState(new Map());
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState(new Map());
  const [outputSinks, setOutputSinks] = useState(new Map());

  // Create initial input and output nodes (positioned close together)
  useEffect(() => {
    if (nodes.length === 0) {
      setNodes([
        {
          id: 'input',
          type: 'input',
          name: 'Input',
          position: { x: 50, y: 150 },
          outputs: ['data'],
          value: input || ''
        },
        {
          id: 'output',
          type: 'output', 
          name: 'Output',
          position: { x: 300, y: 150 },
          inputs: ['data'],
          value: output || ''
        }
      ]);
    }
  }, []);

  // Subscribe to variable changes
  useEffect(() => {
    const handleVariableChange = (vars) => {
      setVariables(new Map(vars.map(v => [v.name, v.value])));
    };
    
    variableManager.subscribe(handleVariableChange);
    return () => variableManager.unsubscribe(handleVariableChange);
  }, [variableManager]);

  // Update input node value when input changes (with variable substitution)
  useEffect(() => {
    try {
      const processedInput = variableManager.substituteVariables(input || '');
      setNodes(prev => prev.map(node => 
        node.id === 'input' ? { ...node, value: processedInput } : node
      ));
    } catch (error) {
      console.warn('Variable substitution error:', error);
      // Fallback to original input if substitution fails
      setNodes(prev => prev.map(node => 
        node.id === 'input' ? { ...node, value: input || '' } : node
      ));
    }
  }, [input, variableManager, variables]);

  // Update output node value when output changes
  useEffect(() => {
    setNodes(prev => prev.map(node => 
      node.id === 'output' ? { ...node, value: output || '' } : node
    ));
  }, [output]);

  // Execute circuit function definition (moved up to avoid reference issues)
  const executeCircuit = useCallback(async () => {
    if (isExecuting) return;
    
    setIsExecuting(true);
    const nodeResults = new Map();
    
    // Set input node result
    nodeResults.set('input', input || '');
    
    try {
      // Only execute if we have connections
      if (connections.length === 0) {
        setExecutionResults(nodeResults);
        if (onOutputChange) {
          onOutputChange('');
        }
        return;
      }
      
      // Find execution order using topological sort
      const executionOrder = getExecutionOrder();
      
      for (const nodeId of executionOrder) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node || node.type === 'input') continue;
        
        if (node.type === 'operation') {
          // Get input data from connected nodes
          const inputConnections = connections.filter(c => c.to === nodeId);
          let inputData = input || '';
          
          if (inputConnections.length > 0) {
            const sourceNodeId = inputConnections[0].from;
            inputData = nodeResults.get(sourceNodeId) || '';
          }
          
          // Apply operation
          if (node.operation && inputData !== '') {
            try {
              // Resolve parameter values from connections or use defaults
              const resolvedParams = {};
              for (const [paramName, paramValue] of Object.entries(node.parameters || {})) {
                resolvedParams[paramName] = variableManager.getParameterValue(
                  nodeId, 
                  paramName, 
                  paramValue, 
                  nodeResults
                );
              }
              
              const result = await applyOperation(node.operation.id, inputData, resolvedParams);
              nodeResults.set(nodeId, result);
            } catch (error) {
              console.error(`Error in node ${nodeId}:`, error);
              nodeResults.set(nodeId, `Error: ${error.message}`);
            }
          } else {
            nodeResults.set(nodeId, inputData);
          }
        } else if (node.type === 'variable') {
          // Handle unified variable operations
          const inputConnections = connections.filter(c => c.to === nodeId);
          let inputData = '';
          
          if (inputConnections.length > 0) {
            const sourceNodeId = inputConnections[0].from;
            inputData = nodeResults.get(sourceNodeId) || '';
          }
          
          // Resolve parameter values from connections
          const resolvedParams = {};
          for (const [paramName, paramValue] of Object.entries(node.parameters || {})) {
            resolvedParams[paramName] = variableManager.getParameterValue(
              nodeId, 
              paramName, 
              paramValue, 
              nodeResults
            );
          }
          
          try {
            // Use the unified variable operation functions
            const result = await applyOperation(node.operation.id, inputData, {
              ...resolvedParams,
              variableManager: variableManager
            });
            nodeResults.set(nodeId, result);
          } catch (error) {
            console.error(`Error in variable node ${nodeId}:`, error);
            nodeResults.set(nodeId, `Error: ${error.message}`);
          }
        } else if (node.type === 'sink') {
          // Handle output sinks
          const inputConnections = connections.filter(c => c.to === nodeId);
          if (inputConnections.length > 0) {
            const sourceNodeId = inputConnections[0].from;
            const sinkData = nodeResults.get(sourceNodeId) || '';
            nodeResults.set(nodeId, sinkData);
            
            // Store in appropriate sink
            if (node.operation.id === 'output_sink') {
              const label = node.parameters.label || 'Output';
              setOutputSinks(prev => new Map(prev.set(label, sinkData)));
              
              // Update main output if this is the primary sink
              if (label === 'Output' && onOutputChange) {
                onOutputChange(sinkData);
              }
            } else if (node.operation.id === 'variable_sink' && node.parameters.variable) {
              variableManager.setVariable(node.parameters.variable, sinkData);
            }
          }
        } else if (node.type === 'output') {
          // Handle main output node (backward compatibility)
          const inputConnections = connections.filter(c => c.to === nodeId);
          if (inputConnections.length > 0) {
            const sourceNodeId = inputConnections[0].from;
            const finalResult = nodeResults.get(sourceNodeId) || '';
            nodeResults.set(nodeId, finalResult);
            
            // Update parent component's output
            if (onOutputChange) {
              onOutputChange(finalResult);
            }
          }
        }
      }
      
      setExecutionResults(nodeResults);
      
    } catch (error) {
      console.error('Circuit execution error:', error);
    } finally {
      setIsExecuting(false);
    }
  }, [connections, input, isExecuting, onOutputChange, nodes, variableManager]);

  // Auto-execute circuit when anything changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (nodes.length > 0) {
        executeCircuit();
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [executeCircuit, nodes, connections, input]);

  // Handle drag and drop from sidebar
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const operationData = e.dataTransfer.getData('application/json');
    if (!operationData) return;

    const operation = JSON.parse(operationData);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - panOffset.x;
    const y = e.clientY - rect.top - panOffset.y;

    let newNode;
    
    if (operation.type === 'variable') {
      newNode = {
        id: `var-${nodes.length + 1}-${Date.now().toString().slice(-6)}`,
        type: 'variable',
        operation: operation,
        name: operation.name,
        position: { x: Math.max(0, x - 100), y: Math.max(0, y - 50) },
        inputs: operation.id === 'get_variable' ? [] : ['input'],
        outputs: ['output'],
        parameters: getDefaultParameters(operation)
      };
    } else if (operation.type === 'sink') {
      newNode = {
        id: `sink-${nodes.length + 1}-${Date.now().toString().slice(-6)}`,
        type: 'sink',
        operation: operation,
        name: operation.name,
        position: { x: Math.max(0, x - 100), y: Math.max(0, y - 50) },
        inputs: ['input'],
        outputs: [],
        parameters: getDefaultParameters(operation)
      };
    } else {
      newNode = {
        id: `op-${nodes.length + 1}-${Date.now().toString().slice(-6)}`,
        type: 'operation',
        operation: operation,
        name: operation.name,
        position: { x: Math.max(0, x - 100), y: Math.max(0, y - 50) },
        inputs: ['input'],
        outputs: ['output'],
        parameters: getDefaultParameters(operation)
      };
    }

    setNodes(prev => [...prev, newNode]);
  }, [panOffset]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  // Get default parameters for operation
  const getDefaultParameters = (operation) => {
    const params = {};
    if (operation.params) {
      operation.params.forEach(param => {
        switch (param) {
          case 'shift': params[param] = 3; break;
          case 'a': params[param] = 5; break;
          case 'b': params[param] = 8; break;
          case 'key': case 'keyStr': params[param] = 'KEY'; break;
          case 'rails': params[param] = 3; break;
          default: params[param] = '';
        }
      });
    }
    return params;
  };

  // Node dragging
  const handleMouseDown = (e, nodeId) => {
    if (e.target.classList.contains('port')) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const node = nodes.find(n => n.id === nodeId);
    
    setDragState({
      isDragging: true,
      nodeId: nodeId,
      offset: {
        x: e.clientX - rect.left - node.position.x - panOffset.x,
        y: e.clientY - rect.top - node.position.y - panOffset.y
      }
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (dragState.isDragging) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - dragState.offset.x - panOffset.x) / zoom;
      const y = (e.clientY - rect.top - dragState.offset.y - panOffset.y) / zoom;

      setNodes(prev => prev.map(node => 
        node.id === dragState.nodeId 
          ? { ...node, position: { x: Math.max(0, x), y: Math.max(0, y) } }
          : node
      ));
    }

    if (isPanning) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }

    if (connectionState.isConnecting) {
      const rect = canvasRef.current.getBoundingClientRect();
      setConnectionState(prev => ({
        ...prev,
        mousePos: {
          x: (e.clientX - rect.left - panOffset.x) / zoom,
          y: (e.clientY - rect.top - panOffset.y) / zoom
        }
      }));
    }
  }, [dragState, connectionState, panOffset, zoom, isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setDragState({ isDragging: false, nodeId: null, offset: { x: 0, y: 0 } });
    setIsPanning(false);
    if (connectionState.isConnecting) {
      setConnectionState({
        isConnecting: false,
        fromNode: null,
        fromPort: null,
        mousePos: { x: 0, y: 0 }
      });
    }
  }, [connectionState]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Canvas panning
  const handleCanvasMouseDown = (e) => {
    // Don't start panning if clicking on disconnect buttons
    if (e.target.classList.contains('connection-disconnect-btn')) {
      return;
    }
    
    // Only start panning if clicking on empty space (not on nodes or ports)
    if (e.target === e.currentTarget) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Zoom functionality
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)));
    }
  }, []);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(3, prev * 1.2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.1, prev / 1.2));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        canvas.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

  // Connection handling
  const handlePortMouseDown = (e, nodeId, portName, portType) => {
    e.stopPropagation();
    
    if (portType === 'output') {
      setConnectionState({
        isConnecting: true,
        fromNode: nodeId,
        fromPort: portName,
        mousePos: { x: 0, y: 0 }
      });
    }
  };

  const handlePortMouseUp = (e, nodeId, portName, portType) => {
    e.stopPropagation();
    
    if (connectionState.isConnecting && nodeId !== connectionState.fromNode) {
      if (portType === 'input') {
        // Regular node-to-node connection
        const newConnection = {
          id: `conn-${Date.now()}`,
          from: connectionState.fromNode,
          fromPort: connectionState.fromPort,
          to: nodeId,
          toPort: portName
        };
        
        setConnections(prev => [...prev, newConnection]);
      } else if (portType === 'parameter') {
        // Parameter connection - connect output to parameter
        variableManager.connectParameter(nodeId, portName, connectionState.fromNode, connectionState.fromPort);
        
        // Force re-render to show the connection
        setSelectedNode(prev => prev === nodeId ? null : prev);
        setSelectedNode(nodeId);
      }
    }
    
    setConnectionState({
      isConnecting: false,
      fromNode: null,
      fromPort: null,
      mousePos: { x: 0, y: 0 }
    });
  };

  // Delete node
  const deleteNode = (nodeId) => {
    if (nodeId === 'input' || nodeId === 'output') return;
    
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    if (selectedNode === nodeId) setSelectedNode(null);
  };

  // Update node parameters
  const updateNodeParameter = (nodeId, paramName, value) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, parameters: { ...node.parameters, [paramName]: value } }
        : node
    ));
  };


  // Get execution order using topological sort
  const getExecutionOrder = () => {
    const nodeIds = nodes.map(n => n.id);
    const inDegree = new Map();
    const adjList = new Map();
    
    // Initialize
    nodeIds.forEach(id => {
      inDegree.set(id, 0);
      adjList.set(id, []);
    });
    
    // Build adjacency list and calculate in-degrees
    connections.forEach(conn => {
      adjList.get(conn.from).push(conn.to);
      inDegree.set(conn.to, inDegree.get(conn.to) + 1);
    });
    
    // Topological sort
    const queue = nodeIds.filter(id => inDegree.get(id) === 0);
    const result = [];
    
    while (queue.length > 0) {
      const current = queue.shift();
      result.push(current);
      
      adjList.get(current).forEach(neighbor => {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      });
    }
    
    return result;
  };

  // Remove deleted - only keeping import/export functionality

  // Export circuit as JSON file
  const exportCircuit = () => {
    const circuitState = {
      format: 'circuit-graph',
      version: '1.0.0',
      metadata: {
        name: 'Exported Circuit',
        description: 'Circuit exported from visual editor',
        created: new Date().toISOString(),
        nodeCount: nodes.length,
        connectionCount: connections.length
      },
      nodes: nodes,
      connections: connections,
      variables: Object.fromEntries(variables),
      parameterConnections: Object.fromEntries(variableManager.getParameterConnections())
    };
    
    const blob = new Blob([JSON.stringify(circuitState, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `circuit_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import circuit from JSON file
  const importCircuit = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const circuitState = JSON.parse(e.target.result);
        
        if (circuitState.format === 'circuit-graph') {
          setNodes(circuitState.nodes || []);
          setConnections(circuitState.connections || []);
          
          // Restore variables to variable manager
          if (circuitState.variables) {
            const varsMap = new Map(Object.entries(circuitState.variables));
            setVariables(varsMap);
            // Update variable manager with imported variables
            for (const [name, value] of varsMap.entries()) {
              variableManager.setVariable(name, value);
            }
          }
          
          // Restore parameter connections
          if (circuitState.parameterConnections) {
            for (const [key, value] of Object.entries(circuitState.parameterConnections)) {
              const [nodeId, paramName] = key.split(':');
              const [sourceNodeId, outputPort] = value.split(':');
              variableManager.connectParameter(nodeId, paramName, sourceNodeId, outputPort);
            }
          }
          
          // Show success notification with better styling
          const notification = document.createElement('div');
          notification.className = 'circuit-notification success';
          notification.innerHTML = `
            <div class="notification-content">
              <strong>✅ Circuit Imported Successfully!</strong>
              <div>Loaded ${circuitState.nodes?.length || 0} nodes, ${circuitState.connections?.length || 0} connections</div>
              <div>Variables: ${Object.keys(circuitState.variables || {}).length}, Parameters: ${Object.keys(circuitState.parameterConnections || {}).length}</div>
            </div>
          `;
          document.body.appendChild(notification);
          
          setTimeout(() => {
            notification.remove();
          }, 5000);
        } else {
          alert('Invalid circuit file format. Please select a valid .json circuit file.');
        }
      } catch (error) {
        alert('Error importing circuit: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  // Get connection path
  const getConnectionPath = (fromNode, fromPort, toNode, toPort) => {
    const from = nodes.find(n => n.id === fromNode);
    const to = nodes.find(n => n.id === toNode);
    
    if (!from || !to) return '';

    const fromX = from.position.x + 200; // Right side of node
    const fromY = from.position.y + 50;  // Center of node
    const toX = to.position.x;           // Left side of node  
    const toY = to.position.y + 50;      // Center of node

    const midX = (fromX + toX) / 2;
    
    return `M ${fromX} ${fromY} C ${midX} ${fromY} ${midX} ${toY} ${toX} ${toY}`;
  };

  return (
    <div className="circuit-canvas-container">
      <div className="circuit-toolbar">
        <div className="circuit-controls">
          <button 
            className="circuit-button"
            onClick={exportCircuit}
            title="Export Circuit as JSON File"
          >
            <Download size={16} />
            Export
          </button>
          <label className="circuit-button file-input-label">
            <Upload size={16} />
            Import
            <input 
              type="file" 
              accept=".json"
              onChange={importCircuit}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        <div className="zoom-controls">
          <button 
            className="circuit-button"
            onClick={handleZoomIn}
            title="Zoom In (Ctrl+Scroll)"
          >
            <Plus size={16} />
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button 
            className="circuit-button"
            onClick={handleZoomOut}
            title="Zoom Out (Ctrl+Scroll)"
          >
            <span style={{ fontSize: '16px' }}>−</span>
          </button>
          <button 
            className="circuit-button"
            onClick={handleResetZoom}
            title="Reset Zoom & Pan"
          >
            ⌂
          </button>
        </div>
        <div className="circuit-stats">
          <span>Nodes: {nodes.length}</span>
          <span>Connections: {connections.length}</span>
          <span>Variables: {variables.size}</span>
          <span>Sinks: {outputSinks.size}</span>
          {isExecuting && <span className="executing-indicator">⚡ Executing...</span>}
        </div>
      </div>
      <div 
        ref={canvasRef}
        className="circuit-canvas"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onMouseDown={handleCanvasMouseDown}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        <svg className="connections-layer">
          <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoom})`}>
            {connections.map(conn => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;
              
              const fromX = fromNode.position.x + 200;
              const fromY = fromNode.position.y + 50;
              const toX = toNode.position.x;
              const toY = toNode.position.y + 50;
              const midX = (fromX + toX) / 2;
              const midY = (fromY + toY) / 2;
              
              return (
                <g key={conn.id}>
                  <path
                    d={getConnectionPath(conn.from, conn.fromPort, conn.to, conn.toPort)}
                    className="connection-path"
                    fill="none"
                    stroke="#6544bc"
                    strokeWidth="2"
                  />
                  {/* Disconnect button in middle of connection */}
                  <circle
                    cx={midX}
                    cy={midY}
                    r="12"
                    fill="#dc3545"
                    stroke="white"
                    strokeWidth="2"
                    className="connection-disconnect-btn"
                    style={{ cursor: 'pointer', pointerEvents: 'all' }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      console.log('Clicked disconnect button for:', conn.id);
                      setConnections(prev => {
                        console.log('Removing connection:', conn.id);
                        return prev.filter(c => c.id !== conn.id);
                      });
                    }}
                  />
                  <text
                    x={midX}
                    y={midY + 2}
                    textAnchor="middle"
                    fontSize="12"
                    fill="white"
                    style={{ pointerEvents: 'none', fontWeight: 'bold', userSelect: 'none' }}
                  >
                    ×
                  </text>
                </g>
              );
            })}
            
            {connectionState.isConnecting && (
              <path
                d={`M ${nodes.find(n => n.id === connectionState.fromNode)?.position.x + 200} ${nodes.find(n => n.id === connectionState.fromNode)?.position.y + 50} L ${connectionState.mousePos.x} ${connectionState.mousePos.y}`}
                className="connection-preview"
                fill="none"
                stroke="#6544bc"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            )}
          </g>
        </svg>


        {/* Output Sinks Panel */}
        {outputSinks.size > 0 && (
          <div className="sinks-panel">
            <div className="sinks-panel-header">
              <h4>Output Sinks</h4>
            </div>
            <div className="sinks-list">
              {Array.from(outputSinks.entries()).map(([label, value]) => (
                <div key={label} className="sink-item">
                  <div className="sink-label">{label}</div>
                  <div className="sink-value">
                    {value.length > 100 ? value.substring(0, 100) + '...' : value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {nodes.map(node => (
          <div
            key={node.id}
            className={`circuit-node ${node.type} ${selectedNode === node.id ? 'selected' : ''}`}
            style={{
              left: node.position.x * zoom + panOffset.x,
              top: node.position.y * zoom + panOffset.y,
              transform: `scale(${zoom})`,
              transformOrigin: '0 0'
            }}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
            onClick={() => setSelectedNode(node.id)}
          >
            <div className="node-header">
              <div className="node-title-section">
                <span className="node-title">{node.name}</span>
                <span className="node-id">#{node.id.replace(/^(op|var|sink)-/, '').substring(0, 8)}</span>
              </div>
              {node.type === 'operation' && (
                <button 
                  className="node-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(node.id);
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="node-body">
              {node.inputs && (
                <div className="node-ports inputs">
                  {node.inputs.map(input => (
                    <div
                      key={input}
                      className="port input-port"
                      onMouseDown={(e) => handlePortMouseDown(e, node.id, input, 'input')}
                      onMouseUp={(e) => handlePortMouseUp(e, node.id, input, 'input')}
                    >
                      <div className="port-dot"></div>
                      <span className="port-label">{input}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Show value preview for all nodes */}
              {(() => {
                const nodeValue = executionResults.get(node.id) || node.value || '';
                return nodeValue && (
                  <div className="node-value-preview">
                    <small>{nodeValue.length > 50 ? nodeValue.substring(0, 50) + '...' : nodeValue}</small>
                  </div>
                );
              })()}
              
              {/* Show execution status */}
              {isExecuting && (
                <div className="node-execution-status">
                  <small>⚡ Processing...</small>
                </div>
              )}

              {node.parameters && Object.keys(node.parameters).length > 0 && (
                <div className="node-parameters">
                  {Object.entries(node.parameters).map(([key, value]) => {
                    const paramConnectionKey = `${node.id}:${key}`;
                    const isConnected = variableManager.getParameterConnections().has(paramConnectionKey);
                    
                    return (
                      <div key={key} className="parameter-row">
                        <div className="parameter-input-port">
                          <div
                            className={`port input-port parameter-port ${isConnected ? 'connected' : ''}`}
                            onMouseDown={(e) => handlePortMouseDown(e, node.id, key, 'parameter')}
                            onMouseUp={(e) => handlePortMouseUp(e, node.id, key, 'parameter')}
                            title={`Connect data to ${key} parameter`}
                          >
                            <div className="port-dot"></div>
                          </div>
                          <label>{key}:</label>
                        </div>
                        <input
                          type="text"
                          value={isConnected ? `[Connected: ${variableManager.getParameterConnections().get(paramConnectionKey)}]` : value}
                          onChange={(e) => updateNodeParameter(node.id, key, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          disabled={isConnected}
                          className={isConnected ? 'parameter-connected' : ''}
                          placeholder={isConnected ? 'Parameter value from connection' : 'Enter value or drag connection'}
                        />
                        {isConnected && (
                          <button
                            className="disconnect-parameter-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              variableManager.disconnectParameter(node.id, key);
                              // Force re-render by updating a dummy state
                              setSelectedNode(prev => prev === node.id ? null : prev);
                              setSelectedNode(node.id);
                            }}
                            title="Disconnect parameter"
                          >
                            <X size={10} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {node.outputs && (
                <div className="node-ports outputs">
                  {node.outputs.map(output => (
                    <div
                      key={output}
                      className="port output-port"
                      onMouseDown={(e) => handlePortMouseDown(e, node.id, output, 'output')}
                      onMouseUp={(e) => handlePortMouseUp(e, node.id, output, 'output')}
                    >
                      <span className="port-label">{output}</span>
                      <div className="port-dot"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* {nodes.length === 2 && ( */}
          {/* <div className="canvas-overlay"> */}
            {/* <div className="canvas-info"> */}
              {/* <span>Drag operations from sidebar to create circuit nodes</span> */}
              {/* <br /> */}
              {/* <small>Connect the Input node to operations, then to the Output node</small> */}
            {/* </div> */}
          {/* </div> */}
        {/* )} */}
      </div>
    </div>
  );
};

export default CircuitCanvas;