"""User settings model for personalization and preferences."""

from extensions import db


class UserSettings(db.Model):
    __tablename__ = "user_settings"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    theme = db.Column(db.String(20), nullable=False, default="dark")
    assistant_name = db.Column(db.String(50), nullable=False, default="Nova")
    voice = db.Column(db.String(50), nullable=False, default="default")
    ai_provider = db.Column(db.String(20), nullable=False, default="gemini")
    api_key_encrypted = db.Column(db.Text, nullable=True)
    notifications = db.Column(db.Boolean, nullable=False, default=True)

    def to_dict(self) -> dict:
        """Serialize settings to dictionary (never expose raw API key)."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "theme": self.theme,
            "assistant_name": self.assistant_name,
            "voice": self.voice,
            "ai_provider": self.ai_provider,
            "has_custom_api_key": bool(self.api_key_encrypted),
            "notifications": self.notifications,
        }

    def __repr__(self) -> str:
        return f"<UserSettings user_id={self.user_id}>"
