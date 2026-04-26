from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from utils.limiter import limiter
from routers import create_route, list_routes, add_stop_to_route
from database import Base, engine
import models

app = FastAPI(title="RouteSense Rutas API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Create tables
Base.metadata.create_all(bind=engine)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Bienvenido a RouteSense Rutas API",
        "docs": "/docs",
        "status": "online"
    }

app.include_router(create_route.router)
app.include_router(list_routes.router)
app.include_router(add_stop_to_route.router)
