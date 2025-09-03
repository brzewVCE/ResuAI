# Prompty AI - Folder prompts

Ten folder zawiera wszystkie prompty używane przez aplikację ResuAI do generowania różnych części CV.

## Struktura plików

Każdy prompt ma dwie wersje językowe:
- `*_pl.txt` - wersja polska
- `*_en.txt` - wersja angielska

## Dostępne prompty

### 1. Generowanie tytułów stanowisk
- `job_title_pl.txt` - prompt do generowania tytułów stanowisk (PL)
- `job_title_en.txt` - prompt do generowania tytułów stanowisk (EN)

### 2. Generowanie bullet pointów
- `bullet_points_pl.txt` - prompt do generowania punktów doświadczenia (PL)
- `bullet_points_en.txt` - prompt do generowania punktów doświadczenia (EN)

### 3. Generowanie umiejętności
- `skills_pl.txt` - prompt do kategoryzowania umiejętności (PL)
- `skills_en.txt` - prompt do kategoryzowania umiejętności (EN)

### 4. Generowanie opisów projektów
- `project_description_pl.txt` - prompt do opisywania projektów (PL)
- `project_description_en.txt` - prompt do opisywania projektów (EN)

## Zmienne w promptach

Prompty używają następujących zmiennych, które są automatycznie zastępowane:

- `{user_description}` - opis wprowadzony przez użytkownika
- `{job_context}` - kontekst oferty pracy
- `{company}` - nazwa firmy
- `{num_bullets}` - liczba bullet pointów do wygenerowania (tylko dla bullet_points)

## Jak edytować prompty

1. Otwórz odpowiedni plik `.txt` w edytorze
2. Edytuj treść promptu zachowując zmienne w nawiasach klamrowych `{zmienna}`
3. Zapisz plik
4. Zmiany będą automatycznie używane przy następnym uruchomieniu aplikacji

## Uwagi

- **Nie usuwaj zmiennych** w nawiasach klamrowych - są one wymagane do prawidłowego działania
- Zachowaj format JSON w odpowiedziach tam gdzie jest wymagany
- Testuj zmiany po edycji, aby upewnić się, że AI zwraca poprawne odpowiedzi
- Dla promptów JSON upewnij się, że struktura pozostaje zgodna z oczekiwaniami aplikacji
