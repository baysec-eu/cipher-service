// Sequencing system for complex multi-step operations
// Allows for loops, conditionals, and parallel execution in circuits

export class SequenceController {
  constructor(circuit) {
    this.circuit = circuit;
    this.sequences = new Map();
    this.variables = new Map();
    this.loops = new Map();
  }

  // Create a sequence with control flow
  createSequence(id, config) {
    const sequence = {
      id: id,
      name: config.name || id,
      steps: config.steps || [],
      type: config.type || 'linear', // 'linear', 'parallel', 'conditional', 'loop'
      condition: config.condition || null,
      loopCount: config.loopCount || 1,
      variables: config.variables || {},
      onComplete: config.onComplete || null
    };
    
    this.sequences.set(id, sequence);
    return sequence;
  }

  // Execute a sequence
  async executeSequence(sequenceId, initialData = {}) {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) {
      throw new Error(`Sequence '${sequenceId}' not found`);
    }

    // Initialize variables
    this.variables.set(sequenceId, { ...sequence.variables, ...initialData });

    try {
      switch (sequence.type) {
        case 'linear':
          return await this.executeLinear(sequence);
        case 'parallel':
          return await this.executeParallel(sequence);
        case 'conditional':
          return await this.executeConditional(sequence);
        case 'loop':
          return await this.executeLoop(sequence);
        default:
          throw new Error(`Unknown sequence type: ${sequence.type}`);
      }
    } catch (error) {
      throw new Error(`Sequence '${sequenceId}' failed: ${error.message}`);
    }
  }

  // Execute steps linearly
  async executeLinear(sequence) {
    let data = this.variables.get(sequence.id);
    const results = [];

    for (const step of sequence.steps) {
      const result = await this.executeStep(step, data, sequence.id);
      results.push(result);
      
      // Update data for next step
      if (step.outputVariable) {
        data[step.outputVariable] = result;
      }
    }

    return results[results.length - 1]; // Return final result
  }

  // Execute steps in parallel
  async executeParallel(sequence) {
    const data = this.variables.get(sequence.id);
    const promises = sequence.steps.map(step => this.executeStep(step, data, sequence.id));
    
    return await Promise.all(promises);
  }

  // Execute with condition
  async executeConditional(sequence) {
    const data = this.variables.get(sequence.id);
    const condition = await this.evaluateCondition(sequence.condition, data);
    
    if (condition) {
      return await this.executeLinear(sequence);
    }
    
    return null;
  }

  // Execute loop
  async executeLoop(sequence) {
    const results = [];
    let data = this.variables.get(sequence.id);
    
    for (let i = 0; i < sequence.loopCount; i++) {
      // Update loop variable
      data.loopIndex = i;
      data.loopCount = sequence.loopCount;
      
      const result = await this.executeLinear({ ...sequence, type: 'linear' });
      results.push(result);
      
      // Update data for next iteration
      data.previousResult = result;
    }
    
    return results;
  }

  // Execute a single step
  async executeStep(step, data, sequenceId) {
    const stepData = { ...data };
    
    // Substitute variables in parameters
    const params = this.substituteVariables(step.parameters || {}, stepData);
    const input = step.input ? stepData[step.input] : stepData.input || stepData.data;
    
    if (step.nodeId) {
      // Execute circuit node
      const node = this.circuit.nodes.get(step.nodeId);
      if (!node) {
        throw new Error(`Node '${step.nodeId}' not found`);
      }
      
      if (node.operation) {
        return await node.operation(input, params);
      }
    } else if (step.operation) {
      // Execute direct operation
      return await step.operation(input, params);
    }
    
    throw new Error(`Invalid step configuration: ${JSON.stringify(step)}`);
  }

  // Substitute variables in parameters
  substituteVariables(params, data) {
    const result = {};
    
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string' && value.startsWith('$')) {
        const varName = value.substring(1);
        result[key] = data[varName] || value;
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }

  // Evaluate condition
  async evaluateCondition(condition, data) {
    if (typeof condition === 'function') {
      return await condition(data);
    }
    
    if (typeof condition === 'string') {
      // Simple variable check
      return !!data[condition];
    }
    
    return !!condition;
  }
}

