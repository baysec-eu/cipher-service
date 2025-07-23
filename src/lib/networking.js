// Networking operations inspired by CyberChef
// IP address manipulation, DNS lookups, port analysis, etc.

// Parse IP address and provide details
export function parseIPAddress(ip) {
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  const ipv6CompressedRegex = /^(([0-9a-fA-F]{1,4}:)*)?::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;
  
  const trimmed = ip.trim();
  
  // IPv4 Analysis
  if (ipv4Regex.test(trimmed)) {
    const octets = trimmed.split('.').map(n => parseInt(n));
    
    // Validate octets
    if (octets.some(octet => octet > 255)) {
      return { error: 'Invalid IPv4 address - octet out of range' };
    }
    
    const binaryOctets = octets.map(octet => octet.toString(2).padStart(8, '0'));
    const hexOctets = octets.map(octet => octet.toString(16).padStart(2, '0').toUpperCase());
    
    // Calculate network information
    const privateRanges = [
      { range: '10.0.0.0/8', start: [10, 0, 0, 0], end: [10, 255, 255, 255] },
      { range: '172.16.0.0/12', start: [172, 16, 0, 0], end: [172, 31, 255, 255] },
      { range: '192.168.0.0/16', start: [192, 168, 0, 0], end: [192, 168, 255, 255] }
    ];
    
    const isPrivate = privateRanges.some(range => 
      octets.every((octet, i) => octet >= range.start[i] && octet <= range.end[i])
    );
    
    const isLoopback = octets[0] === 127;
    const isMulticast = octets[0] >= 224 && octets[0] <= 239;
    const isBroadcast = octets.every(octet => octet === 255);
    
    return {
      type: 'IPv4',
      address: trimmed,
      octets: {
        decimal: octets,
        binary: binaryOctets,
        hex: hexOctets
      },
      binaryRepresentation: binaryOctets.join('.'),
      hexRepresentation: hexOctets.join('.'),
      integer: (octets[0] << 24) + (octets[1] << 16) + (octets[2] << 8) + octets[3],
      classification: {
        isPrivate: isPrivate,
        isLoopback: isLoopback,
        isMulticast: isMulticast,
        isBroadcast: isBroadcast,
        isPublic: !isPrivate && !isLoopback && !isMulticast && !isBroadcast
      }
    };
  }
  
  // IPv6 Analysis (basic)
  if (ipv6Regex.test(trimmed) || ipv6CompressedRegex.test(trimmed)) {
    const expanded = expandIPv6(trimmed);
    const groups = expanded.split(':');
    
    return {
      type: 'IPv6',
      address: trimmed,
      expanded: expanded,
      groups: groups,
      isLoopback: trimmed === '::1',
      isLinkLocal: trimmed.startsWith('fe80::'),
      isMulticast: trimmed.startsWith('ff')
    };
  }
  
  return { error: 'Invalid IP address format' };
}

