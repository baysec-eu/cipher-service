import React, { useState, useEffect, useMemo } from 'react';
import { operations, applyOperation, chainOperations } from './lib/index.js';
import { Search, X, Play, Trash2, Github, ExternalLink, Moon, Sun, Copy, Check } from 'lucide-react';
import Recipe from './components/Recipe.jsx';
import HashCracker from './components/HashCracker.jsx';
import { useTheme } from './contexts/ThemeContext.jsx';

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
          <img 
            src={isDarkMode ? "/logo-darkmode.svg" : "/logo-lightmode.svg"} 
            alt="Baysec Cipher" 
            className="header-logo" 
          />
          <div className="header-text">
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '2px' }}>
              Encoding & cryptography toolkit
            </div>
          </div>
        </div>
        <div className="header-center">
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'encoder' ? 'active' : ''}`}
              onClick={() => setActiveTab('encoder')}
            >
              Encoder
            </button>
            <button 
              className={`tab-button ${activeTab === 'cracker' ? 'active' : ''}`}
              onClick={() => setActiveTab('cracker')}
            >
              Hash Cracker
            </button>
          </div>
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
            href="https://baysec.eu" 
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

      <div className="main-content">
        {activeTab === 'encoder' ? (
          <>
            <div className="sidebar">
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <Search size={16} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
                <input
                  type="text"
                  placeholder="Search operations..."
                  className="search-box"
                  style={{ paddingLeft: '2rem' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {Object.entries(operationsByCategory).map(([category, ops]) => (
                <div key={category} className="operation-category">
                  <h3>{category}</h3>
                  <ul className="operation-list">
                    {ops.map(op => (
                      <li
                        key={op.id}
                        className={`operation-item ${op.type}`}
                        onClick={() => addToRecipe(op)}
                        title={`Add ${op.name} to recipe`}
                      >
                        {op.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="content">
              <Recipe recipe={recipe} onUpdateRecipe={setRecipe} />

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
                    <textarea
                      className="io-textarea"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Enter your text here..."
                    />
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
        ) : (
          <div className="cracker-content">
            <HashCracker />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;