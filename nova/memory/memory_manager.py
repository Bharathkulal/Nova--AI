import re

class MemoryManager:
    def __init__(self, db):
        self.db = db

    def get_user_name(self):
        return self.db.get_profile_value("name", "Bharath")

    def set_user_name(self, name):
        self.db.set_profile_value("name", name)

    def get_facts_prompt_context(self):
        facts = self.db.get_all_facts()
        if not facts:
            return "No prior facts known about the user yet."
        context_lines = []
        for k, v in facts.items():
            context_lines.append(f"- {k}: {v}")
        return "\n".join(context_lines)

    def extract_and_save_facts(self, ai_response):
        # Pattern: [MEM_UPDATE: key=value]
        pattern = r"\[MEM_UPDATE:\s*([^=]+?)\s*=\s*([^\]]+?)\s*\]"
        matches = re.findall(pattern, ai_response)
        cleaned_response = re.sub(pattern, "", ai_response).strip()
        
        for key, val in matches:
            key_clean = key.strip().lower()
            val_clean = val.strip()
            if key_clean == "name":
                self.set_user_name(val_clean)
            else:
                self.db.save_fact(key_clean, val_clean)
                
        return cleaned_response
