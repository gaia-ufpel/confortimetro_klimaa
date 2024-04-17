from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_devices():
    response = client.get("/devices/")
    assert response.status_code == 401