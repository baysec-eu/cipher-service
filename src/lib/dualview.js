// Dual view system: Linear recipes vs Graph circuits with variable passing
// Handles conversion between views and prevents lossy conversions

import { DataCircuit } from './circuit.js';

export class DualViewManager {
  constructor() {
    this.currentView = 'linear'; // 'linear' or 'graph'
    this.linearRecipe = null;
    this.graphCircuit = null;
    this.variables = new Map();
    this.conversionLocked = false; // Prevents going back to linear if graph is too complex
    this.complexity = {
      nodeCount: 0,
      connectionCount: 0,
      hasLoops: false,
      hasBranches: false,
      hasConditionals: false
    };
  }

  // Initialize with linear recipe
  initializeLinear(recipe) {
    this.currentView = 'linear';
    this.linearRecipe = recipe;
    this.graphCircuit = null;
    this.conversionLocked = false;
    this.updateComplexity();
    
    return {
      view: 'linear',
      canConvertToGraph: true,
      recipe: recipe
    };
  }

  // Initialize with graph circuit
  initializeGraph(circuit) {
    this.currentView = 'graph';
    this.graphCircuit = circuit;
    this.linearRecipe = null;
    this.updateComplexity();
    
    return {
      view: 'graph',
      canConvertToLinear: this.canConvertToLinear(),
      circuit: circuit
    };
  }

  // Convert linear recipe to graph circuit
  convertToGraph() {
    if (this.currentView !== 'linear' || !this.linearRecipe) {
      throw new Error('No linear recipe to convert');
    }

    const circuit = this.createCircuitFromRecipe(this.linearRecipe);
    this.graphCircuit = circuit;
    this.currentView = 'graph';
    this.updateComplexity();

    return {
      success: true,
      view: 'graph',
      circuit: circuit,
      canConvertBack: this.canConvertToLinear()
    };
  }

  // Convert graph circuit to linear recipe  
  convertToLinear() {
    if (this.currentView !== 'graph' || !this.graphCircuit) {
      throw new Error('No graph circuit to convert');
    }

    if (!this.canConvertToLinear()) {
      throw new Error('Circuit is too complex to convert to linear recipe. Contains loops, branches, or conditionals.');
    }

    try {
      const recipe = this.createRecipeFromCircuit(this.graphCircuit);
      this.linearRecipe = recipe;
      this.currentView = 'linear';
      this.conversionLocked = false;

      return {
        success: true,
        view: 'linear',
        recipe: recipe
      };
    } catch (error) {
      throw new Error(`Conversion failed: ${error.message}`);
    }
  }

  // Check if graph can be converted to linear
  canConvertToLinear() {
    if (!this.graphCircuit) return false;

    const complexity = this.calculateComplexity(this.graphCircuit);
    
    // Can convert if it's a simple linear chain
    return !complexity.hasLoops && 
           !complexity.hasBranches && 
           !complexity.hasConditionals &&
           complexity.nodeCount <= 20; // Reasonable limit
  }

  // Create circuit from linear recipe
  createCircuitFromRecipe(recipe) {
    // DataCircuit imported at module level
    const circuit = new DataCircuit();
    
    let nodeId = 1;
    let previousNodeId = null;

    // Add input node
    const inputNode = circuit.addNode(`input_${nodeId}`, {
      type: 'source',
      name: 'Input Data',
      operation: (data) => data,
      inputs: [],
      outputs: ['output'],
      position: { x: 50, y: 200 }
    });
    previousNodeId = `input_${nodeId}`;
    nodeId++;

    // Add operation nodes from recipe steps
    for (const step of recipe.operations || []) {
      const currentNodeId = `op_${nodeId}`;
      
      circuit.addNode(currentNodeId, {
        type: 'processor',
        name: step.name || step.operation,
        operation: step.func || this.getOperationFunction(step.operation),
        inputs: ['input'],
        outputs: ['output'],
        parameters: step.parameters || {},
        position: { x: 50 + (nodeId * 150), y: 200 }
      });

      // Connect to previous node
      if (previousNodeId) {
        circuit.connect(previousNodeId, 'output', currentNodeId, 'input');
      }

      previousNodeId = currentNodeId;
      nodeId++;
    }

    // Add output node
    const outputNodeId = `output_${nodeId}`;
    circuit.addNode(outputNodeId, {
      type: 'sink',
      name: 'Output',
      operation: (data) => ({ result: data }),
      inputs: ['input'],
      outputs: [],
      position: { x: 50 + (nodeId * 150), y: 200 }
    });

    if (previousNodeId) {
      circuit.connect(previousNodeId, 'output', outputNodeId, 'input');
    }

    return circuit;
  }

