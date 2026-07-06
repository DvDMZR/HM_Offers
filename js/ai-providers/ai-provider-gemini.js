// KI-Provider: Google Gemini (Generative Language API)
//
// Die Gemini-API erlaubt direkte Browser-Aufrufe (CORS-freigegeben); der API-Key
// wird per 'x-goog-api-key'-Header übertragen. Wie beim Anthropic-Provider gilt:
// Der Key ist im Netzwerk-Tab/DevTools sichtbar — bewusster Trade-off für dieses
// BYO-Key-Tool ohne eigenes Backend.

async function geminiCompleteText({ apiKey, model, prompt, enableWebSearch }) {
  if (!apiKey) {
    throw new AIProviderError('Kein Gemini API-Key hinterlegt.');
  }

  const resolvedModel = model || AI_PROVIDER_DEFAULT_MODELS.gemini;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(resolvedModel)}:generateContent`;

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        // Google-Search-Grounding liefert aktuelle Web-Informationen (Gemini 2.x)
        tools: enableWebSearch ? [{ google_search: {} }] : undefined,
        generationConfig: { maxOutputTokens: 4096 },
      }),
    });
  } catch (err) {
    throw new AIProviderError('Netzwerkfehler beim Aufruf der Gemini API.', err);
  }

  if (!response.ok) {
    let detail = '';
    try {
      const errBody = await response.json();
      detail = errBody?.error?.message || '';
    } catch (_) {
      /* ignore parse errors on error body */
    }
    throw new AIProviderError(`Gemini API antwortete mit Status ${response.status}${detail ? ': ' + detail : ''}.`);
  }

  const data = await response.json();

  const parts = data?.candidates?.[0]?.content?.parts || [];
  const text = parts
    .filter((p) => typeof p.text === 'string')
    .map((p) => p.text)
    .join('\n');

  if (!text) {
    throw new AIProviderError('Gemini-Antwort enthielt keinen Text.');
  }

  return text;
}

const GeminiProvider = {
  name: 'gemini',

  async fetchEstimate({ apiKey, model, country, city, departureAirport, travelDateRange, enableWebSearch }) {
    const prompt = buildEstimatePrompt({ country, city, departureAirport, travelDateRange });
    const text = await geminiCompleteText({ apiKey, model, prompt, enableWebSearch });
    return parseAndValidateJSON(text);
  },

  async fetchSpesenRates({ apiKey, model, countries, enableWebSearch }) {
    const prompt = buildSpesenPrompt(countries);
    const text = await geminiCompleteText({ apiKey, model, prompt, enableWebSearch });
    return parseSpesenRatesJSON(text, countries);
  },
};
