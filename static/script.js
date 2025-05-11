// static/script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const markdownInput = document.getElementById('markdown-input'); // Hidden
    const htmlOutput = document.getElementById('html-output');
    const statusMessageDiv = document.getElementById('status-message');
    const mainControlsContainer = document.getElementById('main-controls');

    // Form sections
    const nameInput = document.getElementById('resume-name');
    const contactItemsContainer = document.getElementById('contact-items-container');
    const addContactItemBtn = document.getElementById('add-contact-item-btn');

    const experienceEntriesContainer = document.getElementById('experience-entries-container');
    const addExperienceBtn = document.getElementById('add-experience-btn');

    const educationEntriesContainer = document.getElementById('education-entries-container');
    const addEducationBtn = document.getElementById('add-education-btn');

    const skillsProgrammingTextarea = document.getElementById('skills-programming');
    const skillsToolsTextarea = document.getElementById('skills-tools');
    const skillsLanguagesTextarea = document.getElementById('skills-languages');

    const awardEntriesContainer = document.getElementById('award-entries-container');
    const addAwardBtn = document.getElementById('add-award-btn');

    const publicationEntriesContainer = document.getElementById('publication-entries-container');
    const addPublicationBtn = document.getElementById('add-publication-btn');

    // --- Utility ---
    function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 9); }

    // --- Initial Resume Data ---
    let resumeData = {
        name: "Bruce Wayne",
        contactItems: [
            { id: uid(), label: 'Website', value: 'example.com', link: 'https://example.com/', icon: 'charm:person', noSeparator: false },
            { id: uid(), label: 'GitHub', value: 'github.com/example', link: 'https://github.com/example', icon: 'tabler:brand-github', noSeparator: false  },
            { id: uid(), label: 'Phone', value: '(+1) 123-456-7890', link: 'https://wa.me/11234567890', icon: 'tabler:phone', noSeparator: true },
            { id: uid(), label: 'Location', value: '1234 Abc Street, Example, EX 01234', link: '', icon: 'ic:outline-location-on', noSeparator: false  },
            { id: uid(), label: 'LinkedIn', value: 'linkedin.com/in/example', link: 'https://linkedin.com/in/example/', icon: 'tabler:brand-linkedin', noSeparator: false  },
            { id: uid(), label: 'Email', value: 'email@example.com', link: 'mailto:mail@example.com', icon: 'tabler:mail', noSeparator: true }
        ],
        experience: [
            { id: uid(), title: "ML Intern", company: "Slow Feet Tech", date: "Jul 2021 - Pres", bullets: ["Devised new formulation... (see P1)", "Developed pan for cooking."] }
        ],
        education: [
            { id: uid(), degree: "M.S. CS", university: "UCR", location: "Boston, MA", date: "Sep 2021 - Jan 2023", bullets: ["Thesis on ...", "GPA: 4.0"] },
            { id: uid(), degree: "B.Eng. SE", university: "HIT", location: "Shanghai, China", date: "Sep 2016 - Jul 2020", bullets: [] }
        ],
        skills: {
            programming: "Python, JavaScript / TypeScript, HTML / CSS, Java",
            tools: "Git, PyTorch, Keras, scikit-learn, Linux, $\\LaTeX$",
            languages: "English (proficient), Indonesia (native)"
        },
        awards: [
            { id: uid(), description: "Gold, ICCFC", year: "2018" }
        ],
        publications: [
            { id: uid(), refId: "P1", caption: "[~P1]", title: "Eating is All You Need", authors: "<u>H. Ha</u>, S. Zhang", venue: "<em>NeurIPS, 2099</em>" }
        ]
    };

    // --- Marked.js Setup ---
    marked.setOptions({ gfm: true, breaks: false /* ... */ });

    // --- Core Update Function ---
    function updateAll() {
        const md = generateMarkdownFromData();
        markdownInput.value = md; // Update hidden textarea for save/export
        htmlOutput.innerHTML = marked.parse(md);
        if (window.renderMathInElement) {
            renderMathInElement(htmlOutput, { delimiters: [/*...*/] });
        }
        // Iconify.scan(htmlOutput); // Might be needed if icons are added dynamically to preview
    }

    // --- Markdown Generation ---
    function generateMarkdownFromData() {
        let md = "---\n---\n\n";
        md += `# ${resumeData.name || "Your Name"}\n\n`;

        // Contact Items - arrange them into two lines for the header
        const contactLine1 = resumeData.contactItems.slice(0, 3); // Example: first 3 items
        const contactLine2 = resumeData.contactItems.slice(3);    // Rest of items

        if (contactLine1.length > 0) {
            md += '<div class="resume-header">\n';
            contactLine1.forEach(item => {
                md += `  <span class="resume-header-item${item.noSeparator ? ' no-separator' : ''}"><span class="iconify" data-icon="${item.icon || 'mdi:link-variant'}"></span> ${item.link ? `<a href="${item.link}">${item.value}</a>` : item.value}</span>\n`;
            });
            md += '</div>\n';
        }
        if (contactLine2.length > 0) {
            md += '<div class="resume-header">\n';
            contactLine2.forEach(item => {
                md += `  <span class="resume-header-item${item.noSeparator ? ' no-separator' : ''}"><span class="iconify" data-icon="${item.icon || 'mdi:link-variant'}"></span> ${item.link ? `<a href="${item.link}">${item.value}</a>` : item.value}</span>\n`;
            });
            md += '</div>\n\n';
        }


        // Experience
        if (resumeData.experience.length > 0) {
            md += "## Experience\n\n";
            resumeData.experience.forEach(exp => {
                md += `<dl>\n  <dt>${exp.title}</dt>\n  <dd>${exp.company}</dd>\n  <dd>${exp.date}</dd>\n</dl>\n\n`;
                exp.bullets.forEach(bullet => { md += `- ${bullet}\n`; });
                md += "\n";
            });
        }

        // Education
        if (resumeData.education.length > 0) {
            md += "## Education\n\n";
            resumeData.education.forEach(edu => {
                md += `<dl>\n  <dt>${edu.degree}</dt>\n  <dd>${edu.university}</dd>\n  <dd>${edu.location}</dd>\n  <dd>${edu.date}</dd>\n</dl>\n\n`;
                if (edu.bullets && edu.bullets.length > 0) {
                    edu.bullets.forEach(bullet => { md += `- ${bullet}\n`; });
                    md += "\n";
                }
            });
        }

        // Skills
        md += "## Skills\n\n";
        if(resumeData.skills.programming) md += `**Programming Languages:** ${resumeData.skills.programming.replace(/\n/g, '<br/>')}\n\n`; // Handle newlines in textarea
        if(resumeData.skills.tools) md += `**Tools and Frameworks:** ${resumeData.skills.tools.replace(/\n/g, '<br/>')}\n\n`;
        if(resumeData.skills.languages) md += `**Languages:** ${resumeData.skills.languages.replace(/\n/g, '<br/>')}\n\n`;


        // Awards
        if (resumeData.awards.length > 0) {
            md += "## Awards and Honors\n\n";
            resumeData.awards.forEach(award => {
                md += `**${award.description}**${award.year ? `   :   ${award.year}` : ''}\n\n`;
            });
        }

        // Publications
        if (resumeData.publications.length > 0) {
            md += "## Publications\n\n<ul class=\"crossref-list\">\n";
            resumeData.publications.forEach(pub => {
                md += `<li data-caption="${pub.caption}" id="ref-${pub.refId}" class="crossref-item">\n<strong>${pub.title}</strong> <br/>\n${pub.authors} <br/>\n${pub.venue}\n</li>\n`;
            });
            md += "</ul>\n";
        }
        return md;
    }


    // --- UI Rendering & Event Handling (Generic CRUD pattern for list items) ---
    function createTextElement(tag, text) { const el = document.createElement(tag); el.textContent = text; return el; }
    function createInputElement(type, value, placeholder, className, dataAttrs = {}) {
        const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
        if (type !== 'textarea') input.type = type;
        input.className = className;
        input.value = value;
        if (placeholder) input.placeholder = placeholder;
        Object.entries(dataAttrs).forEach(([key, val]) => input.dataset[key] = val);
        input.addEventListener('change', handleGenericInputChange);
        return input;
    }
    function createButton(text, className, onClick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.className = className;
        btn.addEventListener('click', onClick);
        return btn;
    }

    function renderListSection(container, items, itemRenderer, addItemCallback, sectionName) {
        container.innerHTML = '';
        items.forEach((item, index) => {
            const itemDiv = itemRenderer(item, index, sectionName);
            container.appendChild(itemDiv);
        });
    }
    
    function handleGenericInputChange(event) { // Needs to be smarter with data paths
        const path = event.target.dataset.path; // e.g., "experience.0.title" or "skills.programming"
        const value = event.target.value;
        // Super simplified path update - for deep paths, a helper is needed
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
    
    // --- Specific Section Renderers & Handlers ---

    // Contact Info
    function renderContactItems() {
        contactItemsContainer.innerHTML = '';
        resumeData.contactItems.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'contact-item-row form-group';
            div.innerHTML = `
                <input type="text" value="${item.label}" placeholder="Label (e.g., Phone)" data-path="contactItems.${index}.label" title="Label">
                <input type="text" value="${item.value}" placeholder="Value (e.g., 555-1234)" data-path="contactItems.${index}.value" title="Value">
                <input type="text" value="${item.link || ''}" placeholder="Link (Optional)" data-path="contactItems.${index}.link" title="Link">
                <input type="text" value="${item.icon}" placeholder="Iconify Icon" data-path="contactItems.${index}.icon" title="Iconify Name (e.g., tabler:phone)">
            `;
            const removeBtn = createButton("Remove", "remove-btn", () => {
                resumeData.contactItems.splice(index, 1);
                renderContactItems();
                updateAll();
            });
            div.appendChild(removeBtn);
            // No/Separator checkbox
            const noSepLabel = createTextElement('label', ' No Sep.');
            noSepLabel.style.fontSize = '0.8em'; noSepLabel.style.marginLeft = '5px';
            const noSepCheckbox = createInputElement('checkbox', '', '', '');
            noSepCheckbox.checked = item.noSeparator || false;
            noSepCheckbox.dataset.path = `contactItems.${index}.noSeparator`;
            noSepCheckbox.addEventListener('change', (e) => {
                 resumeData.contactItems[index].noSeparator = e.target.checked;
                 updateAll();
            });
            div.appendChild(noSepCheckbox);
            div.appendChild(noSepLabel);

            contactItemsContainer.appendChild(div);
            // Add listeners to newly created inputs
            div.querySelectorAll('input[type="text"]').forEach(input => input.addEventListener('change', handleGenericInputChange));
        });
    }
    addContactItemBtn.addEventListener('click', () => {
        resumeData.contactItems.push({ id: uid(), label: 'New Item', value: '', link: '', icon: 'mdi:link', noSeparator: false });
        renderContactItems();
        updateAll();
    });


    // Experience (reusing some logic from previous example, adapted)
    function renderExperienceItem(exp, index) {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'form-group experience-entry';
        entryDiv.dataset.pathRoot = `experience.${index}`; // For easier path construction
        entryDiv.innerHTML = `
            <label>Title:</label><input type="text" data-path="experience.${index}.title" value="${exp.title}">
            <label>Company:</label><input type="text" data-path="experience.${index}.company" value="${exp.company}">
            <label>Date:</label><input type="text" data-path="experience.${index}.date" value="${exp.date}">
            <label>Bullet Points:</label><ul class="bullet-list" id="bullets-${exp.id}"></ul>
            <button class="add-bullet-btn-exp">Add Bullet</button>
            <hr style="margin: 10px 0;">`;
        entryDiv.appendChild(createButton("Remove Experience", "remove-btn", () => {
            resumeData.experience.splice(index, 1);
            renderExperienceForms(); updateAll();
        }));
        entryDiv.querySelectorAll('input').forEach(inp => inp.addEventListener('change', handleGenericInputChange));
        
        // Bullets
        const bulletsUl = entryDiv.querySelector(`#bullets-${exp.id}`);
        exp.bullets.forEach((bullet, bIndex) => {
            const li = document.createElement('li');
            const bulletInput = createInputElement('text', bullet, 'Responsibility...', '', { path: `experience.${index}.bullets.${bIndex}` });
            li.appendChild(bulletInput);
            li.appendChild(createButton("X", "remove-btn remove-bullet-btn-exp", () => {
                exp.bullets.splice(bIndex, 1);
                renderExperienceForms(); updateAll();
            }));
            bulletsUl.appendChild(li);
        });
        entryDiv.querySelector('.add-bullet-btn-exp').addEventListener('click', () => {
            exp.bullets.push("New bullet point");
            renderExperienceForms(); updateAll();
        });
        return entryDiv;
    }
    function renderExperienceForms() { renderListSection(experienceEntriesContainer, resumeData.experience, renderExperienceItem, addExperienceItem); }
    function addExperienceItem() { resumeData.experience.push({ id: uid(), title: "", company: "", date: "", bullets: [""] }); renderExperienceForms(); updateAll(); }
    addExperienceBtn.addEventListener('click', addExperienceItem);

    // Education (Similar to Experience)
    function renderEducationItem(edu, index) {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'form-group education-entry';
        entryDiv.innerHTML = `
            <label>Degree:</label><input type="text" data-path="education.${index}.degree" value="${edu.degree}">
            <label>University:</label><input type="text" data-path="education.${index}.university" value="${edu.university}">
            <label>Location:</label><input type="text" data-path="education.${index}.location" value="${edu.location}">
            <label>Date:</label><input type="text" data-path="education.${index}.date" value="${edu.date}">
            <label>Bullet Points (Optional):</label><ul class="bullet-list" id="bullets-edu-${edu.id}"></ul>
            <button class="add-bullet-btn-edu">Add Bullet</button>
            <hr style="margin: 10px 0;">`;
        entryDiv.appendChild(createButton("Remove Education", "remove-btn", () => {
            resumeData.education.splice(index, 1);
            renderEducationForms(); updateAll();
        }));
        entryDiv.querySelectorAll('input').forEach(inp => inp.addEventListener('change', handleGenericInputChange));

        const bulletsUl = entryDiv.querySelector(`#bullets-edu-${edu.id}`);
        (edu.bullets || []).forEach((bullet, bIndex) => {
            const li = document.createElement('li');
            li.appendChild(createInputElement('text', bullet, 'Details...', '', {path: `education.${index}.bullets.${bIndex}`}));
            li.appendChild(createButton("X", "remove-btn remove-bullet-btn-edu", () => {
                edu.bullets.splice(bIndex, 1); renderEducationForms(); updateAll();
            }));
            bulletsUl.appendChild(li);
        });
        entryDiv.querySelector('.add-bullet-btn-edu').addEventListener('click', () => {
            if (!edu.bullets) edu.bullets = [];
            edu.bullets.push(""); renderEducationForms(); updateAll();
        });
        return entryDiv;
    }
    function renderEducationForms() { renderListSection(educationEntriesContainer, resumeData.education, renderEducationItem, addEducationItem); }
    function addEducationItem() { resumeData.education.push({ id: uid(), degree: "", university: "", location: "", date: "", bullets: [] }); renderEducationForms(); updateAll(); }
    addEducationBtn.addEventListener('click', addEducationItem);

    // Skills (Textareas)
    skillsProgrammingTextarea.value = resumeData.skills.programming;
    skillsToolsTextarea.value = resumeData.skills.tools;
    skillsLanguagesTextarea.value = resumeData.skills.languages;
    [skillsProgrammingTextarea, skillsToolsTextarea, skillsLanguagesTextarea].forEach(ta => {
        ta.addEventListener('change', handleGenericInputChange);
    });

    // Awards
    function renderAwardItem(award, index) { /* ... similar to experience item, simpler fields ... */
        const entryDiv = document.createElement('div');
        entryDiv.className = 'form-group award-entry';
        entryDiv.innerHTML = `
            <label>Description:</label><input type="text" data-path="awards.${index}.description" value="${award.description}">
            <label>Year (Optional):</label><input type="text" data-path="awards.${index}.year" value="${award.year || ''}">
            <hr style="margin: 10px 0;">`;
        entryDiv.appendChild(createButton("Remove Award", "remove-btn", () => {
            resumeData.awards.splice(index, 1); renderAwardForms(); updateAll();
        }));
        entryDiv.querySelectorAll('input').forEach(inp => inp.addEventListener('change', handleGenericInputChange));
        return entryDiv;
    }
    function renderAwardForms() { renderListSection(awardEntriesContainer, resumeData.awards, renderAwardItem, addAwardItem); }
    function addAwardItem() { resumeData.awards.push({ id: uid(), description: "", year: "" }); renderAwardForms(); updateAll(); }
    addAwardBtn.addEventListener('click', addAwardItem);

    // Publications
    function renderPublicationItem(pub, index) { /* ... similar, fields: refId, caption, title, authors, venue ... */
        const entryDiv = document.createElement('div');
        entryDiv.className = 'form-group publication-entry';
        entryDiv.innerHTML = `
            <label>Ref ID (e.g., P1):</label><input type="text" data-path="publications.${index}.refId" value="${pub.refId}">
            <label>Caption (e.g., [~P1]):</label><input type="text" data-path="publications.${index}.caption" value="${pub.caption}">
            <label>Title:</label><input type="text" data-path="publications.${index}.title" value="${pub.title}">
            <label>Authors (can use <u>HTML</u> for underline):</label><input type="text" data-path="publications.${index}.authors" value="${pub.authors}">
            <label>Venue (can use <em>HTML</em> for italics):</label><input type="text" data-path="publications.${index}.venue" value="${pub.venue}">
            <hr style="margin: 10px 0;">`;
        entryDiv.appendChild(createButton("Remove Publication", "remove-btn", () => {
            resumeData.publications.splice(index, 1); renderPublicationForms(); updateAll();
        }));
        entryDiv.querySelectorAll('input').forEach(inp => inp.addEventListener('change', handleGenericInputChange));
        return entryDiv;
    }
    function renderPublicationForms() { renderListSection(publicationEntriesContainer, resumeData.publications, renderPublicationItem, addPublicationItem); }
    function addPublicationItem() { resumeData.publications.push({ id: uid(), refId: `P${resumeData.publications.length + 1}`, caption: `[~P${resumeData.publications.length + 1}]`, title: "", authors: "", venue: "" }); renderPublicationForms(); updateAll(); }
    addPublicationBtn.addEventListener('click', addPublicationItem);


    // --- Initial Form Population & Render ---
    function populateFormsFromData() {
        nameInput.value = resumeData.name;
        nameInput.dataset.path = "name"; // For generic handler
        nameInput.addEventListener('change', handleGenericInputChange);

        renderContactItems();
        renderExperienceForms();
        renderEducationForms();
        // Skills textareas are already assigned above and have listeners.
        renderAwardForms();
        renderPublicationForms();
        updateAll(); // Generate initial Markdown & Preview
    }


    // --- Main Controls (Save, Reset) & Status Messages ---
    function showStatusMessage(message, isError = false) { /* ... as before ... */ }
    function clearStatusMessage() { /* ... as before ... */ }

    const saveButton = createButton("Save Resume", "save-btn", async () => {
        const markdownToSave = generateMarkdownFromData();
        const formData = new FormData();
        formData.append('markdown_content', markdownToSave);
        try {
            const response = await fetch('/save_markdown', { method: 'POST', body: formData });
            const result = await response.json();
            showStatusMessage(result.message, !(response.ok && result.status === 'success'));
        } catch (error) { showStatusMessage('Error saving resume.', true); }
    });
    saveButton.style.backgroundColor = '#28a745';

    const resetButton = createButton("Reset Form (to Bruce Wayne default)", "reset-btn", () => {
        if (confirm("Are you sure you want to reset all form data to the Bruce Wayne template? Unsaved changes will be lost.")) {
            // Re-initialize resumeData to a deep copy of the original default
            // This is a simple way. A true default template object would be better.
            // For now, we effectively reload what was the initial state for this demo.
            // A more robust reset would fetch 'bruce_wayne_resume.md', then PARSE it (hard)
            // OR reset resumeData to a predefined JS object.
            // Simplest for now: hardcode the default structure again or deep clone initial.
            // This example will just re-run populateFormsFromData which uses the current `resumeData`
            // which might have been loaded from a file. A true "reset to template" needs more.
            // For now, let's alert and do a "soft" reset to the JS defaults.
            resumeData = { // THIS IS A HARD RESET TO THE JS DEFINED DEFAULT
                name: "Bruce Wayne",
                contactItems: [ { id: uid(), label: 'Website', value: 'example.com', link: 'https://example.com/', icon: 'charm:person' }, /* ... more defaults ... */ ],
                experience: [ { id: uid(), title: "ML Intern", company: "Slow Feet Tech", date: "Jul 2021 - Pres", bullets: ["Devised new formulation..."] } ],
                education: [ { id: uid(), degree: "M.S. CS", university: "UCR", location: "Boston, MA", date: "Sep 2021 - Jan 2023", bullets: [] } ],
                skills: { programming: "Python", tools: "Git, $\\LaTeX$", languages: "English" },
                awards: [ { id: uid(), description: "Gold, ICCFC", year: "2018" } ],
                publications: [ { id: uid(), refId: "P1", caption: "[~P1]", title: "Eating is All You Need", authors: "<u>H. Ha</u>", venue: "<em>NeurIPS</em>" } ]
            };
            populateFormsFromData(); // This will re-render forms and call updateAll
            showStatusMessage("Form reset to internal default. Click 'Save Resume' to persist this version.");
        }
    });
    resetButton.style.backgroundColor = '#dc3545';

    mainControlsContainer.appendChild(saveButton);
    mainControlsContainer.appendChild(resetButton);

    // PDF Export Button
    const exportPdfButton = createButton("Export as PDF", "export-pdf-btn", async () => { /* ... */ });
    exportPdfButton.style.backgroundColor = '#007bff';
    document.querySelector('.preview-pane .preview-controls').appendChild(exportPdfButton);
    // (Copy the existing exportPdfButton click handler logic here)
     exportPdfButton.addEventListener('click', async () => {
        clearStatusMessage();
        const htmlContentToExport = document.getElementById('html-output').innerHTML;
        // ... (rest of PDF export logic from previous step)
        const formData = new FormData();
        formData.append('html_content', htmlContentToExport);
        try {
            const response = await fetch('/export_pdf', { method: 'POST', body: formData });
            if (response.ok) { /* download blob */ } else { /* show error */ }
        } catch (error) { /* show error */ }
    });


    // --- Load initial data into forms and render preview ---
    // The `initial_markdown` in the hidden textarea is from `resume.md` (or template).
    // We're now primarily driving the content from the `resumeData` JS object.
    // A more advanced version would attempt to parse `markdownInput.value` into `resumeData`.
    // For now, `populateFormsFromData` will set up UI from JS `resumeData`
    // and `updateAll` will generate MD from it, effectively making the JS object the source.
    populateFormsFromData();

});