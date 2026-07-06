// Stub-Provider: gleiche Schnittstelle wie AnthropicProvider, noch nicht implementiert.
const PerplexityProvider = {
  name: 'perplexity',
  async fetchEstimate() {
    throw new AIProviderError('Provider "Perplexity" ist noch nicht implementiert.');
  },
  async fetchSpesenRates() {
    throw new AIProviderError('Provider "Perplexity" ist noch nicht implementiert.');
  },
};
