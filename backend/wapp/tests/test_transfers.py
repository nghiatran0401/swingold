import pytest
from fastapi.testclient import TestClient

def test_send_gold(client, sample_user, admin_user):
    transfer_data = {
        "recipient_address": admin_user.wallet_address,
        "amount": 50.0,
        "tx_hash": "0xtransfer123"
    }
    response = client.post("/api/v1/transfers/send",
                          json=transfer_data,
                          headers={"X-User-Id": str(sample_user.id)})
    assert response.status_code == 200
    data = response.json()
    assert "Gold transfer successful" in data["message"]
    assert data["amount"] == 50.0

def test_send_gold_to_self(client, sample_user):
    transfer_data = {
        "recipient_address": sample_user.wallet_address,
        "amount": 50.0,
        "tx_hash": "0xtransfer123"
    }
    response = client.post("/api/v1/transfers/send",
                          json=transfer_data,
                          headers={"X-User-Id": str(sample_user.id)})
    assert response.status_code == 400
    assert "Cannot send gold to yourself" in response.json()["detail"]

def test_send_gold_nonexistent_recipient(client, sample_user):
    transfer_data = {
        "recipient_address": "0xnonexistent",
        "amount": 50.0,
        "tx_hash": "0xtransfer123"
    }
    response = client.post("/api/v1/transfers/send",
                          json=transfer_data,
                          headers={"X-User-Id": str(sample_user.id)})
    assert response.status_code == 404
    assert "Recipient not found" in response.json()["detail"]

def test_get_transfer_history(client, sample_user):
    response = client.get(f"/api/v1/transfers/history/{sample_user.id}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
