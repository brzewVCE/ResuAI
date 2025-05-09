document.addEventListener('DOMContentLoaded', () => {
    const markdownInput = document.getElementById('markdown-input');
    const htmlOutput = document.getElementById('html-output');

    marked.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        breaks: false, // GFM behavior: single newlines are not <br>
        pedantic: false,
        sanitize: false, // Be careful with this if users can input arbitrary HTML
        smartLists: true,
        smartypants: false,
        xhtml: false
    });

    function updatePreview() {
        const markdownText = markdownInput.value;
        htmlOutput.innerHTML = marked.parse(markdownText);

        // Re-render LaTeX math expressions
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

        // Re-scan for Iconify icons if necessary (usually not for span method if script is loaded)
        // if (window.Iconify) {
        //     window.Iconify.scan(htmlOutput);
        // }
    }

    markdownInput.addEventListener('input', updatePreview);

    const initialMarkdown = fetch('/static/resume.md')
      .then(response => response.text())
      .then(data => {
        markdownInput.value = data;
        updatePreview(); // Render the preview after loading the markdown
      })
      .catch(error => console.error('Error loading resume.md:', error));// Load from static/resume.md;
    // Note: For LaTeX, make sure to escape backslashes in JS strings: $\LaTeX$ becomes $\\LaTeX$
    markdownInput.value = initialMarkdown.replace(/\\LaTeX/g, '\\\\LaTeX');


    updatePreview(); // Initial render
});

// Add a button to your HTML, e.g., <button id="export-pdf-btn">Export as PDF</button>
document.addEventListener('DOMContentLoaded', () => {
    // ... (your existing script.js code)

    const exportPdfButton = document.createElement('button');
    exportPdfButton.id = 'export-pdf-btn';
    exportPdfButton.textContent = 'Export as PDF';
    exportPdfButton.style.marginTop = '10px';
    exportPdfButton.style.padding = '10px 15px';
    exportPdfButton.style.backgroundColor = '#28a745';
    exportPdfButton.style.color = 'white';
    exportPdfButton.style.border = 'none';
    exportPdfButton.style.borderRadius = '4px';
    exportPdfButton.style.cursor = 'pointer';

    // Add it after the preview pane's h2
    const previewPaneH2 = document.querySelector('.preview-pane h2');
    if (previewPaneH2 && previewPaneH2.parentNode) {
        previewPaneH2.parentNode.insertBefore(exportPdfButton, previewPaneH2.nextSibling);
    }


    exportPdfButton.addEventListener('click', async () => {
        const htmlContentToExport = document.getElementById('html-output').innerHTML; // Get innerHTML of the preview

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
                alert('Error exporting PDF: ' + await response.text());
            }
        } catch (error) {
            console.error('Error during PDF export:', error);
            alert('Error exporting PDF.');
        }
    });
});