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

@app.get("/interactions")
def get_all_interactions(page: int = 1, limit: int = 20, sentiment: str = None, engagement: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Interaction)
    
    if sentiment:
        query = query.filter(models.Interaction.sentiment.ilike(sentiment))
    if engagement:
        query = query.filter(models.Interaction.engagement.ilike(engagement))
        
    total = query.count()
    interactions = query.order_by(models.Interaction.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    
    result = []
    for int_obj in interactions:
        hcp = db.query(models.HCP).filter(models.HCP.id == int_obj.hcp_id).first()
        result.append({
            "id": int_obj.id,
            "doctor_name": hcp.name if hcp else "Unknown",
            "type": int_obj.type,
            "notes": int_obj.notes,
            "sentiment": int_obj.sentiment,
            "engagement": int_obj.engagement,
            "created_at": int_obj.created_at
        })
        
    return {
        "success": True,
        "data": result,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit
        }
    }

@app.get("/interactions/{interaction_id}")
def get_interaction(interaction_id: int, db: Session = Depends(get_db)):
    interaction = db.query(models.Interaction).filter(
        models.Interaction.id == interaction_id
    ).first()

    if not interaction:
        return {"success": False, "message": "Interaction not found"}

    hcp = db.query(models.HCP).filter(models.HCP.id == interaction.hcp_id).first()
    return {
        "success": True,
        "data": {
            "id": interaction.id,
            "doctor_name": hcp.name if hcp else "Unknown",
            "type": interaction.type,
            "notes": interaction.notes,
            "sentiment": interaction.sentiment,
            "engagement": interaction.engagement,
            "created_at": interaction.created_at
        }
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

@app.delete("/interactions")
def delete_interactions(data: schemas.BulkDelete, db: Session = Depends(get_db)):
    if not data.ids:
        return {"success": False, "message": "No IDs provided"}
    db.query(models.Interaction).filter(models.Interaction.id.in_(data.ids)).delete(synchronize_session=False)
    db.commit()
    return {"success": True, "message": f"{len(data.ids)} interactions deleted successfully ✅"}

@app.get("/analytics/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_hcps = db.query(models.HCP).count()
    total_interactions = db.query(models.Interaction).count()
    follow_ups_due = db.query(models.FollowUp).filter(models.FollowUp.status != "Completed").count()
    
    positive_interactions = db.query(models.Interaction).filter(models.Interaction.sentiment.ilike("Positive")).count()
    
    positive_sentiment_percent = 0
    if total_interactions > 0:
        positive_sentiment_percent = round((positive_interactions / total_interactions) * 100)

    return {
        "total_hcps": total_hcps,
        "total_interactions": total_interactions,
        "follow_ups_due": follow_ups_due,
        "positive_sentiment_percent": positive_sentiment_percent
    }

# -------------------------
# HCP ENDPOINTS
# -------------------------
@app.get("/hcps")
def get_hcps(search: str = None, page: int = 1, limit: int = 20, db: Session = Depends(get_db)):
    query = db.query(models.HCP)
    if search:
        query = query.filter(models.HCP.name.ilike(f"%{search}%") | models.HCP.specialty.ilike(f"%{search}%"))
    
    total = query.count()
    hcps = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "success": True,
        "data": hcps,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit
        }
    }

@app.post("/hcps")
def create_hcp(data: schemas.HCPCreate, db: Session = Depends(get_db)):
    new_hcp = models.HCP(
        name=data.name,
        specialty=data.specialty,
        location=data.location,
        email=data.email,
        phone=data.phone
    )
    db.add(new_hcp)
    db.commit()
    db.refresh(new_hcp)
    
    return {
        "success": True,
        "message": "HCP created successfully ✅",
        "data": new_hcp
    }

@app.get("/hcps/{hcp_id}")
def get_hcp(hcp_id: int, db: Session = Depends(get_db)):
    hcp = db.query(models.HCP).filter(models.HCP.id == hcp_id).first()
    if not hcp:
        return {"success": False, "message": "HCP not found"}
    
    interactions = db.query(models.Interaction).filter(models.Interaction.hcp_id == hcp_id).order_by(models.Interaction.created_at.desc()).all()
    
    return {
        "success": True,
        "data": {
            "hcp": hcp,
            "interactions": interactions
        }
    }

@app.put("/hcps/{hcp_id}")
def update_hcp(hcp_id: int, data: schemas.HCPUpdate, db: Session = Depends(get_db)):
    hcp = db.query(models.HCP).filter(models.HCP.id == hcp_id).first()
    if not hcp:
        return {"success": False, "message": "HCP not found"}
    
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(hcp, key, value)
        
    db.commit()
    db.refresh(hcp)
    
    return {
        "success": True,
        "message": "HCP updated successfully ✅",
        "data": hcp
    }

@app.delete("/hcps/{hcp_id}")
def delete_hcp(hcp_id: int, db: Session = Depends(get_db)):
    hcp = db.query(models.HCP).filter(models.HCP.id == hcp_id).first()
    if not hcp:
        return {"success": False, "message": "HCP not found"}
    
    db.delete(hcp)
    db.commit()
    
    return {
        "success": True,
        "message": "HCP deleted successfully ✅"
    }

# -------------------------
# FOLLOW-UP ENDPOINTS
# -------------------------
@app.get("/followups")
def get_followups(status: str = None, db: Session = Depends(get_db)):
    query = db.query(models.FollowUp)
    if status:
        query = query.filter(models.FollowUp.status.ilike(status))
    
    followups = query.order_by(models.FollowUp.due_date.asc()).all()
    
    # attach HCP details
    result = []
    for fu in followups:
        hcp = db.query(models.HCP).filter(models.HCP.id == fu.hcp_id).first()
        result.append({
            "id": fu.id,
            "hcp_id": fu.hcp_id,
            "doctor_name": hcp.name if hcp else "Unknown",
            "task": fu.task,
            "due_date": fu.due_date,
            "status": fu.status,
            "created_at": fu.created_at
        })
        
    return {
        "success": True,
        "data": result
    }

@app.put("/followups/{followup_id}")
def update_followup(
    followup_id: int,
    data: schemas.FollowUpUpdate,
    db: Session = Depends(get_db)
):
    followup = db.query(models.FollowUp).filter(models.FollowUp.id == followup_id).first()
    if not followup:
        return {"success": False, "error": "Follow-up not found ❌"}

    if data.task is not None:
        followup.task = data.task
    if data.status is not None:
        followup.status = data.status
        if data.status.lower() == "completed":
            followup.completed_at = datetime.utcnow()
        else:
            followup.completed_at = None
    if data.due_date is not None:
        followup.due_date = data.due_date

    db.commit()
    db.refresh(followup)
    
    return {
        "success": True,
        "message": "Follow-up updated successfully ✅",
        "data": followup
    }

@app.delete("/followups/{followup_id}")
def delete_followup(
    followup_id: int,
    db: Session = Depends(get_db)
):
    followup = db.query(models.FollowUp).filter(models.FollowUp.id == followup_id).first()
    if not followup:
        return {"success": False, "error": "Follow-up not found ❌"}

    db.delete(followup)
    db.commit()
    
    return {
        "success": True,
        "message": "Follow-up deleted successfully ✅"
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