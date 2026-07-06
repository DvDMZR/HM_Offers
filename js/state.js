// State-Verwaltung: Laden/Speichern von Settings, Paketen & aktuellem Angebot in localStorage

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function safeReadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return deepMerge(fallback, parsed);
  } catch (err) {
    console.warn(`HM_Offers: konnte "${key}" nicht aus localStorage laden, nutze Defaults.`, err);
    return fallback;
  }
}

function safeWriteJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`HM_Offers: konnte "${key}" nicht in localStorage speichern.`, err);
    return false;
  }
}

const HMState = {
  loadSettings() {
    return safeReadJSON(STORAGE_KEYS.SETTINGS, JSON.parse(JSON.stringify(DEFAULT_SETTINGS)));
  },
  saveSettings(settings) {
    return safeWriteJSON(STORAGE_KEYS.SETTINGS, settings);
  },
  resetSettingsToDefaults() {
    const defaults = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    safeWriteJSON(STORAGE_KEYS.SETTINGS, defaults);
    return defaults;
  },

  loadPackages() {
    return safeReadJSON(STORAGE_KEYS.PACKAGES, JSON.parse(JSON.stringify(DEFAULT_PACKAGES)));
  },
  savePackages(packages) {
    return safeWriteJSON(STORAGE_KEYS.PACKAGES, packages);
  },
  resetPackagesToDefaults() {
    const defaults = JSON.parse(JSON.stringify(DEFAULT_PACKAGES));
    safeWriteJSON(STORAGE_KEYS.PACKAGES, defaults);
    return defaults;
  },

  loadCurrentOffer() {
    return safeReadJSON(STORAGE_KEYS.CURRENT_OFFER, defaultCurrentOffer());
  },
  saveCurrentOffer(offer) {
    return safeWriteJSON(STORAGE_KEYS.CURRENT_OFFER, offer);
  },
  resetCurrentOffer() {
    const defaults = defaultCurrentOffer();
    safeWriteJSON(STORAGE_KEYS.CURRENT_OFFER, defaults);
    return defaults;
  },
};

// Debounce-Helfer für Text-/Zahleneingaben, um localStorage nicht bei jedem Tastendruck zu schreiben
function debounce(fn, wait = 300) {
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), wait);
  };
}
