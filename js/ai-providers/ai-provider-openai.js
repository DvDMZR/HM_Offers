// Stub-Provider: gleiche Schnittstelle wie AnthropicProvider, noch nicht implementiert.
const OpenAIProvider = {
  name: 'openai',
  async fetchEstimate() {
    throw new AIProviderError('Provider "OpenAI" ist noch nicht implementiert.');
  },
};
