import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, Settings, X, Play, Square, Download, Upload, Save, Variable, Database } from 'lucide-react';
import { applyOperation, VariableManager } from '../lib/index.js';
import './CircuitCanvas.css';

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
  const [variableManager] = useState(() => new VariableManager());
  const [variables, setVariables] = useState(new Map());
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState(new Map());
  const [showVariablePanel, setShowVariablePanel] = useState(false);
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
              const result = await applyOperation(node.operation.id, inputData, {
                id: node.operation.id,
                name: node.operation.name,
                type: node.operation.type,
                params: node.parameters || {}
              });
              nodeResults.set(nodeId, result);
            } catch (error) {
              console.error(`Error in node ${nodeId}:`, error);
              nodeResults.set(nodeId, `Error: ${error.message}`);
            }
          } else {
            nodeResults.set(nodeId, inputData);
          }
        } else if (node.type === 'variable') {
          // Handle variable operations
          const inputConnections = connections.filter(c => c.to === nodeId);
          let inputData = '';
          
          if (inputConnections.length > 0) {
            const sourceNodeId = inputConnections[0].from;
            inputData = nodeResults.get(sourceNodeId) || '';
          }
          
          if (node.operation.id === 'set_variable' && node.parameters.name) {
            variableManager.setVariable(node.parameters.name, inputData);
            nodeResults.set(nodeId, inputData);
          } else if (node.operation.id === 'get_variable' && node.parameters.name) {
            const varValue = variableManager.getVariable(node.parameters.name) || '';
            nodeResults.set(nodeId, varValue);
          } else if (node.operation.id === 'create_variable' && node.parameters.name) {
            const varValue = node.parameters.value || '';
            variableManager.setVariable(node.parameters.name, varValue);
            nodeResults.set(nodeId, varValue);
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

  // Execute circuit when connections, input, or nodes change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      executeCircuit();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [executeCircuit]);

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
        id: `var-${Date.now()}`,
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
        id: `sink-${Date.now()}`,
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
        id: `node-${Date.now()}`,
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
      const x = e.clientX - rect.left - dragState.offset.x - panOffset.x;
      const y = e.clientY - rect.top - dragState.offset.y - panOffset.y;

      setNodes(prev => prev.map(node => 
        node.id === dragState.nodeId 
          ? { ...node, position: { x: Math.max(0, x), y: Math.max(0, y) } }
          : node
      ));
    }

    if (connectionState.isConnecting) {
      const rect = canvasRef.current.getBoundingClientRect();
      setConnectionState(prev => ({
        ...prev,
        mousePos: {
          x: e.clientX - rect.left - panOffset.x,
          y: e.clientY - rect.top - panOffset.y
        }
      }));
    }
  }, [dragState, connectionState, panOffset]);

  const handleMouseUp = useCallback(() => {
    setDragState({ isDragging: false, nodeId: null, offset: { x: 0, y: 0 } });
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
    
    if (connectionState.isConnecting && portType === 'input' && nodeId !== connectionState.fromNode) {
      const newConnection = {
        id: `conn-${Date.now()}`,
        from: connectionState.fromNode,
        fromPort: connectionState.fromPort,
        to: nodeId,
        toPort: portName
      };
      
      setConnections(prev => [...prev, newConnection]);
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

  // Save circuit state
  const saveCircuit = () => {
    const circuitState = {
      nodes: nodes,
      connections: connections,
      variables: Object.fromEntries(variables),
      metadata: {
        name: 'Custom Circuit',
        created: new Date().toISOString(),
        version: '1.0.0'
      }
    };
    
    localStorage.setItem('circuit_state', JSON.stringify(circuitState));
    alert('Circuit saved to browser storage!');
  };

  // Load circuit state
  const loadCircuit = () => {
    try {
      const saved = localStorage.getItem('circuit_state');
      if (saved) {
        const circuitState = JSON.parse(saved);
        setNodes(circuitState.nodes || []);
        setConnections(circuitState.connections || []);
        setVariables(new Map(Object.entries(circuitState.variables || {})));
        alert('Circuit loaded successfully!');
      } else {
        alert('No saved circuit found.');
      }
    } catch (error) {
      alert('Error loading circuit: ' + error.message);
    }
  };

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
      variables: Object.fromEntries(variables)
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
          setVariables(new Map(Object.entries(circuitState.variables || {})));
          alert('Circuit imported successfully!');
        } else {
          alert('Invalid circuit file format.');
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
            onClick={executeCircuit}
            disabled={isExecuting}
            title="Execute Circuit"
          >
            <Play size={16} />
            {isExecuting ? 'Running...' : 'Execute'}
          </button>
          <button 
            className="circuit-button"
            onClick={() => setShowVariablePanel(!showVariablePanel)}
            title="Variables Panel"
          >
            <Variable size={16} />
            Variables
          </button>
          <button 
            className="circuit-button"
            onClick={saveCircuit}
            title="Save to Browser Storage"
          >
            <Save size={16} />
            Save
          </button>
          <button 
            className="circuit-button"
            onClick={loadCircuit}
            title="Load from Browser Storage"
          >
            <Upload size={16} />
            Load
          </button>
          <button 
            className="circuit-button"
            onClick={exportCircuit}
            title="Export as JSON File"
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
      >
        <svg className="connections-layer">
          {connections.map(conn => (
            <path
              key={conn.id}
              d={getConnectionPath(conn.from, conn.fromPort, conn.to, conn.toPort)}
              className="connection-path"
              fill="none"
              stroke="#6544bc"
              strokeWidth="2"
            />
          ))}
          
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
        </svg>

        {/* Variable Management Panel */}
        {showVariablePanel && (
          <div className="variable-panel">
            <div className="variable-panel-header">
              <h3>Variables</h3>
              <button 
                className="variable-panel-close"
                onClick={() => setShowVariablePanel(false)}
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="variable-panel-content">
              <div className="variable-create">
                <input 
                  type="text" 
                  placeholder="Variable name"
                  id="new-var-name"
                />
                <input 
                  type="text" 
                  placeholder="Variable value"
                  id="new-var-value"
                />
                <button 
                  className="variable-create-btn"
                  onClick={() => {
                    const nameInput = document.getElementById('new-var-name');
                    const valueInput = document.getElementById('new-var-value');
                    if (nameInput.value.trim()) {
                      variableManager.setVariable(nameInput.value.trim(), valueInput.value);
                      nameInput.value = '';
                      valueInput.value = '';
                    }
                  }}
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>
              
              <div className="variable-list">
                {Array.from(variables.entries()).map(([name, value]) => (
                  <div key={name} className="variable-item">
                    <div className="variable-info">
                      <strong>${name}</strong>
                      <span className="variable-value">{value}</span>
                    </div>
                    <div className="variable-actions">
                      <button
                        className="variable-edit-btn"
                        onClick={() => {
                          const newValue = prompt('Edit variable value:', value);
                          if (newValue !== null) {
                            variableManager.setVariable(name, newValue);
                          }
                        }}
                      >
                        <Settings size={12} />
                      </button>
                      <button
                        className="variable-delete-btn"
                        onClick={() => {
                          if (confirm(`Delete variable $${name}?`)) {
                            variableManager.deleteVariable(name);
                          }
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {variables.size === 0 && (
                  <div className="variable-empty">
                    No variables defined. Create variables to use in your circuit.
                  </div>
                )}
              </div>
              
              <div className="variable-panel-actions">
                <button 
                  className="variable-action-btn"
                  onClick={() => {
                    const exported = variableManager.exportVariables();
                    const blob = new Blob([JSON.stringify(exported, null, 2)], {
                      type: 'application/json'
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `variables_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download size={14} />
                  Export
                </button>
                <label className="variable-action-btn">
                  <Upload size={14} />
                  Import
                  <input 
                    type="file" 
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const data = JSON.parse(event.target.result);
                            if (variableManager.importVariables(data)) {
                              alert('Variables imported successfully!');
                            } else {
                              alert('Invalid variable file format.');
                            }
                          } catch (error) {
                            alert('Error importing variables: ' + error.message);
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
                <button 
                  className="variable-action-btn danger"
                  onClick={() => {
                    if (confirm('Clear all variables?')) {
                      variableManager.clearVariables();
                    }
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

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
              left: node.position.x,
              top: node.position.y,
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`
            }}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
            onClick={() => setSelectedNode(node.id)}
          >
            <div className="node-header">
              <span className="node-title">{node.name}</span>
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
                  {Object.entries(node.parameters).map(([key, value]) => (
                    <div key={key} className="parameter-row">
                      <label>{key}:</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateNodeParameter(node.id, key, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  ))}
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

        {nodes.length === 2 && (
          <div className="canvas-overlay">
            <div className="canvas-info">
              <span>Drag operations from sidebar to create circuit nodes</span>
              <br />
              <small>Connect the Input node to operations, then to the Output node</small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CircuitCanvas;