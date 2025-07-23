// Unix timestamp conversion, date parsing, timezone conversion, etc.

// Unix timestamp to human readable
export function fromUnixTimestamp(timestamp, unit = 'seconds') {
  try {
    let ms;
    switch (unit.toLowerCase()) {
      case 'seconds':
        ms = parseInt(timestamp) * 1000;
        break;
      case 'milliseconds':
        ms = parseInt(timestamp);
        break;
      case 'microseconds':
        ms = parseInt(timestamp) / 1000;
        break;  
      case 'nanoseconds':
        ms = parseInt(timestamp) / 1000000;
        break;
      default:
        throw new Error('Invalid unit. Use: seconds, milliseconds, microseconds, nanoseconds');
    }
    
    const date = new Date(ms);
    
    return {
      timestamp: timestamp,
      unit: unit,
      date: date.toISOString(),
      utc: date.toUTCString(),
      local: date.toString(),
      epoch: date.getTime(),
      readable: {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
        millisecond: date.getMilliseconds(),
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
        monthName: date.toLocaleDateString('en-US', { month: 'long' })
      }
    };
  } catch (error) {
    return { error: `Invalid timestamp: ${error.message}` };
  }
}

// Human readable to Unix timestamp
export function toUnixTimestamp(dateString, outputUnit = 'seconds') {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date string');
    }
    
    let result;
    const ms = date.getTime();
    
    switch (outputUnit.toLowerCase()) {
      case 'seconds':
        result = Math.floor(ms / 1000);
        break;
      case 'milliseconds':
        result = ms;
        break;
      case 'microseconds':
        result = ms * 1000;
        break;
      case 'nanoseconds':
        result = ms * 1000000;
        break;
      default:
        throw new Error('Invalid unit. Use: seconds, milliseconds, microseconds, nanoseconds');
    }
    
    return {
      input: dateString,
      parsed: date.toISOString(),
      timestamp: result,
      unit: outputUnit
    };
  } catch (error) {
    return { error: `Invalid date: ${error.message}` };
  }
}

// Windows FILETIME to Unix timestamp
export function fromWindowsFiletime(filetime) {
  try {
    // Windows FILETIME is 100-nanosecond intervals since January 1, 1601
    const windowsEpoch = new Date('1601-01-01T00:00:00Z').getTime();
    const unixEpoch = new Date('1970-01-01T00:00:00Z').getTime();
    const epochDiff = unixEpoch - windowsEpoch;
    
    const filetimeMs = parseInt(filetime) / 10000; // Convert to milliseconds
    const unixMs = filetimeMs - epochDiff;
    
    const date = new Date(unixMs);
    
    return {
      filetime: filetime,
      unixTimestamp: Math.floor(unixMs / 1000),
      date: date.toISOString(),
      readable: date.toString()
    };
  } catch (error) {
    return { error: `Invalid FILETIME: ${error.message}` };
  }
}

// Unix timestamp to Windows FILETIME
export function toWindowsFiletime(timestamp, unit = 'seconds') {
  try {
    let ms;
    switch (unit.toLowerCase()) {
      case 'seconds':
        ms = parseInt(timestamp) * 1000;
        break;
      case 'milliseconds':
        ms = parseInt(timestamp);
        break;
      default:
        throw new Error('Invalid unit. Use: seconds or milliseconds');
    }
    
    const windowsEpoch = new Date('1601-01-01T00:00:00Z').getTime();
    const unixEpoch = new Date('1970-01-01T00:00:00Z').getTime();
    const epochDiff = unixEpoch - windowsEpoch;
    
    const filetimeMs = ms + epochDiff;
    const filetime = filetimeMs * 10000; // Convert to 100-nanosecond intervals
    
    return {
      timestamp: timestamp,
      unit: unit,
      filetime: filetime.toString(),
      date: new Date(ms).toISOString()
    };
  } catch (error) {
    return { error: `Invalid timestamp: ${error.message}` };
  }
}

