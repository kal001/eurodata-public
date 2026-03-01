## Primi passi

### Come iniziare

Dopo aver creato l'account e effettuato l'accesso, la prima cosa da fare è aggiungere un conto bancario. Vai al menu **Conti** e scegli tra collegare una banca direttamente (conto automatico) o importare un estratto in PDF, Excel o CSV (conto manuale).

Il collegamento automatico avviene tramite fornitori certificati (GoCardless e Enable Banking). Le tue credenziali bancarie non passano mai dai server di Eurodata — l'autenticazione avviene direttamente sul sito della banca.

### Navigazione principale

La barra in alto dà accesso alle quattro sezioni:

| Icona | Sezione | Descrizione |
|-------|---------|-------------|
| 🧾 | **Transazioni** | Elencare, filtrare, categorizzare e gestire le transazioni |
| 🏦 | **Conti** | Collegare banche, importare estratti, gestire i conti |
| 📈 | **Analisi** | Grafici di entrate, uscite e tendenze |
| 🔄 | **Ricorrenti** | Gestire pagamenti e incassi periodici |

### Lingua e tema

In alto a destra: **Cambia lingua** (icona globo — 8 lingue); **Tema chiaro/scuro** (luna/sole).

---

## Transazioni

Sezione principale: tutte le transazioni importate con filtri, categorie e strumenti di organizzazione.

### Schede conti (in alto)

In alto una scheda per ogni conto: logo banca, tipo (documento = manuale, link = automatico), nome conto, istituto, saldo attuale e data ultimo aggiornamento (se "Mostra saldi" è attivo nel profilo). La checkbox filtra le transazioni in elenco.

### Pulsanti azione (in alto a destra)

❓ Aiuto contestuale | 🔄 **Aggiorna transazioni** | ⚖️ **Aggiorna saldi** (se saldi attivi).

### Barra elenco

Seleziona tutto, Elimina selezionate, Cerca, Righe per pagina (10/20/50), Tutte / Solo nuove, Filtri categorie e tag, 📄 Esporta CSV (anche JSON e OFX).

### Per ogni riga

Checkbox "Includi in Analisi", etichetta "Nuova" (× per segnare come vista), "In attesa", Categoria (modificabile, l'IA impara), 🔔 Ricorrente, 💬 Commento, 🗑️ Elimina, Tag, Importo, Data di contabilizzazione, Data di valuta, ▲▼ Frecce per aggiustare data ±1 giorno. Paginazione in basso.

---

## Conti

Sezione **Conti**: gestione di tutti i conti bancari.

### Conti esistenti

Ogni conto in una scheda: logo, tipo, nome modificabile (💾 salva), istituto, saldo. Pulsanti: 🔔 Avvisi, 🔌 **Ricollega** (quando il collegamento è scaduto, di solito 90 giorni), 🔄 Ottieni transazioni (o wizard import per manuali), 🗑️ Elimina.

### Collegare una nuova banca

1. Seleziona **paese** 2. Cerca la banca 3. Clicca — reindirizzamento al sito della banca per autorizzare 4. Dopo l'autorizzazione il conto appare e le transazioni vengono importate. Collegamento valido circa 90 giorni; usare **Ricollega** alla scadenza.

### Importare estratto (conti manuali)

Pulsante **Importa estratto** o **Ottieni transazioni** su un conto manuale: 1. Carica PDF/Excel/CSV 2. Analizza (IA) 3. Rivedi (inverti segni se serve) 4. Assegna a conto esistente o nuovo.

---

## Analisi

Filtri in alto: Periodo, Conti, Tag, Categorie. Configurazioni salvate: 📂 Carica, 💾 Salva, ⭐ Imposta come predefinita. 📄 Esporta PDF.

Schede espandibili: Ricevuti (tabella entrate), Pagati (uscite), Per categoria (barre; nel mese corrente stima a fine mese), Totali (ricevuto, pagato, differenza), Saldo accumulato (grafico a linea), Confronto mensile (tabella con export CSV).

---

## Ricorrenti

Pagamenti e incassi periodici (affitto, abbonamenti, stipendio). Pulsante 🔍 **Esegui suggerimenti** — analizza gli ultimi 6 mesi e rileva pattern con ≥60% di confidenza.

Vista elenco: filtri (Conto, Stato, Ordina, Cerca), + Crea ricorrente manuale. Pannello suggerimenti: ✅ Conferma, ✏️ Modifica e conferma, ⏭️ Salta, ✖️ Scarta. Tabella: Nome, Frequenza, Prossima data, Importo, Stato, Conto, Azioni. Vista calendario: navigazione per mese, marcatori per giorno (verde = avvenuto, rosso = mancato).

Form di creazione/modifica: Nome, Conto, Pattern descrizione, Frequenza, Giorno ancoraggio, Importo atteso/nominale, Tolleranze giorni e importo, Avvisi in caso di occorrenza e di mancata.

---

## Bot Telegram

Eurodata invia avvisi e risponde alle richieste via **Telegram** con il bot **@bancos_alerts_bot**.

### Configurazione

1. **Profilo** (menu in alto a destra → Il mio profilo) 2. Sezione Telegram, **Collega Telegram** — link al bot 3. In Telegram invia un messaggio al bot poi il **codice di verifica** mostrato nell'app (valido 10 min) 4. Attiva **Avvisi Telegram** nelle preferenze. Puoi anche cercare **@bancos_alerts_bot** su Telegram.

### Comandi

| Comando | Descrizione |
|---------|-------------|
| `/transactions [N]` | Ultime N transazioni (default 10; max 100) |
| `/next [N]` | Prossime N ricorrenti (default 10) |
| `/balances` | Saldo per conto e totale |
| `/month [config]` | Totali del mese; opzionale nome config Analisi |
| `/year [config]` | Totali anno a oggi |

---

## Abbonamento

Periodo di prova gratuito con tutte le funzionalità. Dopo, serve un abbonamento attivo per: mantenere i collegamenti automatici alle banche, ricevere aggiornamenti giornalieri. Senza abbonamento i conti manuali (import file) continuano a funzionare.

**Il mio profilo** → scheda **Abbonamento**: stato, sottoscrivi o rinnova, aggiungi conti automatici extra. Il piano base include 2 conti automatici; è possibile aggiungerne altri a costo mensile ridotto.

---

## Supporto

Per domande o problemi:

- 🐛 **Segnala un bug** — apri una issue sul repository pubblico
- 💡 **Suggerisci una funzionalità** — condividi le tue idee
- 💬 **GitHub Discussions** — [github.com/kal001/eurodata-public/discussions](https://github.com/kal001/eurodata-public/discussions)

---
