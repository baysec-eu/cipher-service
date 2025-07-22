#!/usr/bin/env node

// Algorithm verification script
// Tests core encoding, hashing, and crypto functions

import { encoders } from './src/lib/encoders.js';
import { decoders } from './src/lib/decoders.js';
import { crypto } from './src/lib/crypto.js';

class AlgorithmTester {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async runTests() {
    console.log('🧪 Running Algorithm Tests\n');

    for (const test of this.tests) {
      try {
        await test.testFn();
        console.log(`✅ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    
    if (this.failed > 0) {
      process.exit(1);
    }
  }

  assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`${message} Expected: ${expected}, Got: ${actual}`);
    }
  }

  assertNotEqual(actual, notExpected, message = '') {
    if (actual === notExpected) {
      throw new Error(`${message} Expected different values, got: ${actual}`);
    }
  }

  assertTrue(condition, message = '') {
    if (!condition) {
      throw new Error(message || 'Expected true');
    }
  }
}

const tester = new AlgorithmTester();

// === BASE ENCODING TESTS ===
tester.addTest('Base64 Encode/Decode', () => {
  const input = 'Hello World';
  const encoded = encoders.base.encodeBase64(input);
  const decoded = decoders.base.decodeBase64(encoded);
  tester.assertEqual(decoded, input);
  tester.assertEqual(encoded, 'SGVsbG8gV29ybGQ=');
});

tester.addTest('URL Encode/Decode', () => {
  const input = 'Hello World & Test';
  const encoded = encoders.base.urlencodeAscii(input);
  const decoded = decoders.base.decodeUrl(encoded);
  tester.assertEqual(decoded, input);
  tester.assertTrue(encoded.includes('%20')); // Space should be encoded
});

tester.addTest('Hex Encode/Decode', () => {
  const input = 'ABC123';
  const encoded = encoders.base.encodeHex(input);
  const decoded = decoders.base.decodeHex(encoded);
  tester.assertEqual(decoded, input);
  tester.assertEqual(encoded, '414243313233');
});

// === CIPHER TESTS ===
tester.addTest('ROT13', () => {
  const input = 'Hello World';
  const encoded = encoders.base.rot13(input);
  const decoded = encoders.base.rot13(encoded); // ROT13 is self-inverse
  tester.assertEqual(decoded, input);
  tester.assertEqual(encoded, 'Uryyb Jbeyq');
});

tester.addTest('Caesar Cipher', () => {
  const input = 'HELLO';
  const encoded = encoders.base.caesar(input, 3);
  const decoded = encoders.base.caesar(encoded, -3);
  tester.assertEqual(decoded, input);
  tester.assertEqual(encoded, 'KHOOR');
});

tester.addTest('XOR Cipher', () => {
  const input = 'Hello';
  const key = 42;
  const encoded = encoders.base.xorCipher(input, key);
  const decoded = encoders.base.xorCipher(encoded, key); // XOR is self-inverse
  tester.assertEqual(decoded, input);
  tester.assertNotEqual(encoded, input);
});

tester.addTest('Vigenère Cipher', () => {
  const input = 'HELLO';
  const key = 'KEY';
  const encoded = encoders.ciphers.vigenereEncode(input, key);
  const decoded = encoders.ciphers.vigenereDecode(encoded, key);
  tester.assertEqual(decoded, input);
  tester.assertEqual(encoded, 'RIJVS');
});

// === HASH TESTS ===
tester.addTest('MD5 Hash', () => {
  const input = 'Hello World';
  const hash = encoders.hash.hashMd5(input);
  tester.assertEqual(hash, 'b10a8db164e0754105b7a99be72e3fe5');
  
  // Test consistency
  const hash2 = encoders.hash.hashMd5(input);
  tester.assertEqual(hash, hash2);
});

tester.addTest('SHA1 Hash', () => {
  const input = 'Hello World';
  const hash = encoders.hash.hashSha1(input);
  tester.assertEqual(hash, '0a4d55a8d778e5022fab701977c5d840bbc486d0');
  
  // Test consistency
  const hash2 = encoders.hash.hashSha1(input);
  tester.assertEqual(hash, hash2);
});

tester.addTest('SHA256 Hash', () => {
  const input = 'Hello World';
  const hash = encoders.hash.hashSha256(input);
  tester.assertEqual(hash, 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e');
});

tester.addTest('NTLM Hash', () => {
  const input = 'password';
  const hash = encoders.hash.hashNtlm(input);
  tester.assertEqual(hash.length, 32); // NTLM is 32 hex chars
  
  // Test consistency
  const hash2 = encoders.hash.hashNtlm(input);
  tester.assertEqual(hash, hash2);
});

// === CRYPTO TESTS ===
tester.addTest('AES Key Generation', async () => {
  const key = await crypto.aes.generateKey();
  tester.assertTrue(typeof key === 'string');
  tester.assertTrue(key.length > 0);
  
  // Test uniqueness
  const key2 = await crypto.aes.generateKey();
  tester.assertNotEqual(key, key2);
});

tester.addTest('AES Encrypt/Decrypt', async () => {
  const input = 'Hello World';
  const key = await crypto.aes.generateKey();
  
  const encrypted = await crypto.aes.encrypt(input, key);
  tester.assertTrue(encrypted.data);
  tester.assertTrue(encrypted.iv);
  
  const decrypted = await crypto.aes.decrypt(encrypted.data, key, encrypted.iv);
  tester.assertEqual(decrypted, input);
});

tester.addTest('Password-based Encryption', async () => {
  const input = 'Hello World';
  const password = 'mySecretPassword';
  
  const encrypted = await crypto.password.encryptString(input, password);
  tester.assertTrue(encrypted.length > 0);
  tester.assertNotEqual(encrypted, input);
  
  const decrypted = await crypto.password.decryptString(encrypted, password);
  tester.assertEqual(decrypted, input);
});

tester.addTest('RSA Key Generation', async () => {
  const keyPair = await crypto.rsa.generateKeyPair(1024); // Smaller key for speed
  tester.assertTrue(keyPair.publicKey);
  tester.assertTrue(keyPair.privateKey);
  tester.assertTrue(keyPair.publicKeyPem.includes('PUBLIC KEY'));
  tester.assertTrue(keyPair.privateKeyPem.includes('PRIVATE KEY'));
});

tester.addTest('RSA Encrypt/Decrypt', async () => {
  const input = 'Hello RSA';
  const keyPair = await crypto.rsa.generateKeyPair(1024); // Smaller key for speed
  
  const encrypted = await crypto.rsa.encrypt(input, keyPair.publicKeyPem);
  tester.assertTrue(encrypted.length > 0);
  tester.assertNotEqual(encrypted, input);
  
  const decrypted = await crypto.rsa.decrypt(encrypted, keyPair.privateKeyPem);
  tester.assertEqual(decrypted, input);
});

// === ADVANCED CRYPTO TESTS ===
tester.addTest('RC4 Encrypt/Decrypt', () => {
  const input = 'Hello RC4';
  const key = 'secretkey';
  
  const encrypted = encoders.crypto_advanced.rc4Encrypt(input, key);
  tester.assertNotEqual(encrypted, input);
  
  const decrypted = encoders.crypto_advanced.rc4Decrypt(encrypted, key);
  tester.assertEqual(decrypted, input);
});

// === CONSISTENCY TESTS ===
tester.addTest('Hash Consistency', () => {
  const inputs = ['', 'a', 'hello', 'Hello World', '12345', 'special chars: !@#$%^&*()'];
  
  for (const input of inputs) {
    const md5_1 = encoders.hash.hashMd5(input);
    const md5_2 = encoders.hash.hashMd5(input);
    tester.assertEqual(md5_1, md5_2, `MD5 inconsistent for input: ${input}`);
    
    const sha1_1 = encoders.hash.hashSha1(input);
    const sha1_2 = encoders.hash.hashSha1(input);
    tester.assertEqual(sha1_1, sha1_2, `SHA1 inconsistent for input: ${input}`);
  }
});

tester.addTest('Cipher Reversibility', () => {
  const inputs = ['Hello', 'WORLD', 'Mixed123', 'Special!@#'];
  
  for (const input of inputs) {
    // Test ROT13
    const rot13 = encoders.base.rot13(encoders.base.rot13(input));
    tester.assertEqual(rot13, input, `ROT13 not reversible for: ${input}`);
    
    // Test Caesar
    for (const shift of [1, 5, 13, 25]) {
      const caesar = encoders.base.caesar(encoders.base.caesar(input, shift), -shift);
      tester.assertEqual(caesar, input, `Caesar(${shift}) not reversible for: ${input}`);
    }
    
    // Test XOR
    for (const key of [1, 42, 128, 255]) {
      const xor = encoders.base.xorCipher(encoders.base.xorCipher(input, key), key);
      tester.assertEqual(xor, input, `XOR(${key}) not reversible for: ${input}`);
    }
  }
});

// === ERROR HANDLING TESTS ===
tester.addTest('Error Handling', () => {
  // Test invalid Base64
  try {
    decoders.base.decodeBase64('invalid-base64!!!');
    throw new Error('Should have thrown error for invalid Base64');
  } catch (error) {
    if (error.message.includes('Should have thrown')) {
      throw error;
    }
    // Expected error
  }
  
  // Test invalid hex
  try {
    decoders.base.decodeHex('invalid-hex-xyz');
    throw new Error('Should have thrown error for invalid hex');
  } catch (error) {
    if (error.message.includes('Should have thrown')) {
      throw error;
    }
    // Expected error
  }
});

// === PERFORMANCE TESTS ===
tester.addTest('Performance Test', () => {
  const largeInput = 'A'.repeat(10000);
  const start = Date.now();
  
  // Test a few operations on large input
  encoders.base.encodeBase64(largeInput);
  encoders.base.encodeHex(largeInput);
  encoders.hash.hashMd5(largeInput);
  encoders.hash.hashSha256(largeInput);
  
  const elapsed = Date.now() - start;
  tester.assertTrue(elapsed < 5000, `Performance test took too long: ${elapsed}ms`);
});

// Run all tests
tester.runTests().then(() => {
  console.log('\n🎉 All algorithm tests completed successfully!');
}).catch(error => {
  console.error('\n💥 Test suite failed:', error);
  process.exit(1);
});