// Parse various date formats
export function parseDateFormats(input) {
  const formats = [
    // ISO formats
    { name: 'ISO 8601', regex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?$/ },
    { name: 'ISO Date', regex: /^\d{4}-\d{2}-\d{2}$/ },
    
    // US formats
    { name: 'US Date', regex: /^\d{1,2}\/\d{1,2}\/\d{4}$/ },
    { name: 'US DateTime', regex: /^\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2}:\d{2}( [AP]M)?$/ },
    
    // European formats
    { name: 'European Date', regex: /^\d{1,2}\.\d{1,2}\.\d{4}$/ },
    { name: 'UK Date', regex: /^\d{1,2}\/\d{1,2}\/\d{4}$/ },
    
    // RFC formats
    { name: 'RFC 2822', regex: /^[A-Za-z]{3}, \d{1,2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2}/ },
    
    // Unix timestamp
    { name: 'Unix Timestamp (seconds)', regex: /^\d{10}$/ },
    { name: 'Unix Timestamp (milliseconds)', regex: /^\d{13}$/ },
    
    // Other formats
    { name: 'Verbose', regex: /^[A-Za-z]+ \d{1,2}, \d{4}/ }
  ];
  
  const matches = [];
  const trimmed = input.trim();
  
  for (const format of formats) {
    if (format.regex.test(trimmed)) {
      try {
        let date;
        if (format.name.includes('Unix Timestamp')) {
          const unit = format.name.includes('milliseconds') ? 'milliseconds' : 'seconds';
          const result = fromUnixTimestamp(trimmed, unit);
          if (!result.error) {
            date = new Date(result.epoch);
          }
        } else {
          date = new Date(trimmed);
        }
        
        if (date && !isNaN(date.getTime())) {
          matches.push({
            format: format.name,
            parsed: date.toISOString(),
            timestamp: Math.floor(date.getTime() / 1000),
            readable: date.toString()
          });
        }
      } catch (error) {
        // Skip invalid formats
      }
    }
  }
  
  return {
    input: trimmed,
    possibleFormats: matches.length > 0 ? matches : [{ format: 'Unknown', error: 'Could not parse date' }]
  };
}

// Sleep/delay calculation
export function calculateDuration(start, end, unit = 'auto') {
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format');
    }
    
    const diffMs = Math.abs(endDate.getTime() - startDate.getTime());
    
    const units = {
      milliseconds: diffMs,
      seconds: diffMs / 1000,
      minutes: diffMs / (1000 * 60),
      hours: diffMs / (1000 * 60 * 60),
      days: diffMs / (1000 * 60 * 60 * 24),
      weeks: diffMs / (1000 * 60 * 60 * 24 * 7),
      months: diffMs / (1000 * 60 * 60 * 24 * 30.44), // Average month
      years: diffMs / (1000 * 60 * 60 * 24 * 365.25)  // Account for leap years
    };
    
    // Human readable breakdown
    const breakdown = {};
    let remaining = diffMs;
    
    const divisions = [
      { name: 'years', ms: 1000 * 60 * 60 * 24 * 365.25 },
      { name: 'months', ms: 1000 * 60 * 60 * 24 * 30.44 },
      { name: 'weeks', ms: 1000 * 60 * 60 * 24 * 7 },
      { name: 'days', ms: 1000 * 60 * 60 * 24 },
      { name: 'hours', ms: 1000 * 60 * 60 },
      { name: 'minutes', ms: 1000 * 60 },
      { name: 'seconds', ms: 1000 }
    ];
    
    for (const div of divisions) {
      const count = Math.floor(remaining / div.ms);
      if (count > 0) {
        breakdown[div.name] = count;
        remaining -= count * div.ms;
      }
    }
    
    if (remaining > 0) {
      breakdown.milliseconds = remaining;
    }
    
    return {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      duration: units,
      breakdown: breakdown,
      humanReadable: Object.entries(breakdown)
        .map(([unit, value]) => `${value} ${unit}`)
        .join(', ')
    };
  } catch (error) {
    return { error: `Duration calculation failed: ${error.message}` };
  }
}

// Generate timestamps for testing
export function generateTimestamps(count = 10, startDate = null, endDate = null) {
  const start = startDate ? new Date(startDate) : new Date('2020-01-01');
  const end = endDate ? new Date(endDate) : new Date();
  
  const range = end.getTime() - start.getTime();
  const timestamps = [];
  
  for (let i = 0; i < count; i++) {
    const randomTime = start.getTime() + Math.random() * range;
    const date = new Date(randomTime);
    
    timestamps.push({
      index: i + 1,
      timestamp: Math.floor(randomTime / 1000),
      timestampMs: randomTime,
      iso: date.toISOString(),
      readable: date.toString(),
      filetime: toWindowsFiletime(Math.floor(randomTime / 1000)).filetime
    });
  }
  
  return {
    count: count,
    range: { start: start.toISOString(), end: end.toISOString() },
    timestamps: timestamps.sort((a, b) => a.timestamp - b.timestamp)
  };
}

// Export all datetime functions
export const datetime = {
  fromUnixTimestamp,
  toUnixTimestamp,
  fromWindowsFiletime,
  toWindowsFiletime,
  parseDateFormats,
  calculateDuration,
  generateTimestamps
};