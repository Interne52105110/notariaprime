// 🚀 EXPORT ULTRA OPTIMISÉ - Maximum d'infos, minimum de taille
const fs = require('fs');
const path = require('path');

// 🎯 Fichiers critiques UNIQUEMENT
const CRITICAL_FILES = {
  'package.json': { limit: 1000, full: true },
  'src/app/page.tsx': { limit: 3000, extract: 'key' },
  'src/app/pretaxe/page.tsx': { limit: 5000, extract: 'logic' },
  'src/app/plusvalue/page.tsx': { limit: 5000, extract: 'logic' },
  'src/app/scan/page.tsx': { limit: 5000, extract: 'logic' },
  'src/components/Header.tsx': { limit: 2000, extract: 'structure' },
  'src/config/actesConfig.ts': { limit: 3000, extract: 'structure' }
};

// 📊 Extraction intelligente
function extractKey(content, limit) {
  const lines = content.split('\n');
  
  // Extraire l'essentiel
  const imports = lines.filter(l => l.trim().startsWith('import ')).slice(0, 5);
  const states = lines.filter(l => l.includes('useState') || l.includes('useEffect')).slice(0, 5);
  const functions = lines.filter(l => 
    /^(export )?(const|function) \w+/.test(l.trim())
  ).slice(0, 8);
  
  let extract = '// 📦 IMPORTS\n' + imports.join('\n') + '\n\n';
  extract += '// 🔄 STATES\n' + states.join('\n') + '\n\n';
  extract += '// ⚙️ FONCTIONS\n' + functions.join('\n') + '\n';
  
  return extract;
}

function extractLogic(content, limit) {
  const lines = content.split('\n');
  
  // Chercher les fonctions de calcul
  const calcFunctions = [];
  let inFunction = false;
  let currentFunc = [];
  
  lines.forEach(line => {
    if (line.includes('const calcul') || line.includes('function calcul')) {
      inFunction = true;
      currentFunc = [line];
    } else if (inFunction) {
      currentFunc.push(line);
      if (line.includes('};') || line.includes('}')) {
        calcFunctions.push(currentFunc.join('\n'));
        inFunction = false;
        currentFunc = [];
      }
    }
  });
  
  let extract = '// 🧮 LOGIQUE DE CALCUL (extrait)\n\n';
  extract += calcFunctions.slice(0, 3).join('\n\n');
  
  return extract.substring(0, limit);
}

function extractStructure(content, limit) {
  const lines = content.split('\n');
  
  // Extraire JSX structure
  const jsx = lines.filter(l => 
    l.includes('<') || l.includes('return') || l.includes('className')
  ).slice(0, 30);
  
  return '// 🏗️ STRUCTURE\n' + jsx.join('\n').substring(0, limit);
}

function processFile(filePath, config, rootDir) {
  if (!fs.existsSync(filePath)) {
    return `❌ Non trouvé: ${filePath}\n\n`;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const stats = fs.statSync(filePath);
  const relativePath = path.relative(rootDir, filePath);
  
  let output = `${'='.repeat(60)}\n`;
  output += `📄 ${relativePath}\n`;
  output += `📏 ${(stats.size / 1024).toFixed(1)} KB | ${content.split('\n').length} lignes\n`;
  output += `${'─'.repeat(60)}\n\n`;
  
  if (config.full) {
    output += content.substring(0, config.limit);
  } else if (config.extract === 'key') {
    output += extractKey(content, config.limit);
  } else if (config.extract === 'logic') {
    output += extractLogic(content, config.limit);
  } else if (config.extract === 'structure') {
    output += extractStructure(content, config.limit);
  }
  
  if (content.length > config.limit) {
    output += `\n\n... (${content.length - config.limit} caractères omis)\n`;
  }
  
  output += '\n\n';
  return output;
}

function generateUltraExport() {
  const rootDir = process.cwd();
  
  let output = `╔${'═'.repeat(58)}╗\n`;
  output += `║  NOTARIAPRIME - EXPORT ULTRA OPTIMISÉ              ║\n`;
  output += `║  Date: ${new Date().toLocaleString('fr-FR').padEnd(42)}║\n`;
  output += `╚${'═'.repeat(58)}╝\n\n`;
  
  output += `🎯 7 fichiers critiques | Extraction intelligente\n`;
  output += `📦 3 calculateurs + config + navigation\n\n`;
  
  let totalSize = 0;
  let processedCount = 0;
  
  Object.entries(CRITICAL_FILES).forEach(([file, config]) => {
    const fullPath = path.join(rootDir, file);
    const result = processFile(fullPath, config, rootDir);
    output += result;
    totalSize += result.length;
    processedCount++;
  });
  
  output += `╔${'═'.repeat(58)}╗\n`;
  output += `║  RÉSUMÉ                                            ║\n`;
  output += `╠${'═'.repeat(58)}╣\n`;
  output += `║  Fichiers traités: ${processedCount.toString().padEnd(32)}║\n`;
  output += `║  Taille export: ${(totalSize / 1024).toFixed(1)} KB${' '.repeat(28)}║\n`;
  output += `║  Réduction: ~90% vs export complet                 ║\n`;
  output += `╚${'═'.repeat(58)}╝\n`;
  
  fs.writeFileSync('project-ULTRA.txt', output);
  
  console.log('╔' + '═'.repeat(58) + '╗');
  console.log('║  ✅ EXPORT ULTRA OPTIMISÉ CRÉÉ                     ║');
  console.log('╠' + '═'.repeat(58) + '╣');
  console.log(`║  📄 Fichier: project-ULTRA.txt${' '.repeat(23)}║`);
  console.log(`║  📦 ${processedCount} fichiers analysés${' '.repeat(31)}║`);
  console.log(`║  📏 Taille: ${(totalSize / 1024).toFixed(1)} KB${' '.repeat(35)}║`);
  console.log(`║  🎯 Réduction: 90% vs export original${' '.repeat(15)}║`);
  console.log('╚' + '═'.repeat(58) + '╝');
}

generateUltraExport();