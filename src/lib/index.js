import { encoders } from './encoders.js';
import { decoders } from './decoders.js';
import { ciphers } from './ciphers.js';
import { hashes } from './hashes.js';
import { magic } from './magic.js';
import { analysis } from './analysis.js';
import { datetime } from './datetime.js';
import { networking } from './networking.js';
import { crypto } from './crypto.js';
import { CryptoAPI, CryptoAPIClient } from './api.js';
import RecipeManager from './recipes.js';
import * as bitwise from './bitwise.js';
import { DataCircuit } from './circuit.js';
import { SequenceController } from './sequencing.js';
import { DualViewManager } from './dualview.js';
import * as compression from './compression.js';
import * as dataformat from './dataformat.js';
import * as extraction from './extraction.js';
import { variableOperations, sinkOperations, VariableManager } from './variables.js';
import { unicodeOperations } from './unicode.js';
import { internationalCiphers, POLISH_ALPHABET, GERMAN_ALPHABET, FRENCH_ALPHABET, SPANISH_ALPHABET, TURKISH_ALPHABET, CYRILLIC_ALPHABET, GREEK_ALPHABET } from './alphabets.js';
import { mathUnicodeChrEncode } from './encoder/mathUnicodeChrEncode.js';
import { mathUnicodeLettersEncode } from './encoder/mathUnicodeLettersEncode.js';
import { decodeMathUnicodeLetters } from './decoder/decodeMathUnicodeLetters.js';
import { decodeMathUnicodeChr } from './decoder/decodeMathUnicodeChr.js';
import { jsMinify, jsBeautify } from './dataformat/jsMinifier.js';

// Import new operations - simple functions
import { encodeXxd } from './encoder/encodeXxd.js';
import { parseHexdump, decodeXxd } from './decoder/decodeXxd.js';
import { generateString, findPatternOffset } from './generators/generateString.js';

// Import advanced AES operations with KDF support
import {
  generateAesKey, generateAesKeyFromPassword
} from './cipher/aesAdvanced.js';

// Import enhanced envelope operations
import {
  enhancedEnvelopeEncrypt, enhancedEnvelopeDecrypt
} from './cipher/aesEnhanced.js';

// Import unified crypto operations
import { 
  aesTransform, 
  desTransform, 
  blowfishTransform, 
  rc4Transform, 
  rsaTransform,
  xorTransform 
} from './crypto/unifiedCrypto.js';

// Import bitwise operations
import {
  xorBitwise, andBitwise, orBitwise, notBitwise,
  shiftLeft, shiftRight,
  rotateLeft, rotateRight, xorBruteForce
} from './arithmetic/bitOperations.js';

// Import archive password cracking
import { crack7zPassword, crackZipPassword, crackPdfPassword } from './passwordCracking/archivePasswords.js';

// Import text analysis operations
import { characterCount, wordCount } from './textAnalysis.js';

// Import KDF functions from dedicated modules
import { hkdf as hkdfDerive } from './kdf/hkdf.js';
import { pbkdf2 as pbkdf2Derive } from './kdf/pbkdf2.js';
import { scrypt as scryptDerive } from './kdf/scrypt.js';
import { argon2Raw as argon2Derive } from './kdf/argon2.js';

// Import enhanced cryptographic functions
import { 
  chaCha20Poly1305Encrypt, ecdsaSign, ecdhKeyAgreement,
  analyzeEntropy, analyzeKeyStrength
} from './cryptoEnhanced.js';

// Import simple conversion functions
import {
  stringToNumber, hexToNumber, numberToHex, numberToBase, 
  baseToNumber, extractNumber, hexToAscii, asciiToHex
} from './conversions.js';

