from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class HCP(Base):
    __tablename__ = "hcps"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    specialty = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    interactions = relationship("Interaction", back_populates="hcp", cascade="all, delete-orphan")
    follow_ups = relationship("FollowUp", back_populates="hcp", cascade="all, delete-orphan")

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_id = Column(Integer, ForeignKey("hcps.id"), nullable=False)
    type = Column(String(100), nullable=True) # e.g., "Product Discussion", "Meeting"
    notes = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    sentiment = Column(String(50), nullable=True) # "Positive", "Neutral", "Negative"
    engagement = Column(String(50), nullable=True) # "High", "Medium", "Low"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    hcp = relationship("HCP", back_populates="interactions")
    topics = relationship("InteractionTopic", back_populates="interaction", cascade="all, delete-orphan")
    follow_ups = relationship("FollowUp", back_populates="interaction")

class InteractionTopic(Base):
    __tablename__ = "interaction_topics"

    id = Column(Integer, primary_key=True, index=True)
    interaction_id = Column(Integer, ForeignKey("interactions.id"), nullable=False)
    topic = Column(String(255), nullable=False)

    # Relationships
    interaction = relationship("Interaction", back_populates="topics")

class FollowUp(Base):
    __tablename__ = "follow_ups"

    id = Column(Integer, primary_key=True, index=True)
    interaction_id = Column(Integer, ForeignKey("interactions.id"), nullable=True)
    hcp_id = Column(Integer, ForeignKey("hcps.id"), nullable=False)
    task = Column(String(255), nullable=False)
    due_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="Pending") # "Pending", "Completed", "Overdue"
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    hcp = relationship("HCP", back_populates="follow_ups")
    interaction = relationship("Interaction", back_populates="follow_ups")