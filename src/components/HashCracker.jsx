import React, { useState, useEffect } from 'react';
import { Upload, Play, Square, FileText, Search, ChevronDown } from 'lucide-react';
import { gpuHashCracker } from '../lib/hashcracking.js';
import './HashCracker.css';

const HashCracker = () => {
  const [hashInput, setHashInput] = useState('');
  const [hashType, setHashType] = useState('ntlm');
  const [hashTypeSearch, setHashTypeSearch] = useState('');
  const [hashTypeDropdownOpen, setHashTypeDropdownOpen] = useState(false);
  const [wordlists, setWordlists] = useState([]);
  const [selectedWordlist, setSelectedWordlist] = useState('');
  const [rules, setRules] = useState('');
  const [crackingStatus, setCrackingStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [gpuSupported, setGpuSupported] = useState(false);
  const [gpuInfo, setGpuInfo] = useState(null);

  const hashCracker = gpuHashCracker;

  useEffect(() => {
    detectGPU();
    // loadDefaultWordlist();
  }, []);

  const detectGPU = async () => {
    try {
      if ('gpu' in navigator) {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
          setGpuSupported(true);
          setGpuInfo({
            vendor: adapter.info?.vendor || 'Unknown',
            architecture: adapter.info?.architecture || 'Unknown',
            device: adapter.info?.device || 'Unknown',
            description: adapter.info?.description || 'WebGPU Compatible'
          });
        } else {
          setGpuSupported(false);
        }
      } else {
        setGpuSupported(false);
      }
    } catch (error) {
      setGpuSupported(false);
    }
    
    // Fallback check for the hash cracker
    if (hashCracker && hashCracker.supportsGPU) {
      setGpuSupported(true);
    }
  };

  // const loadDefaultWordlist = () => {
  //   const defaultWords = [
  //     'password', '123456', 'password123', 'admin', 'letmein', 'welcome',
  //     'monkey', '1234567890', 'qwerty', 'abc123', 'Password1', 'password1',
  //     'welcome123', 'admin123', 'root', 'toor', 'pass', 'test', 'guest'
  //   ];
  //   const result = hashCracker.loadWordlistFromText(defaultWords.join('\n'), 'Default');
  //   setWordlists([result]);
  //   setSelectedWordlist('Default');
  // };

  const handleWordlistUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await hashCracker.loadWordlist(file);
      setWordlists(prev => [...prev, result]);
      setSelectedWordlist(result.name);
    } catch (error) {
      alert('Error loading wordlist: ' + error.message);
    }
  };

  const handleRulesUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      setRules(text);
      const ruleCount = hashCracker.loadRules(text);
      alert(`Loaded ${ruleCount} rules`);
    } catch (error) {
      alert('Error loading rules: ' + error.message);
    }
  };

  const startCracking = async () => {
    if (!hashInput || !selectedWordlist) {
      alert('Please enter a hash and select a wordlist');
      return;
    }

    setCrackingStatus('running');
    setResults(null);

    try {
      const result = await hashCracker.crackHashWithRules(
        hashInput.trim(),
        hashType,
        selectedWordlist,
        {
          maxTimeMs: 600000, // 10 minutes max
          batchSize: 1000
        }
      );

      setResults(result);
      setCrackingStatus('completed');
    } catch (error) {
      alert('Cracking failed: ' + error.message);
      setCrackingStatus('error');
    }
  };

  const stopCracking = () => {
    hashCracker.stop();
    setCrackingStatus('stopped');
  };


  const hashTypes = [
    // Basic Hash Functions
    { value: 'md5', label: 'MD5' },
    { value: 'sha1', label: 'SHA1' },
    { value: 'sha224', label: 'SHA224' },
    { value: 'sha256', label: 'SHA256' },
    { value: 'sha384', label: 'SHA384' },
    { value: 'sha512', label: 'SHA512' },
    { value: 'sha512_224', label: 'SHA512-224' },
    { value: 'sha512_256', label: 'SHA512-256' },
    { value: 'sha3_224', label: 'SHA3-224' },
    { value: 'sha3_256', label: 'SHA3-256' },
    { value: 'sha3_384', label: 'SHA3-384' },
    { value: 'sha3_512', label: 'SHA3-512' },
    { value: 'blake2b', label: 'BLAKE2b' },
    { value: 'blake2s', label: 'BLAKE2s' },
    { value: 'md4', label: 'MD4' },
    { value: 'md2', label: 'MD2' },
    { value: 'ripemd160', label: 'RIPEMD-160' },
    { value: 'whirlpool', label: 'Whirlpool' },
    { value: 'tiger', label: 'Tiger' },
    
    // Windows Authentication
    { value: 'ntlm', label: 'NTLM (Windows)' },
    { value: 'ntlmv1', label: 'NTLMv1' },
    { value: 'ntlmv2', label: 'NTLMv2' },
    { value: 'lm', label: 'LM Hash (Windows)' },
    { value: 'mscache_v1', label: 'MS Cache v1 (DCC)' },
    { value: 'mscache_v2', label: 'MS Cache v2 (DCC2)' },
    { value: 'netntlm_v1', label: 'NetNTLMv1' },
    { value: 'netntlm_v2', label: 'NetNTLMv2' },
    
    // Database Hashes
    { value: 'mysql_old', label: 'MySQL OLD_PASSWORD' },
    { value: 'mysql', label: 'MySQL PASSWORD' },
    { value: 'mysql323', label: 'MySQL 3.2.3' },
    { value: 'mysql41', label: 'MySQL 4.1+' },
    { value: 'postgres_md5', label: 'PostgreSQL MD5' },
    { value: 'mssql2000', label: 'MS SQL Server 2000' },
    { value: 'mssql2005', label: 'MS SQL Server 2005' },
    { value: 'mssql2012', label: 'MS SQL Server 2012+' },
    { value: 'oracle_11g', label: 'Oracle 11g' },
    { value: 'oracle_12c', label: 'Oracle 12c' },
    { value: 'sybase_ase', label: 'Sybase ASE' },
    
    // Modern Password Hashing
    { value: 'bcrypt', label: 'bcrypt' },
    { value: 'scrypt', label: 'scrypt' },
    { value: 'argon2i', label: 'Argon2i' },
    { value: 'argon2d', label: 'Argon2d' },
    { value: 'argon2id', label: 'Argon2id' },
    { value: 'pbkdf2_sha1', label: 'PBKDF2-SHA1' },
    { value: 'pbkdf2_sha256', label: 'PBKDF2-SHA256' },
    { value: 'pbkdf2_sha512', label: 'PBKDF2-SHA512' },
    { value: 'pbkdf2_md5', label: 'PBKDF2-MD5' },
    
    // Unix/Linux System Hashes
    { value: 'des_crypt', label: 'DES Crypt (Unix)' },
    { value: 'md5_crypt', label: 'MD5 Crypt ($1$)' },
    { value: 'apr1_md5', label: 'Apache APR1 MD5' },
    { value: 'sha256_crypt', label: 'SHA256 Crypt ($5$)' },
    { value: 'sha512_crypt', label: 'SHA512 Crypt ($6$)' },
    { value: 'sunmd5', label: 'Sun MD5' },
    { value: 'bsdi_crypt', label: 'BSDi Crypt' },
    
    // Network Protocols
    { value: 'wpa', label: 'WPA/WPA2' },
    { value: 'wpa3', label: 'WPA3' },
    { value: 'wep', label: 'WEP' },
    { value: 'kerberos_5_tgs_rep_23', label: 'Kerberos 5 TGS-REP etype 23' },
    { value: 'kerberos_5_as_req_23', label: 'Kerberos 5 AS-REQ etype 23' },
    { value: 'kerberos_5_as_rep_18', label: 'Kerberos 5 AS-REP etype 18' },
    { value: 'snmp', label: 'SNMP' },
    { value: 'ikepsk_md5', label: 'IKE-PSK MD5' },
    { value: 'ikepsk_sha1', label: 'IKE-PSK SHA1' },
    
    // Web Applications
    { value: 'wordpress', label: 'WordPress' },
    { value: 'drupal7', label: 'Drupal 7' },
    { value: 'joomla', label: 'Joomla' },
    { value: 'phpass', label: 'phpass' },
    { value: 'django_sha1', label: 'Django SHA1' },
    { value: 'django_pbkdf2_sha1', label: 'Django PBKDF2 SHA1' },
    { value: 'django_pbkdf2_sha256', label: 'Django PBKDF2 SHA256' },
    
    // Cisco Network Equipment
    { value: 'cisco_pix_md5', label: 'Cisco PIX MD5' },
    { value: 'cisco_asa_md5', label: 'Cisco ASA MD5' },
    { value: 'cisco_ios_pbkdf2', label: 'Cisco IOS PBKDF2' },
    { value: 'cisco_ios_scrypt', label: 'Cisco IOS scrypt' },
    { value: 'cisco_type7', label: 'Cisco Type 7' },
    
    // Archive/Encryption
    { value: 'zip_traditional', label: 'ZIP Traditional' },
    { value: 'zip_winzip_aes', label: 'ZIP WinZip AES' },
    { value: 'rar3', label: 'RAR3-hp' },
    { value: 'rar5', label: 'RAR5' },
    { value: '7zip', label: '7-Zip' },
    { value: 'pdf_1_1_to_1_3', label: 'PDF 1.1-1.3' },
    { value: 'pdf_1_4_to_1_6', label: 'PDF 1.4-1.6' },
    { value: 'pdf_1_7_level3', label: 'PDF 1.7 Level 3' },
    
    // Mobile/Device
    { value: 'android_pin', label: 'Android PIN' },
    { value: 'android_pattern', label: 'Android Pattern' },
    { value: 'android_fde', label: 'Android FDE' },
    { value: 'ios_passcode', label: 'iOS Passcode' },
    { value: 'blackberry_es10', label: 'BlackBerry ES10' },
    
    // Cloud/Enterprise
    { value: 'office_2007', label: 'MS Office 2007' },
    { value: 'office_2010', label: 'MS Office 2010' },
    { value: 'office_2013', label: 'MS Office 2013' },
    { value: 'office_2016', label: 'MS Office 2016' },
    { value: 'keepass', label: 'KeePass' },
    { value: 'lastpass', label: 'LastPass' },
    { value: '1password4', label: '1Password 4' },
    { value: '1password7', label: '1Password 7' },
    { value: 'bitwarden', label: 'Bitwarden' },
    
    // Cryptocurrency
    { value: 'bitcoin_wallet', label: 'Bitcoin Wallet' },
    { value: 'ethereum_wallet', label: 'Ethereum Wallet' },
    { value: 'electrum_wallet', label: 'Electrum Wallet' },
    
    // Legacy/Specialized
    { value: 'lanman', label: 'LAN Manager' },
    { value: 'halfLM', label: 'Half LM' },
    { value: 'skip32', label: 'Skip32' },
    { value: 'fortigate', label: 'FortiGate' },
    { value: 'juniper_netscreen', label: 'Juniper NetScreen' },
    { value: 'juniper_ssg140', label: 'Juniper SSG140' },
    { value: 'telegram_mobile', label: 'Telegram Mobile' },
    { value: 'signal', label: 'Signal' }
  ];

  // Filter hash types based on search
  const filteredHashTypes = hashTypes.filter(type =>
    type.label.toLowerCase().includes(hashTypeSearch.toLowerCase()) ||
    type.value.toLowerCase().includes(hashTypeSearch.toLowerCase())
  );

  const selectedHashType = hashTypes.find(type => type.value === hashType);

  const selectHashType = (value) => {
    setHashType(value);
    setHashTypeDropdownOpen(false);
    setHashTypeSearch('');
  };

  const defaultRules = `# Common Hashcat Rules
:
l
u
c
C
t
r
d
$0
$1
$2
$3
$4
$5
$6
$7
$8
$9
$!
$@
$#
$$
$%
$^
$&
$*
^0
^1
^2
^3
^4
^5
^6
^7
^8
^9
^!
^@
^#
^$
^%
^^
^&
^*`;

  useEffect(() => {
    if (!rules) {
      setRules(defaultRules);
      hashCracker.loadRules(defaultRules);
    }
  }, []);

  return (
    <div className="hash-cracker-container">
      <div className="hash-cracker-header">
        <div className="hash-cracker-title">
          <h2>Hash Cracker</h2>
          <p className="hash-cracker-description">
            Hash cracking with GPU acceleration and Hashcat rules. All processing happens locally in your browser.
          </p>
        </div>
        <div className="hash-cracker-gpu-info">
          {gpuSupported && <span className="gpu-badge">⚡ GPU Accelerated</span>}
          {gpuInfo && (
            <div className="gpu-details" title={`GPU: ${gpuInfo.description}\nVendor: ${gpuInfo.vendor}`}>
              <small>🚀 {gpuInfo.vendor} GPU</small>
            </div>
          )}
        </div>
      </div>

      <div className="hash-cracker-main">
        <div className="hash-cracker-left">
          <div className="hash-input-section">
            <h3>Target Hash</h3>
            <textarea
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Enter the hash you want to crack..."
              rows={4}
              className="hash-input-textarea"
            />
          </div>

          <div className="hash-type-section">
            <h3>Hash Type</h3>
            <div className="hash-type-dropdown">
              <div 
                className="hash-type-selected"
                onClick={() => setHashTypeDropdownOpen(!hashTypeDropdownOpen)}
              >
                <span>{selectedHashType?.label || 'Select hash type...'}</span>
                <ChevronDown size={16} />
              </div>
              
              {hashTypeDropdownOpen && (
                <div className="hash-type-dropdown-menu">
                  <div className="hash-type-search">
                    <Search size={14} />
                    <input
                      type="text"
                      placeholder="Search hash types..."
                      value={hashTypeSearch}
                      onChange={(e) => setHashTypeSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="hash-type-options">
                    {filteredHashTypes.slice(0, 50).map(type => (
                      <div
                        key={type.value}
                        className={`hash-type-option ${type.value === hashType ? 'selected' : ''}`}
                        onClick={() => selectHashType(type.value)}
                      >
                        {type.label}
                        <small className="hash-type-value">{type.value}</small>
                      </div>
                    ))}
                    {filteredHashTypes.length > 50 && (
                      <div className="hash-type-option disabled">
                        ... and {filteredHashTypes.length - 50} more. Keep typing to narrow down.
                      </div>
                    )}
                    {filteredHashTypes.length === 0 && (
                      <div className="hash-type-option disabled">
                        No hash types found matching "{hashTypeSearch}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hash-controls-section">
            <h3>Attack Configuration</h3>
            <div className="attack-controls">
              {crackingStatus === 'running' ? (
                <button onClick={stopCracking} className="hash-stop-button">
                  <Square size={16} />
                  Stop Cracking
                </button>
              ) : (
                <button 
                  onClick={startCracking} 
                  className="hash-start-button"
                  disabled={!hashInput || !selectedWordlist}
                >
                  <Play size={16} />
                  Start Cracking
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="hash-cracker-right">
          <div className="wordlist-section">
            <h3>Wordlist</h3>
            <div className="wordlist-controls">
              <input
                type="file"
                id="wordlist-upload"
                accept=".txt,.lst,.dict"
                onChange={handleWordlistUpload}
                style={{display: 'none'}}
              />
              <label htmlFor="wordlist-upload" className="upload-button">
                <Upload size={16} />
                Upload Wordlist
              </label>
            </div>
            
            {wordlists.length > 0 && (
              <select 
                value={selectedWordlist} 
                onChange={(e) => setSelectedWordlist(e.target.value)}
                className="wordlist-select"
              >
                <option value="">Select wordlist...</option>
                {wordlists.map(wl => (
                  <option key={wl.name} value={wl.name}>
                    {wl.name} ({wl.count.toLocaleString()} words)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="rules-section">
            <h3>Hashcat Rules</h3>
            <div className="rules-controls">
              <input
                type="file"
                id="rules-upload"
                accept=".rule,.rules,.txt"
                onChange={handleRulesUpload}
                style={{display: 'none'}}
              />
              <label htmlFor="rules-upload" className="upload-button">
                <FileText size={16} />
                Upload Rules
              </label>
            </div>
            
            <textarea
              value={rules}
              onChange={(e) => {
                setRules(e.target.value);
                hashCracker.loadRules(e.target.value);
              }}
              placeholder="Enter Hashcat-compatible rules..."
              rows={10}
              className="rules-textarea"
            />
          </div>
        </div>
      </div>

      {crackingStatus === 'running' && (
        <div className="hash-status-panel">
          <div className="hash-status-content">
            <div className="hash-status-indicator">
              <div className="hash-status-spinner"></div>
              <span>Cracking in progress...</span>
            </div>
            <div className="hash-status-details">
              <span>Method: {gpuSupported && hashType === 'ntlm' ? 'GPU Accelerated' : 'CPU'}</span>
              <span>Hash Type: {selectedHashType?.label}</span>
            </div>
          </div>
        </div>
      )}

      {results && (
        <div className="hash-results-panel">
          <h3>Results</h3>
          {results.found ? (
            <div className="hash-results-success">
              <div className="hash-result-main">
                <div className="hash-result-icon">✅</div>
                <div className="hash-result-info">
                  <div className="hash-result-password">
                    <strong>Password Found:</strong> 
                    <code className="hash-result-code">{results.password}</code>
                  </div>
                  <div className="hash-result-stats">
                    <span>Time: {(results.timeMs / 1000).toFixed(2)}s</span>
                    <span>Tested: {results.tested.toLocaleString()} passwords</span>
                    <span>Method: {results.method || (gpuSupported ? 'GPU' : 'CPU')}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="hash-results-failure">
              <div className="hash-result-main">
                <div className="hash-result-icon">❌</div>
                <div className="hash-result-info">
                  <div className="hash-result-password">
                    <strong>Password not found</strong>
                  </div>
                  <div className="hash-result-stats">
                    <span>Time: {(results.timeMs / 1000).toFixed(2)}s</span>
                    <span>Tested: {results.tested.toLocaleString()} passwords</span>
                    <span>Method: {results.method || (gpuSupported ? 'GPU' : 'CPU')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HashCracker;