// Operation definitions with metadata
export const operations = [
  // Base encoders
  { id: 'url_encode', name: 'URL Encode (ASCII)', type: 'encode', category: 'base', func: encoders.base.urlencodeAscii },
  { id: 'xml_encode', name: 'XML Encode', type: 'encode', category: 'base', func: encoders.base.xmlEncode },
  { id: 'base64_encode', name: 'Base64 Encode', type: 'encode', category: 'base', func: encoders.base.encodeBase64 },
  { id: 'base64_url_encode', name: 'Base64 URL Encode', type: 'encode', category: 'base', func: encoders.base.encodeBase64Url },
  { id: 'hex_encode', name: 'Hex Encode', type: 'encode', category: 'base', func: encoders.base.encodeHex },
  { id: 'ascii_hex_encode', name: 'ASCII Hex Encode', type: 'encode', category: 'base', func: encoders.base.encodeAsciiHex },
  { id: 'octal_encode', name: 'Octal Encode', type: 'encode', category: 'base', func: encoders.base.encodeOctal },
  { id: 'binary_encode', name: 'Binary Encode', type: 'encode', category: 'base', func: encoders.base.encodeBinary },
  { id: 'base32_encode', name: 'Base32 Encode', type: 'encode', category: 'base_extended', func: encoders.base_extended.encodeBase32 },
  
  // Extended Base Encodings
  { id: 'base16_encode', name: 'Base16 Encode', type: 'encode', category: 'base_extended', func: encoders.base_extended.encodeBase16 },
  { id: 'base32_hex_encode', name: 'Base32 Hex Encode', type: 'encode', category: 'base_extended', func: encoders.base_extended.encodeBase32Hex },
  { id: 'base32_z_encode', name: 'Base32 Z-Base Encode', type: 'encode', category: 'base_extended', func: encoders.base_extended.encodeBase32Z },
  { id: 'base36_encode', name: 'Base36 Encode', type: 'encode', category: 'base_extended', func: encoders.base_extended.encodeBase36 },
  { id: 'base58_encode', name: 'Base58 Encode', type: 'encode', category: 'base_extended', func: encoders.base_extended.encodeBase58 },
  { id: 'base62_encode', name: 'Base62 Encode', type: 'encode', category: 'base_extended', func: encoders.base_extended.encodeBase62 },
  { id: 'base64_safe_encode', name: 'Base64 URL Safe', type: 'encode', category: 'base_extended', func: encoders.base_extended.encodeBase64Safe },
  { id: 'base64_no_padding', name: 'Base64 No Padding', type: 'encode', category: 'base_extended', func: encoders.base_extended.encodeBase64NoPadding },
  { id: 'base91_encode', name: 'Base91 Encode', type: 'encode', category: 'base_extended', func: encoders.base_extended.encodeBase91 },
  { id: 'basex_encode', name: 'BaseX (Custom)', type: 'encode', category: 'base_extended', func: encoders.base_extended.encodeBaseX, params: ['alphabet'] },
  
  // Binary variants
  { id: 'binary_spaced', name: 'Binary (Spaced)', type: 'encode', category: 'binary', func: encoders.binary.encodeBinarySpaced },
  { id: 'binary_packed', name: 'Binary (Packed)', type: 'encode', category: 'binary', func: encoders.binary.encodeBinaryPacked },
  
  // Decimal encoding
  { id: 'decimal_encode', name: 'Decimal (Spaced)', type: 'encode', category: 'decimal', func: encoders.decimal.encodeDecimal },
  { id: 'decimal_packed', name: 'Decimal (Comma)', type: 'encode', category: 'decimal', func: encoders.decimal.encodeDecimalPacked },
  
  // Serialization formats
  { id: 'ascii85_encode', name: 'ASCII85 Encode', type: 'encode', category: 'serialization', func: encoders.serialization.encodeAscii85 },
  { id: 'uuencode', name: 'UUencode', type: 'encode', category: 'serialization', func: encoders.serialization.uuencode },
  { id: 'yencode', name: 'yEnc Encode', type: 'encode', category: 'serialization', func: encoders.serialization.yEncodeText },
  { id: 'asn1_der_encode', name: 'ASN.1 DER Encode', type: 'encode', category: 'serialization', func: encoders.serialization.encodeAsn1Der },
  { id: 'bencode_encode', name: 'Bencode', type: 'encode', category: 'serialization', func: encoders.serialization.encodeBencode },
  { id: 'messagepack_encode', name: 'MessagePack', type: 'encode', category: 'serialization', func: encoders.serialization.encodeMessagePack },
  { id: 'cbor_encode', name: 'CBOR Encode', type: 'encode', category: 'serialization', func: encoders.serialization.encodeCbor },
  { id: 'plist_encode', name: 'Property List (XML)', type: 'encode', category: 'serialization', func: encoders.serialization.encodePlist },
  { id: 'bson_encode', name: 'BSON Encode', type: 'encode', category: 'serialization', func: encoders.serialization.encodeBson },
  { id: 'amf0_encode', name: 'AMF0 Encode', type: 'encode', category: 'serialization', func: encoders.serialization.encodeAmf0 },
  { id: 'amf3_encode', name: 'AMF3 Encode', type: 'encode', category: 'serialization', func: encoders.serialization.encodeAmf3 },
  { id: 'avro_encode', name: 'Avro Encode', type: 'encode', category: 'serialization', func: encoders.serialization.encodeAvro },
  
  // Ciphers
  { id: 'rot13', name: 'ROT13', type: 'cipher', category: 'cipher', func: encoders.base.rot13 },
  { id: 'caesar', name: 'Caesar Cipher', type: 'cipher', category: 'cipher', func: encoders.base.caesar, params: ['shift'] },
  { id: 'xor', name: 'XOR Cipher', type: 'cipher', category: 'cipher', func: (input, key, keyFormat, outputFormat) => 
    xorTransform(input, { key, keyFormat, outputFormat }), 
    params: ['key', 'keyFormat', 'outputFormat'] },
  { id: 'vigenere_encode', name: 'Vigenère Encode', type: 'cipher', category: 'cipher', func: ciphers.vigenereEncode, params: ['keyStr'] },
  { id: 'vigenere_decode', name: 'Vigenère Decode', type: 'cipher', category: 'cipher', func: ciphers.vigenereDecode, params: ['keyStr'] },
  { id: 'atbash', name: 'Atbash Cipher', type: 'cipher', category: 'cipher', func: ciphers.atbashCipher },
  { id: 'affine_encode', name: 'Affine Cipher Encode', type: 'cipher', category: 'cipher', func: ciphers.affineCipherEncode, params: ['a', 'b'] },
  { id: 'affine_decode', name: 'Affine Cipher Decode', type: 'cipher', category: 'cipher', func: ciphers.affineCipherDecode, params: ['a', 'b'] },
  { id: 'playfair_encode', name: 'Playfair Encode', type: 'cipher', category: 'cipher', func: ciphers.playfairEncode, params: ['keyStr'] },
  { id: 'playfair_decode', name: 'Playfair Decode', type: 'cipher', category: 'cipher', func: ciphers.playfairDecode, params: ['keyStr'] },
  { id: 'railfence_encode', name: 'Rail Fence Encode', type: 'cipher', category: 'cipher', func: ciphers.railFenceEncode, params: ['rails'] },
  { id: 'railfence_decode', name: 'Rail Fence Decode', type: 'cipher', category: 'cipher', func: ciphers.railFenceDecode, params: ['rails'] },
  { id: 'beaufort', name: 'Beaufort Cipher', type: 'cipher', category: 'cipher', func: ciphers.beaufortCipher, params: ['keyStr'] },
  { id: 'foursquare_encode', name: 'Four Square Encode', type: 'cipher', category: 'cipher', func: ciphers.fourSquareEncode, params: ['keyStr1', 'keyStr2'] },
  { id: 'foursquare_decode', name: 'Four Square Decode', type: 'cipher', category: 'cipher', func: ciphers.fourSquareDecode, params: ['keyStr1', 'keyStr2'] },
  { id: 'bacon_encode', name: 'Bacon Cipher Encode', type: 'cipher', category: 'cipher', func: ciphers.baconEncode },
  { id: 'bacon_decode', name: 'Bacon Cipher Decode', type: 'cipher', category: 'cipher', func: ciphers.baconDecode },
  { id: 'a1z26_encode', name: 'A1Z26 Encode', type: 'cipher', category: 'cipher', func: ciphers.a1z26Encode },
  { id: 'a1z26_decode', name: 'A1Z26 Decode', type: 'cipher', category: 'cipher', func: ciphers.a1z26Decode },
  { id: 'bifid_encode', name: 'Bifid Cipher Encode', type: 'cipher', category: 'cipher', func: ciphers.bifidEncode, params: ['keyStr'] },
  { id: 'bifid_decode', name: 'Bifid Cipher Decode', type: 'cipher', category: 'cipher', func: decoders.ciphers.bifidDecode, params: ['keyStr'] },
  { id: 'rot47', name: 'ROT47', type: 'cipher', category: 'cipher', func: ciphers.rot47 },

  // International ciphers with custom alphabets
  { id: 'caesar_polish', name: 'Caesar (Polish)', type: 'cipher', category: 'international', func: (input, shift = 3) => internationalCiphers.caesarWithAlphabet(input, parseInt(shift), POLISH_ALPHABET), params: ['shift'] },
  { id: 'caesar_german', name: 'Caesar (German)', type: 'cipher', category: 'international', func: (input, shift = 3) => internationalCiphers.caesarWithAlphabet(input, parseInt(shift), GERMAN_ALPHABET), params: ['shift'] },
  { id: 'caesar_french', name: 'Caesar (French)', type: 'cipher', category: 'international', func: (input, shift = 3) => internationalCiphers.caesarWithAlphabet(input, parseInt(shift), FRENCH_ALPHABET), params: ['shift'] },
  { id: 'caesar_spanish', name: 'Caesar (Spanish)', type: 'cipher', category: 'international', func: (input, shift = 3) => internationalCiphers.caesarWithAlphabet(input, parseInt(shift), SPANISH_ALPHABET), params: ['shift'] },
  { id: 'caesar_turkish', name: 'Caesar (Turkish)', type: 'cipher', category: 'international', func: (input, shift = 3) => internationalCiphers.caesarWithAlphabet(input, parseInt(shift), TURKISH_ALPHABET), params: ['shift'] },
  { id: 'caesar_cyrillic', name: 'Caesar (Cyrillic)', type: 'cipher', category: 'international', func: (input, shift = 3) => internationalCiphers.caesarWithAlphabet(input, parseInt(shift), CYRILLIC_ALPHABET), params: ['shift'] },
  { id: 'caesar_greek', name: 'Caesar (Greek)', type: 'cipher', category: 'international', func: (input, shift = 3) => internationalCiphers.caesarWithAlphabet(input, parseInt(shift), GREEK_ALPHABET), params: ['shift'] },
  
  { id: 'rot_polish', name: 'ROT16 (Polish)', type: 'cipher', category: 'international', func: (input) => internationalCiphers.rotNWithAlphabet(input, null, POLISH_ALPHABET) },
  { id: 'rot_german', name: 'ROT15 (German)', type: 'cipher', category: 'international', func: (input) => internationalCiphers.rotNWithAlphabet(input, null, GERMAN_ALPHABET) },
  { id: 'rot_spanish', name: 'ROT13 (Spanish)', type: 'cipher', category: 'international', func: (input) => internationalCiphers.rotNWithAlphabet(input, null, SPANISH_ALPHABET) },
  { id: 'rot_turkish', name: 'ROT14 (Turkish)', type: 'cipher', category: 'international', func: (input) => internationalCiphers.rotNWithAlphabet(input, null, TURKISH_ALPHABET) },
  { id: 'rot_cyrillic', name: 'ROT16 (Cyrillic)', type: 'cipher', category: 'international', func: (input) => internationalCiphers.rotNWithAlphabet(input, null, CYRILLIC_ALPHABET) },
  { id: 'rot_greek', name: 'ROT12 (Greek)', type: 'cipher', category: 'international', func: (input) => internationalCiphers.rotNWithAlphabet(input, null, GREEK_ALPHABET) },
  
  { id: 'atbash_polish', name: 'Atbash (Polish)', type: 'cipher', category: 'international', func: (input) => internationalCiphers.atbashWithAlphabet(input, POLISH_ALPHABET) },
  { id: 'atbash_german', name: 'Atbash (German)', type: 'cipher', category: 'international', func: (input) => internationalCiphers.atbashWithAlphabet(input, GERMAN_ALPHABET) },
  { id: 'atbash_turkish', name: 'Atbash (Turkish)', type: 'cipher', category: 'international', func: (input) => internationalCiphers.atbashWithAlphabet(input, TURKISH_ALPHABET) },
  { id: 'atbash_cyrillic', name: 'Atbash (Cyrillic)', type: 'cipher', category: 'international', func: (input) => internationalCiphers.atbashWithAlphabet(input, CYRILLIC_ALPHABET) },
  
  { id: 'vigenere_polish_encode', name: 'Vigenère Encode (Polish)', type: 'cipher', category: 'international', func: (input, key) => internationalCiphers.vigenereWithAlphabet(input, key, true, POLISH_ALPHABET), params: ['key'] },
  { id: 'vigenere_polish_decode', name: 'Vigenère Decode (Polish)', type: 'cipher', category: 'international', func: (input, key) => internationalCiphers.vigenereWithAlphabet(input, key, false, POLISH_ALPHABET), params: ['key'] },
  { id: 'vigenere_german_encode', name: 'Vigenère Encode (German)', type: 'cipher', category: 'international', func: (input, key) => internationalCiphers.vigenereWithAlphabet(input, key, true, GERMAN_ALPHABET), params: ['key'] },
  { id: 'vigenere_german_decode', name: 'Vigenère Decode (German)', type: 'cipher', category: 'international', func: (input, key) => internationalCiphers.vigenereWithAlphabet(input, key, false, GERMAN_ALPHABET), params: ['key'] },
  { id: 'vigenere_turkish_encode', name: 'Vigenère Encode (Turkish)', type: 'cipher', category: 'international', func: (input, key) => internationalCiphers.vigenereWithAlphabet(input, key, true, TURKISH_ALPHABET), params: ['key'] },
  { id: 'vigenere_turkish_decode', name: 'Vigenère Decode (Turkish)', type: 'cipher', category: 'international', func: (input, key) => internationalCiphers.vigenereWithAlphabet(input, key, false, TURKISH_ALPHABET), params: ['key'] },
  
  { id: 'affine_polish_encode', name: 'Affine Encode (Polish)', type: 'cipher', category: 'international', func: (input, a = 5, b = 8) => internationalCiphers.affineWithAlphabet(input, parseInt(a), parseInt(b), true, POLISH_ALPHABET), params: ['a', 'b'] },
  { id: 'affine_polish_decode', name: 'Affine Decode (Polish)', type: 'cipher', category: 'international', func: (input, a = 5, b = 8) => internationalCiphers.affineWithAlphabet(input, parseInt(a), parseInt(b), false, POLISH_ALPHABET), params: ['a', 'b'] },
  
  // Hash functions
  { id: 'md5', name: 'MD5 Hash', type: 'hash', category: 'hash', func: hashes.hashMd5 },
  { id: 'sha1', name: 'SHA1 Hash', type: 'hash', category: 'hash', func: hashes.hashSha1 },
  { id: 'sha256', name: 'SHA256 Hash', type: 'hash', category: 'hash', func: hashes.hashSha256 },
  { id: 'sha384', name: 'SHA384 Hash', type: 'hash', category: 'hash', func: hashes.hashSha384 },
  { id: 'sha512', name: 'SHA512 Hash', type: 'hash', category: 'hash', func: hashes.hashSha512 },
  { id: 'ntlm', name: 'NTLM Hash', type: 'hash', category: 'hash', func: hashes.hashNtlm },
  { id: 'ntlmv1', name: 'NTLMv1 Hash', type: 'hash', category: 'hash', func: hashes.hashNtlmv1, params: ['username', 'domain', 'challenge'] },
  { id: 'ntlmv2', name: 'NTLMv2 Hash', type: 'hash', category: 'hash', func: hashes.hashNtlmv2, params: ['username', 'password', 'domain', 'serverChallenge', 'clientChallenge'] },
  { id: 'mysql_old', name: 'MySQL OLD_PASSWORD', type: 'hash', category: 'hash', func: hashes.hashMysqlOld },
  { id: 'mysql', name: 'MySQL PASSWORD', type: 'hash', category: 'hash', func: hashes.hashMysql },
  
  // Advanced URL encoding
  { id: 'double_url_encode', name: 'Double URL Encode', type: 'encode', category: 'url', func: encoders.url.doubleUrlencode },
  { id: 'triple_url_encode', name: 'Triple URL Encode', type: 'encode', category: 'url', func: encoders.url.tripleUrlencode },
  { id: 'url_encode_all', name: 'URL Encode All Characters', type: 'encode', category: 'url', func: encoders.url.urlencodeAllChars },
  
  // Unicode encoders

  { id: 'math_unicode_encode', name: 'Math Unicode Encode', type: 'encode', category: 'unicode', func: mathUnicodeLettersEncode },
  { id: 'math_unicode_chr_encode', name: 'Math Unicode Chr Encode', type: 'encode', category: 'unicode', func: mathUnicodeChrEncode },

  { id: 'math_unicode_chr_decode', name: 'Math Unicode Chr Decode', type: 'decode', category: 'unicode', func: decodeMathUnicodeChr },
  { id: 'math_unicode_letters_decode', name: 'Math Unicode Letters Decode', type: 'decode', category: 'unicode', func: decodeMathUnicodeLetters },

  { id: 'unicode_escape', name: 'Unicode Escape', type: 'encode', category: 'unicode', func: encoders.unicode.unicodeEscape },
  { id: 'unicode_mixed', name: 'Unicode Mixed Escape', type: 'encode', category: 'unicode', func: encoders.unicode.unicodeEscapeMixed },
  { id: 'unicode_overlong', name: 'Unicode Overlong UTF-8', type: 'encode', category: 'unicode', func: encoders.unicode.unicodeOverlongUtf8 },
  { id: 'zalgo', name: 'Zalgo Text', type: 'encode', category: 'unicode', func: encoders.unicode.unicodeZalgoEncode, params: ['intensity', 'upwards', 'downwards', 'middle'] },
  { id: 'homograph', name: 'Unicode Homograph', type: 'encode', category: 'unicode', func: encoders.unicode.unicodeHomographEncode },
  
  // HTML encoders
  { id: 'html_named', name: 'HTML Named Entities', type: 'encode', category: 'html', func: encoders.html.htmlNamedEntities },
  { id: 'html_hex', name: 'HTML Hex Entities', type: 'encode', category: 'html', func: encoders.html.htmlHexEntities },
  { id: 'html_decimal', name: 'HTML Decimal Entities', type: 'encode', category: 'html', func: encoders.html.htmlDecimalEntities },
  { id: 'html_hex_zeros', name: 'HTML Hex (Leading Zeros)', type: 'encode', category: 'html', func: encoders.html.htmlHexEntitiesLeadingZeros },
  
  // JavaScript context
  { id: 'js_fromcharcode', name: 'JS String.fromCharCode', type: 'encode', category: 'javascript', func: encoders.javascript.jsStringFromcharcodeSplit },
  { id: 'js_eval_fromcharcode', name: 'JS eval(String.fromCharCode)', type: 'encode', category: 'javascript', func: encoders.javascript.jsEvalFromcharcode },
  { id: 'js_unicode', name: 'JS Unicode Escape', type: 'encode', category: 'javascript', func: encoders.javascript.jsUnicodeEscape },
  { id: 'js_hex', name: 'JS Hex Escape', type: 'encode', category: 'javascript', func: encoders.javascript.jsHexEscape },
  
  // SQL context
  { id: 'sql_char_hex', name: 'SQL CHAR/Hex Mixed', type: 'encode', category: 'sql', func: encoders.sql.sqlCharHexMixed },
  { id: 'sql_unhex', name: 'SQL UNHEX', type: 'encode', category: 'sql', func: encoders.sql.sqlUnhexEncode },
  { id: 'sql_hex_literal', name: 'SQL Hex Literal', type: 'encode', category: 'sql', func: encoders.sql.sqlHexLiteral },
  
  // PHP context
  { id: 'php_chr_hex', name: 'PHP chr()/hex Mixed', type: 'encode', category: 'php', func: encoders.php.phpChrHexMixed },
  { id: 'php_pack', name: 'PHP pack()', type: 'encode', category: 'php', func: encoders.php.phpPackEncode },
  
  // PowerShell context
  { id: 'ps_char_array', name: 'PowerShell Char Array', type: 'encode', category: 'powershell', func: encoders.powershell.powershellCharArray },
  { id: 'ps_format', name: 'PowerShell Format Operator', type: 'encode', category: 'powershell', func: encoders.powershell.powershellFormatOperator },
  
  // Case manipulation
  { id: 'mixed_case', name: 'Mixed Case', type: 'case', category: 'case', func: encoders.case.mixedCase },
  { id: 'alternating_case', name: 'Alternating Case', type: 'case', category: 'case', func: encoders.case.caseAlternatingEncode },
  { id: 'random_case', name: 'Random Case', type: 'case', category: 'case', func: encoders.case.caseRandomEncode },
  
  // Advanced techniques
  { id: 'invisible_unicode', name: 'Invisible Unicode', type: 'encode', category: 'advanced', func: encoders.advanced.invisibleUnicodeEncode },
  { id: 'format_string', name: 'Format String', type: 'encode', category: 'advanced', func: encoders.advanced.formatStringEncode },
  { id: 'printf_format', name: 'Printf Format', type: 'encode', category: 'advanced', func: encoders.advanced.printfFormatEncode },
  { id: 'null_terminate', name: 'Null Byte Terminate', type: 'encode', category: 'advanced', func: encoders.advanced.nullByteTerminate },
  { id: 'null_prefix', name: 'Null Byte Prefix', type: 'encode', category: 'advanced', func: encoders.advanced.nullBytePrefix },
  { id: 'null_scatter', name: 'Null Byte Scatter', type: 'encode', category: 'advanced', func: encoders.advanced.nullByteScatter },
  { id: 'path_traversal', name: 'Path Traversal Encode', type: 'encode', category: 'advanced', func: encoders.advanced.pathTraversalEncode },
  { id: 'crlf_injection', name: 'CRLF Injection', type: 'encode', category: 'advanced', func: encoders.advanced.crlfInjectionEncode },
  
  // Bitwise operations
  { id: 'xor_bitwise', name: 'Bitwise XOR', type: 'bitwise', category: 'bitwise', func: bitwise.bitwiseXOR, params: ['input2', 'format'] },
  { id: 'and_bitwise', name: 'Bitwise AND', type: 'bitwise', category: 'bitwise', func: bitwise.bitwiseAND, params: ['input2', 'format'] },
  { id: 'or_bitwise', name: 'Bitwise OR', type: 'bitwise', category: 'bitwise', func: bitwise.bitwiseOR, params: ['input2', 'format'] },
  { id: 'not_bitwise', name: 'Bitwise NOT', type: 'bitwise', category: 'bitwise', func: bitwise.bitwiseNOT, params: ['format'] },
  { id: 'shift_left', name: 'Bit Shift Left', type: 'bitwise', category: 'bitwise', func: bitwise.bitShiftLeft, params: ['positions'] },
  { id: 'shift_right', name: 'Bit Shift Right', type: 'bitwise', category: 'bitwise', func: bitwise.bitShiftRight, params: ['positions'] },
  { id: 'rotate_left', name: 'Bit Rotate Left', type: 'bitwise', category: 'bitwise', func: bitwise.rotateLeft, params: ['positions'] },
  { id: 'rotate_right', name: 'Bit Rotate Right', type: 'bitwise', category: 'bitwise', func: bitwise.rotateRight, params: ['positions'] },
  
  // Compression operations
  { id: 'gzip_compress', name: 'Gzip Compress', type: 'compression', category: 'compression', func: compression.gzipCompress },
  { id: 'gzip_decompress', name: 'Gzip Decompress', type: 'compression', category: 'compression', func: compression.gzipDecompress },
  { id: 'deflate_compress', name: 'Deflate Compress', type: 'compression', category: 'compression', func: compression.deflateCompress },
  { id: 'deflate_decompress', name: 'Deflate Decompress', type: 'compression', category: 'compression', func: compression.deflateDecompress },
  { id: 'lzstring_compress', name: 'LZ-String Compress', type: 'compression', category: 'compression', func: compression.lzStringCompress },
  { id: 'lzstring_decompress', name: 'LZ-String Decompress', type: 'compression', category: 'compression', func: compression.lzStringDecompress },
  { id: 'rle_compress', name: 'RLE Compress', type: 'compression', category: 'compression', func: compression.rleCompress },
  { id: 'rle_decompress', name: 'RLE Decompress', type: 'compression', category: 'compression', func: compression.rleDecompress },
  
  // Data format operations
  { id: 'csv_to_json', name: 'CSV to JSON', type: 'dataformat', category: 'dataformat', func: dataformat.csvToJson },
  { id: 'json_validate', name: 'Validate JSON', type: 'dataformat', category: 'dataformat', func: dataformat.jsonValidate },
  { id: 'json_minify', name: 'Minify JSON', type: 'dataformat', category: 'dataformat', func: dataformat.jsonMinify },
  { id: 'json_beautify', name: 'Beautify JSON', type: 'dataformat', category: 'dataformat', func: dataformat.jsonBeautify },
  { id: 'json_to_xml', name: 'JSON to XML', type: 'dataformat', category: 'dataformat', func: dataformat.jsonToXml },
  { id: 'json_to_csv', name: 'JSON to CSV', type: 'dataformat', category: 'dataformat', func: dataformat.jsonToCsv },
  { id: 'xml_beautify', name: 'Beautify XML', type: 'dataformat', category: 'dataformat', func: dataformat.xmlBeautify },
  { id: 'xml_minify', name: 'Minify XML', type: 'dataformat', category: 'dataformat', func: dataformat.xmlMinify },
  { id: 'xml_to_json', name: 'XML to JSON', type: 'dataformat', category: 'dataformat', func: dataformat.xmlToJson },
  { id: 'yaml_to_json', name: 'YAML to JSON', type: 'dataformat', category: 'dataformat', func: dataformat.yamlToJson },
  { id: 'js_minify', name: 'Minify JavaScript', type: 'dataformat', category: 'dataformat', func: jsMinify },
  { id: 'js_beautify', name: 'Beautify JavaScript', type: 'dataformat', category: 'dataformat', func: jsBeautify, params: ['indentSize'] },
  
  // Extraction operations
  { id: 'extract_urls', name: 'Extract URLs', type: 'extraction', category: 'extraction', func: extraction.extractURLs },
  { id: 'extract_emails', name: 'Extract Email Addresses', type: 'extraction', category: 'extraction', func: extraction.extractEmails },
  { id: 'extract_ips', name: 'Extract IP Addresses', type: 'extraction', category: 'extraction', func: extraction.extractIPs },
  { id: 'extract_hashes', name: 'Extract Hash Values', type: 'extraction', category: 'extraction', func: extraction.extractHashes },
  { id: 'extract_domains', name: 'Extract Domains', type: 'extraction', category: 'extraction', func: extraction.extractDomains },
  { id: 'extract_phones', name: 'Extract Phone Numbers', type: 'extraction', category: 'extraction', func: extraction.extractPhoneNumbers },
  { id: 'extract_macs', name: 'Extract MAC Addresses', type: 'extraction', category: 'extraction', func: extraction.extractMACAddresses },
  { id: 'extract_uuids', name: 'Extract UUIDs', type: 'extraction', category: 'extraction', func: extraction.extractUUIDs },
  { id: 'extract_base64', name: 'Extract Base64', type: 'extraction', category: 'extraction', func: extraction.extractBase64 },
  
  // Cryptographic Operations - Unified with full parameter support
  
  // Key Generation
  { id: 'rsa_generate', name: 'Generate RSA Key Pair', type: 'crypto', category: 'crypto', func: crypto.rsa.generateKeyPair, params: ['keySize'] },
  { id: 'aes_generate', name: 'Generate AES Key', type: 'crypto', category: 'crypto', func: generateAesKey, params: ['keySize'] },
  { id: 'aes_key_from_password', name: 'Generate AES Key from Password', type: 'crypto', category: 'crypto', func: generateAesKeyFromPassword, params: ['password', 'keySize', 'method', 'salt', 'iterations', 'outputFormat'] },
  
  // AES Operations - Unified
  { id: 'aes_encrypt', name: 'AES Encrypt', type: 'crypto', category: 'crypto', func: (input, key, iv, mode = 'GCM', keyFormat, keyDerivation, salt, iterations, associatedData, outputFormat) => 
    aesTransform(input, { key, iv, mode, keyFormat, keyDerivation, salt, iterations, associatedData, outputFormat, operation: 'encrypt' }), 
    params: ['key', 'iv', 'mode', 'keyFormat', 'keyDerivation', 'salt', 'iterations', 'associatedData', 'outputFormat'] },
  { id: 'aes_decrypt', name: 'AES Decrypt', type: 'crypto', category: 'crypto', func: (input, key, iv, mode = 'GCM', keyFormat, keyDerivation, salt, iterations, associatedData, outputFormat) => 
    aesTransform(input, { key, iv, mode, keyFormat, keyDerivation, salt, iterations, associatedData, outputFormat, operation: 'decrypt' }), 
    params: ['key', 'iv', 'mode', 'keyFormat', 'keyDerivation', 'salt', 'iterations', 'associatedData', 'outputFormat'] },
  
  // RSA Operations - Unified
  { id: 'rsa_encrypt', name: 'RSA Encrypt', type: 'crypto', category: 'crypto', func: (input, key, keyFormat, outputFormat) => 
    rsaTransform(input, { key, keyFormat, outputFormat, operation: 'encrypt' }), 
    params: ['key', 'keyFormat', 'outputFormat'] },
  { id: 'rsa_decrypt', name: 'RSA Decrypt', type: 'crypto', category: 'crypto', func: (input, key, keyFormat, outputFormat) => 
    rsaTransform(input, { key, keyFormat, outputFormat, operation: 'decrypt' }), 
    params: ['key', 'keyFormat', 'outputFormat'] },
  
  // Other existing operations
  { id: 'envelope_encrypt', name: 'Envelope Encrypt', type: 'crypto', category: 'crypto', func: crypto.envelope.encryptShort, params: ['publicKey'] },
  { id: 'envelope_decrypt', name: 'Envelope Decrypt', type: 'crypto', category: 'crypto', func: crypto.envelope.decrypt, params: ['privateKey'] },
  { id: 'password_encrypt', name: 'Password Encrypt (AES-GCM)', type: 'crypto', category: 'crypto', func: crypto.password.encryptString, params: ['password'] },
  { id: 'password_decrypt', name: 'Password Decrypt (AES-GCM)', type: 'crypto', category: 'crypto', func: crypto.password.decryptString, params: ['password'] },
  { id: 'compress_encrypt', name: 'Compress + Encrypt', type: 'crypto', category: 'crypto', func: crypto.compression.compressEncryptString, params: ['password'] },
  { id: 'decrypt_decompress', name: 'Decrypt + Decompress', type: 'crypto', category: 'crypto', func: crypto.compression.decryptDecompressString, params: ['password'] },
  { id: 'sign_message', name: 'Digital Sign', type: 'crypto', category: 'crypto', func: crypto.signature.sign, params: ['privateKey'] },
  { id: 'verify_signature', name: 'Verify Signature', type: 'crypto', category: 'crypto', func: crypto.signature.verify, params: ['signature', 'publicKey'] },
  
  // Advanced Crypto Operations - Unified
  { id: 'rc4_encrypt', name: 'RC4 Encrypt', type: 'crypto', category: 'crypto_advanced', func: (input, key, keyFormat, outputFormat) => 
    rc4Transform(input, { key, keyFormat, outputFormat, operation: 'encrypt' }), 
    params: ['key', 'keyFormat', 'outputFormat'] },
  { id: 'rc4_decrypt', name: 'RC4 Decrypt', type: 'crypto', category: 'crypto_advanced', func: (input, key, keyFormat, outputFormat) => 
    rc4Transform(input, { key, keyFormat, outputFormat, operation: 'decrypt' }), 
    params: ['key', 'keyFormat', 'outputFormat'] },
  { id: 'blowfish_encrypt', name: 'Blowfish Encrypt', type: 'crypto', category: 'crypto_advanced', func: (input, key, keyFormat, outputFormat) => 
    blowfishTransform(input, { key, keyFormat, outputFormat, operation: 'encrypt' }), 
    params: ['key', 'keyFormat', 'outputFormat'] },
  { id: 'blowfish_decrypt', name: 'Blowfish Decrypt', type: 'crypto', category: 'crypto_advanced', func: (input, key, keyFormat, outputFormat) => 
    blowfishTransform(input, { key, keyFormat, outputFormat, operation: 'decrypt' }), 
    params: ['key', 'keyFormat', 'outputFormat'] },
  { id: 'bcrypt_hash', name: 'bcrypt Hash', type: 'hash', category: 'crypto_advanced', func: hashes.bcryptHash, params: ['salt', 'rounds'] },
  { id: 'scrypt_hash', name: 'scrypt Hash', type: 'hash', category: 'crypto_advanced', func: hashes.scryptHash, params: ['salt', 'N', 'r', 'p'] },
  { id: 'argon2_hash', name: 'Argon2 Hash', type: 'hash', category: 'crypto_advanced', func: hashes.argon2Hash, params: ['salt', 'iterations', 'memory', 'parallelism'] },
  { id: 'kerberos_encrypt', name: 'Kerberos Encrypt', type: 'crypto', category: 'crypto_advanced', func: ciphers.kerberosEncrypt, params: ['key', 'keyType'] },
  { id: 'kerberos_decrypt', name: 'Kerberos Decrypt', type: 'crypto', category: 'crypto_advanced', func: ciphers.kerberosDecrypt, params: ['key', 'keyType'] },
  
  // DES/TripleDES operations - Unified
  { id: 'des_encrypt', name: 'DES Encrypt', type: 'cipher', category: 'crypto_legacy', func: (input, key, keyFormat, outputFormat) => 
    desTransform(input, { key, keyFormat, outputFormat, mode: 'DES', operation: 'encrypt' }), 
    params: ['key', 'keyFormat', 'outputFormat'] },
  { id: 'des_decrypt', name: 'DES Decrypt', type: 'cipher', category: 'crypto_legacy', func: (input, key, keyFormat, outputFormat) => 
    desTransform(input, { key, keyFormat, outputFormat, mode: 'DES', operation: 'decrypt' }), 
    params: ['key', 'keyFormat', 'outputFormat'] },
  { id: 'tripledes_encrypt', name: '3DES Encrypt', type: 'cipher', category: 'crypto_legacy', func: (input, key, keyFormat, outputFormat) => 
    desTransform(input, { key, keyFormat, outputFormat, mode: '3DES', operation: 'encrypt' }), 
    params: ['key', 'keyFormat', 'outputFormat'] },
  { id: 'tripledes_decrypt', name: '3DES Decrypt', type: 'cipher', category: 'crypto_legacy', func: (input, key, keyFormat, outputFormat) => 
    desTransform(input, { key, keyFormat, outputFormat, mode: '3DES', operation: 'decrypt' }), 
    params: ['key', 'keyFormat', 'outputFormat'] },
  
  // Archive password cracking
  { id: 'crack_7z_password', name: 'Crack 7z Password', type: 'password_cracking', category: 'password_cracking', func: crack7zPassword, params: ['wordlist', 'maxAttempts'] },
  { id: 'crack_zip_password', name: 'Crack ZIP Password', type: 'password_cracking', category: 'password_cracking', func: crackZipPassword, params: ['wordlist', 'maxAttempts'] },
  { id: 'crack_pdf_password', name: 'Crack PDF Password', type: 'password_cracking', category: 'password_cracking', func: crackPdfPassword, params: ['wordlist', 'maxAttempts'] },
  
  // Base decoders
  { id: 'url_decode', name: 'URL Decode', type: 'decode', category: 'base', func: decoders.base.decodeUrl },
  { id: 'xml_decode', name: 'XML Decode', type: 'decode', category: 'base', func: decoders.base.decodeXml },
  { id: 'base64_decode', name: 'Base64 Decode', type: 'decode', category: 'base', func: decoders.base.decodeBase64 },
  { id: 'base64_url_decode', name: 'Base64 URL Decode', type: 'decode', category: 'base', func: decoders.base.decodeBase64Url },
  { id: 'hex_decode', name: 'Hex Decode', type: 'decode', category: 'base', func: decoders.base.decodeHex },
  { id: 'ascii_hex_decode', name: 'ASCII Hex Decode', type: 'decode', category: 'base', func: decoders.base.decodeAsciiHex },
  { id: 'octal_decode', name: 'Octal Decode', type: 'decode', category: 'base', func: decoders.base.decodeOctal },
  { id: 'binary_decode', name: 'Binary Decode', type: 'decode', category: 'base', func: decoders.base.decodeBinary },
  { id: 'base32_decode', name: 'Base32 Decode', type: 'decode', category: 'base_extended', func: decoders.base_extended.decodeBase32 },
  
  // Extended Base Decoders
  { id: 'base16_decode', name: 'Base16 Decode', type: 'decode', category: 'base_extended', func: decoders.base_extended.decodeBase16 },
  { id: 'base32_hex_decode', name: 'Base32 Hex Decode', type: 'decode', category: 'base_extended', func: decoders.base_extended.decodeBase32Hex },
  { id: 'base32_z_decode', name: 'Base32 Z-Base Decode', type: 'decode', category: 'base_extended', func: decoders.base_extended.decodeBase32Z },
  { id: 'base36_decode', name: 'Base36 Decode', type: 'decode', category: 'base_extended', func: decoders.base_extended.decodeBase36 },
  { id: 'base58_decode', name: 'Base58 Decode', type: 'decode', category: 'base_extended', func: decoders.base_extended.decodeBase58 },
  { id: 'base62_decode', name: 'Base62 Decode', type: 'decode', category: 'base_extended', func: decoders.base_extended.decodeBase62 },
  { id: 'base64_safe_decode', name: 'Base64 URL Safe Decode', type: 'decode', category: 'base_extended', func: decoders.base_extended.decodeBase64Safe },
  { id: 'base64_no_padding_decode', name: 'Base64 No Padding Decode', type: 'decode', category: 'base_extended', func: decoders.base_extended.decodeBase64NoPadding },
  { id: 'base91_decode', name: 'Base91 Decode', type: 'decode', category: 'base_extended', func: decoders.base_extended.decodeBase91 },
  { id: 'basex_decode', name: 'BaseX (Custom) Decode', type: 'decode', category: 'base_extended', func: decoders.base_extended.decodeBaseX, params: ['alphabet'] },
  
  // Binary decoders
  { id: 'binary_spaced_decode', name: 'Binary (Spaced) Decode', type: 'decode', category: 'binary', func: decoders.binary.decodeBinarySpaced },
  { id: 'binary_packed_decode', name: 'Binary (Packed) Decode', type: 'decode', category: 'binary', func: decoders.binary.decodeBinaryPacked },
  
  // Decimal decoders
  { id: 'decimal_decode', name: 'Decimal (Spaced) Decode', type: 'decode', category: 'decimal', func: decoders.decimal.decodeDecimal },
  { id: 'decimal_packed_decode', name: 'Decimal (Comma) Decode', type: 'decode', category: 'decimal', func: decoders.decimal.decodeDecimalPacked },
  
  // Serialization decoders
  { id: 'ascii85_decode', name: 'ASCII85 Decode', type: 'decode', category: 'serialization', func: decoders.serialization.decodeAscii85 },
  { id: 'uudecode', name: 'UUdecode', type: 'decode', category: 'serialization', func: decoders.serialization.uudecode },
  { id: 'ydecode', name: 'yEnc Decode', type: 'decode', category: 'serialization', func: decoders.serialization.yDecodeText },
  { id: 'asn1_der_decode', name: 'ASN.1 DER Decode', type: 'decode', category: 'serialization', func: decoders.serialization.decodeAsn1Der },
  { id: 'bencode_decode', name: 'Bencode Decode', type: 'decode', category: 'serialization', func: decoders.serialization.decodeBencode },
  { id: 'messagepack_decode', name: 'MessagePack Decode', type: 'decode', category: 'serialization', func: decoders.serialization.decodeMessagePack },
  { id: 'cbor_decode', name: 'CBOR Decode', type: 'decode', category: 'serialization', func: decoders.serialization.decodeCbor },
  { id: 'plist_decode', name: 'Property List Decode', type: 'decode', category: 'serialization', func: decoders.serialization.decodePlist },
  { id: 'bson_decode', name: 'BSON Decode', type: 'decode', category: 'serialization', func: decoders.serialization.decodeBson },
  { id: 'amf0_decode', name: 'AMF0 Decode', type: 'decode', category: 'serialization', func: decoders.serialization.decodeAmf0 },
  { id: 'amf3_decode', name: 'AMF3 Decode', type: 'decode', category: 'serialization', func: decoders.serialization.decodeAmf3 },
  { id: 'avro_decode', name: 'Avro Decode', type: 'decode', category: 'serialization', func: decoders.serialization.decodeAvro },
  
  // Advanced decoders
  { id: 'double_url_decode', name: 'Double URL Decode', type: 'decode', category: 'url', func: decoders.url.decodeDoubleUrl },
  { id: 'triple_url_decode', name: 'Triple URL Decode', type: 'decode', category: 'url', func: decoders.url.decodeTripleUrl },
  { id: 'unicode_decode', name: 'Unicode Escape Decode', type: 'decode', category: 'unicode', func: decoders.unicode.decodeUnicodeEscape },
  { id: 'zalgo_decode', name: 'Zalgo Decode', type: 'decode', category: 'unicode', func: decoders.unicode.decodeZalgo },
  { id: 'homograph_decode', name: 'Homograph Decode', type: 'decode', category: 'unicode', func: decoders.unicode.decodeHomograph },
  { id: 'html_entities_decode', name: 'HTML Entities Decode', type: 'decode', category: 'html', func: decoders.html.decodeHtmlEntities },
  { id: 'js_decode', name: 'JavaScript String Decode', type: 'decode', category: 'javascript', func: decoders.javascript.decodeJsString },
  { id: 'sql_decode', name: 'SQL String Decode', type: 'decode', category: 'sql', func: decoders.sql.decodeSqlString },
  { id: 'php_decode', name: 'PHP String Decode', type: 'decode', category: 'php', func: decoders.php.decodePhpString },
  { id: 'ps_decode', name: 'PowerShell String Decode', type: 'decode', category: 'powershell', func: decoders.powershell.decodePowershellString },
  { id: 'invisible_decode', name: 'Remove Invisible Unicode', type: 'decode', category: 'advanced', func: decoders.unicode.decodeInvisibleUnicode },
  { id: 'null_decode', name: 'Remove Null Bytes', type: 'decode', category: 'advanced', func: decoders.advanced.decodeNullByte },
  { id: 'crlf_decode', name: 'CRLF Decode', type: 'decode', category: 'advanced', func: decoders.advanced.decodeCrlf },
  { id: 'path_traversal_decode', name: 'Path Traversal Decode', type: 'decode', category: 'advanced', func: decoders.advanced.decodePathTraversal },

  // Variables and Sinks
  ...variableOperations,
  ...sinkOperations,
  ...unicodeOperations,
  
  // New operations (proper format)
  { id: 'encode_xxd', name: 'XXD Hexdump', type: 'encode', category: 'hex', func: encodeXxd, params: ['bytesPerLine', 'includeOffset', 'includeAscii', 'uppercase', 'groupSize'] },
  { id: 'decode_xxd', name: 'XXD Hexdump Parser', type: 'decode', category: 'hex', func: decodeXxd, params: ['strict', 'ignoreOffset'] },
  { id: 'parse_hexdump', name: 'Parse Hexdump', type: 'decode', category: 'hex', func: parseHexdump, params: ['format', 'extractHex', 'extractAscii'] },
  { id: 'generate_string', name: 'Generate String', type: 'generator', category: 'generator', func: generateString, params: ['length', 'charset', 'customCharset', 'seed', 'format'] },
  { id: 'find_pattern_offset', name: 'Find Pattern Offset', type: 'analysis', category: 'analysis', func: (input, searchString) => {
    const results = findPatternOffset(input, searchString);
    return results.map(r => `Offset: ${r.offset} | Pattern: ${r.pattern} | Hex: ${r.hex}${r.reversed ? ' (reversed)' : ''}`).join('\n');
  }, params: ['searchString'] },
  
  
  // Bitwise operations (simplified)
  { id: 'bitwise_xor', name: 'Bitwise XOR', type: 'arithmetic', category: 'arithmetic', func: xorBitwise, params: ['key', 'keyType', 'outputFormat'] },
  { id: 'bitwise_and', name: 'Bitwise AND', type: 'arithmetic', category: 'arithmetic', func: andBitwise, params: ['key', 'keyType', 'outputFormat'] },
  { id: 'bitwise_or', name: 'Bitwise OR', type: 'arithmetic', category: 'arithmetic', func: orBitwise, params: ['key', 'keyType', 'outputFormat'] },
  { id: 'bitwise_not', name: 'Bitwise NOT', type: 'arithmetic', category: 'arithmetic', func: notBitwise, params: ['outputFormat'] },
  { id: 'shift_left', name: 'Bit Shift Left', type: 'arithmetic', category: 'arithmetic', func: shiftLeft, params: ['shifts', 'outputFormat'] },
  { id: 'shift_right', name: 'Bit Shift Right', type: 'arithmetic', category: 'arithmetic', func: shiftRight, params: ['shifts', 'outputFormat'] },
  { id: 'rotate_left', name: 'Rotate Left', type: 'arithmetic', category: 'arithmetic', func: rotateLeft, params: ['shifts', 'outputFormat'] },
  { id: 'rotate_right', name: 'Rotate Right', type: 'arithmetic', category: 'arithmetic', func: rotateRight, params: ['shifts', 'outputFormat'] },
  { id: 'xor_brute_force', name: 'XOR Brute Force', type: 'arithmetic', category: 'arithmetic', func: xorBruteForce, params: ['maxKeyLength', 'outputFormat', 'minPrintable'] },

  // Text analysis operations
  { id: 'character_count', name: 'Character Count (length)', type: 'analysis', category: 'text_analysis', func: characterCount },
  { id: 'word_count', name: 'Word Count (length)', type: 'analysis', category: 'text_analysis', func: wordCount },

  // Enhanced Key Derivation Functions (fixed Web Crypto API compatibility)
  { id: 'hkdf_derive', name: 'HKDF Key Derivation', type: 'crypto', category: 'kdf', func: hkdfDerive, params: ['salt', 'info', 'length', 'hash'] },
  { id: 'pbkdf2_derive', name: 'PBKDF2 Key Derivation', type: 'crypto', category: 'kdf', func: pbkdf2Derive, params: ['salt', 'iterations', 'keyLength', 'hash'] },
  { id: 'scrypt_derive', name: 'scrypt Key Derivation', type: 'crypto', category: 'kdf', func: scryptDerive, params: ['salt', 'N', 'r', 'p', 'keyLength'] },
  { id: 'argon2_derive', name: 'Argon2 Key Derivation', type: 'crypto', category: 'kdf', func: argon2Derive, params: ['salt', 'iterations', 'memory', 'parallelism', 'keyLength', 'variant'] },

  // Advanced Encryption Algorithms
  { id: 'chacha20_poly1305_encrypt', name: 'ChaCha20-Poly1305 Encrypt', type: 'crypto', category: 'aead', func: chaCha20Poly1305Encrypt, params: ['key', 'nonce', 'associatedData'] },
  
  // Enhanced Envelope Encryption (Hybrid RSA + AES)
  { id: 'enhanced_envelope_encrypt', name: 'Enhanced Envelope Encrypt', type: 'crypto', category: 'hybrid', func: enhancedEnvelopeEncrypt, params: ['publicKey', 'options'] },
  { id: 'enhanced_envelope_decrypt', name: 'Enhanced Envelope Decrypt', type: 'crypto', category: 'hybrid', func: enhancedEnvelopeDecrypt, params: ['privateKey', 'options'] },
  
  // Elliptic Curve Cryptography
  { id: 'ecdsa_sign', name: 'ECDSA Digital Signature', type: 'crypto', category: 'ecc', func: ecdsaSign, params: ['privateKey', 'curve', 'hash', 'format'] },
  { id: 'ecdh_key_agreement', name: 'ECDH Key Agreement', type: 'crypto', category: 'ecc', func: ecdhKeyAgreement, params: ['privateKey', 'publicKey', 'curve', 'keyLength', 'format'] },

  // Cryptographic Analysis
  { id: 'analyze_entropy', name: 'Entropy Analysis', type: 'analysis', category: 'crypto_analysis', func: (input) => JSON.stringify(analyzeEntropy(input), null, 2) },
  { id: 'analyze_key_strength', name: 'Key Strength Analysis', type: 'analysis', category: 'crypto_analysis', func: (input) => JSON.stringify(analyzeKeyStrength(input), null, 2) },

  // Number and Base Conversions
  { id: 'string_to_number', name: 'String to Number', type: 'conversion', category: 'conversions', func: stringToNumber },
  { id: 'hex_to_number', name: 'Hex to Number', type: 'conversion', category: 'conversions', func: hexToNumber },
  { id: 'number_to_hex', name: 'Number to Hex', type: 'conversion', category: 'conversions', func: numberToHex, params: ['uppercase'] },
  { id: 'number_to_base', name: 'Number to Base', type: 'conversion', category: 'conversions', func: numberToBase, params: ['base'] },
  { id: 'base_to_number', name: 'Base to Number', type: 'conversion', category: 'conversions', func: baseToNumber, params: ['fromBase'] },
  { id: 'extract_number', name: 'Extract Number from Text', type: 'conversion', category: 'conversions', func: extractNumber },
  { id: 'hex_to_ascii', name: 'Hex to ASCII', type: 'conversion', category: 'conversions', func: hexToAscii },
  { id: 'ascii_to_hex', name: 'ASCII to Hex', type: 'conversion', category: 'conversions', func: asciiToHex, params: ['uppercase'] }
];

