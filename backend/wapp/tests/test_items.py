import pytest
from fastapi.testclient import TestClient

def test_get_items(client, sample_item):
    response = client.get("/api/v1/items/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Item"
    assert data[0]["price"] == 100.0

def test_get_item_by_id(client, sample_item):
    response = client.get(f"/api/v1/items/{sample_item.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Item"
    assert data["id"] == sample_item.id

def test_get_nonexistent_item(client):
    response = client.get("/api/v1/items/999")
    assert response.status_code == 404

def test_create_item_as_admin(client, admin_user):
    item_data = {
        "name": "New Item",
        "description": "New Description",
        "price": 200.0,
        "image_url": "new.jpg",
        "tags": "new,item",
        "status": "active"
    }
    response = client.post("/api/v1/items/", 
                          json=item_data,
                          headers={"X-User-Id": str(admin_user.id)})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "New Item"
    assert data["price"] == 200.0

def test_create_item_as_non_admin(client, sample_user):
    item_data = {
        "name": "New Item",
        "description": "New Description",
        "price": 200.0
    }
    response = client.post("/api/v1/items/", 
                          json=item_data,
                          headers={"X-User-Id": str(sample_user.id)})
    assert response.status_code == 403

def test_update_item_as_admin(client, sample_item, admin_user):
    update_data = {
        "name": "Updated Item",
        "price": 150.0
    }
    response = client.put(f"/api/v1/items/{sample_item.id}",
                         json=update_data,
                         headers={"X-User-Id": str(admin_user.id)})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Item"
    assert data["price"] == 150.0

def test_delete_item_as_admin(client, sample_item, admin_user):
    response = client.delete(f"/api/v1/items/{sample_item.id}",
                           headers={"X-User-Id": str(admin_user.id)})
    assert response.status_code == 200
    
    response = client.get(f"/api/v1/items/{sample_item.id}")
    assert response.status_code == 404
