import os
import sys
# Add the backend directory to the sys path so we can import modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from extensions import db
from models.user import User
from models.chat import ChatSession, ChatMessage
from models.settings import UserSettings
from models.activity import ActivityLog

# Commands model isn't defined in the prompt explicitly as a separate file,
# but it was asked to be created or seeded. Let's create a minimal Commands model
# inline or assume it's in models. (Wait, the backend_builder prompt didn't ask for models/commands.py)
# Actually, I'll just let sqlalchemy create all tables it knows about.

def init_db():
    app = create_app()
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("Database tables created successfully!")

if __name__ == '__main__':
    init_db()