// Helper function to get operation by ID
export function getOperation(id) {
  return operations.find(op => op.id === id);
}

// Helper function to get operations by category
export function getOperationsByCategory(category) {
  return operations.filter(op => op.category === category);
}

// Helper function to get operations by type
export function getOperationsByType(type) {
  return operations.filter(op => op.type === type);
}

// Define parameter types for specific operations (shared by conversion functions)
const parameterTypes = {
    // Crypto operations that need integer parameters
    shift: 'integer',
    a: 'integer', 
    b: 'integer',
    keySize: 'integer',
    iterations: 'integer',
    keyLength: 'integer',
    length: 'integer',
    N: 'integer',
    r: 'integer',
    p: 'integer',
    memory: 'integer',
    parallelism: 'integer',
    shifts: 'integer',
    maxKeyLength: 'integer',
    aesKeySize: 'integer',
    
    // String parameters
    salt: 'string',
    info: 'string',
    hash: 'string',
    key: 'string',
    nonce: 'string',
    associatedData: 'string',
    privateKey: 'string',
    publicKey: 'string',
    curve: 'string',
    format: 'string',
    variant: 'string',
    outputFormat: 'string',
    
    // Boolean parameters
    includeUppercase: 'boolean',
    includeLowercase: 'boolean',
    includeNumbers: 'boolean',
    includeSymbols: 'boolean',
    uppercase: 'boolean',
    
    // Additional parameters
    base: 'integer',
    fromBase: 'integer'
  };

