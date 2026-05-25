"""Dashboard routes: stats and activity feed."""

from datetime import datetime, timezone
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.user import User
from models.chat import ChatSession, ChatMessage
from models.activity import ActivityLog

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.route("/stats", methods=["GET"])
@jwt_required()
def stats():
    """Return high-level dashboard statistics for the current user."""
    user_id = int(get_jwt_identity())
    try:
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        chat_count = ChatSession.query.filter_by(user_id=user_id).count()
        message_count = (
            db.session.query(ChatMessage)
            .join(ChatSession, ChatMessage.session_id == ChatSession.id)
            .filter(ChatSession.user_id == user_id)
            .count()
        )

        now = datetime.now(timezone.utc)
        created = user.created_at.replace(tzinfo=timezone.utc) if user.created_at.tzinfo is None else user.created_at
        days_since_joined = (now - created).days

        return jsonify(
            {
                "stats": {
                    "chat_count": chat_count,
                    "message_count": message_count,
                    "days_since_joined": days_since_joined,
                    "username": user.username,
                }
            }
        )
    except Exception as exc:
        return jsonify({"error": f"Failed to fetch stats: {str(exc)}"}), 500


@dashboard_bp.route("/activity", methods=["GET"])
@jwt_required()
def activity():
    """Return the last 20 activity-log entries for the current user."""
    user_id = int(get_jwt_identity())
    try:
        logs = (
            ActivityLog.query.filter_by(user_id=user_id)
            .order_by(ActivityLog.timestamp.desc())
            .limit(20)
            .all()
        )
        return jsonify({"activities": [log.to_dict() for log in logs]})
    except Exception as exc:
        return jsonify({"error": f"Failed to fetch activity: {str(exc)}"}), 500