// CIDR to IP range
export function cidrToRange(cidr) {
  try {
    const [ip, prefixLength] = cidr.split('/');
    const prefix = parseInt(prefixLength);
    
    if (!ip || isNaN(prefix) || prefix < 0 || prefix > 32) {
      throw new Error('Invalid CIDR notation');
    }
    
    const ipParts = ip.split('.').map(n => parseInt(n));
    if (ipParts.some(part => part > 255)) {
      throw new Error('Invalid IP address in CIDR');
    }
    
    // Convert IP to 32-bit integer
    const ipInt = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
    
    // Calculate network and broadcast addresses
    const mask = (-1 << (32 - prefix)) >>> 0;
    const network = (ipInt & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    
    // Convert back to dotted decimal
    const networkIP = [
      (network >>> 24) & 255,
      (network >>> 16) & 255,
      (network >>> 8) & 255,
      network & 255
    ].join('.');
    
    const broadcastIP = [
      (broadcast >>> 24) & 255,
      (broadcast >>> 16) & 255,
      (broadcast >>> 8) & 255,
      broadcast & 255
    ].join('.');
    
    const subnetMask = [
      (mask >>> 24) & 255,
      (mask >>> 16) & 255,
      (mask >>> 8) & 255,
      mask & 255
    ].join('.');
    
    const totalHosts = Math.pow(2, 32 - prefix);
    const usableHosts = Math.max(0, totalHosts - 2); // Subtract network and broadcast
    
    return {
      cidr: cidr,
      networkAddress: networkIP,
      broadcastAddress: broadcastIP,
      subnetMask: subnetMask,
      prefixLength: prefix,
      totalAddresses: totalHosts,
      usableHosts: usableHosts,
      firstUsable: prefix === 32 ? networkIP : incrementIP(networkIP),
      lastUsable: prefix === 32 ? networkIP : decrementIP(broadcastIP)
    };
  } catch (error) {
    return { error: `CIDR parsing failed: ${error.message}` };
  }
}

// Parse User-Agent string
export function parseUserAgent(userAgent) {
  const ua = userAgent.trim();
  
  // Browser detection patterns
  const browsers = [
    { name: 'Chrome', pattern: /Chrome\/(\d+\.\d+)/ },
    { name: 'Firefox', pattern: /Firefox\/(\d+\.\d+)/ },
    { name: 'Safari', pattern: /Safari\/(\d+\.\d+)/ },
    { name: 'Edge', pattern: /Edge\/(\d+\.\d+)/ },
    { name: 'Internet Explorer', pattern: /MSIE (\d+\.\d+)|Trident.*rv:(\d+\.\d+)/ },
    { name: 'Opera', pattern: /Opera\/(\d+\.\d+)|OPR\/(\d+\.\d+)/ }
  ];
  
  // OS detection patterns
  const operatingSystems = [
    { name: 'Windows 11', pattern: /Windows NT 10\.0.*Win64.*x64/ },
    { name: 'Windows 10', pattern: /Windows NT 10\.0/ },
    { name: 'Windows 8.1', pattern: /Windows NT 6\.3/ },
    { name: 'Windows 8', pattern: /Windows NT 6\.2/ },
    { name: 'Windows 7', pattern: /Windows NT 6\.1/ },
    { name: 'macOS', pattern: /Mac OS X (\d+_\d+_\d+)/ },
    { name: 'iOS', pattern: /iPhone OS (\d+_\d+)/ },
    { name: 'Android', pattern: /Android (\d+\.\d+)/ },
    { name: 'Linux', pattern: /Linux/ },
    { name: 'Ubuntu', pattern: /Ubuntu/ }
  ];
  
  // Device detection
  const devices = [
    { name: 'iPhone', pattern: /iPhone/ },
    { name: 'iPad', pattern: /iPad/ },
    { name: 'Android Phone', pattern: /Android.*Mobile/ },
    { name: 'Android Tablet', pattern: /Android(?!.*Mobile)/ }
  ];
  
  let detectedBrowser = 'Unknown';
  let browserVersion = 'Unknown';
  
  for (const browser of browsers) {
    const match = ua.match(browser.pattern);
    if (match) {
      detectedBrowser = browser.name;
      browserVersion = match[1] || match[2] || 'Unknown';
      break;
    }
  }
  
  let detectedOS = 'Unknown';
  let osVersion = 'Unknown';
  
  for (const os of operatingSystems) {
    const match = ua.match(os.pattern);
    if (match) {
      detectedOS = os.name;
      osVersion = match[1] ? match[1].replace(/_/g, '.') : 'Unknown';
      break;
    }
  }
  
  let detectedDevice = 'Desktop';
  for (const device of devices) {
    if (device.pattern.test(ua)) {
      detectedDevice = device.name;
      break;
    }
  }
  
  const isMobile = /Mobile|Android|iPhone|iPad/.test(ua);
  const isBot = /bot|crawler|spider|crawling/i.test(ua);
  
  return {
    original: ua,
    browser: {
      name: detectedBrowser,
      version: browserVersion
    },
    operatingSystem: {
      name: detectedOS,
      version: osVersion
    },
    device: {
      type: detectedDevice,
      isMobile: isMobile
    },
    flags: {
      isBot: isBot,
      isMobile: isMobile
    },
    components: {
      webkit: /WebKit\/(\d+\.\d+)/.test(ua),
      gecko: /Gecko\/\d+/.test(ua),
      trident: /Trident\/(\d+\.\d+)/.test(ua)
    }
  };
}

// Generate network ranges
export function generateIPRange(startIP, endIP) {
  try {
    const startParts = startIP.split('.').map(n => parseInt(n));
    const endParts = endIP.split('.').map(n => parseInt(n));
    
    if (startParts.some(p => p > 255) || endParts.some(p => p > 255)) {
      throw new Error('Invalid IP address');
    }
    
    const startInt = (startParts[0] << 24) + (startParts[1] << 16) + (startParts[2] << 8) + startParts[3];
    const endInt = (endParts[0] << 24) + (endParts[1] << 16) + (endParts[2] << 8) + endParts[3];
    
    if (startInt > endInt) {
      throw new Error('Start IP must be less than or equal to end IP');
    }
    
    const totalIPs = endInt - startInt + 1;
    if (totalIPs > 1000) {
      return {
        startIP,
        endIP,
        totalIPs,
        error: 'Range too large (>1000 IPs). Only showing summary.',
        summary: {
          firstFive: generateIPsFromInt(startInt, Math.min(5, totalIPs)),
          lastFive: totalIPs > 5 ? generateIPsFromInt(endInt - 4, 5) : []
        }
      };
    }
    
    const ips = generateIPsFromInt(startInt, totalIPs);
    
    return {
      startIP,
      endIP,
      totalIPs,
      addresses: ips
    };
  } catch (error) {
    return { error: `IP range generation failed: ${error.message}` };
  }
}

// Helper functions
function expandIPv6(ipv6) {
  // Basic IPv6 expansion - would need more complete implementation for production
  if (ipv6.includes('::')) {
    const parts = ipv6.split('::');
    const leftParts = parts[0] ? parts[0].split(':') : [];
    const rightParts = parts[1] ? parts[1].split(':') : [];
    const missingGroups = 8 - leftParts.length - rightParts.length;
    
    const middle = Array(missingGroups).fill('0000');
    const expanded = [...leftParts, ...middle, ...rightParts]
      .map(group => group.padStart(4, '0'))
      .join(':');
    
    return expanded;
  }
  
  return ipv6.split(':').map(group => group.padStart(4, '0')).join(':');
}

function incrementIP(ip) {
  const parts = ip.split('.').map(n => parseInt(n));
  const ipInt = (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
  const incremented = ipInt + 1;
  
  return [
    (incremented >>> 24) & 255,
    (incremented >>> 16) & 255,
    (incremented >>> 8) & 255,
    incremented & 255
  ].join('.');
}

function decrementIP(ip) {
  const parts = ip.split('.').map(n => parseInt(n));
  const ipInt = (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
  const decremented = ipInt - 1;
  
  return [
    (decremented >>> 24) & 255,
    (decremented >>> 16) & 255,
    (decremented >>> 8) & 255,
    decremented & 255
  ].join('.');
}

function generateIPsFromInt(startInt, count) {
  const ips = [];
  for (let i = 0; i < count; i++) {
    const ipInt = startInt + i;
    const ip = [
      (ipInt >>> 24) & 255,
      (ipInt >>> 16) & 255,
      (ipInt >>> 8) & 255,
      ipInt & 255
    ].join('.');
    ips.push(ip);
  }
  return ips;
}

// Port scanner simulation (for educational purposes)
export function analyzePort(port) {
  const commonPorts = {
    20: { service: 'FTP Data', protocol: 'TCP', description: 'File Transfer Protocol - Data Transfer' },
    21: { service: 'FTP Control', protocol: 'TCP', description: 'File Transfer Protocol - Control' },
    22: { service: 'SSH', protocol: 'TCP', description: 'Secure Shell' },
    23: { service: 'Telnet', protocol: 'TCP', description: 'Telnet Protocol' },
    25: { service: 'SMTP', protocol: 'TCP', description: 'Simple Mail Transfer Protocol' },
    53: { service: 'DNS', protocol: 'TCP/UDP', description: 'Domain Name System' },
    80: { service: 'HTTP', protocol: 'TCP', description: 'HyperText Transfer Protocol' },
    110: { service: 'POP3', protocol: 'TCP', description: 'Post Office Protocol v3' },
    143: { service: 'IMAP', protocol: 'TCP', description: 'Internet Message Access Protocol' },
    443: { service: 'HTTPS', protocol: 'TCP', description: 'HTTP over SSL/TLS' },
    993: { service: 'IMAPS', protocol: 'TCP', description: 'IMAP over SSL' },
    995: { service: 'POP3S', protocol: 'TCP', description: 'POP3 over SSL' },
    3389: { service: 'RDP', protocol: 'TCP', description: 'Remote Desktop Protocol' },
    5432: { service: 'PostgreSQL', protocol: 'TCP', description: 'PostgreSQL Database' },
    3306: { service: 'MySQL', protocol: 'TCP', description: 'MySQL Database' },
    1433: { service: 'MSSQL', protocol: 'TCP', description: 'Microsoft SQL Server' },
    27017: { service: 'MongoDB', protocol: 'TCP', description: 'MongoDB Database' }
  };
  
  const portNum = parseInt(port);
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    return { error: 'Invalid port number. Must be between 1 and 65535.' };
  }
  
  const portInfo = commonPorts[portNum];
  
  return {
    port: portNum,
    range: portNum < 1024 ? 'Well-known ports (0-1023)' :
           portNum < 49152 ? 'Registered ports (1024-49151)' :
           'Dynamic/Private ports (49152-65535)',
    isWellKnown: portNum < 1024,
    service: portInfo ? portInfo.service : 'Unknown/Custom',
    protocol: portInfo ? portInfo.protocol : 'Unknown',
    description: portInfo ? portInfo.description : 'Custom or unknown service'
  };
}

// Export all networking functions
export const networking = {
  parseIPAddress,
  cidrToRange,
  parseUserAgent,
  generateIPRange,
  analyzePort
};