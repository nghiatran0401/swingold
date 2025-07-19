from fastapi import APIRouter, Depends, HTTPException, status
from services.database import get_db 
import services.models as models
from routers.auth import get_current_user
from datetime import datetime

router = APIRouter(
    prefix="/events",
    tags=["events"],
    responses={404: {"description": "Not found"}},
)

"""Get all events"""
@router.get("/")
def read_events(db: Session = Depends(get_db)):
    events = db.query(models.Event).all()
    return events

"""Create a new event, function for admin"""
@router.post("/")
def create_event(event, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        db_event = models.Event(**event.model_dump())
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        return db_event
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create event: {str(e)}"
        )

"""Update an existing event, function for admin"""
@router.put("/{event_id}")
def update_event(event_id: int, event_update, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if db_event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Event not found"
        )
    try:
        update_data = event_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_event, key, value)
        db.commit()
        db.refresh(db_event)
        return db_event
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update event: {str(e)}"
        )

"""Delete an event, function for admin"""
@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if db_event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Event not found"
        )
    try:
        db.delete(db_event)
        db.commit()
        return {"message": "Event deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete event: {str(e)}"
        )

"""Get list of available months for filtering"""
@router.get("/months/list")
def get_available_months(db: Session = Depends(get_db)):
    events = db.query(models.Event).all()
    months = set()
    for event in events:
        dt = event.date
        if isinstance(dt, datetime):
            month_str = dt.strftime('%Y-%m')
        elif isinstance(dt, str):
            try:
                month_str = datetime.fromisoformat(dt).strftime('%Y-%m')
            except Exception:
                continue
        else:
            continue
        months.add(month_str)
    return sorted(list(months))