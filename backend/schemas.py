from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class HCPCreate(BaseModel):
    name: str
    specialty: Optional[str] = None
    location: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class HCPSchema(HCPCreate):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

class InteractionCreate(BaseModel):
    hcp_id: Optional[int] = None
    doctor_name: Optional[str] = None # For legacy support or easy creation
    type: Optional[str] = None
    notes: str
    summary: Optional[str] = None
    sentiment: Optional[str] = None
    engagement: Optional[str] = None
    follow_up: Optional[str] = None # Legacy support

class InteractionUpdate(BaseModel):
    type: Optional[str] = None
    notes: Optional[str] = None
    summary: Optional[str] = None
    sentiment: Optional[str] = None
    engagement: Optional[str] = None

class FollowUpCreate(BaseModel):
    interaction_id: Optional[int] = None
    hcp_id: int
    task: str
    due_date: Optional[datetime] = None
    status: Optional[str] = "Pending"

class FollowUpUpdate(BaseModel):
    task: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None