export function hashWpa(ssid, password) {
  console.warn('Simplified WPA/WPA2 implementation - use proper 802.11 library for production');
  
  // Simplified PBKDF2 for WPA
  let psk = new TextEncoder().encode(password);
  const ssidBytes = new TextEncoder().encode(ssid);
  
  for (let i = 0; i < 4096; i++) {
    const input = Array.from(psk).map(b => String.fromCharCode(b)).join('') + 
                  Array.from(ssidBytes).map(b => String.fromCharCode(b)).join('') + i;
    psk = customMd5Bytes(new TextEncoder().encode(input));
  }
  
  return Array.from(psk).map(b => b.toString(16).padStart(2, '0')).join('');
}