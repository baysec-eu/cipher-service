import React, { useState } from 'react';
import { parameterDefinitions, operationParameters } from '../lib/parameterDefinitions.js';
import { Settings, X, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';

const EnhancedRecipeStep = ({ step, index, operation, onRemove, onUpdateParams, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const [showParams, setShowParams] = useState(false);
  
  // Get parameter configuration for this operation
  const opConfig = operationParameters[step.id] || {};
  const paramList = operation.params || [];
  
  const handleParamChange = (paramName, value) => {
    onUpdateParams(index, paramName, value);
  };
  
  const renderParameterInput = (paramName) => {
    const paramDef = parameterDefinitions[paramName] || {};
    const currentValue = step.params[paramName] ?? paramDef.default ?? '';
    
    // Check if parameter should be visible based on conditions
    if (paramDef.showIf) {
      const conditions = Object.entries(paramDef.showIf);
      const shouldShow = conditions.every(([dependParam, expectedValues]) => {
        const dependValue = step.params[dependParam];
        if (Array.isArray(expectedValues)) {
          return expectedValues.includes(dependValue);
        }
        return dependValue === expectedValues;
      });
      if (!shouldShow) return null;
    }
    
    return (
      <div key={paramName} className="param-input-group">
        <label className="param-label">
          {paramDef.label || paramName}
          {paramDef.description && (
            <span className="param-tooltip" title={paramDef.description}>
              ⓘ
            </span>
          )}
        </label>
        
        {paramDef.type === 'select' ? (
          <select
            className="param-select"
            value={currentValue}
            onChange={(e) => handleParamChange(paramName, e.target.value)}
          >
            {paramDef.options?.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                className={option.warning ? 'warning' : option.recommended ? 'recommended' : ''}
              >
                {option.label}
                {option.recommended && ' ★'}
                {option.warning && ' ⚠'}
              </option>
            ))}
          </select>
        ) : paramDef.type === 'number' ? (
          <input
            type="number"
            className="param-input"
            value={currentValue}
            min={paramDef.min}
            max={paramDef.max}
            onChange={(e) => handleParamChange(paramName, parseInt(e.target.value) || 0)}
            placeholder={paramDef.placeholder || `Enter ${paramName}`}
          />
        ) : (
          <input
            type="text"
            className="param-input"
            value={currentValue}
            onChange={(e) => handleParamChange(paramName, e.target.value)}
            placeholder={paramDef.placeholder || `Enter ${paramName}`}
          />
        )}
        
        {paramDef.validation?.message && (
          <div className="param-hint">{paramDef.validation.message}</div>
        )}
      </div>
    );
  };
  
  const hasParams = paramList.length > 0;
  
  return (
    <div className={`recipe-step ${step.type}`}>
      <div className="recipe-step-header">
        <div className="recipe-step-drag">
          <GripVertical size={14} />
        </div>
        
        <div className="recipe-step-content">
          <span className="recipe-step-name">{step.name}</span>
          {hasParams && (
            <div className="recipe-step-params-inline">
              {paramList.map(paramName => {
                const value = step.params[paramName];
                if (value === undefined || value === '') return null;
                const paramDef = parameterDefinitions[paramName] || {};
                return (
                  <span key={paramName} className="param-badge">
                    {paramDef.label || paramName}: {value}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="recipe-step-controls">
          {hasParams && (
            <button
              className="recipe-step-control"
              onClick={() => setShowParams(!showParams)}
              title="Edit parameters"
            >
              <Settings size={12} />
            </button>
          )}
          
          <div className="recipe-step-move-controls">
            <button
              className="recipe-step-control"
              onClick={() => onMoveUp(index)}
              disabled={isFirst}
              title="Move up"
            >
              <ChevronUp size={12} />
            </button>
            <button
              className="recipe-step-control"
              onClick={() => onMoveDown(index)}
              disabled={isLast}
              title="Move down"
            >
              <ChevronDown size={12} />
            </button>
          </div>
          
          <button
            className="recipe-step-remove"
            onClick={() => onRemove(index)}
            title="Remove from recipe"
          >
            <X size={12} />
          </button>
        </div>
      </div>
      
      {showParams && hasParams && (
        <div className="recipe-step-params-panel">
          {paramList.map(paramName => renderParameterInput(paramName))}
        </div>
      )}
    </div>
  );
};

export default EnhancedRecipeStep;