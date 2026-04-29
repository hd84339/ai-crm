from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import get_db, engine, Base
import models
import schemas
from ai.agent import test_llm

app = FastAPI()

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
    new_interaction = models.Interaction(
        doctor_name=data.doctor_name,
        notes=data.notes,
        sentiment=data.sentiment,
        follow_up=data.follow_up
    )

    db.add(new_interaction)
    db.commit()
    db.refresh(new_interaction)

    return {
        "message": "Interaction saved successfully ✅",
        "data": {
            "id": new_interaction.id,
            "doctor_name": new_interaction.doctor_name
        }
    }

@app.get("/interaction/list")
def get_all_interactions(db: Session = Depends(get_db)):
    interactions = db.query(models.Interaction).all()

    return interactions

@app.get("/interaction/{interaction_id}")
def get_interaction(interaction_id: int, db: Session = Depends(get_db)):
    interaction = db.query(models.Interaction).filter(
        models.Interaction.id == interaction_id
    ).first()

    if not interaction:
        return {"error": "Interaction not found ❌"}

    return interaction

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

    # Update only provided fields
    if data.doctor_name:
        interaction.doctor_name = data.doctor_name
    if data.notes:
        interaction.notes = data.notes
    if data.sentiment:
        interaction.sentiment = data.sentiment
    if data.follow_up:
        interaction.follow_up = data.follow_up

    db.commit()
    db.refresh(interaction)

    return {
        "message": "Interaction updated successfully ✅",
        "data": interaction
    }



