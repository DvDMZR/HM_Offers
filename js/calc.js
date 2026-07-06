// Reine Berechnungsfunktionen — keine DOM-/Storage-Abhängigkeit

function deriveDaysOnSite(hoursOnSite, hoursPerDay) {
  return hoursOnSite / hoursPerDay;
}

function deriveTravelHours(travels, hoursPerRoundTrip) {
  return travels * hoursPerRoundTrip;
}

function deriveTotalHours(hoursOnSite, travelHours) {
  return hoursOnSite + travelHours;
}

function deriveTotalDays(totalHours, hoursPerDay) {
  return totalHours / hoursPerDay;
}

function derivePackageMetrics(packageInput, settings) {
  const { hoursOnSite, travels } = packageInput;
  // Paketspezifische Reisestunden je Round-Trip haben Vorrang vor dem globalen Wert
  const perTrip = packageInput.hoursPerRoundTrip ?? settings.hoursPerRoundTrip;
  const daysOnSite = deriveDaysOnSite(hoursOnSite, settings.hoursPerDay);
  const travelHours = deriveTravelHours(travels, perTrip);
  const totalHours = deriveTotalHours(hoursOnSite, travelHours);
  const totalDays = deriveTotalDays(totalHours, settings.hoursPerDay);
  return { hoursOnSite, travels, daysOnSite, travelHours, totalHours, totalDays };
}

// Hinweis: Math.ceil wird bewusst NUR bei Hotel- und Mietwagenkosten angewendet
// (ein angebrochener Tag vor Ort löst trotzdem eine volle Übernachtung/einen vollen
// Miettag aus). Spesen und Honorare rechnen mit den unrundeten Werten.
function calculateOffer(packageMetrics, costInputs, settings) {
  const { hoursOnSite, travels, daysOnSite, travelHours, totalDays } = packageMetrics;
  const { hourlyRate, marginPercent } = settings;
  const { spesensatzPerDay, flightRoundTrip, hotelPerNight, rentalCarPerDay } = costInputs;

  const honorarVorOrt = hoursOnSite * hourlyRate;
  const honorarReisezeit = travelHours * hourlyRate;
  const spesenGesamt = spesensatzPerDay * totalDays;
  const hotelkostenGesamt = hotelPerNight * Math.ceil(daysOnSite);
  const flugkostenGesamt = flightRoundTrip * travels;
  const mietwagenGesamt = rentalCarPerDay * Math.ceil(daysOnSite);

  const zwischensumme =
    honorarVorOrt + honorarReisezeit + spesenGesamt + hotelkostenGesamt + flugkostenGesamt + mietwagenGesamt;
  const aufschlag = zwischensumme * (marginPercent / 100);
  const vkPreis = zwischensumme + aufschlag;

  return {
    honorarVorOrt,
    honorarReisezeit,
    spesenGesamt,
    hotelkostenGesamt,
    flugkostenGesamt,
    mietwagenGesamt,
    zwischensumme,
    aufschlag,
    vkPreis,
  };
}

function formatCurrencyEUR(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '–';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}

function formatNumberDE(value, fractionDigits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return '–';
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
