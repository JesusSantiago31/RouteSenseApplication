from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import SessionLocal
from services import auth_service
from utils.security import create_access_token
from main import limiter

router = APIRouter(tags=["Autenticación"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/auth/login")
@limiter.limit("5/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    result = auth_service.authenticate_admin(db, form_data.username, form_data.password)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user, admin = result
    access_token = create_access_token(
        data={"sub": str(user.user_id), "role": admin.rol}
    )
    return {"access_token": access_token, "token_type": "bearer"}