// Parameter type conversion for cryptographic operations
function convertParameterType(value, paramName) {
  const targetType = parameterTypes[paramName];
  
  if (!targetType) {
    return value; // No conversion needed
  }
  
  switch (targetType) {
    case 'integer':
      const num = parseInt(value);
      return isNaN(num) ? undefined : num;
    case 'boolean':
      return Boolean(value === true || value === 'true' || value === '1');
    case 'string':
    default:
      return String(value || '');
  }
}

// Enhanced parameter conversion with defaults
function convertParameterTypeEnhanced(value, paramName, operationId) {
  // Skip conversion if value is already proper type
  if (typeof value === 'number' && parameterTypes[paramName] === 'integer') {
    return value;
  }
  if (typeof value === 'boolean' && parameterTypes[paramName] === 'boolean') {
    return value;
  }
  
  // Use existing conversion function
  const converted = convertParameterType(value, paramName, operationId);
  
  // Provide sensible defaults for common crypto parameters
  if (converted === undefined || converted === null) {
    const defaults = {
      keySize: 256,
      aesKeySize: 256,
      iterations: 100000,
      length: 32,
      keyLength: 32,
      salt: 'salt',
      info: 'info',
      hash: 'SHA-256',
      N: 16384,
      r: 8,
      p: 1,
      memory: 65536,
      parallelism: 4,
      variant: 'argon2id',
      curve: 'P-256',
      format: 'base64',
      shift: 3,
      a: 5,
      b: 8,
      base: 2,
      fromBase: 16,
      uppercase: false
    };
    
    return defaults[paramName] !== undefined ? defaults[paramName] : value;
  }
  
  return converted;
}

