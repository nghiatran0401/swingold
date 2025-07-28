import pytest
from fastapi.testclient import TestClient
from datetime import datetime

def test_get_events(client, sample_event):
    response = client.get("/api/v1/events/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Event"
    assert data[0]["category"] == "Test"

def test_get_event_by_id(client, sample_event):
    response = client.get(f"/api/v1/events/{sample_event.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Event"
    assert data["id"] == sample_event.id

def test_get_available_months(client, sample_event):
    response = client.get("/api/v1/events/months/list")
    assert response.status_code == 200
    data = response.json()
    assert "2025-12" in data

def test_create_event_as_admin(client, admin_user):
    event_data = {
        "name": "New Event",
        "description": "New Event Description",
        "category": "Tech",
        "start_datetime": "2025-12-15T14:00:00",
        "end_datetime": "2025-12-15T16:00:00",
        "price": 0,
        "location": "Online",
        "seats_available": 50
    }
    response = client.post("/api/v1/events/",
                          json=event_data,
                          headers={"X-User-Id": str(admin_user.id)})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "New Event"
    assert data["category"] == "Tech"

def test_create_event_as_non_admin(client, sample_user):
    event_data = {
        "name": "New Event",
        "start_datetime": "2025-12-15T14:00:00"
    }
    response = client.post("/api/v1/events/",
                          json=event_data,
                          headers={"X-User-Id": str(sample_user.id)})
    assert response.status_code == 403

def test_update_event_as_admin(client, sample_event, admin_user):
    update_data = {
        "name": "Updated Event",
        "category": "Updated Category"
    }
    response = client.put(f"/api/v1/events/{sample_event.id}",
                         json=update_data,
                         headers={"X-User-Id": str(admin_user.id)})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Event"
    assert data["category"] == "Updated Category"

def test_delete_event_as_admin(client, sample_event, admin_user):
    response = client.delete(f"/api/v1/events/{sample_event.id}",
                           headers={"X-User-Id": str(admin_user.id)})
    assert response.status_code == 200
    
    response = client.get(f"/api/v1/events/{sample_event.id}")
    assert response.status_code == 404
