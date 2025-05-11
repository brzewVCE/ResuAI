// static/script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const markdownInput = document.getElementById('markdown-input'); // Hidden
    const htmlOutput = document.getElementById('html-output');
    const statusMessageDiv = document.getElementById('status-message');
    const mainControlsContainer = document.getElementById('main-controls');

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

    // --- Default Resume Data (used for reset and initial state if resume.md is empty/new) ---
    const defaultResumeData = {
        name: "Bruce Wayne",
        contactItems: [
            { id: uid(), type: 'phone', label: 'Phone', value: '(+1) 123-456-7890', link: 'tel:+11234567890', icon: 'tabler:phone', noSeparator: true },
            { id: uid(), type: 'email', label: 'Email', value: 'email@example.com', link: 'mailto:email@example.com', icon: 'tabler:mail', noSeparator: true },
            { id: uid(), type: 'location', label: 'Location', value: '1234 Abc Street, Example, EX 01234', link: '', icon: 'ic:outline-location-on', noSeparator: false  },
            { id: uid(), type: 'website', label: 'Website', value: 'example.com', link: 'https://example.com', icon: 'charm:link', noSeparator: false },
            { id: uid(), type: 'linkedin', label: 'LinkedIn', value: 'linkedin.com/in/example', link: 'https://linkedin.com/in/example', icon: 'tabler:brand-linkedin', noSeparator: false  },
            { id: uid(), type: 'github', label: 'GitHub', value: 'github.com/example', link: 'https://github.com/example', icon: 'tabler:brand-github', noSeparator: false  }
        ],
        experience: [
            { id: uid(), title: "Machine Learning Engineer Intern", company: "Slow Feet Technology", date: "Jul 2021 - Present", bullets: ["Devised a new food-agnostic formulation for fine-grained cross-ingredient meal cooking and subsumed the recent popular works into the proposed scheme (see <sup class=\"crossref-ref\"><a href=\"#ref-P1\">[~P1]</a></sup>)", "Developed a pan for meal cooking which is benefiting the group members' research work"] }
        ],
        education: [
            { id: uid(), degree: "M.S. in Computer Science", university: "University of Charles River", location: "Boston, MA", date: "Sep 2021 - Jan 2023", bullets: ["Relevant Coursework: Advanced Algorithms, Machine Learning, AI Ethics.", "Thesis: Efficient Meal Preparation using Deep Reinforcement Learning."] },
        ],
        skills: [
            { id: uid(), categoryName: "Programming Languages", entries: "Python (NumPy, Pandas, Scikit-learn), JavaScript (ES6+, React, Node.js), TypeScript, Java, C++" },
            { id: uid(), categoryName: "Tools & Frameworks", entries: "Git, Docker, Kubernetes, PyTorch, TensorFlow, Keras, Django, Flask, AWS, Azure, $\\LaTeX$" },
            { id: uid(), categoryName: "Human Languages", entries: "English (Native), Indonesian (Fluent)" }
        ],
        awards: [
            { id: uid(), description: "Gold, International Collegiate Catching Fish Contest (ICCFC)", year: "2018" },
            { id: uid(), description: "First Prize, China National Scholarship for Outstanding Dragons", year: "2017, 2018" }
        ],
        publications: [
            { id: uid(), refId: "P1", caption: "[~P1]", title: "Eating is All You Need", authors: "<u>Haha Ha</u>, San Zhang", venue: "<em>Conference on Neural Information Processing Systems (NeurIPS), 2099</em>" },
        ]
    };
    // Initialize resumeData. Attempt to parse from hidden textarea if it has content,
    // otherwise use a deep copy of the default. Parsing MD to JSON is complex and not implemented here.
    // For simplicity, we'll always start with default and let user save to resume.md
    let resumeData = JSON.parse(JSON.stringify(defaultResumeData)); // Deep copy

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
        if (window.Iconify) window.Iconify.scan(htmlOutput); // Re-scan for Iconify icons
    }

    // --- Markdown Generation ---
    function generateMarkdownFromData() {
        let md = "";
        md += `# ${resumeData.name || "Your Name"}\n\n`;

        const contactItemsForHeader = resumeData.contactItems.filter(item => item.value && item.value.trim() !== '');
        const lines = [];
        let currentLine = [];
        let lineItemCount = 0;
        const maxItemsPerLine = 3; // Adjust as needed

        contactItemsForHeader.forEach(item => {
            currentLine.push(item);
            lineItemCount++;
            if (lineItemCount >= maxItemsPerLine || item.noSeparator) {
                lines.push([...currentLine]);
                currentLine = [];
                lineItemCount = 0;
            }
        });
        if (currentLine.length > 0) lines.push([...currentLine]); // Add any remaining items

        lines.forEach(lineItems => {
            if (lineItems.length > 0) {
                md += '<div class="resume-header">\n';
                lineItems.forEach((item, index) => {
                    // Determine if this item is the last one in *its* logical group before a separator, or last in line
                    let isLastEffectively = item.noSeparator || (index === lineItems.length - 1);
                    md += `  <span class="resume-header-item${isLastEffectively ? ' no-separator' : ''}"><span class="iconify" data-icon="${item.icon || 'mdi:link-variant'}"></span> ${item.link ? `<a href="${item.link}">${item.value}</a>` : item.value}</span>\n`;
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
                    md += `**${skillCategory.categoryName.trim()}:** ${skillCategory.entries.trim().replace(/\n/g, '  \n')}\n\n`; // GFM line breaks
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
        const group = document.createElement('div');
        group.className = 'form-group';
        const label = document.createElement('label');
        label.textContent = labelText;
        group.appendChild(label);
        group.appendChild(inputElement);
        return group;
    }
    function createInputElement(type, value, placeholder, className, dataAttrs = {}, onChangeCallback) {
        const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
        if (type !== 'textarea') input.type = type;
        input.className = className;
        input.value = value || '';
        if (placeholder) input.placeholder = placeholder;
        Object.entries(dataAttrs).forEach(([key, val]) => input.dataset[key] = val);
        if (onChangeCallback) input.addEventListener('change', onChangeCallback);
        else input.addEventListener('change', handleGenericInputChange); // Default handler
        return input;
    }
    function createButton(text, className, onClick, title = '') {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.className = className;
        if (title) btn.title = title;
        btn.addEventListener('click', onClick);
        return btn;
    }
    function handleGenericInputChange(event) {
        const path = event.target.dataset.path;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        let current = resumeData;
        const parts = path.split('.');
        try {
            for (let i = 0; i < parts.length - 1; i++) {
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
        } catch (e) { console.error("Error updating data for path:", path, e); }
        updateAll();
    }

    // Contact Info
    function renderContactItems() {
        contactItemsContainer.innerHTML = '';
        resumeData.contactItems.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'contact-item-row';
            itemDiv.dataset.id = item.id;

            itemDiv.appendChild(createFormGroup('Label:', createInputElement('text', item.label, 'Label (e.g., Phone)', `contact-label`, { path: `contactItems.${index}.label` })));
            itemDiv.appendChild(createFormGroup('Value:', createInputElement('text', item.value, 'Value (e.g., 555-1234)', `contact-value`, { path: `contactItems.${index}.value` })));
            itemDiv.appendChild(createFormGroup('Link (Optional):', createInputElement('text', item.link, 'https:// or mailto:', `contact-link`, { path: `contactItems.${index}.link` })));
            itemDiv.appendChild(createFormGroup('Icon (Iconify):', createInputElement('text', item.icon, 'tabler:phone', `contact-icon`, { path: `contactItems.${index}.icon` })));
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'contact-item-actions';
            const noSepCheckbox = createInputElement('checkbox', '', '', `contact-nosep`);
            noSepCheckbox.checked = item.noSeparator || false;
            noSepCheckbox.dataset.path = `contactItems.${index}.noSeparator`; // Generic handler will pick this up
            const noSepLabel = document.createElement('label');
            noSepLabel.textContent = "End Line"; noSepLabel.style.fontWeight='normal'; noSepLabel.style.fontSize='0.8em'; noSepLabel.style.cursor='pointer';
            noSepLabel.htmlFor = noSepCheckbox.id = `contact-nosep-${item.id}`;
            actionsDiv.appendChild(noSepCheckbox);
            actionsDiv.appendChild(noSepLabel);
            actionsDiv.appendChild(createButton("Remove", "remove-btn", () => {
                resumeData.contactItems = resumeData.contactItems.filter(ci => ci.id !== item.id);
                renderContactItems(); updateAll();
            }));
            itemDiv.appendChild(actionsDiv);
            contactItemsContainer.appendChild(itemDiv);
        });
    }
    const contactTypes = [
        { type: 'phone', label: 'Phone', icon: 'tabler:phone', defaultLinkPrefix: 'tel:', noSeparatorDefault: true },
        { type: 'email', label: 'Email', icon: 'tabler:mail', defaultLinkPrefix: 'mailto:', noSeparatorDefault: true },
        { type: 'website', label: 'Website', icon: 'charm:link', defaultLinkPrefix: 'https://' },
        { type: 'location', label: 'Location', icon: 'ic:outline-location-on' },
        { type: 'linkedin', label: 'LinkedIn', icon: 'tabler:brand-linkedin', defaultLinkPrefix: 'https://linkedin.com/in/' },
        { type: 'github', label: 'GitHub', icon: 'tabler:brand-github', defaultLinkPrefix: 'https://github.com/' }
    ];
    contactTypes.forEach(contact => {
        contactItemsButtonsContainer.appendChild(createButton(`Add ${contact.label}`, `add-${contact.type}-btn`, () => {
            resumeData.contactItems.push({ id: uid(), type: contact.type, label: contact.label, value: '', link: contact.defaultLinkPrefix || '', icon: contact.icon, noSeparator: contact.noSeparatorDefault || false });
            renderContactItems(); updateAll();
        }));
    });

    // Reusable renderer for list-based sections (Experience, Education, Awards, Publications)
    function renderListEntry(item, index, sectionName, fieldsConfig, bulletsConfig) {
        const entryDiv = document.createElement('div');
        entryDiv.className = `form-group ${sectionName}-entry`;
        entryDiv.dataset.id = item.id;

        fieldsConfig.forEach(field => {
            entryDiv.appendChild(createFormGroup(field.label + ':', createInputElement(field.type || 'text', item[field.key], field.placeholder, `${sectionName}-${field.key}`, { path: `${sectionName}.${index}.${field.key}` })));
        });

        if (bulletsConfig) {
            const bulletsLabel = document.createElement('label');
            bulletsLabel.textContent = bulletsConfig.label;
            entryDiv.appendChild(bulletsLabel);
            const bulletsUl = document.createElement('ul');
            bulletsUl.className = 'bullet-list';
            (item[bulletsConfig.key] || []).forEach((bullet, bIndex) => {
                const li = document.createElement('li');
                li.appendChild(createInputElement('text', bullet, bulletsConfig.placeholder, `${sectionName}-bullet`, { path: `${sectionName}.${index}.${bulletsConfig.key}.${bIndex}` }));
                li.appendChild(createButton("X", "remove-btn", () => {
                    item[bulletsConfig.key].splice(bIndex, 1);
                    populateFormsFromData(); // Re-render all forms to refresh indices/paths
                }));
                bulletsUl.appendChild(li);
            });
            entryDiv.appendChild(bulletsUl);
            entryDiv.appendChild(createButton(bulletsConfig.addBtnText, `add-bullet-${sectionName}`, () => {
                if (!item[bulletsConfig.key]) item[bulletsConfig.key] = [];
                item[bulletsConfig.key].push("");
                populateFormsFromData();
            }));
        }
        entryDiv.appendChild(createButton(`Remove ${fieldsConfig[0].label}`, "remove-btn", () => {
            resumeData[sectionName] = resumeData[sectionName].filter(e => e.id !== item.id);
            populateFormsFromData();
        }));
        entryDiv.appendChild(document.createElement('hr'));
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
    
    // Skills (Dynamic Categories)
    function renderSkillForms() {
        skillCategoriesContainer.innerHTML = '';
        resumeData.skills.forEach((category, index) => {
            const catDiv = document.createElement('div');
            catDiv.className = 'skill-category-entry';
            catDiv.dataset.id = category.id;
            catDiv.appendChild(createFormGroup('Category Name:', createInputElement('text', category.categoryName, 'e.g., Programming Languages', `skill-category-name`, { path: `skills.${index}.categoryName` })));
            catDiv.appendChild(createFormGroup('Skills (comma-separated or one per line):', createInputElement('textarea', category.entries, 'Python, Java, SQL...', `skill-category-entries`, { path: `skills.${index}.entries` })));
            catDiv.appendChild(createButton("Remove Category", "remove-btn", () => {
                resumeData.skills = resumeData.skills.filter(sc => sc.id !== category.id);
                renderSkillForms(); updateAll();
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

    // --- Initial Form Population ---
    function populateFormsFromData() {
        nameInput.value = resumeData.name;
        nameInput.dataset.path = "name"; // For generic handler
        renderContactItems();
        renderExperienceForms();
        renderEducationForms();
        renderSkillForms();
        renderAwardForms();
        renderPublicationForms();
        updateAll();
    }
    nameInput.addEventListener('change', handleGenericInputChange); // Name is a single field

    // --- Main Controls (Save, Reset, Export PDF) & Status ---
    function showStatusMessage(message, isError = false) {
        statusMessageDiv.textContent = message;
        statusMessageDiv.style.color = isError ? '#dc3545' : '#28a745';
        setTimeout(() => statusMessageDiv.textContent = '', 5000);
    }
    const saveButton = createButton("Save Resume", "save-btn", async () => { /* ... as before ... */ });
    saveButton.style.backgroundColor = '#28a745'; saveButton.style.color = 'white';
    const resetButton = createButton("Reset Form", "reset-btn", () => {
        if (confirm("Are you sure you want to reset all form data to the default Bruce Wayne template? Unsaved changes will be lost.")) {
            resumeData = JSON.parse(JSON.stringify(defaultResumeData)); // Deep copy
            populateFormsFromData();
            showStatusMessage("Form reset to default template. Click 'Save Resume' to persist this version.");
        }
    });
    resetButton.style.backgroundColor = '#dc3545'; resetButton.style.color = 'white';
    mainControlsContainer.append(saveButton, resetButton);

    const exportPdfButton = createButton("Export as PDF", "export-pdf-btn", async () => { /* ... as before ... */ });
    exportPdfButton.style.backgroundColor = '#007bff'; exportPdfButton.style.color = 'white';
    document.querySelector('.preview-pane .preview-controls').appendChild(exportPdfButton);
    // (Copy existing export PDF logic for the click handler)
    exportPdfButton.addEventListener('click', async () => {
        const htmlContentToExport = document.getElementById('html-output').innerHTML;
        const formData = new FormData();
        formData.append('html_content', htmlContentToExport);
        try {
            const response = await fetch('/export_pdf', { method: 'POST', body: formData });
            if (response.ok) {
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'resume.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link); URL.revokeObjectURL(link.href);
            } else { showStatusMessage('Error exporting PDF: ' + await response.text(), true); }
        } catch (error) { showStatusMessage('Client-side error during PDF export.', true); }
    });

    // --- Load initial data ---
    // If markdownInput.value (from resume.md) is not empty, you could *try* to parse it.
    // For this example, we always start with `defaultResumeData` for simplicity,
    // assuming the user will save their work to `resume.md` via the "Save Resume" button.
    populateFormsFromData();
});