// Main function to apply an operation
export async function applyOperation(operationId, input, params = {}) {
  const operation = getOperation(operationId);
  if (!operation) {
    throw new Error(`Operation ${operationId} not found`);
  }
  
  try {
    if (operation.params) {
      // Operation requires parameters with enhanced type conversion and defaults
      const args = operation.params.map(param => {
        const rawValue = params[param];
        return convertParameterTypeEnhanced(rawValue, param, operationId);
      });
      return await operation.func(input, ...args);
    } else {
      return await operation.func(input);
    }
  } catch (error) {
    console.error(`Operation ${operationId} failed:`, error);
    throw new Error(`Failed to apply ${operation.name}: ${error.message}`);
  }
}

// Function to chain multiple operations
export async function chainOperations(input, operationChain) {
  let result = input;
  
  for (const step of operationChain) {
    result = await applyOperation(step.id, result, step.params || {});
  }
  
  return result;
}

// Main exports organized by category
export const encoder = {
  // Most popular operations (top priority)
  popular: encoders.popular,
  
  // Core categories
  base: encoders.base,
  base_extended: encoders.base_extended,
  binary: encoders.binary,
  decimal: encoders.decimal,
  serialization: encoders.serialization,
  url: encoders.url,
  unicode: encoders.unicode,
  html: encoders.html,
  javascript: encoders.javascript,
  sql: encoders.sql,
  php: encoders.php,
  powershell: encoders.powershell,
  advanced: encoders.advanced,
  case: encoders.case
};

