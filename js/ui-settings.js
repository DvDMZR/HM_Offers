// Hilfsfunktionen für das Settings-Panel: Validierung, Paket-Anzeige, ID-Vergabe

function validateSettings(settings) {
  const errors = {};
  if (!(settings.hourlyRate > 0)) errors.hourlyRate = 'Muss größer als 0 sein.';
  if (!(settings.marginPercent >= 0)) errors.marginPercent = 'Darf nicht negativ sein.';
  if (!(settings.hoursPerDay > 0)) errors.hoursPerDay = 'Muss größer als 0 sein (Divisor).';
  if (!(settings.hoursPerRoundTrip >= 0)) errors.hoursPerRoundTrip = 'Darf nicht negativ sein.';
  return { valid: Object.keys(errors).length === 0, errors };
}

function validatePackageInput(pkg) {
  const errors = {};
  if (!(pkg.hoursOnSite >= 0)) errors.hoursOnSite = 'Darf nicht negativ sein.';
  if (!(pkg.travels >= 0)) errors.travels = 'Darf nicht negativ sein.';
  if (pkg.hoursPerRoundTrip != null && !(pkg.hoursPerRoundTrip >= 0)) {
    errors.hoursPerRoundTrip = 'Darf nicht negativ sein.';
  }
  if (!pkg.label || !pkg.label.trim()) errors.label = 'Bezeichnung darf nicht leer sein.';
  return { valid: Object.keys(errors).length === 0, errors };
}

function packageRowsWithMetrics(packages, settings) {
  return packages.list.map((pkg) => ({
    ...pkg,
    metrics: derivePackageMetrics(pkg, settings),
  }));
}

function makeNewPackageId(existingList) {
  let n = existingList.length + 1;
  const existingIds = new Set(existingList.map((p) => p.id));
  while (existingIds.has(`custom${n}`)) n++;
  return `custom${n}`;
}
