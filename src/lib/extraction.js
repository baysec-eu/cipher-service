// Data Extraction Operations - Extract structured data from text
// Similar to CyberChef's data extraction capabilities

// Email extraction
export function extractEmails(text) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const matches = text.match(emailRegex);
  return matches ? Array.from(new Set(matches)).join('\n') : '';
}

// IP address extraction (IPv4 and IPv6)
export function extractIPs(text) {
  // IPv4 pattern
  const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
  
  // IPv6 pattern (simplified)
  const ipv6Regex = /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b|\b(?:[0-9a-fA-F]{1,4}:){1,7}:\b|\b:(?:[0-9a-fA-F]{1,4}:){1,7}\b|\b(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}\b/g;
  
  const ipv4Matches = text.match(ipv4Regex) || [];
  const ipv6Matches = text.match(ipv6Regex) || [];
  
  const allIPs = [...ipv4Matches, ...ipv6Matches];
  return allIPs.length > 0 ? Array.from(new Set(allIPs)).join('\n') : '';
}

// URL extraction
export function extractURLs(text) {
  const urlRegex = /https?:\/\/(?:[-\w.])+(?:[:\d]+)?(?:\/(?:[\w\/_.])*(?:\?\S+)?)?/g;
  const matches = text.match(urlRegex);
  return matches ? Array.from(new Set(matches)).join('\n') : '';
}

// Phone number extraction (multiple formats)
export function extractPhoneNumbers(text) {
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}|\+?[1-9]\d{1,14}/g;
  const matches = text.match(phoneRegex);
  return matches ? Array.from(new Set(matches)).join('\n') : '';
}

// Hash extraction (MD5, SHA1, SHA256, etc.)
export function extractHashes(text) {
  const hashRegexes = {
    md5: /\b[a-fA-F0-9]{32}\b/g,
    sha1: /\b[a-fA-F0-9]{40}\b/g,
    sha256: /\b[a-fA-F0-9]{64}\b/g,
    sha512: /\b[a-fA-F0-9]{128}\b/g
  };
  
  const results = [];
  
  for (const [type, regex] of Object.entries(hashRegexes)) {
    const matches = text.match(regex);
    if (matches) {
      matches.forEach(hash => {
        results.push(`${type.toUpperCase()}: ${hash}`);
      });
    }
  }
  
  return results.length > 0 ? Array.from(new Set(results)).join('\n') : '';
}

// Credit card number extraction
export function extractCreditCardNumbers(text) {
  // Basic credit card patterns (Luhn algorithm validation would be ideal)
  const ccRegex = /\b(?:\d{4}[-\s]?){3}\d{4}\b|\b\d{13,19}\b/g;
  const matches = text.match(ccRegex);
  
  if (!matches) return '';
  
  // Filter for likely credit card numbers (basic validation)
  const filtered = matches.filter(match => {
    const digits = match.replace(/[-\s]/g, '');
    return digits.length >= 13 && digits.length <= 19 && /^\d+$/.test(digits);
  });
  
  return filtered.length > 0 ? Array.from(new Set(filtered)).join('\n') : '';
}

// MAC address extraction
export function extractMACAddresses(text) {
  const macRegex = /\b[0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2}[:-][0-9A-Fa-f]{2}\b/g;
  const matches = text.match(macRegex);
  return matches ? Array.from(new Set(matches)).join('\n') : '';
}

// Domain extraction
export function extractDomains(text) {
  const domainRegex = /\b[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}\b/g;
  const matches = text.match(domainRegex);
  return matches ? Array.from(new Set(matches)).join('\n') : '';
}

// File paths extraction
export function extractFilePaths(text) {
  // Windows and Unix file paths
  const pathRegex = /(?:[a-zA-Z]:)?[\\\/](?:[^\\\/\n\r]+[\\\/])*[^\\\/\n\r]*|\/(?:[^\/\n\r]+\/)*[^\/\n\r]*/g;
  const matches = text.match(pathRegex);
  
  if (!matches) return '';
  
  // Filter out short or unlikely paths
  const filtered = matches.filter(path => 
    path.length > 3 && 
    (path.includes('/') || path.includes('\\')) &&
    !path.match(/^[\/\\]+$/) // Not just separators
  );
  
  return filtered.length > 0 ? Array.from(new Set(filtered)).join('\n') : '';
}

// Registry keys extraction (Windows)
export function extractRegistryKeys(text) {
  const regKeyRegex = /\b(?:HKEY_[A-Z_]+|HKLM|HKCU|HKCR|HKU|HKCC)\\[\\a-zA-Z0-9_\s.-]+/g;
  const matches = text.match(regKeyRegex);
  return matches ? Array.from(new Set(matches)).join('\n') : '';
}

