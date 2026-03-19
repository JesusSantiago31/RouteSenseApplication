from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from utils.limiter import limiter
from routers import create_admin, list_admins, get_admin, update_role, delete_admin, login
from database import Base, engine
import models

app = FastAPI(title="RouteSense Administrador API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Create tables
Base.metadata.create_all(bind=engine)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Bienvenido a RouteSense Administrador API",
        "docs": "/docs",
        "status": "online"
    }

app.include_router(login.router)
app.include_router(create_admin.router)
app.include_router(list_admins.router)
app.include_router(get_admin.router)
app.include_router(update_role.router)
app.include_router(delete_admin.router)
