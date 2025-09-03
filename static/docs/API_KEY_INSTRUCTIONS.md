# docs/API_KEY_INSTRUCTIONS.md

## Obtaining and Using a Google Gemini API Key for ResuAI

ResuAI uses Google's Gemini language model for its AI-powered content generation features. To use these features, you'll need a Gemini API key.

### 1. Get a Gemini API Key

1.  **Visit Google AI Studio:** Go to [https://aistudio.google.com/](https://aistudio.google.com/).
2.  **Sign In:** Sign in with your Google account.
3.  **Create API Key:**
    *   Look for an option like "Get API key" or "Create API key". This is often found in a navigation menu or on the main dashboard.
    *   You might need to agree to terms and conditions.
    *   Generate a new API key. It will be a long string of characters.

**Important:** Treat your API key like a password. Do not share it publicly or commit it to version control systems like Git.

### 2. Configure ResuAI with Your API Key

Once you have your API key, you need to make it available to ResuAI:

1.  **Locate `ai_config.json.example`:** In the root directory of the ResuAI application, you'll find a file named `ai_config.json.example`.
2.  **Create `ai_config.json`:**
    *   Make a copy of `ai_config.json.example` and rename the copy to `ai_config.json`.
    *   **This `ai_config.json` file is already listed in `.gitignore`, so it will not be accidentally committed to Git.**
3.  **Edit `ai_config.json`:** Open `ai_config.json` in a text editor. You will see a structure like this:
    ```json
    {
        "api_key": "YOUR_GEMINI_API_KEY_HERE",
        "llm_model_name": "gemini-1.5-flash-latest",
        // ... other configurations
    }
    ```
4.  **Paste Your API Key:** Replace `"YOUR_GEMINI_API_KEY_HERE"` with the actual API key you obtained from Google AI Studio.
    ```json
    {
        "api_key": "AIzaSy...your...actual...key...here...", // Replace this
        "llm_model_name": "gemini-1.5-flash-latest",
        // ... other configurations
    }
    ```
5.  **Save the File.**

### Alternative: Environment Variable (Optional)

If you prefer, you can set an environment variable named `GEMINI_API_KEY` with your API key value. The application will try to read this if the `api_key` in `ai_config.json` is missing or still set to the placeholder.

### Troubleshooting

*   **AI Features Not Working:**
    *   Ensure `ai_config.json` exists and is correctly named.
    *   Double-check that your API key is correctly pasted into `ai_config.json`.
    *   Make sure your Google Cloud project associated with the API key has billing enabled if required by Google for the Gemini API usage tier you are on.
    *   Check the console output when `app.py` starts. It will print messages if it has trouble loading the configuration or initializing the LLM.
*   **"API key not valid" errors:** Ensure the key is correct and active in Google AI Studio.

That's it! Once configured, ResuAI should be able to use its AI content generation features.