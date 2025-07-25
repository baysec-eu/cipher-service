// Combined hash functions - all hash functions organized by categories
import { hashMd5 } from './hashing/hashMd5.js';
import { hashMd4 } from './hashing/hashMd4.js';
import { hashSha1 } from './hashing/hashSha1.js';
import { hashSha256 } from './hashing/hashSha256.js';
import { hashSha384 } from './hashing/hashSha384.js';
import { hashSha512 } from './hashing/hashSha512.js';
import { hashNtlm } from './hashing/hashNtlm.js';
import { hashNtlmv1 } from './hashing/hashNtlmv1.js';
import { hashNtlmv2 } from './hashing/hashNtlmv2.js';
import { hashMysqlOld } from './hashing/hashMysqlOld.js';
import { hashMysql } from './hashing/hashMysql.js';
import { hashPbkdf2Sha1 } from './hashing/hashPbkdf2Sha1.js';
import { hashPbkdf2Sha256 } from './hashing/hashPbkdf2Sha256.js';
import { hashPbkdf2Sha512 } from './hashing/hashPbkdf2Sha512.js';
import { hashSha512Crypt } from './hashing/hashSha512Crypt.js';
import { hashDesCrypt } from './hashing/hashDesCrypt.js';
import { hashApr1Md5 } from './hashing/hashApr1Md5.js';
import { hashMsCachev1 } from './hashing/hashMsCachev1.js';
import { hashMsCachev2 } from './hashing/hashMsCachev2.js';
import { hashNetNtlmv1 } from './hashing/hashNetNtlmv1.js';
import { hashNetNtlmv2 } from './hashing/hashNetNtlmv2.js';
import { hashKerberos5TgsRep23 } from './hashing/hashKerberos5TgsRep23.js';
import { hashKerberos5AsReq23 } from './hashing/hashKerberos5AsReq23.js';
import { hashWpa } from './hashing/hashWpa.js';
import { hashPostgresMd5 } from './hashing/hashPostgresMd5.js';
import { hashOracle11g } from './hashing/hashOracle11g.js';
import { hashMssql2000 } from './hashing/hashMssql2000.js';
import { hashMssql2005 } from './hashing/hashMssql2005.js';
import { hashLm } from './hashing/hashLm.js';
import { hashCiscoAsaMd5 } from './hashing/hashCiscoAsaMd5.js';
import { hashCiscoIosPbkdf2 } from './hashing/hashCiscoIosPbkdf2.js';
import { bcryptHash } from './hashing/bcryptHash.js';
import { scryptHash } from './hashing/scryptHash.js';
import { argon2Hash } from './hashing/argon2Hash.js';

// Import HMAC functions
import { hmacMd5 } from './hashing/hmacMd5.js';
import { hmacSha1 } from './hashing/hmacSha1.js';
import { hmacSha256 } from './hashing/hmacSha256.js';
import { hmacSha512 } from './hashing/hmacSha512.js';

// Import hash cracking functionality
import { hashCracker, gpuHashCracker } from './hashcracking.js';

export const hashes = {
  // Most popular hashes - commonly used functions
  popular: {
    hashMd5,
    hashMd4,
    hashSha1,
    hashSha256,
    hashSha512,
    hashNtlm
  },
  
  // Basic cryptographic hashes
  basic: {
    hashMd5,
    hashMd4,
    hashSha1,
    hashSha256,
    hashSha384,
    hashSha512
  },
  
  // HMAC functions - keyed hash message authentication codes
  hmac: {
    hmacMd5,
    hmacSha1,
    hmacSha256,
    hmacSha512
  },
  
  // NTLM family hashes
  ntlm: {
    hashNtlm,
    hashNtlmv1,
    hashNtlmv2,
    hashNetNtlmv1,
    hashNetNtlmv2
  },
  
  // Database hashes
  database: {
    hashMysqlOld,
    hashMysql,
    hashPostgresMd5,
    hashOracle11g,
    hashMssql2000,
    hashMssql2005
  },
  
  // PBKDF2 key derivation functions
  pbkdf2: {
    hashPbkdf2Sha1,
    hashPbkdf2Sha256,
    hashPbkdf2Sha512
  },
  
  // Unix/Linux system hashes
  unix: {
    hashSha512Crypt,
    hashDesCrypt,
    hashApr1Md5
  },
  
  // Windows system hashes
  windows: {
    hashLm,
    hashMsCachev1,
    hashMsCachev2
  },
  
  // Network protocol hashes
  network: {
    hashKerberos5TgsRep23,
    hashKerberos5AsReq23,
    hashWpa
  },
  
  // Cisco device hashes
  cisco: {
    hashCiscoAsaMd5,
    hashCiscoIosPbkdf2
  },
  
  // Modern password hashing
  modern: {
    bcryptHash,
    scryptHash,
    argon2Hash
  },
  
  // Hash cracking tools
  cracking: {
    hashCracker,
    gpuHashCracker
  },

    // Basic hashes
  hashMd5,
  hashMd4,
  hashSha1,
  hashSha256,
  hashSha384,
  hashSha512,
  
  // HMAC functions
  hmacMd5,
  hmacSha1,
  hmacSha256,
  hmacSha512,
  
  // NTLM family
  hashNtlm,
  hashNtlmv1,
  hashNtlmv2,
  hashNetNtlmv1,
  hashNetNtlmv2,
  
  // Database hashes
  hashMysqlOld,
  hashMysql,
  hashPostgresMd5,
  hashOracle11g,
  hashMssql2000,
  hashMssql2005,
  
  // PBKDF2
  hashPbkdf2Sha1,
  hashPbkdf2Sha256,
  hashPbkdf2Sha512,
  
  // Unix/Linux
  hashSha512Crypt,
  hashDesCrypt,
  hashApr1Md5,
  
  // Windows
  hashLm,
  hashMsCachev1,
  hashMsCachev2,
  
  // Network
  hashKerberos5TgsRep23,
  hashKerberos5AsReq23,
  hashWpa,
  
  // Cisco
  hashCiscoAsaMd5,
  hashCiscoIosPbkdf2,
  
  // Modern
  bcryptHash,
  scryptHash,
  argon2Hash,
  
  hashCracker,
  gpuHashCracker
};

// Export individual functions for direct access
export {
  // Basic hashes
  hashMd5,
  hashMd4,
  hashSha1,
  hashSha256,
  hashSha384,
  hashSha512,
  
  // HMAC functions
  hmacMd5,
  hmacSha1,
  hmacSha256,
  hmacSha512,
  
  // NTLM family
  hashNtlm,
  hashNtlmv1,
  hashNtlmv2,
  hashNetNtlmv1,
  hashNetNtlmv2,
  
  // Database hashes
  hashMysqlOld,
  hashMysql,
  hashPostgresMd5,
  hashOracle11g,
  hashMssql2000,
  hashMssql2005,
  
  // PBKDF2
  hashPbkdf2Sha1,
  hashPbkdf2Sha256,
  hashPbkdf2Sha512,
  
  // Unix/Linux
  hashSha512Crypt,
  hashDesCrypt,
  hashApr1Md5,
  
  // Windows
  hashLm,
  hashMsCachev1,
  hashMsCachev2,
  
  // Network
  hashKerberos5TgsRep23,
  hashKerberos5AsReq23,
  hashWpa,
  
  // Cisco
  hashCiscoAsaMd5,
  hashCiscoIosPbkdf2,
  
  // Modern
  bcryptHash,
  scryptHash,
  argon2Hash,
  
  // Cracking tools

};