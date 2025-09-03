# GitHub Copilot Instructions for ResuAI

This document contains specific guidance for AI coding agents working on the ResuAI project - an AI-powered resume builder using Flask and Google Gemini API.

## Plan & Review

### Before starting work
- Always in plan mode to make a plan
- After get the plan, make sure you Write the plan to .github/tasks/TASK_NAME.md.
- The plan should be a detailed implementation plan and the reasoning behind them, as well as tasks broken down.
- If the task require external knowledge or certain package, also research to get latest knowledge (Use Task tool for research)
- Don't over plan it, always think MVP.
- Once you write the plan, firstly ask me to review it. Do not continue until I approve the plan.

### While implementing
- You should update the plan as you work.
- After you complete tasks in the plan, you should update and append detailed descriptions of the changes you made, so following tasks can be easily hand over to other engineers.

## Architecture Overview

### Core Technology Stack
- **Backend**: Flask (Python) serving on localhost:5000
- **Frontend**: Vanilla JavaScript with HTML/CSS (no frameworks)
- **AI Integration**: Google Gemini API via `ai_handler.py`
- **PDF Export**: Playwright for server-side PDF generation
- **Styling**: Custom CSS with `document.css` for CV rendering
- **Icons**: Iconify for scalable vector icons
- **Markdown**: marked.js for client-side markdown parsing

### Project Structure
```
├── app.py                 # Main Flask application with routes
├── ai_handler.py          # AI integration and prompt management
├── prompts/              # External AI prompt files (.txt)
├── static/
│   ├── script.js         # Main frontend JavaScript
│   ├── style.css         # General UI styling
│   ├── document.css      # CV-specific styling
│   └── uploads/          # Profile image storage
├── templates/
│   └── index.html        # Single-page application template
├── resume.json           # Current user data
└── ai_config.json        # API key storage
```

## Key Architectural Patterns

### Data Flow Architecture
1. **Client → Server**: Form data travels via `handleGenericInputChange()` → `resumeData` object
2. **Server → AI**: `ai_handler.py` loads prompts from `prompts/` folder and calls Gemini API
3. **AI → Client**: Generated content updates `resumeData` and triggers UI refresh
4. **Preview Generation**: `generateMarkdownFromData()` creates markdown → `marked.js` renders HTML
5. **PDF Export**: Server uses Playwright to render the same HTML/CSS as browser preview

### Prompt Management System
- **External Files**: All AI prompts stored in `prompts/` folder as `.txt` files
- **Naming Convention**: `{task_type}_{language}.txt` (e.g., `bullet_points_en.txt`)
- **Loading Pattern**: `load_prompt_from_file()` with fallback to hardcoded defaults
- **Supported Languages**: Polish (pl) and English (en)

### Multi-Language Support
- **Translation System**: `translations` object in `script.js` with `updateLanguage()`
- **Dynamic Switching**: Language buttons update all UI text and placeholders
- **Data Storage**: Current language stored in `resumeData.language`
- **AI Context**: Language passed to AI generation functions

## Critical Code Patterns

### JavaScript Form Handling
```javascript
// Data binding pattern - ALL form inputs use this
function handleGenericInputChange(event) {
    const path = event.target.dataset.path; // e.g., "experience.0.title"
    // Deep path traversal to update resumeData
    // Always call updatePreviewAndHiddenMD() after changes
}

// UI creation pattern - use these helper functions
createFormGroup(labelText, inputElement, className)
createInputElement(type, value, placeholder, className, dataAttrs, isBlueField, isGreenField)
createButton(text, classNameOrId, onClick, title, iconifyIcon)
```

### CSS Class Conventions
- **Field Types**: `.green-field` (user input), `.blue-field` (AI context), default (generated content)
- **Layout**: `.list-entry` for experience/education entries, `.form-section` for major sections
- **Actions**: `.ai-generate-btn` (teal), `.add-btn` (green), `.remove-btn` (red)
- **Containers**: `.experience-entry-header`, `.project-entry-header` for special layouts

