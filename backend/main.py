from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import get_db, engine, Base
import models
import schemas
from ai.agent import test_llm
from ai.graph import app_graph
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import os

app = FastAPI()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],  # Configurable frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # allows POST, GET, OPTIONS etc
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {"message": "AI CRM Backend Running 🚀"}

@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    return {"message": "DB Connected Successfully ✅"}

@app.get("/ai/test")
def ai_test():
    return {"response": test_llm()}

# 🔥 CREATE INTERACTION API
@app.post("/interaction/log")
def log_interaction(data: schemas.InteractionCreate, db: Session = Depends(get_db)):
    hcp_id = data.hcp_id
    
    if not hcp_id and data.doctor_name:
        hcp = db.query(models.HCP).filter(models.HCP.name == data.doctor_name).first()
        if not hcp:
            hcp = models.HCP(name=data.doctor_name)
            db.add(hcp)
            db.commit()
            db.refresh(hcp)
        hcp_id = hcp.id
        
    if not hcp_id:
        return {"error": "hcp_id or doctor_name is required"}

    new_interaction = models.Interaction(
        hcp_id=hcp_id,
        type=data.type,
        notes=data.notes,
        summary=data.summary,
        sentiment=data.sentiment,
        engagement=data.engagement
    )

    db.add(new_interaction)
    db.commit()
    db.refresh(new_interaction)
    
    if data.follow_up:
        follow_up = models.FollowUp(
            interaction_id=new_interaction.id,
            hcp_id=hcp_id,
            task=data.follow_up,
            due_date=datetime.utcnow() + timedelta(days=7) # Default to 7 days for legacy
        )
        db.add(follow_up)
        db.commit()

    return {
        "message": "Interaction saved successfully ✅",
        "data": {
            "id": new_interaction.id,
            "hcp_id": new_interaction.hcp_id
        }
    }

@app.get("/interaction/list")
def get_all_interactions(db: Session = Depends(get_db)):
    interactions = db.query(models.Interaction).all()
    # For compatibility, we can add doctor_name and follow_up back to response
    result = []
    for int_obj in interactions:
        hcp = db.query(models.HCP).filter(models.HCP.id == int_obj.hcp_id).first()
        result.append({
            "id": int_obj.id,
            "doctor_name": hcp.name if hcp else "Unknown",
            "notes": int_obj.notes,
            "sentiment": int_obj.sentiment,
            "follow_up": "Follow-up tasks exist" if int_obj.follow_ups else None,
            "created_at": int_obj.created_at
        })
    return result

@app.get("/interaction/{interaction_id}")
def get_interaction(interaction_id: int, db: Session = Depends(get_db)):
    interaction = db.query(models.Interaction).filter(
        models.Interaction.id == interaction_id
    ).first()

    if not interaction:
        return {"error": "Interaction not found ❌"}

    hcp = db.query(models.HCP).filter(models.HCP.id == interaction.hcp_id).first()
    return {
        "id": interaction.id,
        "doctor_name": hcp.name if hcp else "Unknown",
        "notes": interaction.notes,
        "sentiment": interaction.sentiment,
        "created_at": interaction.created_at
    }

@app.put("/interaction/edit/{interaction_id}")
def edit_interaction(
    interaction_id: int,
    data: schemas.InteractionUpdate,
    db: Session = Depends(get_db)
):
    interaction = db.query(models.Interaction).filter(
        models.Interaction.id == interaction_id
    ).first()

    if not interaction:
        return {"error": "Interaction not found ❌"}

    if data.notes:
        interaction.notes = data.notes
    if data.sentiment:
        interaction.sentiment = data.sentiment
    if data.type:
        interaction.type = data.type
    if data.engagement:
        interaction.engagement = data.engagement
    if data.summary:
        interaction.summary = data.summary

    db.commit()
    db.refresh(interaction)

    return {
        "message": "Interaction updated successfully ✅",
        "data": {
            "id": interaction.id
        }
    }

# -------------------------
# AI AGENT ENDPOINT
# -------------------------
@app.post("/ai/agent")
def run_agent(payload: dict):
    result = app_graph.invoke({
        "input": payload["input"]
    })

    return result