import pytest
from fastapi.testclient import TestClient

def test_get_user_statistics(client, sample_user, sample_transaction):
    response = client.get(f"/api/v1/statistics/user/{sample_user.id}")
    assert response.status_code == 200
    data = response.json()
    assert "total_spent" in data
    assert "total_earned" in data
    assert "spending_breakdown" in data
    assert "spending_percentage" in data
    assert data["total_spent"] == 100.0
    assert data["total_earned"] == 0.0

def test_get_statistics_nonexistent_user(client):
    response = client.get("/api/v1/statistics/user/999")
    assert response.status_code == 404
    assert "User not found" in response.json()["detail"]
