from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from utils.limiter import limiter
from routers import create_stop, list_stops, get_stop, delete_stop
from database import Base, engine
import models

app = FastAPI(title="RouteSense Paradas API")
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
        "message": "Bienvenido a RouteSense Paradas API",
        "docs": "/docs",
        "status": "online"
    }

app.include_router(create_stop.router)
app.include_router(list_stops.router)
app.include_router(get_stop.router)
app.include_router(delete_stop.router)
