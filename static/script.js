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

    const initialMarkdown = `---
---

# Bruce Wayne

<div class="resume-header">
  <span class="resume-header-item"><span class="iconify" data-icon="charm:person"></span> <a href="https://example.com/">example.com</a></span>
  <span class="resume-header-item"><span class="iconify" data-icon="tabler:brand-github"></span> <a href="https://github.com/example">github.com/example</a></span>
  <span class="resume-header-item no-separator"><span class="iconify" data-icon="tabler:phone"></span> <a href="https://wa.me/11234567890">(+1) 123-456-7890</a></span>
</div>
<div class="resume-header">
  <span class="resume-header-item"><span class="iconify" data-icon="ic:outline-location-on"></span> 1234 Abc Street, Example, EX 01234</span>
  <span class="resume-header-item"><span class="iconify" data-icon="tabler:brand-linkedin"></span> <a href="https://linkedin.com/in/example/">linkedin.com/in/example/</a></span>
  <span class="resume-header-item no-separator"><span class="iconify" data-icon="tabler:mail"></span> <a href="mailto:mail@example.com">email@example.com</a></span>
</div>

## Experience

<dl>
  <dt>Machine Learning Engineer Intern</dt>
  <dd>Slow Feet Technology</dd>
  <dd>Jul 2021 - Present</dd>
</dl>

- Devised a new food-agnostic formulation for fine-grained cross-ingredient meal cooking and subsumed the recent popular works into the proposed scheme
- Proposed a cream of mushroom soup recipe which is competitive when compared with the SOTA recipes with complex steps by only altering the way of cutting mushroom, published in NeurIPS 2099 (see <sup class="crossref-ref"><a href="#ref-P1">[~P1]</a></sup>)
- Developed a pan for meal cooking which is benefiting the group members' research work

<dl>
  <dt>Reseach Intern</dt>
  <dd>Paddling University</dd>
  <dd>Aug 2020 - Present</dd>
</dl>

- Designed an efficient method for mapo tofu quality estimation via thermometer
- Proposed a fast stir frying algorithm for tofu cooking problems, which specifies the amount of the hot sauce instead of using terms like "as much as you can", published in CVPR 2077 (see <sup class="crossref-ref"><a href="#ref-P2">[~P2]</a></sup>)
- Outperformed SOTA methods while cooking much more efficient in experiments on popular tofu

<dl>
  <dt>Research Assistant</dt>
  <dd>Huangdu Institute of Technology</dd>
  <dd>Mar 2020 - Jun 2020</dd>
</dl>

- Proposed a novel framework consisting of a spoon and a pair of chopsticks for eating mapo toufu
- Designed a tofu filtering strategy inspired by beans grinding method for building a dataset for this new task
- Designed two new evaluation criteria to assess the novelty and diversity of the eating plans
- Outperformed baselines and existed methods substantially in terms of diversity, novelty and coherence

<dl>
  <dt>Reseach Intern</dt>
  <dd>Paddling University</dd>
  <dd>Jul 2018 - Aug 2018</dd>
</dl>

- Designed two sandwiches consisting of breads and meat of two traditional bacon cheese burgers to make use of unused ingredients
- Utilized the structure duality to boost the cooking speed of two dual tasks based on shared ingredients
- Outperformed strong baselines on QWE'15 and ASDF'14 dataset

## Education

<dl>
  <dt>M.S. in Computer Science</dt>
  <dd>University of Charles River</dd>
  <dd>Boston, MA</dd>
  <dd>Sep 2021 - Jan 2023</dd>
</dl>

<dl>
  <dt>B.Eng. in Software Engineering</dt>
  <dd>Huangdu Institute of Technology</dd>
  <dd>Shanghai, China</dd>
  <dd>Sep 2016 - Jul 2020</dd>
</dl>

## Skills

**Programming Languages:** <span class="iconify" data-icon="vscode-icons:file-type-python"></span> Python, <span class="iconify" data-icon="vscode-icons:file-type-js-official"></span> JavaScript / <span class="iconify" data-icon="vscode-icons:file-type-typescript-official"></span> TypeScript, <span class="iconify" data-icon="vscode-icons:file-type-html"></span> HTML / <span class="iconify" data-icon="vscode-icons:file-type-css"></span> CSS, <span class="iconify" data-icon="logos:java" data-inline="false"></span> Java

**Tools and Frameworks:** Git, PyTorch, Keras, scikit-learn, Linux, Vue, React, Django, $\\LaTeX$

**Languages:** English (proficient), Indonesia (native)

## Awards and Honors

**Gold**, International Collegiate Catching Fish Contest (ICCFC)   :   2018

**First Prize**, China National Scholarship for Outstanding Dragons   :   2017, 2018

## Publications

<ul class="crossref-list">
<li data-caption="[~P1]" id="ref-P1" class="crossref-item">
<strong>Eating is All You Need</strong> <br/>
<u>Haha Ha</u>, San Zhang <br/>
<em>Conference on Neural Information Processing Systems (NeurIPS), 2099</em>
</li>
<li data-caption="[~P2]" id="ref-P2" class="crossref-item">
<strong>You Only Cook Once: Unified, Real-Time Mapo Tofu Recipe</strong> <br/>
<u>Haha Ha</u>, San Zhang, Si Li, Wu Wang <br/>
<em>Computer Vision and Pattern Recognition Conference (CVPR), 2077 <strong>(Best Paper Honorable Mention)</strong></em>
</li>
</ul>
`;
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