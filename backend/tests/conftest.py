import os
import uuid
from datetime import date, timedelta

# Must happen BEFORE any app imports so app.config reads the right values
os.environ.setdefault("DATABASE_URL", "postgresql://tims_user:tims_pass@localhost:5432/tims_test")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-unit-tests-only")
os.environ.setdefault("TIMS_DISABLE_SCHEDULER", "1")

import pytest

# Integration test infrastructure.
# Wrapped in try/except so that unit tests (test_services.py) still run
# even when the PostgreSQL test database is not available.
try:
    from fastapi.testclient import TestClient
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    from app.main import app
    from app.database import Base, get_db
    from app.models.master import StorageBin, Tool
    from app.models.transaction import User
    from app.auth.roles import hash_password

    _DB_URL = os.environ["DATABASE_URL"]
    _engine = create_engine(_DB_URL, pool_pre_ping=True)
    _TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
    _INTEGRATION_READY = True
    _INTEGRATION_ERROR = ""
except Exception as _exc:
    _INTEGRATION_READY = False
    _INTEGRATION_ERROR = str(_exc)


# ─── Session fixtures (run once per pytest session) ──────────────────────────

@pytest.fixture(scope="session")
def setup_test_db():
    """Create all tables in the test database once per session."""
    if not _INTEGRATION_READY:
        pytest.skip(f"Test DB not available: {_INTEGRATION_ERROR}")
    Base.metadata.create_all(bind=_engine)
    _seed_test_users()
    yield
    # Uncomment to tear down after the full test session:
    # Base.metadata.drop_all(bind=_engine)


def _seed_test_users():
    """Insert the 5 canonical test users (idempotent)."""
    session = _TestingSessionLocal()
    try:
        users = [
            ("ADM001", "Admin User",      "admin@tims.test",  "Admin@123", "maintenance_admin", "Maintenance"),
            ("STF001", "Staff User",       "staff@tims.test",  "Staff@123", "maintenance_staff", "Maintenance"),
            ("HD001",  "Head EI",          "head@tims.test",   "Head@123",  "dept_head",          "E&I"),
            ("USR001", "Requester User",   "user@tims.test",   "User@123",  "requester",          "E&I"),
            ("HD002",  "Head Mech",        "head2@tims.test",  "Head2@123", "dept_head",          "Mechanical"),
        ]
        for emp_id, name, email, pwd, role, dept in users:
            if not session.query(User).filter(User.employee_id == emp_id).first():
                session.add(User(
                    employee_id=emp_id,
                    full_name=name,
                    email=email,
                    hashed_password=hash_password(pwd),
                    role=role,
                    department=dept,
                ))
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


# ─── Function fixtures (one per test) ─────────────────────────────────────────

@pytest.fixture
def db(setup_test_db):
    """Provide a SQLAlchemy session for a single test. Rolls back uncommitted work."""
    session = _TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def client(db):
    """Provide a FastAPI TestClient with the test DB session overriding get_db."""
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
    app.dependency_overrides.clear()
