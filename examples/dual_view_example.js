// Example demonstrating dual view system with variable passing
import { DualViewManager, VariableManager } from '../src/lib/dualview.js';
import { DataCircuit, NodeTemplates } from '../src/lib/circuit.js';

// Example 1: Simple linear recipe that can convert to graph
const simpleLinearRecipe = {
  format: 'encoder-recipe',
  version: '1.0.0',
  metadata: {
    name: 'Simple Base64 + Hex Chain',
    description: 'Base64 encode then hex encode',
    author: 'Example',
    created: '2024-01-01T00:00:00Z'
  },
  operations: [
    {
      id: 'base64_encode',
      name: 'Base64 Encode',
      operation: 'base64_encode',
      type: 'encode'
    },
    {
      id: 'hex_encode', 
      name: 'Hex Encode',
      operation: 'hex_encode',
      type: 'encode'
    }
  ]
};

// Example 2: Complex graph circuit that cannot convert back to linear
function createComplexCircuit() {
  const circuit = new DataCircuit();
  const varManager = new VariableManager();

  // Input nodes
  circuit.addNode('text_input', NodeTemplates.textInput('text_input', 'Hello World'));
  circuit.addNode('key_input', NodeTemplates.textInput('key_input', 'secret123'));

  // Processing nodes with variable passing
  circuit.addNode('base64_encode', NodeTemplates.base64Encode('base64_encode'));
  circuit.addNode('xor_cipher', NodeTemplates.xorCipher('xor_cipher'));
  
  // Branch point - multiple outputs
  circuit.addNode('hex_encode', NodeTemplates.hexEncode('hex_encode'));
  circuit.addNode('url_encode', {
    id: 'url_encode',
    type: 'processor', 
    name: 'URL Encode',
    operation: (input) => encodeURIComponent(input),
    inputs: ['input'],
    outputs: ['output']
  });

  // Analysis branch
  circuit.addNode('analyze', NodeTemplates.analyze('analyze'));

  // Multiple outputs
  circuit.addNode('output1', NodeTemplates.output('output1', 'hex'));
  circuit.addNode('output2', NodeTemplates.output('output2', 'url'));
  circuit.addNode('output3', NodeTemplates.output('output3', 'analysis'));

  // Create connections (this creates branches - making it non-linear)
  circuit.connect('text_input', 'output', 'base64_encode', 'input');
  circuit.connect('base64_encode', 'output', 'xor_cipher', 'input');
  circuit.connect('key_input', 'output', 'xor_cipher', 'key');
  
  // Branch into multiple paths
  circuit.connect('xor_cipher', 'output', 'hex_encode', 'input');
  circuit.connect('xor_cipher', 'output', 'url_encode', 'input');
  circuit.connect('xor_cipher', 'output', 'analyze', 'input');
  
  // Connect to outputs
  circuit.connect('hex_encode', 'output', 'output1', 'input');
  circuit.connect('url_encode', 'output', 'output2', 'input');
  circuit.connect('analyze', 'analysis', 'output3', 'input');

  // Set up variables
  varManager.setVariable('encryption_key', 'secret123', 'global');
  varManager.setVariable('input_text', 'Hello World', 'global');
  varManager.connectVariable('key_input', 'output', 'xor_cipher', 'key');

  return { circuit, varManager };
}

