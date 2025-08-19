// SHA512-Crypt implementation based on Unix crypt(3) specification
export async function hashSha512Crypt(password, salt = null, rounds = 5000) {
  // Ensure rounds is within valid range
  rounds = Math.max(1000, Math.min(999999999, rounds));
  
  // Generate random salt if not provided
  if (!salt) {
    const chars = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    salt = Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } else if (salt.length > 16) {
    salt = salt.substring(0, 16);
  }
  
  const passwordBytes = new TextEncoder().encode(password);
  const saltBytes = new TextEncoder().encode(salt);
  const encoder = new TextEncoder();
  
  // Step 1: Start with password + magic + salt
  let b = new Uint8Array([
    ...passwordBytes,
    ...encoder.encode('$6$'),
    ...saltBytes
  ]);
  
  // Step 2: Add alternate sum
  let altSum = await crypto.subtle.digest('SHA-512', 
    new Uint8Array([...passwordBytes, ...saltBytes, ...passwordBytes])
  );
  let altSumBytes = new Uint8Array(altSum);
  
  // Step 3: Add altSum for each character in password
  let cnt = passwordBytes.length;
  while (cnt > 64) {
    b = new Uint8Array([...b, ...altSumBytes]);
    cnt -= 64;
  }
  b = new Uint8Array([...b, ...altSumBytes.slice(0, cnt)]);
  
  // Step 4: Add bits based on password length
  cnt = passwordBytes.length;
  while (cnt > 0) {
    if (cnt & 1) {
      b = new Uint8Array([...b, ...altSumBytes]);
    } else {
      b = new Uint8Array([...b, ...passwordBytes]);
    }
    cnt >>= 1;
  }
  
  // Step 5: Create intermediate sum
  let intermediateSum = await crypto.subtle.digest('SHA-512', b);
  let intermediateSumBytes = new Uint8Array(intermediateSum);
  
  // Step 6: Create P sequence
  let pBytes = new Uint8Array(0);
  for (let i = 0; i < passwordBytes.length; i++) {
    pBytes = new Uint8Array([...pBytes, ...passwordBytes]);
  }
  let tempP = await crypto.subtle.digest('SHA-512', pBytes);
  let pSequence = new Uint8Array(tempP);
  
  // Create final P sequence
  pBytes = new Uint8Array(0);
  cnt = passwordBytes.length;
  while (cnt > 64) {
    pBytes = new Uint8Array([...pBytes, ...pSequence]);
    cnt -= 64;
  }
  pBytes = new Uint8Array([...pBytes, ...pSequence.slice(0, cnt)]);
  
  // Step 7: Create S sequence
  let sBytes = new Uint8Array(0);
  for (let i = 0; i < 16 + intermediateSumBytes[0]; i++) {
    sBytes = new Uint8Array([...sBytes, ...saltBytes]);
  }
  let tempS = await crypto.subtle.digest('SHA-512', sBytes);
  let sSequence = new Uint8Array(tempS);
  
  // Create final S sequence
  sBytes = new Uint8Array(0);
  cnt = saltBytes.length;
  while (cnt > 64) {
    sBytes = new Uint8Array([...sBytes, ...sSequence]);
    cnt -= 64;
  }
  sBytes = new Uint8Array([...sBytes, ...sSequence.slice(0, cnt)]);
  
  // Step 8: Iterate rounds
  let currentSum = intermediateSumBytes;
  for (let round = 0; round < rounds; round++) {
    b = new Uint8Array(0);
    
    // Add password or previous sum
    if (round & 1) {
      b = new Uint8Array([...b, ...pBytes]);
    } else {
      b = new Uint8Array([...b, ...currentSum]);
    }
    
    // Add salt for rounds not divisible by 3
    if (round % 3 !== 0) {
      b = new Uint8Array([...b, ...sBytes]);
    }
    
    // Add password for rounds not divisible by 7
    if (round % 7 !== 0) {
      b = new Uint8Array([...b, ...pBytes]);
    }
    
    // Add password or previous sum again
    if (round & 1) {
      b = new Uint8Array([...b, ...currentSum]);
    } else {
      b = new Uint8Array([...b, ...pBytes]);
    }
    
    let digest = await crypto.subtle.digest('SHA-512', b);
    currentSum = new Uint8Array(digest);
  }
  
  // Convert to crypt base64
  const cryptBase64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let output = '';
  
  // Custom base64 encoding with permutation
  const permutation = [
    [0, 21, 42], [22, 43, 1], [44, 2, 23], [3, 24, 45], [25, 46, 4], [47, 5, 26],
    [6, 27, 48], [28, 49, 7], [50, 8, 29], [9, 30, 51], [31, 52, 10], [53, 11, 32],
    [12, 33, 54], [34, 55, 13], [56, 14, 35], [15, 36, 57], [37, 58, 16], [59, 17, 38],
    [18, 39, 60], [40, 61, 19], [62, 20, 41], [63]
  ];
  
  for (let i = 0; i < permutation.length - 1; i++) {
    const [a, b, c] = permutation[i];
    let v = (currentSum[a] << 16) | (currentSum[b] << 8) | currentSum[c];
    
    for (let j = 0; j < 4; j++) {
      output += cryptBase64[v & 0x3f];
      v >>= 6;
    }
  }
  
  // Last byte
  let v = currentSum[63];
  output += cryptBase64[v & 0x3f];
  output += cryptBase64[(v >> 6) & 0x3f];
  
  // Format output
  if (rounds !== 5000) {
    return `$6$rounds=${rounds}$${salt}$${output}`;
  } else {
    return `$6$${salt}$${output}`;
  }
}