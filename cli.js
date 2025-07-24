#!/usr/bin/env node

// Encoder CLI - Command Line Interface for running recipes
// Usage: node cli.js [options] <input> [recipe-file]

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import encoder functions - we'll need to adapt for Node.js environment
async function loadEncoderModules() {
  try {
    // Dynamic import for ES modules
    const { chainOperations, applyOperation, operations } = await import('./src/lib/index.js');
    const { RecipeManager } = await import('./src/lib/recipes.js');
    return { chainOperations, applyOperation, operations, RecipeManager };
  } catch (error) {
    console.error('Failed to load encoder modules:', error.message);
    console.error('Make sure you\'re running this from the project root directory');
    process.exit(1);
  }
}

class EncoderCLI {
  constructor() {
    this.recipeManager = null;
    this.modules = null;
  }

  async init() {
    this.modules = await loadEncoderModules();
    this.recipeManager = new this.modules.RecipeManager();
  }

  showHelp() {
    console.log(`
Encoder CLI - Cryptography and Encoding Toolkit

USAGE:
  node cli.js [OPTIONS] <input> [recipe-file]

ARGUMENTS:
  <input>           Text to process
  [recipe-file]     Path to recipe JSON file (optional)

OPTIONS:
  -h, --help        Show this help message
  -v, --version     Show version information
  -o, --operation   Execute single operation by ID
  -l, --list        List all available operations
  -r, --recipe      Use inline recipe (JSON string)
  --output <file>   Save output to file
  --validate        Validate recipe file without executing
  --info            Show recipe information
  --disable <n>     Disable operation at index n in recipe
  --enable <n>      Enable operation at index n in recipe

EXAMPLES:
  # Single operation
  node cli.js "Hello World" --operation base64_encode

  # Execute recipe file
  node cli.js "Hello World" my-recipe.json

  # Inline recipe
  node cli.js "test" --recipe '[{"id":"base64_encode"},{"id":"url_encode"}]'

  # List operations
  node cli.js --list

  # Validate recipe
  node cli.js --validate my-recipe.json

  # Save output to file
  node cli.js "Hello World" my-recipe.json --output result.txt

RECIPE FILE FORMAT:
  {
    "format": "encoder-recipe",
    "version": "1.0.0",
    "metadata": {
      "name": "My Recipe",
      "description": "Description of what this recipe does"
    },
    "operations": [
      {
        "operation": "base64_encode",
        "name": "Base64 Encode"
      },
      {
        "operation": "caesar",
        "name": "Caesar Cipher",
        "parameters": { "shift": 3 }
      }
    ]
  }
`);
  }

  showVersion() {
    console.log('Encoder CLI v1.0.0');
    console.log('Cryptography and Encoding Toolkit');
  }

  listOperations() {
    console.log('Available Operations:\n');
    
    const categories = {};
    this.modules.operations.forEach(op => {
      if (!categories[op.category]) {
        categories[op.category] = [];
      }
      categories[op.category].push(op);
    });

    Object.entries(categories).forEach(([category, ops]) => {
      console.log(`\x1b[1m${category.toUpperCase()}\x1b[0m`);
      ops.forEach(op => {
        const params = op.params ? ` (params: ${op.params.join(', ')})` : '';
        console.log(`  ${op.id.padEnd(25)} - ${op.name}${params}`);
      });
      console.log('');
    });
  }

  async validateRecipe(recipePath) {
    try {
      const recipeContent = readFileSync(recipePath, 'utf8');
      const recipe = JSON.parse(recipeContent);
      
      const validation = this.recipeManager.validateRecipeFile(recipe);
      
      if (validation.valid) {
        console.log('\x1b[32m✓ Recipe is valid\x1b[0m');
        console.log(`Name: ${recipe.metadata.name}`);
        console.log(`Description: ${recipe.metadata.description}`);
        console.log(`Operations: ${recipe.operations.length}`);
        
        // Also validate that operations exist
        const steps = recipe.operations.map(op => ({
          id: op.operation,
          params: op.parameters || {}
        }));

        for (const step of steps) {
          const operation = this.modules.operations.find(op => op.id === step.id);
          if (!operation) {
            console.log(`\x1b[33m⚠ Warning: Operation '${step.id}' not found\x1b[0m`);
          }
        }
      } else {
        console.log('\x1b[31m✗ Recipe is invalid\x1b[0m');
        console.log(`Error: ${validation.error}`);
        process.exit(1);
      }
    } catch (error) {
      console.log('\x1b[31m✗ Failed to validate recipe\x1b[0m');
      console.log(`Error: ${error.message}`);
      process.exit(1);
    }
  }

