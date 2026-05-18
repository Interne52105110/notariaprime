// Extracteur "best-effort" pour les fichiers Word 97-2003 (.doc).
// Le format DOC est un binaire CFB (Compound File Binary) que les
// librairies browser parsent mal. Plutôt qu'ajouter une grosse
// dépendance binaire, on lit les octets et on extrait les runs de
// caractères imprimables — suffisant pour repérer montant, code
// postal et mots-clés (le pipeline regex/IA aval n'a pas besoin
// d'une mise en forme parfaite).
//
// Limite assumée : tableaux, styles et textes en encodage exotique
// peuvent être tronqués. Pour un résultat propre, mieux vaut
// convertir le .doc en .docx (Word → Enregistrer sous).

const CP1252_HIGH: Record<number, string> = {
  0x80: '€', 0x82: '‚', 0x83: 'ƒ', 0x84: '„', 0x85: '…', 0x86: '†', 0x87: '‡',
  0x88: 'ˆ', 0x89: '‰', 0x8A: 'Š', 0x8B: '‹', 0x8C: 'Œ', 0x8E: 'Ž',
  0x91: '‘', 0x92: '’', 0x93: '“', 0x94: '”', 0x95: '•', 0x96: '–', 0x97: '—',
  0x98: '˜', 0x99: '™', 0x9A: 'š', 0x9B: '›', 0x9C: 'œ', 0x9E: 'ž', 0x9F: 'Ÿ'
};

function byteToChar(b: number): string | null {
  if (b === 0x09 || b === 0x0A || b === 0x0D) return ' ';
  if (b >= 0x20 && b <= 0x7E) return String.fromCharCode(b);
  if (b >= 0xA0 && b <= 0xFF) return String.fromCharCode(b);
  if (CP1252_HIGH[b]) return CP1252_HIGH[b];
  return null;
}

function extractAsciiRuns(bytes: Uint8Array): string {
  const parts: string[] = [];
  let current = '';
  const MIN_RUN = 4;
  for (let i = 0; i < bytes.length; i++) {
    const ch = byteToChar(bytes[i]);
    if (ch !== null) {
      current += ch;
    } else {
      if (current.length >= MIN_RUN) parts.push(current);
      current = '';
    }
  }
  if (current.length >= MIN_RUN) parts.push(current);
  return parts.join('\n');
}

function extractUtf16Runs(bytes: Uint8Array): string {
  const parts: string[] = [];
  let current = '';
  const MIN_RUN = 4;
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    const lo = bytes[i];
    const hi = bytes[i + 1];
    if (hi === 0 && (lo === 0x09 || lo === 0x0A || lo === 0x0D || (lo >= 0x20 && lo <= 0x7E))) {
      current += lo === 0x09 || lo === 0x0A || lo === 0x0D ? ' ' : String.fromCharCode(lo);
    } else if (hi === 0 && lo >= 0xA0) {
      current += String.fromCharCode(lo);
    } else if (hi === 0 && CP1252_HIGH[lo]) {
      current += CP1252_HIGH[lo];
    } else if (hi <= 0x04 && lo !== 0) {
      // Caractère Latin étendu raisonnable (é, è, à, etc.)
      const code = (hi << 8) | lo;
      if (code >= 0x00A0 && code <= 0x024F) {
        current += String.fromCharCode(code);
      } else {
        if (current.length >= MIN_RUN) parts.push(current);
        current = '';
      }
    } else {
      if (current.length >= MIN_RUN) parts.push(current);
      current = '';
    }
  }
  if (current.length >= MIN_RUN) parts.push(current);
  return parts.join('\n');
}

export async function extractTextFromLegacyDoc(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // On essaie les deux encodages et on garde le résultat qui contient le plus
  // de mots français/euros (les .doc modernes utilisent UTF-16 LE pour le
  // texte ; les plus anciens du Windows-1252).
  const ascii = extractAsciiRuns(bytes);
  const utf16 = extractUtf16Runs(bytes);

  const score = (s: string) => {
    let n = 0;
    if (/euro|€|EUR/i.test(s)) n += 50;
    if (/\b(vente|donation|notaire|acquéreur|cédant|cessionnaire|immeuble|terrain|parcelle|cadastre|propriété)\b/i.test(s)) n += 30;
    if (/[0-9]{5}/.test(s)) n += 10;
    n += s.length / 100;
    return n;
  };

  return score(utf16) > score(ascii) ? utf16 : ascii;
}
