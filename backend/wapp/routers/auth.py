from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from services.database import get_db
import services.models as models
import services.schemas as schemas

router = APIRouter()

@router.post("/login", response_model=schemas.UserResponse)
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or user.password != db_user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return db_user 

def get_current_user(user_id: int = Header(..., alias="X-User-Id"), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")
    return user 