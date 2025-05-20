# app.py
from flask import Flask, render_template, request, send_file, jsonify
from playwright.sync_api import sync_playwright
from werkzeug.utils import secure_filename # For photo upload
import io
import os
import shutil 
import json 
import re # Added for string substitution

app = Flask(__name__)

PROJECT_ROOT = os.path.dirname(__file__)
STATIC_FOLDER = os.path.join(PROJECT_ROOT, 'static')
UPLOADS_FOLDER = os.path.join(STATIC_FOLDER, 'uploads')
USER_RESUME_MD_PATH = os.path.join(PROJECT_ROOT, 'resume.md')
USER_RESUME_JSON_PATH = os.path.join(PROJECT_ROOT, 'resume.json')
TEMPLATE_RESUME_JSON_PATH = os.path.join(PROJECT_ROOT, 'static', 'bruce_wayne_resume.json')

MINIMAL_DEFAULT_JSON = {
    "name": "Your Name",
    "profilePicture": "static/batman.png", # Default fallback
    "contactItems": [],
    "experience": [],
    "education": [],
    "skills": [],
    "awards": [],
    "publications": []
}

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    initial_resume_json_data = None
    
    try:
        if os.path.exists(USER_RESUME_JSON_PATH):
            with open(USER_RESUME_JSON_PATH, 'r', encoding='utf-8') as f:
                initial_resume_json_data = json.load(f)
            if 'profilePicture' not in initial_resume_json_data or not initial_resume_json_data['profilePicture']:
                initial_resume_json_data['profilePicture'] = MINIMAL_DEFAULT_JSON['profilePicture'] # Ensure fallback
            print(f"Loaded user resume data from: {USER_RESUME_JSON_PATH}")
        else:
            print(f"{USER_RESUME_JSON_PATH} not found. Attempting to use template.")
            raise FileNotFoundError 
            
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error reading {USER_RESUME_JSON_PATH} or file not found: {e}. Trying template.")
        try:
            shutil.copy2(TEMPLATE_RESUME_JSON_PATH, USER_RESUME_JSON_PATH)
            print(f"Copied template {TEMPLATE_RESUME_JSON_PATH} to {USER_RESUME_JSON_PATH}")
            with open(USER_RESUME_JSON_PATH, 'r', encoding='utf-8') as f: 
                initial_resume_json_data = json.load(f)
            if 'profilePicture' not in initial_resume_json_data or not initial_resume_json_data['profilePicture']:
                initial_resume_json_data['profilePicture'] = MINIMAL_DEFAULT_JSON['profilePicture'] # Ensure fallback
            print(f"Loaded resume data from (copied) template: {USER_RESUME_JSON_PATH}")
        except Exception as copy_e:
            print(f"Error copying or reading template {TEMPLATE_RESUME_JSON_PATH} to {USER_RESUME_JSON_PATH}: {copy_e}. Using minimal default.")
            initial_resume_json_data = MINIMAL_DEFAULT_JSON.copy()
            try:
                with open(USER_RESUME_JSON_PATH, 'w', encoding='utf-8') as f:
                    json.dump(initial_resume_json_data, f, indent=4)
                print(f"Saved minimal default JSON to {USER_RESUME_JSON_PATH}")
            except Exception as save_minimal_e:
                print(f"Could not save minimal default JSON to {USER_RESUME_JSON_PATH}: {save_minimal_e}")

    if initial_resume_json_data is None: 
        print("Critical error: initial_resume_json_data is None. Falling back to minimal default.")
        initial_resume_json_data = MINIMAL_DEFAULT_JSON.copy()

    initial_resume_json_str = json.dumps(initial_resume_json_data)
    return render_template('index.html', initial_resume_json_str=initial_resume_json_str)

@app.route('/upload_photo', methods=['POST'])
def upload_photo():
    if 'profile_photo' not in request.files:
        return jsonify({"status": "error", "message": "No photo part in the request."}), 400
    file = request.files['profile_photo']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No photo selected."}), 400

    if file and allowed_file(file.filename):
        original_filename = secure_filename(file.filename)
        _, ext = os.path.splitext(original_filename)
        new_filename = f"profile_image{ext.lower()}" 
        
        if not os.path.exists(UPLOADS_FOLDER):
            os.makedirs(UPLOADS_FOLDER)
            
        for old_file_candidate in os.listdir(UPLOADS_FOLDER):
            if old_file_candidate.startswith("profile_image."):
                try:
                    os.remove(os.path.join(UPLOADS_FOLDER, old_file_candidate))
                    print(f"Removed old profile image: {old_file_candidate}")
                except OSError as e:
                    print(f"Error removing old profile image {old_file_candidate}: {e}")

        save_path = os.path.join(UPLOADS_FOLDER, new_filename)
        
        try:
            file.save(save_path)
            file_url_path = f"static/uploads/{new_filename}" 

            current_resume_data = {}
            if os.path.exists(USER_RESUME_JSON_PATH):
                with open(USER_RESUME_JSON_PATH, 'r', encoding='utf-8') as f:
                    current_resume_data = json.load(f)
            
            current_resume_data['profilePicture'] = file_url_path 

            with open(USER_RESUME_JSON_PATH, 'w', encoding='utf-8') as f:
                json.dump(current_resume_data, f, indent=4)

            return jsonify({"status": "success", "message": "Photo uploaded successfully.", "filePath": file_url_path})
        except Exception as e:
            print(f"Error saving photo or updating resume.json: {e}")
            return jsonify({"status": "error", "message": f"Server error during photo upload: {str(e)}"}), 500
    else:
        return jsonify({"status": "error", "message": "File type not allowed."}), 400


