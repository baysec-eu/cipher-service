#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { stdin, stdout, stderr } from 'process';
import { operations, applyOperation, chainOperations, getOperationsByCategory, getOperationsByType } from './lib/index.js';
import RecipeManager, { convertFromCliRecipe } from './lib/recipes.js';

const program = new Command();

// Helper function to read input
async function readInput(file) {
  if (file) {
    return readFileSync(file, 'utf-8');
  }
  
  if (!stdin.isTTY) {
    let input = '';
    for await (const chunk of stdin) {
      input += chunk;
    }
    return input.trim();
  }
  
  stderr.write('Error: No input provided. Use -f <file> or pipe text to stdin.\n');
  process.exit(1);
}

// Add version
program
  .version('1.0.0')
  .description('CyberChef-like encoding/decoding toolkit');

// List operations command
program
  .command('list')
  .description('List all available operations')
  .option('-c, --category <category>', 'Filter by category')
  .option('-t, --type <type>', 'Filter by type (encode, decode, cipher, hash)')
  .action((options) => {
    let ops = operations;
    
    if (options.category) {
      ops = getOperationsByCategory(options.category);
    }
    
    if (options.type) {
      ops = getOperationsByType(options.type);
    }
    
    if (ops.length === 0) {
      console.log('No operations found matching the criteria.');
      return;
    }
    
    // Group by category
    const grouped = {};
    ops.forEach(op => {
      if (!grouped[op.category]) {
        grouped[op.category] = [];
      }
      grouped[op.category].push(op);
    });
    
    Object.entries(grouped).forEach(([category, categoryOps]) => {
      console.log(`\n${category.toUpperCase()}:`);
      categoryOps.forEach(op => {
        const params = op.params ? ` (params: ${op.params.join(', ')})` : '';
        console.log(`  ${op.id.padEnd(25)} - ${op.name} [${op.type}]${params}`);
      });
    });
  });

// Single operation command
program
  .command('encode')
  .description('Apply a single encoding operation')
  .argument('<operation>', 'Operation ID (use "list" command to see available operations)')
  .option('-f, --file <file>', 'Input file')
  .option('-s, --shift <shift>', 'Shift value for Caesar cipher', '3')
  .option('-k, --key <key>', 'Key value for XOR cipher', '32')
  .action(async (operation, options) => {
    try {
      const input = await readInput(options.file);
      const params = {};
      
      if (options.shift) params.shift = parseInt(options.shift);
      if (options.key) params.key = parseInt(options.key);
      
      const result = await applyOperation(operation, input, params);
      console.log(result);
    } catch (error) {
      stderr.write(`Error: ${error.message}\n`);
      process.exit(1);
    }
  });

// Recipe command (chain multiple operations)
program
  .command('recipe')
  .description('Apply multiple operations in sequence')
  .argument('<operations...>', 'Space-separated list of operation IDs')
  .option('-f, --file <file>', 'Input file')
  .option('-s, --shift <shift>', 'Default shift value for Caesar cipher', '3')
  .option('-k, --key <key>', 'Default key value for XOR cipher', '32')
  .action(async (operationIds, options) => {
    try {
      const input = await readInput(options.file);
      const defaultParams = {};
      
      if (options.shift) defaultParams.shift = parseInt(options.shift);
      if (options.key) defaultParams.key = parseInt(options.key);
      
      // Build operation chain
      const operationChain = operationIds.map(id => ({
        id,
        params: defaultParams
      }));
      
      const result = await chainOperations(input, operationChain);
      console.log(result);
    } catch (error) {
      stderr.write(`Error: ${error.message}\n`);
      process.exit(1);
    }
  });

