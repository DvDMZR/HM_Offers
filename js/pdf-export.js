// Angebots-PDF-Export via jsPDF + jspdf-autotable

function addOfferValidityDate(createdAtISO, validityDays) {
  const base = createdAtISO ? new Date(createdAtISO) : new Date();
  const until = new Date(base);
  until.setDate(until.getDate() + (validityDays || 30));
  return until;
}

function exportOfferPdf({ offer, packageMetrics, selectedPackage, calcResult, settings }) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const createdAt = offer.createdAt || new Date().toISOString();
  const validUntil = addOfferValidityDate(createdAt, offer.offerValidityDays);
  const dateStr = new Date(createdAt).toLocaleDateString('de-DE');
  const validUntilStr = validUntil.toLocaleDateString('de-DE');
  const offerNumber = `HM-${new Date(createdAt).getTime().toString().slice(-8)}`;

  let y = 18;

  // --- Kopfbereich ---
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Ihr Firmenname', 14, y);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Angebot Nr. ${offerNumber}`, 196, y, { align: 'right' });
  y += 6;
  doc.text(`Erstellungsdatum: ${dateStr}`, 196, y, { align: 'right' });
  y += 5;
  doc.text(`Gültig bis: ${validUntilStr}`, 196, y, { align: 'right' });
  y += 12;

  doc.setDrawColor(200);
  doc.line(14, y, 196, y);
  y += 8;

  // --- Kundendaten-Platzhalter ---
  doc.setFont(undefined, 'bold');
  doc.text('Kundendaten', 14, y);
  doc.setFont(undefined, 'normal');
  y += 6;
  doc.text(`Kunde: ${offer.customerName || '________________________'}`, 14, y);
  y += 6;
  doc.text('Ansprechpartner: ________________________', 14, y);
  y += 6;
  doc.text('Adresse: ________________________', 14, y);
  y += 12;

  // --- Projektinfo ---
  doc.setFont(undefined, 'bold');
  doc.text('Projekt', 14, y);
  doc.setFont(undefined, 'normal');
  y += 6;
  doc.text(`Projekttitel: ${offer.projectTitle || '-'}`, 14, y);
  y += 6;
  doc.text(`Zielland / Zielstadt: ${offer.country || '-'}${offer.city ? ' / ' + offer.city : ''}`, 14, y);
  y += 6;
  doc.text(`Beratungspaket: ${selectedPackage.label}`, 14, y);
  y += 6;
  if (offer.travelDateRange && (offer.travelDateRange.from || offer.travelDateRange.to)) {
    doc.text(`Reisezeitraum: ${offer.travelDateRange.from || '?'} bis ${offer.travelDateRange.to || '?'}`, 14, y);
    y += 6;
  }
  y += 4;

  // --- Leistungsübersicht ---
  doc.autoTable({
    startY: y,
    head: [['Leistungsübersicht', 'Wert']],
    body: [
      ['Vor-Ort-Stunden', formatNumberDE(packageMetrics.hoursOnSite)],
      ['Reisezeit-Stunden', formatNumberDE(packageMetrics.travelHours)],
      ['Anzahl Einsätze vor Ort', String(packageMetrics.travels)],
      ['Gesamttage', formatNumberDE(packageMetrics.totalDays)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59] },
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 10;

  // --- Kostenübersicht ---
  if (offer.showDetailedCosts) {
    doc.autoTable({
      startY: y,
      head: [['Position', 'Betrag']],
      body: [
        ['Honorar Vor-Ort', formatCurrencyEUR(calcResult.honorarVorOrt)],
        ['Honorar Reisezeit', formatCurrencyEUR(calcResult.honorarReisezeit)],
        ['Spesen gesamt', formatCurrencyEUR(calcResult.spesenGesamt)],
        ['Hotelkosten gesamt', formatCurrencyEUR(calcResult.hotelkostenGesamt)],
        ['Flugkosten gesamt', formatCurrencyEUR(calcResult.flugkostenGesamt)],
        ['Mietwagenkosten gesamt', formatCurrencyEUR(calcResult.mietwagenGesamt)],
        ['Zwischensumme', formatCurrencyEUR(calcResult.zwischensumme)],
        [`Aufschlag (${settings.marginPercent}%)`, formatCurrencyEUR(calcResult.aufschlag)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // --- Finaler VK-Preis ---
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, 182, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Finaler Verkaufspreis (VK-Preis):', 18, y + 8);
  doc.text(formatCurrencyEUR(calcResult.vkPreis), 192, y + 8, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  y += 24;

  // --- Footer: Unterschriften & AGB ---
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  y += 10;
  doc.line(14, y, 80, y);
  doc.line(116, y, 182, y);
  y += 5;
  doc.text('Unterschrift Kunde, Datum', 14, y);
  doc.text('Unterschrift Anbieter, Datum', 116, y);
  y += 12;
  doc.setFontSize(8);
  doc.text('Es gelten unsere Allgemeinen Geschäftsbedingungen, einsehbar unter [AGB-Link einfügen].', 14, y);

  const safeName = (offer.projectTitle || offer.country || 'Angebot').replace(/[^a-z0-9]+/gi, '_');
  const dateForFilename = new Date(createdAt).toISOString().slice(0, 10).replace(/-/g, '');
  doc.save(`Angebot_${safeName}_${dateForFilename}.pdf`);
}
