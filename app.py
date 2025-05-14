# app.py
from flask import Flask, render_template, request, send_file, jsonify
from playwright.sync_api import sync_playwright
import io
import os
import shutil # For copying file
import json # For handling JSON data

app = Flask(__name__)

PROJECT_ROOT = os.path.dirname(__file__)
USER_RESUME_MD_PATH = os.path.join(PROJECT_ROOT, 'resume.md') # For generated markdown
USER_RESUME_JSON_PATH = os.path.join(PROJECT_ROOT, 'resume.json') # For resume data
TEMPLATE_RESUME_JSON_PATH = os.path.join(PROJECT_ROOT, 'static', 'bruce_wayne_resume.json') # Template JSON

MINIMAL_DEFAULT_JSON = {
    "name": "Your Name",
    "contactItems": [],
    "experience": [],
    "education": [],
    "skills": [],
    "awards": [],
    "publications": []
}

@app.route('/')
def index():
    initial_resume_json_data = None
    
    try:
        if os.path.exists(USER_RESUME_JSON_PATH):
            with open(USER_RESUME_JSON_PATH, 'r', encoding='utf-8') as f:
                initial_resume_json_data = json.load(f)
            print(f"Loaded user resume data from: {USER_RESUME_JSON_PATH}")
        else:
            print(f"{USER_RESUME_JSON_PATH} not found. Attempting to use template.")
            raise FileNotFoundError # Trigger template copy logic
            
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error reading {USER_RESUME_JSON_PATH} or file not found: {e}. Trying template.")
        try:
            shutil.copy2(TEMPLATE_RESUME_JSON_PATH, USER_RESUME_JSON_PATH)
            print(f"Copied template {TEMPLATE_RESUME_JSON_PATH} to {USER_RESUME_JSON_PATH}")
            with open(USER_RESUME_JSON_PATH, 'r', encoding='utf-8') as f: # Read the newly copied file
                initial_resume_json_data = json.load(f)
            print(f"Loaded resume data from (copied) template: {USER_RESUME_JSON_PATH}")
        except Exception as copy_e:
            print(f"Error copying or reading template {TEMPLATE_RESUME_JSON_PATH} to {USER_RESUME_JSON_PATH}: {copy_e}. Using minimal default.")
            initial_resume_json_data = MINIMAL_DEFAULT_JSON
            # Optionally, try to save this minimal default to resume.json
            try:
                with open(USER_RESUME_JSON_PATH, 'w', encoding='utf-8') as f:
                    json.dump(MINIMAL_DEFAULT_JSON, f, indent=4)
                print(f"Saved minimal default JSON to {USER_RESUME_JSON_PATH}")
            except Exception as save_minimal_e:
                print(f"Could not save minimal default JSON to {USER_RESUME_JSON_PATH}: {save_minimal_e}")


    if initial_resume_json_data is None: # Should ideally not happen if logic above is correct
        print("Critical error: initial_resume_json_data is None. Falling back to minimal default.")
        initial_resume_json_data = MINIMAL_DEFAULT_JSON

    initial_resume_json_str = json.dumps(initial_resume_json_data)
        
    return render_template('index.html', initial_resume_json_str=initial_resume_json_str)

@app.route('/save_resume', methods=['POST'])
def save_resume():
    try:
        resume_data_json_str = request.form.get('resume_data_json')
        markdown_content = request.form.get('markdown_content')

        if resume_data_json_str is None:
            return jsonify({"status": "error", "message": "No JSON data provided."}), 400
        if markdown_content is None: # Empty string for markdown is technically valid if resume is empty
             return jsonify({"status": "error", "message": "No Markdown content provided."}), 400

        # Save the JSON data
        try:
            resume_data = json.loads(resume_data_json_str) # Validate if it's proper JSON
            with open(USER_RESUME_JSON_PATH, 'w', encoding='utf-8') as f:
                json.dump(resume_data, f, indent=4)
            print(f"Saved JSON data to {USER_RESUME_JSON_PATH}")
        except json.JSONDecodeError:
            return jsonify({"status": "error", "message": "Invalid JSON data provided."}), 400
        except Exception as e_json:
            print(f"Error saving JSON to {USER_RESUME_JSON_PATH}: {e_json}")
            return jsonify({"status": "error", "message": f"Error saving resume JSON: {str(e_json)}"}), 500

        # Save the Markdown content
        try:
            with open(USER_RESUME_MD_PATH, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            print(f"Saved Markdown content to {USER_RESUME_MD_PATH}")
        except Exception as e_md:
            print(f"Error saving Markdown to {USER_RESUME_MD_PATH}: {e_md}")
            # Potentially return partial success or specific error, but for now, general error
            return jsonify({"status": "error", "message": f"Error saving resume Markdown: {str(e_md)}"}), 500
            
        return jsonify({"status": "success", "message": "Resume saved successfully!"})

    except Exception as e:
        print(f"Overall error in /save_resume: {e}")
        return jsonify({"status": "error", "message": f"Error saving resume: {str(e)}"}), 500

@app.route('/get_template_json', methods=['GET'])
def get_template_json():
    try:
        with open(TEMPLATE_RESUME_JSON_PATH, 'r', encoding='utf-8') as f:
            template_data = json.load(f)
        return jsonify(template_data)
    except Exception as e:
        print(f"Error reading template JSON {TEMPLATE_RESUME_JSON_PATH}: {e}")
        return jsonify({"status": "error", "message": "Could not load template data."}), 500

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
    # Ensure static template JSON exists
    if not os.path.exists(TEMPLATE_RESUME_JSON_PATH):
        print(f"CRITICAL: Template JSON file not found at {TEMPLATE_RESUME_JSON_PATH}")
        print("Please create it with the default resume data.")
        # As a fallback, create a minimal one if it's missing, so app can run
        try:
            os.makedirs(os.path.join(PROJECT_ROOT, 'static'), exist_ok=True)
            with open(TEMPLATE_RESUME_JSON_PATH, 'w', encoding='utf-8') as f_template:
                json.dump(MINIMAL_DEFAULT_JSON, f_template, indent=4)
            print(f"Created a minimal fallback template at {TEMPLATE_RESUME_JSON_PATH}")
        except Exception as e_create_template:
            print(f"Failed to create minimal fallback template: {e_create_template}")

    app.run(debug=True, host='0.0.0.0')