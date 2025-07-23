// Circuit-based data processing system inspired by GNU Radio
// Allows visual graph connections between operations for complex workflows

export class DataCircuit {
  constructor() {
    this.nodes = new Map();
    this.connections = new Map(); // nodeId -> [{ from: nodeId, output: 'port', to: nodeId, input: 'port' }]
    this.executionOrder = [];
    this.isRunning = false;
    this.results = new Map();
  }

  // Add a processing node to the circuit
  addNode(id, config) {
    const node = {
      id: id,
      type: config.type, // 'source', 'processor', 'sink'
      operation: config.operation, // function to execute
      name: config.name || id,
      description: config.description || '',
      
      // Input/Output ports
      inputs: config.inputs || ['input'],
      outputs: config.outputs || ['output'],
      
      // Parameters
      parameters: config.parameters || {},
      
      // Internal state
      inputData: new Map(),
      outputData: new Map(),
      executed: false,
      error: null,
      
      // Visual properties for UI
      position: config.position || { x: 0, y: 0 },
      color: config.color || this.getNodeColor(config.type)
    };
    
    this.nodes.set(id, node);
    this.connections.set(id, []);
    
    return node;
  }

  // Remove a node and all its connections
  removeNode(id) {
    if (!this.nodes.has(id)) return false;
    
    // Remove all connections to/from this node
    for (const [nodeId, conns] of this.connections.entries()) {
      this.connections.set(nodeId, conns.filter(conn => 
        conn.from !== id && conn.to !== id
      ));
    }
    
    this.nodes.delete(id);
    this.connections.delete(id);
    this.results.delete(id);
    
    return true;
  }

  // Connect two nodes
  connect(fromId, fromPort, toId, toPort) {
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) {
      throw new Error('Node not found');
    }
    
    const fromNode = this.nodes.get(fromId);
    const toNode = this.nodes.get(toId);
    
    if (!fromNode.outputs.includes(fromPort)) {
      throw new Error(`Output port '${fromPort}' not found on node '${fromId}'`);
    }
    
    if (!toNode.inputs.includes(toPort)) {
      throw new Error(`Input port '${toPort}' not found on node '${toId}'`);
    }
    
    // Check for duplicate connections
    const existingConnections = this.connections.get(fromId);
    const duplicate = existingConnections.find(conn => 
      conn.from === fromId && conn.output === fromPort && 
      conn.to === toId && conn.input === toPort
    );
    
    if (duplicate) {
      throw new Error('Connection already exists');
    }
    
    const connection = {
      from: fromId,
      output: fromPort,
      to: toId,
      input: toPort,
      id: `${fromId}:${fromPort}->${toId}:${toPort}`
    };
    
    this.connections.get(fromId).push(connection);
    
