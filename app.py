# app.py
import os
import shutil
import json
import re
import io # Make sure io is imported if used for PDF export
from flask import Flask, render_template, request, send_file, jsonify
from playwright.sync_api import sync_playwright # Make sure this is imported
from werkzeug.utils import secure_filename

from static.python import ai_handler # Import from new location

app = Flask(__name__)

PROJECT_ROOT = os.path.dirname(__file__)
STATIC_FOLDER = os.path.join(PROJECT_ROOT, 'static')
SCRIPTS_FOLDER = os.path.join(STATIC_FOLDER, 'scripts')
UPLOADS_FOLDER = os.path.join(STATIC_FOLDER, 'uploads')
USER_RESUME_MD_PATH = os.path.join(SCRIPTS_FOLDER, 'resume.md')
USER_RESUME_JSON_PATH = os.path.join(SCRIPTS_FOLDER, 'resume.json')
USER_RESUME_PL_PATH = os.path.join(SCRIPTS_FOLDER, 'resume_pl.json')
USER_RESUME_EN_PATH = os.path.join(SCRIPTS_FOLDER, 'resume_en.json')
COVER_LETTER_PL_PATH = os.path.join(SCRIPTS_FOLDER, 'cover_letter_pl.json')
COVER_LETTER_EN_PATH = os.path.join(SCRIPTS_FOLDER, 'cover_letter_en.json')
TEMPLATE_RESUME_JSON_PATH = os.path.join(SCRIPTS_FOLDER, 'bruce_wayne_resume.json')
AI_CONFIG_PATH = os.path.join(SCRIPTS_FOLDER, 'ai_config.json') 

MINIMAL_DEFAULT_JSON = {
    "name": "Your Name", "profilePicture": "static/scripts/batman.png", "contactItems": [],
    "experience": [], "education": [], "userInitialSkills": "", "skills": [],
    "projects": [], "certifications": [], "language": "pl"
}
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ensure_ai_config_exists():
    if not os.path.exists(AI_CONFIG_PATH):
        example_ai_config_path = AI_CONFIG_PATH + ".example"
        if os.path.exists(example_ai_config_path):
            try:
                shutil.copy2(example_ai_config_path, AI_CONFIG_PATH)
                print(f"Copied template {example_ai_config_path} to {AI_CONFIG_PATH}. Please configure your API key.")
                return True
            except Exception as e:
                print(f"Error copying ai_config.json.example: {e}")
                return False
        else:
            print(f"Warning: {example_ai_config_path} not found. Cannot create {AI_CONFIG_PATH}.")
            try:
                # Create a minimal config if example is missing, so save_api_key can write to it
                base_prompts = { # Ensure prompts structure exists for ai_handler access
                    "generate_title": "Error: Default prompt for title. Configure in ai_config.json.",
                    "generate_bullets": "Error: Default prompt for bullets. Configure in ai_config.json.",
                    "generate_skills": "Error: Default prompt for skills. Configure in ai_config.json."
                }
                with open(AI_CONFIG_PATH, 'w', encoding='utf-8') as f:
                    json.dump({"api_key": "YOUR_GEMINI_API_KEY_HERE", "prompts": base_prompts}, f, indent=4)
                print(f"Created minimal {AI_CONFIG_PATH} as example was missing. Please configure.")
                return True
            except Exception as e_create:
                print(f"Error creating minimal {AI_CONFIG_PATH}: {e_create}")
                return False
    return True

def get_resume_path_for_language(language):
    """Get the resume file path for specified language"""
    if language == 'en':
        return USER_RESUME_EN_PATH
    else:  # default to Polish
        return USER_RESUME_PL_PATH

def get_cover_letter_path_for_language(language):
    """Get the cover letter file path for specified language"""
    if language == 'en':
        return COVER_LETTER_EN_PATH
    else:  # default to Polish
        return COVER_LETTER_PL_PATH