// UUID extraction
export function extractUUIDs(text) {
  const uuidRegex = /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g;
  const matches = text.match(uuidRegex);
  return matches ? Array.from(new Set(matches)).join('\n') : '';
}

// Base64 strings extraction
export function extractBase64(text) {
  // Base64 pattern (minimum 16 chars to avoid false positives)
  const base64Regex = /\b[A-Za-z0-9+\/]{16,}={0,2}\b/g;
  const matches = text.match(base64Regex);
  
  if (!matches) return '';
  
  // Validate Base64 format
  const filtered = matches.filter(str => {
    // Check padding
    const padding = (str.match(/=/g) || []).length;
    return padding <= 2 && str.length % 4 === 0;
  });
  
  return filtered.length > 0 ? Array.from(new Set(filtered)).join('\n') : '';
}

// Social Security Numbers (SSN) extraction
export function extractSSNs(text) {
  const ssnRegex = /\b\d{3}-?\d{2}-?\d{4}\b/g;
  const matches = text.match(ssnRegex);
  return matches ? Array.from(new Set(matches)).join('\n') : '';
}

// Coordinates extraction (latitude/longitude)
export function extractCoordinates(text) {
  // Decimal degrees format
  const coordRegex = /-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+/g;
  const matches = text.match(coordRegex);
  return matches ? Array.from(new Set(matches)).join('\n') : '';
}

// Bitcoin addresses extraction
export function extractBitcoinAddresses(text) {
  // Bitcoin address patterns
  const btcRegex = /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b|bc1[a-z0-9]{39,59}/g;
  const matches = text.match(btcRegex);
  return matches ? Array.from(new Set(matches)).join('\n') : '';
}

// Extract all types at once
export function extractAll(text) {
  const results = [];
  
  const extractors = {
    'Emails': extractEmails,
    'IP Addresses': extractIPs,
    'URLs': extractURLs,
    'Phone Numbers': extractPhoneNumbers,
    'Hashes': extractHashes,
    'MAC Addresses': extractMACAddresses,
    'Domains': extractDomains,
    'File Paths': extractFilePaths,
    'UUIDs': extractUUIDs,
    'Base64 Strings': extractBase64,
    'Bitcoin Addresses': extractBitcoinAddresses
  };
  
  for (const [type, extractor] of Object.entries(extractors)) {
    const extracted = extractor(text);
    if (extracted) {
      results.push(`=== ${type} ===`);
      results.push(extracted);
      results.push('');
    }
  }
  
  return results.join('\n');
}

// Statistics about extractions
export function extractionStats(text) {
  const stats = {
    emails: (extractEmails(text).match(/\n/g) || []).length + (extractEmails(text) ? 1 : 0),
    ips: (extractIPs(text).match(/\n/g) || []).length + (extractIPs(text) ? 1 : 0),
    urls: (extractURLs(text).match(/\n/g) || []).length + (extractURLs(text) ? 1 : 0),
    phones: (extractPhoneNumbers(text).match(/\n/g) || []).length + (extractPhoneNumbers(text) ? 1 : 0),
    hashes: (extractHashes(text).match(/\n/g) || []).length + (extractHashes(text) ? 1 : 0),
    domains: (extractDomains(text).match(/\n/g) || []).length + (extractDomains(text) ? 1 : 0)
  };
  
  // Adjust counts (subtract 1 if empty string returned)
  Object.keys(stats).forEach(key => {
    if (stats[key] === 1) {
      const extractor = {
        emails: extractEmails,
        ips: extractIPs,
        urls: extractURLs,
        phones: extractPhoneNumbers,
        hashes: extractHashes,
        domains: extractDomains
      }[key];
      if (!extractor(text)) stats[key] = 0;
    }
  });
  
  return Object.entries(stats)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => `${type}: ${count}`)
    .join('\n') || 'No structured data found';
}

// Export all extraction functions
export const extractors = {
  all: extractAll,
  emails: extractEmails,
  ips: extractIPs,
  urls: extractURLs,
  phoneNumbers: extractPhoneNumbers,
  hashes: extractHashes,
  creditCardNumbers: extractCreditCardNumbers,
  macAddresses: extractMACAddresses,
  domains: extractDomains,
  filePaths: extractFilePaths,
  registryKeys: extractRegistryKeys,
  uuids: extractUUIDs,
  base64: extractBase64,
  ssns: extractSSNs,
  coordinates: extractCoordinates,
  bitcoinAddresses: extractBitcoinAddresses,
  stats: extractionStats
};