from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.scheduler import start_scheduler, stop_scheduler
from app.routers import auth, tools, storage_bins, requisitions, issuance, returns
from app.routers import damage, calibration, reports, dashboard, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(title="TIMS — Tool Inventory Management System", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
