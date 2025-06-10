"""Database models and configuration for reVoAgent."""
import os
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from sqlalchemy.dialects.postgresql import UUID
import uuid

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./revoagent.db")

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()

class User(Base):
    """User model for authentication and authorization."""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    executions = relationship("Execution", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")

class Project(Base):
    """Project model for organizing user work."""
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    settings = Column(JSON, default=dict)  # Project-specific settings
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    executions = relationship("Execution", back_populates="project", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="project", cascade="all, delete-orphan")

class Execution(Base):
    """Execution model for tracking agent task executions."""
    __tablename__ = "executions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    agent_type = Column(String, nullable=False)  # code-generator, debug-agent, etc.
    task_description = Column(Text, nullable=False)
    parameters = Column(JSON, default=dict)
    status = Column(String, default="pending")  # pending, running, completed, failed
    result = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    execution_time = Column(Integer, nullable=True)  # in milliseconds
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="executions")
    project = relationship("Project", back_populates="executions")

class ChatSession(Base):
    """Chat session model for storing conversation history."""
    __tablename__ = "chat_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    title = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="chat_sessions")
    project = relationship("Project", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    """Chat message model for storing individual messages."""
    __tablename__ = "chat_messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(String, nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    message_metadata = Column(JSON, default=dict)  # Additional message metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    session = relationship("ChatSession", back_populates="messages")

class APIKey(Base):
    """API key model for external integrations."""
    __tablename__ = "api_keys"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    key_hash = Column(String, nullable=False)  # Hashed API key
    is_active = Column(Boolean, default=True)
    last_used = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User")

# Database utility functions
def get_db() -> Session:
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Drop all database tables."""
    Base.metadata.drop_all(bind=engine)

def init_database():
    """Initialize database with tables."""
    create_tables()
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_database()