export const decoder = {
  base: decoders.base,
  base_extended: decoders.base_extended,
  binary: decoders.binary,
  decimal: decoders.decimal,
  serialization: decoders.serialization,
  url: decoders.url,
  unicode: decoders.unicode,
  html: decoders.html,
  javascript: decoders.javascript,
  sql: decoders.sql,
  php: decoders.php,
  powershell: decoders.powershell,
  advanced: decoders.advanced
};

export const cipher = {
  // Most popular ciphers
  popular: {
    rot13: ciphers.rot13,
    caesar: ciphers.caesar,
    xorCipher: ciphers.xorCipher,
    vigenereEncode: ciphers.vigenereEncode,
    vigenereDecode: ciphers.vigenereDecode
  },
  
  // Organized categories from ciphers.js
  classical: ciphers.classical,
  xor: ciphers.xor,
  polyalphabetic: ciphers.polyalphabetic,
  mathematical: ciphers.mathematical,
  grid: ciphers.grid,
  transposition: ciphers.transposition,
  steganographic: ciphers.steganographic,
  numeric: ciphers.numeric,
  modern: ciphers.modern
};

export const hash = {
  // Most popular hashes
  popular: hashes.popular,
  
  // Organized categories from hashes.js
  basic: hashes.basic,
  ntlm: hashes.ntlm,
  database: hashes.database,
  pbkdf2: hashes.pbkdf2,
  unix: hashes.unix,
  windows: hashes.windows,
  network: hashes.network,
  cisco: hashes.cisco,
  modern: hashes.modern,
  cracking: hashes.cracking
};

