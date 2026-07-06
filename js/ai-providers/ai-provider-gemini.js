// Stub-Provider: gleiche Schnittstelle wie AnthropicProvider, noch nicht implementiert.
const GeminiProvider = {
  name: 'gemini',
  async fetchEstimate() {
    throw new AIProviderError('Provider "Gemini" ist noch nicht implementiert.');
  },
  async fetchSpesenRates() {
    throw new AIProviderError('Provider "Gemini" ist noch nicht implementiert.');
  },
};
