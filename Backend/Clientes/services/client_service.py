from sqlalchemy.orm import Session
from models import Usuario
from schemas import ClientRegister
from utils.security import get_password_hash, verify_password

def create_client(db: Session, data: ClientRegister):
    hashed_password = get_password_hash(data.password)
    new_user = Usuario(
        nombre=data.nombre,
        apellido=data.apellido,
        email=data.email,
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def get_client_by_email(db: Session, email: str):
    return db.query(Usuario).filter(Usuario.email == email).first()

def authenticate_client(db: Session, email: str, password: str):
    user = get_client_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user
