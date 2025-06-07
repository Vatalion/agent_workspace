const fs = require('fs');
const path = require('path');

// Create SVG icon with Flutter + AI theme
const createSVGIcon = () => {
  return `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="flutterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#02569B;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#13B9FD;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4ECDC4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#44A08D;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="brainGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EE5A24;stop-opacity:1" />
    </radialGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="64" cy="64" r="60" fill="url(#flutterGradient)" stroke="#ffffff" stroke-width="2"/>
  
  <!-- Flutter F logo -->
  <path d="M45 25 L85 25 L85 45 L65 45 L65 65 L85 65 L85 85 L45 85 L45 65 L25 65 L25 45 L45 45 Z" 
        fill="#ffffff" opacity="0.9"/>
  
  <!-- AI Neural Network nodes -->
  <circle cx="30" cy="35" r="3" fill="url(#aiGradient)"/>
  <circle cx="98" cy="35" r="3" fill="url(#aiGradient)"/>
  <circle cx="30" cy="93" r="3" fill="url(#aiGradient)"/>
  <circle cx="98" cy="93" r="3" fill="url(#aiGradient)"/>
  <circle cx="20" cy="64" r="3" fill="url(#aiGradient)"/>
  <circle cx="108" cy="64" r="3" fill="url(#aiGradient)"/>
  
  <!-- Neural network connections -->
  <line x1="30" y1="35" x2="98" y2="35" stroke="url(#aiGradient)" stroke-width="1" opacity="0.6"/>
  <line x1="30" y1="93" x2="98" y2="93" stroke="url(#aiGradient)" stroke-width="1" opacity="0.6"/>
  <line x1="20" y1="64" x2="108" y2="64" stroke="url(#aiGradient)" stroke-width="1" opacity="0.6"/>
  <line x1="30" y1="35" x2="20" y2="64" stroke="url(#aiGradient)" stroke-width="1" opacity="0.4"/>
  <line x1="98" y1="35" x2="108" y2="64" stroke="url(#aiGradient)" stroke-width="1" opacity="0.4"/>
  <line x1="30" y1="93" x2="20" y2="64" stroke="url(#aiGradient)" stroke-width="1" opacity="0.4"/>
  <line x1="98" y1="93" x2="108" y2="64" stroke="url(#aiGradient)" stroke-width="1" opacity="0.4"/>
  
  <!-- AI Brain in center -->
  <circle cx="64" cy="64" r="12" fill="url(#brainGradient)" opacity="0.8"/>
  <path d="M58 60 Q64 56 70 60 Q66 64 64 68 Q62 64 58 60" fill="#ffffff" opacity="0.9"/>
  
  <!-- Debug bug symbol -->
  <circle cx="85" cy="25" r="8" fill="#FF6B6B" opacity="0.9"/>
  <path d="M81 21 L89 21 L89 29 L81 29 Z" fill="#ffffff"/>
  <circle cx="83" cy="23" r="1" fill="#FF6B6B"/>
  <circle cx="87" cy="23" r="1" fill="#FF6B6B"/>
  <path d="M83 26 Q85 28 87 26" stroke="#FF6B6B" stroke-width="1" fill="none"/>
  
  <!-- Pulse animation effect -->
  <circle cx="64" cy="64" r="55" fill="none" stroke="url(#aiGradient)" stroke-width="2" opacity="0.3">
    <animate attributeName="r" values="55;65;55" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>
  </circle>
</svg>`;
};

// Create PNG version using Canvas (simplified)
const createPNGIcon = () => {
  // For PNG, we'll create a simpler version without animations
  return `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="flutterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#02569B;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#13B9FD;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4ECDC4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#44A08D;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="brainGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EE5A24;stop-opacity:1" />
    </radialGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="64" cy="64" r="60" fill="url(#flutterGradient)" stroke="#ffffff" stroke-width="3"/>
  
  <!-- Flutter F logo -->
  <path d="M40 20 L88 20 L88 40 L68 40 L68 60 L88 60 L88 80 L68 80 L68 100 L48 100 L48 80 L28 80 L28 60 L48 60 L48 40 L28 40 L28 20 L40 20 Z" 
        fill="#ffffff" opacity="0.95"/>
  
  <!-- AI Neural Network nodes -->
  <circle cx="25" cy="30" r="4" fill="url(#aiGradient)"/>
  <circle cx="103" cy="30" r="4" fill="url(#aiGradient)"/>
  <circle cx="25" cy="98" r="4" fill="url(#aiGradient)"/>
  <circle cx="103" cy="98" r="4" fill="url(#aiGradient)"/>
  <circle cx="15" cy="64" r="4" fill="url(#aiGradient)"/>
  <circle cx="113" cy="64" r="4" fill="url(#aiGradient)"/>
  
  <!-- Neural network connections -->
  <line x1="25" y1="30" x2="103" y2="30" stroke="url(#aiGradient)" stroke-width="2" opacity="0.7"/>
  <line x1="25" y1="98" x2="103" y2="98" stroke="url(#aiGradient)" stroke-width="2" opacity="0.7"/>
  <line x1="15" y1="64" x2="113" y2="64" stroke="url(#aiGradient)" stroke-width="2" opacity="0.7"/>
  
  <!-- AI Brain in center -->
  <circle cx="64" cy="64" r="15" fill="url(#brainGradient)" opacity="0.9"/>
  <path d="M56 58 Q64 52 72 58 Q68 66 64 72 Q60 66 56 58" fill="#ffffff" opacity="0.95"/>
  
  <!-- Debug bug symbol -->
  <circle cx="90" cy="20" r="10" fill="#FF6B6B" opacity="0.95"/>
  <path d="M85 15 L95 15 L95 25 L85 25 Z" fill="#ffffff"/>
  <circle cx="87" cy="17" r="1.5" fill="#FF6B6B"/>
  <circle cx="93" cy="17" r="1.5" fill="#FF6B6B"/>
  <path d="M87 21 Q90 23 93 21" stroke="#FF6B6B" stroke-width="1.5" fill="none"/>
</svg>`;
};

// Write SVG file
const svgContent = createSVGIcon();
fs.writeFileSync(path.join(__dirname, 'icon.svg'), svgContent);

// Write PNG-ready SVG file
const pngContent = createPNGIcon();
fs.writeFileSync(path.join(__dirname, 'icon-static.svg'), pngContent);

console.log('✅ Extension icons created successfully!');
console.log('📁 Files created:');
console.log('   - icon.svg (animated version)');
console.log('   - icon-static.svg (static version for PNG conversion)');
console.log('');
console.log('🎨 Icon features:');
console.log('   - Flutter-inspired blue gradient background');
console.log('   - White Flutter "F" logo');
console.log('   - AI neural network nodes in teal');
console.log('   - Central AI brain element in coral');
console.log('   - Debug bug symbol');
console.log('   - Animated pulse effect (SVG version)');
console.log('');
console.log('📝 To convert to PNG, use an online SVG to PNG converter or:');
console.log('   npm install -g svg2png-cli');
console.log('   svg2png icon-static.svg icon.png --width=128 --height=128'); 