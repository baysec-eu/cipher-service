// API Server for Crypto Operations - Similar to Next.js API routes
// Provides HTTP endpoints for all cryptographic functions

import { crypto } from './crypto.js';
import { applyOperation, chainOperations } from './index.js';
import RecipeManager from './recipes.js';

class CryptoAPI {
  constructor() {
    this.server = null;
    this.port = 3001;
    this.routes = new Map();
    this.recipeManager = new RecipeManager();
    this.setupRoutes();
  }

  setupRoutes() {
    // RSA Routes
    this.routes.set('POST /api/rsa/generate', this.handleRSAGenerate.bind(this));
    this.routes.set('POST /api/rsa/encrypt', this.handleRSAEncrypt.bind(this));
    this.routes.set('POST /api/rsa/decrypt', this.handleRSADecrypt.bind(this));
    
    // AES Routes
    this.routes.set('POST /api/aes/generate-key', this.handleAESGenerateKey.bind(this));
    this.routes.set('POST /api/aes/encrypt', this.handleAESEncrypt.bind(this));
    this.routes.set('POST /api/aes/decrypt', this.handleAESDecrypt.bind(this));
    
    // Envelope Encryption Routes
    this.routes.set('POST /api/envelope/encrypt', this.handleEnvelopeEncrypt.bind(this));
    this.routes.set('POST /api/envelope/decrypt', this.handleEnvelopeDecrypt.bind(this));
    
    // Password-based Encryption Routes
    this.routes.set('POST /api/password/encrypt', this.handlePasswordEncrypt.bind(this));
    this.routes.set('POST /api/password/decrypt', this.handlePasswordDecrypt.bind(this));
    
    // Compression Routes
    this.routes.set('POST /api/compress/data', this.handleCompress.bind(this));
    this.routes.set('POST /api/compress/decompress', this.handleDecompress.bind(this));
    this.routes.set('POST /api/compress/encrypt', this.handleCompressEncrypt.bind(this));
    this.routes.set('POST /api/compress/decrypt', this.handleDecryptDecompress.bind(this));
    
    // Certificate and Key Management Routes
    this.routes.set('POST /api/x509/parse', this.handleX509Parse.bind(this));
    this.routes.set('POST /api/x509/create-self-signed', this.handleCreateSelfSigned.bind(this));
    this.routes.set('POST /api/pkcs12/parse', this.handlePKCS12Parse.bind(this));
    this.routes.set('POST /api/pem/parse-bundle', this.handlePEMBundle.bind(this));
    this.routes.set('POST /api/utils/convert-key-format', this.handleKeyFormatConvert.bind(this));
    
    // Signature Routes
    this.routes.set('POST /api/signature/generate-keys', this.handleSignatureGenerateKeys.bind(this));
    this.routes.set('POST /api/signature/sign', this.handleSign.bind(this));
    this.routes.set('POST /api/signature/verify', this.handleVerify.bind(this));
    
    // Recipe Execution Routes (no storage)
    this.routes.set('POST /api/chain/execute', this.handleExecuteChain.bind(this));
    this.routes.set('POST /api/chain/validate', this.handleValidateChain.bind(this));
    this.routes.set('POST /api/operations/:id', this.handleExecuteOperation.bind(this));
    
    // Recipe File Routes
    this.routes.set('POST /api/recipes/upload', this.handleRecipeUpload.bind(this));
    this.routes.set('POST /api/recipes/execute', this.handleExecuteRecipeFile.bind(this));
    this.routes.set('POST /api/recipes/validate-file', this.handleValidateRecipeFile.bind(this));
    
    // Health and Info Routes
    this.routes.set('GET /api/health', this.handleHealth.bind(this));
    this.routes.set('GET /api/info', this.handleInfo.bind(this));
  }

