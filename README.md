# HM Offers

Kalkulationstool für HM-Beratungspakete: Paket wählen, Zielland/-ort angeben, Reisekosten
per KI schätzen lassen (oder manuell eintragen) und einen fertigen Angebots-PDF-Export
erzeugen.

## Nutzung

Es gibt keinen Build-Schritt und keinen Server. Zwei Wege, das Tool zu öffnen:

1. **Lokal**: `index.html` direkt im Browser öffnen (Doppelklick).
2. **GitHub Pages**: Repository als statische Seite deployen (Settings → Pages → Branch
   wählen). Das Tool verhält sich in beiden Fällen identisch, da der einzige
   Netzwerk-Aufruf (die KI-Abfrage) ohnehin HTTPS erfordert — unabhängig davon, ob die
   Seite selbst über `file://` oder `https://` ausgeliefert wird.

## KI-Integration (Smart Fill)

Unter **Einstellungen → KI- & API-Einstellungen** einen eigenen API-Key hinterlegen
(Standard-Provider: Anthropic Claude). Danach kann in der Projektauswahl über
"KI-Reisekosten live abrufen" eine Schätzung für Spesensatz, Flug, Hotel und Mietwagen
abgerufen werden. Alle Werte bleiben danach frei editierbar.

**Sicherheitshinweis**: Der API-Key wird ausschließlich lokal im Browser
(`localStorage`) gespeichert und bei jeder Anfrage direkt an den KI-Anbieter gesendet.
Er ist im Klartext im Browser-Speicher und in Netzwerk-Requests (DevTools) sichtbar.
Verwenden Sie nur einen persönlichen Schlüssel und geben Sie dieses Tool nicht mit
eingetragenem Key an Dritte weiter oder committen Sie ihn niemals ins Repository.

## Spesen-Datenbank

Ermittelte BMF-Spesensätze werden automatisch je Land gespeichert und beim nächsten
Angebot für dasselbe Land direkt übernommen. Unter **Einstellungen →
Spesen-Datenbank** lassen sich Länder hinzufügen, Sätze manuell korrigieren und alle
gespeicherten Sätze per Knopfdruck über die KI aktualisieren.

## Persistenz

Einstellungen, Paketdefinitionen, Spesensätze und das aktuelle Angebot werden
automatisch in `localStorage` gespeichert und beim erneuten Öffnen wiederhergestellt.
Es gibt keine Datenbank und kein Backend. Das Tool lädt keine externen Ressourcen —
alle Bibliotheken liegen lokal im Ordner `vendor/`; nur die KI-Abfrage benötigt eine
Internetverbindung.

## Export

Der Button "Angebot als PDF exportieren" erzeugt ein formelles Angebot inkl.
Kundendaten-Platzhaltern, Leistungsübersicht, Kostenaufstellung (oder wahlweise nur dem
finalen Pauschalpreis) sowie Unterschriften-/AGB-Platzhaltern.
