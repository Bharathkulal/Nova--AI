import os
from flask import Flask, jsonify
from config import Config
from extensions import db, jwt, cors
from routes.auth import auth_bp
from routes.chat import chat_bp
from routes.settings import settings_bp
from routes.dashboard import dashboard_bp
from routes.commands import commands_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    
    # Configure CORS based on frontend URL
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    cors.init_app(app, resources={r"/api/*": {"origins": frontend_url}})

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(settings_bp, url_prefix='/api/settings')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(commands_bp, url_prefix='/api/commands')

    # Global Error Handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500

    @app.route('/')
    def index():
        return jsonify({"message": "Nova AI Backend is running."})

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