    return connection;
  }

  // Disconnect two nodes
  disconnect(fromId, fromPort, toId, toPort) {
    if (!this.connections.has(fromId)) return false;
    
    const connections = this.connections.get(fromId);
    const index = connections.findIndex(conn => 
      conn.from === fromId && conn.output === fromPort && 
      conn.to === toId && conn.input === toPort
    );
    
    if (index >= 0) {
      connections.splice(index, 1);
      return true;
    }
    
    return false;
  }

  // Calculate execution order (topological sort)
  calculateExecutionOrder() {
    const visited = new Set();
    const visiting = new Set();
    const order = [];
    
    const visit = (nodeId) => {
      if (visiting.has(nodeId)) {
        throw new Error(`Circular dependency detected involving node '${nodeId}'`);
      }
      
      if (visited.has(nodeId)) return;
      
      visiting.add(nodeId);
      
      // Visit all nodes that this node depends on
      for (const [fromId, connections] of this.connections.entries()) {
        for (const conn of connections) {
          if (conn.to === nodeId) {
            visit(fromId);
          }
        }
      }
      
      visiting.delete(nodeId);
      visited.add(nodeId);
      order.push(nodeId);
    };
    
    // Visit all nodes
    for (const nodeId of this.nodes.keys()) {
      visit(nodeId);
    }
    
    this.executionOrder = order;
    return order;
  }

  // Execute the entire circuit
  async execute(sourceInputs = {}) {
    if (this.isRunning) {
      throw new Error('Circuit is already running');
    }
    
    this.isRunning = true;
    this.results.clear();
    
    try {
      // Reset all nodes
      for (const node of this.nodes.values()) {
        node.inputData.clear();
        node.outputData.clear();
        node.executed = false;
        node.error = null;
      }
      
      // Set source inputs
      for (const [nodeId, data] of Object.entries(sourceInputs)) {
        const node = this.nodes.get(nodeId);
        if (node && node.type === 'source') {
          node.outputData.set('output', data);
          node.executed = true;
        }
      }
      
      // Calculate execution order
      this.calculateExecutionOrder();
      
      // Execute nodes in order
      for (const nodeId of this.executionOrder) {
        await this.executeNode(nodeId);
      }
      
      // Collect results from sink nodes
      const results = {};
      for (const [nodeId, node] of this.nodes.entries()) {
        if (node.type === 'sink' || node.outputs.length === 0) {
          results[nodeId] = {
            data: Object.fromEntries(node.outputData),
            node: node.name
          };
        }
      }
      
      this.results = new Map(Object.entries(results));
      return results;
      
    } catch (error) {
      throw new Error(`Circuit execution failed: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  // Execute a single node
  async executeNode(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node || node.executed) return;
    
    try {
      // Skip source nodes (they have their data set externally)
      if (node.type === 'source') {
        node.executed = true;
        return;
      }
      
      // Collect input data from connected nodes
      this.collectInputData(nodeId);
      
      // Execute the node's operation
      if (node.operation && typeof node.operation === 'function') {
        const inputs = Object.fromEntries(node.inputData);
        const params = node.parameters;
        
        let result;
        if (node.inputs.length === 1 && node.inputs[0] === 'input') {
          // Single input operation
          result = await node.operation(inputs.input, params);
        } else {
          // Multiple input operation
          result = await node.operation(inputs, params);
        }
        
        // Store results in output ports
        if (node.outputs.length === 1 && node.outputs[0] === 'output') {
          node.outputData.set('output', result);
        } else {
          // Multiple outputs - result should be an object
          for (const output of node.outputs) {
            if (result && typeof result === 'object' && output in result) {
              node.outputData.set(output, result[output]);
            }
          }
        }
      }
      
      node.executed = true;
      
    } catch (error) {
      node.error = error.message;
      throw new Error(`Node '${nodeId}' execution failed: ${error.message}`);
    }
  }

  // Collect input data for a node from its connections
  collectInputData(nodeId) {
    const node = this.nodes.get(nodeId);
    node.inputData.clear();
    
    // Find all connections that feed into this node
    for (const connections of this.connections.values()) {
      for (const conn of connections) {
        if (conn.to === nodeId) {
          const sourceNode = this.nodes.get(conn.from);
          if (sourceNode && sourceNode.outputData.has(conn.output)) {
            node.inputData.set(conn.input, sourceNode.outputData.get(conn.output));
          }
        }
      }
    }
  }

  // Get circuit as serializable object for saving/loading
  serialize() {
    const nodes = {};
    for (const [id, node] of this.nodes.entries()) {
      nodes[id] = {
        type: node.type,
        operation: node.operation?.name || 'custom',
        name: node.name,
        description: node.description,
        inputs: node.inputs,
        outputs: node.outputs,
        parameters: node.parameters,
        position: node.position,
        color: node.color
      };
    }
    
    const connections = [];
    for (const conns of this.connections.values()) {
      connections.push(...conns);
    }
    
    return {
      nodes: nodes,
      connections: connections,
      version: '1.0.0'
    };
  }

  // Load circuit from serialized data
  deserialize(data, operationMap = {}) {
    this.nodes.clear();
    this.connections.clear();
    
    // Restore nodes
    for (const [id, nodeData] of Object.entries(data.nodes)) {
      const operation = operationMap[nodeData.operation] || null;
      this.addNode(id, {
        ...nodeData,
        operation: operation
      });
    }
    
    // Restore connections
    for (const conn of data.connections) {
      this.connect(conn.from, conn.output, conn.to, conn.input);
    }
  }

  // Get visual representation of the circuit
  getVisualization() {
    const nodes = [];
    const edges = [];
    
    for (const [id, node] of this.nodes.entries()) {
      nodes.push({
        id: id,
        label: node.name,
        type: node.type,
        position: node.position,
        color: node.color,
        inputs: node.inputs,
        outputs: node.outputs,
        executed: node.executed,
        error: node.error
      });
    }
    
    for (const connections of this.connections.values()) {
      for (const conn of connections) {
        edges.push({
          id: conn.id,
          from: conn.from,
          to: conn.to,
          fromPort: conn.output,
          toPort: conn.input
        });
      }
    }
    
    return { nodes, edges };
  }

  // Helper to get node color based on type
  getNodeColor(type) {
    const colors = {
      source: '#4CAF50',      // Green
      processor: '#2196F3',   // Blue
      sink: '#FF9800',        // Orange
      analysis: '#9C27B0',    // Purple
      crypto: '#F44336',      // Red
      transform: '#00BCD4'    // Cyan
    };
    return colors[type] || '#757575';
  }

  // Validate circuit for common issues
  validate() {
    const issues = [];
    
    // Check for unconnected inputs
    for (const [nodeId, node] of this.nodes.entries()) {
      if (node.type !== 'source') {
        for (const input of node.inputs) {
          let connected = false;
          for (const connections of this.connections.values()) {
            if (connections.some(conn => conn.to === nodeId && conn.input === input)) {
              connected = true;
              break;
            }
          }
          if (!connected) {
            issues.push(`Node '${nodeId}' has unconnected input '${input}'`);
          }
        }
      }
    }
    
    // Check for circular dependencies
    try {
      this.calculateExecutionOrder();
    } catch (error) {
      issues.push(error.message);
    }
    
    return {
      valid: issues.length === 0,
      issues: issues
    };
  }
}

// Pre-built node templates for common operations
export class NodeTemplates {
  // Data source node
  static dataSource(id, data) {
    return {
      id: id,
      type: 'source',
      name: 'Data Source',
      operation: () => data,
      inputs: [],
      outputs: ['output'],
      parameters: { data: data }
    };
  }

  // Text input node
  static textInput(id, text = '') {
    return {
      id: id,
      type: 'source',
      name: 'Text Input',
      operation: () => text,
      inputs: [],
      outputs: ['output'],
      parameters: { text: text }
    };
  }

  // Hex input node
  static hexInput(id, hex = '') {
    return {
      id: id,
      type: 'source',
      name: 'Hex Input',
      operation: () => hex,
      inputs: [],
      outputs: ['output'],
      parameters: { hex: hex }
    };
  }

  // XOR cipher node
  static xorCipher(id, key = '') {
    return {
      id: id,
      type: 'processor',
      name: 'XOR Cipher',
      operation: (input, params) => {
        const keyStr = params.key || key;
        if (!keyStr) throw new Error('XOR key required');
        
        const inputBytes = new TextEncoder().encode(input);
        const keyBytes = new TextEncoder().encode(keyStr);
        const result = new Uint8Array(inputBytes.length);
        
        for (let i = 0; i < inputBytes.length; i++) {
          result[i] = inputBytes[i] ^ keyBytes[i % keyBytes.length];
        }
        
        return new TextDecoder().decode(result);
      },
      inputs: ['input'],
      outputs: ['output'],
      parameters: { key: key }
    };
  }

  // Base64 encode node
  static base64Encode(id) {
    return {
      id: id,
      type: 'processor',
      name: 'Base64 Encode',
      operation: (input) => btoa(unescape(encodeURIComponent(input))),
      inputs: ['input'],
      outputs: ['output']
    };
  }

  // Base64 decode node
  static base64Decode(id) {
    return {
      id: id,
      type: 'processor',
      name: 'Base64 Decode',
      operation: (input) => decodeURIComponent(escape(atob(input))),
      inputs: ['input'],
      outputs: ['output']
    };
  }

  // Hex encode node
  static hexEncode(id) {
    return {
      id: id,
      type: 'processor',
      name: 'Hex Encode',
      operation: (input) => {
        return new TextEncoder().encode(input)
          .reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
      },
      inputs: ['input'],
      outputs: ['output']
    };
  }

  // Output display node
  static output(id, format = 'text') {
    return {
      id: id,
      type: 'sink',
      name: 'Output',
      operation: (input) => ({ [format]: input }),
      inputs: ['input'],
      outputs: [],
      parameters: { format: format }
    };
  }

  // Analysis node
  static analyze(id) {
    return {
      id: id,
      type: 'analysis',
      name: 'Data Analysis',
      operation: (input) => {
        const length = input.length;
        const chars = {};
        for (const char of input) {
          chars[char] = (chars[char] || 0) + 1;
        }
        
        return {
          length: length,
          uniqueChars: Object.keys(chars).length,
          frequencies: chars,
          entropy: calculateEntropy(chars, length)
        };
      },
      inputs: ['input'],
      outputs: ['analysis'],
      color: '#9C27B0'
    };
  }
}

// Helper function for entropy calculation
function calculateEntropy(freq, total) {
  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / total;
    entropy -= p * Math.log2(p);
  }
  return entropy.toFixed(4);
}

// Export the circuit system
export { DataCircuit as default };