// Alpine-Root-Komponente: verdrahtet State, Berechnung, KI-Aufruf, Settings & PDF-Export

document.addEventListener('alpine:init', () => {
  Alpine.data('hmApp', () => ({
    activeView: 'dashboard',
    settings: HMState.loadSettings(),
    packages: HMState.loadPackages(),
    offer: HMState.loadCurrentOffer(),
    settingsErrors: {},
    packageErrors: {},
    aiLoading: false,
    aiMessage: null, // { type: 'error' | 'info', text }
    showApiKey: false,
    aiProviderOptions: Object.values(AI_PROVIDERS),
    aiProviderLabels: AI_PROVIDER_LABELS,

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
    get packageRows() {
      return packageRowsWithMetrics(this.packages, this.settings);
    },

    iconGlyph(source) {
      return ICON_GLYPH[source] || ICON_GLYPH.calc;
    },
    iconTitle(source) {
      return ICON_TITLE[source] || ICON_TITLE.calc;
    },
    formatCurrency(value) {
      return formatCurrencyEUR(value);
    },
    formatNumber(value, digits) {
      return formatNumberDE(value, digits);
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
      this.packages.list.push({ id, label: 'Neues Paket', hoursOnSite: 10, travels: 1 });
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

        this.aiMessage = result.message
          ? { type: 'info', text: result.message }
          : { type: 'info', text: 'KI-Werte erfolgreich übernommen.' };
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
