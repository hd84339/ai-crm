from pydantic import BaseModel
from typing import Optional

class InteractionCreate(BaseModel):
    doctor_name: str
    notes: str
    sentiment: Optional[str] = None
    follow_up: Optional[str] = None

class InteractionUpdate(BaseModel):
    doctor_name: Optional[str] = None
    notes: Optional[str] = None
    sentiment: Optional[str] = None
    follow_up: Optional[str] = None