  // Create recipe from circuit (only for simple linear circuits)
  createRecipeFromCircuit(circuit) {
    const order = circuit.calculateExecutionOrder();
    const operations = [];

    // Skip source and sink nodes, process only operation nodes
    for (const nodeId of order) {
      const node = circuit.nodes.get(nodeId);
      
      if (node.type === 'processor') {
        operations.push({
          id: node.id,
          name: node.name,
          operation: node.operation?.name || 'custom',
          parameters: node.parameters || {},
          type: 'encode' // Default type
        });
      }
    }

    return {
      format: 'encoder-recipe',
      version: '1.0.0',
      metadata: {
        name: 'Converted from Graph',
        description: 'Linear recipe converted from graph circuit',
        created: new Date().toISOString(),
        convertedFrom: 'graph'
      },
      operations: operations
    };
  }

  // Calculate circuit complexity
  calculateComplexity(circuit) {
    if (!circuit) return this.complexity;

    const nodeCount = circuit.nodes.size;
    let connectionCount = 0;
    let hasLoops = false;
    let hasBranches = false;
    let hasConditionals = false;

    // Count connections and detect complexity
    const outgoingConnections = new Map();
    const incomingConnections = new Map();

    for (const connections of circuit.connections.values()) {
      connectionCount += connections.length;
      
      for (const conn of connections) {
        // Track outgoing connections per node
        const outgoing = outgoingConnections.get(conn.from) || [];
        outgoing.push(conn);
        outgoingConnections.set(conn.from, outgoing);

        // Track incoming connections per node
        const incoming = incomingConnections.get(conn.to) || [];
        incoming.push(conn);
        incomingConnections.set(conn.to, incoming);
      }
    }

    // Detect branches (nodes with multiple outgoing connections)
    for (const [nodeId, connections] of outgoingConnections.entries()) {
      if (connections.length > 1) {
        hasBranches = true;
        break;
      }
    }

    // Detect loops using DFS
    const visited = new Set();
    const recursionStack = new Set();

    const detectLoop = (nodeId) => {
      if (recursionStack.has(nodeId)) {
        hasLoops = true;
        return true;
      }
      
      if (visited.has(nodeId)) return false;
      
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const connections = outgoingConnections.get(nodeId) || [];
      for (const conn of connections) {
        if (detectLoop(conn.to)) return true;
      }
      
      recursionStack.delete(nodeId);
      return false;
    };

    // Check all nodes for loops
    for (const nodeId of circuit.nodes.keys()) {
      if (!visited.has(nodeId)) {
        if (detectLoop(nodeId)) break;
      }
    }

    // Check for conditional nodes
    for (const node of circuit.nodes.values()) {
      if (node.type === 'conditional' || node.name?.toLowerCase().includes('conditional')) {
        hasConditionals = true;
        break;
      }
    }

    const complexity = {
      nodeCount,
      connectionCount,
      hasLoops,
      hasBranches,
      hasConditionals
    };

    this.complexity = complexity;
    return complexity;
  }

  // Update complexity and lock status
  updateComplexity() {
    if (this.graphCircuit) {
      this.calculateComplexity(this.graphCircuit);
      
      // Lock conversion if graph is too complex
      if (this.complexity.hasLoops || 
          this.complexity.hasBranches || 
          this.complexity.hasConditionals ||
          this.complexity.nodeCount > 20) {
        this.conversionLocked = true;
      }
    } else {
      // Simple linear recipe
      this.complexity = {
        nodeCount: this.linearRecipe?.operations?.length || 0,
        connectionCount: Math.max(0, (this.linearRecipe?.operations?.length || 1) - 1),
        hasLoops: false,
        hasBranches: false,
        hasConditionals: false
      };
    }
  }

  // Variable management
  setVariable(name, value, scope = 'global') {
    const key = `${scope}:${name}`;
    this.variables.set(key, {
      name,
      value,
      scope,
      timestamp: Date.now()
    });
  }

  getVariable(name, scope = 'global') {
    const key = `${scope}:${name}`;
    const variable = this.variables.get(key);
    return variable ? variable.value : undefined;
  }

  // Get current state
  getCurrentState() {
    return {
      view: this.currentView,
      canConvertToGraph: this.currentView === 'linear' && !!this.linearRecipe,
      canConvertToLinear: this.currentView === 'graph' && this.canConvertToLinear(),
      conversionLocked: this.conversionLocked,
      complexity: this.complexity,
      hasData: !!(this.linearRecipe || this.graphCircuit),
      variables: Object.fromEntries(this.variables)
    };
  }

