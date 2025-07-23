import React, { useState, useRef } from 'react';
import { X, GripVertical, Settings, ChevronDown, ChevronUp, Download, Upload, Save } from 'lucide-react';
import './notifications.css';

const RecipeStep = ({ step, index, onRemove, onUpdateParams, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const [showParams, setShowParams] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleParamChange = (paramName, value) => {
    onUpdateParams(index, paramName, value);
  };

  const hasParams = step.params && Object.keys(step.params).length > 0;

  return (
    <div 
      className={`recipe-step ${step.type} ${isDragging ? 'dragging' : ''}`}
      ref={dragRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="recipe-step-header">
        <div className="recipe-step-drag">
          <GripVertical size={14} />
        </div>
        
        <div className="recipe-step-content">
          <span className="recipe-step-name">{step.name}</span>
          {hasParams && (
            <div className="recipe-step-params-inline">
              {Object.entries(step.params).map(([key, value]) => (
                <span key={key} className="param-badge">
                  {key}: {value}
                </span>
              ))}
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
          {Object.entries(step.params).map(([paramName, value]) => (
            <div key={paramName} className="param-input-group">
              <label className="param-label">{paramName}:</label>
              <input
                type={getInputType(paramName)}
                className="param-input-full"
                value={value}
                onChange={(e) => handleParamChange(paramName, e.target.value)}
                placeholder={getPlaceholder(paramName)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const getInputType = (paramName) => {
  if (['shift', 'rails', 'a', 'b', 'key'].includes(paramName.toLowerCase())) {
    return 'number';
  }
  return 'text';
};

const getPlaceholder = (paramName) => {
  const placeholders = {
    key: 'Enter cipher key',
    keyStr: 'Enter key string',
    shift: 'Enter shift value',
    rails: 'Number of rails',
    a: 'Multiplier (must be coprime to 26)',
    b: 'Shift value',
    key1: 'First key',
    key2: 'Second key',
    alphabet: 'Custom alphabet'
  };
  return placeholders[paramName] || `Enter ${paramName}`;
};

const Recipe = ({ recipe, onUpdateRecipe }) => {
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex !== dropIndex) {
      const newRecipe = [...recipe];
      const [draggedItem] = newRecipe.splice(dragIndex, 1);
      newRecipe.splice(dropIndex, 0, draggedItem);
      onUpdateRecipe(newRecipe);
    }
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const removeStep = (index) => {
    const newRecipe = recipe.filter((_, i) => i !== index);
    onUpdateRecipe(newRecipe);
  };

  const updateStepParams = (index, paramName, value) => {
    const newRecipe = [...recipe];
    if (!newRecipe[index].params) {
      newRecipe[index].params = {};
    }
    
    // Convert to appropriate type
    if (['shift', 'rails', 'a', 'b', 'key'].includes(paramName.toLowerCase()) && !isNaN(value)) {
      newRecipe[index].params[paramName] = parseInt(value) || 0;
    } else {
      newRecipe[index].params[paramName] = value;
    }
    
    onUpdateRecipe(newRecipe);
  };

  const moveStepUp = (index) => {
    if (index > 0) {
      const newRecipe = [...recipe];
      [newRecipe[index - 1], newRecipe[index]] = [newRecipe[index], newRecipe[index - 1]];
      onUpdateRecipe(newRecipe);
    }
  };

  const moveStepDown = (index) => {
    if (index < recipe.length - 1) {
      const newRecipe = [...recipe];
      [newRecipe[index], newRecipe[index + 1]] = [newRecipe[index + 1], newRecipe[index]];
      onUpdateRecipe(newRecipe);
    }
  };

  const clearRecipe = () => {
    onUpdateRecipe([]);
  };


  const exportRecipe = () => {
    const recipeData = {
      name: `Recipe_${new Date().toISOString().split('T')[0]}_${Date.now()}`,
      version: "1.0",
      description: "Exported recipe from Encoder",
      steps: recipe,
      created: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(recipeData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipeData.name}.recipe.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadRecipe = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const recipeData = JSON.parse(text);
      
      // Validate recipe format
      if (!recipeData.steps || !Array.isArray(recipeData.steps)) {
        throw new Error('Invalid recipe format: missing steps array');
      }

      // Validate each step
      for (const step of recipeData.steps) {
        if (!step.id || !step.name || !step.type) {
          throw new Error('Invalid recipe format: steps must have id, name, and type');
        }
      }

      onUpdateRecipe(recipeData.steps);
      
      // Show success notification with better styling
      const notification = document.createElement('div');
      notification.className = 'recipe-notification success';
      notification.innerHTML = `
        <div class="notification-content">
          <strong>✅ Recipe Imported Successfully!</strong>
          <div>Loaded "${recipeData.name}" with ${recipeData.steps.length} operations</div>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 4000);
    } catch (error) {
      alert(`Failed to load recipe: ${error.message}`);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const exportRecipeAsText = () => {
    if (recipe.length === 0) {
      alert('No recipe to export');
      return;
    }

    const textContent = recipe.map((step, index) => {
      let stepText = `${index + 1}. ${step.name}`;
      if (step.params && Object.keys(step.params).length > 0) {
        const params = Object.entries(step.params)
          .map(([key, value]) => `${key}=${value}`)
          .join(', ');
        stepText += ` (${params})`;
      }
      return stepText;
    }).join('\n');

    const fullText = `# Encoder Recipe\n# Created: ${new Date().toISOString()}\n# Steps: ${recipe.length}\n\n${textContent}`;

    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recipe_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="recipe-panel">
      <div className="recipe-header">
        <h3>Recipe ({recipe.length} operations)</h3>
        <div className="recipe-controls">
          {recipe.length > 0 && (
            <button className="recipe-button export-button" onClick={exportRecipe} title="Export recipe as JSON (importable)">
              <Download size={14} />
              Export
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            accept=".recipe.json,.json"
            onChange={loadRecipe}
            style={{ display: 'none' }}
          />
          <button 
            className="recipe-button load-button" 
            onClick={() => fileInputRef.current?.click()} 
            title="Import recipe from JSON file"
          >
            <Upload size={14} />
            Import
          </button>
          <button className="clear-button" onClick={clearRecipe}>
            Clear All
          </button>
        </div>
      </div>
      
      <div className="recipe-steps-container">
        {recipe.length === 0 ? (
          <div className="recipe-empty-state">
            <p>Click operations from the sidebar to build your recipe</p>
            <div className="recipe-help">
              <span>💡 You can drag operations to reorder them</span>
            </div>
          </div>
        ) : (
          recipe.map((step, index) => (
            <div
              key={`${step.id}-${index}`}
              className={`recipe-step-wrapper ${dragOverIndex === index ? 'drag-over' : ''}`}
              onDrop={(e) => handleDrop(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
            >
              <RecipeStep
                step={step}
                index={index}
                onRemove={removeStep}
                onUpdateParams={updateStepParams}
                onMoveUp={moveStepUp}
                onMoveDown={moveStepDown}
                isFirst={index === 0}
                isLast={index === recipe.length - 1}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Recipe;