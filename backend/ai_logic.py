import os
from dotenv import load_dotenv

load_dotenv()


class AIError(Exception):
    """Raised when AI generation fails."""
    pass

class AIProvider:
    def __init__(self):
        provider = os.getenv("AI_PROVIDER")
        self._provider = provider if provider in ["google", "qwen"] else None
        print(provider)
        
    @property
    def provider(self):
        return self._provider

    # ── provider-specific helpers ──────────────────────────────

    def _google_generate(self, prompt: str) -> str:
        try:
            from google import genai
        except ModuleNotFoundError:
            raise AIError("Google GenAI SDK is not installed. Install package: google-genai")

        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise AIError("Missing GEMINI_API_KEY in backend/.env")

        try:
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            return response.text or ""
        except Exception as error:
            raise AIError(f"Google AI generation failed: {error}")

    def _qwen_generate(self, prompt: str) -> str:
        try:
            import ollama
        except ModuleNotFoundError:
            raise AIError("Ollama Python package is not installed. Install package: ollama")

        try:
            response = ollama.chat(
                model="qwen2.5-coder",
                messages=[{"role": "user", "content": prompt}],
            )
            return response["message"]["content"]
        except Exception as error:
            raise AIError(f"Qwen AI generation failed: {error}")
    
    def prompt_ai(self, prompt: str) -> str:
        if self.provider == "google":
            return self._google_generate(prompt)
        elif self.provider == "qwen":
            return self._qwen_generate(prompt)
        else:
            raise AIError("No valid AI provider selected.")
        


class AIRouter:
    """Routes AI requests to the user-chosen provider (Google or Qwen)."""
    def __init__(self):
        self.provider = AIProvider()

    # ── public API ─────────────────────────────────────────────

    def solve(self, description: str) -> str:
        """Generate a code solution using the chosen provider."""
        prompt = (
            "Your task is to write the code required for solving the following problem: "
            f"{description}\n"
            "Do not provide any additional explanations, just the code that has to be "
            "in the right shape so that it can be copied, pasted and work correctly."
        )

        return self.provider.prompt_ai(prompt)
    def determine_true_or_false(self, code: str, description) -> bool:
        prompt = (
            f'''Your task is to review the code and determine if it solves the
            given task: {description}. If it does answer with a single word "True" and if it doesn't with "False
            This is the code that should correclty solve the task: {code}'''
        )

        ai_response = self.provider.prompt_ai(prompt)
        normalized = (ai_response or "").strip().lower()
        return normalized.startswith("true")

    def generate_improvement_tips(self, code: str, description: str) -> str:
        prompt = (
            "You are reviewing a student's solution attempt. "
            "You are talking directly to the student, and pointing them in the right direction"
            "Do not give total answers to the problem but give them enough so that they can use their mind and logic to figure it out that is most important"
            "Give concise, practical tips to improve the code so it correctly solves the task. "
            "Return plain text with 3-6 short bullet points and no markdown code fences.\n\n"
            f"Task:\n{description}\n\n"
            f"Student code:\n{code}"
        )
        return self.provider.prompt_ai(prompt)
    
    
    
    
    
    




# single global instance shared across the app
ai_router = AIRouter()