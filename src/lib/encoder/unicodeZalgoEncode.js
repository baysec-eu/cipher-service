export function unicodeZalgoEncode(s, { 
  intensity = 3, 
  upwards = true, 
  downwards = true, 
  middle = true, 
  craziness = 'normal' 
} = {}) {
  const combiningUp = [
    '\u030D', '\u030E', '\u0304', '\u0305', '\u033F', '\u0311', '\u0306', '\u0310',
    '\u0352', '\u0357', '\u0351', '\u0307', '\u0308', '\u030A', '\u0342', '\u0343',
    '\u0344', '\u034A', '\u034B', '\u034C', '\u0303', '\u0302', '\u030C', '\u0350',
    '\u0300', '\u0301', '\u030B', '\u030F', '\u0312', '\u0313', '\u0314', '\u033D',
    '\u0309', '\u0363', '\u0364', '\u0365', '\u0366', '\u0367', '\u0368', '\u0369',
    '\u036A', '\u036B', '\u036C', '\u036D', '\u036E', '\u036F', '\u033E', '\u035B'
  ];
  
  const combiningDown = [
    '\u0316', '\u0317', '\u0318', '\u0319', '\u031C', '\u031D', '\u031E', '\u031F',
    '\u0320', '\u0324', '\u0325', '\u0326', '\u0329', '\u032A', '\u032B', '\u032C',
    '\u032D', '\u032E', '\u032F', '\u0330', '\u0331', '\u0332', '\u0333', '\u0339',
    '\u033A', '\u033B', '\u033C', '\u0345', '\u0347', '\u0348', '\u0349', '\u034D',
    '\u034E', '\u0353', '\u0354', '\u0355', '\u0356', '\u0359', '\u035A', '\u0323'
  ];
  
  const combiningMiddle = [
    '\u0315', '\u031B', '\u0340', '\u0341', '\u0358', '\u0321', '\u0322', '\u0327',
    '\u0328', '\u0334', '\u0335', '\u0336', '\u0337', '\u0338', '\u034F', '\u035C',
    '\u035D', '\u035E', '\u035F', '\u0360', '\u0362', '\u0338', '\u0337', '\u0336',
    '\u0335', '\u0334', '\u0333', '\u0332', '\u0331', '\u0330'
  ];
  
  // Extra crazy combining characters for maximum chaos
  const combiningExtreme = [
    '\u0370', '\u0371', '\u0372', '\u0373', '\u0374', '\u0375', '\u0376', '\u0377',
    '\u037A', '\u037E', '\u0384', '\u0385', '\u0387', '\u0590', '\u0591', '\u0592',
    '\u0593', '\u0594', '\u0595', '\u0596', '\u0597', '\u0598', '\u0599', '\u059A',
    '\u059B', '\u059C', '\u059D', '\u059E', '\u059F', '\u05A0', '\u05A1', '\u05A2',
    '\u20D0', '\u20D1', '\u20D2', '\u20D3', '\u20D4', '\u20D5', '\u20D6', '\u20D7',
    '\u20D8', '\u20D9', '\u20DA', '\u20DB', '\u20DC', '\u20DD', '\u20DE', '\u20DF',
    '\u20E0', '\u20E1', '\u20E2', '\u20E3', '\u20E4', '\u20E5', '\u20E6', '\u20E7'
  ];
  
  // Determine actual intensity based on craziness level
  let actualIntensity = intensity;
  let useExtreme = false;
  
  switch (craziness) {
    case 'mild':
      actualIntensity = Math.max(1, Math.floor(intensity * 0.5));
      break;
    case 'normal':
      actualIntensity = intensity;
      break;
    case 'insane':
      actualIntensity = Math.floor(intensity * 1.5);
      useExtreme = true;
      break;
    case 'nightmare':
      actualIntensity = intensity * 2;
      useExtreme = true;
      break;
    case 'apocalypse':
      actualIntensity = intensity * 3;
      useExtreme = true;
      break;
  }
  
  return Array.from(s).map(c => {
    const numMarks = Math.floor(Math.random() * actualIntensity) + 1;
    let result = c;
    
    for (let i = 0; i < numMarks; i++) {
      const categories = [];
      if (upwards) categories.push(combiningUp);
      if (downwards) categories.push(combiningDown);
      if (middle) categories.push(combiningMiddle);
      if (useExtreme) categories.push(combiningExtreme);
      
      if (categories.length === 0) break;
      
      const category = categories[Math.floor(Math.random() * categories.length)];
      result += category[Math.floor(Math.random() * category.length)];
    }
    return result;
  }).join('');
}