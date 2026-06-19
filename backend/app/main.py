import warnings
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.scheduler import start_scheduler, stop_scheduler
from app.routers import auth, tools, storage_bins, requisitions, issuance, returns
from app.routers import damage, calibration, reports, dashboard, users

_WEAK_KEYS = {
    "supersecretkey-change-this-in-production-minimum-32-chars",
    "CHANGE_THIS_generate_a_64_char_hex_secret",
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.SECRET_KEY in _WEAK_KEYS or len(settings.SECRET_KEY) < 32:
        warnings.warn(
            "WARNING: SECRET_KEY is insecure or too short. "
            "Generate a strong key with: python3 -c \"import secrets; print(secrets.token_hex(32))\"",
            stacklevel=1,
        )
    if not settings.SMTP_HOST:
        warnings.warn(
            "WARNING: SMTP is not configured. Password reset tokens will only be written to logs.",
            stacklevel=1,
        )
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(title="TIMS — Tools Inventory Management System", lifespan=lifespan)

# Use the configured frontend URL as the allowed CORS origin.
# allow_origins=["*"] with allow_credentials=True is invalid per the CORS spec
# and browsers will reject it; reflecting the actual frontend origin is correct.
_allowed_origins = [settings.FRONTEND_BASE_URL.rstrip("/")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers under /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(tools.router, prefix="/api")
app.include_router(storage_bins.router, prefix="/api")
app.include_router(requisitions.router, prefix="/api")
app.include_router(issuance.router, prefix="/api")
app.include_router(returns.router, prefix="/api")
app.include_router(damage.router, prefix="/api")
app.include_router(calibration.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(users.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
