document.addEventListener('DOMContentLoaded', () => {
    // Hidden Markdown textarea (for compatibility with existing save/export)
    const markdownInput = document.getElementById('markdown-input');
    const htmlOutput = document.getElementById('html-output');
    const statusMessageDiv = document.getElementById('status-message');

    // UI Form Containers
    const resumeFormContainer = document.getElementById('resume-form-container');
    const personalNameInput = document.getElementById('resume-name');
    const experienceEntriesContainer = document.getElementById('experience-entries');
    const addExperienceBtn = document.getElementById('add-experience-btn');

    // --- Initial Resume Data Structure ---
    let resumeData = {
        name: "Bruce Wayne",
        contact: [ // Simplified, would need UI to edit these
            { type: "website", value: "example.com", icon: "charm:person", link: "https://example.com/" },
            { type: "github", value: "github.com/example", icon: "tabler:brand-github", link: "https://github.com/example" },
            { type: "phone", value: "(+1) 123-456-7890", icon: "tabler:phone", link: "https://wa.me/11234567890", noSeparator: true }
        ],
        contactLine2: [
            { type: "location", value: "1234 Abc Street, Example, EX 01234", icon: "ic:outline-location-on" },
            { type: "linkedin", value: "linkedin.com/in/example", icon: "tabler:brand-linkedin", link: "https://linkedin.com/in/example/" },
            { type: "email", value: "email@example.com", icon: "tabler:mail", link: "mailto:mail@example.com", noSeparator: true }
        ],
        experience: [
            {
                id: Date.now() + Math.random(), // Unique ID for managing in UI
                title: "Machine Learning Engineer Intern",
                company: "Slow Feet Technology",
                date: "Jul 2021 - Present",
                bullets: [
                    "Devised a new food-agnostic formulation for fine-grained cross-ingredient meal cooking and subsumed the recent popular works into the proposed scheme",
                    "Proposed a cream of mushroom soup recipe which is competitive when compared with the SOTA recipes with complex steps by only altering the way of cutting mushroom, published in NeurIPS 2099 (see <sup class=\"crossref-ref\"><a href=\"#ref-P1\">[~P1]</a></sup>)",
                    "Developed a pan for meal cooking which is benefiting the group members' research work"
                ]
            }
        ],
        // education, skills, awards, publications would be similar arrays/objects
        // For simplicity, these are not fully implemented in this example's UI
        education: [],
        skillsText: "Programming Languages: <span class=\"iconify\" data-icon=\"vscode-icons:file-type-python\"></span> Python, <span class=\"iconify\" data-icon=\"vscode-icons:file-type-js-official\"></span> JavaScript / <span class=\"iconify\" data-icon=\"vscode-icons:file-type-typescript-official\"></span> TypeScript, <span class=\"iconify\" data-icon=\"vscode-icons:file-type-html\"></span> HTML / <span class=\"iconify\" data-icon=\"vscode-icons:file-type-css\"></span> CSS, <span class=\"iconify\" data-icon=\"logos:java\" data-inline=\"false\"></span> Java\n\n**Tools and Frameworks:** Git, PyTorch, Keras, scikit-learn, Linux, Vue, React, Django, $\\LaTeX$\n\n**Languages:** English (proficient), Indonesia (native)",
        awardsText: "**Gold**, International Collegiate Catching Fish Contest (ICCFC)   :   2018\n\n**First Prize**, China National Scholarship for Outstanding Dragons   :   2017, 2018",
        publications: [
            { id: "P1", caption: "[~P1]", title: "Eating is All You Need", authors: "<u>Haha Ha</u>, San Zhang", venue: "<em>Conference on Neural Information Processing Systems (NeurIPS), 2099</em>" },
            { id: "P2", caption: "[~P2]", title: "You Only Cook Once: Unified, Real-Time Mapo Tofu Recipe", authors: "<u>Haha Ha</u>, San Zhang, Si Li, Wu Wang", venue: "<em>Computer Vision and Pattern Recognition Conference (CVPR), 2077 <strong>(Best Paper Honorable Mention)</strong></em>" }
        ]
    };

    // --- Marked.js Setup ---
    marked.setOptions({ /* ... your existing options ... */ gfm: true, breaks: false });

    // --- Core Functions ---
    function generateMarkdownFromData() {
        let md = "---\n---\n\n"; // Frontmatter
        md += `# ${resumeData.name}\n\n`;

        // Contact Line 1
        md += '<div class="resume-header">\n';
        resumeData.contact.forEach((item, index) => {
            md += `  <span class="resume-header-item${item.noSeparator ? ' no-separator' : ''}"><span class="iconify" data-icon="${item.icon}"></span> <a href="${item.link || '#'}">${item.value}</a></span>\n`;
        });
        md += '</div>\n';

        // Contact Line 2
        md += '<div class="resume-header">\n';
        resumeData.contactLine2.forEach((item, index) => {
            md += `  <span class="resume-header-item${item.noSeparator ? ' no-separator' : ''}"><span class="iconify" data-icon="${item.icon}"></span> ${item.link ? `<a href="${item.link}">${item.value}</a>` : item.value}</span>\n`;
        });
        md += '</div>\n\n';


        md += "## Experience\n\n";
        resumeData.experience.forEach(exp => {
            md += `<dl>\n  <dt>${exp.title}</dt>\n  <dd>${exp.company}</dd>\n  <dd>${exp.date}</dd>\n</dl>\n\n`;
            exp.bullets.forEach(bullet => {
                md += `- ${bullet}\n`;
            });
            md += "\n";
        });

        // Simplified sections for brevity - these would need structured data & UI too
        if (resumeData.education && resumeData.education.length > 0) {
             md += "## Education\n\n";
            // ... logic to render education from resumeData.education
        }


        if (resumeData.skillsText) {
            md += "## Skills\n\n" + resumeData.skillsText + "\n\n";
        }
        if (resumeData.awardsText) {
            md += "## Awards and Honors\n\n" + resumeData.awardsText + "\n\n";
        }

        if (resumeData.publications && resumeData.publications.length > 0) {
            md += "## Publications\n\n<ul class=\"crossref-list\">\n";
            resumeData.publications.forEach(pub => {
                md += `<li data-caption="${pub.caption}" id="ref-${pub.id}" class="crossref-item">\n<strong>${pub.title}</strong> <br/>\n${pub.authors} <br/>\n${pub.venue}\n</li>\n`;
            });
            md += "</ul>\n";
        }
        // LaTeX: ensure $\LaTeX$ is $\\LaTeX$ if building string in JS, or just $\LaTeX$ if it comes from data store
        return md.replace(/\\LaTeX/g, '\\\\LaTeX');
    }

    function updateMarkdownAndPreview() {
        const currentMarkdown = generateMarkdownFromData();
        markdownInput.value = currentMarkdown; // Update hidden textarea
        // document.getElementById('markdown-input-display-dummy').value = currentMarkdown; // For debug

        htmlOutput.innerHTML = marked.parse(currentMarkdown);
        if (window.renderMathInElement) {
            renderMathInElement(htmlOutput, { /* ... delimiters ... */ });
        }
    }

    // --- UI Rendering Functions (Simplified for Experience) ---
    function renderExperienceForm() {
        experienceEntriesContainer.innerHTML = ''; // Clear existing
        resumeData.experience.forEach((exp, index) => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'form-group experience-entry';
            entryDiv.dataset.id = exp.id;

            entryDiv.innerHTML = `
                <label>Title:</label>
                <input type="text" class="exp-title" value="${exp.title}">
                <label>Company:</label>
                <input type="text" class="exp-company" value="${exp.company}">
                <label>Date:</label>
                <input type="text" class="exp-date" value="${exp.date}">
                <label>Bullet Points:</label>
                <ul class="bullet-list">
                    ${exp.bullets.map((bullet, bIndex) => `
                        <li>
                           <input type="text" class="exp-bullet" data-bullet-index="${bIndex}" value="${bullet}">
                           <button class="remove-bullet-btn" data-bullet-index="${bIndex}">Remove</button>
                        </li>
                    `).join('')}
                </ul>
                <button class="add-bullet-btn">Add Bullet</button>
                <button class="remove-experience-btn remove-btn">Remove Experience</button>
                <hr>
            `;
            experienceEntriesContainer.appendChild(entryDiv);
        });
        attachExperienceEventListeners();
    }

    function attachExperienceEventListeners() {
        document.querySelectorAll('.experience-entry input, .experience-entry textarea').forEach(input => {
            input.addEventListener('change', handleExperienceInputChange);
        });
        document.querySelectorAll('.add-bullet-btn').forEach(btn => {
            btn.addEventListener('click', handleAddBullet);
        });
        document.querySelectorAll('.remove-bullet-btn').forEach(btn => {
            btn.addEventListener('click', handleRemoveBullet);
        });
        document.querySelectorAll('.remove-experience-btn').forEach(btn => {
            btn.addEventListener('click', handleRemoveExperience);
        });
    }

    // --- Event Handlers for Form UI ---
    function handleExperienceInputChange(event) {
        const input = event.target;
        const entryDiv = input.closest('.experience-entry');
        const expId = parseFloat(entryDiv.dataset.id); // Assuming ID is numerical after Date.now()
        const experienceItem = resumeData.experience.find(e => e.id === expId);

        if (!experienceItem) return;

        if (input.classList.contains('exp-title')) experienceItem.title = input.value;
        else if (input.classList.contains('exp-company')) experienceItem.company = input.value;
        else if (input.classList.contains('exp-date')) experienceItem.date = input.value;
        else if (input.classList.contains('exp-bullet')) {
            const bulletIndex = parseInt(input.dataset.bulletIndex);
            experienceItem.bullets[bulletIndex] = input.value;
        }
        updateMarkdownAndPreview();
    }

    addExperienceBtn.addEventListener('click', () => {
        resumeData.experience.push({
            id: Date.now() + Math.random(), // Ensure unique ID
            title: "New Role", company: "New Company", date: "Date Range", bullets: ["Responsibility 1"]
        });
        renderExperienceForm();
        updateMarkdownAndPreview();
    });

    function handleAddBullet(event) {
        const entryDiv = event.target.closest('.experience-entry');
        const expId = parseFloat(entryDiv.dataset.id);
        const experienceItem = resumeData.experience.find(e => e.id === expId);
        if (experienceItem) {
            experienceItem.bullets.push("New bullet point");
            renderExperienceForm(); // Re-render to get new input field
            updateMarkdownAndPreview();
        }
    }
    function handleRemoveBullet(event) {
        const entryDiv = event.target.closest('.experience-entry');
        const expId = parseFloat(entryDiv.dataset.id);
        const bulletIndex = parseInt(event.target.dataset.bulletIndex);
        const experienceItem = resumeData.experience.find(e => e.id === expId);
        if (experienceItem) {
            experienceItem.bullets.splice(bulletIndex, 1);
            renderExperienceForm();
            updateMarkdownAndPreview();
        }
    }


    function handleRemoveExperience(event) {
        const entryDiv = event.target.closest('.experience-entry');
        const expId = parseFloat(entryDiv.dataset.id);
        resumeData.experience = resumeData.experience.filter(e => e.id !== expId);
        renderExperienceForm();
        updateMarkdownAndPreview();
    }

    personalNameInput.addEventListener('change', (event) => {
        resumeData.name = event.target.value;
        updateMarkdownAndPreview();
    });


    // --- Initial Load / Reset / Save (Simplified - uses Markdown from hidden textarea) ---
    function loadInitialDataFromMarkdown(mdString) {
        // This is the HARDEST part: parsing Markdown back into structured resumeData.
        // For this example, we'll cheat and assume the initial mdString (from file)
        // can be used to pre-populate the `resumeData` object if it's mostly empty,
        // or we just use the default `resumeData` object.
        // A true parser would be very complex.
        // So, for now, we mostly rely on the default resumeData structure.
        // If mdString is provided from server, it populates the hidden textarea.
        // Then we generate our own markdown from resumeData and overwrite it.

        // Populate form fields from resumeData
        personalNameInput.value = resumeData.name;
        renderExperienceForm();
        // ... render other forms ...

        updateMarkdownAndPreview(); // This generates MD from resumeData and updates preview
    }

    loadInitialDataFromMarkdown(markdownInput.value); // Load from initial hidden textarea content

    // Status Messages
    function showStatusMessage(message, isError = false) { /* ... same as before ... */ }
    function clearStatusMessage() { /* ... same as before ... */ }

    // --- Save Button (Saves the generated Markdown) ---
    const editorControlsContainer = document.createElement('div'); // Create a container for buttons
    editorControlsContainer.style.textAlign = 'center'; // Center buttons
    editorControlsContainer.style.marginBottom = '15px';


    const saveButton = document.createElement('button');
    /* ... saveButton styling ... */
    saveButton.textContent = "Save Resume Data";
    saveButton.style.backgroundColor = '#28a745';
    saveButton.style.color = 'white';
    // ... other styles
    editorControlsContainer.appendChild(saveButton);


    saveButton.addEventListener('click', async () => {
        const markdownToSave = generateMarkdownFromData(); // Get current MD from data
        const formData = new FormData();
        formData.append('markdown_content', markdownToSave);
        try {
            // ... existing fetch logic to /save_markdown ...
            const response = await fetch('/save_markdown', { method: 'POST', body: formData});
            const result = await response.json();
            if (response.ok && result.status === 'success') showStatusMessage(result.message);
            else showStatusMessage(result.message || 'Failed to save.', true);
        } catch (error) { showStatusMessage('Error saving.', true); }
    });

    // Reset button (could reset resumeData to a pristine template object)
    const resetButton = document.createElement('button');
    /* ... resetButton styling ... */
    resetButton.textContent = "Reset Form Data";
    resetButton.style.backgroundColor = '#dc3545';
    // ... other styles
    editorControlsContainer.appendChild(resetButton);

    resetButton.addEventListener('click', () => {
        // TODO: Implement resetting resumeData to a deep copy of a default template object
        // For now, it just re-loads the initial data (which might be from file)
        // Or fetch bruce_wayne_resume.md, then try to parse it (very hard)
        // Easiest: Define a default template object in JS and reset to that.
        alert("Reset functionality needs to be fully implemented by resetting the JavaScript 'resumeData' object to a default template.");
        // Example:
        // resumeData = JSON.parse(JSON.stringify(defaultBruceWayneDataTemplate)); // Needs deep copy
        // loadInitialDataFromMarkdown(''); // Then re-render forms and preview
        showStatusMessage("Form reset (concept). Save to persist.");
    });

    // Add buttons container to the main form editor pane
    const formEditorPaneH3 = document.querySelector('.form-editor-pane h3');
    if (formEditorPaneH3 && formEditorPaneH3.parentNode) {
        formEditorPaneH3.parentNode.insertBefore(editorControlsContainer, formEditorPaneH3.nextSibling);
    }


    // --- Export PDF Button --- (attaches to preview pane controls)
    const exportPdfButton = document.createElement('button');
    /* ... exportPdfButton styling and event listener ... */
    exportPdfButton.textContent = "Export as PDF";
    // ...
    const previewControlsDiv = document.querySelector('.preview-pane .preview-controls');
    if (previewControlsDiv) {
        previewControlsDiv.appendChild(exportPdfButton);
    }
     exportPdfButton.addEventListener('click', async () => { /* ... existing PDF export ... */ });


});