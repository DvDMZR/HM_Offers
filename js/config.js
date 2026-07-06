// Zentrale Defaults & Konstanten für HM_Offers

const STORAGE_KEYS = {
  SETTINGS: 'hm_offers.settings.v1',
  PACKAGES: 'hm_offers.packages.v1',
  CURRENT_OFFER: 'hm_offers.currentOffer.v1',
  SPESEN: 'hm_offers.spesen.v1',
};

const AI_PROVIDERS = {
  ANTHROPIC: 'anthropic',
  OPENAI: 'openai',
  PERPLEXITY: 'perplexity',
  GEMINI: 'gemini',
};

const AI_PROVIDER_LABELS = {
  [AI_PROVIDERS.ANTHROPIC]: 'Anthropic (Claude)',
  [AI_PROVIDERS.GEMINI]: 'Google Gemini',
  [AI_PROVIDERS.OPENAI]: 'OpenAI (bald verfügbar)',
  [AI_PROVIDERS.PERPLEXITY]: 'Perplexity (bald verfügbar)',
};

const AI_PROVIDER_DEFAULT_MODELS = {
  [AI_PROVIDERS.ANTHROPIC]: 'claude-sonnet-4-5',
  [AI_PROVIDERS.OPENAI]: 'gpt-4o',
  [AI_PROVIDERS.PERPLEXITY]: 'sonar-pro',
  [AI_PROVIDERS.GEMINI]: 'gemini-2.5-flash',
};

const AI_PROVIDER_KEY_PLACEHOLDERS = {
  [AI_PROVIDERS.ANTHROPIC]: 'sk-ant-…',
  [AI_PROVIDERS.GEMINI]: 'AIza…',
  [AI_PROVIDERS.OPENAI]: 'sk-…',
  [AI_PROVIDERS.PERPLEXITY]: 'pplx-…',
};

const DEFAULT_SETTINGS = {
  schemaVersion: 1,
  hourlyRate: 80,
  marginPercent: 10,
  hoursPerDay: 10,
  hoursPerRoundTrip: 20,
  defaultDepartureAirport: 'FRA',
  ai: {
    provider: AI_PROVIDERS.ANTHROPIC,
    apiKey: '',
    model: AI_PROVIDER_DEFAULT_MODELS[AI_PROVIDERS.ANTHROPIC],
    enableWebSearch: true,
  },
};

const DEFAULT_PACKAGES = {
  schemaVersion: 1,
  list: [
    { id: 'package4', label: 'Package 4', hoursOnSite: 22, travels: 1, hoursPerRoundTrip: 20 },
    { id: 'package1', label: 'Package 1', hoursOnSite: 57.5, travels: 1, hoursPerRoundTrip: 20 },
    { id: 'package2', label: 'Package 2', hoursOnSite: 108, travels: 2, hoursPerRoundTrip: 20 },
    { id: 'package3', label: 'Package 3', hoursOnSite: 125, travels: 3, hoursPerRoundTrip: 20 },
  ],
};

// Gespeicherte Spesensätze (BMF Verpflegungsmehraufwand) je Land
const DEFAULT_SPESEN = {
  schemaVersion: 1,
  list: [], // { country, value, rationale, lastUpdated }
};

function emptyCostField() {
  return { value: null, source: 'unset', rationale: '', lastUpdated: null };
}

function defaultCurrentOffer() {
  return {
    schemaVersion: 1,
    customerName: '',
    projectTitle: '',
    country: '',
    city: '',
    travelDateRange: { from: null, to: null },
    packageId: DEFAULT_PACKAGES.list[1].id, // Package 1
    costInputs: {
      spesensatzPerDay: emptyCostField(),
      flightRoundTrip: emptyCostField(),
      hotelPerNight: emptyCostField(),
      rentalCarPerDay: emptyCostField(),
    },
    showDetailedCosts: true,
    offerValidityDays: 30,
    createdAt: null,
  };
}
