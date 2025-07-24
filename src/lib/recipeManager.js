// Enhanced Recipe Management System for JSON-based cipher recipes
// Supports loading, saving, and managing cipher operation sequences

export class RecipeManager {
  constructor() {
    this.recipes = new Map();
    this.categories = new Set(['encoding', 'decoding', 'cipher', 'hash', 'analysis', 'custom']);
  }

  // Create a new recipe
  createRecipe(name, description = '', category = 'custom') {
    const recipe = {
      id: `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      category,
      operations: [],
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      version: '1.0.0',
      metadata: {
        author: '',
        tags: [],
        difficulty: 'beginner', // beginner, intermediate, advanced
        estimatedTime: '< 1 min'
      }
    };
    
    this.recipes.set(recipe.id, recipe);
    return recipe;
  }

  // Add operation to recipe
  addOperation(recipeId, operationId, parameters = {}, position = -1) {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      throw new Error(`Recipe ${recipeId} not found`);
    }

    const operation = {
      id: operationId,
      parameters,
      enabled: true, // Operations are enabled by default
      timestamp: Date.now()
    };

    if (position === -1 || position >= recipe.operations.length) {
      recipe.operations.push(operation);
    } else {
      recipe.operations.splice(position, 0, operation);
    }

    recipe.modified = new Date().toISOString();
    return recipe;
  }

  // Remove operation from recipe
  removeOperation(recipeId, operationIndex) {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      throw new Error(`Recipe ${recipeId} not found`);
    }

    if (operationIndex >= 0 && operationIndex < recipe.operations.length) {
      recipe.operations.splice(operationIndex, 1);
      recipe.modified = new Date().toISOString();
    }

    return recipe;
  }

  // Update operation parameters
  updateOperation(recipeId, operationIndex, parameters) {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      throw new Error(`Recipe ${recipeId} not found`);
    }

    if (operationIndex >= 0 && operationIndex < recipe.operations.length) {
      recipe.operations[operationIndex].parameters = { ...parameters };
      recipe.modified = new Date().toISOString();
    }

    return recipe;
  }

  // Toggle operation enabled/disabled state
  toggleOperation(recipeId, operationIndex) {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      throw new Error(`Recipe ${recipeId} not found`);
    }

    if (operationIndex >= 0 && operationIndex < recipe.operations.length) {
      recipe.operations[operationIndex].enabled = !recipe.operations[operationIndex].enabled;
      recipe.modified = new Date().toISOString();
    }

    return recipe;
  }

  // Enable/disable operation
  setOperationEnabled(recipeId, operationIndex, enabled) {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      throw new Error(`Recipe ${recipeId} not found`);
    }

    if (operationIndex >= 0 && operationIndex < recipe.operations.length) {
      recipe.operations[operationIndex].enabled = enabled;
      recipe.modified = new Date().toISOString();
    }

    return recipe;
  }

  // Get recipe by ID
  getRecipe(recipeId) {
    return this.recipes.get(recipeId);
  }

  // Get all recipes
  getAllRecipes() {
    return Array.from(this.recipes.values());
  }

  // Get recipes by category
  getRecipesByCategory(category) {
    return Array.from(this.recipes.values()).filter(recipe => recipe.category === category);
  }

  // Search recipes
  searchRecipes(query) {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.recipes.values()).filter(recipe => 
      recipe.name.toLowerCase().includes(lowerQuery) ||
      recipe.description.toLowerCase().includes(lowerQuery) ||
      recipe.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Export recipe to JSON
  exportRecipe(recipeId) {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      throw new Error(`Recipe ${recipeId} not found`);
    }

    return {
      format: 'cipher-recipe',
      version: '1.0.0',
      exported: new Date().toISOString(),
      recipe: { ...recipe }
    };
  }

  // Import recipe from JSON
  importRecipe(recipeData) {
    if (recipeData.format !== 'cipher-recipe') {
      throw new Error('Invalid recipe format');
    }

    const recipe = recipeData.recipe;
    
    // Generate new ID if importing
    if (this.recipes.has(recipe.id)) {
      recipe.id = `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    recipe.imported = new Date().toISOString();
    this.recipes.set(recipe.id, recipe);
    
    return recipe;
  }

  // Load recipe from file content
  loadRecipeFromJSON(jsonContent) {
    try {
      const recipeData = JSON.parse(jsonContent);
      return this.importRecipe(recipeData);
    } catch (error) {
      throw new Error(`Failed to parse recipe JSON: ${error.message}`);
    }
  }

  // Clone/duplicate recipe
  cloneRecipe(recipeId, newName = null) {
    const originalRecipe = this.recipes.get(recipeId);
    if (!originalRecipe) {
      throw new Error(`Recipe ${recipeId} not found`);
    }

    const clonedRecipe = {
      ...originalRecipe,
      id: `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newName || `${originalRecipe.name} (Copy)`,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      operations: [...originalRecipe.operations] // Deep copy operations array
    };

    this.recipes.set(clonedRecipe.id, clonedRecipe);
    return clonedRecipe;
  }

  // Delete recipe
  deleteRecipe(recipeId) {
    return this.recipes.delete(recipeId);
  }

  // Validate recipe structure
  validateRecipe(recipe) {
    const errors = [];

    if (!recipe.name || recipe.name.trim() === '') {
      errors.push('Recipe name is required');
    }

    if (!recipe.operations || !Array.isArray(recipe.operations)) {
      errors.push('Recipe must have operations array');
    }

    if (!this.categories.has(recipe.category)) {
      errors.push(`Invalid category: ${recipe.category}`);
    }

    // Validate each operation
    if (recipe.operations) {
      recipe.operations.forEach((operation, index) => {
        if (!operation.id) {
          errors.push(`Operation ${index} missing ID`);
        }
        if (typeof operation.parameters !== 'object') {
          errors.push(`Operation ${index} has invalid parameters`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Execute recipe operations (integration with main library)
  async executeRecipe(recipeId, input, applyOperationFunc) {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      throw new Error(`Recipe ${recipeId} not found`);
    }

    let result = input;
    const operationResults = [];

    for (let i = 0; i < recipe.operations.length; i++) {
      const operation = recipe.operations[i];
      
      // Skip disabled operations (they act as if invisible)
      if (operation.enabled === false) {
        operationResults.push({
          operationIndex: i,
          operationId: operation.id,
          input: result,
          output: result, // Pass through unchanged
          success: true,
          disabled: true
        });
        continue; // Continue with the same result
      }
      
      try {
        result = await applyOperationFunc(operation.id, result, operation.parameters);
        operationResults.push({
          operationIndex: i,
          operationId: operation.id,
          input: operationResults[i - 1]?.output || input,
          output: result,
          success: true,
          disabled: false
        });
      } catch (error) {
        operationResults.push({
          operationIndex: i,
          operationId: operation.id,
          input: operationResults[i - 1]?.output || input,
          output: null,
          error: error.message,
          success: false,
          disabled: false
        });
        throw error; // Stop execution on error
      }
    }

    return {
      finalResult: result,
      operationResults,
      executedAt: new Date().toISOString()
    };
  }

  // Get recipe statistics
  getRecipeStats(recipeId) {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      return null;
    }

    const operationCounts = {};
    recipe.operations.forEach(op => {
      operationCounts[op.id] = (operationCounts[op.id] || 0) + 1;
    });

    return {
      totalOperations: recipe.operations.length,
      operationCounts,
      created: recipe.created,
      modified: recipe.modified,
      category: recipe.category
    };
  }

  // Export all recipes
  exportAllRecipes() {
    return {
      format: 'cipher-recipes-collection',
      version: '1.0.0',
      exported: new Date().toISOString(),
      recipes: Array.from(this.recipes.values())
    };
  }

  // Import multiple recipes
  importAllRecipes(recipesData) {
    if (recipesData.format !== 'cipher-recipes-collection') {
      throw new Error('Invalid recipes collection format');
    }

    const importedRecipes = [];
    const errors = [];

    recipesData.recipes.forEach((recipe, index) => {
      try {
        const validation = this.validateRecipe(recipe);
        if (!validation.isValid) {
          errors.push(`Recipe ${index}: ${validation.errors.join(', ')}`);
          return;
        }

        // Generate new ID if conflict
        if (this.recipes.has(recipe.id)) {
          recipe.id = `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        recipe.imported = new Date().toISOString();
        this.recipes.set(recipe.id, recipe);
        importedRecipes.push(recipe);
      } catch (error) {
        errors.push(`Recipe ${index}: ${error.message}`);
      }
    });

