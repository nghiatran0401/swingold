from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from services.database import get_db 
import services.models as models
import services.schemas as schemas 
from routers.auth import get_current_user
from datetime import datetime

router = APIRouter(
    prefix="/events",
    tags=["events"],
    responses={404: {"description": "Not found"}},
)

# 1. Get All events

@router.get("/", response_model=List[schemas.EventResponse])
def read_events(
    skip: int = Query(0, ge=0, description="Number of events to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of events to return"),
    month: Optional[str] = Query(None, description="Filter by month (YYYY-MM)"),
    search: Optional[str] = Query(None, description="Search term for name or description"),
    db: Session = Depends(get_db)
):
    """Get all events with optional filtering and pagination"""
    query = db.query(models.Event)
    
    if month and month.lower() != "all":
        # Filter by month extracted from start_datetime
        query = query.filter(models.Event.date.startswith(month))
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            models.Event.name.ilike(search_term) | 
            models.Event.description.ilike(search_term)
        )
    
    events = query.offset(skip).limit(limit).all()
    # Convert date to string for Pydantic
    def event_to_dict(event):
        d = event.__dict__.copy()
        for field in ['date', 'end_date', 'created_at', 'updated_at']:
            if field in d and d[field]:
                if isinstance(d[field], datetime):
                    d[field] = d[field].isoformat()
        img = d.get('image')
        if img:
            if img.startswith('http') or img.startswith('/'):  # already valid
                d['image'] = img
            elif img.startswith('./'):
                d['image'] = img.replace('./', '/images/') if not img.startswith('./images/') else img.replace('./', '/')
            else:
                d['image'] = f'/images/{img}'
        return d
    return [event_to_dict(e) for e in events]

# 2. Get single events based on id

@router.get("/{event_id}", response_model=schemas.EventResponse)
def read_event(event_id: int, db: Session = Depends(get_db)):
    """Get a specific event by ID"""
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if db_event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Event not found"
        )
    d = db_event.__dict__.copy()
    if isinstance(d['date'], datetime):
        d['date'] = d['date'].strftime('%Y-%m-%d %H:%M:%S')
    return d

# 3. Create events for admin

@router.post("/", response_model=schemas.EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
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

# 4. Update event information for admin

@router.put("/{event_id}", response_model=schemas.EventResponse)
def update_event(event_id: int, event_update: schemas.EventUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
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

# 5. Delete event (admin)

@router.delete("/{event_id}", response_model=schemas.MessageResponse)
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

# 6. Update events' enrolment status

@router.patch("/{event_id}/enroll", response_model=schemas.EventResponse)
def toggle_enrollment(event_id: int, db: Session = Depends(get_db)):
    """Toggle enrollment status of an event"""
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if db_event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Event not found"
        )
    
    try:
        db_event.enroll = not db_event.enroll
        db.commit()
        db.refresh(db_event)
        return db_event
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to toggle enrollment: {str(e)}"
        )

# 7. Get months for filtering

@router.get("/months/list", response_model=List[str])
def get_available_months(db: Session = Depends(get_db)):
    """Get list of available months for filtering (YYYY-MM)"""
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