// static/script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const markdownInput = document.getElementById('markdown-input');
    const htmlOutput = document.getElementById('html-output');
    const statusMessageDiv = document.getElementById('status-message');
    const mainControlsContainer = document.getElementById('main-controls');
    // const mainLayout = document.getElementById('main-layout'); // No longer needed for toggle
    // const previewToggleBtn = document.getElementById('preview-toggle-btn'); // No longer needed
    const previewPaneWrapper = document.getElementById('preview-pane-wrapper'); // Still useful for targeting

    const nameInput = document.getElementById('resume-name');
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

    // --- Default Resume Data ---
    const defaultResumeData = {
        name: "Bruce Wayne",
        contactItems: [
            { id: uid(), type: 'phone', label: 'Phone', value: '(+1) 123-456-7890', link: 'tel:+11234567890' },
            { id: uid(), type: 'email', label: 'Email', value: 'email@example.com', link: 'mailto:email@example.com' },
            { id: uid(), type: 'location', label: 'Location', value: '1234 Abc Street, Example, EX 01234', link: '' },
            { id: uid(), type: 'website', label: 'Website', value: 'example.com', link: 'https://example.com' },
            { id: uid(), type: 'linkedin', label: 'LinkedIn', value: 'linkedin.com/in/example', link: 'https://linkedin.com/in/example' },
            { id: uid(), type: 'github', label: 'GitHub', value: 'github.com/example', link: 'https://github.com/example' }
        ],
        experience: [
            { id: uid(), title: "Machine Learning Engineer Intern", company: "Slow Feet Technology", date: "Jul 2021 - Present", bullets: ["Devised a new food-agnostic formulation... (see <sup class=\"crossref-ref\"><a href=\"#ref-P1\">[~P1]</a></sup>)", "Developed a pan for meal cooking..."] }
        ],
        education: [
            { id: uid(), degree: "M.S. in Computer Science", university: "University of Charles River", location: "Boston, MA", date: "Sep 2021 - Jan 2023", bullets: ["Relevant Coursework: Advanced Algorithms...", "Thesis: Efficient Meal Prep..."] },
        ],
        skills: [
            { id: uid(), categoryName: "Programming Languages", entries: "Python (NumPy, Pandas), JavaScript (React, Node.js), TypeScript, Java, C++" },
            { id: uid(), categoryName: "Tools & Frameworks", entries: "Git, Docker, Kubernetes, PyTorch, TensorFlow, Django, $\\LaTeX$" },
            { id: uid(), categoryName: "Human Languages", entries: "English (Native), Indonesian (Fluent)" }
        ],
        awards: [
            { id: uid(), description: "Gold, ICCFC", year: "2018" }
        ],
        publications: [
            { id: uid(), refId: "P1", caption: "[~P1]", title: "Eating is All You Need", authors: "<u>Haha Ha</u>, San Zhang", venue: "<em>NeurIPS, 2099</em>" },
        ]
    };
    let resumeData = JSON.parse(JSON.stringify(defaultResumeData));

    // --- Marked.js Setup ---
    marked.setOptions({ gfm: true, breaks: false, pedantic: false, sanitize: false });

    // --- Core Update Function ---
    function updateAll() {
        const md = generateMarkdownFromData();
        markdownInput.value = md;
        htmlOutput.innerHTML = marked.parse(md);
        if (window.renderMathInElement) {
            renderMathInElement(htmlOutput, { delimiters: [{left:"$$",right:"$$",display:true},{left:"$",right:"$",display:false},{left:"\\(",right:"\\)",display:false},{left:"\\[",right:"\\]",display:true}] });
        }
        if (window.Iconify) window.Iconify.scan(htmlOutput);
    }

    // --- Markdown Generation ---
    function generateMarkdownFromData() {
        let md = "";
        md += `# ${resumeData.name || "Your Name"}\n\n`;
        const contactItemsForHeader = resumeData.contactItems.filter(item => item.value && item.value.trim() !== '');
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
                md += '<div class="resume-header">\n';
                lineItems.forEach((item, index) => {
                    const icon = getIconForContact(item);
                    const isEffectivelyLast = (index === lineItems.length - 1);
                    md += `  <span class="resume-header-item${isEffectivelyLast ? ' no-separator' : ''}"><span class="iconify" data-icon="${icon}"></span> ${item.link ? `<a href="${item.link}">${item.value}</a>` : item.value}</span>\n`;
                });
                md += '</div>\n';
            }
        });
        if (lines.length > 0) md += '\n';

        if (resumeData.experience && resumeData.experience.length > 0) {
            md += "## Experience\n\n";
            resumeData.experience.forEach(exp => {
                md += `<dl>\n  <dt>${exp.title || 'Untitled Role'}</dt>\n  <dd>${exp.company || 'Some Company'}</dd>\n  <dd>${exp.date || 'Date Range'}</dd>\n</dl>\n\n`;
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
    function createFormGroup(labelText, inputElement) { /* ... same ... */
        const group = document.createElement('div'); group.className = 'form-group';
        const label = document.createElement('label'); label.textContent = labelText;
        group.appendChild(label); group.appendChild(inputElement); return group;
    }
    function createInputElement(type, value, placeholder, className, dataAttrs = {}, onChangeCallback) { /* ... same ... */
        const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
        if (type !== 'textarea') input.type = type; input.className = className;
        input.value = value || ''; if (placeholder) input.placeholder = placeholder;
        Object.entries(dataAttrs).forEach(([key, val]) => input.dataset[key] = val);
        if (onChangeCallback) input.addEventListener('change', onChangeCallback);
        else input.addEventListener('change', handleGenericInputChange); return input;
    }
    function createButton(text, className, onClick, title = '') { /* ... same ... */
        const btn = document.createElement('button'); btn.textContent = text;
        btn.className = className; if (title) btn.title = title;
        btn.addEventListener('click', onClick); return btn;
    }
    function handleGenericInputChange(event) { /* ... same ... */
        const path = event.target.dataset.path;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        let current = resumeData; const parts = path.split('.');
        try {
            for (let i = 0; i < parts.length - 1; i++) { current = current[parts[i]]; }
            current[parts[parts.length - 1]] = value;
        } catch (e) { console.error("Error updating data for path:", path, e); }
        updateAll();
    }

    function renderContactItems() { /* ... same as previous (with no icon input / noSep checkbox) ... */
        contactItemsContainer.innerHTML = '';
        resumeData.contactItems.forEach((item, index) => {
            const itemDiv = document.createElement('div'); itemDiv.className = 'contact-item-row'; itemDiv.dataset.id = item.id;
            itemDiv.appendChild(createFormGroup('Label:', createInputElement('text', item.label, 'Label (e.g., Phone)', `contact-label`, { path: `contactItems.${index}.label` })));
            itemDiv.appendChild(createFormGroup('Value:', createInputElement('text', item.value, 'Value (e.g., 555-1234)', `contact-value`, { path: `contactItems.${index}.value` })));
            itemDiv.appendChild(createFormGroup('Link (Optional):', createInputElement('text', item.link, 'https:// or mailto:', `contact-link`, { path: `contactItems.${index}.link` })));
            const actionsDiv = document.createElement('div'); actionsDiv.className = 'contact-item-actions';
            actionsDiv.appendChild(createButton("Remove", "remove-btn", () => {
                resumeData.contactItems = resumeData.contactItems.filter(ci => ci.id !== item.id);
                renderContactItems(); updateAll();
            }));
            itemDiv.appendChild(actionsDiv);
            contactItemsContainer.appendChild(itemDiv);
        });
    }
    const contactTypes = [ /* ... same ... */
        { type: 'phone', label: 'Phone', defaultIcon: 'tabler:phone', defaultLinkPrefix: 'tel:'},
        { type: 'email', label: 'Email', defaultIcon: 'tabler:mail', defaultLinkPrefix: 'mailto:'},
        { type: 'website', label: 'Website', defaultIcon: 'charm:link', defaultLinkPrefix: 'https://' },
        { type: 'location', label: 'Location', defaultIcon: 'ic:outline-location-on' },
        { type: 'linkedin', label: 'LinkedIn', defaultIcon: 'tabler:brand-linkedin', defaultLinkPrefix: 'https://linkedin.com/in/' },
        { type: 'github', label: 'GitHub', defaultIcon: 'tabler:brand-github', defaultLinkPrefix: 'https://github.com/' }
    ];
    contactItemsButtonsContainer.innerHTML = '';
    contactTypes.forEach(contact => { /* ... same ... */
        contactItemsButtonsContainer.appendChild(createButton(`Add ${contact.label}`, `add-${contact.type}-btn`, () => {
            resumeData.contactItems.push({ id: uid(), type: contact.type, label: contact.label, value: '', link: contact.defaultLinkPrefix || '' });
            renderContactItems(); updateAll();
        }));
    });

    function renderListEntry(item, index, sectionName, fieldsConfig, bulletsConfig) { /* ... same ... */
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
                li.appendChild(createButton("X", "remove-btn", () => { item[bulletsConfig.key].splice(bIndex, 1); populateFormsFromData(); }));
                bulletsUl.appendChild(li);
            });
            entryDiv.appendChild(bulletsUl);
            entryDiv.appendChild(createButton(bulletsConfig.addBtnText, `add-bullet-${sectionName}`, () => {
                if (!item[bulletsConfig.key]) item[bulletsConfig.key] = []; item[bulletsConfig.key].push(""); populateFormsFromData();
            }));
        }
        entryDiv.appendChild(createButton(`Remove ${fieldsConfig[0].label}`, "remove-btn", () => {
            resumeData[sectionName] = resumeData[sectionName].filter(e => e.id !== item.id); populateFormsFromData();
        }));
        return entryDiv;
    }

    const experienceFields = [ {label: 'Title', key: 'title'}, {label: 'Company', key: 'company'}, {label: 'Date', key: 'date'}];
    const experienceBullets = {label: 'Responsibilities/Achievements:', key: 'bullets', placeholder: 'Bullet point...', addBtnText: 'Add Bullet'};
    function renderExperienceForms() { experienceEntriesContainer.innerHTML = ''; resumeData.experience.forEach((item, i) => experienceEntriesContainer.appendChild(renderListEntry(item, i, 'experience', experienceFields, experienceBullets))); }
    addExperienceBtn.addEventListener('click', () => { resumeData.experience.push({ id: uid(), title: "", company: "", date: "", bullets: [""] }); populateFormsFromData(); });

    const educationFields = [ {label: 'Degree', key: 'degree'}, {label: 'University', key: 'university'}, {label: 'Location', key: 'location'}, {label: 'Date', key: 'date'}];
    const educationBullets = {label: 'Details/Courses:', key: 'bullets', placeholder: 'Details...', addBtnText: 'Add Detail'};
    function renderEducationForms() { educationEntriesContainer.innerHTML = ''; resumeData.education.forEach((item, i) => educationEntriesContainer.appendChild(renderListEntry(item, i, 'education', educationFields, educationBullets)));}
    addEducationBtn.addEventListener('click', () => { resumeData.education.push({ id: uid(), degree: "", university: "", location: "", date: "", bullets: [] }); populateFormsFromData(); });
    
    function renderSkillForms() { /* ... same ... */
        skillCategoriesContainer.innerHTML = '';
        resumeData.skills.forEach((category, index) => {
            const catDiv = document.createElement('div'); catDiv.className = 'skill-category-entry'; catDiv.dataset.id = category.id;
            catDiv.appendChild(createFormGroup('Category Name:', createInputElement('text', category.categoryName, 'e.g., Programming Languages', `skill-category-name`, { path: `skills.${index}.categoryName` })));
            catDiv.appendChild(createFormGroup('Skills (one per line for GFM line breaks, or comma-separated):', createInputElement('textarea', category.entries, 'Python, Java, SQL...', `skill-category-entries`, { path: `skills.${index}.entries` })));
            catDiv.appendChild(createButton("Remove Category", "remove-btn", () => {
                resumeData.skills = resumeData.skills.filter(sc => sc.id !== category.id); renderSkillForms(); updateAll();
            }));
            skillCategoriesContainer.appendChild(catDiv);
        });
    }
    addSkillCategoryBtn.addEventListener('click', () => { resumeData.skills.push({ id: uid(), categoryName: "New Skill Category", entries: "" }); renderSkillForms(); updateAll(); });

    const awardFields = [ {label: 'Description', key: 'description'}, {label: 'Year (Optional)', key: 'year'}];
    function renderAwardForms() { awardEntriesContainer.innerHTML = ''; resumeData.awards.forEach((item, i) => awardEntriesContainer.appendChild(renderListEntry(item, i, 'awards', awardFields, null))); }
    addAwardBtn.addEventListener('click', () => { resumeData.awards.push({ id: uid(), description: "", year: "" }); populateFormsFromData(); });

    const publicationFields = [ {label: 'Ref ID (e.g. P1)', key: 'refId'}, {label: 'Caption (e.g. [~P1])', key: 'caption'}, {label: 'Title', key: 'title'}, {label: 'Authors', key: 'authors'}, {label: 'Venue/Journal', key: 'venue'} ];
    function renderPublicationForms() { publicationEntriesContainer.innerHTML = ''; resumeData.publications.forEach((item, i) => publicationEntriesContainer.appendChild(renderListEntry(item, i, 'publications', publicationFields, null)));}
    addPublicationBtn.addEventListener('click', () => { resumeData.publications.push({ id: uid(), refId: `P${resumeData.publications.length+1}`, caption: `[~P${resumeData.publications.length+1}]`, title: "", authors: "", venue: "" }); populateFormsFromData(); });

    function populateFormsFromData() { /* ... same ... */
        nameInput.value = resumeData.name; nameInput.dataset.path = "name"; 
        renderContactItems(); renderExperienceForms(); renderEducationForms();
        renderSkillForms(); renderAwardForms(); renderPublicationForms();
        updateAll();
    }
    nameInput.addEventListener('change', handleGenericInputChange);

    function showStatusMessage(message, isError = false) { /* ... same ... */
        statusMessageDiv.textContent = message; statusMessageDiv.style.color = isError ? 'rgb(220, 53, 69)' : 'rgb(40, 167, 69)';
        setTimeout(() => statusMessageDiv.textContent = '', 5000);
    }
    const saveButton = createButton("Save Resume", "save-md-btn", async () => { /* ... same ... */
        const markdownToSave = generateMarkdownFromData(); const formData = new FormData();
        formData.append('markdown_content', markdownToSave);
        try {
            const response = await fetch('/save_markdown', { method: 'POST', body: formData });
            const result = await response.json();
            showStatusMessage(result.message, !(response.ok && result.status === 'success'));
        } catch (error) { showStatusMessage('Error saving resume.', true); console.error("Save error:", error); }
    });
    const resetButton = createButton("Reset Form", "reset-md-btn", () => { /* ... same ... */
        if (confirm("Are you sure you want to reset all form data to the default template? Unsaved changes will be lost.")) {
            resumeData = JSON.parse(JSON.stringify(defaultResumeData));
            populateFormsFromData();
            showStatusMessage("Form reset to default template. Click 'Save Resume' to persist this version.");
        }
    });
    mainControlsContainer.append(saveButton, resetButton);

    // --- PDF Export Button --- RESTORED
    const exportPdfButton = createButton("Export as PDF", "export-pdf-btn", async () => {
        showStatusMessage("Generating PDF...", false); // Indicate processing
        const htmlContentToExport = document.getElementById('html-output').innerHTML;
        const formData = new FormData();
        formData.append('html_content', htmlContentToExport);
        try {
            const response = await fetch('/export_pdf', { method: 'POST', body: formData });
            if (response.ok) {
                const blob = await response.blob();
                const link = document.createElement('a');
                const safeName = (resumeData.name || "resume").replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
                link.href = URL.createObjectURL(blob);
                link.download = `${safeName}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
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
    // Add the export button to the preview pane's controls
    const pdfButtonContainer = previewPaneWrapper.querySelector('.preview-controls');
    if (pdfButtonContainer) {
        pdfButtonContainer.appendChild(exportPdfButton);
    } else { // Fallback if .preview-controls isn't found (should not happen with current HTML)
        console.warn("Could not find .preview-controls to append PDF export button.");
        mainControlsContainer.appendChild(exportPdfButton);
    }

    // --- Collapsible Preview Pane Logic --- REMOVED
    // previewToggleBtn.addEventListener('click', () => { ... });

    // --- Load initial data ---
    populateFormsFromData();
});