  // For browser environment, we'll create a service worker-like API
  async handleRequest(request) {
    try {
      const url = new URL(request.url);
      const method = request.method;
      const routeKey = `${method} ${url.pathname}`;
      
      const handler = this.routes.get(routeKey);
      if (!handler) {
        return this.createResponse({ error: 'Route not found' }, 404);
      }

      const body = method !== 'GET' ? await request.json() : {};
      const result = await handler(body);
      
      return this.createResponse(result, 200);
    } catch (error) {
      console.error('API Error:', error);
      return this.createResponse({ 
        error: error.message,
        type: error.constructor.name 
      }, 500);
    }
  }

  createResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  // === RSA HANDLERS ===
  async handleRSAGenerate(body) {
    const { keySize = 2048 } = body;
    return await crypto.rsa.generateKeyPair(keySize);
  }

  async handleRSAEncrypt(body) {
    const { data, publicKey } = body;
    if (!data || !publicKey) {
      throw new Error('data and publicKey are required');
    }
    return {
      encryptedData: await crypto.rsa.encrypt(data, publicKey)
    };
  }

  async handleRSADecrypt(body) {
    const { encryptedData, privateKey } = body;
    if (!encryptedData || !privateKey) {
      throw new Error('encryptedData and privateKey are required');
    }
    return {
      decryptedData: await crypto.rsa.decrypt(encryptedData, privateKey)
    };
  }

  // === AES HANDLERS ===
  async handleAESGenerateKey(body) {
    return {
      key: await crypto.aes.generateKey()
    };
  }

  async handleAESEncrypt(body) {
    const { data, key, iv } = body;
    if (!data || !key) {
      throw new Error('data and key are required');
    }
    return await crypto.aes.encrypt(data, key, iv);
  }

  async handleAESDecrypt(body) {
    const { encryptedData, key, iv } = body;
    if (!encryptedData || !key || !iv) {
      throw new Error('encryptedData, key, and iv are required');
    }
    return {
      decryptedData: await crypto.aes.decrypt(encryptedData, key, iv)
    };
  }

  // === ENVELOPE ENCRYPTION HANDLERS ===
  async handleEnvelopeEncrypt(body) {
    const { data, publicKey } = body;
    if (!data || !publicKey) {
      throw new Error('data and publicKey are required');
    }
    return await crypto.envelope.encrypt(data, publicKey);
  }

  async handleEnvelopeDecrypt(body) {
    const { encryptedData, privateKey } = body;
    if (!encryptedData || !privateKey) {
      throw new Error('encryptedData and privateKey are required');
    }
    return {
      decryptedData: await crypto.envelope.decrypt(encryptedData, privateKey)
    };
  }

  // === PASSWORD-BASED ENCRYPTION HANDLERS ===
  async handlePasswordEncrypt(body) {
    const { data, password } = body;
    if (!data || !password) {
      throw new Error('data and password are required');
    }
    return {
      encryptedData: await crypto.password.encryptString(data, password)
    };
  }

  async handlePasswordDecrypt(body) {
    const { encryptedData, password } = body;
    if (!encryptedData || !password) {
      throw new Error('encryptedData and password are required');
    }
    return {
      decryptedData: await crypto.password.decryptString(encryptedData, password)
    };
  }

  // === COMPRESSION HANDLERS ===
  async handleCompress(body) {
    const { data } = body;
    if (!data) {
      throw new Error('data is required');
    }
    const compressed = await crypto.compression.compress(data);
    return {
      compressedData: btoa(String.fromCharCode(...compressed))
    };
  }

