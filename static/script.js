document.addEventListener('DOMContentLoaded', () => {
    const markdownInput = document.getElementById('markdown-input');
    const htmlOutput = document.getElementById('html-output');

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
        htmlOutput.innerHTML = marked.parse(markdownText);

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

    markdownInput.addEventListener('input', updatePreview);
    updatePreview(); // Initial render (will be empty at first)

    // --- Reset Button ---
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-md-btn';
    resetButton.textContent = "Reset to Bruce Wayne's Resume";
    resetButton.style.marginLeft = '10px'; // Space it from the H2
    resetButton.style.padding = '5px 10px';
    resetButton.style.backgroundColor = '#dc3545'; // Red color
    resetButton.style.color = 'white';
    resetButton.style.border = 'none';
    resetButton.style.borderRadius = '4px';
    resetButton.style.cursor = 'pointer';
    resetButton.style.fontSize = '0.8em';


    const editorControlsDiv = document.querySelector('.editor-pane .editor-controls');
    if (editorControlsDiv) {
        editorControlsDiv.appendChild(resetButton); // Add button to the controls div
    }


    resetButton.addEventListener('click', () => {
        // Fetch the markdown file from the static folder
        fetch('/static/bruce_wayne_resume.md') // Adjusted filename
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                markdownInput.value = data; // Set textarea value
                updatePreview(); // Render the new content
            })
            .catch(error => {
                console.error("Error loading bruce_wayne_resume.md:", error);
                alert("Could not load the resume template. Check the console for details.");
            });
    });


    // --- Export PDF Button ---
    const exportPdfButton = document.createElement('button');
    exportPdfButton.id = 'export-pdf-btn';
    exportPdfButton.textContent = 'Export as PDF';
    exportPdfButton.style.marginLeft = '10px'; // Space it from the H2
    exportPdfButton.style.padding = '5px 10px';
    exportPdfButton.style.backgroundColor = '#28a745';
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
                console.error('PDF export failed:', response.statusText);
                const errorText = await response.text();
                alert('Error exporting PDF: ' + errorText);
            }
        } catch (error) {
            console.error('Error during PDF export:', error);
            alert('Error exporting PDF.');
        }
    });
});