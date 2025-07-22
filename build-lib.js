import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

// Create dist directory if it doesn't exist
if (!existsSync('dist')) {
  mkdirSync('dist');
}

// Read and concatenate library files
const encodersJs = readFileSync('src/lib/encoders.js', 'utf-8');
const decodersJs = readFileSync('src/lib/decoders.js', 'utf-8');
const indexJs = readFileSync('src/lib/index.js', 'utf-8');

// Create a combined library file for Node.js
const combinedLib = `// Encoder Webapp Library - Node.js Build
// Generated from src/lib files

${encodersJs}

${decodersJs}

${indexJs}
`;

// Write to dist/index.js
writeFileSync('dist/index.js', combinedLib);

console.log('✅ Library built to dist/index.js');