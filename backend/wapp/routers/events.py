from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from services.database import get_db
import services.models as models
import services.schemas as schemas
from fastapi import Header

router = APIRouter(
    prefix="/events",
    tags=["events"],
    responses={404: {"description": "Not found"}},
)

@router.get("", response_model=list[schemas.EventOut])
def read_events(db: Session = Depends(get_db)):
    return db.query(models.Event).all()


@router.post("", response_model=schemas.EventOut)
def create_event(
    event: schemas.EventCreate,
    db: Session = Depends(get_db),
    x_user_id: str = Header(None, alias="X-User-Id")
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        db_event = models.Event(**event.dict())
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        return db_event
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create event: {str(e)}"
        )



@router.put("/{event_id}", response_model=schemas.EventOut)
def update_event(
    event_id: int,
    event_update: schemas.EventUpdate,
    db: Session = Depends(get_db),
    x_user_id: str = Header(None, alias="X-User-Id")
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    try:
        update_data = event_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_event, key, value)
        db.commit()
        db.refresh(db_event)
        return db_event
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update event: {str(e)}"
        )

@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    x_user_id: str = Header(None, alias="X-User-Id")
):
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    try:
        db.delete(db_event)
        db.commit()
        return {"message": "Event deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete event: {str(e)}"
        )



@router.get("/months/list", response_model=list[str])
def get_available_months(db: Session = Depends(get_db)):
    events = db.query(models.Event).all()
    months = set()
    for event in events:
        dt = event.start_datetime
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
