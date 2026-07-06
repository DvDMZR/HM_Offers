// Gemeinsamer Prompt-Builder, JSON-Validator und Fehlertyp für alle KI-Provider

class AIProviderError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'AIProviderError';
    this.cause = cause;
  }
}

const EXPECTED_FIELDS = ['spesensatzPerDay', 'flightRoundTrip', 'hotelPerNight', 'rentalCarPerDay'];

function buildEstimatePrompt({ country, city, departureAirport, travelDateRange }) {
  const cityPart = city && city.trim() ? city : 'Hauptstadt/größte Wirtschaftsmetropole, falls keine Stadt angegeben';
  const rangePart =
    travelDateRange && (travelDateRange.from || travelDateRange.to)
      ? `${travelDateRange.from || '?'} bis ${travelDateRange.to || '?'}`
      : 'nicht spezifiziert, nutze aktuelle/generische Preise';

  return `Du bist ein Reisekosten-Recherche-Assistent für ein B2B-Beratungsunternehmen mit Sitz in Deutschland.
Ermittle für eine Geschäftsreise die folgenden vier Werte für:
  Zielland: ${country}
  Zielstadt: ${cityPart}
  Abflugort: ${departureAirport}
  Reisezeitraum: ${rangePart}

Liefere ausschließlich ein JSON-Objekt (keinen Fließtext, keine Markdown-Codeblöcke) exakt in diesem Format:
{
  "spesensatzPerDay": { "value": <number, EUR>, "rationale": "<kurze Quelle, z.B. 'BMF Auslandstagegeld 2026 für Land X'>" },
  "flightRoundTrip":  { "value": <number, EUR>, "rationale": "<kurze Begründung/Quelle, grobe Schätzung reicht>" },
  "hotelPerNight":    { "value": <number, EUR>, "rationale": "<kurze Quelle, 3-4 Sterne Business-Hotel>" },
  "rentalCarPerDay":  { "value": <number, EUR>, "rationale": "<kurze Quelle>" }
}
Nutze aktuelle Web-Informationen falls verfügbar. Alle Werte in EUR, gerundet auf 2 Nachkommastellen.`;
}

function buildSpesenPrompt(countries) {
  return `Du bist ein Recherche-Assistent für Reisekosten eines deutschen B2B-Beratungsunternehmens.
Ermittle die aktuell gültigen offiziellen Pauschbeträge für Verpflegungsmehraufwand bei
Auslandsdienstreisen (BMF-Tabelle, voller Kalendertag) für die folgenden Länder:
${countries.map((c) => `  - ${c}`).join('\n')}

Liefere ausschließlich ein JSON-Objekt (keinen Fließtext, keine Markdown-Codeblöcke), das jedem
Land exakt den angefragten Namen als Schlüssel zuordnet:
{
  "<Landesname>": { "value": <number, EUR pro Tag>, "rationale": "<kurze Quelle, z.B. 'BMF-Tabelle 2026'>" }
}
Nutze aktuelle Web-Informationen falls verfügbar. Alle Werte in EUR.`;
}

function stripMarkdownFences(text) {
  return text
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim();
}

// Validiert pro Feld einzeln: unvollständige/fehlerhafte Antworten führen nicht zum
// Totalverlust — gültige Felder werden übernommen, ungültige bleiben 'unset'.
function parseAndValidateJSON(rawText) {
  let parsed;
  try {
    parsed = JSON.parse(stripMarkdownFences(rawText));
  } catch (err) {
    throw new AIProviderError('Antwort konnte nicht als JSON geparst werden.', err);
  }

  const result = {};
  for (const field of EXPECTED_FIELDS) {
    const entry = parsed[field];
    if (
      entry &&
      typeof entry === 'object' &&
      typeof entry.value === 'number' &&
      !Number.isNaN(entry.value) &&
      typeof entry.rationale === 'string'
    ) {
      result[field] = { value: entry.value, rationale: entry.rationale };
    } else {
      result[field] = null; // vom Aufrufer als 'unset' zu behandeln
    }
  }
  return result;
}

// Antwort der Spesen-Abfrage: Map Land -> { value, rationale }; ungültige Einträge werden null.
function parseSpesenRatesJSON(rawText, countries) {
  let parsed;
  try {
    parsed = JSON.parse(stripMarkdownFences(rawText));
  } catch (err) {
    throw new AIProviderError('Antwort konnte nicht als JSON geparst werden.', err);
  }

  const result = {};
  for (const country of countries) {
    const entry = parsed[country];
    if (
      entry &&
      typeof entry === 'object' &&
      typeof entry.value === 'number' &&
      !Number.isNaN(entry.value) &&
      typeof entry.rationale === 'string'
    ) {
      result[country] = { value: entry.value, rationale: entry.rationale };
    } else {
      result[country] = null;
    }
  }
  return result;
}
