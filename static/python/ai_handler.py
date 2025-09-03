# ai_handler.py
import json
import os
from google import genai
from google.genai import types

# Global variables
CONFIG = None
MODEL = None

def load_prompt_from_file(prompt_name, language="pl"):
    """Load prompt from txt file in static/prompts folder"""
    prompt_file = f"{prompt_name}_{language}.txt"
    # prompts are in static/prompts/, we're in static/python/
    prompt_path = os.path.join(os.path.dirname(__file__), '..', 'prompts', prompt_file)
    
    try:
        print(f"DEBUG: Attempting to load prompt from: {prompt_path}")
        if not os.path.exists(prompt_path):
            print(f"DEBUG: Prompt file does not exist: {prompt_path}")
            # Check if directory exists
            prompt_dir = os.path.dirname(prompt_path)
            if os.path.exists(prompt_dir):
                print(f"DEBUG: Prompt directory exists, listing files: {os.listdir(prompt_dir)}")
            else:
                print(f"DEBUG: Prompt directory does not exist: {prompt_dir}")
            return None
            
        with open(prompt_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            if not content:
                print(f"DEBUG: Prompt file is empty: {prompt_path}")
                return None
            print(f"DEBUG: Successfully loaded prompt from: {prompt_path} (length: {len(content)} chars)")
            return content
    except FileNotFoundError:
        print(f"DEBUG: Prompt file not found: {prompt_path}")
        return None
    except UnicodeDecodeError as e:
        print(f"DEBUG: Unicode decode error loading prompt {prompt_path}: {e}")
        return None
    except Exception as e:
        print(f"DEBUG: Error loading prompt {prompt_path}: {e}")
        return None

def load_config():
    """Load AI configuration from ai_config.json"""
    global CONFIG
    # ai_config.json is now in static/scripts/, not in static/python/
    ai_config_path = os.path.join(os.path.dirname(__file__), '..', 'scripts', 'ai_config.json')
    
    try:
        if os.path.exists(ai_config_path):
            with open(ai_config_path, 'r', encoding='utf-8') as f:
                CONFIG = json.load(f)
                print("DEBUG: AI config loaded successfully")
            return True
        else:
            print(f"DEBUG: AI config file not found at {ai_config_path}")
            CONFIG = None
            return False
    except Exception as e:
        print(f"DEBUG: Error loading AI config: {e}")
        CONFIG = None
        return False

def get_api_key_from_sources():
    """Get API key from config or environment"""
    if CONFIG and 'api_key' in CONFIG:
        return CONFIG['api_key']
    return os.environ.get("GEMINI_API_KEY", "")

def initialize_llm():
    """Initialize the Gemini model"""
    global MODEL
    try:
        api_key = get_api_key_from_sources()
        if not api_key or api_key == "YOUR_GEMINI_API_KEY_HERE":
            print("DEBUG: No valid API key found for LLM initialization")
            MODEL = None
            return False
            
        print(f"DEBUG: Attempting to initialize LLM with API key: {api_key[:10]}...")
        client = genai.Client(api_key=api_key)
        MODEL = client
        print("DEBUG: LLM (Gemini) initialized successfully")
        return True
    except Exception as e:
        print(f"DEBUG: Error initializing LLM: {e}")
        import traceback
        print(f"DEBUG: Full traceback: {traceback.format_exc()}")
        MODEL = None
        return False

def generate_job_title(user_description, job_context="", company="", language="pl"):
    """Generate a professional job title from user description"""
    if not MODEL:
        return {"error": "AI model not initialized"}
    
    try:
        prompt_template = load_prompt_from_file("job_title", language)
        if not prompt_template:
            return {"error": "Could not load prompt template" if language == "en" else "Nie można załadować szablonu promptu"}
        
        prompt = prompt_template.format(
            user_description=user_description,
            company=company,
            job_context=job_context
        )

        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)],
            ),
        ]
        
        config = types.GenerateContentConfig(
            response_mime_type="text/plain",
            temperature=0.7,
            max_output_tokens=50
        )

        response = MODEL.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=contents,
            config=config,
        )
        
        return {"generated_title": response.text.strip()}
        
    except Exception as e:
        print(f"DEBUG: Error generating job title: {e}")
        return {"error": f"Błąd generowania tytułu: {str(e)}" if language == "pl" else f"Error generating title: {str(e)}"}

def generate_bullet_points(user_description, job_context="", company="", num_bullets=3, language="pl"):
    """Generate bullet points from user's natural language description"""
    if not MODEL:
        return {"error": "AI model not initialized"}
    
    try:
        prompt_template = load_prompt_from_file("bullet_points", language)
        if not prompt_template:
            return {"error": "Could not load prompt template" if language == "en" else "Nie można załadować szablonu promptu"}
        
        prompt = prompt_template.format(
            num_bullets=num_bullets,
            user_description=user_description,
            company=company,
            job_context=job_context
        )

        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)],
            ),
        ]
        
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.8,
            max_output_tokens=500
        )

        response = MODEL.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=contents,
            config=config,
        )
        
        result = json.loads(response.text)
        return {"generated_bullets": result.get("bullets", [])}
        
    except json.JSONDecodeError as e:
        print(f"DEBUG: JSON decode error: {e}")
        return {"error": "Błąd parsowania odpowiedzi AI" if language == "pl" else "Error parsing AI response"}
    except Exception as e:
        print(f"DEBUG: Error generating bullets: {e}")
        return {"error": f"Błąd generowania bullet pointów: {str(e)}" if language == "pl" else f"Error generating bullet points: {str(e)}"}