def migrate_legacy_resume_data():
    """Migrate existing resume.json to language-specific files if they don't exist"""
    try:
        # Check if migration is needed
        pl_exists = os.path.exists(USER_RESUME_PL_PATH)
        en_exists = os.path.exists(USER_RESUME_EN_PATH)
        
        if pl_exists and en_exists:
            print("DEBUG: Both language files exist, no migration needed")
            return True
            
        if not os.path.exists(USER_RESUME_JSON_PATH):
            print("DEBUG: No legacy resume.json found, creating minimal files")
            # Create minimal files for both languages with different names for testing
            minimal_pl = MINIMAL_DEFAULT_JSON.copy()
            minimal_pl['language'] = 'pl'
            minimal_pl['name'] = 'Twoje Imię i Nazwisko'  # Polish placeholder
            minimal_en = MINIMAL_DEFAULT_JSON.copy()
            minimal_en['language'] = 'en'
            minimal_en['name'] = 'Your Full Name'  # English placeholder
            
            if not pl_exists:
                with open(USER_RESUME_PL_PATH, 'w', encoding='utf-8') as f:
                    json.dump(minimal_pl, f, indent=2, ensure_ascii=False)
                print(f"DEBUG: Created minimal {USER_RESUME_PL_PATH}")
                    
            if not en_exists:
                with open(USER_RESUME_EN_PATH, 'w', encoding='utf-8') as f:
                    json.dump(minimal_en, f, indent=2, ensure_ascii=False)
                print(f"DEBUG: Created minimal {USER_RESUME_EN_PATH}")
                    
            return True
            
        # Load legacy data
        with open(USER_RESUME_JSON_PATH, 'r', encoding='utf-8') as f:
            legacy_data = json.load(f)
            
        print("DEBUG: Found legacy resume.json, migrating to language-specific files")
        
        # Create Polish version (keep original data)
        if not pl_exists:
            pl_data = legacy_data.copy()
            pl_data['language'] = 'pl'
            with open(USER_RESUME_PL_PATH, 'w', encoding='utf-8') as f:
                json.dump(pl_data, f, indent=2, ensure_ascii=False)
            print(f"DEBUG: Migrated Polish data to {USER_RESUME_PL_PATH}")
            
        # Create English version (template with English placeholders)
        if not en_exists:
            en_data = legacy_data.copy()
            en_data['language'] = 'en'
            
            # Replace Polish content with English placeholders for the user to fill
            if 'name' in en_data and en_data['name']:
                if 'Przemysław' in en_data['name'] or any(polish_char in en_data['name'] for polish_char in 'ąćęłńóśźż'):
                    en_data['name'] = 'Your Full Name (English)'
            
            # Clear Polish-specific content for user to replace with English
            for exp in en_data.get('experience', []):
                if 'userRoleDescription' in exp and exp['userRoleDescription']:
                    if any(polish_char in exp['userRoleDescription'] for polish_char in 'ąćęłńóśźż'):
                        exp['userRoleDescription'] = 'Describe your role in English...'
                        exp['bullets'] = []  # Clear Polish bullets
                        
            for proj in en_data.get('projects', []):
                if 'userProjectDescription' in proj and proj['userProjectDescription']:
                    if any(polish_char in proj['userProjectDescription'] for polish_char in 'ąćęłńóśźż'):
                        proj['userProjectDescription'] = 'Describe your project in English...'
                        proj['description'] = ''  # Clear Polish description
                        
            if 'userInitialSkills' in en_data and en_data['userInitialSkills']:
                if any(polish_char in en_data['userInitialSkills'] for polish_char in 'ąćęłńóśźż'):
                    en_data['userInitialSkills'] = 'List your skills in English...'
                    en_data['skills'] = []  # Clear Polish skills
            
            with open(USER_RESUME_EN_PATH, 'w', encoding='utf-8') as f:
                json.dump(en_data, f, indent=2, ensure_ascii=False)
            print(f"DEBUG: Created English template at {USER_RESUME_EN_PATH}")
            
        return True
        
    except Exception as e:
        print(f"ERROR: Migration failed: {e}")
        return False

