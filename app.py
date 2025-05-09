# app.py
from flask import Flask, render_template, request, send_file, jsonify # Added jsonify
from playwright.sync_api import sync_playwright
import io
import os
import shutil # For copying file

app = Flask(__name__)

PROJECT_ROOT = os.path.dirname(__file__)
USER_RESUME_MD_PATH = os.path.join(PROJECT_ROOT, 'resume.md')
TEMPLATE_RESUME_MD_PATH = os.path.join(PROJECT_ROOT, 'static', 'bruce_wayne_resume.md')

@app.route('/')
def index():
    initial_markdown_content = ""
    
    if os.path.exists(USER_RESUME_MD_PATH):
        try:
            with open(USER_RESUME_MD_PATH, 'r', encoding='utf-8') as f:
                initial_markdown_content = f.read()
            print(f"Loaded user resume from: {USER_RESUME_MD_PATH}")
        except Exception as e:
            print(f"Error reading {USER_RESUME_MD_PATH}: {e}. Trying template.")
            # Fall through to template logic if user resume fails to load
            initial_markdown_content = "" # Reset in case of partial read
    
    # If user_resume.md was not loaded (either didn't exist or failed to load)
    if not initial_markdown_content and os.path.exists(TEMPLATE_RESUME_MD_PATH):
        try:
            # Copy template to user_resume.md if user_resume.md doesn't exist or failed to load
            if not os.path.exists(USER_RESUME_MD_PATH) or initial_markdown_content == "": # Second condition handles failed load case
                 shutil.copy2(TEMPLATE_RESUME_MD_PATH, USER_RESUME_MD_PATH)
                 print(f"Copied template {TEMPLATE_RESUME_MD_PATH} to {USER_RESUME_MD_PATH}")
            
            # Now load the newly created/copied user_resume.md
            with open(USER_RESUME_MD_PATH, 'r', encoding='utf-8') as f:
                initial_markdown_content = f.read()
            print(f"Loaded initial resume from (copied) template: {USER_RESUME_MD_PATH}")
        except Exception as e:
            print(f"Error copying or reading template {TEMPLATE_RESUME_MD_PATH} to {USER_RESUME_MD_PATH}: {e}. Editor will start empty.")
            initial_markdown_content = "" # Ensure it's empty on failure
            
    elif not initial_markdown_content: # Neither user nor template resume found
        print(f"Warning: Neither {USER_RESUME_MD_PATH} nor {TEMPLATE_RESUME_MD_PATH} found. Editor will start empty.")
        
    return render_template('index.html', initial_markdown=initial_markdown_content)

@app.route('/save_markdown', methods=['POST'])
def save_markdown():
    try:
        markdown_content = request.form.get('markdown_content')
        if markdown_content is None: # Check for None, empty string is valid
            return jsonify({"status": "error", "message": "No content provided."}), 400

        with open(USER_RESUME_MD_PATH, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        print(f"Saved content to {USER_RESUME_MD_PATH}")
        return jsonify({"status": "success", "message": "Resume saved successfully!"})
    except Exception as e:
        print(f"Error saving to {USER_RESUME_MD_PATH}: {e}")
        return jsonify({"status": "error", "message": f"Error saving resume: {str(e)}"}), 500

@app.route('/export_pdf', methods=['POST'])
def export_pdf():
    html_content_from_client = request.form.get('html_content')
    if not html_content_from_client:
        return "No HTML content provided", 400

    full_html_for_playwright = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Resume PDF</title>
        <link rel="stylesheet" href="{request.url_root}static/style.css">
        <script src="https://code.iconify.design/2/2.2.1/iconify.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.js"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/contrib/auto-render.min.js"></script>
        <style>
            @page {{
                size: A4;
                margin: 10mm; 
            }}
        </style>
    </head>
    <body>
        <div class="markdown-body">
            {html_content_from_client}
        </div>
        <script>
            document.addEventListener('DOMContentLoaded', function() {{
                if (window.renderMathInElement) {{
                    renderMathInElement(document.body, {{
                        delimiters: [
                            {{left: "$$", right: "$$", display: true}},
                            {{left: "$", right: "$", display: false}},
                            {{left: "\\\\(", right: "\\\\)", display: false}},
                            {{left: "\\\\[", right: "\\\\]", display: true}}
                        ],
                        throwOnError: false
                    }});
                }}
            }});
        </script>
    </body>
    </html>
    """

    pdf_buffer = io.BytesIO()
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.set_content(full_html_for_playwright, wait_until="networkidle")
            page.wait_for_timeout(2500) 

            pdf_bytes = page.pdf(
                format='A4',
                print_background=True,
                prefer_css_page_size=True
            )
            pdf_buffer.write(pdf_bytes)
            browser.close()

        pdf_buffer.seek(0)
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name='resume.pdf',
            mimetype='application/pdf'
        )
    except Exception as e:
        print(f"Error during PDF generation: {e}")
        return f"Error generating PDF with Playwright: <pre>{str(e)}</pre>", 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')