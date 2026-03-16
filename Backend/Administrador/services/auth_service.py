from sqlalchemy.orm import Session
from models import Usuario, Administrador
from utils.security import verify_password, create_access_token

def authenticate_admin(db: Session, email: str, password: str):
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if not user:
        return None
    
    if not verify_password(password, user.password_hash):
        return None
        
    admin = db.query(Administrador).filter(Administrador.user_id == user.user_id).first()
    if not admin:
        return None
        
    return user, admin
