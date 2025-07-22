// Recipe Management - Save/Load recipes to/from local disk and handle uploads
// Supports .json recipe files for sharing and reuse

export class RecipeManager {
  constructor() {
    this.recipes = new Map();
  }

  // === RECIPE FILE FORMAT ===
  createRecipeFile(name, description, steps, metadata = {}) {
    return {
      format: "encoder-recipe",
      version: "1.0.0",
      metadata: {
        name: name,
        description: description,
        author: metadata.author || "Unknown",
        created: new Date().toISOString(),
        tags: metadata.tags || [],
        category: metadata.category || "general",
        ...metadata
      },
      operations: steps.map(step => ({
        operation: step.id,
        name: step.name,
        type: step.type,
        category: step.category,
        parameters: step.params || {}
      })),
      validation: {
        stepCount: steps.length,
        hasParameters: steps.some(step => step.params && Object.keys(step.params).length > 0)
      }
    };
  }

  // === SAVE TO LOCAL DISK (Browser Download) ===
  downloadRecipe(name, description, steps, filename = null) {
    const recipe = this.createRecipeFile(name, description, steps);
    const jsonString = JSON.stringify(recipe, null, 2);
    
    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `${name.replace(/[^a-zA-Z0-9]/g, '_')}.recipe.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return {
      success: true,
      filename: a.download,
      size: blob.size,
      recipe: recipe
    };
  }

  // === LOAD FROM FILE (Browser Upload) ===
  async loadRecipeFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      // Validate file extension
      if (!file.name.endsWith('.json') && !file.name.endsWith('.recipe.json')) {
        reject(new Error('Invalid file type. Expected .json or .recipe.json'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const recipe = JSON.parse(content);
          
          // Validate recipe format
          const validation = this.validateRecipeFile(recipe);
          if (!validation.valid) {
            reject(new Error(`Invalid recipe file: ${validation.error}`));
            return;
          }

          // Convert to internal format
          const steps = recipe.operations.map(op => ({
            id: op.operation,
            name: op.name,
            type: op.type,
            category: op.category,
            params: op.parameters || {}
          }));

          resolve({
            success: true,
            recipe: {
              metadata: recipe.metadata,
              steps: steps,
              validation: recipe.validation
            },
            filename: file.name,
            size: file.size
          });
        } catch (error) {
          reject(new Error(`Failed to parse recipe file: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  // === VALIDATE RECIPE FILE ===
  validateRecipeFile(recipe) {
    try {
      // Check required fields
      if (!recipe.format || recipe.format !== 'encoder-recipe') {
        return { valid: false, error: 'Invalid or missing format field' };
      }

      if (!recipe.version) {
        return { valid: false, error: 'Missing version field' };
      }

      if (!recipe.metadata || !recipe.metadata.name) {
        return { valid: false, error: 'Missing metadata or recipe name' };
      }

      if (!recipe.operations || !Array.isArray(recipe.operations)) {
        return { valid: false, error: 'Missing or invalid operations array' };
      }

      // Validate operations
      for (let i = 0; i < recipe.operations.length; i++) {
        const op = recipe.operations[i];
        if (!op.operation) {
          return { valid: false, error: `Operation ${i + 1} missing operation field` };
        }
        if (!op.name) {
          return { valid: false, error: `Operation ${i + 1} missing name field` };
        }
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // === EXAMPLE RECIPES ===
  getExampleRecipes() {
    return [
      {
        name: "Basic Web Encoding",
        description: "URL encode, then Base64 encode for web transmission",
        steps: [
          { id: 'url_encode', name: 'URL Encode (ASCII)', type: 'encode', category: 'base' },
          { id: 'base64_encode', name: 'Base64 Encode', type: 'encode', category: 'base' }
        ],
        tags: ['web', 'basic', 'encoding']
      },
      {
        name: "Caesar + Base64",
        description: "Caesar cipher followed by Base64 encoding",
        steps: [
          { id: 'caesar', name: 'Caesar Cipher', type: 'cipher', category: 'cipher', params: { shift: 13 } },
          { id: 'base64_encode', name: 'Base64 Encode', type: 'encode', category: 'base' }
        ],
        tags: ['cipher', 'classical', 'encoding']
      },
      {
        name: "Secure Password Encryption",
        description: "Compress data and encrypt with password using AES-GCM",
        steps: [
          { id: 'compress_encrypt', name: 'Compress + Encrypt', type: 'crypto', category: 'crypto', params: { password: '' } }
        ],
        tags: ['crypto', 'compression', 'secure']
      },
      {
        name: "Multi-Layer Obfuscation",
        description: "Multiple encoding layers for obfuscation",
        steps: [
          { id: 'base64_encode', name: 'Base64 Encode', type: 'encode', category: 'base' },
          { id: 'hex_encode', name: 'Hex Encode', type: 'encode', category: 'base' },
          { id: 'url_encode', name: 'URL Encode (ASCII)', type: 'encode', category: 'base' }
        ],
        tags: ['obfuscation', 'multi-layer', 'encoding']
      }
    ];
  }

  // === RECIPE SHARING ===
  generateShareableLink(recipe) {
    const compressed = this.compressRecipe(recipe);
    const encoded = btoa(JSON.stringify(compressed));
    return `${window.location.origin}${window.location.pathname}?recipe=${encoded}`;
  }

  parseShareableLink(url) {
    try {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const recipeParam = urlParams.get('recipe');
      if (!recipeParam) return null;

      const compressed = JSON.parse(atob(recipeParam));
      return this.decompressRecipe(compressed);
    } catch (error) {
      console.error('Failed to parse shareable link:', error);
      return null;
    }
  }

  compressRecipe(recipe) {
    // Simplified compression - remove unnecessary fields
    return {
      n: recipe.metadata.name,
      d: recipe.metadata.description,
      ops: recipe.steps.map(step => ({
        id: step.id,
        p: step.params
      }))
    };
  }

  decompressRecipe(compressed) {
    return {
      metadata: {
        name: compressed.n,
        description: compressed.d,
        created: new Date().toISOString(),
        author: 'Shared Recipe'
      },
      steps: compressed.ops.map(op => ({
        id: op.id,
        params: op.p || {}
      }))
    };
  }
}

// === BROWSER LOCAL STORAGE PERSISTENCE ===
export class RecipeStorage {
  constructor() {
    this.storageKey = 'encoder-recipes';
  }

  // Save recipes to localStorage
  saveRecipes(recipes) {
    try {
      const data = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        recipes: Array.isArray(recipes) ? recipes : Array.from(recipes.values())
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save recipes to localStorage:', error);
      return false;
    }
  }

  // Load recipes from localStorage
  loadRecipes() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];

      const parsed = JSON.parse(data);
      return parsed.recipes || [];
    } catch (error) {
      console.error('Failed to load recipes from localStorage:', error);
      return [];
    }
  }

  // Clear all recipes
  clearRecipes() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Failed to clear recipes:', error);
      return false;
    }
  }

  // Get storage info
  getStorageInfo() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return { exists: false, size: 0, count: 0 };

      const parsed = JSON.parse(data);
      return {
        exists: true,
        size: data.length,
        count: parsed.recipes ? parsed.recipes.length : 0,
        timestamp: parsed.timestamp,
        version: parsed.version
      };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }
}

// === CLI-COMPATIBLE RECIPE FORMAT ===
export function convertToCliRecipe(recipe) {
  return {
    name: recipe.metadata.name,
    description: recipe.metadata.description,
    operations: recipe.steps.map(step => {
      const op = { operation: step.id };
      if (step.params && Object.keys(step.params).length > 0) {
        op.parameters = step.params;
      }
      return op;
    })
  };
}

export function convertFromCliRecipe(cliRecipe) {
  return {
    metadata: {
      name: cliRecipe.name,
      description: cliRecipe.description || '',
      created: new Date().toISOString(),
      author: 'CLI Import'
    },
    steps: cliRecipe.operations.map(op => ({
      id: op.operation,
      params: op.parameters || {}
    }))
  };
}

// Default export
export default RecipeManager;