// AES implementation using sequencing system
export class AESSequence {
  constructor(circuit) {
    this.circuit = circuit;
    this.sequencer = new SequenceController(circuit);
    this.setupAESNodes();
  }

  // Setup AES operation nodes
  setupAESNodes() {
    // AES S-Box
    this.circuit.addNode('aes_sbox', {
      type: 'processor',
      name: 'AES S-Box',
      operation: this.sBoxTransform.bind(this),
      inputs: ['input'],
      outputs: ['output']
    });

    // AES Inverse S-Box
    this.circuit.addNode('aes_inv_sbox', {
      type: 'processor',
      name: 'AES Inverse S-Box',
      operation: this.invSBoxTransform.bind(this),
      inputs: ['input'],
      outputs: ['output']
    });

    // Shift Rows
    this.circuit.addNode('shift_rows', {
      type: 'processor',
      name: 'Shift Rows',
      operation: this.shiftRows.bind(this),
      inputs: ['input'],
      outputs: ['output']
    });

    // Inverse Shift Rows
    this.circuit.addNode('inv_shift_rows', {
      type: 'processor',
      name: 'Inverse Shift Rows',
      operation: this.invShiftRows.bind(this),
      inputs: ['input'],
      outputs: ['output']
    });

    // Mix Columns
    this.circuit.addNode('mix_columns', {
      type: 'processor',
      name: 'Mix Columns',
      operation: this.mixColumns.bind(this),
      inputs: ['input'],
      outputs: ['output']
    });

    // Inverse Mix Columns  
    this.circuit.addNode('inv_mix_columns', {
      type: 'processor',
      name: 'Inverse Mix Columns',
      operation: this.invMixColumns.bind(this),
      inputs: ['input'],
      outputs: ['output']
    });

    // Add Round Key
    this.circuit.addNode('add_round_key', {
      type: 'processor',
      name: 'Add Round Key',
      operation: this.addRoundKey.bind(this),
      inputs: ['input', 'key'],
      outputs: ['output'],
      parameters: { roundKey: null }
    });

    // Key Expansion
    this.circuit.addNode('key_expansion', {
      type: 'processor',
      name: 'Key Expansion',
      operation: this.keyExpansion.bind(this),
      inputs: ['key'],
      outputs: ['roundKeys']
    });
  }

  // Create AES encryption sequence
  createAESEncryptSequence(key128) {
    return this.sequencer.createSequence('aes_encrypt', {
      name: 'AES-128 Encryption',
      type: 'linear',
      variables: {
        key: key128,
        round: 0
      },
      steps: [
        // Key expansion
        {
          nodeId: 'key_expansion',
          input: 'key',
          outputVariable: 'roundKeys',
          parameters: {}
        },
        
        // Initial round key addition
        {
          nodeId: 'add_round_key',
          input: 'data',
          outputVariable: 'state',
          parameters: { roundKey: '$roundKeys[0]' }
        },
        
        // Main rounds (1-9)
        {
          operation: this.aesMainRounds.bind(this),
          input: 'state',
          outputVariable: 'state',
          parameters: { roundKeys: '$roundKeys', startRound: 1, endRound: 9 }
        },
        
        // Final round (10)
        {
          operation: this.aesFinalRound.bind(this),
          input: 'state',
          outputVariable: 'ciphertext',
          parameters: { roundKey: '$roundKeys[10]' }
        }
      ]
    });
  }

