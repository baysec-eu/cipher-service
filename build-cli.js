import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

// Create dist directory if it doesn't exist
if (!existsSync('dist')) {
  mkdirSync('dist');
}

// Read CLI source
const cliJs = readFileSync('src/cli.js', 'utf-8');

// Update import path to use the built library
const updatedCli = cliJs.replace(
  "import { operations, applyOperation, chainOperations, getOperationsByCategory, getOperationsByType } from './lib/index.js';",
  "import { operations, applyOperation, chainOperations, getOperationsByCategory, getOperationsByType } from './index.js';"
);

// Write to dist/cli.js
writeFileSync('dist/cli.js', updatedCli);

console.log('✅ CLI built to dist/cli.js');