const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_FILE = 'project-export.txt';
const PROJECT_NAME = 'NotariaPrime';

// Dossiers à ignorer
const IGNORE_DIRS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  '.cache',
  '.vercel',
  'coverage',
  '.turbo'
];

// Fichiers à ignorer (VERSION CONSOLIDÉE)
const IGNORE_FILES = [
  '.DS_Store',
  'Thumbs.db',
  '*.log',
  '.env.local',
  '.env.production',
  '.env.development',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '*.map',
  'export-project.js',        // Script lui-même
  'eslint.config.mjs',         // Config ESLint
  'postcss.config.mjs',        // Config PostCSS
  'next.config.ts',            // Config Next.js
  'next-env.d.ts',             // Types Next.js
  'README.md'                  // Doc générique
];

// Fichiers de config à exclure
const SKIP_CONFIG_FILES = [
  'tailwind.config.js',
  'tsconfig.json'
];

// Extensions de fichiers à inclure
const INCLUDE_EXTENSIONS = [
  '.tsx', '.ts', '.jsx', '.js',
  '.css', '.scss', '.sass',
  '.json', '.md', '.mdx',
  '.html', '.xml',
  '.yaml', '.yml',
  '.toml', '.mjs', '.cjs'
];

// Fichiers spécifiques à toujours inclure
const ALWAYS_INCLUDE = [
  'package.json'
];

let output = '';
let fileCount = 0;
let totalSize = 0;
const fileTree = [];

// Fonction pour vérifier si un fichier doit être ignoré
function shouldIgnore(filePath, isDirectory = false) {
  const basename = path.basename(filePath);
  
  if (isDirectory) {
    return IGNORE_DIRS.includes(basename);
  }
  
  // Vérifier les patterns d'ignore
  for (const pattern of IGNORE_FILES) {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      if (regex.test(basename)) return true;
    } else if (basename === pattern) {
      return true;
    }
  }
  
  return false;
}

// Fonction pour vérifier si un fichier doit être inclus (VERSION CORRIGÉE)
function shouldInclude(filePath) {
  const basename = path.basename(filePath);
  const ext = path.extname(filePath);
  
  // Toujours inclure certains fichiers
  if (ALWAYS_INCLUDE.includes(basename)) {
    return true;
  }
  
  // Exclure les fichiers de config
  if (SKIP_CONFIG_FILES.includes(basename)) {
    return false;
  }
  
  // Exclure utils.ts
  if (filePath.includes('src/lib/utils.ts') || filePath.includes('src\\lib\\utils.ts')) {
    return false;
  }
  
  // Vérifier l'extension
  return INCLUDE_EXTENSIONS.includes(ext);
}

// Fonction pour créer l'arbre visuel
function generateTree(dir, prefix = '', isLast = true) {
  const items = fs.readdirSync(dir);
  const dirs = [];
  const files = [];
  
  // Séparer dossiers et fichiers
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    if (shouldIgnore(fullPath, fs.statSync(fullPath).isDirectory())) return;
    
    if (fs.statSync(fullPath).isDirectory()) {
      dirs.push(item);
    } else if (shouldInclude(fullPath)) {
      files.push(item);
    }
  });
  
  // Trier alphabétiquement
  dirs.sort();
  files.sort();
  const allItems = [...dirs, ...files];
  
  allItems.forEach((item, index) => {
    const isLastItem = index === allItems.length - 1;
    const fullPath = path.join(dir, item);
    const isDir = fs.statSync(fullPath).isDirectory();
    
    const connector = isLastItem ? '└── ' : '├── ';
    const extension = isLast ? '    ' : '│   ';
    
    fileTree.push(prefix + connector + item + (isDir ? '/' : ''));
    
    if (isDir) {
      generateTree(fullPath, prefix + extension, isLastItem);
    }
  });
}

// Fonction pour lire et formater le contenu d'un fichier
function readFileContent(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    fileCount++;
    totalSize += stats.size;
    
    return `
${'='.repeat(80)}
[${fileCount}] FILE: ${relativePath}
SIZE: ${(stats.size / 1024).toFixed(2)} KB
LAST MODIFIED: ${stats.mtime.toISOString()}
${'='.repeat(80)}

${content}
`;
  } catch (error) {
    return `\n[ERROR] Could not read file: ${filePath}\n${error.message}\n`;
  }
}

// Fonction récursive pour parcourir les dossiers
function scanDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      if (!shouldIgnore(fullPath, true)) {
        scanDirectory(fullPath);
      }
    } else {
      if (!shouldIgnore(fullPath) && shouldInclude(fullPath)) {
        output += readFileContent(fullPath);
      }
    }
  });
}

// Fonction principale
function exportProject() {
  console.log('🚀 Starting project export...\n');
  
  // En-tête
  output = `${PROJECT_NAME} - Project Export
Generated: ${new Date().toISOString()}
${'='.repeat(80)}

PROJECT STRUCTURE:
${'='.repeat(80)}

`;

  // Générer l'arbre du projet
  console.log('📂 Generating project tree...');
  fileTree.push('./');
  generateTree(process.cwd());
  output += fileTree.join('\n');
  output += '\n\n';
  
  // Scanner et lire les fichiers
  console.log('📄 Reading files content...');
  output += `
${'='.repeat(80)}
FILES CONTENT:
${'='.repeat(80)}
`;
  
  scanDirectory(process.cwd());
  
  // Résumé
  const summary = `

${'='.repeat(80)}
EXPORT SUMMARY:
${'='.repeat(80)}
Total files exported: ${fileCount}
Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB
Export date: ${new Date().toISOString()}
${'='.repeat(80)}
`;
  
  output += summary;
  
  // Écrire le fichier de sortie
  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
  
  console.log('\n✅ Export completed successfully!');
  console.log(`📁 Output file: ${OUTPUT_FILE}`);
  console.log(`📊 Statistics:`);
  console.log(`   - Files exported: ${fileCount}`);
  console.log(`   - Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   - Output file size: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`);
}

// Exécuter le script
try {
  exportProject();
} catch (error) {
  console.error('❌ Error during export:', error.message);
  process.exit(1);
}