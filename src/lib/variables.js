// Variable management system for graph mode
export class VariableManager {
  constructor() {
    this.variables = new Map();
    this.listeners = new Set();
  }

  // Set variable value
  setVariable(name, value, type = 'string') {
    this.variables.set(name, {
      name,
      value,
      type,
      timestamp: Date.now(),
      id: `var_${name}`
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
}

// Variable operations for the operation list
export const variableOperations = [
  {
    id: 'create_variable',
    name: 'Create Variable',
    type: 'variable',
    category: 'variables',
    params: ['name', 'value'],
    func: (input, params) => {
      // This will be handled by the graph system
      return input;
    }
  },
  {
    id: 'get_variable',
    name: 'Get Variable',
    type: 'variable',
    category: 'variables',
    params: ['name'],
    func: (input, params) => {
      // This will be handled by the graph system
      return input;
    }
  },
  {
    id: 'set_variable',
    name: 'Set Variable',
    type: 'variable',
    category: 'variables',
    params: ['name'],
    func: (input, params) => {
      // This will be handled by the graph system
      return input;
    }
  }
];

// Output sink operations
export const sinkOperations = [
  {
    id: 'output_sink',
    name: 'Output Sink',
    type: 'sink',
    category: 'outputs',
    params: ['label'],
    func: (input, params) => {
      return input;
    }
  },
  {
    id: 'variable_sink',
    name: 'Variable Sink',
    type: 'sink',
    category: 'outputs',
    params: ['variable'],
    func: (input, params) => {
      return input;
    }
  },
  {
    id: 'file_sink',
    name: 'File Sink',
    type: 'sink',
    category: 'outputs',
    params: ['filename'],
    func: (input, params) => {
      return input;
    }
  }
];

export default VariableManager;