def load_resume_data_for_language(language):
    """Load resume data for specified language"""
    try:
        resume_path = get_resume_path_for_language(language)
        
        if os.path.exists(resume_path):
            with open(resume_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                data['language'] = language  # Ensure language is set
                return data
        else:
            print(f"DEBUG: Resume file not found for {language}: {resume_path}")
            # Return minimal data with correct language
            minimal_data = MINIMAL_DEFAULT_JSON.copy()
            minimal_data['language'] = language
            return minimal_data
            
    except Exception as e:
        print(f"ERROR: Loading resume data for {language}: {e}")
        minimal_data = MINIMAL_DEFAULT_JSON.copy()
        minimal_data['language'] = language
        return minimal_data

def load_cover_letter_for_language(language):
    """Load cover letter for specified language"""
    try:
        cover_path = get_cover_letter_path_for_language(language)
        
        if os.path.exists(cover_path):
            with open(cover_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            # Return empty cover letter structure
            return {
                "content": "",
                "lastGenerated": "",
                "jobContext": "",
                "language": language
            }
            
    except Exception as e:
        print(f"ERROR: Loading cover letter for {language}: {e}")
        return {
            "content": "",
            "lastGenerated": "",
            "jobContext": "",
            "language": language
        }

@app.route('/')
def index():
    ensure_ai_config_exists()
    if ai_handler.CONFIG is None:
        ai_handler.load_config() 
    
    # Initialize AI model if needed
    if ai_handler.MODEL is None and ai_handler.CONFIG is not None: 
        print("DEBUG (index route): ai_handler.MODEL is None and CONFIG is loaded, attempting to initialize_llm().")
        ai_handler.initialize_llm()
    elif ai_handler.MODEL is None and ai_handler.CONFIG is None:
         print("DEBUG (index route): Both ai_handler.MODEL and ai_handler.CONFIG are None.")

    # Perform migration from legacy file to language-specific files
    migrate_legacy_resume_data()
    
    # Load Polish data by default (user can switch languages in UI)
    initial_resume_json_data = load_resume_data_for_language('pl')
    
    # Ensure all required fields exist
    if not initial_resume_json_data.get('profilePicture'): 
        initial_resume_json_data['profilePicture'] = MINIMAL_DEFAULT_JSON['profilePicture']
    if 'userInitialSkills' not in initial_resume_json_data: 
        initial_resume_json_data['userInitialSkills'] = MINIMAL_DEFAULT_JSON.get('userInitialSkills', "")
    if 'projects' not in initial_resume_json_data: 
        initial_resume_json_data['projects'] = []
    if 'certifications' not in initial_resume_json_data: 
        initial_resume_json_data['certifications'] = []
    
    # Remove old fields if they exist
    if 'awards' in initial_resume_json_data: 
        del initial_resume_json_data['awards']
    if 'publications' in initial_resume_json_data: 
        del initial_resume_json_data['publications']
    
    # Ensure new fields in experience items
    for exp in initial_resume_json_data.get('experience', []):
        if 'userRoleDescription' not in exp: 
            exp['userRoleDescription'] = ""
        if 'numBulletPointsToGenerate' not in exp: 
            exp['numBulletPointsToGenerate'] = 3
    
    if initial_resume_json_data is None: 
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
        language = request.form.get('language', 'pl')  # Default to Polish

        if resume_data_json_str is None:
            return jsonify({"status": "error", "message": "No JSON data provided."}), 400
        if markdown_content is None: 
             return jsonify({"status": "error", "message": "No Markdown content provided."}), 400

        try:
            resume_data = json.loads(resume_data_json_str)
            resume_data['language'] = language  # Ensure language is set
            
            # Save to language-specific file
            resume_path = get_resume_path_for_language(language)
            with open(resume_path, 'w', encoding='utf-8') as f:
                json.dump(resume_data, f, indent=2, ensure_ascii=False)
            print(f"Saved JSON data to {resume_path} for language {language}")
            
            # Also save to legacy file for backward compatibility (temporarily)
            with open(USER_RESUME_JSON_PATH, 'w', encoding='utf-8') as f:
                json.dump(resume_data, f, indent=4, ensure_ascii=False)
            print(f"Saved JSON data to {USER_RESUME_JSON_PATH} (legacy)")
            
        except json.JSONDecodeError:
            return jsonify({"status": "error", "message": "Invalid JSON data provided."}), 400
        except Exception as e_json:
            print(f"Error saving JSON: {e_json}")
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

@app.route('/load_resume/<language>', methods=['GET'])
def load_resume_for_language(language):
    """Load resume data for specific language"""
    try:
        if language not in ['pl', 'en']:
            return jsonify({"status": "error", "message": "Invalid language. Use 'pl' or 'en'."}), 400
            
        resume_data = load_resume_data_for_language(language)
        return jsonify({"status": "success", "data": resume_data})
        
    except Exception as e:
        print(f"Error loading resume for {language}: {e}")
        return jsonify({"status": "error", "message": f"Error loading resume: {str(e)}"}), 500

@app.route('/save_cover_letter', methods=['POST'])
def save_cover_letter():
    """Save cover letter for specific language"""
    try:
        data = request.json
        content = data.get('content', '')
        language = data.get('language', 'pl')
        job_context = data.get('jobContext', '')
        
        if language not in ['pl', 'en']:
            return jsonify({"status": "error", "message": "Invalid language. Use 'pl' or 'en'."}), 400
            
        cover_letter_data = {
            "content": content,
            "lastGenerated": data.get('lastGenerated', ''),
            "jobContext": job_context,
            "language": language
        }
        
        cover_path = get_cover_letter_path_for_language(language)
        with open(cover_path, 'w', encoding='utf-8') as f:
            json.dump(cover_letter_data, f, indent=2, ensure_ascii=False)
            
        print(f"Saved cover letter to {cover_path} for language {language}")
        return jsonify({"status": "success", "message": "Cover letter saved successfully!"})
        
    except Exception as e:
        print(f"Error saving cover letter: {e}")
        return jsonify({"status": "error", "message": f"Error saving cover letter: {str(e)}"}), 500

@app.route('/load_cover_letter/<language>', methods=['GET'])
def load_cover_letter_for_language_route(language):
    """Load cover letter for specific language"""
    try:
        if language not in ['pl', 'en']:
            return jsonify({"status": "error", "message": "Invalid language. Use 'pl' or 'en'."}), 400
            
        cover_letter_data = load_cover_letter_for_language(language)
        return jsonify({"status": "success", "data": cover_letter_data})
        
    except Exception as e:
        print(f"Error loading cover letter for {language}: {e}")
        return jsonify({"status": "error", "message": f"Error loading cover letter: {str(e)}"}), 500

@app.route('/get_template_json', methods=['GET'])
def get_template_json():
    try:
        # Get language parameter, default to 'pl'
        language = request.args.get('language', 'pl')
        if language not in ['pl', 'en']:
            language = 'pl'
            
        print(f"DEBUG: /get_template_json called for language: {language}")
        
        # Always use the Bruce Wayne template as the base for reset functionality
        # This ensures reset gives a clean, example template regardless of current user data
        if not os.path.exists(TEMPLATE_RESUME_JSON_PATH):
            print(f"ERROR in /get_template_json: Template file not found at {TEMPLATE_RESUME_JSON_PATH}")
            return jsonify({"status": "error", "message": f"Template file not found: {TEMPLATE_RESUME_JSON_PATH}"}), 500

        with open(TEMPLATE_RESUME_JSON_PATH, 'r', encoding='utf-8') as f:
            template_data = json.load(f)
            print(f"DEBUG: Loaded Bruce Wayne template from {TEMPLATE_RESUME_JSON_PATH}")

        # Set the language to the requested language (this is the key fix)
        template_data['language'] = language
        print(f"DEBUG: Template data language set to: {language}")

        # Ensure critical fallback fields if missing from the loaded template_data
        if 'profilePicture' not in template_data or not template_data.get('profilePicture'):
             template_data['profilePicture'] = MINIMAL_DEFAULT_JSON['profilePicture']
        if 'userInitialSkills' not in template_data: 
             template_data['userInitialSkills'] = MINIMAL_DEFAULT_JSON.get('userInitialSkills', "") # Use .get for safety
        if 'certifications' not in template_data:
             template_data['certifications'] = []
        # Remove old fields if they exist
        if 'awards' in template_data: del template_data['awards']
        if 'publications' in template_data: del template_data['publications']
        
        # Ensure new fields in experience items
        for exp_item in template_data.get('experience', []): # Use .get for safety
            if 'userRoleDescription' not in exp_item: 
                exp_item['userRoleDescription'] = ""
            if 'numBulletPointsToGenerate' not in exp_item: 
                exp_item['numBulletPointsToGenerate'] = 3
        
        # Ensure new fields in project items
        for proj_item in template_data.get('projects', []):
            if 'userProjectDescription' not in proj_item:
                proj_item['userProjectDescription'] = ""
            if 'numBulletPointsToGenerate' not in proj_item:
                proj_item['numBulletPointsToGenerate'] = 3
        
        return jsonify(template_data)
    except json.JSONDecodeError as e:
        # This catch block is crucial for malformed JSON in the template file
        print(f"ERROR in /get_template_json: JSONDecodeError - {e}")
        return jsonify({"status": "error", "message": f"Template file is not valid JSON: {str(e)}"}), 500
    except FileNotFoundError: # Should be caught by os.path.exists, but as a safeguard
        print(f"ERROR in /get_template_json: FileNotFoundError (safeguard)")
        return jsonify({"status": "error", "message": "Template file not found (safeguard)."}), 500
    except Exception as e:
        # Catch-all for any other unexpected errors
        print(f"CRITICAL ERROR in /get_template_json: An unexpected error occurred - {e}")
        import traceback
        traceback.print_exc() # Print full traceback to Flask console
        return jsonify({"status": "error", "message": f"An unexpected server error occurred: {str(e)}"}), 500

@app.route('/save_api_key', methods=['POST'])
def save_api_key():
    data = request.json
    api_key_value = data.get('api_key')
    if not api_key_value: return jsonify({"status": "error", "message": "No API key provided."}), 400
    ensure_ai_config_exists()
    try:
        if not ai_handler.load_config():
             if not ai_handler.CONFIG: ai_handler.CONFIG = {} 
        ai_handler.CONFIG['api_key'] = api_key_value
        with open(AI_CONFIG_PATH, 'w', encoding='utf-8') as f: json.dump(ai_handler.CONFIG, f, indent=4)
        print(f"API Key saved to {AI_CONFIG_PATH}. Re-initializing LLM.")
        ai_handler.MODEL = None # Use MODEL
        init_success = ai_handler.initialize_llm() # Use initialize_llm
        if init_success: return jsonify({"status": "success", "message": "API Key saved and LLM re-initialized."})
        else: return jsonify({"status": "warning", "message": "API Key saved, but LLM re-init failed."})
    except Exception as e:
        return jsonify({"status": "error", "message": f"Server error saving API Key: {str(e)}"}), 500

@app.route('/get_api_key_status', methods=['GET'])
def get_api_key_status():
    if ai_handler.CONFIG is None: ai_handler.load_config()
    key_value = ai_handler.get_api_key_from_sources()
    status, message, is_set = ai_handler.check_api_key_validity()
    is_valid_format = bool(key_value and key_value != "YOUR_GEMINI_API_KEY_HERE")
    if is_valid_format:
        is_set = True
        if ai_handler.MODEL is not None: # Use MODEL
            status, message = "active", "API Key set & LLM active."
        else:
            if ai_handler.initialize_llm(): # Use initialize_llm. No need to force reload config if just checking status on an existing key.
                status, message = "active", "API Key set & LLM init success."
                # ai_handler.MODEL = None # Optionally reset if only for status check
                # ai_handler.initialize_llm()
            else: status, message = "error", "API Key set but LLM init failed."
    elif key_value == "YOUR_GEMINI_API_KEY_HERE": status, message = "placeholder", "API Key is placeholder."
    else: status, message = "not_set", "API Key not set."
    return jsonify({
        "status_code": status, "message": message, "is_set": is_set,
        "key_preview": (key_value[:4] + "..." + key_value[-4:]) if is_valid_format and key_value and len(key_value) > 8 else "N/A"
    })

@app.route('/ai_generate', methods=['POST'])
def ai_generate():
    if not ai_handler.MODEL: # Use MODEL
        if not ai_handler.initialize_llm(): # Use initialize_llm
            return jsonify({"status": "error", "message": "AI model not init. Check API key/config."}), 503
        if not ai_handler.MODEL: return jsonify({"status": "error", "message": "AI model STILL not init."}), 503
    
    data = request.json
    task_type = data.get('task_type')
    # ... (rest of your ai_generate logic, calling ai_handler.generate_... functions) ...
    # (Ensure this part is complete as per your working version, using ai_handler.generate_... which internally uses MODEL)
    job_context = data.get('job_description_context', '')
    ai_response = None
    print(f"DEBUG: /ai_generate called. Task: {task_type}. Config loaded: {ai_handler.CONFIG is not None}. Model init: {ai_handler.MODEL is not None}")

    if task_type == 'generate_title':
        role_desc = data.get('user_role_description')
        company = data.get('company', '')
        language = data.get('language', 'pl')
        if not role_desc: return jsonify({"status": "error", "message": "User role description required."}), 400
        ai_response = ai_handler.generate_job_title(role_desc, job_context, company, language)
    elif task_type == 'generate_bullets':
        role_desc = data.get('user_role_description')
        num_bullets = data.get('num_bullets_to_generate', 3)
        company = data.get('company', '')
        language = data.get('language', 'pl')
        try: num_bullets = int(num_bullets)
        except ValueError: return jsonify({"status": "error", "message": "Num bullets must be int."}), 400
        if not role_desc: return jsonify({"status": "error", "message": "User role description required."}), 400
        ai_response = ai_handler.generate_bullet_points(role_desc, job_context, company, num_bullets, language)
    elif task_type == 'generate_skills':
        initial_skills = data.get('user_initial_skills')
        language = data.get('language', 'pl')
        ai_response = ai_handler.generate_skills_from_description(initial_skills, job_context, language)
        if ai_response and 'generated_skills' in ai_response and isinstance(ai_response['generated_skills'], list):
            for i, skill_cat in enumerate(ai_response['generated_skills']):
                if isinstance(skill_cat, dict) and 'id' not in skill_cat:
                    skill_cat['id'] = f"ai_skill_{i}_{os.urandom(4).hex()}" # Ensure os is imported for urandom
    elif task_type == 'generate_project_description':
        project_desc = data.get('user_project_description')
        language = data.get('language', 'pl')
        if not project_desc: return jsonify({"status": "error", "message": "User project description required."}), 400
        ai_response = ai_handler.generate_project_description(project_desc, job_context, language)
    elif task_type == 'generate_cover_letter':
        resume_data = data.get('resume_data')
        language = data.get('language', 'pl')
        print(f"DEBUG: Cover letter generation request - Language: {language}, Resume data keys: {list(resume_data.keys()) if resume_data else 'None'}")
        if not resume_data: return jsonify({"status": "error", "message": "Resume data required for cover letter generation."}), 400
        try:
            ai_response = ai_handler.generate_cover_letter(resume_data, job_context, language)
            print(f"DEBUG: Cover letter AI response: {ai_response}")
        except Exception as e:
            print(f"DEBUG: Exception in cover letter generation: {e}")
            return jsonify({"status": "error", "message": f"Error generating cover letter: {str(e)}"}), 500
    else:
        return jsonify({"status": "error", "message": "Invalid AI task type."}), 400

    if ai_response and "error" not in ai_response:
        return jsonify({"status": "success", "data": ai_response})
    else:
        error_message = "AI generation failed."
        if ai_response and "error" in ai_response: error_message = ai_response["error"]
        return jsonify({"status": "error", "message": error_message}), 500

@app.route('/export_pdf', methods=['POST'])
def export_pdf():
    try:
        html_content = request.form.get('html_content')
        if not html_content:
            return jsonify({"status": "error", "message": "No HTML content provided"}), 400
        
        # Fix image paths to be absolute URLs for PDF generation
        base_url = request.url_root.rstrip('/')
        
        # Handle all possible image path patterns
        # Convert relative paths starting with "static/" to absolute URLs
        html_content = re.sub(
            r'src="static/([^"]+)"',
            f'src="{base_url}/static/\\1"',
            html_content
        )
        
        # Handle paths that might be missing the "static/" prefix for uploads
        html_content = re.sub(
            r'src="uploads/([^"]+)"',
            f'src="{base_url}/static/uploads/\\1"',
            html_content
        )
        
        # Handle already absolute URLs (don't double-process)
        html_content = re.sub(
            f'src="{re.escape(base_url)}/static/static/',
            f'src="{base_url}/static/',
            html_content
        )
        
        # Read the CSS files to embed them directly
        css_path = os.path.join(STATIC_FOLDER, 'style', 'style.css')
        document_css_path = os.path.join(STATIC_FOLDER, 'style', 'document.css')
        css_content = ""
        document_css_content = ""
        
        try:
            with open(css_path, 'r', encoding='utf-8') as f:
                css_content = f.read()
        except Exception as e:
            print(f"Warning: Could not read CSS file: {e}")
            css_content = "/* CSS could not be loaded */"
            
        try:
            with open(document_css_path, 'r', encoding='utf-8') as f:
                document_css_content = f.read()
        except Exception as e:
            print(f"Warning: Could not read document CSS file: {e}")
            document_css_content = "/* Document CSS could not be loaded */"
        
        # Create a complete HTML document with embedded CSS
        full_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                {document_css_content}
                
                /* PDF-specific overrides */
                body {{
                    margin: 0;
                    padding: 0;
                    background-color: white !important;
                    color: black !important;
                }}
                
                .markdown-body {{
                    padding: 15mm !important;
                    margin: 0 !important;
                    max-width: none !important;
                    min-height: 0 !important;
                    box-shadow: none !important;
                    border: none !important;
                    font-size: 10pt !important;
                    background-color: white !important;
                    color: black !important;
                }}
                
                .markdown-body a {{
                    color: black !important;
                    text-decoration: none !important;
                }}
                
                .markdown-body .resume-photo {{
                    display: block !important;
                    visibility: visible !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }}
                
                @page {{
                    margin: 0;
                    size: A4;
                }}
            </style>
        </head>
        <body>
            <div class="markdown-body">
                {html_content}
            </div>
        </body>
        </html>
        """
        
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            
            # Set the HTML content and wait for images to load
            page.set_content(full_html, wait_until="networkidle", timeout=60000)
            
            # Wait additional time for images to fully load
            page.wait_for_timeout(2000)
            
            # Generate PDF with settings that match the live preview
            pdf_buffer = page.pdf(
                format='A4',
                margin={'top': '0mm', 'bottom': '0mm', 'left': '0mm', 'right': '0mm'},
                print_background=True,
                prefer_css_page_size=True
            )
            
            browser.close()
            
            # Return the PDF as a file download
            return send_file(
                io.BytesIO(pdf_buffer),
                mimetype='application/pdf',
                as_attachment=True,
                download_name='resume.pdf'
            )
            
    except Exception as e:
        print(f"PDF export error: {e}")
        return jsonify({"status": "error", "message": f"PDF generation failed: {str(e)}"}), 500

@app.route('/export_cover_letter_pdf', methods=['POST'])
def export_cover_letter_pdf():
    """Export cover letter as PDF"""
    try:
        cover_letter_content = request.form.get('cover_letter_content')
        if not cover_letter_content:
            return jsonify({"status": "error", "message": "No cover letter content provided"}), 400
        
        # Create simple HTML for cover letter
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Cover Letter</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px 20px;
                    color: #333;
                }}
                .cover-letter {{
                    white-space: pre-wrap;
                    font-size: 12pt;
                }}
                @media print {{
                    body {{ margin: 0; padding: 20px; }}
                    .cover-letter {{ font-size: 11pt; }}
                }}
            </style>
        </head>
        <body>
            <div class="cover-letter">{cover_letter_content}</div>
        </body>
        </html>
        """
        
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.set_content(html_content)
            
            pdf_buffer = page.pdf(
                format='A4',
                margin={{
                    'top': '20mm',
                    'bottom': '20mm',
                    'left': '20mm',
                    'right': '20mm'
                }},
                print_background=True
            )
            
            browser.close()
            
            return send_file(
                io.BytesIO(pdf_buffer),
                as_attachment=True,
                download_name='cover_letter.pdf',
                mimetype='application/pdf'
            )
            
    except Exception as e:
        print(f"Cover letter PDF export error: {e}")
        return jsonify({"status": "error", "message": f"Cover letter PDF generation failed: {str(e)}"}), 500

@app.route('/api_guide/<language>')
def api_guide(language):
    """Show API guide page in specified language"""
    if language not in ['pl', 'en']:
        language = 'pl'  # Default to Polish
    
    if language == 'en':
        return render_template('api_guide_en.html')
    else:
        return render_template('api_guide_pl.html')


if __name__ == '__main__':
    # (Ensure uploads folder, template resume.json, batman.png, and ai_config.json are handled as before)
    if not os.path.exists(UPLOADS_FOLDER): os.makedirs(UPLOADS_FOLDER)
    if not os.path.exists(TEMPLATE_RESUME_JSON_PATH):
        print(f"CRITICAL: Template resume JSON {TEMPLATE_RESUME_JSON_PATH} not found. Creating minimal.")
        try:
            with open(TEMPLATE_RESUME_JSON_PATH, 'w', encoding='utf-8') as f: json.dump(MINIMAL_DEFAULT_JSON.copy(), f, indent=4)
        except Exception as e: print(f"Failed to create minimal template: {e}")
    # ...

    ensure_ai_config_exists()
    if ai_handler.CONFIG is None: 
        ai_handler.load_config() 
    
    # THIS IS THE CORRECTED SECTION (like line 471 from your error)
    if ai_handler.MODEL is None and ai_handler.CONFIG is not None:
        print("Attempting to initialize LLM at app startup (MODEL check)...")
        ai_handler.initialize_llm()
    elif ai_handler.MODEL is None and ai_handler.CONFIG is None:
        print("Warning: AI Config not loaded and LLM not initialized at startup.")
    elif ai_handler.MODEL is not None: # Corrected from CLIENT
        print("LLM (MODEL) already initialized.")

    app.run(debug=True, host='0.0.0.0')