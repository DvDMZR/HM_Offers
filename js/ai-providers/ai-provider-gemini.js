// Stub-Provider: gleiche Schnittstelle wie AnthropicProvider, noch nicht implementiert.
const GeminiProvider = {
  name: 'gemini',
  async fetchEstimate() {
    throw new AIProviderError('Provider "Google Gemini" ist noch nicht implementiert.');
  },
};
