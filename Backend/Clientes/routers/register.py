from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import ClientRegister, ClientResponse
from services import client_service
from utils.limiter import limiter

router = APIRouter(tags=["Clientes"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/clients/register", response_model=ClientResponse)
@limiter.limit("5/minute")
def registrar_cliente(request: Request, data: ClientRegister, db: Session = Depends(get_db)):
    db_user = client_service.get_client_by_email(db, data.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    return client_service.create_client(db, data)
