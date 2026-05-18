// Connecteur Ollama local : appelle un LLM tournant sur la machine de
// l'utilisateur (par défaut http://localhost:11434). Aucune donnée ne sort
// du poste — l'inférence est 100% locale.
//
// Pour activer côté utilisateur :
//   1. Installer Ollama (https://ollama.com)
//   2. ollama pull llama3.1:8b   (ou autre)
//   3. Ollama tourne en service local sur le port 11434

const OLLAMA_DEFAULT_HOST = 'http://localhost:11434';

export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

export interface OllamaExtraction {
  montant?: string;
  departement?: string;
  acteSuggestion?: string;
  raw: string;
}

export async function checkOllama(host = OLLAMA_DEFAULT_HOST): Promise<OllamaModel[] | null> {
  try {
    const res = await fetch(`${host}/api/tags`, { method: 'GET' });
    if (!res.ok) return null;
    const data: { models?: OllamaModel[] } = await res.json();
    return data.models ?? [];
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT = `Tu es un assistant spécialisé dans l'extraction de données d'actes notariés français.
À partir du texte d'un projet d'acte, extrais les informations clés au format JSON strict.

Champs à extraire :
- "montant" : le montant principal en euros (prix de vente, valeur, etc.) sous forme de nombre entier sans séparateur. Null si introuvable.
- "departement" : le code département français (ex : "75", "33", "2A", "971"). Null si introuvable.
- "acteSuggestion" : un mot-clé décrivant le type d'acte parmi cette liste exacte : "vente_immeuble", "vente_terrain", "vefa", "echange", "licitation", "partage", "bail_construction", "donation", "donation_partage", "testament", "notoriete", "attestation_propriete", "declaration_succession", "pret_hypothecaire", "mainlevee_hypo_inf", "constitution_societe", "augmentation_capital", "cession_parts", "procuration", "contrat_mariage", "pacs", "divorce_consentement". Null si aucun ne correspond.

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni commentaire.`;

export async function extractWithOllama(
  text: string,
  model: string,
  host = OLLAMA_DEFAULT_HOST,
  signal?: AbortSignal
): Promise<OllamaExtraction> {
  // On tronque pour éviter de dépasser le contexte du modèle
  const excerpt = text.length > 8000 ? text.slice(0, 8000) : text;

  const res = await fetch(`${host}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      format: 'json',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Texte de l'acte :\n\n${excerpt}` }
      ],
      options: { temperature: 0.1 }
    }),
    signal
  });

  if (!res.ok) {
    throw new Error(`Ollama HTTP ${res.status}`);
  }

  const data: { message?: { content?: string } } = await res.json();
  const raw = data.message?.content ?? '';

  try {
    const parsed = JSON.parse(raw);
    return {
      montant: parsed.montant != null
        ? Number(parsed.montant).toLocaleString('fr-FR')
        : undefined,
      departement: parsed.departement
        ? String(parsed.departement).toUpperCase()
        : undefined,
      acteSuggestion: parsed.acteSuggestion ?? undefined,
      raw
    };
  } catch {
    return { raw };
  }
}
