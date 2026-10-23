import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app
from app.db.session import Base, engine, SessionLocal
from app.services.data_service import DataService
from app.services.ml_service import MLService

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        DataService.ensure_default_data_seeded(db)
        if not MLService.get_active_model():
            MLService.train_models(db)
    finally:
        db.close()
    yield

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture
def db():
    database = SessionLocal()
    try:
        yield database
    finally:
        database.close()
