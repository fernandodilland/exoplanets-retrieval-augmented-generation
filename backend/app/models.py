"""
SQLAlchemy database models.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    uid = Column(String(36), unique=True, nullable=False, server_default=func.uuid())
    user = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False, comment="Argon2id hash")
    last_access = Column(TIMESTAMP, nullable=True)
    last_modified = Column(TIMESTAMP, nullable=True, onupdate=func.current_timestamp())
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.current_timestamp())
    
    # Relationships
    files = relationship("File", back_populates="user", cascade="all, delete-orphan")
    responses = relationship("Response", back_populates="user", cascade="all, delete-orphan")


class File(Base):
    """File model"""
    __tablename__ = "files"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    uid = Column(String(36), unique=True, nullable=False, server_default=func.uuid())
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    absolute_path = Column(String(500), nullable=False)
    url = Column(String(500), nullable=True)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="files")
    
    # Indexes
    __table_args__ = (
        Index("idx_user_id", "user_id"),
    )


class Response(Base):
    """Response model"""
    __tablename__ = "responses"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    uid = Column(String(36), unique=True, nullable=False, server_default=func.uuid())
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.current_timestamp())
    
    # Relationships
    user = relationship("User", back_populates="responses")
    
    # Indexes
    __table_args__ = (
        Index("idx_user_id", "user_id"),
        Index("idx_created_at", "created_at"),
    )
