"""Chat routes: send messages, manage sessions."""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.chat import ChatSession, ChatMessage
from models.activity import ActivityLog
from ai.provider import get_ai_response

chat_bp = Blueprint("chat", __name__, url_prefix="/api/chat")

SYSTEM_PROMPT = (
    "You are Nova, a futuristic AI assistant. You are helpful, intelligent, "
    "and concise. You speak in a professional but friendly tone."
)


def _auto_title(text: str) -> str:
    """Generate a short session title from the first user message."""
    title = text.strip()
    if len(title) > 60:
        title = title[:57] + "..."
    return title or "New Chat"


@chat_bp.route("/send", methods=["POST"])
@jwt_required()
def send_message():
    """Send a message and get an AI response."""
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True)

    if not data or not (data.get("message") or "").strip():
        return jsonify({"error": "Message content is required"}), 400

    message_text = data["message"].strip()
    session_id = data.get("session_id")

    try:
        # Resolve or create session
        if session_id:
            session = ChatSession.query.filter_by(
                id=session_id, user_id=user_id
            ).first()
            if not session:
                return jsonify({"error": "Chat session not found"}), 404
        else:
            session = ChatSession(user_id=user_id, title=_auto_title(message_text))
            db.session.add(session)
            db.session.flush()

        # Persist user message
        user_msg = ChatMessage(
            session_id=session.id, role="user", content=message_text
        )
        db.session.add(user_msg)
        db.session.flush()

        # Build conversation history for context
        previous_messages = (
            ChatMessage.query.filter_by(session_id=session.id)
            .order_by(ChatMessage.created_at.asc())
            .all()
        )
        messages_list = [
            {"role": msg.role, "content": msg.content} for msg in previous_messages
        ]

        # Determine AI provider & optional custom key
        provider = current_app.config.get("AI_PROVIDER", "gemini")
        api_key = None  # will use default from config

        # Call AI
        ai_response_text = get_ai_response(
            messages=messages_list,
            system_prompt=SYSTEM_PROMPT,
            provider=provider,
            api_key=api_key,
        )

        # Persist assistant message
        assistant_msg = ChatMessage(
            session_id=session.id, role="assistant", content=ai_response_text
        )
        db.session.add(assistant_msg)

        # Log activity
        log = ActivityLog(
            user_id=user_id,
            action="chat_message",
            details=f"Sent message in session {session.id}",
        )
        db.session.add(log)

        db.session.commit()

        return jsonify(
            {
                "message": ai_response_text,
                "session_id": session.id,
                "session_title": session.title,
                "user_message": user_msg.to_dict(),
                "assistant_message": assistant_msg.to_dict(),
            }
        )
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": f"Failed to process message: {str(exc)}"}), 500


@chat_bp.route("/sessions", methods=["GET"])
@jwt_required()
def list_sessions():
    """List all chat sessions for the current user (newest first)."""
    user_id = int(get_jwt_identity())
    try:
        sessions = (
            ChatSession.query.filter_by(user_id=user_id)
            .order_by(ChatSession.created_at.desc())
            .all()
        )
        return jsonify({"sessions": [s.to_dict() for s in sessions]})
    except Exception as exc:
        return jsonify({"error": f"Failed to fetch sessions: {str(exc)}"}), 500


@chat_bp.route("/sessions/<int:session_id>", methods=["GET"])
@jwt_required()
def get_session(session_id: int):
    """Get a single session with all its messages."""
    user_id = int(get_jwt_identity())
    try:
        session = ChatSession.query.filter_by(
            id=session_id, user_id=user_id
        ).first()
        if not session:
            return jsonify({"error": "Session not found"}), 404
        return jsonify({"session": session.to_dict(include_messages=True)})
    except Exception as exc:
        return jsonify({"error": f"Failed to fetch session: {str(exc)}"}), 500


@chat_bp.route("/sessions", methods=["POST"])
@jwt_required()
def create_session():
    """Create a new empty chat session."""
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "New Chat").strip()

    try:
        session = ChatSession(user_id=user_id, title=title)
        db.session.add(session)
        db.session.commit()
        return jsonify({"session": session.to_dict()}), 201
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": f"Failed to create session: {str(exc)}"}), 500


@chat_bp.route("/sessions/<int:session_id>", methods=["DELETE"])
@jwt_required()
def delete_session(session_id: int):
    """Delete a chat session and all its messages."""
    user_id = int(get_jwt_identity())
    try:
        session = ChatSession.query.filter_by(
            id=session_id, user_id=user_id
        ).first()
        if not session:
            return jsonify({"error": "Session not found"}), 404

        db.session.delete(session)
        db.session.commit()
        return jsonify({"message": "Session deleted successfully"})
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete session: {str(exc)}"}), 500


@chat_bp.route("/clear", methods=["DELETE"])
@jwt_required()
def clear_sessions():
    """Delete all chat sessions for the current user."""
    user_id = int(get_jwt_identity())
    try:
        sessions = ChatSession.query.filter_by(user_id=user_id).all()
        for session in sessions:
            db.session.delete(session)
        db.session.commit()
        return jsonify(
            {"message": "All chat sessions cleared", "deleted_count": len(sessions)}
        )
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": f"Failed to clear sessions: {str(exc)}"}), 500