    return {
      imported: importedRecipes,
      errors
    };
  }
}

// Pre-defined example recipes
export const EXAMPLE_RECIPES = {
  base64Encode: {
    name: 'Base64 Encode',
    description: 'Simple Base64 encoding',
    category: 'encoding',
    operations: [
      { id: 'base64_encode', parameters: {} }
    ],
    metadata: {
      tags: ['base64', 'encoding', 'simple'],
      difficulty: 'beginner'
    }
  },

  caesarCipher: {
    name: 'Caesar Cipher (ROT3)',
    description: 'Classic Caesar cipher with shift of 3',
    category: 'cipher',
    operations: [
      { id: 'caesar', parameters: { shift: 3 } }
    ],
    metadata: {
      tags: ['caesar', 'cipher', 'classical'],
      difficulty: 'beginner'
    }
  },

  multipleEncoding: {
    name: 'Multiple Encoding Chain',
    description: 'Base64 encode, then URL encode, then Hex encode',
    category: 'encoding',
    operations: [
      { id: 'base64_encode', parameters: {} },
      { id: 'url_encode', parameters: {} },
      { id: 'hex_encode', parameters: {} }
    ],
    metadata: {
      tags: ['base64', 'url', 'hex', 'chain'],
      difficulty: 'intermediate'
    }
  },

  polishCaesar: {
    name: 'Polish Caesar Cipher',
    description: 'Caesar cipher using Polish alphabet (33 letters)',
    category: 'cipher',
    operations: [
      { id: 'caesar_polish', parameters: { shift: 5 } }
    ],
    metadata: {
      tags: ['caesar', 'polish', 'international'],
      difficulty: 'intermediate'
    }
  },

  turkishHomoglyphs: {
    name: 'Turkish Homoglyph Attack',
    description: 'Generate confusable text using Turkish homoglyphs',
    category: 'encoding',
    operations: [
      { id: 'turkish_homoglyphs', parameters: { substitutionRate: 50 } }
    ],
    metadata: {
      tags: ['homoglyphs', 'turkish', 'security'],
      difficulty: 'advanced'
    }
  },

  unicodeObfuscation: {
    name: 'Unicode Direction Obfuscation',
    description: 'Use Unicode directional overrides to obfuscate text',
    category: 'encoding',
    operations: [
      { id: 'unicode_rtl_override', parameters: {} }
    ],
    metadata: {
      tags: ['unicode', 'obfuscation', 'direction'],
      difficulty: 'advanced'
    }
  }
};

// Factory function to create RecipeManager with example recipes
export function createRecipeManagerWithExamples() {
  const manager = new RecipeManager();
  
  // Add example recipes
  Object.entries(EXAMPLE_RECIPES).forEach(([key, recipeData]) => {
    const recipe = manager.createRecipe(
      recipeData.name,
      recipeData.description,
      recipeData.category
    );
    
    // Add operations
    recipeData.operations.forEach(op => {
      manager.addOperation(recipe.id, op.id, op.parameters);
    });

    // Update metadata
    recipe.metadata = { ...recipe.metadata, ...recipeData.metadata };
  });

  return manager;
}

export default RecipeManager;