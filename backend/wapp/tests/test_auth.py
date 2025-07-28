import pytest
from fastapi.testclient import TestClient

def test_login_success(client, sample_user):
    response = client.post("/api/v1/login", json={
        "username": "testuser",
        "password": "testpass"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "password_hash" not in data

def test_login_invalid_credentials(client, sample_user):
    response = client.post("/api/v1/login", json={
        "username": "testuser",
        "password": "wrongpass"
    })
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]

def test_login_nonexistent_user(client):
    response = client.post("/api/v1/login", json={
        "username": "nonexistent",
        "password": "password"
    })
    assert response.status_code == 404
    assert "User not found" in response.json()["detail"]

def test_login_missing_fields(client):
    response = client.post("/api/v1/login", json={
        "username": "testuser"
    })
    assert response.status_code == 422
