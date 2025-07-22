import { encoders } from './encoders.js';
import { decoders } from './decoders.js';
import { crypto } from './crypto.js';
import { CryptoAPI, CryptoAPIClient } from './api.js';

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
  { id: 'xor', name: 'XOR Cipher', type: 'cipher', category: 'cipher', func: encoders.base.xorCipher, params: ['key'] },
  { id: 'xor_multi', name: 'XOR Multi-byte Key', type: 'cipher', category: 'cipher', func: encoders.ciphers.xorCipherMultiKey, params: ['keyStr'] },
  { id: 'vigenere_encode', name: 'Vigenère Encode', type: 'cipher', category: 'cipher', func: encoders.ciphers.vigenereEncode, params: ['keyStr'] },
  { id: 'vigenere_decode', name: 'Vigenère Decode', type: 'cipher', category: 'cipher', func: encoders.ciphers.vigenereDecode, params: ['keyStr'] },
  { id: 'atbash', name: 'Atbash Cipher', type: 'cipher', category: 'cipher', func: encoders.ciphers.atbashCipher },
  { id: 'affine_encode', name: 'Affine Cipher Encode', type: 'cipher', category: 'cipher', func: encoders.ciphers.affineCipherEncode, params: ['a', 'b'] },
  { id: 'affine_decode', name: 'Affine Cipher Decode', type: 'cipher', category: 'cipher', func: encoders.ciphers.affineCipherDecode, params: ['a', 'b'] },
  { id: 'playfair_encode', name: 'Playfair Encode', type: 'cipher', category: 'cipher', func: encoders.ciphers.playfairEncode, params: ['keyStr'] },
  { id: 'playfair_decode', name: 'Playfair Decode', type: 'cipher', category: 'cipher', func: decoders.ciphers.playfairDecode, params: ['keyStr'] },
  { id: 'railfence_encode', name: 'Rail Fence Encode', type: 'cipher', category: 'cipher', func: encoders.ciphers.railFenceEncode, params: ['rails'] },
  { id: 'railfence_decode', name: 'Rail Fence Decode', type: 'cipher', category: 'cipher', func: encoders.ciphers.railFenceDecode, params: ['rails'] },
  { id: 'beaufort', name: 'Beaufort Cipher', type: 'cipher', category: 'cipher', func: encoders.ciphers.beaufortCipher, params: ['keyStr'] },
  { id: 'foursquare_encode', name: 'Four Square Encode', type: 'cipher', category: 'cipher', func: encoders.ciphers.fourSquareEncode, params: ['keyStr1', 'keyStr2'] },
  { id: 'foursquare_decode', name: 'Four Square Decode', type: 'cipher', category: 'cipher', func: decoders.ciphers.fourSquareDecode, params: ['keyStr1', 'keyStr2'] },
  { id: 'bacon_encode', name: 'Bacon Cipher Encode', type: 'cipher', category: 'cipher', func: encoders.ciphers.baconEncode },
  { id: 'bacon_decode', name: 'Bacon Cipher Decode', type: 'cipher', category: 'cipher', func: encoders.ciphers.baconDecode },
  { id: 'a1z26_encode', name: 'A1Z26 Encode', type: 'cipher', category: 'cipher', func: encoders.ciphers.a1z26Encode },
  { id: 'a1z26_decode', name: 'A1Z26 Decode', type: 'cipher', category: 'cipher', func: encoders.ciphers.a1z26Decode },
  { id: 'bifid_encode', name: 'Bifid Cipher Encode', type: 'cipher', category: 'cipher', func: encoders.ciphers.bifidEncode, params: ['keyStr'] },
  { id: 'bifid_decode', name: 'Bifid Cipher Decode', type: 'cipher', category: 'cipher', func: decoders.ciphers.bifidDecode, params: ['keyStr'] },
  { id: 'rot47', name: 'ROT47', type: 'cipher', category: 'cipher', func: encoders.ciphers.rot47 },
  
  // Hash functions
  { id: 'md5', name: 'MD5 Hash', type: 'hash', category: 'hash', func: encoders.hash.hashMd5 },
  { id: 'sha1', name: 'SHA1 Hash', type: 'hash', category: 'hash', func: encoders.hash.hashSha1 },
  { id: 'sha256', name: 'SHA256 Hash', type: 'hash', category: 'hash', func: encoders.hash.hashSha256 },
  { id: 'sha384', name: 'SHA384 Hash', type: 'hash', category: 'hash', func: encoders.hash.hashSha384 },
  { id: 'sha512', name: 'SHA512 Hash', type: 'hash', category: 'hash', func: encoders.hash.hashSha512 },
  { id: 'ntlm', name: 'NTLM Hash', type: 'hash', category: 'hash', func: encoders.hash.hashNtlm },
  { id: 'ntlmv1', name: 'NTLMv1 Hash', type: 'hash', category: 'hash', func: encoders.hash.hashNtlmv1, params: ['username', 'domain', 'challenge'] },
  { id: 'ntlmv2', name: 'NTLMv2 Hash', type: 'hash', category: 'hash', func: encoders.hash.hashNtlmv2, params: ['username', 'domain', 'serverChallenge', 'clientChallenge'] },
  { id: 'mysql_old', name: 'MySQL OLD_PASSWORD', type: 'hash', category: 'hash', func: encoders.hash.hashMysqlOld },
  { id: 'mysql', name: 'MySQL PASSWORD', type: 'hash', category: 'hash', func: encoders.hash.hashMysql },
  
  // Advanced URL encoding
  { id: 'double_url_encode', name: 'Double URL Encode', type: 'encode', category: 'url', func: encoders.url.doubleUrlencode },
  { id: 'triple_url_encode', name: 'Triple URL Encode', type: 'encode', category: 'url', func: encoders.url.tripleUrlencode },
  { id: 'url_encode_all', name: 'URL Encode All Characters', type: 'encode', category: 'url', func: encoders.url.urlencodeAllChars },
  
  // Unicode encoders
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
  
  // Cryptographic Operations
  { id: 'rsa_generate', name: 'Generate RSA Key Pair', type: 'crypto', category: 'crypto', func: crypto.rsa.generateKeyPair },
  { id: 'aes_generate', name: 'Generate AES Key', type: 'crypto', category: 'crypto', func: crypto.aes.generateKey },
  { id: 'rsa_encrypt', name: 'RSA Encrypt', type: 'crypto', category: 'crypto', func: crypto.rsa.encrypt, params: ['publicKey'] },
  { id: 'rsa_decrypt', name: 'RSA Decrypt', type: 'crypto', category: 'crypto', func: crypto.rsa.decrypt, params: ['privateKey'] },
  { id: 'aes_encrypt', name: 'AES Encrypt', type: 'crypto', category: 'crypto', func: crypto.aes.encrypt, params: ['key', 'iv'] },
  { id: 'aes_decrypt', name: 'AES Decrypt', type: 'crypto', category: 'crypto', func: crypto.aes.decrypt, params: ['key', 'iv'] },
  { id: 'envelope_encrypt', name: 'Envelope Encrypt', type: 'crypto', category: 'crypto', func: crypto.envelope.encryptShort, params: ['publicKey'] },
  { id: 'envelope_decrypt', name: 'Envelope Decrypt', type: 'crypto', category: 'crypto', func: crypto.envelope.decrypt, params: ['privateKey'] },
  { id: 'password_encrypt', name: 'Password Encrypt (AES-GCM)', type: 'crypto', category: 'crypto', func: crypto.password.encryptString, params: ['password'] },
  { id: 'password_decrypt', name: 'Password Decrypt (AES-GCM)', type: 'crypto', category: 'crypto', func: crypto.password.decryptString, params: ['password'] },
  { id: 'compress_encrypt', name: 'Compress + Encrypt', type: 'crypto', category: 'crypto', func: crypto.compression.compressEncryptString, params: ['password'] },
  { id: 'decrypt_decompress', name: 'Decrypt + Decompress', type: 'crypto', category: 'crypto', func: crypto.compression.decryptDecompressString, params: ['password'] },
  { id: 'sign_message', name: 'Digital Sign', type: 'crypto', category: 'crypto', func: crypto.signature.sign, params: ['privateKey'] },
  { id: 'verify_signature', name: 'Verify Signature', type: 'crypto', category: 'crypto', func: crypto.signature.verify, params: ['signature', 'publicKey'] },
  
  // Advanced Crypto Operations
  { id: 'rc4_encrypt', name: 'RC4 Encrypt', type: 'crypto', category: 'crypto_advanced', func: encoders.crypto_advanced.rc4Encrypt, params: ['key'] },
  { id: 'rc4_decrypt', name: 'RC4 Decrypt', type: 'crypto', category: 'crypto_advanced', func: encoders.crypto_advanced.rc4Decrypt, params: ['key'] },
  { id: 'blowfish_encrypt', name: 'Blowfish Encrypt', type: 'crypto', category: 'crypto_advanced', func: encoders.crypto_advanced.blowfishEncrypt, params: ['key'] },
  { id: 'bcrypt_hash', name: 'bcrypt Hash', type: 'hash', category: 'crypto_advanced', func: encoders.crypto_advanced.bcryptHash, params: ['salt', 'rounds'] },
  { id: 'scrypt_hash', name: 'scrypt Hash', type: 'hash', category: 'crypto_advanced', func: encoders.crypto_advanced.scryptHash, params: ['salt', 'N', 'r', 'p'] },
  { id: 'argon2_hash', name: 'Argon2 Hash', type: 'hash', category: 'crypto_advanced', func: encoders.crypto_advanced.argon2Hash, params: ['salt', 'iterations', 'memory', 'parallelism'] },
  { id: 'kerberos_encrypt', name: 'Kerberos Encrypt', type: 'crypto', category: 'crypto_advanced', func: encoders.crypto_advanced.kerberosEncrypt, params: ['key', 'keyType'] },
  { id: 'kerberos_decrypt', name: 'Kerberos Decrypt', type: 'crypto', category: 'crypto_advanced', func: encoders.crypto_advanced.kerberosDecrypt, params: ['key', 'keyType'] },
  
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
  { id: 'invisible_decode', name: 'Remove Invisible Unicode', type: 'decode', category: 'advanced', func: decoders.advanced.decodeInvisibleUnicode },
  { id: 'null_decode', name: 'Remove Null Bytes', type: 'decode', category: 'advanced', func: decoders.advanced.decodeNullByte },
  { id: 'crlf_decode', name: 'CRLF Decode', type: 'decode', category: 'advanced', func: decoders.advanced.decodeCrlf },
  { id: 'path_traversal_decode', name: 'Path Traversal Decode', type: 'decode', category: 'advanced', func: decoders.advanced.decodePathTraversal }
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

// Main function to apply an operation
export async function applyOperation(operationId, input, params = {}) {
  const operation = getOperation(operationId);
  if (!operation) {
    throw new Error(`Operation ${operationId} not found`);
  }
  
  try {
    if (operation.params) {
      // Operation requires parameters
      const args = operation.params.map(param => params[param]);
      return await operation.func(input, ...args);
    } else {
      return await operation.func(input);
    }
  } catch (error) {
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

export { encoders, decoders, crypto, CryptoAPI, CryptoAPIClient };