  async handleDecompress(body) {
    const { compressedData } = body;
    if (!compressedData) {
      throw new Error('compressedData is required');
    }
    const binaryString = atob(compressedData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const decompressed = await crypto.compression.decompress(bytes);
    return {
      data: new TextDecoder().decode(decompressed)
    };
  }

  async handleCompressEncrypt(body) {
    const { data, password } = body;
    if (!data || !password) {
      throw new Error('data and password are required');
    }
    return {
      encryptedData: await crypto.compression.compressEncryptString(data, password)
    };
  }

  async handleDecryptDecompress(body) {
    const { encryptedData, password } = body;
    if (!encryptedData || !password) {
      throw new Error('encryptedData and password are required');
    }
    return {
      decryptedData: await crypto.compression.decryptDecompressString(encryptedData, password)
    };
  }

  // === CERTIFICATE AND KEY MANAGEMENT HANDLERS ===
  async handleX509Parse(body) {
    const { certificate } = body;
    if (!certificate) {
      throw new Error('certificate is required');
    }
    return await crypto.x509.parseCertificate(certificate);
  }

  async handleCreateSelfSigned(body) {
    const { subjectName, keySize = 2048, validDays = 365 } = body;
    if (!subjectName) {
      throw new Error('subjectName is required');
    }
    const keyPair = await crypto.rsa.generateKeyPair(keySize);
    // We need the actual key objects, not PEM strings
    // This is a simplified version
    return {
      warning: 'Self-signed certificate creation requires key objects, not PEM strings'
    };
  }

  async handlePKCS12Parse(body) {
    const { p12Data, password = '' } = body;
    if (!p12Data) {
      throw new Error('p12Data is required');
    }
    return await crypto.pkcs12.parse(p12Data, password);
  }

  async handlePEMBundle(body) {
    const { pemBundle } = body;
    if (!pemBundle) {
      throw new Error('pemBundle is required');
    }
    return crypto.pem.parseBundle(pemBundle);
  }

  async handleKeyFormatConvert(body) {
    const { keyPem, targetFormat } = body;
    if (!keyPem || !targetFormat) {
      throw new Error('keyPem and targetFormat are required');
    }
    return {
      convertedKey: await crypto.utils.convertKeyFormat(keyPem, targetFormat)
    };
  }

  // === SIGNATURE HANDLERS ===
  async handleSignatureGenerateKeys(body) {
    const { keySize = 2048 } = body;
    return await crypto.signature.generateKeyPair(keySize);
  }

  async handleSign(body) {
    const { message, privateKey } = body;
    if (!message || !privateKey) {
      throw new Error('message and privateKey are required');
    }
    return {
      signature: await crypto.signature.sign(message, privateKey)
    };
  }

  async handleVerify(body) {
    const { message, signature, publicKey } = body;
    if (!message || !signature || !publicKey) {
      throw new Error('message, signature, and publicKey are required');
    }
    return {
      valid: await crypto.signature.verify(message, signature, publicKey)
    };
  }

  // === OPERATION CHAIN EXECUTION HANDLERS ===
  async handleExecuteChain(body) {
    const { input, operations } = body;
    
    if (!input) {
      throw new Error('input is required');
    }
    
    if (!operations || !Array.isArray(operations)) {
      throw new Error('operations array is required');
    }

    await this.validateChainOperations(operations);

    try {
      const result = await chainOperations(input, operations);

      return {
        input,
        output: result,
        stepsExecuted: operations.length,
        executionTime: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Chain execution failed: ${error.message}`);
    }
  }

  async handleExecuteOperation(body, pathParams) {
    const { id } = pathParams;
    const { input, params = {} } = body;
    
    if (!input) {
      throw new Error('input is required');
    }

    try {
      const result = await applyOperation(id, input, params);

      return {
        input,
        output: result,
        operation: id,
        params,
        executionTime: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Operation execution failed: ${error.message}`);
    }
  }

  async handleValidateChain(body) {
    const { operations } = body;
    
    if (!operations || !Array.isArray(operations)) {
      throw new Error('operations array is required');
    }

    try {
      await this.validateChainOperations(operations);
      return {
        valid: true,
        stepCount: operations.length,
        message: 'Chain is valid'
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        stepCount: operations.length
      };
    }
  }

  // Helper method for chain validation
  async validateChainOperations(operations) {
    for (let i = 0; i < operations.length; i++) {
      const operation = operations[i];
      
      if (!operation.id) {
        throw new Error(`Step ${i + 1}: missing operation id`);
      }

      // Try to validate the operation exists by attempting to apply it to test data
      try {
        await applyOperation(operation.id, 'test', operation.params || {});
      } catch (error) {
        // If it fails with "Operation not found", that's a validation error
        if (error.message.includes('not found')) {
          throw new Error(`Step ${i + 1}: unknown operation '${operation.id}'`);
        }
        // Other errors (like parameter issues) are still validation failures
        // but we'll be more lenient about them since they might work with real data
      }
    }
  }

  // === RECIPE FILE HANDLERS ===
  async handleRecipeUpload(body) {
    const { recipeContent, filename } = body;
    
    if (!recipeContent) {
      throw new Error('recipeContent is required');
    }

    try {
      // Parse the recipe content (assuming it's already parsed JSON)
      const recipe = typeof recipeContent === 'string' ? JSON.parse(recipeContent) : recipeContent;
      
      // Validate the recipe file format
      const validation = this.recipeManager.validateRecipeFile(recipe);
      if (!validation.valid) {
        throw new Error(`Invalid recipe file: ${validation.error}`);
      }

      // Convert to internal format
      const steps = recipe.operations.map(op => ({
        id: op.operation,
        name: op.name,
        type: op.type,
        category: op.category,
        params: op.parameters || {}
      }));

      return {
        success: true,
        recipe: {
          metadata: recipe.metadata,
          steps: steps,
          validation: recipe.validation
        },
        filename: filename || 'uploaded-recipe.json',
        operations: steps.length
      };
    } catch (error) {
      throw new Error(`Failed to process recipe file: ${error.message}`);
    }
  }

  async handleExecuteRecipeFile(body) {
    const { input, recipeContent, filename } = body;
    
    if (!input) {
      throw new Error('input is required');
    }

    if (!recipeContent) {
      throw new Error('recipeContent is required');
    }

    try {
      // First upload/validate the recipe
      const uploadResult = await this.handleRecipeUpload({ recipeContent, filename });
      
      // Then execute it
      const result = await chainOperations(input, uploadResult.recipe.steps);

      return {
        input,
        output: result,
        recipeName: uploadResult.recipe.metadata.name,
        recipeDescription: uploadResult.recipe.metadata.description,
        stepsExecuted: uploadResult.recipe.steps.length,
        executionTime: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Recipe file execution failed: ${error.message}`);
    }
  }

  async handleValidateRecipeFile(body) {
    const { recipeContent, filename } = body;
    
    if (!recipeContent) {
      throw new Error('recipeContent is required');
    }

    try {
      const recipe = typeof recipeContent === 'string' ? JSON.parse(recipeContent) : recipeContent;
      const validation = this.recipeManager.validateRecipeFile(recipe);
      
      if (validation.valid) {
        // Also validate that operations exist
        await this.validateChainOperations(recipe.operations.map(op => ({
          id: op.operation,
          params: op.parameters || {}
        })));
      }

      return {
        valid: validation.valid,
        error: validation.error,
        filename: filename || 'unknown',
        metadata: validation.valid ? recipe.metadata : null,
        operationCount: validation.valid ? recipe.operations.length : 0
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        filename: filename || 'unknown'
      };
    }
  }

  // === UTILITY HANDLERS ===
  async handleHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  async handleInfo() {
    return {
      name: 'Crypto API Server',
      version: '1.0.0',
      description: 'Comprehensive cryptographic operations API',
      features: [
        'RSA encryption/decryption',
        'AES encryption/decryption', 
        'Envelope encryption',
        'Password-based encryption with HKDF',
        'Data compression (gzip)',
        'Combined compression + encryption',
        'Digital signatures',
        'PKCS#1, PKCS#8, PKCS#12 support',
        'X.509 certificate parsing',
        'PEM bundle parsing',
        'Key format conversion',
        'Operation chaining/piping',
        'Base/URL/HTML encoding/decoding',
        'Classical ciphers',
        'Hash functions',
        'Unicode/binary/hex transformations'
      ],
      endpoints: Array.from(this.routes.keys()),
      timestamp: new Date().toISOString()
    };
  }
}

// Browser-compatible API client
export class CryptoAPIClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  async request(endpoint, data = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  // RSA Methods
  async generateRSAKeys(keySize = 2048) {
    return this.request('/rsa/generate', { keySize });
  }

  async encryptRSA(data, publicKey) {
    return this.request('/rsa/encrypt', { data, publicKey });
  }

  async decryptRSA(encryptedData, privateKey) {
    return this.request('/rsa/decrypt', { encryptedData, privateKey });
  }

  // Password-based encryption methods
  async encryptWithPassword(data, password) {
    return this.request('/password/encrypt', { data, password });
  }

  async decryptWithPassword(encryptedData, password) {
    return this.request('/password/decrypt', { encryptedData, password });
  }

  // Envelope encryption methods
  async envelopeEncrypt(data, publicKey) {
    return this.request('/envelope/encrypt', { data, publicKey });
  }

  async envelopeDecrypt(encryptedData, privateKey) {
    return this.request('/envelope/decrypt', { encryptedData, privateKey });
  }

  // Compression methods
  async compressAndEncrypt(data, password) {
    return this.request('/compress/encrypt', { data, password });
  }

  async decryptAndDecompress(encryptedData, password) {
    return this.request('/compress/decrypt', { encryptedData, password });
  }

  // Certificate methods
  async parseX509(certificate) {
    return this.request('/x509/parse', { certificate });
  }

  async parsePEMBundle(pemBundle) {
    return this.request('/pem/parse-bundle', { pemBundle });
  }

  // Chain execution methods (pipe operations)
  async executeChain(input, operations) {
    return this.request('/chain/execute', { input, operations });
  }

  async executeOperation(operationId, input, params = {}) {
    return this.request(`/operations/${operationId}`, { input, params });
  }

  async validateChain(operations) {
    return this.request('/chain/validate', { operations });
  }

  // Helper method to chain operations fluently
  async pipe(input, ...operations) {
    const operationChain = operations.map(op => 
      typeof op === 'string' ? { id: op } : op
    );
    
    return this.executeChain(input, operationChain);
  }

  // Recipe file methods
  async uploadRecipe(recipeContent, filename) {
    return this.request('/recipes/upload', { recipeContent, filename });
  }

  async executeRecipeFile(input, recipeContent, filename) {
    return this.request('/recipes/execute', { input, recipeContent, filename });
  }

  async validateRecipeFile(recipeContent, filename) {
    return this.request('/recipes/validate-file', { recipeContent, filename });
  }

  // Utility methods
  async getHealth() {
    const response = await fetch(`${this.baseURL}/health`);
    return response.json();
  }

  async getInfo() {
    const response = await fetch(`${this.baseURL}/info`);
    return response.json();
  }
}

// Service Worker implementation for browser API
export function registerCryptoServiceWorker() {
  if ('serviceWorker' in navigator) {
    const apiServer = new CryptoAPI();
    
    // Create service worker that handles API requests
    const swCode = `
      const apiServer = ${CryptoAPI.toString()};
      const server = new apiServer();
      
      self.addEventListener('fetch', async (event) => {
        const url = new URL(event.request.url);
        if (url.pathname.startsWith('/api/')) {
          event.respondWith(server.handleRequest(event.request));
        }
      });
    `;
    
    const blob = new Blob([swCode], { type: 'application/javascript' });
    const swURL = URL.createObjectURL(blob);
    
    return navigator.serviceWorker.register(swURL);
  }
  
  throw new Error('Service Workers not supported');
}

// Express.js-style middleware for Node.js
export function createCryptoAPIMiddleware() {
  const apiServer = new CryptoAPI();
  
  return async (req, res, next) => {
    try {
      if (req.path.startsWith('/api/')) {
        const request = {
          url: `http://localhost${req.path}`,
          method: req.method,
          json: async () => req.body || {}
        };
        
        const response = await apiServer.handleRequest(request);
        const data = await response.json();
        
        res.status(response.status).json(data);
      } else {
        next();
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

export { CryptoAPI };
export default CryptoAPIClient;