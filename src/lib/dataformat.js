// Data Format Operations - JSON, XML, CSV, YAML processing
// Implements CyberChef-style data formatting and manipulation

// === JSON OPERATIONS ===

export function jsonBeautify(jsonString, indentSize = 2) {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, indentSize);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
}

export function jsonMinify(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
}

export function jsonValidate(jsonString) {
  try {
    JSON.parse(jsonString);
    return 'Valid JSON ✓';
  } catch (error) {
    return `Invalid JSON: ${error.message}`;
  }
}

export function jsonToXml(jsonString) {
  try {
    const obj = JSON.parse(jsonString);
    return objectToXml(obj, 'root');
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
}

function objectToXml(obj, rootName = 'root') {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>`;
  
  function convertValue(value, key) {
    if (value === null || value === undefined) {
      return `<${key}></${key}>`;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      let result = `<${key}>`;
      for (const [subKey, subValue] of Object.entries(value)) {
        result += convertValue(subValue, subKey);
      }
      result += `</${key}>`;
      return result;
    } else if (Array.isArray(value)) {
      return value.map(item => convertValue(item, key)).join('');
    } else {
      return `<${key}>${escapeXml(String(value))}</${key}>`;
    }
  }
  
  if (typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      xml += convertValue(value, key);
    }
  } else {
    xml += escapeXml(String(obj));
  }
  
  xml += `</${rootName}>`;
  return xml;
}

export function jsonToCsv(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    
    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array of objects for CSV conversion');
    }
    
    if (data.length === 0) {
      return '';
    }
    
    // Get all unique keys
    const keys = [...new Set(data.flatMap(obj => Object.keys(obj)))];
    
    // Create CSV header
    let csv = keys.map(key => `"${key}"`).join(',') + '\n';
    
    // Add rows
    for (const row of data) {
      const values = keys.map(key => {
        const value = row[key];
        if (value === null || value === undefined) return '""';
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csv += values.join(',') + '\n';
    }
    
    return csv;
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
}

// JPath query (simplified JSONPath)
export function jPathQuery(jsonString, path) {
  try {
    const data = JSON.parse(jsonString);
    const result = evaluateJPath(data, path);
    return JSON.stringify(result, null, 2);
  } catch (error) {
    throw new Error(`JPath query failed: ${error.message}`);
  }
}

function evaluateJPath(data, path) {
  if (path === '$') return data;
  
  // Simple path evaluation (not full JSONPath spec)
  const parts = path.replace(/^\$\.?/, '').split('.');
  let current = data;
  
  for (const part of parts) {
    if (part === '') continue;
    
    if (part.includes('[') && part.includes(']')) {
      const key = part.substring(0, part.indexOf('['));
      const indexMatch = part.match(/\[(\d+)\]/);
      
      if (key) current = current[key];
      if (indexMatch && Array.isArray(current)) {
        current = current[parseInt(indexMatch[1])];
      }
    } else if (part === '*') {
      if (Array.isArray(current)) {
        return current;
      } else if (typeof current === 'object') {
        return Object.values(current);
      }
    } else {
      current = current[part];
    }
    
    if (current === undefined) break;
  }
  
  return current;
}

// === XML OPERATIONS ===

export function xmlBeautify(xmlString, indentSize = 2) {
  try {
    // Simple XML formatting
    let formatted = xmlString.replace(/></g, '>\n<');
    let indent = 0;
    const lines = formatted.split('\n');
    const result = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('</')) {
        indent -= indentSize;
      }
      
      result.push(' '.repeat(Math.max(0, indent)) + trimmed);
      
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
        indent += indentSize;
      }
    }
    
    return result.join('\n');
  } catch (error) {
    throw new Error(`XML formatting failed: ${error.message}`);
  }
}

export function xmlMinify(xmlString) {
  return xmlString
    .replace(/>\s+</g, '><')
    .replace(/\n\s*/g, '')
    .trim();
}

export function xmlToJson(xmlString) {
  try {
    // Simple XML to JSON conversion (basic implementation)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('Invalid XML');
    }
    
    const result = xmlNodeToObject(xmlDoc.documentElement);
    return JSON.stringify(result, null, 2);
  } catch (error) {
    throw new Error(`XML to JSON conversion failed: ${error.message}`);
  }
}

function xmlNodeToObject(node) {
  const obj = {};
  
  // Add attributes
  if (node.attributes && node.attributes.length > 0) {
    obj['@attributes'] = {};
    for (const attr of node.attributes) {
      obj['@attributes'][attr.name] = attr.value;
    }
  }
  
  // Add child nodes
  if (node.childNodes.length > 0) {
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent.trim();
        if (text) {
          obj['#text'] = text;
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const childName = child.nodeName;
        const childObj = xmlNodeToObject(child);
        
        if (obj[childName]) {
          if (!Array.isArray(obj[childName])) {
            obj[childName] = [obj[childName]];
          }
          obj[childName].push(childObj);
        } else {
          obj[childName] = childObj;
        }
      }
    }
  }
  
  return obj;
}

export function xmlValidate(xmlString) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      return 'Invalid XML: Parse error';
    }
    
    return 'Valid XML ✓';
  } catch (error) {
    return `Invalid XML: ${error.message}`;
  }
}

// XPath query (simplified)
export function xPathQuery(xmlString, xpath) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('Invalid XML');
    }
    
    // Simple XPath evaluation (limited implementation)
    const result = evaluateXPath(xmlDoc, xpath);
    return result;
  } catch (error) {
    throw new Error(`XPath query failed: ${error.message}`);
  }
}

function evaluateXPath(xmlDoc, xpath) {
  // Very basic XPath evaluation - just element selection
  if (xpath.startsWith('//')) {
    const elementName = xpath.substring(2);
    const elements = xmlDoc.getElementsByTagName(elementName);
    const results = [];
    
    for (const element of elements) {
      results.push(element.textContent);
    }
    
    return results.join('\n');
  } else if (xpath.startsWith('/')) {
    const path = xpath.substring(1).split('/');
    let current = xmlDoc.documentElement;
    
    for (const part of path) {
      if (part === '') continue;
      const child = current.getElementsByTagName(part)[0];
      if (!child) return '';
      current = child;
    }
    
    return current.textContent;
  }
  
  return 'XPath query not supported';
}

// === CSV OPERATIONS ===

export function csvToJson(csvString) {
  try {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least header and one data row');
    }
    
    const headers = parseCSVLine(lines[0]);
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const obj = {};
      
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = values[j] || '';
      }
      
      result.push(obj);
    }
    
    return JSON.stringify(result, null, 2);
  } catch (error) {
    throw new Error(`CSV parsing failed: ${error.message}`);
  }
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

export function csvValidate(csvString) {
  try {
    const lines = csvString.trim().split('\n');
    if (lines.length === 0) {
      return 'Empty CSV';
    }
    
    const headerCount = parseCSVLine(lines[0]).length;
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length !== headerCount) {
        return `Row ${i + 1} has ${values.length} columns, expected ${headerCount}`;
      }
    }
    
    return `Valid CSV ✓ (${lines.length} rows, ${headerCount} columns)`;
  } catch (error) {
    return `Invalid CSV: ${error.message}`;
  }
}

// === YAML OPERATIONS (Basic) ===

export function yamlToJson(yamlString) {
  try {
    // Very basic YAML parsing - only handles simple key-value pairs
    const lines = yamlString.trim().split('\n');
    const result = {};
    
    for (const line of lines) {
      if (line.trim() === '' || line.trim().startsWith('#')) continue;
      
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;
      
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      
      // Handle quoted strings
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        result[key] = value.slice(1, -1);
      } else if (value === 'true' || value === 'false') {
        result[key] = value === 'true';
      } else if (!isNaN(value)) {
        result[key] = Number(value);
      } else {
        result[key] = value;
      }
    }
    
    return JSON.stringify(result, null, 2);
  } catch (error) {
    throw new Error(`YAML parsing failed: ${error.message}`);
  }
}

// === UTILITY FUNCTIONS ===

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Export all operations
export const dataFormat = {
  json: {
    beautify: jsonBeautify,
    minify: jsonMinify,
    validate: jsonValidate,
    toXml: jsonToXml,
    toCsv: jsonToCsv,
    jPath: jPathQuery
  },
  xml: {
    beautify: xmlBeautify,
    minify: xmlMinify,
    toJson: xmlToJson,
    validate: xmlValidate,
    xPath: xPathQuery
  },
  csv: {
    toJson: csvToJson,
    validate: csvValidate
  },
  yaml: {
    toJson: yamlToJson
  }
};