def generate_skills_from_description(user_description, job_context="", language="pl"):
    """Generate skills categories from user's description"""
    if not MODEL:
        return {"error": "AI model not initialized"}
    
    try:
        prompt_template = load_prompt_from_file("skills", language)
        if not prompt_template:
            return {"error": "Could not load prompt template" if language == "en" else "Nie można załadować szablonu promptu"}
        
        prompt = prompt_template.format(
            user_description=user_description,
            job_context=job_context
        )

        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)],
            ),
        ]
        
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.7,
            max_output_tokens=800
        )

        response = MODEL.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=contents,
            config=config,
        )
        
        result = json.loads(response.text)
        return {"generated_skills": result.get("skill_categories", [])}
        
    except json.JSONDecodeError as e:
        print(f"DEBUG: JSON decode error: {e}")
        return {"error": "Błąd parsowania odpowiedzi AI" if language == "pl" else "Error parsing AI response"}
    except Exception as e:
        print(f"DEBUG: Error generating skills: {e}")
        return {"error": f"Błąd generowania umiejętności: {str(e)}" if language == "pl" else f"Error generating skills: {str(e)}"}

def generate_project_description(user_description, job_context="", language="pl"):
    """Generate project description from user's natural language description"""
    if not MODEL:
        return {"error": "AI model not initialized"}
    
    try:
        prompt_template = load_prompt_from_file("project_description", language)
        if not prompt_template:
            return {"error": "Could not load prompt template" if language == "en" else "Nie można załadować szablonu promptu"}
        
        prompt = prompt_template.format(
            user_description=user_description,
            job_context=job_context
        )

        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)],
            ),
        ]
        
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.7,
            max_output_tokens=300
        )

        response = MODEL.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=contents,
            config=config,
        )
        
        result = json.loads(response.text)
        return {"generated_description": result.get("project_description", "")}
        
    except json.JSONDecodeError as e:
        print(f"DEBUG: JSON decode error: {e}")
        return {"error": "Błąd parsowania odpowiedzi AI" if language == "pl" else "Error parsing AI response"}
    except Exception as e:
        print(f"DEBUG: Error generating project description: {e}")
        return {"error": f"Błąd generowania opisu projektu: {str(e)}" if language == "pl" else f"Error generating project description: {str(e)}"}

def generate_cover_letter(resume_data, job_context="", language="pl"):
    """Generate cover letter from resume data and job context"""
    if not MODEL:
        return {"error": "AI model not initialized"}
    
    try:
        prompt_template = load_prompt_from_file("cover_letter", language)
        if not prompt_template:
            return {"error": "Could not load prompt template" if language == "en" else "Nie można załadować szablonu promptu"}
        
        # Format experience without personal details
        experience_list = []
        for exp in resume_data.get('experience', []):
            exp_text = f"{exp.get('title', '')} at {exp.get('company', '')} ({exp.get('date', '')})"
            if exp.get('bullets'):
                bullets_text = '; '.join(exp['bullets'])
                exp_text += f": {bullets_text}"
            experience_list.append(exp_text)
        experience_text = '; '.join(experience_list)
        
        # Format education
        education_list = []
        for edu in resume_data.get('education', []):
            edu_text = f"{edu.get('degree', '')} from {edu.get('university', '')} ({edu.get('date', '')})"
            education_list.append(edu_text)
        education_text = '; '.join(education_list)
        
        # Format skills
        skills_list = []
        for skill_cat in resume_data.get('skills', []):
            cat_name = skill_cat.get('category', '')
            skills_in_cat = ', '.join(skill_cat.get('skills', []))
            if cat_name and skills_in_cat:
                skills_list.append(f"{cat_name}: {skills_in_cat}")
        skills_text = '; '.join(skills_list)
        
        # Format projects
        projects_list = []
        for proj in resume_data.get('projects', []):
            proj_text = f"{proj.get('title', '')}: {proj.get('description', '')}"
            if proj.get('technologies'):
                proj_text += f" (Technologies: {proj['technologies']})"
            projects_list.append(proj_text)
        projects_text = '; '.join(projects_list)
        
        # Create prompt without personal name/contact data
        prompt = prompt_template.format(
            experience=experience_text,
            education=education_text,
            skills=skills_text,
            projects=projects_text,
            job_context=job_context
        )

        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)],
            ),
        ]
        
        config = types.GenerateContentConfig(
            response_mime_type="text/plain",
            temperature=0.8,
            max_output_tokens=800  # Generous limit for 5-6 sentences
        )

        response = MODEL.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=contents,
            config=config,
        )
        
        cover_letter_content = response.text.strip()
        
        # Remove any markdown formatting if present
        if cover_letter_content.startswith('```') and cover_letter_content.endswith('```'):
            lines = cover_letter_content.split('\n')
            if len(lines) > 2:
                cover_letter_content = '\n'.join(lines[1:-1])
        
        print(f"DEBUG: Generated cover letter length: {len(cover_letter_content)} characters")
        return {"generated_cover_letter": cover_letter_content}
        
    except Exception as e:
        print(f"DEBUG: Error generating cover letter: {e}")
        return {"error": f"Błąd generowania listu motywacyjnego: {str(e)}" if language == "pl" else f"Error generating cover letter: {str(e)}"}

def check_api_key_validity():
    """Check if API key is valid and return status"""
    api_key = get_api_key_from_sources()
    
    if not api_key:
        return 0, "Brak klucza API", False
    elif api_key == "YOUR_GEMINI_API_KEY_HERE":
        return 1, "Klucz API nie został ustawiony", False
    elif len(api_key) < 10:
        return 2, "Klucz API wydaje się nieprawidłowy", False
    else:
        return 3, "Klucz API jest ustawiony", True