### AI Integration Pattern
```javascript
// Standard AI call pattern
async function callAIGenerate(taskType, payload) {
    // Add job_description_context and language to payload
    // Handle loading states and error messages
    return await fetch('/ai_generate', { /* POST with JSON */ });
}

// Usage in event handlers
const aiResult = await callAIGenerate('generate_bullets', {
    user_role_description: item.userRoleDescription,
    company: item.company,
    num_bullets_to_generate: item.numBulletPointsToGenerate
});
if (aiResult && aiResult.generated_bullets) {
    item.bullets = aiResult.generated_bullets;
    populateAllFormsFromCurrentData(); 
    updatePreviewAndHiddenMD();
}
```

### Flask Route Conventions
- **Data Routes**: `/save_resume`, `/get_api_key_status`, `/save_api_key`
- **AI Routes**: `/ai_generate` (handles all AI generation types)
- **File Routes**: `/upload_photo`, `/export_pdf`
- **Response Format**: Always return `{"status": "success/error", "message": "..."}`

## Essential Development Guidelines

### Working with Resume Data
- **Primary Object**: `resumeData` contains all form data
- **Required Fields**: Always ensure `id` fields exist (use `uid()` function)
- **Data Persistence**: Changes auto-save to hidden markdown field, manual save via `/save_resume`
- **Structure**: Experience, education, skills (categories), projects, certifications, contact items

### CV Preview System
- **Generation**: `generateMarkdownFromData()` creates markdown with embedded HTML
- **Special Elements**: Uses `<dl>` grids for structured data, `<span>` for styled text
- **Preview Update**: Call `updatePreviewAndHiddenMD()` after ANY data change
- **Prompt Injection**: Invisible text added for AI analysis (see prompt injection pattern)

### PDF Export Workflow
1. Server receives markdown content from client
2. `export_pdf()` uses Playwright to render HTML
3. Same CSS (`document.css`) used for both preview and PDF
4. Custom print media queries ensure proper PDF formatting

### Form Rendering Patterns
```javascript
// Dynamic form generation - ALL sections use this pattern
function renderListEntry(item, index, sectionName, fieldsConfig, bulletsConfig) {
    // Create container with proper classes and data attributes
    // Handle section-specific layouts (experience vs projects vs education)
    // Add AI generation buttons based on section type
    // Create bullet point management if bulletsConfig provided
    // Always include remove button
}

// Required for each section:
const sectionFields = [
    {label: 'Display Label', key: 'dataKey', placeholder: 'hint text', type: 'text'}
];
const sectionBullets = {
    label: 'Bullets Label:', 
    key: 'bulletsArrayKey', 
    placeholder: 'bullet hint', 
    addBtnText: 'Add Button Text'
};
```

### AI Prompt File Management
- **Location**: `prompts/` folder in project root
- **Loading**: Use `load_prompt_from_file(task_type, language)` in `ai_handler.py`
- **Fallback**: Always provide hardcoded fallback prompts
- **Context**: Job description automatically appended to all AI calls

## Styling and UI Guidelines

### CSS Architecture
- **Base Styles**: `style.css` for general UI, form elements, layout
- **Document Styles**: `document.css` for CV-specific rendering (both preview and PDF)
- **Print Support**: Extensive `@media print` rules in both files
- **Responsive**: Mobile-friendly layouts with CSS Grid fallbacks

### Color Scheme
- **Primary Actions**: `#2c974b` (green) for save/add buttons
- **AI Actions**: `#17a2b8` (teal) for AI generation buttons  
- **Danger Actions**: `#d73a49` (red) for remove buttons
- **Secondary**: `#007bff` (blue) for PDF export, `#6f42c1` (purple) for reset
- **Accent**: `#4a90e2` (blue) for headers and highlights

### Iconify Integration
- **Usage**: `<span class="iconify" data-icon="icon-name"></span>`
- **Scan**: Always call `window.Iconify.scan(container)` after dynamic DOM updates
- **Icons**: Use `mdi:` (Material Design), `tabler:` (Tabler), `charm:` (Charm) prefixes

