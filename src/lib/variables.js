// Enhanced variable management system for graph mode with proper piping
export class VariableManager {
  constructor() {
    this.variables = new Map();
    this.listeners = new Set();
    this.parameterConnections = new Map(); // nodeId:paramName -> sourceNodeId:outputPort
  }

  // Set variable value
  setVariable(name, value, type = 'string') {
    const oldVariable = this.variables.get(name);
    this.variables.set(name, {
      name,
      value,
      type,
      timestamp: Date.now(),
      id: `var_${name}`,
      previousValue: oldVariable?.value
    });
    this.notifyListeners();
  }

  // Get variable value
  getVariable(name) {
    const variable = this.variables.get(name);
    return variable ? variable.value : undefined;
  }

  // Get all variables
  getAllVariables() {
    return Array.from(this.variables.values());
  }

  // Delete variable
  deleteVariable(name) {
    this.variables.delete(name);
    this.notifyListeners();
  }

  // Clear all variables
  clearVariables() {
    this.variables.clear();
    this.notifyListeners();
  }

  // Subscribe to variable changes
  subscribe(callback) {
    this.listeners.add(callback);
  }

  // Unsubscribe from variable changes
  unsubscribe(callback) {
    this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.getAllVariables()));
  }

  // Substitute variables in text (e.g., "hello $name" with name="world" becomes "hello world")
  substituteVariables(text) {
    if (!text || typeof text !== 'string') return text;
    
    return text.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, varName) => {
      const value = this.getVariable(varName);
      return value !== undefined ? value : match;
    });
  }

  // Export variables
  exportVariables() {
    return {
      format: 'variables-export',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      variables: Object.fromEntries(this.variables)
    };
  }

  // Import variables
  importVariables(data) {
    if (data.format === 'variables-export' && data.variables) {
      this.variables.clear();
      Object.entries(data.variables).forEach(([name, variable]) => {
        this.variables.set(name, variable);
      });
      this.notifyListeners();
      return true;
    }
    return false;
  }

  // Connect parameter to data source
  connectParameter(nodeId, paramName, sourceNodeId, outputPort = 'output') {
    const connectionKey = `${nodeId}:${paramName}`;
    this.parameterConnections.set(connectionKey, `${sourceNodeId}:${outputPort}`);
  }

  // Disconnect parameter from data source
  disconnectParameter(nodeId, paramName) {
    const connectionKey = `${nodeId}:${paramName}`;
    this.parameterConnections.delete(connectionKey);
  }

  // Get parameter value from connection or fallback to direct value
  getParameterValue(nodeId, paramName, fallbackValue, executionResults = new Map()) {
    const connectionKey = `${nodeId}:${paramName}`;
    const connection = this.parameterConnections.get(connectionKey);
    
    if (connection) {
      const [sourceNodeId, outputPort] = connection.split(':');
      const sourceResult = executionResults.get(sourceNodeId);
      if (sourceResult !== undefined) {
        return sourceResult;
      }
    }

    // Check if fallbackValue is a variable reference
    if (typeof fallbackValue === 'string' && fallbackValue.startsWith('$')) {
      const varName = fallbackValue.substring(1);
      const varValue = this.getVariable(varName);
      return varValue !== undefined ? varValue : fallbackValue;
    }

    return fallbackValue;
  }

  // Get all parameter connections
  getParameterConnections() {
    return new Map(this.parameterConnections);
  }
}

// Variable node - universal port system
export const variableOperations = [
  {
    id: 'variable',
    name: 'Variable',
    type: 'variable',
    category: 'variables',
    inputs: ['input'],     // Input port for data flow
    params: ['name', 'value', 'variableManager'], // variableManager hidden in UI
    outputs: ['output', 'aux1', 'aux2', 'aux3'], // Output ports for branching
    func: (input, name, value, variableManager) => {
      const varName = name || 'myVar';
      
      if (!variableManager) {
        // Fallback if no variableManager
        return value || input || '';
      }
      
      // Priority: input port > value parameter > stored value
      let data = '';
      
      if (input !== undefined && input !== '') {
        data = input; // Input port has highest priority
      } else if (value !== undefined && value !== '') {
        data = value; // Parameter port second priority
      } else {
        data = variableManager.getVariable(varName) || ''; // Stored value fallback
      }
      
      // Store the data in variable
      if (data !== '') {
        variableManager.setVariable(varName, data);
      }
      
      return data; // Same value goes to all output ports
    }
  }
];

// Simple output sink
export const sinkOperations = [
  {
    id: 'output_sink',
    name: 'Output Sink',
    type: 'sink',
    category: 'outputs',
    inputs: ['input'],
    params: ['label'],
    func: (input, params) => {
      return input; // Just pass through
    }
  }
];

export default VariableManager;