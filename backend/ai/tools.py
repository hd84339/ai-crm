from database import SessionLocal
import models


def log_interaction_tool(data: dict):
    db = SessionLocal()

    interaction = models.Interaction(
        doctor_name=data.get("doctor_name"),
        notes=data.get("notes"),
        sentiment=data.get("sentiment"),
        follow_up=data.get("follow_up")
    )

    db.add(interaction)
    db.commit()
    db.refresh(interaction)
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
    db.close()
    return data