// Interactive mode
program
  .command('interactive')
  .alias('i')
  .description('Start interactive mode')
  .action(async () => {
    console.log('🔧 Encoder Webapp CLI - Interactive Mode');
    console.log('Type "help" for available commands, "exit" to quit\n');
    
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'encoder> '
    });
    
    let currentInput = '';
    let currentRecipe = [];
    
    const showHelp = () => {
      console.log(`
Available commands:
  help                     - Show this help
  input <text>            - Set input text
  show                    - Show current input and recipe
  add <operation>         - Add operation to recipe
  remove <index>          - Remove operation from recipe (0-based index)
  clear                   - Clear recipe
  run                     - Execute recipe on input
  list [category]         - List operations (optionally filtered by category)
  reset                   - Reset input and recipe
  exit                    - Exit interactive mode
      `);
    };
    
    rl.prompt();
    
    rl.on('line', async (line) => {
      const parts = line.trim().split(' ');
      const command = parts[0].toLowerCase();
      
      try {
        switch (command) {
          case 'help':
            showHelp();
            break;
            
          case 'input':
            currentInput = parts.slice(1).join(' ');
            console.log(`✓ Input set: "${currentInput.substring(0, 50)}${currentInput.length > 50 ? '...' : '}"`);
            break;
            
          case 'show':
            console.log(`Input: "${currentInput}"`);
            console.log(`Recipe: [${currentRecipe.map(r => r.id).join(' -> ')}]`);
            break;
            
          case 'add':
            const opId = parts[1];
            const op = operations.find(o => o.id === opId);
            if (!op) {
              console.log(`❌ Operation "${opId}" not found. Use "list" to see available operations.`);
            } else {
              currentRecipe.push({ id: opId, params: {} });
              console.log(`✓ Added "${op.name}" to recipe`);
            }
            break;
            
          case 'remove':
            const index = parseInt(parts[1]);
            if (index >= 0 && index < currentRecipe.length) {
              const removed = currentRecipe.splice(index, 1)[0];
              console.log(`✓ Removed operation at index ${index}`);
            } else {
              console.log(`❌ Invalid index. Recipe has ${currentRecipe.length} operations.`);
            }
            break;
            
          case 'clear':
            currentRecipe = [];
            console.log('✓ Recipe cleared');
            break;
            
          case 'run':
            if (!currentInput) {
              console.log('❌ No input set. Use "input <text>" first.');
            } else if (currentRecipe.length === 0) {
              console.log('❌ No operations in recipe. Use "add <operation>" to add operations.');
            } else {
              const result = await chainOperations(currentInput, currentRecipe);
              console.log(`Result: ${result}`);
            }
            break;
            
          case 'list':
            const category = parts[1];
            const ops = category ? getOperationsByCategory(category) : operations;
            
            if (ops.length === 0) {
              console.log('No operations found.');
            } else {
              const grouped = {};
              ops.forEach(op => {
                if (!grouped[op.category]) grouped[op.category] = [];
                grouped[op.category].push(op);
              });
              
              Object.entries(grouped).forEach(([cat, catOps]) => {
                console.log(`\n${cat.toUpperCase()}:`);
                catOps.forEach(op => {
                  console.log(`  ${op.id.padEnd(20)} - ${op.name}`);
                });
              });
            }
            break;
            
          case 'reset':
            currentInput = '';
            currentRecipe = [];
            console.log('✓ Input and recipe reset');
            break;
            
          case 'exit':
          case 'quit':
            console.log('Goodbye! 👋');
            rl.close();
            return;
            
          case '':
            break;
            
          default:
            console.log(`❌ Unknown command: ${command}. Type "help" for available commands.`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
      
      rl.prompt();
    });
    
    rl.on('close', () => {
      process.exit(0);
    });
  });

// Recipe file commands
program
  .command('save-recipe')
  .description('Save current operations as a recipe file')
  .argument('<name>', 'Recipe name')
  .argument('<operations...>', 'Space-separated list of operation IDs')
  .option('-d, --description <description>', 'Recipe description', '')
  .option('-o, --output <file>', 'Output recipe file', 'recipe.json')
  .option('-a, --author <author>', 'Recipe author', 'CLI User')
  .option('-t, --tags <tags>', 'Comma-separated tags', '')
  .action((name, operationIds, options) => {
    try {
      const recipeManager = new RecipeManager();
      
      // Build steps from operation IDs
      const steps = operationIds.map(id => {
        const op = operations.find(o => o.id === id);
        if (!op) {
          throw new Error(`Operation "${id}" not found`);
        }
        return {
          id: op.id,
          name: op.name,
          type: op.type,
          category: op.category,
          params: {}
        };
      });

      const metadata = {
        author: options.author,
        tags: options.tags ? options.tags.split(',').map(t => t.trim()) : [],
        category: 'cli-generated'
      };

      const recipe = recipeManager.createRecipeFile(name, options.description, steps, metadata);
      
      // Write to file
      const fs = await import('fs');
      fs.writeFileSync(options.output, JSON.stringify(recipe, null, 2));
      
      console.log(`✓ Recipe saved to ${options.output}`);
      console.log(`  Name: ${name}`);
      console.log(`  Operations: ${operationIds.join(' -> ')}`);
      console.log(`  File size: ${fs.statSync(options.output).size} bytes`);
    } catch (error) {
      stderr.write(`Error: ${error.message}\n`);
      process.exit(1);
    }
  });

program
  .command('load-recipe')
  .description('Load and execute a recipe file')
  .argument('<recipe-file>', 'Recipe file (.recipe.json)')
  .option('-f, --file <file>', 'Input file')
  .option('-i, --info', 'Show recipe info without executing')
  .action(async (recipeFile, options) => {
    try {
      const fs = await import('fs');
      const recipeContent = fs.readFileSync(recipeFile, 'utf-8');
      const recipe = JSON.parse(recipeContent);
      
      const recipeManager = new RecipeManager();
      const validation = recipeManager.validateRecipeFile(recipe);
      
      if (!validation.valid) {
        throw new Error(`Invalid recipe file: ${validation.error}`);
      }

      console.log(`📝 Recipe: ${recipe.metadata.name}`);
      console.log(`📄 Description: ${recipe.metadata.description || 'No description'}`);
      console.log(`👤 Author: ${recipe.metadata.author || 'Unknown'}`);
      console.log(`📅 Created: ${recipe.metadata.created || 'Unknown'}`);
      console.log(`🔧 Operations: ${recipe.operations.length}`);
      
      if (recipe.metadata.tags && recipe.metadata.tags.length > 0) {
        console.log(`🏷️  Tags: ${recipe.metadata.tags.join(', ')}`);
      }
      
      console.log('\nOperations:');
      recipe.operations.forEach((op, i) => {
        const params = Object.keys(op.parameters || {}).length > 0 
          ? ` (${Object.entries(op.parameters).map(([k,v]) => `${k}=${v}`).join(', ')})` 
          : '';
        console.log(`  ${i + 1}. ${op.name || op.operation}${params}`);
      });

      if (options.info) {
        return;
      }

      if (!options.file && stdin.isTTY) {
        console.log('\n❌ No input provided. Use -f <file> or pipe text to stdin.');
        process.exit(1);
      }

      const input = await readInput(options.file);
      console.log(`\n🔄 Processing input (${input.length} chars)...`);

      // Convert to internal format and execute
      const steps = recipe.operations.map(op => ({
        id: op.operation,
        params: op.parameters || {}
      }));

      const result = await chainOperations(input, steps);
      console.log(`\n✅ Result:`);
      console.log(result);

    } catch (error) {
      stderr.write(`Error: ${error.message}\n`);
      process.exit(1);
    }
  });

program
  .command('validate-recipe')
  .description('Validate a recipe file')
  .argument('<recipe-file>', 'Recipe file to validate')
  .action(async (recipeFile) => {
    try {
      const fs = await import('fs');
      const recipeContent = fs.readFileSync(recipeFile, 'utf-8');
      const recipe = JSON.parse(recipeContent);
      
      const recipeManager = new RecipeManager();
      const validation = recipeManager.validateRecipeFile(recipe);
      
      if (validation.valid) {
        console.log('✅ Recipe file is valid');
        console.log(`📝 Name: ${recipe.metadata.name}`);
        console.log(`🔧 Operations: ${recipe.operations.length}`);
        
        // Validate that operations exist
        let invalidOps = [];
        for (const op of recipe.operations) {
          const found = operations.find(o => o.id === op.operation);
          if (!found) {
            invalidOps.push(op.operation);
          }
        }
        
        if (invalidOps.length > 0) {
          console.log(`⚠️  Warning: Unknown operations: ${invalidOps.join(', ')}`);
        } else {
          console.log('✅ All operations are recognized');
        }
      } else {
        console.log('❌ Recipe file is invalid');
        console.log(`Error: ${validation.error}`);
        process.exit(1);
      }
    } catch (error) {
      stderr.write(`Error: ${error.message}\n`);
      process.exit(1);
    }
  });

program
  .command('create-example-recipes')
  .description('Create example recipe files')
  .option('-o, --output-dir <dir>', 'Output directory', './recipes')
  .action(async (options) => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      // Ensure output directory exists
      if (!fs.existsSync(options.outputDir)) {
        fs.mkdirSync(options.outputDir, { recursive: true });
      }

      const recipeManager = new RecipeManager();
      const examples = recipeManager.getExampleRecipes();

      console.log(`📁 Creating ${examples.length} example recipes in ${options.outputDir}/`);

      for (const example of examples) {
        const recipe = recipeManager.createRecipeFile(
          example.name, 
          example.description, 
          example.steps,
          { tags: example.tags, category: 'example' }
        );

        const filename = example.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.recipe.json';
        const filepath = path.join(options.outputDir, filename);
        
        fs.writeFileSync(filepath, JSON.stringify(recipe, null, 2));
        console.log(`✓ Created ${filename}`);
      }

      console.log(`\n🎉 Created ${examples.length} example recipes!`);
      console.log(`\nTry them out:`);
      examples.forEach(example => {
        const filename = example.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.recipe.json';
        console.log(`  encoder load-recipe ${path.join(options.outputDir, filename)} -i`);
      });

    } catch (error) {
      stderr.write(`Error: ${error.message}\n`);
      process.exit(1);
    }
  });

