## Pierwsze kroki

### Jak zacząć

Po utworzeniu konta i zalogowaniu pierwszą rzeczą jest dodanie konta bankowego. Przejdź do menu **Konta** i wybierz: połączenie z bankiem (konto automatyczne) lub import wyciągu z PDF, Excel lub CSV (konto ręczne).

Połączenie automatyczne odbywa się przez certyfikowanych dostawców (GoCardless i Enable Banking). Twoje dane logowania nigdy nie przechodzą przez serwery Eurodata — uwierzytelnianie odbywa się bezpośrednio na stronie banku.

### Główna nawigacja

Pasek u góry daje dostęp do czterech sekcji:

| Ikona | Sekcja | Opis |
|-------|--------|------|
| 🧾 | **Transakcje** | Lista, filtry, kategoryzacja i zarządzanie transakcjami |
| 🏦 | **Konta** | Łączenie banków, import wyciągów, zarządzanie kontami |
| 📈 | **Analizy** | Wykresy przychodów, wydatków i trendów |
| 🔄 | **Cykliczne** | Zarządzanie płatnościami i przychodami okresowymi |

### Język i motyw

W prawym górnym rogu: **Zmień język** (ikona globu — 8 języków); **Motyw jasny/ciemny** (księżyc/słońce).

---

## Transakcje

Główna sekcja aplikacji: wszystkie zaimportowane transakcje z filtrami, kategoriami i narzędziami.

### Karty kont (u góry)

U góry karta dla każdego konta: logo banku, typ (dokument = ręczne, link = automatyczne), nazwa konta, instytucja, saldo bieżące i data ostatniej aktualizacji (jeśli „Pokaż salda” w profilu). Zaznaczenie karty filtruje listę transakcji.

### Przyciski akcji (prawy górny róg)

❓ Pomoc kontekstowa | 🔄 **Odśwież transakcje** | ⚖️ **Odśwież salda** (gdy salda włączone).

### Pasek listy

Zaznacz wszystko, Usuń zaznaczone, Szukaj, Wierszy na stronę (10/20/50), Wszystkie / Tylko nowe, Filtry kategorii i etykiet, 📄 Eksportuj CSV (także JSON i OFX).

### Elementy wiersza

Checkbox „Uwzględnij w Analizach”, etykieta „Nowa” (× = oznacz jako przejrzaną), „Oczekująca”, Kategoria (edytowalna, AI się uczy), 🔔 Cykliczna, 💬 Komentarz, 🗑️ Usuń, Etykiety, Kwota, Data księgowania, Data waluty, ▲▼ Strzałki ±1 dzień. Paginacja na dole.

---

## Konta

Sekcja **Konta**: zarządzanie wszystkimi kontami bankowymi.

### Istniejące konta

Każde konto na karcie: logo, typ, edytowalna nazwa (💾 zapisz), instytucja, saldo. Przyciski: 🔔 Alerty, 🔌 **Połącz ponownie** (gdy połączenie wygasło, zwykle 90 dni), 🔄 Pobierz transakcje (lub kreator importu dla ręcznych), 🗑️ Usuń.

### Połączenie z nowym bankiem

1. Wybierz **kraj** 2. Wyszukaj bank 3. Kliknij — przekierowanie na stronę banku do autoryzacji 4. Po autoryzacji konto się pojawia i transakcje są importowane. Połączenie ważne ok. 90 dni; przy wygaśnięciu użyj **Połącz ponownie**.

### Import wyciągu (konta ręczne)

Przycisk **Importuj wyciąg** lub **Pobierz transakcje** na koncie ręcznym: 1. Prześlij PDF/Excel/CSV 2. Analizuj (AI) 3. Sprawdź (ew. odwróć znaki) 4. Przypisz do istniejącego lub nowego konta.

---

## Analizy

Filtry u góry: Okres, Konta, Etykiety, Kategorie. Zapisane konfiguracje: 📂 Wczytaj, 💾 Zapisz, ⭐ Ustaw jako domyślną. 📄 Eksportuj PDF.

Rozwijane karty: Otrzymane (tabela przychodów), Zapłacone (wydatki), Według kategorii (słupki; w bieżącym miesiącu szacunek do końca miesiąca), Sumy (otrzymane, zapłacone, różnica), Saldo skumulowane (wykres liniowy), Porównanie miesięczne (tabela z eksportem CSV).

---

## Cykliczne

Płatności i przychody okresowe (czynsz, subskrypcje, wynagrodzenie). Przycisk 🔍 **Uruchom sugestie** — analizuje ostatnie 6 miesięcy, wykrywa wzorce z ≥60% pewnością.

Widok listy: filtry (Konto, Status, Sortuj, Szukaj), + Utwórz cykliczne ręcznie. Panel sugestii: ✅ Potwierdź, ✏️ Edytuj i potwierdź, ⏭️ Pomiń, ✖️ Odrzuć. Tabela: Nazwa, Częstotliwość, Następna data, Kwota, Status, Konto, Akcje. Widok kalendarza: nawigacja po miesiącach, znaczniki na dzień (zielony = wystąpiło, czerwony = brak).

Formularz tworzenia/edycji: Nazwa, Konto, Wzorzec opisu, Częstotliwość, Dzień kotwicy, Kwota oczekiwana/nominalna, Tolerancje dni i kwoty, Alert przy wystąpieniu i przy braku.

---

## Bot Telegram

Eurodata wysyła alerty i odpowiada na zapytania przez **Telegram** za pomocą bota **@bancos_alerts_bot**.

### Konfiguracja

1. **Profil** (menu prawy górny róg → Mój profil) 2. Sekcja Telegram, **Połącz Telegram** — link do bota 3. W Telegramie wyślij wiadomość do bota, potem **kod weryfikacyjny** z aplikacji (ważny 10 min) 4. Włącz **Alerty Telegram** w ustawieniach. Możesz też wyszukać **@bancos_alerts_bot** w Telegramie.

### Dostępne polecenia

| Polecenie | Opis |
|-----------|------|
| `/transactions [N]` | Ostatnie N transakcji (domyślnie 10; max 100) |
| `/next [N]` | Następne N cyklicznych (domyślnie 10) |
| `/balances` | Saldo na konto i suma |
| `/month [nazwa config]` | Sumy miesiąca; opcjonalnie nazwa config Analiz |
| `/year [nazwa config]` | Sumy roku do dziś |

---

## Subskrypcja

Okres próbny z pełnym dostępem. Potem aktywna subskrypcja jest potrzebna do: utrzymania automatycznych połączeń z bankami, codziennych aktualizacji transakcji i sald. Bez subskrypcji konta ręczne (import plików) działają dalej.

**Mój profil** → zakładka **Subskrypcja**: status, subskrybuj lub odnów, dodaj dodatkowe konta automatyczne. Plan bazowy obejmuje 2 konta automatyczne; można dodać więcej za dodatkową opłatą miesięczną.

---

## Wsparcie

W razie pytań lub problemów:

- 🐛 **Zgłoś błąd** — otwórz issue w publicznym repozytorium
- 💡 **Zaproponuj funkcję** — podziel się pomysłami
- 💬 **GitHub Discussions** — [github.com/kal001/eurodata-public/discussions](https://github.com/kal001/eurodata-public/discussions)

---
