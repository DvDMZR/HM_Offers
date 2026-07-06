// Alpine-Root-Komponente: verdrahtet State, Berechnung, KI-Aufruf, Settings & PDF-Export

document.addEventListener('alpine:init', () => {
  Alpine.data('hmApp', () => ({
    activeView: 'dashboard',
    settings: HMState.loadSettings(),
    packages: HMState.loadPackages(),
    offer: HMState.loadCurrentOffer(),
    spesen: HMState.loadSpesen(),
    settingsErrors: {},
    packageErrors: {},
    aiLoading: false,
    aiMessage: null, // { type: 'error' | 'info', text }
    spesenLoading: false,
    spesenMessage: null,
    newSpesenCountry: '',
    showApiKey: false,
    aiProviderOptions: Object.keys(AI_PROVIDER_LABELS),
    aiProviderLabels: AI_PROVIDER_LABELS,

    get apiKeyPlaceholder() {
      return AI_PROVIDER_KEY_PLACEHOLDERS[this.settings.ai.provider] || 'API-Key';
    },
    // Beim Provider-Wechsel das Modell auf den Provider-Default umstellen, sofern
    // der Nutzer kein eigenes Modell eingetragen hat (d.h. ein bekannter Default steht drin)
    onProviderChange() {
      const knownDefaults = Object.values(AI_PROVIDER_DEFAULT_MODELS);
      if (!this.settings.ai.model || knownDefaults.includes(this.settings.ai.model)) {
        this.settings.ai.model = AI_PROVIDER_DEFAULT_MODELS[this.settings.ai.provider] || '';
      }
      this.persistSettings();
    },

    // --- Ableitungen ---
    get selectedPackage() {
      return this.packages.list.find((p) => p.id === this.offer.packageId) || this.packages.list[0];
    },
    get packageMetrics() {
      return derivePackageMetrics(this.selectedPackage, this.settings);
    },
    get resolvedCostInputs() {
      const ci = this.offer.costInputs;
      return {
        spesensatzPerDay: ci.spesensatzPerDay.value || 0,
        flightRoundTrip: ci.flightRoundTrip.value || 0,
        hotelPerNight: ci.hotelPerNight.value || 0,
        rentalCarPerDay: ci.rentalCarPerDay.value || 0,
      };
    },
    get calcResult() {
      return calculateOffer(this.packageMetrics, this.resolvedCostInputs, this.settings);
    },
    get lineItems() {
      return buildLineItems(this.packageMetrics, this.offer.costInputs, this.calcResult);
    },
    get countrySuggestions() {
      const stored = this.spesen.list.map((e) => e.country);
      return [...new Set([...stored, ...COUNTRY_SUGGESTIONS])];
    },

    sourceBadge(source) {
      return SOURCE_BADGE[source] || SOURCE_BADGE.calc;
    },
    sourceTitle(source) {
      return SOURCE_TITLE[source] || SOURCE_TITLE.calc;
    },
    formatCurrency(value) {
      return formatCurrencyEUR(value);
    },
    formatNumber(value, digits) {
      return formatNumberDE(value, digits);
    },
    formatDate(iso) {
      return iso ? new Date(iso).toLocaleDateString('de-DE') : '–';
    },

    // --- Persistenz ---
    persistSettings() {
      const { valid, errors } = validateSettings(this.settings);
      this.settingsErrors = errors;
      if (valid) HMState.saveSettings(this.settings);
    },
    persistPackages() {
      let allValid = true;
      const allErrors = {};
      for (const pkg of this.packages.list) {
        const { valid, errors } = validatePackageInput(pkg);
        if (!valid) {
          allValid = false;
          allErrors[pkg.id] = errors;
        }
      }
      this.packageErrors = allErrors;
      if (allValid) HMState.savePackages(this.packages);
    },
    persistOffer() {
      HMState.saveCurrentOffer(this.offer);
    },
    persistSpesen() {
      HMState.saveSpesen(this.spesen);
    },

    resetSettings() {
      this.settings = HMState.resetSettingsToDefaults();
      this.settingsErrors = {};
    },
    resetPackages() {
      this.packages = HMState.resetPackagesToDefaults();
      this.packageErrors = {};
    },

    addPackage() {
      const id = makeNewPackageId(this.packages.list);
      this.packages.list.push({ id, label: 'Neues Paket', hoursOnSite: 10, travels: 1, hoursPerRoundTrip: 20 });
      this.persistPackages();
    },
    removePackage(id) {
      this.packages.list = this.packages.list.filter((p) => p.id !== id);
      if (this.offer.packageId === id && this.packages.list.length > 0) {
        this.offer.packageId = this.packages.list[0].id;
        this.persistOffer();
      }
      this.persistPackages();
    },

    onCostFieldInput(field, rawValue) {
      const value = rawValue === '' || rawValue === null ? null : Number(rawValue);
      this.offer.costInputs[field] = {
        value,
        source: value === null ? 'unset' : 'manual',
        rationale: '',
        lastUpdated: new Date().toISOString(),
      };
      this.persistOffer();
    },

    // --- Spesen-Datenbank ---
    findSpesenEntry(country) {
      const needle = (country || '').trim().toLowerCase();
      if (!needle) return null;
      return this.spesen.list.find((e) => e.country.trim().toLowerCase() === needle) || null;
    },
    upsertSpesen(country, value, rationale) {
      const name = (country || '').trim();
      if (!name || typeof value !== 'number') return;
      const entry = this.findSpesenEntry(name);
      const timestamp = new Date().toISOString();
      if (entry) {
        entry.value = value;
        entry.rationale = rationale || entry.rationale;
        entry.lastUpdated = timestamp;
      } else {
        this.spesen.list.push({ country: name, value, rationale: rationale || '', lastUpdated: timestamp });
        this.spesen.list.sort((a, b) => a.country.localeCompare(b.country, 'de'));
      }
      this.persistSpesen();
    },
    // Bei Länderwechsel: gespeicherten Spesensatz automatisch übernehmen
    onCountryChange() {
      const entry = this.findSpesenEntry(this.offer.country);
      if (entry && entry.value != null) {
        this.offer.costInputs.spesensatzPerDay = {
          value: entry.value,
          source: 'db',
          rationale: entry.rationale,
          lastUpdated: new Date().toISOString(),
        };
      }
      this.persistOffer();
    },
    addSpesenCountry() {
      const name = this.newSpesenCountry.trim();
      if (!name) return;
      if (this.findSpesenEntry(name)) {
        this.spesenMessage = { type: 'error', text: `"${name}" ist bereits in der Spesen-Datenbank.` };
        return;
      }
      this.spesen.list.push({ country: name, value: null, rationale: '', lastUpdated: null });
      this.spesen.list.sort((a, b) => a.country.localeCompare(b.country, 'de'));
      this.persistSpesen();
      this.newSpesenCountry = '';
      this.spesenMessage = null;
    },
    removeSpesen(country) {
      this.spesen.list = this.spesen.list.filter((e) => e.country !== country);
      this.persistSpesen();
    },
    onSpesenRateInput(country, rawValue) {
      const entry = this.findSpesenEntry(country);
      if (!entry) return;
      entry.value = rawValue === '' ? null : Number(rawValue);
      entry.rationale = 'Manuell eingetragen';
      entry.lastUpdated = new Date().toISOString();
      this.persistSpesen();
    },
    async updateAllSpesen() {
      this.spesenLoading = true;
      this.spesenMessage = null;
      try {
        const countries = this.spesen.list.map((e) => e.country);
        const result = await runSpesenUpdate({ settings: this.settings, countries });
        if (!result.ok) {
          this.spesenMessage = { type: 'error', text: result.message };
          return;
        }
        for (const [country, rate] of Object.entries(result.results)) {
          this.upsertSpesen(country, rate.value, rate.rationale);
        }
        this.spesenMessage = result.message
          ? { type: 'info', text: result.message }
          : { type: 'info', text: 'Alle Spesensätze wurden aktualisiert.' };
        // Falls das aktuelle Angebot ein Land aus der Datenbank nutzt: Wert übernehmen
        this.onCountryChange();
      } finally {
        this.spesenLoading = false;
      }
    },

    // --- KI Smart Fill ---
    async runSmartFillAction() {
      this.aiLoading = true;
      this.aiMessage = null;
      try {
        const result = await runSmartFill({
          settings: this.settings,
          country: this.offer.country,
          city: this.offer.city,
          travelDateRange: this.offer.travelDateRange,
        });

        if (!result.ok) {
          this.aiMessage = { type: 'error', text: result.message };
          return;
        }

        for (const [field, fieldResult] of Object.entries(result.results)) {
          this.offer.costInputs[field] = fieldResult;
        }
        this.persistOffer();

        // Ermittelten Spesensatz in der Datenbank ablegen
        if (result.results.spesensatzPerDay) {
          this.upsertSpesen(
            this.offer.country,
            result.results.spesensatzPerDay.value,
            result.results.spesensatzPerDay.rationale
          );
        }

        this.aiMessage = result.message
          ? { type: 'info', text: result.message }
          : { type: 'info', text: 'Kosten erfolgreich ermittelt und übernommen.' };
      } finally {
        this.aiLoading = false;
      }
    },

    // --- PDF Export ---
    exportPdf() {
      exportOfferPdf({
        offer: this.offer,
        packageMetrics: this.packageMetrics,
        selectedPackage: this.selectedPackage,
        calcResult: this.calcResult,
        settings: this.settings,
      });
    },
  }));
});
