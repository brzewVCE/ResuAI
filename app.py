# app.py
from flask import Flask, render_template, request, send_file
from playwright.sync_api import sync_playwright # Make sure this import is present
import io
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/export_pdf', methods=['POST'])
def export_pdf():
    html_content_from_client = request.form.get('html_content') # This is just the innerHTML of div#html-output
    if not html_content_from_client:
        return "No HTML content provided", 400

    # Construct the full HTML document string for Playwright
    # This ensures all necessary CSS, JS CDNs, and structure are present.
    # Using request.url_root ensures that the link to static/style.css is absolute.
    full_html_for_playwright = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Resume PDF</title>
        <link rel="stylesheet" href="{request.url_root}static/style.css">
        <!-- Iconify CDN -->
        <script src="https://code.iconify.design/2/2.2.1/iconify.min.js"></script>
        <!-- KaTeX CDN -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.js"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/contrib/auto-render.min.js"></script>
        <style>
            /* Ensures that print styles from your CSS are respected */
            @media print {{
                /* You can add print-specific overrides here if necessary */
                /* For example, to ensure the .markdown-body takes up the whole page */
                body, html {{ margin: 0; padding: 0; }}
                # .markdown-body {{ margin: 10mm !important; }} /* Ensure this matches PDF margin */
            }}
            /* Styles for Playwright rendering if different from screen/print */
            body {{
                margin: 0; /* Remove default body margin for Playwright's PDF generation */
            }}
        </style>
    </head>
    <body>
        <div class="markdown-body">
            {html_content_from_client}
        </div>
        <script>
            // This script block will execute in the Playwright browser context
            document.addEventListener('DOMContentLoaded', function() {{
                if (window.renderMathInElement) {{
                    renderMathInElement(document.body, {{
                        delimiters: [
                            {{left: "$$", right: "$$", display: true}},
                            {{left: "$", right: "$", display: false}},
                            {{left: "\\\\(", right: "\\\\)", display: false}}, // Escaped backslashes for JS string in f-string
                            {{left: "\\\\[", right: "\\\\]", display: true}}    // Escaped backslashes
                        ],
                        throwOnError: false
                    }});
                }}
                // Iconify usually scans automatically. If icons are still missing,
                // you might explicitly call Iconify.scan() here after a small delay,
                // but typically its own script loading handles it.
                // setTimeout(() => {{ if(window.Iconify) window.Iconify.scan(); }}, 500);
            }});
        </script>
    </body>
    </html>
    """

    pdf_buffer = io.BytesIO()

    try:
        with sync_playwright() as p:
            # browser = p.chromium.launch(headless=True) # headless=True is default
            browser = p.chromium.launch()
            page = browser.new_page()
            
            # page.goto(f"data:text/html,{full_html_for_playwright}") # Alternative for simple HTML
            page.set_content(full_html_for_playwright, wait_until="networkidle") # wait_until can help ensure resources load

            # Wait for JavaScript (Iconify, KaTeX) to potentially finish rendering.
            # 'networkidle' above helps. Forcing a delay can also work if specific elements are hard to wait for.
            # A more robust wait would be for a specific element rendered by JS, e.g., a KaTeX span or an Iconify svg.
            # Example: page.wait_for_selector('span.katex-display', timeout=5000)
            # Example: page.wait_for_selector('svg.iconify', timeout=5000)
            page.wait_for_timeout(2500) # Increased slightly, adjust as needed or use specific selectors.

            pdf_bytes = page.pdf(
                format='A4',
                print_background=True, # Crucial for CSS backgrounds and colors
                margin={'top': '10mm', 'bottom': '10mm', 'left': '10mm', 'right': '10mm'}
                # path='debug_output.pdf' # Uncomment to save a file server-side for debugging
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
        print(f"Error during PDF generation: {e}") # Log the full error server-side
        # Return the error message as plain text or HTML for easier debugging in the client's alert
        return f"Error generating PDF with Playwright: <pre>{str(e)}</pre>", 500


if __name__ == '__main__':
    # Ensure you are running in debug mode for development if not already.
    # For production, use a proper WSGI server like Gunicorn or Waitress.
    app.run(debug=True, host='0.0.0.0') # host='0.0.0.0' makes it accessible on your network if needed