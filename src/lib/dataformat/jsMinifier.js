// JavaScript Minifier - Removes whitespace and comments while preserving functionality

export function jsMinify(code) {
  try {
    // Remove single-line comments
    let minified = code.replace(/\/\/.*$/gm, '');
    
    // Remove multi-line comments
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remove unnecessary whitespace around operators
    minified = minified.replace(/\s*([+\-*/%=<>!&|,;:?{}()\[\]])\s*/g, '$1');
    
    // Remove leading/trailing whitespace per line
    minified = minified.replace(/^\s+|\s+$/gm, '');
    
    // Remove empty lines
    minified = minified.replace(/\n+/g, '\n');
    
    // Remove final newline
    minified = minified.trim();
    
    // Preserve necessary spaces (between keywords and identifiers)
    minified = minified.replace(/\b(var|let|const|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|typeof|instanceof|in|of|class|extends|static|async|await|yield|import|export|from|default)\b(\w)/g, '$1 $2');
    
    // Preserve spaces between consecutive identifiers
    minified = minified.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g, '$1 $2');
    
    // Remove unnecessary semicolons before closing braces
    minified = minified.replace(/;}/g, '}');
    
    // Remove all remaining newlines (making it truly minified)
    minified = minified.replace(/\n/g, '');
    
    return minified;
  } catch (error) {
    throw new Error(`JavaScript minification failed: ${error.message}`);
  }
}

export function jsBeautify(code, indentSize = 2) {
  try {
    const indent = ' '.repeat(indentSize);
    let beautified = '';
    let indentLevel = 0;
    let inString = false;
    let stringChar = '';
    let escaped = false;
    
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const nextChar = code[i + 1] || '';
      
      // Handle strings
      if (!escaped && (char === '"' || char === "'" || char === '`')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }
      
      if (!inString) {
        if (char === '{' || char === '[') {
          beautified += char;
          if (nextChar !== '}' && nextChar !== ']') {
            beautified += '\n' + indent.repeat(++indentLevel);
          }
        } else if (char === '}' || char === ']') {
          const prevNonSpace = beautified.trimEnd().slice(-1);
          if (prevNonSpace !== '{' && prevNonSpace !== '[') {
            beautified = beautified.trimEnd() + '\n' + indent.repeat(--indentLevel);
          } else {
            indentLevel--;
          }
          beautified += char;
        } else if (char === ';') {
          beautified += char;
          if (nextChar !== '}') {
            beautified += '\n' + indent.repeat(indentLevel);
          }
        } else if (char === ',') {
          beautified += char;
          if (nextChar !== '}' && nextChar !== ']') {
            beautified += '\n' + indent.repeat(indentLevel);
          }
        } else {
          beautified += char;
        }
      } else {
        beautified += char;
      }
      
      escaped = !escaped && char === '\\';
    }
    
    return beautified.trim();
  } catch (error) {
    throw new Error(`JavaScript beautification failed: ${error.message}`);
  }
}