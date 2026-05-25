"""Authentication routes: register, login, logout, and current-user lookup."""

from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from extensions import db
from models.user import User
from models.settings import UserSettings
from models.activity import ActivityLog

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user and return a JWT."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    # ---------- validation ----------
    errors = []
    if not username:
        errors.append("Username is required")
    elif len(username) < 3:
        errors.append("Username must be at least 3 characters")
    if not email:
        errors.append("Email is required")
    elif "@" not in email:
        errors.append("Invalid email format")
    if not password:
        errors.append("Password is required")
    elif len(password) < 6:
        errors.append("Password must be at least 6 characters")
    if errors:
        return jsonify({"error": errors[0], "errors": errors}), 400

    # ---------- uniqueness check ----------
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    try:
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.flush()  # get user.id before committing

        # Create default settings for the new user
        settings = UserSettings(user_id=user.id)
        db.session.add(settings)

        # Log the registration
        log = ActivityLog(
            user_id=user.id, action="register", details="Account created"
        )
        db.session.add(log)

        db.session.commit()

        access_token = create_access_token(identity=str(user.id))
        return (
            jsonify(
                {
                    "message": "Registration successful",
                    "access_token": access_token,
                    "user": user.to_dict(),
                }
            ),
            201,
        )
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": f"Registration failed: {str(exc)}"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate a user and return a JWT."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    try:
        user.last_login = datetime.now(timezone.utc)

        log = ActivityLog(user_id=user.id, action="login", details="User logged in")
        db.session.add(log)
        db.session.commit()

        access_token = create_access_token(identity=str(user.id))
        return jsonify(
            {
                "message": "Login successful",
                "access_token": access_token,
                "user": user.to_dict(),
            }
        )
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": f"Login failed: {str(exc)}"}), 500


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Logout (client-side token removal)."""
    return jsonify({"message": "Logged out successfully"})


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    """Return the currently authenticated user's data."""
    try:
        user_id = int(get_jwt_identity())
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"user": user.to_dict()})
    except Exception as exc:
        return jsonify({"error": f"Failed to fetch user: {str(exc)}"}), 500
