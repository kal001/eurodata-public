## Aan de slag

### Hoe te beginnen

Na het aanmaken van een account en inloggen is de eerste stap een bankrekening toevoegen. Ga naar het menu **Rekeningen** en kies tussen een bank direct koppelen (automatische rekening) of een afschrift importeren via PDF, Excel of CSV (handmatige rekening).

De automatische koppeling verloopt via gecertificeerde aanbieders (GoCardless en Enable Banking). Uw bankgegevens gaan nooit via de servers van Eurodata — de authenticatie gebeurt direct op de site van de bank.

### Hoofdnavigatie

De balk bovenaan geeft toegang tot de vier secties:

| Pictogram | Sectie | Beschrijving |
|-----------|--------|--------------|
| 🧾 | **Transacties** | Transacties bekijken, filteren, categoriseren en beheren |
| 🏦 | **Rekeningen** | Banken koppelen, afschriften importeren, rekeningen beheren |
| 📈 | **Inzichten** | Grafieken van inkomsten, uitgaven en trends |
| 🔄 | **Terugkerend** | Terugkerende betalingen en inkomsten beheren |

### Taal en thema

Rechtsboven: **Taal wijzigen** (globe-icoon — 8 talen); **Licht/donker thema** (maan/zon).

---

## Transacties

Hoofdsectie van de app: alle geïmporteerde transacties met filters, categorieën en beheer.

### Rekeningkaarten (boven)

Bovenaan een kaart per rekening: banklogo, type (document = handmatig, link = automatisch), rekeningnaam, instelling, actueel saldo en laatst bijgewerkt (als "Saldi tonen" in profiel aan staat). Vinkje filtert de getoonde transacties.

### Actieknoppen (rechtsboven)

❓ Contextuele help | 🔄 **Transacties vernieuwen** | ⚖️ **Saldi vernieuwen** (als saldi aan).

### Lijstwerkbalk

Alles selecteren, Geselecteerde verwijderen, Zoeken, Rijen per pagina (10/20/50), Alles / Alleen nieuwe, Filters categorieën en tags, 📄 CSV exporteren (ook JSON en OFX).

### Per rij

Vinkje "Meenemen in Inzichten", label "Nieuw" (× = als bekeken markeren), "In behandeling", Categorie (bewerkbaar, AI leert), 🔔 Terugkerend, 💬 Opmerking, 🗑️ Verwijderen, Tags, Bedrag, Boekingsdatum, Valutadatum, ▲▼ Pijlen om datum ±1 dag aan te passen. Paginering onderaan.

---

## Rekeningen

Sectie **Rekeningen**: beheer van alle bankrekeningen.

### Bestaande rekeningen

Per rekening een kaart: logo, type, bewerkbare naam (💾 opslaan), instelling, saldo. Knoppen: 🔔 Meldingen, 🔌 **Opnieuw koppelen** (als koppeling verlopen is, meestal 90 dagen), 🔄 Transacties ophalen (of importwizard bij handmatige), 🗑️ Verwijderen.

### Nieuwe bank koppelen

1. **Land** kiezen 2. Bank zoeken 3. Klikken — doorverwijzing naar de bank om toegang te autoriseren 4. Daarna verschijnt de rekening en worden transacties geïmporteerd. Koppeling geldig ca. 90 dagen; bij verlopen **Opnieuw koppelen** gebruiken.

### Afschrift importeren (handmatige rekeningen)

Knop **Afschrift importeren** of **Transacties ophalen** op een handmatige rekening: 1. PDF/Excel/CSV uploaden 2. Analyseren (AI) 3. Controleren (eventueel tekens omkeren) 4. Toewijzen aan bestaande of nieuwe rekening.

---

## Inzichten

Filters bovenaan: Periode, Rekeningen, Tags, Categorieën. Opgeslagen configuraties: 📂 Laden, 💾 Opslaan, ⭐ Als standaard. 📄 PDF exporteren.

Uitklapbare kaarten: Ontvangen (inkomsten-tabel), Betaald (uitgaven), Per categorie (balken; in huidige maand schatting tot einde maand), Totalen (ontvangen, betaald, verschil), Opgebouwd saldo (lijngrafiek), Maandvergelijking (tabel met CSV-export).

---

## Terugkerend

Terugkerende betalingen en inkomsten (huur, abonnementen, salaris). Knop 🔍 **Suggesties uitvoeren** — analyseert de laatste 6 maanden, detecteert patronen met ≥60% vertrouwen.

Lijstweergave: filters (Rekening, Status, Sorteren, Zoeken), + Handmatig terugkerende aanmaken. Suggestiepaneel: ✅ Bevestigen, ✏️ Bewerken en bevestigen, ⏭️ Overslaan, ✖️ Afwijzen. Tabel: Naam, Frequentie, Volgende datum, Bedrag, Status, Rekening, Acties. Kalenderweergave: navigatie per maand, markeringen per dag (groen = uitgevoerd, rood = gemist).

Formulier aanmaken/bewerken: Naam, Rekening, Beschrijvingspatroon, Frequentie, Ankerdag, Verwachte/nominaal bedrag, Toleranties dagen en bedrag, Melding bij optreden en bij ontbreken.

---

## Telegram-bot

Eurodata stuurt meldingen en beantwoordt vragen via **Telegram** met de bot **@bancos_alerts_bot**.

### Instellen

1. **Profiel** (menu rechtsboven → Mijn profiel) 2. Sectie Telegram, **Telegram koppelen** — link naar de bot 3. In Telegram een bericht naar de bot sturen en daarna de **verificatiecode** uit de app (10 min geldig) 4. **Telegram-meldingen** inschakelen in voorkeuren. U kunt ook direct op **@bancos_alerts_bot** zoeken in Telegram.

### Beschikbare commando's

| Commando | Beschrijving |
|----------|--------------|
| `/transactions [N]` | Laatste N transacties (standaard 10; max 100) |
| `/next [N]` | Volgende N terugkerende (standaard 10) |
| `/balances` | Saldo per rekening en totaal |
| `/month [config]` | Totalen van de maand; optioneel naam Inzichten-config |
| `/year [config]` | Totalen jaar tot nu |

---

## Abonnement

Gratis proefperiode met alle functies. Daarna is een actief abonnement nodig voor: automatische bankkoppelingen behouden, dagelijkse updates van transacties en saldi. Zonder abonnement blijven handmatige rekeningen (bestandsimport) werken.

**Mijn profiel** → tab **Abonnement**: status bekijken, abonneren of verlengen, extra automatische rekeningen toevoegen. Basisplan bevat 2 automatische rekeningen; meer tegen extra maandelijkse kosten.

---

## Ondersteuning

Bij vragen of problemen:

- 🐛 **Bug melden** — open een issue in de openbare repository
- 💡 **Functie voorstellen** — deel uw ideeën
- 💬 **GitHub Discussions** — [github.com/kal001/eurodata-public/discussions](https://github.com/kal001/eurodata-public/discussions)

---
