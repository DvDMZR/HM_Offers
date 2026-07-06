// Hilfsfunktionen für das Live-Kalkulations-Dashboard: Zeilenaufbau für die Anzeige

// icon: 'ai' (KI-Recherche), 'manual' (Stift), 'calc' (berechnet), 'db' (Spesen-Datenbank)
// toggleable: Position kann per Checkbox aus der Kalkulation ausgeschlossen werden
function buildLineItems(packageMetrics, costInputs, calcResult) {
  const nights = Math.ceil(packageMetrics.daysOnSite);

  return [
    {
      key: 'honorarVorOrt',
      label: 'Honorar Vor-Ort',
      amount: calcResult.honorarVorOrt,
      icon: 'calc',
      editable: false,
      toggleable: false,
    },
    {
      key: 'honorarReisezeit',
      label: 'Honorar Reisezeit',
      amount: calcResult.honorarReisezeit,
      icon: 'calc',
      editable: false,
      toggleable: false,
    },
    {
      key: 'spesenGesamt',
      label: 'Spesen gesamt',
      amount: calcResult.spesenGesamt,
      icon: costInputs.spesensatzPerDay.source === 'unset' ? 'calc' : costInputs.spesensatzPerDay.source,
      editable: true,
      toggleable: true,
      enabled: costInputs.spesensatzPerDay.enabled,
      field: 'spesensatzPerDay',
      rationale: costInputs.spesensatzPerDay.rationale,
      inputValue: costInputs.spesensatzPerDay.value,
      inputLabel: 'Spesensatz/Tag (EUR)',
      quantityLabel: `${formatNumberDE(packageMetrics.totalDays)} Tage`,
    },
    {
      key: 'hotelkostenGesamt',
      label: 'Hotelkosten gesamt',
      amount: calcResult.hotelkostenGesamt,
      icon: costInputs.hotelPerNight.source === 'unset' ? 'calc' : costInputs.hotelPerNight.source,
      editable: true,
      toggleable: true,
      enabled: costInputs.hotelPerNight.enabled,
      field: 'hotelPerNight',
      rationale: costInputs.hotelPerNight.rationale,
      inputValue: costInputs.hotelPerNight.value,
      inputLabel: 'Hotel/Nacht (EUR)',
      quantityLabel: `${nights} ${nights === 1 ? 'Nacht' : 'Nächte'}`,
      markupPercent: undefined, // wird von app.js gesetzt (settings.markups.hotelPercent)
      markupAmount: calcResult.hotelAufschlagBetrag,
    },
    {
      key: 'flugkostenGesamt',
      label: 'Flugkosten gesamt',
      amount: calcResult.flugkostenGesamt,
      icon: costInputs.flightRoundTrip.source === 'unset' ? 'calc' : costInputs.flightRoundTrip.source,
      editable: true,
      toggleable: true,
      enabled: costInputs.flightRoundTrip.enabled,
      field: 'flightRoundTrip',
      rationale: costInputs.flightRoundTrip.rationale,
      inputValue: costInputs.flightRoundTrip.value,
      inputLabel: 'Flug Round-Trip (EUR)',
      quantityLabel: `${packageMetrics.travels} ${packageMetrics.travels === 1 ? 'Anreise' : 'Anreisen'}`,
    },
    {
      key: 'mietwagenGesamt',
      label: 'Mietwagenkosten gesamt',
      amount: calcResult.mietwagenGesamt,
      icon: costInputs.rentalCarPerDay.source === 'unset' ? 'calc' : costInputs.rentalCarPerDay.source,
      editable: true,
      toggleable: true,
      enabled: costInputs.rentalCarPerDay.enabled,
      field: 'rentalCarPerDay',
      rationale: costInputs.rentalCarPerDay.rationale,
      inputValue: costInputs.rentalCarPerDay.value,
      inputLabel: 'Mietwagen/Tag (EUR)',
      quantityLabel: `${nights} Tag${nights === 1 ? '' : 'e'}`,
      markupAmount: calcResult.mietwagenAufschlagBetrag,
    },
    {
      key: 'benzinkostenGesamt',
      label: 'Benzinkosten gesamt',
      amount: calcResult.benzinkostenGesamt,
      icon: costInputs.fuelPerDay.source === 'unset' ? 'calc' : costInputs.fuelPerDay.source,
      editable: true,
      toggleable: true,
      enabled: costInputs.fuelPerDay.enabled,
      field: 'fuelPerDay',
      rationale: costInputs.fuelPerDay.rationale,
      inputValue: costInputs.fuelPerDay.value,
      inputLabel: 'Benzin/Tag (EUR)',
      quantityLabel: `${nights} Tag${nights === 1 ? '' : 'e'}`,
      optional: true,
    },
  ];
}

const SOURCE_BADGE = { ai: 'KI', manual: 'Manuell', calc: 'Kalkuliert', db: 'Gespeichert' };
const SOURCE_TITLE = {
  ai: 'Per KI-Recherche ermittelt',
  manual: 'Manuell eingegeben',
  calc: 'Aus Paket und Stundensatz berechnet',
  db: 'Aus der gespeicherten Spesen-Datenbank übernommen',
};
