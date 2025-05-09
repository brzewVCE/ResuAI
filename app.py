# app.py
from flask import Flask, render_template, request, send_file
from playwright.sync_api import sync_playwright
import io
import os

app = Flask(__name__)

# REMOVE: RESUME_MD_PATH and its usage in index()

@app.route('/')
def index():
    # The editor will start empty, content loaded by client-side JS on button click
    return render_template('index.html', initial_markdown="") # Pass empty string or remove

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