// CyberChef-inspired magic operations
export const recipes = {
  // Multi-operation recipes
  multiHash: magic.multiHash,
  multiEncode: magic.multiEncode,
  
  // Detection operations
  detectHash: magic.detectHash,
  detectEncoding: magic.detectEncoding,
  detectFormat: magic.detectFormat,
  
  // Magic auto-processing
  magicRecipe: magic.magicRecipe,
  cyberChefMagic: magic.cyberChefMagic,
  
  // Analysis
  analyzeEntropy: magic.analyzeEntropy,
  
  // Convenience combinations
  hashAndEncode: magic.hashAndEncode,
  identifyAndProcess: magic.identifyAndProcess
};

// Text and data analysis operations
export const analyze = {
  frequency: analysis.frequencyAnalysis,
  indexOfCoincidence: analysis.indexOfCoincidence,
  chiSquared: analysis.chiSquaredTest,
  ngrams: analysis.ngramAnalysis,
  hamming: analysis.hammingDistance,
  levenshtein: analysis.levenshteinDistance,
  byteFrequency: analysis.byteFrequencyAnalysis,
  detectLanguage: analysis.detectLanguage
};

// Bitwise operations
export const bits = {
  xor: bitwise.bitwiseXOR,
  and: bitwise.bitwiseAND,
  or: bitwise.bitwiseOR,
  not: bitwise.bitwiseNOT,
  shiftLeft: bitwise.bitShiftLeft,
  shiftRight: bitwise.bitShiftRight,
  rotateLeft: bitwise.rotateLeft,
  rotateRight: bitwise.rotateRight,
  hammingWeight: bitwise.hammingWeight,
  toBinary: bitwise.toBinary
};