  async showRecipeInfo(recipePath) {
    try {
      const recipeContent = readFileSync(recipePath, 'utf8');
      const recipe = JSON.parse(recipeContent);
      
      console.log(`\x1b[1m${recipe.metadata.name}\x1b[0m`);
      console.log(`Description: ${recipe.metadata.description}`);
      console.log(`Author: ${recipe.metadata.author || 'Unknown'}`);
      console.log(`Created: ${recipe.metadata.created || 'Unknown'}`);
      console.log(`Operations: ${recipe.operations.length}`);
      
      if (recipe.metadata.tags && recipe.metadata.tags.length > 0) {
        console.log(`Tags: ${recipe.metadata.tags.join(', ')}`);
      }
      
      console.log('\nSteps:');
      recipe.operations.forEach((op, index) => {
        console.log(`  ${index + 1}. ${op.name || op.operation}`);
        if (op.parameters && Object.keys(op.parameters).length > 0) {
          const params = Object.entries(op.parameters)
            .map(([key, value]) => `${key}=${value}`)
            .join(', ');
          console.log(`     Parameters: ${params}`);
        }
      });
    } catch (error) {
      console.log('\x1b[31m✗ Failed to read recipe info\x1b[0m');
      console.log(`Error: ${error.message}`);
      process.exit(1);
    }
  }

  async executeOperation(input, operationId, params = {}) {
    try {
      const result = await this.modules.applyOperation(operationId, input, params);
      return result;
    } catch (error) {
      console.log('\x1b[31m✗ Operation failed\x1b[0m');
      console.log(`Error: ${error.message}`);
      process.exit(1);
    }
  }

  async executeRecipe(input, recipePath) {
    try {
      const recipeContent = readFileSync(recipePath, 'utf8');
      const recipe = JSON.parse(recipeContent);
      
      // Validate recipe
      const validation = this.recipeManager.validateRecipeFile(recipe);
      if (!validation.valid) {
        throw new Error(`Invalid recipe: ${validation.error}`);
      }

      // Convert to internal format
      const steps = recipe.operations.map(op => ({
        id: op.operation,
        params: op.parameters || {}
      }));

      // Execute chain
      const result = await this.modules.chainOperations(input, steps);
      return result;
    } catch (error) {
      console.log('\x1b[31m✗ Recipe execution failed\x1b[0m');
      console.log(`Error: ${error.message}`);
      process.exit(1);
    }
  }

  async executeInlineRecipe(input, recipeJson) {
    try {
      const steps = JSON.parse(recipeJson);
      if (!Array.isArray(steps)) {
        throw new Error('Inline recipe must be an array of operation objects');
      }

      const result = await this.modules.chainOperations(input, steps);
      return result;
    } catch (error) {
      console.log('\x1b[31m✗ Inline recipe execution failed\x1b[0m');
      console.log(`Error: ${error.message}`);
      process.exit(1);
    }
  }

  async run() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      this.showHelp();
      return;
    }

    // Parse arguments
    const flags = {};
    const positional = [];
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('-')) {
        if (arg === '-h' || arg === '--help') {
          this.showHelp();
          return;
        } else if (arg === '-v' || arg === '--version') {
          this.showVersion();
          return;
        } else if (arg === '-l' || arg === '--list') {
          flags.list = true;
        } else if (arg === '-o' || arg === '--operation') {
          flags.operation = args[++i];
        } else if (arg === '-r' || arg === '--recipe') {
          flags.inlineRecipe = args[++i];
        } else if (arg === '--output') {
          flags.output = args[++i];
        } else if (arg === '--validate') {
          flags.validate = true;
        } else if (arg === '--info') {
          flags.info = true;
        }
      } else {
        positional.push(arg);
      }
    }

    // Handle list operations
    if (flags.list) {
      this.listOperations();
      return;
    }

    // Handle validation
    if (flags.validate) {
      if (positional.length === 0) {
        console.log('\x1b[31m✗ Recipe file path required for validation\x1b[0m');
        process.exit(1);
      }
      await this.validateRecipe(positional[0]);
      return;
    }

    // Handle info
    if (flags.info) {
      if (positional.length === 0) {
        console.log('\x1b[31m✗ Recipe file path required for info\x1b[0m');
        process.exit(1);
      }
      await this.showRecipeInfo(positional[0]);
      return;
    }

    // Need input for other operations
    if (positional.length === 0) {
      console.log('\x1b[31m✗ Input text required\x1b[0m');
      this.showHelp();
      process.exit(1);
    }

    const input = positional[0];
    let result;

    // Execute single operation
    if (flags.operation) {
      result = await this.executeOperation(input, flags.operation);
    }
    // Execute inline recipe
    else if (flags.inlineRecipe) {
      result = await this.executeInlineRecipe(input, flags.inlineRecipe);
    }
    // Execute recipe file
    else if (positional.length > 1) {
      result = await this.executeRecipe(input, positional[1]);
    }
    // No operation specified
    else {
      console.log('\x1b[31m✗ No operation or recipe specified\x1b[0m');
      console.log('Use --operation, --recipe, or provide a recipe file');
      process.exit(1);
    }

    // Output result
    if (flags.output) {
      writeFileSync(flags.output, result);
      console.log(`\x1b[32m✓ Output saved to ${flags.output}\x1b[0m`);
    } else {
      console.log(result);
    }
  }
}

// Run CLI if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const cli = new EncoderCLI();
  
  cli.init().then(() => {
    cli.run().catch(error => {
      console.error('\x1b[31mUnexpected error:', error.message, '\x1b[0m');
      process.exit(1);
    });
  }).catch(error => {
    console.error('\x1b[31mFailed to initialize CLI:', error.message, '\x1b[0m');
    process.exit(1);
  });
}

export default EncoderCLI;