// Combined cipher functions - all cipher encoders and decoders
import { rot13 } from './cipher/rot13.js';
import { caesar } from './cipher/caesar.js';
import { xorCipher } from './cipher/xorCipher.js';
import { xorCipherMultiKey } from './cipher/xorCipherMultiKey.js';
import { vigenereEncode } from './cipher/vigenereEncode.js';
import { vigenereDecode } from './cipher/vigenereDecode.js';
import { atbashCipher } from './cipher/atbashCipher.js';
import { affineCipherEncode } from './cipher/affineCipherEncode.js';
import { affineCipherDecode } from './cipher/affineCipherDecode.js';
import { playfairEncode } from './cipher/playfairEncode.js';
import { playfairDecode } from './cipher/playfairDecode.js';
import { railFenceEncode } from './cipher/railFenceEncode.js';
import { railFenceDecode } from './cipher/railFenceDecode.js';
import { beaufortCipher } from './cipher/beaufortCipher.js';
import { fourSquareEncode } from './cipher/fourSquareEncode.js';
import { fourSquareDecode } from './cipher/fourSquareDecode.js';
import { baconEncode } from './cipher/baconEncode.js';
import { baconDecode } from './cipher/baconDecode.js';
import { a1z26Encode } from './cipher/a1z26Encode.js';
import { a1z26Decode } from './cipher/a1z26Decode.js';
import { bifidEncode } from './cipher/bifidEncode.js';
import { bifidDecode } from './cipher/bifidDecode.js';
import { rot47 } from './cipher/rot47.js';
import { rc4Encrypt } from './cipher/rc4Encrypt.js';
import { rc4Decrypt } from './cipher/rc4Decrypt.js';
import { blowfishEncrypt } from './cipher/blowfishEncrypt.js';
import { kerberosEncrypt } from './cipher/kerberosEncrypt.js';
import { kerberosDecrypt } from './cipher/kerberosDecrypt.js';
import { xorCipherMultiKeyDecode } from './cipher/xorCipherMultiKeyDecode.js';

export const ciphers = {
  // Classical ciphers
  classical: {
    rot13,
    caesar,
    atbashCipher,
    rot47
  },
  
  // XOR ciphers
  xor: {
    xorCipher,
    xorCipherMultiKey,
    xorCipherMultiKeyDecode
  },
  
  // Polyalphabetic ciphers
  polyalphabetic: {
    vigenereEncode,
    vigenereDecode,
    beaufortCipher
  },
  
  // Mathematical ciphers
  mathematical: {
    affineCipherEncode,
    affineCipherDecode
  },
  
  // Grid-based ciphers
  grid: {
    playfairEncode,
    playfairDecode,
    fourSquareEncode,
    fourSquareDecode,
    bifidEncode,
    bifidDecode
  },
  
  // Transposition ciphers
  transposition: {
    railFenceEncode,
    railFenceDecode
  },
  
  // Steganographic ciphers
  steganographic: {
    baconEncode,
    baconDecode
  },
  
  // Number ciphers
  numeric: {
    a1z26Encode,
    a1z26Decode
  },
  
  // Modern encryption
  modern: {
    rc4Encrypt,
    rc4Decrypt,
    blowfishEncrypt,
    kerberosEncrypt,
    kerberosDecrypt
  },

  rot13,
  caesar,
  xorCipher,
  xorCipherMultiKey,
  xorCipherMultiKeyDecode,
  vigenereEncode,
  vigenereDecode,
  atbashCipher,
  affineCipherEncode,
  affineCipherDecode,
  playfairEncode,
  playfairDecode,
  railFenceEncode,
  railFenceDecode,
  beaufortCipher,
  fourSquareEncode,
  fourSquareDecode,
  baconEncode,
  baconDecode,
  a1z26Encode,
  a1z26Decode,
  bifidEncode,
  bifidDecode,
  rot47,
  rc4Encrypt,
  rc4Decrypt,
  blowfishEncrypt,
  kerberosEncrypt,
  kerberosDecrypt
};

// Export individual functions for direct access
export {
  rot13,
  caesar,
  xorCipher,
  xorCipherMultiKey,
  xorCipherMultiKeyDecode,
  vigenereEncode,
  vigenereDecode,
  atbashCipher,
  affineCipherEncode,
  affineCipherDecode,
  playfairEncode,
  playfairDecode,
  railFenceEncode,
  railFenceDecode,
  beaufortCipher,
  fourSquareEncode,
  fourSquareDecode,
  baconEncode,
  baconDecode,
  a1z26Encode,
  a1z26Decode,
  bifidEncode,
  bifidDecode,
  rot47,
  rc4Encrypt,
  rc4Decrypt,
  blowfishEncrypt,
  kerberosEncrypt,
  kerberosDecrypt
};