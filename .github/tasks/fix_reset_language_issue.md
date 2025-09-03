# Fix Reset Form Language Issue

## Problem
When user is in English mode and clicks "Reset Form", the form resets to Polish template and changes language to Polish. This is because:
1. The reset function calls `/get_template_json` which loads `bruce_wayne_resume.json`
2. This template file has `"language": "pl"` hardcoded
3. The reset doesn't respect the current UI language

## Solution Plan

### Option 1: Language-Aware Reset (Recommended)
Modify the reset functionality to respect the current language and use appropriate template data:

1. **Backend Changes (`app.py`)**:
   - Modify `/get_template_json` to accept language parameter
   - Create language-specific template logic
   - Return template data with correct language set

2. **Frontend Changes (`script.js`)**:
   - Update reset button to pass current language to backend
   - Ensure reset doesn't change current language
   - Keep UI language consistent after reset

### Option 2: Create Separate Template Files
Create `bruce_wayne_resume_en.json` and `bruce_wayne_resume_pl.json` with language-specific content.

## Implementation Details

### Backend Implementation
1. Modify the `/get_template_json` route to accept `?language=en|pl` parameter
2. Use the existing `resume_en.json` and `resume_pl.json` as templates instead of `bruce_wayne_resume.json`
3. Ensure template data has correct language field set

### Frontend Implementation  
1. Modify reset button click handler to include current language
2. Preserve current language after reset
3. Update UI translations properly after reset

## Benefits
- Reset respects current language setting
- User doesn't lose their language preference when resetting
- Consistent behavior between Polish and English modes
- Uses existing language-specific data files

## Files to Modify
- `app.py` - update `/get_template_json` route
- `static/scripts/script.js` - update reset button handler

## Testing
1. Set language to English
2. Click "Reset Form"  
3. Verify form resets but stays in English
4. Repeat for Polish
5. Verify both languages work correctly
