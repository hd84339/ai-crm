from database import SessionLocal
from datetime import datetime, timedelta
import models

def log_interaction_tool(data: dict):
    db = SessionLocal()

    doctor_name = data.get("doctor_name")
    if not doctor_name:
        db.close()
        return {"status": "error", "message": "doctor_name required"}

    hcp = db.query(models.HCP).filter(models.HCP.name == doctor_name).first()
    if not hcp:
        hcp = models.HCP(name=doctor_name)
        db.add(hcp)
        db.commit()
        db.refresh(hcp)

    interaction = models.Interaction(
        hcp_id=hcp.id,
        notes=data.get("notes"),
        sentiment=data.get("sentiment")
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    
    follow_up = data.get("follow_up")
    if follow_up:
        fu = models.FollowUp(
            interaction_id=interaction.id,
            hcp_id=hcp.id,
            task=follow_up,
            due_date=datetime.utcnow() + timedelta(days=7)
        )
        db.add(fu)
        db.commit()

    db.close()
    return {
        "status": "saved",
        "id": interaction.id
    }


def edit_interaction_tool(interaction_id: int, updates: dict):
    db = SessionLocal()

    interaction = db.query(models.Interaction).filter(
        models.Interaction.id == interaction_id
    ).first()

    if not interaction:
        db.close()
        return {"status": "not_found"}

    for k, v in updates.items():
        if hasattr(interaction, k):
            setattr(interaction, k, v)

    db.commit()
    db.refresh(interaction)
    db.close()

    return {
        "status": "updated",
        "id": interaction.id
    }


def fetch_interactions_tool():
    db = SessionLocal()
    data = db.query(models.Interaction).all()
    result = []
    for int_obj in data:
        hcp = db.query(models.HCP).filter(models.HCP.id == int_obj.hcp_id).first()
        result.append({
            "id": int_obj.id,
            "doctor_name": hcp.name if hcp else "Unknown",
            "notes": int_obj.notes,
            "sentiment": int_obj.sentiment,
            "created_at": int_obj.created_at.isoformat() if int_obj.created_at else None
        })
    db.close()
    return result