  // Get operation function by name (stub - would connect to actual operations)
  getOperationFunction(operationName) {
    // This would connect to your actual operation implementations
    const operationMap = {
      'base64_encode': (input) => btoa(unescape(encodeURIComponent(input))),
      'base64_decode': (input) => decodeURIComponent(escape(atob(input))),
      'hex_encode': (input) => new TextEncoder().encode(input).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), ''),
      'url_encode': (input) => encodeURIComponent(input),
      'xor_cipher': (input, params = {}) => {
        const key = params.key || 'key';
        const inputBytes = new TextEncoder().encode(input);
        const keyBytes = new TextEncoder().encode(key);
        const result = new Uint8Array(inputBytes.length);
        
        for (let i = 0; i < inputBytes.length; i++) {
          result[i] = inputBytes[i] ^ keyBytes[i % keyBytes.length];
        }
        
        return new TextDecoder().decode(result);
      }
    };

    return operationMap[operationName] || ((input) => input);
  }

  // Export current configuration
  export() {
    if (this.currentView === 'linear' && this.linearRecipe) {
      return {
        type: 'linear',
        data: this.linearRecipe,
        complexity: this.complexity
      };
    } else if (this.currentView === 'graph' && this.graphCircuit) {
      return {
        type: 'graph',
        data: this.graphCircuit.serialize(),
        complexity: this.complexity,
        conversionLocked: this.conversionLocked
      };
    }
    
    return null;
  }

  // Import configuration
  import(config) {
    if (config.type === 'linear') {
      return this.initializeLinear(config.data);
    } else if (config.type === 'graph') {
      // DataCircuit imported at module level
      const circuit = new DataCircuit();
      circuit.deserialize(config.data);
      return this.initializeGraph(circuit);
    }
    
    throw new Error('Invalid configuration format');
  }
}

// Variable passing system for nodes
export class VariableManager {
  constructor() {
    this.globalScope = new Map();
    this.nodeScopes = new Map();
    this.connections = new Map(); // variable connections between nodes
  }

  // Set variable in a specific scope
  setVariable(name, value, scope = 'global', nodeId = null) {
    if (scope === 'global') {
      this.globalScope.set(name, {
        name,
        value,
        type: typeof value,
        timestamp: Date.now()
      });
    } else if (scope === 'node' && nodeId) {
      if (!this.nodeScopes.has(nodeId)) {
        this.nodeScopes.set(nodeId, new Map());
      }
      this.nodeScopes.get(nodeId).set(name, {
        name,
        value,
        type: typeof value,
        nodeId,
        timestamp: Date.now()
      });
    }
  }

  // Get variable from scope chain
  getVariable(name, nodeId = null) {
    // Check node scope first
    if (nodeId && this.nodeScopes.has(nodeId)) {
      const nodeScope = this.nodeScopes.get(nodeId);
      if (nodeScope.has(name)) {
        return nodeScope.get(name).value;
      }
    }

    // Check global scope
    if (this.globalScope.has(name)) {
      return this.globalScope.get(name).value;
    }

    return undefined;
  }

  // Connect variable output from one node to input of another
  connectVariable(fromNodeId, variableName, toNodeId, inputName) {
    const connectionId = `${fromNodeId}:${variableName}->${toNodeId}:${inputName}`;
    
    this.connections.set(connectionId, {
      from: fromNodeId,
      variable: variableName,
      to: toNodeId,
      input: inputName,
      id: connectionId
    });

    return connectionId;
  }

  // Get all variables in scope
  getAllVariables(nodeId = null) {
    const variables = {};

    // Add global variables
    for (const [name, variable] of this.globalScope.entries()) {
      variables[name] = {
        ...variable,
        scope: 'global'
      };
    }

    // Add node-specific variables
    if (nodeId && this.nodeScopes.has(nodeId)) {
      for (const [name, variable] of this.nodeScopes.get(nodeId).entries()) {
        variables[name] = {
          ...variable,
          scope: 'node'
        };
      }
    }

    return variables;
  }

  // Clear variables
  clearScope(scope = 'global', nodeId = null) {
    if (scope === 'global') {
      this.globalScope.clear();
    } else if (scope === 'node' && nodeId) {
      this.nodeScopes.delete(nodeId);
    } else if (scope === 'all') {
      this.globalScope.clear();
      this.nodeScopes.clear();
      this.connections.clear();
    }
  }
}

export { DualViewManager as default };
// VariableManager is already exported as a class declaration above