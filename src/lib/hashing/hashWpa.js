// WPA/WPA2 PSK generation using PBKDF2-SHA1
export async function hashWpa(ssid, password) {
  // WPA/WPA2 uses PBKDF2-SHA1 with 4096 iterations and SSID as salt
  const ssidBytes = new TextEncoder().encode(ssid);
  const passwordBytes = new TextEncoder().encode(password);
  
  // Import password as key material
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  // Derive 256-bit PSK using PBKDF2-SHA1
  const pskBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: ssidBytes,
      iterations: 4096,
      hash: 'SHA-1'
    },
    passwordKey,
    256 // 256 bits for WPA2 PSK
  );
  
  // Convert to hex string
  const pskArray = Array.from(new Uint8Array(pskBits));
  return pskArray.map(b => b.toString(16).padStart(2, '0')).join('');
}