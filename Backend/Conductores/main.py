from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import conductor_router
from database import Base, engine
import models

app = FastAPI(title="RouteSense Conductores API")

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Microservicio de Conductores Online", "status": "active"}

app.include_router(conductor_router.router)