// Demonstration function
export async function demonstrateDualView() {
  console.log('=== Dual View System Demonstration ===\n');

  const dualView = new DualViewManager();

  // Part 1: Start with simple linear recipe
  console.log('1. Starting with simple linear recipe:');
  const linearState = dualView.initializeLinear(simpleLinearRecipe);
  console.log('   Current view:', linearState.view);
  console.log('   Can convert to graph:', linearState.canConvertToGraph);
  console.log('   Operations:', simpleLinearRecipe.operations.map(op => op.name).join(' -> '));

  // Convert to graph
  console.log('\n2. Converting to graph view:');
  const graphState = dualView.convertToGraph();
  console.log('   Conversion successful:', graphState.success);
  console.log('   Current view:', graphState.view);
  console.log('   Can convert back:', graphState.canConvertBack);
  console.log('   Node count:', graphState.circuit.nodes.size);

  // Convert back to linear (should work for simple case)
  console.log('\n3. Converting back to linear:');
  try {
    const backToLinear = dualView.convertToLinear();
    console.log('   Conversion successful:', backToLinear.success);
    console.log('   Operations restored:', backToLinear.recipe.operations.length);
  } catch (error) {
    console.log('   Conversion failed:', error.message);
  }

  // Part 2: Complex graph that can't convert back
  console.log('\n4. Creating complex graph circuit:');
  const { circuit: complexCircuit, varManager } = createComplexCircuit();
  const complexState = dualView.initializeGraph(complexCircuit);
  
  console.log('   Current view:', complexState.view);
  console.log('   Can convert to linear:', complexState.canConvertToLinear);

  const complexity = dualView.getCurrentState().complexity;
  console.log('   Complexity analysis:');
  console.log('     - Node count:', complexity.nodeCount);
  console.log('     - Connection count:', complexity.connectionCount);
  console.log('     - Has branches:', complexity.hasBranches);
  console.log('     - Has loops:', complexity.hasLoops);

  // Try to convert complex graph to linear (should fail)
  console.log('\n5. Attempting to convert complex graph to linear:');
  try {
    dualView.convertToLinear();
    console.log('   Unexpected success!');
  } catch (error) {
    console.log('   Conversion blocked:', error.message);
  }

  // Part 3: Variable passing demonstration
  console.log('\n6. Variable passing demonstration:');
  varManager.setVariable('user_input', 'Secret Message', 'global');
  varManager.setVariable('xor_key', 'mykey123', 'global');
  varManager.setVariable('temp_result', null, 'node', 'xor_cipher');

  console.log('   Global variables:', Object.keys(varManager.getAllVariables()));
  console.log('   XOR cipher node variables:', Object.keys(varManager.getAllVariables('xor_cipher')));

  // Execute the complex circuit
  console.log('\n7. Executing complex circuit:');
  try {
    const results = await complexCircuit.execute({
      text_input: 'Hello World',
      key_input: 'secret123'
    });
    
    console.log('   Execution results:');
    for (const [nodeId, result] of Object.entries(results)) {
      console.log(`     ${nodeId}:`, typeof result.data === 'object' ? 
        JSON.stringify(result.data).substring(0, 50) + '...' : 
        result.data?.toString().substring(0, 50));
    }
  } catch (error) {
    console.log('   Execution failed:', error.message);
  }

  // Part 4: Show current state
  console.log('\n8. Final state summary:');
  const finalState = dualView.getCurrentState();
  console.log('   Current view:', finalState.view);
  console.log('   Conversion locked:', finalState.conversionLocked);
  console.log('   Has data:', finalState.hasData);
  
  return {
    dualView,
    varManager,
    complexCircuit
  };
}

// Recipe examples for different complexity levels
export const recipeExamples = {
  // Simple linear - can convert both ways
  simple: {
    name: 'Simple Chain',
    canConvert: true,
    operations: ['base64_encode', 'hex_encode']
  },

  // Medium complexity - can convert to graph, difficult to convert back
  medium: {
    name: 'Multi-step with Parameters',
    canConvert: 'one-way',
    operations: ['xor_cipher', 'base64_encode', 'url_encode'],
    variables: ['key', 'iterations']
  },

  // Complex - graph only
  complex: {
    name: 'Branching Circuit',
    canConvert: false,
    features: ['branches', 'multiple_outputs', 'analysis_nodes'],
    nodeCount: 12,
    connectionCount: 15
  },

  // Very complex - graph only with loops
  veryComplex: {
    name: 'AES with Loops',
    canConvert: false,
    features: ['loops', 'conditionals', 'sequences', 'state_machines'],
    nodeCount: 25,
    connectionCount: 35
  }
};

// Usage guidelines
export const usageGuidelines = {
  linear: {
    bestFor: ['Simple chains', 'Tutorials', 'Quick prototyping'],
    limitations: ['No branches', 'No loops', 'Limited variable passing'],
    maxComplexity: 'Up to 10-15 operations'
  },
  
  graph: {
    bestFor: ['Complex algorithms', 'Multiple outputs', 'Conditional logic'],
    capabilities: ['Branches', 'Loops', 'Variables', 'Analysis nodes'],
    warning: 'Once complex features are used, cannot convert back to linear'
  },

  conversion: {
    linearToGraph: 'Always possible - adds visual representation',
    graphToLinear: 'Only for simple linear chains without branches/loops',
    lockingConditions: ['Branches (multiple outputs)', 'Loops', 'Conditionals', '>20 nodes']
  }
};

// Export the demonstration
export default demonstrateDualView;