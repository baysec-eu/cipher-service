export async function hashSha512(s) {
  const encoder = new TextEncoder();
  const data = encoder.encode(s);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}