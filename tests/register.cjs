// Tests sans dépendance supplémentaire : TypeScript est déjà utilisé par le projet.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    fileName: filename,
  });
  const code = outputText.replace(/require\("(@\/[^\"]+)"\)/g, (_, name) =>
    `require(${JSON.stringify(path.join(__dirname, '../src', name.slice(2)))})`);
  module._compile(code, filename);
};