## Common Patterns and Conventions

### Error Handling
```javascript
// Status message pattern
showStatusMessage(message, isError = false, isInfo = false)

// API error handling
try {
    const response = await fetch('/endpoint', options);
    const result = await response.json();
    showStatusMessage(result.message, result.status !== 'success');
} catch (error) {
    showStatusMessage(`Error: ${error.message}`, true);
}
```

### State Management
- **Single Source**: `resumeData` object holds all application state
- **No External State**: No Redux, Vuex, or similar - vanilla JavaScript only
- **Persistence**: State automatically syncs to hidden textarea for server communication
- **Reactivity**: Manual updates via `populateAllFormsFromCurrentData()` and `updatePreviewAndHiddenMD()`

### File Upload Pattern
```javascript
// Photo upload example
async function handlePhotoUpload(event) {
    const formData = new FormData();
    formData.append('profile_photo', event.target.files[0]);
    // POST to /upload_photo
    // Update resumeData.profilePicture with response
    // Refresh preview
}
```

### Dynamic Content Generation
- **Lists**: Always use `renderListEntry()` pattern for consistent styling
- **Bullets**: Managed arrays with add/remove functionality
- **Unique IDs**: Use `uid()` function for all new entries
- **Path-based Updates**: Use `data-path` attributes for automatic data binding

## Security and API Considerations

### API Key Management
- **Storage**: `ai_config.json` file with placeholder detection
- **UI**: Masked input with toggle visibility button
- **Validation**: Server-side validation before storing
- **Status**: Real-time status checking with visual indicators

### Content Safety
- **Sanitization**: Be cautious with user input in markdown generation
- **Prompt Injection**: Hidden text in CV for AI analysis (positive bias)
- **File Uploads**: Limited to images, size restrictions enforced

## Testing and Debugging

### Browser Developer Tools
- **Resume Data**: Access via `window.resumeData` in console
- **Form Population**: Debug form rendering with `populateAllFormsFromCurrentData()`
- **Preview Updates**: Check markdown generation with `generateMarkdownFromData()`

### Common Issues
1. **Missing IDs**: All array items need unique `id` field
2. **Form Updates**: Always call `updatePreviewAndHiddenMD()` after data changes
3. **AI Errors**: Check `ai_config.json` and API key status
4. **CSS Issues**: Verify both `style.css` and `document.css` are loading
5. **Icon Problems**: Ensure `Iconify.scan()` called after DOM changes

## Performance Considerations

### Optimization Patterns
- **Batch Updates**: Group multiple changes before calling `updatePreviewAndHiddenMD()`
- **Debouncing**: Input changes can be frequent - consider debouncing for AI calls
- **Image Optimization**: Profile photos resized on server-side
- **PDF Generation**: Server-side rendering avoids client-side performance issues

### Resource Management
- **Memory**: Large resume data objects should be managed carefully
- **API Calls**: Rate limiting and error handling for Gemini API
- **File Sizes**: Monitor uploaded image sizes and PDF output

## Extension Points

### Adding New Sections
1. Define field configuration array
2. Add bullets configuration (if needed)  
3. Create render function following `renderListEntry` pattern
4. Add to `generateMarkdownFromData()` 
5. Update `populateAllFormsFromCurrentData()`
6. Add translations for new fields

### Adding AI Features
1. Create prompt files in `prompts/` folder
2. Add handler in `ai_handler.py`
3. Add route case in `/ai_generate` endpoint
4. Implement frontend call in `script.js`
5. Update UI with generation buttons

### Styling Customizations
- **Preview Changes**: Modify `document.css`
- **Form Changes**: Modify `style.css`
- **Print Layout**: Update `@media print` rules
- **Responsive**: Test mobile layouts thoroughly

Remember: This is a single-page application with server-side AI integration. The frontend manages all state and UI, while the backend handles AI calls, file operations, and PDF generation. Always maintain consistency with existing patterns when adding new features.
