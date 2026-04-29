from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database import Base

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    doctor_name = Column(String(255))
    notes = Column(Text)
    sentiment = Column(String(50))
    follow_up = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)