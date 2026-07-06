// Hilfsfunktionen für das Live-Kalkulations-Dashboard: Zeilenaufbau für die Anzeige

// icon: 'ai' (KI-Funke), 'manual' (Stift), 'calc' (Taschenrechner, rein berechnet)
function buildLineItems(packageMetrics, costInputs, calcResult) {
  return [
    {
      key: 'honorarVorOrt',
      label: 'Honorar Vor-Ort',
      amount: calcResult.honorarVorOrt,
      icon: 'calc',
      editable: false,
    },
    {
      key: 'honorarReisezeit',
      label: 'Honorar Reisezeit',
      amount: calcResult.honorarReisezeit,
      icon: 'calc',
      editable: false,
    },
    {
      key: 'spesenGesamt',
      label: 'Spesen gesamt',
      amount: calcResult.spesenGesamt,
      icon: costInputs.spesensatzPerDay.source === 'unset' ? 'calc' : costInputs.spesensatzPerDay.source,
      editable: true,
      field: 'spesensatzPerDay',
      rationale: costInputs.spesensatzPerDay.rationale,
      inputValue: costInputs.spesensatzPerDay.value,
      inputLabel: 'Spesensatz/Tag (EUR)',
    },
    {
      key: 'hotelkostenGesamt',
      label: 'Hotelkosten gesamt',
      amount: calcResult.hotelkostenGesamt,
      icon: costInputs.hotelPerNight.source === 'unset' ? 'calc' : costInputs.hotelPerNight.source,
      editable: true,
      field: 'hotelPerNight',
      rationale: costInputs.hotelPerNight.rationale,
      inputValue: costInputs.hotelPerNight.value,
      inputLabel: 'Hotel/Nacht (EUR)',
    },
    {
      key: 'flugkostenGesamt',
      label: 'Flugkosten gesamt',
      amount: calcResult.flugkostenGesamt,
      icon: costInputs.flightRoundTrip.source === 'unset' ? 'calc' : costInputs.flightRoundTrip.source,
      editable: true,
      field: 'flightRoundTrip',
      rationale: costInputs.flightRoundTrip.rationale,
      inputValue: costInputs.flightRoundTrip.value,
      inputLabel: 'Flug Round-Trip (EUR)',
    },
    {
      key: 'mietwagenGesamt',
      label: 'Mietwagenkosten gesamt',
      amount: calcResult.mietwagenGesamt,
      icon: costInputs.rentalCarPerDay.source === 'unset' ? 'calc' : costInputs.rentalCarPerDay.source,
      editable: true,
      field: 'rentalCarPerDay',
      rationale: costInputs.rentalCarPerDay.rationale,
      inputValue: costInputs.rentalCarPerDay.value,
      inputLabel: 'Mietwagen/Tag (EUR)',
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
