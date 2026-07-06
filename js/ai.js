// Orchestrierung des "Smart Fill" — wählt Provider, ruft ihn auf, verarbeitet Erfolg/Fehler

const AI_PROVIDER_REGISTRY = {
  [AI_PROVIDERS.ANTHROPIC]: AnthropicProvider,
  [AI_PROVIDERS.OPENAI]: OpenAIProvider,
  [AI_PROVIDERS.PERPLEXITY]: PerplexityProvider,
  [AI_PROVIDERS.GEMINI]: GeminiProvider,
};

function nowISO() {
  return new Date().toISOString();
}

// Gibt { ok: boolean, message?: string, results?: {...} } zurück — wirft nie.
async function runSmartFill({ settings, country, city, travelDateRange }) {
  const aiSettings = settings.ai || {};

  if (!aiSettings.apiKey) {
    return {
      ok: false,
      message: 'Kein API-Key hinterlegt — bitte in den Einstellungen eintragen oder Werte manuell erfassen.',
    };
  }

  const provider = AI_PROVIDER_REGISTRY[aiSettings.provider];
  if (!provider) {
    return { ok: false, message: `Unbekannter KI-Provider: ${aiSettings.provider}` };
  }

  try {
    const parsed = await provider.fetchEstimate({
      apiKey: aiSettings.apiKey,
      model: aiSettings.model,
      country,
      city,
      departureAirport: settings.defaultDepartureAirport,
      travelDateRange,
      enableWebSearch: aiSettings.enableWebSearch,
    });

    const timestamp = nowISO();
    const results = {};
    const missingFields = [];

    for (const field of EXPECTED_FIELDS) {
      if (parsed[field]) {
        results[field] = {
          value: parsed[field].value,
          source: 'ai',
          rationale: parsed[field].rationale,
          lastUpdated: timestamp,
        };
      } else {
        missingFields.push(field);
      }
    }

    return {
      ok: true,
      results,
      message:
        missingFields.length > 0
          ? `Hinweis: folgende Felder konnten nicht ermittelt werden und bleiben unverändert: ${missingFields.join(', ')}.`
          : null,
    };
  } catch (err) {
    const message = err instanceof AIProviderError ? err.message : 'Unbekannter Fehler bei der KI-Abfrage.';
    return { ok: false, message: `KI-Abfrage fehlgeschlagen: ${message} Bitte Werte manuell prüfen/eintragen.` };
  }
}
