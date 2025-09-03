# Multi-Language CV Storage & Cover Letter Generation

## Overview
Implement separate CV storage per language and add cover letter generation functionality.

## Current State Analysis
- Currently: Single `resume.json` file stores all data, language switching only changes UI text
- Problem: User needs to re-enter all content when switching languages
- Missing: Cover letter generation feature

## Plan

### Phase 1: Multi-Language CV Storage
1. **Data Structure Changes**
   - Modify data storage to use `resume_pl.json` and `resume_en.json`
   - Keep current `resume.json` as fallback/migration source
   - Update save/load endpoints to handle language-specific files

2. **Backend Changes (app.py)**
   - Update `/save_resume` to save to language-specific file
   - Update index route to load language-specific data
   - Add migration logic to copy current data to both language files initially

3. **Frontend Changes (script.js)**
   - Modify language switching to load different CV data
   - Update save functions to use language-specific endpoints
   - Preserve form state during language switches

### Phase 2: Cover Letter Generation
1. **AI Handler Extension (ai_handler.py)**
   - Add `generate_cover_letter()` function
   - Create prompt templates for cover letter generation in both languages

2. **Prompt Files**
   - Create `prompts/cover_letter_pl.txt`
   - Create `prompts/cover_letter_en.txt`

3. **Backend Routes**
   - Add cover letter generation to `/ai_generate` endpoint

4. **Frontend UI**
   - Add cover letter section above CV preview
   - Add generation controls and preview area
   - Integrate with existing AI pattern

### Phase 3: UI/UX Improvements
1. **Status Indicators**
   - Show which language version has data
   - Indicate unsaved changes per language

2. **Export Features**
   - Allow separate PDF export for cover letter
   - Combined CV + Cover Letter export option

## Technical Details

### File Structure Changes
```
├── resume.json              # Legacy file (for migration)
├── resume_pl.json          # Polish CV data
├── resume_en.json          # English CV data
├── cover_letter_pl.json    # Polish cover letter data
├── cover_letter_en.json    # English cover letter data
├── prompts/
│   ├── cover_letter_pl.txt
│   └── cover_letter_en.txt
```

### Data Flow for Language Switching
1. User clicks language button
2. Save current language data to appropriate file
3. Load target language data from file
4. Update UI and form fields
5. Update preview

### Cover Letter Generation Flow
1. User fills CV data and job description
2. Clicks "Generate Cover Letter"
3. AI combines CV data + job context
4. Generated cover letter appears above CV
5. User can edit and save

## Implementation Tasks

### Backend Tasks
- [x] Create migration function to copy `resume.json` to both language versions
- [x] Modify `save_resume` endpoint for language-specific files
- [x] Add cover letter save/load endpoints
- [x] Update `index` route to load language-specific data
- [x] Add cover letter generation to `ai_handler.py`
- [x] Create cover letter prompt files
- [x] Add cover letter route to `/ai_generate`
- [x] Add cover letter PDF export endpoint
- [x] Fix JSON parsing issues in cover letter generation

### Frontend Tasks
- [x] Add cover letter UI section above CV preview
- [ ] Modify language switching logic to handle both CV and cover letter
- [ ] Add cover letter generation controls
- [ ] Update save/load functions for separate files
- [ ] Add cover letter export button
- [ ] Update preview system for cover letter display

### Current Issues
- Fixed JSON parsing error in cover letter generation
- Cover letter generation UI is implemented but needs testing
- Need to implement language switching for both CV and cover letter data

### Testing Tasks
- [ ] Test migration from single to multi-language files
- [ ] Test language switching preserves both CV and cover letter data
- [ ] Test cover letter generation in both languages
- [ ] Test separate PDF exports (CV only, cover letter only)
- [ ] Test data persistence across browser sessions

## Decisions Made
1. ✅ Cover letters stored separately: `cover_letter_pl.json` and `cover_letter_en.json`
2. ✅ Cover letter section above CV preview as separate section
3. ✅ Separate PDF export for cover letter only
4. ✅ Migrate current `resume.json` to both `resume_pl.json` and `resume_en.json`
5. ✅ Cover letter fully AI-generated (no templates)

## Updated File Structure
```
├── resume.json              # Legacy file (for migration)
├── resume_pl.json          # Polish CV data
├── resume_en.json          # English CV data
├── cover_letter_pl.json    # Polish cover letter data
├── cover_letter_en.json    # English cover letter data
├── prompts/
│   ├── cover_letter_pl.txt
│   └── cover_letter_en.txt
```

## Cover Letter Data Structure
```json
{
  "content": "Generated cover letter text...",
  "lastGenerated": "2025-08-16T10:30:00Z",
  "jobContext": "Job description used for generation...",
  "language": "pl"
}
```

## MVP Scope
- Multi-language CV storage with data preservation
- Cover letter generation section above CV preview
- Separate cover letter export functionality
- Full AI generation without templates
- Clean migration from current single-file system
