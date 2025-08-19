import { hashMd4 } from './hashMd4.js';
import { hmacMd5 } from './hmacMd5.js';

// NTLMv2 hash implementation based on MS-NLMP specification
export async function hashNtlmv2(username, password, domain = '', serverChallenge = null, clientChallenge = null, targetInfo = null) {
  // Handle case where function is called with just input string (from hash operation)
  if (typeof username === 'string' && arguments.length === 1) {
    // When called as a simple hash, use input as password
    password = username;
    username = '';
    domain = '';
  } else if (typeof username === 'string' && typeof password !== 'string') {
    // Handle case where password is passed as second parameter but might be undefined
    // This happens when called from the UI with parameters
    const actualPassword = username; // First param is actually the input/password
    username = password || ''; // Second param is username
    password = actualPassword;
    domain = domain || '';
  }
  
  // Default parameters if not provided
  if (!username) username = '';
  if (!password) password = '';
  
  // Step 1: Generate NTLM hash (MD4 of UTF-16LE password)
  const passwordUtf16 = new Uint8Array(password.length * 2);
  for (let i = 0; i < password.length; i++) {
    const code = password.charCodeAt(i);
    passwordUtf16[i * 2] = code & 0xff;
    passwordUtf16[i * 2 + 1] = (code >> 8) & 0xff;
  }
  
  const ntlmHash = hashMd4(passwordUtf16);
  const ntlmHashBytes = new Uint8Array(ntlmHash.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  
  // Step 2: Generate NTLMv2 hash
  // Concatenate uppercase username and domain/target
  const identity = (username.toUpperCase() + domain.toUpperCase());
  const identityUtf16 = new Uint8Array(identity.length * 2);
  for (let i = 0; i < identity.length; i++) {
    const code = identity.charCodeAt(i);
    identityUtf16[i * 2] = code & 0xff;
    identityUtf16[i * 2 + 1] = (code >> 8) & 0xff;
  }
  
  // NTLMv2 hash = HMAC-MD5(NTLM hash, identity)
  const ntlmv2Hash = await hmacMd5(ntlmHashBytes, identityUtf16);
  const ntlmv2HashBytes = new Uint8Array(ntlmv2Hash.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  
  // If no challenges provided, return just the NTLMv2 hash
  if (!serverChallenge) {
    return ntlmv2Hash;
  }
  
  // Step 3: Generate client challenge if not provided
  if (!clientChallenge) {
    clientChallenge = new Uint8Array(8);
    crypto.getRandomValues(clientChallenge);
  } else if (typeof clientChallenge === 'string') {
    clientChallenge = new Uint8Array(clientChallenge.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  }
  
  // Convert server challenge to bytes
  if (typeof serverChallenge === 'string') {
    serverChallenge = new Uint8Array(serverChallenge.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  }
  
  // Step 4: Create NTLMv2 blob
  const timestamp = Date.now() * 10000 + 116444736000000000; // Convert to Windows FILETIME
  const blob = createNtlmv2Blob(timestamp, clientChallenge, targetInfo);
  
  // Step 5: Calculate NTLMv2 response
  // Response = HMAC-MD5(NTLMv2 hash, server challenge + blob)
  const responseData = new Uint8Array(serverChallenge.length + blob.length);
  responseData.set(serverChallenge);
  responseData.set(blob, serverChallenge.length);
  
  const response = await hmacMd5(ntlmv2HashBytes, responseData);
  
  // Return complete NTLMv2 response (response + blob)
  const fullResponse = response + Array.from(blob).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Also calculate LMv2 response for completeness
  const lmv2Response = await calculateLmv2Response(ntlmv2HashBytes, serverChallenge, clientChallenge);
  
  return {
    ntlmv2Hash: ntlmv2Hash,
    ntProofStr: response,
    ntlmv2Response: fullResponse,
    lmv2Response: lmv2Response,
    sessionKey: await generateSessionKey(ntlmv2HashBytes, response)
  };
}

// Create NTLMv2 blob structure
function createNtlmv2Blob(timestamp, clientChallenge, targetInfo) {
  // Blob structure:
  // - Signature: 0x01010000
  // - Reserved: 0x00000000
  // - Timestamp: 8 bytes (Windows FILETIME)
  // - Client challenge: 8 bytes
  // - Unknown: 0x00000000
  // - Target info: variable
  // - Unknown: 0x00000000
  
  const signature = new Uint8Array([0x01, 0x01, 0x00, 0x00]);
  const reserved = new Uint8Array(4);
  const timestampBytes = new Uint8Array(8);
  const timestampView = new DataView(timestampBytes.buffer);
  timestampView.setBigUint64(0, BigInt(timestamp), true);
  const unknown = new Uint8Array(4);
  
  // Calculate blob size
  const targetInfoBytes = targetInfo || new Uint8Array(0);
  const blobSize = signature.length + reserved.length + timestampBytes.length + 
                   clientChallenge.length + unknown.length + targetInfoBytes.length + unknown.length;
  
  const blob = new Uint8Array(blobSize);
  let offset = 0;
  
  blob.set(signature, offset); offset += signature.length;
  blob.set(reserved, offset); offset += reserved.length;
  blob.set(timestampBytes, offset); offset += timestampBytes.length;
  blob.set(clientChallenge, offset); offset += clientChallenge.length;
  blob.set(unknown, offset); offset += unknown.length;
  blob.set(targetInfoBytes, offset); offset += targetInfoBytes.length;
  blob.set(unknown, offset);
  
  return blob;
}

// Calculate LMv2 response
async function calculateLmv2Response(ntlmv2Hash, serverChallenge, clientChallenge) {
  const data = new Uint8Array(serverChallenge.length + clientChallenge.length);
  data.set(serverChallenge);
  data.set(clientChallenge, serverChallenge.length);
  
  const response = await hmacMd5(ntlmv2Hash, data);
  const responseBytes = new Uint8Array(response.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  
  // LMv2 = response + client challenge
  const lmv2 = new Uint8Array(responseBytes.length + clientChallenge.length);
  lmv2.set(responseBytes);
  lmv2.set(clientChallenge, responseBytes.length);
  
  return Array.from(lmv2).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate session key
async function generateSessionKey(ntlmv2Hash, ntProofStr) {
  const proofBytes = new Uint8Array(ntProofStr.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  const sessionKey = await hmacMd5(ntlmv2Hash, proofBytes);
  return sessionKey;
}

// Export simple NTLMv2 hash function for basic use
export async function hashNtlmv2Simple(username, password, domain = '') {
  const result = await hashNtlmv2(username, password, domain);
  return typeof result === 'string' ? result : result.ntlmv2Hash;
}