// Add some common operation shortcuts
program
  .command('base64')
  .description('Base64 encode/decode shortcut')
  .option('-d, --decode', 'Decode instead of encode')
  .option('-f, --file <file>', 'Input file')
  .action(async (options) => {
    try {
      const input = await readInput(options.file);
      const operation = options.decode ? 'base64_decode' : 'base64_encode';
      const result = await applyOperation(operation, input);
      console.log(result);
    } catch (error) {
      stderr.write(`Error: ${error.message}\n`);
      process.exit(1);
    }
  });

program
  .command('url')
  .description('URL encode/decode shortcut')
  .option('-d, --decode', 'Decode instead of encode')
  .option('-f, --file <file>', 'Input file')
  .action(async (options) => {
    try {
      const input = await readInput(options.file);
      const operation = options.decode ? 'url_decode' : 'url_encode';
      const result = await applyOperation(operation, input);
      console.log(result);
    } catch (error) {
      stderr.write(`Error: ${error.message}\n`);
      process.exit(1);
    }
  });

program
  .command('hex')
  .description('Hex encode/decode shortcut')
  .option('-d, --decode', 'Decode instead of encode')
  .option('-f, --file <file>', 'Input file')
  .action(async (options) => {
    try {
      const input = await readInput(options.file);
      const operation = options.decode ? 'hex_decode' : 'hex_encode';
      const result = await applyOperation(operation, input);
      console.log(result);
    } catch (error) {
      stderr.write(`Error: ${error.message}\n`);
      process.exit(1);
    }
  });

// Examples command
program
  .command('examples')
  .description('Show usage examples')
  .action(() => {
    console.log(`
Examples:

  # List all operations
  encoder list

  # List operations by category
  encoder list -c base
  encoder list -t encode

  # Single operations
  echo "Hello World" | encoder encode base64_encode
  encoder encode url_encode -f input.txt

  # Chain multiple operations (recipe)
  echo "Hello World" | encoder recipe base64_encode url_encode
  encoder recipe base64_encode url_encode -f input.txt

  # Shortcuts
  echo "Hello World" | encoder base64
  echo "SGVsbG8gV29ybGQ=" | encoder base64 --decode
  echo "Hello World" | encoder url
  encoder hex -d -f encoded.txt

  # Interactive mode
  encoder interactive

  # In interactive mode:
  encoder> input Hello World
  encoder> add base64_encode
  encoder> add url_encode
  encoder> run
    `);
  });

program.parse();