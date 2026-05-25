"""User settings routes."""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.settings import UserSettings

settings_bp = Blueprint("settings", __name__, url_prefix="/api/settings")


def _get_or_create_settings(user_id: int) -> UserSettings:
    """Return existing settings or create defaults for the user."""
    settings = UserSettings.query.filter_by(user_id=user_id).first()
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.session.add(settings)
        db.session.commit()
    return settings


@settings_bp.route("/", methods=["GET"])
@jwt_required()
def get_settings():
    """Return the current user's settings."""
    user_id = int(get_jwt_identity())
    try:
        settings = _get_or_create_settings(user_id)
        return jsonify({"settings": settings.to_dict()})
    except Exception as exc:
        return jsonify({"error": f"Failed to fetch settings: {str(exc)}"}), 500


@settings_bp.route("/", methods=["PUT"])
@jwt_required()
def update_settings():
    """Update the current user's settings."""
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    try:
        settings = _get_or_create_settings(user_id)

        allowed_fields = {
            "theme": str,
            "assistant_name": str,
            "voice": str,
            "ai_provider": str,
            "notifications": bool,
        }

        for field, expected_type in allowed_fields.items():
            if field in data:
                value = data[field]
                if not isinstance(value, expected_type):
                    return (
                        jsonify({"error": f"Invalid type for field '{field}'"}),
                        400,
                    )
                setattr(settings, field, value)

        db.session.commit()
        return jsonify(
            {"message": "Settings updated", "settings": settings.to_dict()}
        )
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": f"Failed to update settings: {str(exc)}"}), 500


@settings_bp.route("/api-key", methods=["PUT"])
@jwt_required()
def update_api_key():
    """Store a user-provided API key (plain-text stored as encrypted column)."""
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    api_key = data.get("api_key")
    if api_key is not None and not isinstance(api_key, str):
        return jsonify({"error": "api_key must be a string"}), 400

    try:
        settings = _get_or_create_settings(user_id)
        # Store the key (empty string or None clears it)
        settings.api_key_encrypted = api_key if api_key else None
        db.session.commit()
        return jsonify(
            {
                "message": "API key updated" if api_key else "API key removed",
                "has_custom_api_key": bool(settings.api_key_encrypted),
            }
        )
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": f"Failed to update API key: {str(exc)}"}), 500
