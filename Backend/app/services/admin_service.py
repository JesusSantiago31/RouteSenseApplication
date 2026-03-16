from sqlalchemy.orm import Session
from models import Usuario, Administrador
from utils.security import hash_password

def create_admin(db: Session, data):
    # Crear usuario
    usuario = Usuario(
        nombre=data.nombre,
        apellido=data.apellido,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(usuario)
    db.flush()  # obtiene user_id

    # Crear administrador
    admin = Administrador(
        user_id=usuario.user_id,
        rol=data.rol
    )
    db.add(admin)
    db.commit()
    db.refresh(usuario)

    return usuario, admin
