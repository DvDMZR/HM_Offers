// Primärer KI-Provider: Anthropic Claude Messages API
//
// WICHTIG (CORS): Der Header 'anthropic-dangerous-direct-browser-access: true' ist
// erforderlich, damit dieser Call direkt aus dem Browser (ohne eigenes Backend)
// funktioniert — Anthropic blockiert Browser-Origin-Requests sonst per CORS.
// Das mindert NICHT das Risiko, dass der API-Key im Netzwerk-Tab/DevTools sichtbar
// ist; das ist ein bewusster Trade-off für dieses BYO-Key-Tool ohne Server.

const AnthropicProvider = {
  name: 'anthropic',

  async fetchEstimate({ apiKey, model, country, city, departureAirport, travelDateRange, enableWebSearch }) {
    if (!apiKey) {
      throw new AIProviderError('Kein Anthropic API-Key hinterlegt.');
    }

    const prompt = buildEstimatePrompt({ country, city, departureAirport, travelDateRange });

    let response;
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: model || AI_PROVIDER_DEFAULT_MODELS.anthropic,
          max_tokens: 1024,
          tools: enableWebSearch ? [{ type: 'web_search_20250305', name: 'web_search' }] : undefined,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
    } catch (err) {
      throw new AIProviderError('Netzwerkfehler beim Aufruf der Anthropic API.', err);
    }

    if (!response.ok) {
      let detail = '';
      try {
        const errBody = await response.json();
        detail = errBody?.error?.message || '';
      } catch (_) {
        /* ignore parse errors on error body */
      }
      throw new AIProviderError(
        `Anthropic API antwortete mit Status ${response.status}${detail ? ': ' + detail : ''}.`
      );
    }

    const data = await response.json();

    // Bei aktiviertem web_search-Tool enthält content ggf. server_tool_use /
    // web_search_tool_result Zwischenblöcke vor dem finalen Text-Block — nur
    // die finalen 'text'-Blöcke werden für das JSON-Parsing verwendet.
    const textBlocks = (data.content || []).filter((block) => block.type === 'text').map((block) => block.text);

    if (textBlocks.length === 0) {
      throw new AIProviderError('Anthropic-Antwort enthielt keinen Text-Block.');
    }

    const parsed = parseAndValidateJSON(textBlocks.join('\n'));
    return parsed;
  },
};
