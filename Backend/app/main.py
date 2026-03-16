from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import admin, bus, conductor
from database import Base, engine
import models  # Import models to ensure they are registered with Base

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="RouteSense API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(admin.router)
app.include_router(bus.router)
app.include_router(conductor.router)