  // Create AES decryption sequence
  createAESDecryptSequence(key128) {
    return this.sequencer.createSequence('aes_decrypt', {
      name: 'AES-128 Decryption',
      type: 'linear',
      variables: {
        key: key128,
        round: 10
      },
      steps: [
        // Key expansion
        {
          nodeId: 'key_expansion',
          input: 'key',
          outputVariable: 'roundKeys',
          parameters: {}
        },
        
        // Initial round key addition (round 10)
        {
          nodeId: 'add_round_key',
          input: 'data',
          outputVariable: 'state',
          parameters: { roundKey: '$roundKeys[10]' }
        },
        
        // Inverse shift rows
        {
          nodeId: 'inv_shift_rows',
          input: 'state',
          outputVariable: 'state',
          parameters: {}
        },
        
        // Inverse S-box
        {
          nodeId: 'aes_inv_sbox',
          input: 'state',
          outputVariable: 'state',
          parameters: {}
        },
        
        // Main rounds (9-1)
        {
          operation: this.aesInverseMainRounds.bind(this),
          input: 'state',
          outputVariable: 'state',
          parameters: { roundKeys: '$roundKeys', startRound: 9, endRound: 1 }
        },
        
        // Final round key addition (round 0)
        {
          nodeId: 'add_round_key',
          input: 'state',
          outputVariable: 'plaintext',
          parameters: { roundKey: '$roundKeys[0]' }
        }
      ]
    });
  }

  // Execute AES main rounds (1-9)
  async aesMainRounds(state, params) {
    let currentState = state;
    const roundKeys = params.roundKeys;
    
    for (let round = params.startRound; round <= params.endRound; round++) {
      // S-box transformation
      currentState = await this.sBoxTransform(currentState);
      
      // Shift rows
      currentState = await this.shiftRows(currentState);
      
      // Mix columns
      currentState = await this.mixColumns(currentState);
      
      // Add round key
      currentState = await this.addRoundKey(currentState, { roundKey: roundKeys[round] });
    }
    
    return currentState;
  }

  // Execute AES final round (10)
  async aesFinalRound(state, params) {
    let currentState = state;
    
    // S-box transformation
    currentState = await this.sBoxTransform(currentState);
    
    // Shift rows
    currentState = await this.shiftRows(currentState);
    
    // Add round key (no mix columns in final round)
    currentState = await this.addRoundKey(currentState, params);
    
    return currentState;
  }

  // Execute AES inverse main rounds (9-1)
  async aesInverseMainRounds(state, params) {
    let currentState = state;
    const roundKeys = params.roundKeys;
    
    for (let round = params.startRound; round >= params.endRound; round--) {
      // Add round key
      currentState = await this.addRoundKey(currentState, { roundKey: roundKeys[round] });
      
      // Inverse mix columns
      currentState = await this.invMixColumns(currentState);
      
      // Inverse shift rows
      currentState = await this.invShiftRows(currentState);
      
      // Inverse S-box transformation
      currentState = await this.invSBoxTransform(currentState);
    }
    
    return currentState;
  }

  // AES S-Box transformation
  async sBoxTransform(input) {
    const sBox = [
      0x63, 0x7C, 0x77, 0x7B, 0xF2, 0x6B, 0x6F, 0xC5, 0x30, 0x01, 0x67, 0x2B, 0xFE, 0xD7, 0xAB, 0x76,
      0xCA, 0x82, 0xC9, 0x7D, 0xFA, 0x59, 0x47, 0xF0, 0xAD, 0xD4, 0xA2, 0xAF, 0x9C, 0xA4, 0x72, 0xC0,
      // ... (full S-box table)
    ];
    
    const bytes = this.toByteArray(input);
    const result = bytes.map(byte => sBox[byte]);
    return new Uint8Array(result);
  }

  // AES Inverse S-Box transformation
  async invSBoxTransform(input) {
    const invSBox = [
      0x52, 0x09, 0x6A, 0xD5, 0x30, 0x36, 0xA5, 0x38, 0xBF, 0x40, 0xA3, 0x9E, 0x81, 0xF3, 0xD7, 0xFB,
      // ... (full inverse S-box table)
    ];
    
    const bytes = this.toByteArray(input);
    const result = bytes.map(byte => invSBox[byte]);
    return new Uint8Array(result);
  }

