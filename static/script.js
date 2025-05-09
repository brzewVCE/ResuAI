document.addEventListener('DOMContentLoaded', () => {
    const markdownInput = document.getElementById('markdown-input');
    const htmlOutput = document.getElementById('html-output');
    const statusMessageDiv = document.getElementById('status-message');

    marked.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        xhtml: false
    });

    function updatePreview() {
      const markdownText = markdownInput.value;
      const parsedHtml = marked.parse(markdownText); // Use marked.parse()
      console.log("Parsed HTML:", parsedHtml); // <--- ADD THIS LINE
      htmlOutput.innerHTML = parsedHtml;
      
        if (window.renderMathInElement) {
            renderMathInElement(htmlOutput, {
                delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "$", right: "$", display: false},
                    {left: "\\(", right: "\\)", display: false},
                    {left: "\\[", right: "\\]", display: true}
                ],
                throwOnError: false
            });
        }
    }

    markdownInput.addEventListener('input', () => {
        updatePreview();
        clearStatusMessage(); // Clear status on edit
    });
    updatePreview(); // Initial render based on textarea content set by server

    function showStatusMessage(message, isError = false) {
        statusMessageDiv.textContent = message;
        statusMessageDiv.style.color = isError ? '#dc3545' : '#28a745'; // Red for error, Green for success
        setTimeout(clearStatusMessage, 5000); // Clear after 5 seconds
    }

    function clearStatusMessage() {
        statusMessageDiv.textContent = '';
    }

    // --- Controls Container ---
    const editorControlsDiv = document.querySelector('.editor-pane .editor-controls');

    // --- Save Button ---
    const saveButton = document.createElement('button');
    saveButton.id = 'save-md-btn';
    saveButton.textContent = 'Save';
    // saveButton.style.marginLeft = 'auto'; // Pushes to the far right if H2 has margin-right: 0
    saveButton.style.marginLeft = '10px';
    saveButton.style.padding = '5px 10px';
    saveButton.style.backgroundColor = '#28a745'; // Green color
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';
    saveButton.style.fontSize = '0.8em';

    if (editorControlsDiv) {
        editorControlsDiv.appendChild(saveButton);
    }

    saveButton.addEventListener('click', async () => {
        const currentMarkdown = markdownInput.value;
        const formData = new FormData();
        formData.append('markdown_content', currentMarkdown);

        try {
            const response = await fetch('/save_markdown', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                showStatusMessage(result.message);
            } else {
                showStatusMessage(result.message || 'Failed to save resume.', true);
            }
        } catch (error) {
            console.error("Error saving resume.md:", error);
            showStatusMessage('Error connecting to server to save.', true);
        }
    });


    // --- Reset Button ---
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-md-btn';
    resetButton.textContent = "Reset (to Bruce Wayne)";
    resetButton.style.marginLeft = '10px';
    resetButton.style.padding = '5px 10px';
    resetButton.style.backgroundColor = '#dc3545'; // Red color
    resetButton.style.color = 'white';
    resetButton.style.border = 'none';
    resetButton.style.borderRadius = '4px';
    resetButton.style.cursor = 'pointer';
    resetButton.style.fontSize = '0.8em';

    if (editorControlsDiv) {
        // Insert reset button after save button if both are present
        if (saveButton && saveButton.parentNode === editorControlsDiv) {
             editorControlsDiv.insertBefore(resetButton, saveButton.nextSibling); // Or just append if order doesn't matter
        } else {
            editorControlsDiv.appendChild(resetButton);
        }
    }

    resetButton.addEventListener('click', () => {
        fetch('/static/bruce_wayne_resume.md')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                markdownInput.value = data.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                updatePreview();
                showStatusMessage("Content reset to Bruce Wayne's template. Click 'Save' to make it the default.");
            })
            .catch(error => {
                console.error("Error loading bruce_wayne_resume.md:", error);
                showStatusMessage("Could not load the template.", true);
            });
    });


    // --- Export PDF Button ---
    const exportPdfButton = document.createElement('button');
    exportPdfButton.id = 'export-pdf-btn';
    exportPdfButton.textContent = 'Export as PDF';
    exportPdfButton.style.marginLeft = '10px';
    exportPdfButton.style.padding = '5px 10px';
    exportPdfButton.style.backgroundColor = '#007bff'; // Blue color
    exportPdfButton.style.color = 'white';
    exportPdfButton.style.border = 'none';
    exportPdfButton.style.borderRadius = '4px';
    exportPdfButton.style.cursor = 'pointer';
    exportPdfButton.style.fontSize = '0.8em';

    const previewControlsDiv = document.querySelector('.preview-pane .preview-controls');
     if (previewControlsDiv) {
        previewControlsDiv.appendChild(exportPdfButton);
    }

    exportPdfButton.addEventListener('click', async () => {
        clearStatusMessage();
        const htmlContentToExport = document.getElementById('html-output').innerHTML;
        const formData = new FormData();
        formData.append('html_content', htmlContentToExport);

        try {
            const response = await fetch('/export_pdf', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'resume.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            } else {
                const errorText = await response.text();
                showStatusMessage('Error exporting PDF: ' + errorText, true);
            }
        } catch (error) {
            console.error('Error during PDF export:', error);
            showStatusMessage('Error connecting to server for PDF export.', true);
        }
    });
});