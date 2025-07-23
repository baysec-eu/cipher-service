export function md5CryptEncode(s, salt = null) {
  // MD5 crypt implementation (simplified version)
  // This creates MD5-based password hashes in $1$salt$hash format
  
  if (!s) return '';
  
  // Generate random salt if none provided
  if (!salt) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./';
    salt = '';
    for (let i = 0; i < 8; i++) {
      salt += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  // Truncate salt to 8 characters
  salt = salt.substring(0, 8);
  
  try {
    // This is a simplified version - real MD5 crypt is more complex
    // For security research purposes, using crypto-js or similar would be better
    
    // Simple hash simulation (not actual MD5 crypt algorithm)
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(s + salt).digest('hex');
    
    // Return in MD5 crypt format
    return `$1$${salt}$${hash.substring(0, 22)}`;
  } catch (error) {
    // Fallback: simple hash for browser environments
    let hash = 0;
    const combined = s + salt;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const hashStr = Math.abs(hash).toString(36);
    return `$1$${salt}$${hashStr.padEnd(22, '0').substring(0, 22)}`;
  }
}