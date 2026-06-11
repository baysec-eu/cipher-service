// Real bcrypt implementation using bcryptjs
// Proper Blowfish-based password hashing

import bcryptjs from 'bcryptjs';

export function generateBcryptSalt(rounds = 10) {
  if (rounds < 4 || rounds > 31) {
    throw new Error('Invalid number of rounds (must be 4-31)');
  }
  return bcryptjs.genSaltSync(rounds);
}

export async function bcrypt(password, salt = null) {
  if (!salt) {
    salt = generateBcryptSalt(10);
  }

  // Validate salt format
  const parts = salt.split('$');
  if (parts.length < 4) {
    throw new Error('Invalid salt format');
  }

  const version = parts[1];
  if (version !== '2a' && version !== '2b' && version !== '2y') {
    throw new Error('Unsupported bcrypt version');
  }

  return bcryptjs.hashSync(String(password), salt);
}

export async function bcryptVerify(password, hash) {
  return bcryptjs.compareSync(String(password), hash);
}

export async function bcryptAdaptive(password, targetTime = 250) {
  let rounds = 10;

  const start = Date.now();
  const salt = generateBcryptSalt(rounds);
  bcryptjs.hashSync('test', salt);
  const elapsed = Date.now() - start;

  if (elapsed < targetTime / 2) {
    rounds = Math.min(rounds + 2, 31);
  } else if (elapsed < targetTime) {
    rounds = Math.min(rounds + 1, 31);
  }

  const finalSalt = generateBcryptSalt(rounds);
  return bcryptjs.hashSync(String(password), finalSalt);
}
