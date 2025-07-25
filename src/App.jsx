import React, { useState, useEffect, useMemo } from 'react';
import { operations, chainOperations } from './lib/index.js';
import { Search, Github, ExternalLink, Moon, Sun, Copy, Check, GitBranch, List } from 'lucide-react';
import Recipe from './components/Recipe.jsx';
import HashCracker from './components/HashCracker.jsx';
import SubstitutionSolver from './components/SubstitutionSolver.jsx';
import { useTheme } from './contexts/ThemeContext.jsx';
import CircuitCanvas from './components/CircuitCanvas.jsx';

function App() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [recipe, setRecipe] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [inputCopied, setInputCopied] = useState(false);
  const [outputCopied, setOutputCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('encoder');
  const [viewMode, setViewMode] = useState('linear'); // 'linear' or 'graph'

  // Filter operations based on search term
  const filteredOperations = useMemo(() => {
    if (!searchTerm) return operations;
    return operations.filter(op => 
      op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Group operations by category
  const operationsByCategory = useMemo(() => {
    const grouped = {};
    filteredOperations.forEach(op => {
      if (!grouped[op.category]) {
        grouped[op.category] = [];
      }
      grouped[op.category].push(op);
    });
    return grouped;
  }, [filteredOperations]);

  // Apply recipe whenever input or recipe changes
  useEffect(() => {
    const processInput = async () => {
      if (!input || recipe.length === 0) {
        setOutput(input);
        setError('');
        return;
      }

      try {
        const result = await chainOperations(input, recipe);
        setOutput(result);
        setError('');
      } catch (err) {
        setError(err.message);
        setOutput('');
      }
    };

    processInput();
  }, [input, recipe]);

  const addToRecipe = (operation) => {
    const step = { id: operation.id, name: operation.name, type: operation.type, params: {} };
    
    // Add default parameters if needed
    if (operation.params) {
      operation.params.forEach(param => {
        if (param === 'shift') step.params[param] = 3;
        if (param === 'key' && typeof param === 'number') step.params[param] = 32;
        if (param === 'keyStr' || param === 'key') step.params[param] = param === 'keyStr' ? 'KEY' : (param === 'key' && operation.id.includes('vigenere') ? 'KEY' : 32);
        if (param === 'rails') step.params[param] = 3;
        if (param === 'a') step.params[param] = 5;
        if (param === 'b') step.params[param] = 8;
        if (param === 'key1') step.params[param] = 'EXAMPLE';
        if (param === 'key2') step.params[param] = 'KEYWORD';
        if (param === 'alphabet') step.params[param] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      });
    }
    
    setRecipe([...recipe, step]);
  };

  const clearInput = () => {
    setInput('');
  };

  const copyToClipboard = async (text, setCopiedState) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedState(true);
        setTimeout(() => setCopiedState(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const copyInput = () => copyToClipboard(input, setInputCopied);
  const copyOutput = () => copyToClipboard(output, setOutputCopied);

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <a 
            href="https://www.baysec.eu" 
            target="_blank" 
            rel="noopener noreferrer"
            title="Visit Baysec"
          >
            <img 
              src={isDarkMode ? "/logo-darkmode.svg" : "/logo-lightmode.svg"} 
              alt="Baysec" 
              className="header-logo" 
            />
          </a>
          <div className="header-text">
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '2px' }}>
              <span className={"cipher-service"}>Cipher Service</span> <span className={"version"}>{__APP_VERSION__}</span>
            </div>
          </div>
        </div>
        <div className="header-center">
        </div>
        <div className="header-right">
          <button 
            onClick={toggleDarkMode}
            className="theme-toggle"
            title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a 
            href="https://www.baysec.eu" 
            target="_blank" 
            rel="noopener noreferrer"
            className="baysec-link"
            title="Visit Baysec"
          >
            <span>Visit Baysec</span>
            <ExternalLink size={14} />
          </a>
          <a 
            href="https://github.com/baysec-eu/cipher" 
            target="_blank" 
            rel="noopener noreferrer"
            className="github-link"
            title="View on GitHub"
          >
            <Github size={20} />
            <span>GitHub</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </header>

      <div className="subheader">
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'encoder' ? 'active' : ''}`}
            onClick={() => setActiveTab('encoder')}
          >
            {viewMode === 'linear' ? (
              <List size={16} style={{marginRight: '0.5rem'}} />
            ) : (
              <GitBranch size={16} style={{marginRight: '0.5rem'}} />
            )}
            {viewMode === 'linear' ? 'Encoder' : 'Circuit Editor'}
          </button>
          <button 
            className={`tab-button ${activeTab === 'cracker' ? 'active' : ''}`}
            onClick={() => setActiveTab('cracker')}
          >
            Hash Cracker
          </button>
          {/* <button 
            className={`tab-button ${activeTab === 'substitution' ? 'active' : ''}`}
            onClick={() => setActiveTab('substitution')}
          >
            Substitution Solver
          </button> */}
          
          {activeTab === 'encoder' && (
            <>
              <div className="tab-separator"></div>
              <button 
                className={`tab-button ${viewMode === 'linear' ? 'active' : ''}`}
                onClick={() => {
                  if (viewMode !== 'linear' && (recipe.length > 0)) {
                    if (confirm('Switching to Linear mode will clear your current graph. Continue?')) {
                      setViewMode('linear');
                      setRecipe([]);
                    }
                  } else {
                    setViewMode('linear');
                  }
                }}
                title="Linear Sequential Mode"
              >
                <List size={14} />
                Linear
              </button>
              <button 
                className={`tab-button ${viewMode === 'graph' ? 'active' : ''}`}
                onClick={() => {
                  if (viewMode !== 'graph' && recipe.length > 0) {
                    if (confirm('Switching to Graph mode will clear your current recipe. Continue?')) {
                      setViewMode('graph');
                      setRecipe([]);
                    }
                  } else {
                    setViewMode('graph');
                  }
                }}
                title="Graph Circuit Mode"
              >
                <GitBranch size={14} />
                Graph
              </button>
            </>
          )}
        </div>
      </div>

      <div className="main-content">
        {activeTab === 'encoder' ? (
          <>
            <div className="sidebar">
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <Search size={16} style={{ position: 'absolute', left: '8px', top: '34%', transform: 'translateY(-50%)', color: '#6c757d' }} />
                <input
                  type="text"
                  placeholder="Search operations..."
                  className="search-box"
                  style={{ paddingLeft: '2rem' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {viewMode === 'graph' ? (
                <div className="drag-tip">
                  💡 <strong>Drag operations</strong> from the list below onto the circuit canvas to create nodes
                </div>
              ) : (
                <div className="drag-tip">
                  💡 <strong>Click operations</strong> to add them to your sequential recipe
                </div>
              )}

              {Object.entries(operationsByCategory).map(([category, ops]) => (
                <div key={category} className="operation-category">
                  <h3>{category}</h3>
                  <ul className="operation-list">
                    {ops.map(op => (
                      <li
                        key={op.id}
                        className={`operation-item ${op.type}`}
                        draggable={viewMode === 'graph'}
                        onDragStart={viewMode === 'graph' ? (e) => {
                          e.dataTransfer.setData('application/json', JSON.stringify(op));
                        } : undefined}
                        onClick={viewMode === 'linear' ? () => addToRecipe(op) : undefined}
                        title={viewMode === 'graph' ? `Drag ${op.name} to canvas` : `Click to add ${op.name} to recipe`}
                        style={{ cursor: viewMode === 'linear' ? 'pointer' : 'grab' }}
                      >
                        {op.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="content">
              {viewMode === 'graph' ? (
                <CircuitCanvas 
                  operations={operations}
                  recipe={recipe}
                  onUpdateRecipe={setRecipe}
                  input={input}
                  output={output}
                  onInputChange={setInput}
                  onOutputChange={setOutput}
                  onExecute={chainOperations}
                />
              ) : (
                <Recipe 
                  recipe={recipe}
                  onUpdateRecipe={setRecipe}
                />
              )}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="io-panel">
                <div className="io-section">
                  <div className="io-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Input
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="copy-button" 
                          onClick={copyInput} 
                          disabled={!input}
                          title="Copy input"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          {inputCopied ? <Check size={12} /> : <Copy size={12} />}
                          {inputCopied ? 'Copied!' : 'Copy'}
                        </button>
                        <button className="clear-button" onClick={clearInput} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="io-content">
                    <div className="input-container">
                      <textarea
                        className="io-textarea"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter your text here, upload a file, or drag & drop..."
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.style.borderColor = '#007bff';
                          e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.05)';
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.currentTarget.style.borderColor = '';
                          e.currentTarget.style.backgroundColor = '';
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.style.borderColor = '';
                          e.currentTarget.style.backgroundColor = '';
                          
                          const file = e.dataTransfer.files[0];
                          if (file) {
                            // Check file size (max 10MB)
                            if (file.size > 10 * 1024 * 1024) {
                              setError('File size must be less than 10MB');
                              return;
                            }
                            
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setInput(event.target.result);
                              setError(''); // Clear any previous errors
                            };
                            reader.onerror = () => {
                              setError('Failed to read file');
                            };
                            
                            // Read as text for most files, but handle binary files
                            if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                              reader.readAsDataURL(file);
                            } else {
                              reader.readAsText(file);
                            }
                          }
                        }}
                      />
                      <div className="input-actions">
                        <label className="file-upload-btn">
                          <input
                            type="file"
                            style={{ display: 'none' }}
                            accept=".txt,.json,.xml,.csv,.html,.js,.py,.java,.cpp,.c,.h,.md,.log,*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                // Check file size (max 10MB)
                                if (file.size > 10 * 1024 * 1024) {
                                  setError('File size must be less than 10MB');
                                  return;
                                }
                                
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setInput(event.target.result);
                                  setError(''); // Clear any previous errors
                                };
                                reader.onerror = () => {
                                  setError('Failed to read file');
                                };
                                
                                // Read as text for most files, but handle binary files
                                if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                                  reader.readAsDataURL(file);
                                } else {
                                  reader.readAsText(file);
                                }
                              }
                              // Reset input to allow uploading the same file again
                              e.target.value = '';
                            }}
                          />
                          📁 Upload File
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="io-section">
                  <div className="io-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Output {output && `(${output.length} characters)`}</span>
                      <button 
                        className="copy-button" 
                        onClick={copyOutput} 
                        disabled={!output}
                        title="Copy output"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        {outputCopied ? <Check size={12} /> : <Copy size={12} />}
                        {outputCopied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="io-content">
                    <textarea
                      className="io-textarea"
                      value={output}
                      readOnly
                      placeholder="Output will appear here..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'cracker' ? (
          <div className="cracker-content">
            <HashCracker />
          </div>
        ) : (
          <div className="substitution-content">
            <SubstitutionSolver />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;