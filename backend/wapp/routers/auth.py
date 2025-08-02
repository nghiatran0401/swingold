from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.database import get_db
import services.models as models
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def get_current_user(user: LoginRequest, db: Session = Depends(get_db)):
    if not user.username or not user.password:
        raise HTTPException(status_code=422, detail="Username and password are required")
    
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.password != db_user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "id": db_user.id, 
        "username": db_user.username, 
        "email": db_user.email,
        "is_admin": db_user.is_admin, 
        "wallet_address": db_user.wallet_address
    }