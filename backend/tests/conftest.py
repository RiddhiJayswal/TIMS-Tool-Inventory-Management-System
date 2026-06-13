import os

# Set minimal env vars so app.config loads without a real DB during unit tests
os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/test_db")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-unit-tests-only")