@app.route('/save_resume', methods=['POST'])
def save_resume():
    try:
        resume_data_json_str = request.form.get('resume_data_json')
        markdown_content = request.form.get('markdown_content')

        if resume_data_json_str is None:
            return jsonify({"status": "error", "message": "No JSON data provided."}), 400
        if markdown_content is None: 
             return jsonify({"status": "error", "message": "No Markdown content provided."}), 400

        try:
            resume_data = json.loads(resume_data_json_str) 
            with open(USER_RESUME_JSON_PATH, 'w', encoding='utf-8') as f:
                json.dump(resume_data, f, indent=4)
            print(f"Saved JSON data to {USER_RESUME_JSON_PATH}")
        except json.JSONDecodeError:
            return jsonify({"status": "error", "message": "Invalid JSON data provided."}), 400
        except Exception as e_json:
            print(f"Error saving JSON to {USER_RESUME_JSON_PATH}: {e_json}")
            return jsonify({"status": "error", "message": f"Error saving resume JSON: {str(e_json)}"}), 500

        try:
            with open(USER_RESUME_MD_PATH, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            print(f"Saved Markdown content to {USER_RESUME_MD_PATH}")
        except Exception as e_md:
            print(f"Error saving Markdown to {USER_RESUME_MD_PATH}: {e_md}")
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
        if 'profilePicture' not in template_data or not template_data['profilePicture']:
             template_data['profilePicture'] = MINIMAL_DEFAULT_JSON['profilePicture']
        return jsonify(template_data)
    except Exception as e:
        print(f"Error reading template JSON {TEMPLATE_RESUME_JSON_PATH}: {e}")
        return jsonify({"status": "error", "message": "Could not load template data."}), 500

@app.route('/export_pdf', methods=['POST'])
def export_pdf():
    html_content_from_client = request.form.get('html_content')
    if not html_content_from_client:
        return "No HTML content provided", 400

    base_url_prefix = request.url_root 
    if not base_url_prefix.endswith('/'): # Ensure trailing slash for correct joining
        base_url_prefix += '/'
    
    # Pre-process HTML content from client to make 'static/' paths absolute
    # This handles <img src="static/uploads/..."> and <img src="static/batman.png">
    # It also handles the onerror fallback: this.src='static/batman.png' by making the initial src absolute.
    # If an image fails to load, and onerror triggers this.src='static/batman.png',
    # the browser inside Playwright will resolve this relative path correctly against the page's effective base URL.
    html_content_from_client_processed = re.sub(r'(src|href)=["\']static/',
                                                rf'\1="{base_url_prefix}static/',
                                                html_content_from_client)
    # Also specifically ensure the onerror fallback path is absolute if it's present in the string
    # This is a bit more specific to ensure the JS string literal for onerror is also updated.
    # However, the above regex for src="static/..." should handle the initial src for batman.png.
    # The browser's relative path resolution for JS-assigned src should work.
    # A simpler approach is usually sufficient: ensure all initial asset URLs are absolute.

    full_html_for_playwright = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Resume PDF</title>
        <link rel="stylesheet" href="{base_url_prefix}static/style.css"> 
        <script src="https://code.iconify.design/2/2.2.1/iconify.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.js"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/contrib/auto-render.min.js"></script>
        <style>
            @page {{
                size: A4;
                margin: 15mm; 
            }}
            body {{ 
                margin: 0;
                padding: 0;
            }}
            .markdown-body {{ 
                 padding: 0 !important; 
            }}
        </style>
    </head>
    <body>
        <div class="markdown-body">
            {html_content_from_client_processed}
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
                if (window.Iconify && typeof window.Iconify.scan === 'function') {{
                    window.Iconify.scan(document.body);
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
            # Removed base_url argument, paths in full_html_for_playwright are now absolute
            page.set_content(full_html_for_playwright, wait_until="networkidle")
            page.wait_for_timeout(3000) 

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
        # Return the error message as plain text for easier debugging in browser if HTML isn't rendered
        return f"Error generating PDF with Playwright: {str(e)}", 500

if __name__ == '__main__':
    if not os.path.exists(UPLOADS_FOLDER):
        os.makedirs(UPLOADS_FOLDER)
        print(f"Created uploads folder at {UPLOADS_FOLDER}")

    if not os.path.exists(TEMPLATE_RESUME_JSON_PATH):
        print(f"CRITICAL: Template JSON file not found at {TEMPLATE_RESUME_JSON_PATH}")
        try:
            os.makedirs(os.path.join(PROJECT_ROOT, 'static'), exist_ok=True)
            with open(TEMPLATE_RESUME_JSON_PATH, 'w', encoding='utf-8') as f_template:
                json.dump(MINIMAL_DEFAULT_JSON.copy(), f_template, indent=4)
            print(f"Created a minimal fallback template at {TEMPLATE_RESUME_JSON_PATH}")
        except Exception as e_create_template:
            print(f"Failed to create minimal fallback template: {e_create_template}")
    
    batman_png_path = os.path.join(STATIC_FOLDER, 'batman.png')
    if not os.path.exists(batman_png_path):
        print(f"Warning: Default batman.png not found at {batman_png_path}. Please add it or ensure uploads work.")

    app.run(debug=True, host='0.0.0.0')