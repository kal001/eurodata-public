## Erste Schritte

### So geht's los

Nach der Registrierung und Anmeldung fügen Sie zuerst ein Bankkonto hinzu. Gehen Sie zum Menü **Konten** und wählen Sie zwischen direkter Bankverbindung (automatisches Konto) oder Import eines Kontoauszugs per PDF, Excel oder CSV (manuelles Konto).

Die automatische Verbindung läuft über zertifizierte Anbieter (GoCardless und Enable Banking). Ihre Bankdaten werden nicht über die Server von Eurodata übertragen — die Anmeldung erfolgt direkt auf der Bank-Website.

### Hauptnavigation

Die obere Leiste führt zu den vier Bereichen:

| Icon | Bereich | Beschreibung |
|------|---------|--------------|
| 🧾 | **Transaktionen** | Transaktionen auflisten, filtern, kategorisieren und verwalten |
| 🏦 | **Konten** | Banken verbinden, Kontoauszüge importieren, Konten verwalten |
| 📈 | **Analysen** | Einnahmen, Ausgaben und Trends in Grafiken |
| 🔄 | **Wiederkehrend** | Wiederkehrende Zahlungen und Einnahmen verwalten |

### Sprache und Design

Oben rechts: **Sprache wechseln** (Globus-Icon — 8 Sprachen); **Hell/Dunkel** (Mond/Sonne).

---

## Transaktionen

Hauptbereich der App: alle importierten Transaktionen mit Filtern, Kategorien und Organisation.

### Konten-Karten (oben)

Jedes Konto als Karte: Bank-Logo, Typ (Dokument = manuell, Link = automatisch), Kontoname, Institut, aktueller Saldo und letztes Update (wenn „Saldi anzeigen“ im Profil aktiv). Checkbox filtert die angezeigten Transaktionen.

### Aktionsbuttons (oben rechts)

❓ Kontexthilfe | 🔄 **Transaktionen aktualisieren** | ⚖️ **Saldi aktualisieren** (wenn Saldi aktiv).

### Listen-Leiste

Alle auswählen, Ausgewählte löschen, Suche, Zeilen pro Seite (10/20/50), Alle / Nur neue, Kategorien- und Tag-Filter, 📄 CSV exportieren (auch JSON, OFX).

### Pro Zeile

Checkbox „In Analysen einbeziehen“, „Neu“-Badge (× = als gelesen), „Ausstehend“, Kategorie (bearbeitbar, KI lernt), 🔔 Wiederkehrend, 💬 Kommentar, 🗑️ Löschen, Tags, Betrag, Buchungsdatum, Valutadatum, ▲▼ Datum ±1 Tag anpassen. Paginierung unten.

---

## Konten

Bereich **Konten**: alle Bankkonten verwalten — neue Banken verbinden, Kontoauszüge importieren oder bestehende Konten verwalten.

### Bestehende Konten

Karte pro Konto: Logo, Typ, bearbeitbarer Name (💾 speichern), Institut, Saldo. Buttons: 🔔 Alerten, 🔌 **Erneut verbinden** (wenn Verbindung abgelaufen, meist 90 Tage), 🔄 Transaktionen abrufen (bzw. Import-Assistent bei manuellen), 🗑️ Löschen.

### Neue Bank verbinden

1. **Land** wählen 2. Bank suchen 3. Klick — Weiterleitung zur Bank zur Freigabe 4. Danach erscheint das Konto, Transaktionen werden importiert. Verbindung ca. 90 Tage gültig; bei Ablauf **Erneut verbinden** nutzen.

### Kontoauszug importieren (manuelle Konten)

**Kontoauszug importieren** oder **Transaktionen abrufen** bei manuellem Konto: 1. PDF/Excel/CSV hochladen 2. Analysieren (KI) 3. Prüfen (ggf. Vorzeichen umkehren) 4. Bestehendem oder neuem Konto zuordnen.

---

## Analysen

Filter oben: Zeitraum, Konten, Tags, Kategorien. Gespeicherte Konfigurationen: 📂 Laden, 💾 Speichern, ⭐ Als Standard. 📄 PDF exportieren.

Karten (auf-/zuklappbar): Erhalten (Einnahmen-Tabelle), Bezahlt (Ausgaben), Nach Kategorie (Balken; im aktuellen Monat Schätzung Monatsende), Summen (erhalten, bezahlt, Differenz), Kumulierter Saldo (Linie), Monatsvergleich (Tabelle, CSV-Export).

---

## Wiederkehrend

Wiederkehrende Zahlungen und Einnahmen (Miete, Abos, Gehalt). 🔍 **Vorschläge ausführen** — analysiert die letzten 6 Monate, erkennt Muster mit ≥60 % Konfidenz.

Listenansicht: Filter (Konto, Status, Sortierung, Suche), + Manuell anlegen. Vorschlags-Panel: ✅ Bestätigen, ✏️ Bearbeiten und bestätigen, ⏭️ Überspringen, ✖️ Verwerfen. Tabelle: Name, Frequenz, Nächstes Datum, Betrag, Status, Konto, Aktionen. Kalenderansicht: Monat, Markierungen pro Tag (grün = eingetreten, rot = ausgeblieben).

Formular: Name, Konto, Beschreibungsmuster, Frequenz, Ankertag, Erwarteter/Nominalbetrag, Toleranzen Tage/Betrag, Alert bei Eintritt und bei Fehlen.

---

## Telegram-Bot

Eurodata sendet Alerten und beantwortet Abfragen per **Telegram** über den Bot **@bancos_alerts_bot**.

### Einrichtung

1. **Profil** (Menü oben rechts → Mein Profil) 2. Bereich Telegram, **Telegram verknüpfen** — Link zum Bot 3. In Telegram Nachricht an den Bot, dann **Bestätigungscode** aus der App (10 Min. gültig) 4. **Telegram-Alerten** in den Einstellungen aktivieren. Oder direkt **@bancos_alerts_bot** in Telegram suchen.

### Befehle

| Befehl | Beschreibung |
|--------|---------------|
| `/transactions [N]` | Letzte N Transaktionen (Standard 10; max 100) |
| `/next [N]` | Nächste N wiederkehrende (Standard 10) |
| `/balances` | Saldo pro Konto und Gesamt |
| `/month [Config]` | Monatssummen; optional Name einer Analysen-Config |
| `/year [Config]` | Jahressummen bis heute |

---

## Abonnement

Kostenlose Testphase mit allen Funktionen. Danach aktives Abo für: automatische Bankverbindungen, tägliche Transaktions- und Saldo-Updates. Ohne Abo funktionieren manuelle Konten (Datei-Import) weiter.

**Mein Profil** → **Abonnement**: Status, Abonnieren/Verlängern, zusätzliche automatische Konten. Basisplan enthält 2 automatische Konten; weitere gegen Aufpreis.

---

## Support

Bei Fragen oder Problemen:

- 🐛 **Bug melden** — Issue im öffentlichen Repository
- 💡 **Funktion vorschlagen** — Ideen teilen
- 💬 **GitHub Discussions** — [github.com/kal001/eurodata-public/discussions](https://github.com/kal001/eurodata-public/discussions)

---
