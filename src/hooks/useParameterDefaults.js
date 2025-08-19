import { parameterDefinitions, operationParameters } from '../lib/parameterDefinitions.js';

export function useParameterDefaults() {
  const getDefaultParams = (operation) => {
    const params = {};
    
    // Check if we have parameter configuration for this operation
    const opConfig = operationParameters[operation.id];
    if (opConfig && opConfig.defaults) {
      // Use configured defaults
      Object.entries(opConfig.defaults).forEach(([key, value]) => {
        params[key] = value;
      });
    } else if (operation.params) {
      // Fall back to parameter definitions
      operation.params.forEach(paramName => {
        const paramDef = parameterDefinitions[paramName];
        if (paramDef && paramDef.default !== undefined) {
          params[paramName] = paramDef.default;
        } else {
          // Intelligent defaults based on parameter name
          params[paramName] = getIntelligentDefault(paramName, operation.id);
        }
      });
    }
    
    return params;
  };
  
  const getIntelligentDefault = (paramName, operationId) => {
    // Crypto-specific defaults
    if (operationId.includes('aes') || operationId.includes('des') || operationId.includes('blowfish')) {
      if (paramName === 'key') return '';
      if (paramName === 'keyFormat') return 'auto';
      if (paramName === 'outputFormat') return 'base64';
      if (paramName === 'mode') return 'GCM';
      if (paramName === 'iterations') return 100000;
    }
    
    // Hash-specific defaults
    if (operationId.includes('bcrypt')) {
      if (paramName === 'rounds') return 10;
    }
    
    if (operationId.includes('scrypt')) {
      if (paramName === 'N') return 16384;
      if (paramName === 'r') return 8;
      if (paramName === 'p') return 1;
    }
    
    if (operationId.includes('argon2')) {
      if (paramName === 'iterations') return 3;
      if (paramName === 'memory') return 4096;
      if (paramName === 'parallelism') return 1;
    }
    
    // Cipher defaults
    if (paramName === 'shift') return 3;
    if (paramName === 'rails') return 3;
    if (paramName === 'a') return 5;
    if (paramName === 'b') return 8;
    if (paramName === 'keyStr' || paramName === 'key') return '';
    if (paramName === 'alphabet') return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // Generic defaults
    return '';
  };
  
  const validateParameter = (paramName, value) => {
    const paramDef = parameterDefinitions[paramName];
    if (!paramDef || !paramDef.validation) return { valid: true };
    
    const validation = paramDef.validation;
    
    if (validation.required && !value) {
      return { valid: false, message: `${paramDef.label || paramName} is required` };
    }
    
    if (validation.minLength && value.length < validation.minLength) {
      return { valid: false, message: `${paramDef.label || paramName} must be at least ${validation.minLength} characters` };
    }
    
    if (validation.pattern && !validation.pattern.test(value)) {
      return { valid: false, message: validation.message || `Invalid format for ${paramDef.label || paramName}` };
    }
    
    if (paramDef.type === 'number') {
      const numValue = parseInt(value) || 0;
      if (paramDef.min !== undefined && numValue < paramDef.min) {
        return { valid: false, message: `${paramDef.label || paramName} must be at least ${paramDef.min}` };
      }
      if (paramDef.max !== undefined && numValue > paramDef.max) {
        return { valid: false, message: `${paramDef.label || paramName} must be at most ${paramDef.max}` };
      }
    }
    
    return { valid: true };
  };
  
  return {
    getDefaultParams,
    validateParameter
  };
}