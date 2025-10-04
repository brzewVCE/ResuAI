# ResuAI - Inteligentny Generator CV

Generator CV wykorzystujący AI (Gemini) do tworzenia profesjonalnych CV na podstawie opisów w języku naturalnym.

## Funkcje

- **Opis w języku naturalnym**: Opisz swoje doświadczenie i umiejętności w naturalny sposób
- **Generowanie przez AI**: Gemini automatycznie tworzy profesjonalne tytuły stanowisk i bullet pointy
- **Interaktywny podgląd**: Zobacz swoje CV na żywo podczas edycji
- **Export do PDF**: Zapisz gotowe CV jako plik PDF
- **Zarządzanie kluczem API**: Bezpieczne przechowywanie klucza API Gemini

## Instalacja

1. **Zainstaluj zależności**:
   ```bash
   pip install -r requirements.txt
   python -m playwright install
   ```
   
   Lub użyj pliku batch na Windows:
   ```bash
   install.bat
   ```

2. **Uruchom aplikację**:
   ```bash
   python app.py
   ```

3. **Otwórz w przeglądarce**: http://localhost:5000

## Konfiguracja API

1. **Uzyskaj klucz API Gemini**:
   - Idź na [Google AI Studio](https://aistudio.google.com/)
   - Zaloguj się swoim kontem Google
   - Kliknij "Get API Key"
   - Skopiuj wygenerowany klucz

2. **Wprowadź klucz w aplikacji**:
   - W sekcji "API Key Management" wprowadź swój klucz
   - Kliknij "Save Key"
   - Status powinien pokazać "API Key set & LLM active"

## Jak używać

### 1. Podstawowe informacje
- Wprowadź swoje imię i nazwisko
- Dodaj zdjęcie profilowe (opcjonalne)
- Uzupełnij dane kontaktowe (telefon, email, LinkedIn, etc.)

### 2. Doświadczenie zawodowe
- Kliknij "Add Experience"
- **Opisz swoją rolę** w polu "Your Role Description" w naturalny sposób, np.:
  ```
  Zarządzałem zespołem 5 programistów, rozwijaliśmy aplikację e-commerce 
  w React i Node.js. Odpowiadałem za architekturę systemu, code review 
  i współpracę z klientami. Wdrożyliśmy system CI/CD który przyspieszył 
  wdrożenia o 50%.
  ```
- Użyj przycisków AI:
  - **"AI Generate Title"** - wygeneruje profesjonalny tytuł stanowiska
  - **"AI Generate Bullets"** - stworzy bullet pointy na podstawie opisu
- Uzupełnij firmę, lokalizację i daty

### 3. Umiejętności
- W polu "Your Initial Skill Ideas" opisz swoje umiejętności, np.:
  ```
  Python, JavaScript, React, Django, bazy danych SQL, machine learning, 
  zarządzanie zespołem, metodyki Agile, AWS, Docker
  ```
- Kliknij **"Gen Skills"** - AI pogrupuje umiejętności w logiczne kategorie

### 4. Kontekst oferty pracy
- W polu "Target Job Description" wklej opis oferty pracy, na którą aplikujesz
- AI wykorzysta ten kontekst do lepszego dostosowania treści CV

### 5. Generowanie PDF
- Po skończeniu edycji, CV zostanie automatycznie zapisane
- Użyj funkcji eksportu przeglądarki (Ctrl+P) aby zapisać jako PDF

## Przykłady użycia

### Opis doświadczenia:
**Zamiast**: "Programista"
**Napisz**: "Programowałem aplikacje webowe w Python Django, tworzyłem API REST, współpracowałem z zespołem frontend w React, optymalizowałem wydajność baz danych PostgreSQL"

**AI wygeneruje**:
- Tytuł: "Full Stack Developer"
- Bullet pointy:
  - "Rozwijałem aplikacje webowe wykorzystując Python Django i REST API"
  - "Współpracowałem z zespołem frontend przy integracji React z backendem"
  - "Optymalizowałem wydajność baz danych PostgreSQL, poprawiając czas odpowiedzi o 40%"

### Opis umiejętności:
**Napisz**: "programowanie Python, analiza danych, machine learning, Excel, prezentacje, zarządzanie projektami"

**AI wygeneruje**:
- **Programowanie**: Python, Machine Learning, Analiza Danych
- **Narzędzia**: Excel, Jupyter Notebook, Git
- **Soft Skills**: Zarządzanie Projektami, Prezentacje, Komunikacja

## Bezpieczeństwo

- Klucz API jest przechowywany lokalnie w `ai_config.json`
- Nie udostępniaj tego pliku publicznie
- Aplikacja działa lokalnie - poufne dane nie są wysyłane na zewnętrzne serwery
- Dane wysyłane do Gemini nie zawierają danych osobistych