// Circuit operations
export const circuit = {
  DataCircuit: DataCircuit,
  createCircuit: () => new DataCircuit(),
  addNode: (circuit, id, config) => circuit.addNode(id, config),
  connect: (circuit, fromNode, toNode, config) => circuit.connect(fromNode, toNode, config),
  execute: (circuit, inputData) => circuit.execute(inputData)
};

// Sequencing operations
export const sequence = {
  SequenceController: SequenceController,
  createController: (circuit) => new SequenceController(circuit),
  linear: (steps) => ({ type: 'linear', steps }),
  parallel: (steps) => ({ type: 'parallel', steps }),
  conditional: (condition, ifSteps, elseSteps) => ({ type: 'conditional', condition, ifSteps, elseSteps }),
  loop: (steps, count) => ({ type: 'loop', steps, count })
};

// Dual view operations
export const dualview = {
  DualViewManager: DualViewManager,
  createManager: () => new DualViewManager(),
  initLinear: (manager, recipe) => manager.initializeLinear(recipe),
  toGraph: (manager) => manager.convertToGraph(),
  toLinear: (manager) => manager.convertToLinear(),
  canConvert: (manager) => manager.canConvertToLinear()
};

// Compression operations
export const compress = {
  gzip: {
    compress: compression.gzipCompress,
    decompress: compression.gzipDecompress
  },
  deflate: {
    compress: compression.deflateCompress,
    decompress: compression.deflateDecompress
  },
  lzstring: {
    compress: compression.lzStringCompress,
    decompress: compression.lzStringDecompress
  },
  rle: {
    compress: compression.rleCompress,
    decompress: compression.rleDecompress
  },
  analysis: compression.compressionAnalysis
};

// Data format operations
export const dataFormat = {
  csv: {
    toJson: dataformat.csvToJson,
    validate: dataformat.csvValidate
  },
  json: {
    validate: dataformat.jsonValidate,
    minify: dataformat.jsonMinify,
    beautify: dataformat.jsonBeautify,
    toXml: dataformat.jsonToXml,
    toCsv: dataformat.jsonToCsv,
    query: dataformat.jPathQuery
  },
  xml: {
    beautify: dataformat.xmlBeautify,
    minify: dataformat.xmlMinify,
    toJson: dataformat.xmlToJson,
    validate: dataformat.xmlValidate,
    query: dataformat.xPathQuery
  },
  yaml: {
    toJson: dataformat.yamlToJson
  }
};

// Extraction operations
export const extract = {
  urls: extraction.extractURLs,
  emails: extraction.extractEmails,
  ips: extraction.extractIPs,
  hashes: extraction.extractHashes,
  domains: extraction.extractDomains,
  phones: extraction.extractPhoneNumbers,
  macs: extraction.extractMACAddresses,
  uuids: extraction.extractUUIDs,
  base64: extraction.extractBase64,
  coordinates: extraction.extractCoordinates,
  bitcoin: extraction.extractBitcoinAddresses,
  all: extraction.extractAll,
  stats: extraction.extractionStats
};

// Date and time operations
export const time = {
  fromUnix: datetime.fromUnixTimestamp,
  toUnix: datetime.toUnixTimestamp,
  fromFiletime: datetime.fromWindowsFiletime,
  toFiletime: datetime.toWindowsFiletime,
  parseFormats: datetime.parseDateFormats,
  duration: datetime.calculateDuration,
  generate: datetime.generateTimestamps
};

// Networking operations
export const network = {
  parseIP: networking.parseIPAddress,
  cidrToRange: networking.cidrToRange,
  parseUserAgent: networking.parseUserAgent,
  generateIPRange: networking.generateIPRange,
  analyzePort: networking.analyzePort
};

// Variable operations
export const variables = {
  VariableManager: VariableManager,
  createManager: () => new VariableManager(),
  operations: variableOperations,
  sinks: sinkOperations
};

// Legacy exports for backward compatibility
export { encoders, decoders, ciphers, hashes, magic, analysis, datetime, networking, crypto, CryptoAPI, CryptoAPIClient, RecipeManager, bitwise, compression, dataformat, extraction };
export { DataCircuit, SequenceController, DualViewManager, VariableManager };

// All-in-one export for comprehensive access
export const cyberEncoder = {
  encode: encoder,
  decode: decoder,
  cipher: cipher,
  hash: hash,
  recipes: recipes,
  analyze: analyze,
  time: time,
  network: network,
  crypto: crypto,
  bits: bits,
  circuit: circuit,
  sequence: sequence,
  dualview: dualview,
  compress: compress,
  dataFormat: dataFormat,
  extract: extract,
  variables: variables
};