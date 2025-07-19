from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.database import get_db
import services.models as models

router = APIRouter()

@router.post("/login")
def get_current_user(user, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or user.password != db_user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return db_user 