  // Shift Rows transformation
  async shiftRows(input) {
    const bytes = this.toByteArray(input);
    const result = new Uint8Array(16);
    
    // Row 0: no shift
    result[0] = bytes[0]; result[4] = bytes[4]; result[8] = bytes[8]; result[12] = bytes[12];
    
    // Row 1: shift left by 1
    result[1] = bytes[5]; result[5] = bytes[9]; result[9] = bytes[13]; result[13] = bytes[1];
    
    // Row 2: shift left by 2
    result[2] = bytes[10]; result[6] = bytes[14]; result[10] = bytes[2]; result[14] = bytes[6];
    
    // Row 3: shift left by 3
    result[3] = bytes[15]; result[7] = bytes[3]; result[11] = bytes[7]; result[15] = bytes[11];
    
    return result;
  }

  // Inverse Shift Rows transformation
  async invShiftRows(input) {
    const bytes = this.toByteArray(input);
    const result = new Uint8Array(16);
    
    // Row 0: no shift
    result[0] = bytes[0]; result[4] = bytes[4]; result[8] = bytes[8]; result[12] = bytes[12];
    
    // Row 1: shift right by 1
    result[1] = bytes[13]; result[5] = bytes[1]; result[9] = bytes[5]; result[13] = bytes[9];
    
    // Row 2: shift right by 2
    result[2] = bytes[10]; result[6] = bytes[14]; result[10] = bytes[2]; result[14] = bytes[6];
    
    // Row 3: shift right by 3
    result[3] = bytes[7]; result[7] = bytes[11]; result[11] = bytes[15]; result[15] = bytes[3];
    
    return result;
  }

  // Mix Columns transformation (simplified)
  async mixColumns(input) {
    // Simplified implementation - in practice would use Galois field multiplication
    const bytes = this.toByteArray(input);
    const result = new Uint8Array(16);
    
    for (let col = 0; col < 4; col++) {
      const offset = col * 4;
      // Simplified mix - actual AES uses more complex operations
      result[offset] = bytes[offset] ^ bytes[offset + 1];
      result[offset + 1] = bytes[offset + 1] ^ bytes[offset + 2];
      result[offset + 2] = bytes[offset + 2] ^ bytes[offset + 3];
      result[offset + 3] = bytes[offset + 3] ^ bytes[offset];
    }
    
    return result;
  }

  // Inverse Mix Columns transformation (simplified)
  async invMixColumns(input) {
    // Simplified inverse - actual AES uses more complex operations
    return await this.mixColumns(input);
  }

  // Add Round Key
  async addRoundKey(input, params) {
    const stateBytes = this.toByteArray(input);
    const keyBytes = this.toByteArray(params.roundKey);
    
    const result = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      result[i] = stateBytes[i] ^ keyBytes[i];
    }
    
    return result;
  }

  // Key Expansion (simplified)
  async keyExpansion(key) {
    const keyBytes = this.toByteArray(key);
    const roundKeys = [];
    
    // Round 0 - original key
    roundKeys.push(new Uint8Array(keyBytes));
    
    // Generate 10 more round keys (simplified)
    for (let round = 1; round <= 10; round++) {
      const prevKey = roundKeys[round - 1];
      const newKey = new Uint8Array(16);
      
      // Simplified key expansion
      for (let i = 0; i < 16; i++) {
        newKey[i] = prevKey[i] ^ round ^ i;
      }
      
      roundKeys.push(newKey);
    }
    
    return roundKeys;
  }

  // Helper to convert input to byte array
  toByteArray(input) {
    if (input instanceof Uint8Array) {
      return input;
    }
    
    if (typeof input === 'string') {
      return new TextEncoder().encode(input);
    }
    
    if (Array.isArray(input)) {
      return new Uint8Array(input);
    }
    
    throw new Error('Invalid input format for AES operation');
  }

  // Execute complete AES encryption
  async encrypt(plaintext, key) {
    const sequence = this.createAESEncryptSequence(key);
    return await this.sequencer.executeSequence('aes_encrypt', {
      data: plaintext,
      key: key
    });
  }

  // Execute complete AES decryption
  async decrypt(ciphertext, key) {
    const sequence = this.createAESDecryptSequence(key);
    return await this.sequencer.executeSequence('aes_decrypt', {
      data: ciphertext,
      key: key
    });
  }
}

// SequenceController is already exported as a class declaration above