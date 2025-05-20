// static/script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const markdownInput = document.getElementById('markdown-input'); // Hidden
    const htmlOutput = document.getElementById('html-output');
    const statusMessageDiv = document.getElementById('status-message');
    const mainControlsContainer = document.getElementById('main-controls');
    const previewPaneWrapper = document.getElementById('preview-pane-wrapper'); 

    const nameInput = document.getElementById('resume-name');
    const profilePhotoInput = document.getElementById('profile-photo-upload');
    const profilePhotoPreview = document.getElementById('profile-photo-preview');

    const contactItemsButtonsContainer = document.getElementById('contact-items-buttons');
    const contactItemsContainer = document.getElementById('contact-items-container');

    const experienceEntriesContainer = document.getElementById('experience-entries-container');
    const addExperienceBtn = document.getElementById('add-experience-btn');

    const educationEntriesContainer = document.getElementById('education-entries-container');
    const addEducationBtn = document.getElementById('add-education-btn');

    const skillCategoriesContainer = document.getElementById('skill-categories-container');
    const addSkillCategoryBtn = document.getElementById('add-skill-category-btn');

    const awardEntriesContainer = document.getElementById('award-entries-container');
    const addAwardBtn = document.getElementById('add-award-btn');

    const publicationEntriesContainer = document.getElementById('publication-entries-container');
    const addPublicationBtn = document.getElementById('add-publication-btn');

    // --- Utility ---
    function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 9); }

    // --- Resume Data ---
    let resumeData; // Will be initialized by initializeEditor() from server-provided JSON

    const MINIMAL_CLIENT_FALLBACK_RESUME_DATA = {
        name: "Your Name (Fallback)",
        profilePicture: "static/batman.png",
        contactItems: [], experience: [], education: [],
        skills: [], awards: [], publications: []
    };


    // --- Marked.js Setup ---
    marked.setOptions({ gfm: true, breaks: false, pedantic: false, sanitize: false });

    // --- Core Update Function ---
    function updatePreviewAndHiddenMD() {
        if (!resumeData) { // Guard against resumeData not being loaded yet
            console.warn("updatePreviewAndHiddenMD called before resumeData initialized.");
            return;
        }
        const md = generateMarkdownFromData();
        markdownInput.value = md; // For saving
        htmlOutput.innerHTML = marked.parse(md);
        if (window.renderMathInElement) {
            renderMathInElement(htmlOutput, { delimiters: [{left:"$$",right:"$$",display:true},{left:"$",right:"$",display:false},{left:"\\(",right:"\\)",display:false},{left:"\\[",right:"\\]",display:true}] });
        }
        if (window.Iconify) window.Iconify.scan(htmlOutput);
    }

    // --- Markdown Generation ---
    function generateMarkdownFromData() {
        if (!resumeData) return "# Error: Resume data not loaded."; // Guard
        let md = "";

        // New Header with Photo and Contact Info
        const photoSrc = resumeData.profilePicture || 'static/batman.png'; // Fallback
        md += `<div class="resume-top-header">\n`;
        md += `  <div class="resume-photo-container">\n`;
        md += `    <img src="${photoSrc}" alt="Profile Photo" class="resume-photo" onerror="this.onerror=null;this.src='static/batman.png';">\n`; // Added onerror fallback
        md += `  </div>\n`;
        md += `  <div class="resume-contact-info-container">\n`;
        md += `    <h1 class="resume-name-main">${resumeData.name || "Your Name"}</h1>\n`;

        const contactItemsForHeader = (resumeData.contactItems || []).filter(item => item.value && item.value.trim() !== '');
        const getIconForContact = (item) => {
            const type = item.type ? item.type.toLowerCase() : '';
            const label = item.label ? item.label.toLowerCase() : '';
            if (type.includes('phone') || label.includes('phone') || label.includes('tel')) return 'tabler:phone';
            if (type.includes('email') || label.includes('mail')) return 'tabler:mail';
            if (type.includes('website') || label.includes('site') || label.includes('port')) return 'charm:link';
            if (type.includes('location') || label.includes('address') || label.includes('loc')) return 'ic:outline-location-on';
            if (type.includes('linkedin') || label.includes('linkedin')) return 'tabler:brand-linkedin';
            if (type.includes('github') || label.includes('github') || label.includes('git')) return 'tabler:brand-github';
            return 'mdi:link-variant';
        };
        const lines = []; let currentLine = []; const MAX_ITEMS_PER_LINE = 3;
        for (let i = 0; i < contactItemsForHeader.length; i++) {
            currentLine.push(contactItemsForHeader[i]);
            if (currentLine.length >= MAX_ITEMS_PER_LINE || i === contactItemsForHeader.length - 1) {
                lines.push([...currentLine]); currentLine = [];
            }
        }
        if (currentLine.length > 0) lines.push([...currentLine]);
        
        lines.forEach(lineItems => {
            if (lineItems.length > 0) {
                md += '    <div class="resume-header-contact-line">\n';
                lineItems.forEach((item, index) => {
                    const icon = getIconForContact(item);
                    const isEffectivelyLast = (index === lineItems.length - 1);
                    md += `      <span class="resume-header-item${isEffectivelyLast ? ' no-separator' : ''}"><span class="iconify" data-icon="${icon}"></span> ${item.link ? `<a href="${item.link}">${item.value}</a>` : item.value}</span>\n`;
                });
                md += '    </div>\n';
            }
        });
        md += `  </div>\n`; // Close resume-contact-info-container
        md += `</div>\n\n`; // Close resume-top-header

        if (resumeData.experience && resumeData.experience.length > 0) {
        md += "## Experience\n\n";
        resumeData.experience.forEach(exp => {
            const title = exp.title || 'Untitled Role';
            const company = exp.company || 'Some Company';
            const location = exp.location || 'Location'; 
            const date = exp.date || 'Date Range';
            md += `<dl>\n  <dt>${title}</dt>\n  <dd>${company}</dd>\n  <dd>${location}</dd>\n  <dd>${date}</dd>\n</dl>\n\n`;
            (exp.bullets || []).forEach(bullet => { md += `- ${bullet}\n`; });
            md += "\n";
        });
        }
        if (resumeData.education && resumeData.education.length > 0) {
            md += "## Education\n\n";
            resumeData.education.forEach(edu => {
                md += `<dl>\n  <dt>${edu.degree || 'Degree'}</dt>\n  <dd>${edu.university || 'University'}</dd>\n  <dd>${edu.location || 'Location'}</dd>\n  <dd>${edu.date || 'Date Range'}</dd>\n</dl>\n\n`;
                (edu.bullets || []).forEach(bullet => { md += `- ${bullet}\n`; });
                md += "\n";
            });
        }
        if (resumeData.skills && resumeData.skills.length > 0) {
            md += "## Skills\n\n";
            resumeData.skills.forEach(skillCategory => {
                if (skillCategory.categoryName && skillCategory.categoryName.trim() && skillCategory.entries && skillCategory.entries.trim()) {
                    md += `**${skillCategory.categoryName.trim()}:** ${skillCategory.entries.trim().replace(/\n/g, '  \n')}\n\n`;
                }
            });
        }
        if (resumeData.awards && resumeData.awards.length > 0) {
            md += "## Awards and Honors\n\n";
            resumeData.awards.forEach(award => {
                md += `**${award.description || 'Award Description'}**${award.year ? `   :   ${award.year}` : ''}\n\n`;
            });
        }
        if (resumeData.publications && resumeData.publications.length > 0) {
            md += "## Publications\n\n<ul class=\"crossref-list\">\n";
            resumeData.publications.forEach(pub => {
                md += `<li data-caption="${pub.caption || '[~Ref]'}" id="ref-${pub.refId || pub.id}" class="crossref-item">\n<strong>${pub.title || 'Untitled Publication'}</strong> <br/>\n${pub.authors || 'Authors'} <br/>\n${pub.venue || '<em>Venue</em>'}\n</li>\n`;
            });
            md += "</ul>\n";
        }
        return md;
    }

    // --- UI Rendering & Event Handling ---
    function createFormGroup(labelText, inputElement) {
        const group = document.createElement('div'); group.className = 'form-group';
        const label = document.createElement('label'); label.textContent = labelText;
        group.appendChild(label); group.appendChild(inputElement); return group;
    }
    function createInputElement(type, value, placeholder, className, dataAttrs = {}, onChangeCallback) {
        const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
        if (type !== 'textarea') input.type = type; input.className = className;
        input.value = value || ''; if (placeholder) input.placeholder = placeholder;
        Object.entries(dataAttrs).forEach(([key, val]) => input.dataset[key] = val);
        if (onChangeCallback) input.addEventListener('input', onChangeCallback);
        else input.addEventListener('input', handleGenericInputChange); 
        return input;
    }
    function createButton(text, classNameOrId, onClick, title = '') {
        const btn = document.createElement('button');
        if (classNameOrId.startsWith('add-') || classNameOrId.startsWith('save-') || classNameOrId.startsWith('export-') || classNameOrId.startsWith('reset-') || classNameOrId.includes('remove-')) {
            btn.id = classNameOrId; // Treat as ID if it's a primary action button
        }
        btn.textContent = text; btn.className = classNameOrId.split(' ')[0]; 
        if (title) btn.title = title;
        btn.addEventListener('click', onClick); return btn;
    }
    function handleGenericInputChange(event) {
        const path = event.target.dataset.path;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        
        if (!resumeData) { console.error("resumeData not initialized!"); return; }
        let current = resumeData; const parts = path.split('.');
        try {
            for (let i = 0; i < parts.length - 1; i++) { 
                if (!current[parts[i]]) { 
                    if (Array.isArray(current) && !isNaN(parseInt(parts[i]))) {
                        console.warn(`Attempting to access undefined index ${parts[i]} in array part of path ${path}`);
                        return; 
                    } else {
                        current[parts[i]] = {}; 
                    }
                }
                current = current[parts[i]]; 
            }
            current[parts[parts.length - 1]] = value;
        } catch (e) { console.error("Error updating data for path:", path, e); }
        updatePreviewAndHiddenMD(); 
    }

    // Photo Upload Handler
    async function handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) {
            // showStatusMessage("No file selected or upload cancelled.", true); // Can be noisy
            return;
        }

        const formData = new FormData();
        formData.append('profile_photo', file); // Key must match Flask backend

        showStatusMessage("Uploading photo...", false);

        try {
            const response = await fetch('/upload_photo', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (response.ok && result.status === 'success') {
                resumeData.profilePicture = result.filePath;
                if (profilePhotoPreview) {
                    // Add cache buster to force image refresh
                    profilePhotoPreview.src = result.filePath + '?t=' + new Date().getTime();
                }
                updatePreviewAndHiddenMD();
                showStatusMessage(result.message || "Photo uploaded successfully!", false);
            } else {
                showStatusMessage(result.message || "Photo upload failed.", true);
                // Restore preview to old image if upload failed but we have a previous one
                if (profilePhotoPreview && resumeData.profilePicture) {
                     profilePhotoPreview.src = resumeData.profilePicture + '?t=' + new Date().getTime();
                } else if (profilePhotoPreview) {
                     profilePhotoPreview.src = 'static/batman.png'; // Fallback
                }
            }
        } catch (error) {
            showStatusMessage('Client error uploading photo: ' + error.message, true);
            console.error("Photo upload client error:", error);
            if (profilePhotoPreview && resumeData.profilePicture) {
                 profilePhotoPreview.src = resumeData.profilePicture + '?t=' + new Date().getTime();
            } else if (profilePhotoPreview) {
                 profilePhotoPreview.src = 'static/batman.png'; // Fallback
            }
        }
    }
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', handlePhotoUpload);
    }


    function renderContactItems() {
        contactItemsContainer.innerHTML = '';
        if (!resumeData || !resumeData.contactItems) return;
        resumeData.contactItems.forEach((item, index) => {
            const itemDiv = document.createElement('div'); itemDiv.className = 'contact-item-row'; itemDiv.dataset.id = item.id;
            itemDiv.appendChild(createFormGroup('Label:', createInputElement('text', item.label, 'Label (e.g., Phone)', `contact-label`, { path: `contactItems.${index}.label` })));
            itemDiv.appendChild(createFormGroup('Value:', createInputElement('text', item.value, 'Value (e.g., 555-1234)', `contact-value`, { path: `contactItems.${index}.value` })));
            itemDiv.appendChild(createFormGroup('Link (Optional):', createInputElement('text', item.link, 'https:// or mailto:', `contact-link`, { path: `contactItems.${index}.link` })));
            const actionsDiv = document.createElement('div'); actionsDiv.className = 'contact-item-actions';
            actionsDiv.appendChild(createButton("Remove", "remove-btn", () => {
                resumeData.contactItems = resumeData.contactItems.filter(ci => ci.id !== item.id);
                renderContactItems(); updatePreviewAndHiddenMD();
            }));
            itemDiv.appendChild(actionsDiv);
            contactItemsContainer.appendChild(itemDiv);
        });
    }
    const contactTypes = [
        { type: 'phone', label: 'Phone', defaultIcon: 'tabler:phone', defaultLinkPrefix: 'tel:'},
        { type: 'email', label: 'Email', defaultIcon: 'tabler:mail', defaultLinkPrefix: 'mailto:'},
        { type: 'website', label: 'Website', defaultIcon: 'charm:link', defaultLinkPrefix: 'https://' },
        { type: 'location', label: 'Location', defaultIcon: 'ic:outline-location-on' },
        { type: 'linkedin', label: 'LinkedIn', defaultIcon: 'tabler:brand-linkedin', defaultLinkPrefix: 'https://linkedin.com/in/' },
        { type: 'github', label: 'GitHub', defaultIcon: 'tabler:brand-github', defaultLinkPrefix: 'https://github.com/' }
    ];
    contactItemsButtonsContainer.innerHTML = '';
    contactTypes.forEach(contact => {
        contactItemsButtonsContainer.appendChild(createButton(`Add ${contact.label}`, `add-${contact.type}-btn form-button`, () => { 
            if (!resumeData.contactItems) resumeData.contactItems = [];
            resumeData.contactItems.push({ id: uid(), type: contact.type, label: contact.label, value: '', link: contact.defaultLinkPrefix || '' });
            renderContactItems(); updatePreviewAndHiddenMD();
        }));
    });

    function renderListEntry(item, index, sectionName, fieldsConfig, bulletsConfig) {
        const entryDiv = document.createElement('div'); entryDiv.className = `form-group ${sectionName}-entry`;
        entryDiv.style.border = "1px solid #f0f0f0"; entryDiv.style.padding = "10px"; entryDiv.style.marginBottom = "10px"; entryDiv.style.borderRadius="3px";
        entryDiv.dataset.id = item.id;
        fieldsConfig.forEach(field => { entryDiv.appendChild(createFormGroup(field.label + ':', createInputElement(field.type || 'text', item[field.key], field.placeholder, `${sectionName}-${field.key}`, { path: `${sectionName}.${index}.${field.key}` }))); });
        if (bulletsConfig) {
            const bulletsLabel = document.createElement('label'); bulletsLabel.textContent = bulletsConfig.label; bulletsLabel.style.fontWeight='bold'; entryDiv.appendChild(bulletsLabel);
            const bulletsUl = document.createElement('ul'); bulletsUl.className = 'bullet-list';
            (item[bulletsConfig.key] || []).forEach((bullet, bIndex) => {
                const li = document.createElement('li');
                li.appendChild(createInputElement('text', bullet, bulletsConfig.placeholder, `${sectionName}-bullet`, { path: `${sectionName}.${index}.${bulletsConfig.key}.${bIndex}` }));
                li.appendChild(createButton("X", "remove-btn bullet-remove-btn", () => { item[bulletsConfig.key].splice(bIndex, 1); populateAllFormsFromCurrentData(); updatePreviewAndHiddenMD(); }));
                bulletsUl.appendChild(li);
            });
            entryDiv.appendChild(bulletsUl);
            entryDiv.appendChild(createButton(bulletsConfig.addBtnText, `add-bullet-${sectionName} form-button`, () => { 
                if (!item[bulletsConfig.key]) item[bulletsConfig.key] = []; item[bulletsConfig.key].push(""); populateAllFormsFromCurrentData(); updatePreviewAndHiddenMD();
            }));
        }
        entryDiv.appendChild(createButton(`Remove ${fieldsConfig[0].label}`, "remove-btn section-remove-btn", () => { 
            resumeData[sectionName] = resumeData[sectionName].filter(e => e.id !== item.id); populateAllFormsFromCurrentData(); updatePreviewAndHiddenMD();
        }));
        return entryDiv;
    }


    const experienceFields = [ {label: 'Title', key: 'title'}, {label: 'Company', key: 'company'}, {label: 'Location', key: 'location', placeholder: 'e.g., City, ST'}, {label: 'Date', key: 'date'}];
    const experienceBullets = {label: 'Responsibilities/Achievements:', key: 'bullets', placeholder: 'Bullet point...', addBtnText: 'Add Bullet'};
    function renderExperienceForms() { experienceEntriesContainer.innerHTML = ''; if (!resumeData || !resumeData.experience) return; resumeData.experience.forEach((item, i) => experienceEntriesContainer.appendChild(renderListEntry(item, i, 'experience', experienceFields, experienceBullets))); }
    addExperienceBtn.addEventListener('click', () => { if (!resumeData.experience) resumeData.experience = []; resumeData.experience.push({ id: uid(), title: "", company: "", location: "", date: "", bullets: [""] }); populateAllFormsFromCurrentData(); updatePreviewAndHiddenMD(); });

    const educationFields = [ {label: 'Degree', key: 'degree'}, {label: 'University', key: 'university'}, {label: 'Location', key: 'location'}, {label: 'Date', key: 'date'}];
    const educationBullets = {label: 'Details/Courses:', key: 'bullets', placeholder: 'Details...', addBtnText: 'Add Detail'};
    function renderEducationForms() { educationEntriesContainer.innerHTML = ''; if (!resumeData || !resumeData.education) return; resumeData.education.forEach((item, i) => educationEntriesContainer.appendChild(renderListEntry(item, i, 'education', educationFields, educationBullets)));}
    addEducationBtn.addEventListener('click', () => { if (!resumeData.education) resumeData.education = []; resumeData.education.push({ id: uid(), degree: "", university: "", location: "", date: "", bullets: [] }); populateAllFormsFromCurrentData(); updatePreviewAndHiddenMD(); });
    
    function renderSkillForms() {
        skillCategoriesContainer.innerHTML = '';
        if (!resumeData || !resumeData.skills) return;
        resumeData.skills.forEach((category, index) => {
            const catDiv = document.createElement('div'); catDiv.className = 'skill-category-entry'; catDiv.dataset.id = category.id;
            catDiv.appendChild(createFormGroup('Category Name:', createInputElement('text', category.categoryName, 'e.g., Programming Languages', `skill-category-name`, { path: `skills.${index}.categoryName` })));
            catDiv.appendChild(createFormGroup('Skills (one per line for GFM line breaks, or comma-separated):', createInputElement('textarea', category.entries, 'Python, Java, SQL...', `skill-category-entries`, { path: `skills.${index}.entries` })));
            catDiv.appendChild(createButton("Remove Category", "remove-btn skill-remove-btn", () => { 
                resumeData.skills = resumeData.skills.filter(sc => sc.id !== category.id); renderSkillForms(); updatePreviewAndHiddenMD();
            }));
            skillCategoriesContainer.appendChild(catDiv);
        });
    }
    addSkillCategoryBtn.addEventListener('click', () => { if (!resumeData.skills) resumeData.skills = []; resumeData.skills.push({ id: uid(), categoryName: "New Skill Category", entries: "" }); renderSkillForms(); updatePreviewAndHiddenMD(); });

    const awardFields = [ {label: 'Description', key: 'description'}, {label: 'Year (Optional)', key: 'year'}];
    function renderAwardForms() { awardEntriesContainer.innerHTML = ''; if (!resumeData || !resumeData.awards) return; resumeData.awards.forEach((item, i) => awardEntriesContainer.appendChild(renderListEntry(item, i, 'awards', awardFields, null))); }
    addAwardBtn.addEventListener('click', () => { if (!resumeData.awards) resumeData.awards = []; resumeData.awards.push({ id: uid(), description: "", year: "" }); populateAllFormsFromCurrentData(); updatePreviewAndHiddenMD(); });

    const publicationFields = [ {label: 'Ref ID (e.g. P1)', key: 'refId'}, {label: 'Caption (e.g. [~P1])', key: 'caption'}, {label: 'Title', key: 'title'}, {label: 'Authors', key: 'authors'}, {label: 'Venue/Journal', key: 'venue'} ];
    function renderPublicationForms() { publicationEntriesContainer.innerHTML = ''; if (!resumeData || !resumeData.publications) return; resumeData.publications.forEach((item, i) => publicationEntriesContainer.appendChild(renderListEntry(item, i, 'publications', publicationFields, null)));}
    addPublicationBtn.addEventListener('click', () => { if(!resumeData.publications) resumeData.publications = []; resumeData.publications.push({ id: uid(), refId: `P${resumeData.publications.length+1}`, caption: `[~P${resumeData.publications.length+1}]`, title: "", authors: "", venue: "" }); populateAllFormsFromCurrentData(); updatePreviewAndHiddenMD(); });

    function populateAllFormsFromCurrentData() {
        if (!resumeData) {
            console.error("Cannot populate forms, resumeData is not initialized.");
            nameInput.value = ''; 
            if (profilePhotoPreview) profilePhotoPreview.src = 'static/batman.png';
            contactItemsContainer.innerHTML = '';
            experienceEntriesContainer.innerHTML = '';
            educationEntriesContainer.innerHTML = '';
            skillCategoriesContainer.innerHTML = '';
            awardEntriesContainer.innerHTML = '';
            publicationEntriesContainer.innerHTML = '';
            return;
        }
        nameInput.value = resumeData.name || '';
        if (profilePhotoPreview) {
             profilePhotoPreview.src = (resumeData.profilePicture || 'static/batman.png') + '?t=' + new Date().getTime(); // Add cache buster
             profilePhotoPreview.onerror = () => { profilePhotoPreview.src = 'static/batman.png'; }; // Fallback on error
        }
        renderContactItems();
        renderExperienceForms();
        renderEducationForms();
        renderSkillForms();
        renderAwardForms();
        renderPublicationForms();
    }
    nameInput.addEventListener('input', handleGenericInputChange); 

    function showStatusMessage(message, isError = false) {
        statusMessageDiv.textContent = message;
        statusMessageDiv.className = isError ? 'status-error' : 'status-success'; // Use classes for styling
        setTimeout(() => {
            statusMessageDiv.textContent = '';
            statusMessageDiv.className = '';
        }, 5000);
    }

    const saveButton = createButton("Save Resume", "save-resume-btn", async () => {
        if (!resumeData) {
            showStatusMessage("Error: No resume data to save.", true);
            return;
        }
        const markdownToSave = markdownInput.value; 
        const resumeDataJsonString = JSON.stringify(resumeData);

        const formData = new FormData(); 
        formData.append('resume_data_json', resumeDataJsonString);
        formData.append('markdown_content', markdownToSave);
        
        try {
            const response = await fetch('/save_resume', { method: 'POST', body: formData });
            const result = await response.json();
            showStatusMessage(result.message, !(response.ok && result.status === 'success'));
        } catch (error) { showStatusMessage('Error saving resume: ' + error.message, true); console.error("Save error:", error); }
    });

    const resetButton = createButton("Reset Form", "reset-resume-btn", async () => {
        if (confirm("Are you sure you want to reset all form data to the default template? This will overwrite your current form edits. You'll need to 'Save Resume' afterwards to persist these changes.")) {
            try {
                const response = await fetch('/get_template_json');
                if (!response.ok) {
                    throw new Error(`Failed to fetch template: ${response.statusText}`);
                }
                const templateData = await response.json();
                resumeData = templateData; 
                if (!resumeData.profilePicture) { // Ensure template has it, or provide fallback
                    resumeData.profilePicture = 'static/batman.png';
                }
                populateAllFormsFromCurrentData();
                updatePreviewAndHiddenMD(); 
                showStatusMessage("Form reset to default template. Click 'Save Resume' to make this the new resume.json and resume.md.");
            } catch (error) {
                showStatusMessage('Error resetting form: ' + error.message, true);
                console.error("Reset error:", error);
            }
        }
    });
    mainControlsContainer.append(saveButton, resetButton);

    const exportPdfButton = createButton("Export as PDF", "export-pdf-btn", async () => {
        showStatusMessage("Generating PDF...", false);
        const htmlContentToExport = document.getElementById('html-output').innerHTML;
        const formData = new FormData();
        formData.append('html_content', htmlContentToExport);
        try {
            const response = await fetch('/export_pdf', { method: 'POST', body: formData });
            if (response.ok) {
                const blob = await response.blob();
                const link = document.createElement('a');
                const safeName = ((resumeData && resumeData.name) || "resume").replace(/[^a-z0-9_.\s-]/gi, '_').replace(/\s+/g,'_').toLowerCase();
                link.href = URL.createObjectURL(blob);
                link.download = `${safeName}.pdf`;
                document.body.appendChild(link); link.click();
                document.body.removeChild(link); URL.revokeObjectURL(link.href);
                showStatusMessage("PDF downloaded.", false);
            } else {
                const errorText = await response.text();
                showStatusMessage('Error exporting PDF: ' + errorText, true);
                console.error('PDF Export Error:', errorText);
            }
        } catch (error) {
            showStatusMessage('Client-side error during PDF export.', true);
            console.error("PDF Export client error:", error);
        }
    });
    const pdfButtonContainer = previewPaneWrapper.querySelector('.preview-controls');
    if (pdfButtonContainer) { pdfButtonContainer.appendChild(exportPdfButton); }

    function initializeEditor() {
        if (typeof window.initialResumeDataJsonString === 'string') {
            try {
                resumeData = JSON.parse(window.initialResumeDataJsonString);
                console.log("Successfully parsed initial resume data from server.");
            } catch (e) {
                console.error("Failed to parse initial resume data from server:", e);
                resumeData = JSON.parse(JSON.stringify(MINIMAL_CLIENT_FALLBACK_RESUME_DATA)); 
            }
        } else {
            console.error("Initial resume data string not found or not a string.");
            resumeData = JSON.parse(JSON.stringify(MINIMAL_CLIENT_FALLBACK_RESUME_DATA));
        }
        
        // Ensure profilePicture exists in resumeData after loading
        if (!resumeData.profilePicture) {
            resumeData.profilePicture = 'static/batman.png'; // Default fallback
        }
        
        populateAllFormsFromCurrentData(); 
        updatePreviewAndHiddenMD();      
    }

    initializeEditor();
});