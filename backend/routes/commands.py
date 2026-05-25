"""Automation commands routes."""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.activity import ActivityLog

commands_bp = Blueprint("commands", __name__, url_prefix="/api/commands")

# Predefined automation commands
PREDEFINED_COMMANDS = [
    {
        "id": "open_youtube",
        "name": "Open YouTube",
        "description": "Opens YouTube in your browser",
        "icon": "play-circle",
        "category": "web",
    },
    {
        "id": "open_google",
        "name": "Open Google",
        "description": "Opens Google search in your browser",
        "icon": "search",
        "category": "web",
    },
    {
        "id": "open_github",
        "name": "Open GitHub",
        "description": "Opens GitHub in your browser",
        "icon": "github",
        "category": "development",
    },
    {
        "id": "open_calculator",
        "name": "Calculator",
        "description": "Opens the system calculator",
        "icon": "calculator",
        "category": "utility",
    },
    {
        "id": "open_notepad",
        "name": "Notepad",
        "description": "Opens the text editor",
        "icon": "file-text",
        "category": "utility",
    },
    {
        "id": "open_terminal",
        "name": "Terminal",
        "description": "Opens a terminal / command prompt",
        "icon": "terminal",
        "category": "development",
    },
    {
        "id": "open_settings",
        "name": "System Settings",
        "description": "Opens system settings / control panel",
        "icon": "settings",
        "category": "system",
    },
    {
        "id": "open_files",
        "name": "File Explorer",
        "description": "Opens the file explorer",
        "icon": "folder",
        "category": "system",
    },
    {
        "id": "open_spotify",
        "name": "Open Spotify",
        "description": "Opens Spotify for music",
        "icon": "music",
        "category": "entertainment",
    },
    {
        "id": "open_stackoverflow",
        "name": "Stack Overflow",
        "description": "Opens Stack Overflow in your browser",
        "icon": "help-circle",
        "category": "development",
    },
]


@commands_bp.route("/list", methods=["GET"])
@jwt_required()
def list_commands():
    """Return all predefined automation commands."""
    return jsonify({"commands": PREDEFINED_COMMANDS})


@commands_bp.route("/execute", methods=["POST"])
@jwt_required()
def execute_command():
    """Log execution of a command and return success."""
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True)

    if not data or not data.get("command_id"):
        return jsonify({"error": "command_id is required"}), 400

    command_id = data["command_id"]

    # Validate command exists
    command = next((c for c in PREDEFINED_COMMANDS if c["id"] == command_id), None)
    if not command:
        return jsonify({"error": "Unknown command"}), 404

    try:
        log = ActivityLog(
            user_id=user_id,
            action="command_executed",
            details=f"Executed command: {command['name']}",
        )
        db.session.add(log)
        db.session.commit()

        return jsonify(
            {
                "message": f"Command '{command['name']}' executed successfully",
                "command": command,
            }
        )
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": f"Failed to execute command: {str(exc)}"}), 500
