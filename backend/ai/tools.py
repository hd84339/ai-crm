from database import SessionLocal
from datetime import datetime, timedelta
import models

def normalize_hcp_name(name: str):
    if not name:
        return ""
    name = name.strip()
    name = name.replace("  ", " ")
    name = name.replace("Dr. ", "").replace("dr. ", "")
    name = name.replace(" ", " ")
    return name.lower()

def log_interaction_tool(data: dict):
    db = SessionLocal()

    doctor_name = data.get("doctor_name")
    if not doctor_name:
        db.close()
        return {"status": "error", "message": "doctor_name required"}

    normalized = normalize_hcp_name(doctor_name)
    hcps = db.query(models.HCP).all()
    hcp = next((h for h in hcps if normalize_hcp_name(h.name) == normalized), None)

    if not hcp:
        hcp = models.HCP(name=doctor_name)
        db.add(hcp)
        db.commit()
        db.refresh(hcp)

    interaction = models.Interaction(
        hcp_id=hcp.id,
        notes=data.get("notes"),
        sentiment=data.get("sentiment"),
        type=data.get("type"),
        summary=data.get("summary"),
        engagement=data.get("engagement")
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


def fetch_interactions_tool(filters: dict = None):
    db = SessionLocal()
    query = db.query(models.Interaction)
    
    if filters:
        doctor_name = filters.get("doctor_name")
        if doctor_name:
            normalized = normalize_hcp_name(doctor_name)
            # Find HCP IDs that match
            hcps = db.query(models.HCP).all()
            matching_hcp_ids = [h.id for h in hcps if normalize_hcp_name(h.name) == normalized or normalized in normalize_hcp_name(h.name)]
            if matching_hcp_ids:
                query = query.filter(models.Interaction.hcp_id.in_(matching_hcp_ids))
            else:
                # No matching doctor found
                db.close()
                return []
                
        sentiment = filters.get("sentiment")
        if sentiment:
            query = query.filter(models.Interaction.sentiment.ilike(sentiment))
            
        engagement = filters.get("engagement_level")
        if engagement:
            query = query.filter(models.Interaction.engagement.ilike(engagement))
            
        interaction_type = filters.get("interaction_type")
        if interaction_type:
            query = query.filter(models.Interaction.type.ilike(interaction_type))

    data = query.all()
    result = []
    for int_obj in data:
        hcp = db.query(models.HCP).filter(models.HCP.id == int_obj.hcp_id).first()
        result.append({
            "id": int_obj.id,
            "doctor_name": hcp.name if hcp else "Unknown",
            "notes": int_obj.notes,
            "sentiment": int_obj.sentiment,
            "engagement": int_obj.engagement,
            "created_at": int_obj.created_at.isoformat() if int_obj.created_at else None
        })
    db.close()
    return result

def delete_interaction_tool(interaction_id: int):
    db = SessionLocal()
    interaction = db.query(models.Interaction).filter(models.Interaction.id == interaction_id).first()
    if not interaction:
        db.close()
        return {"status": "error", "message": f"Interaction {interaction_id} not found."}
        
    db.delete(interaction)
    db.commit()
    db.close()
    return {"status": "deleted", "message": f"Interaction {interaction_id} deleted successfully."}