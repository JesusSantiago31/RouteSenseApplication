from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from database import SessionLocal
from models import ConfigSellos, ImagenSello
from schemas import ConfigSellosCreate, ConfigSellosResponse, ImagenSelloCreate, ImagenSelloResponse
from utils.dependencies import get_current_admin

router = APIRouter(prefix="/admin", tags=["Sistema de Sellos y Wallet"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ------------------------------------------------------------------------------
# CONFIGURACIÓN GENERAL DE SELLOS
# ------------------------------------------------------------------------------
@router.get("/sellos-config", response_model=ConfigSellosResponse)
def obtener_config_sellos(db: Session = Depends(get_db)):
    """
    Obtiene la configuración activa del sistema de sellos (máximo de sellos, recompensa por canje).
    """
    config = db.query(ConfigSellos).filter(ConfigSellos.is_active == True).order_by(ConfigSellos.updated_at.desc()).first()
    if not config:
        config = ConfigSellos(
            max_stamps=10,
            reward_points_bonus=50,
            reward_description="Recompensa por tarjeta de sellos completada",
            is_active=True
        )
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.post("/sellos-config", response_model=ConfigSellosResponse)
def guardar_config_sellos(payload: ConfigSellosCreate, db: Session = Depends(get_db), admin_current = Depends(get_current_admin)):
    """
    Crea o actualiza la configuración global del sistema de sellos.
    """
    if payload.max_stamps <= 0:
        raise HTTPException(status_code=400, detail="El máximo de sellos debe ser mayor a 0.")
    if payload.reward_points_bonus < 0:
        raise HTTPException(status_code=400, detail="Los puntos de recompensa no pueden ser negativos.")

    db.query(ConfigSellos).update({ConfigSellos.is_active: False})

    nueva_config = ConfigSellos(
        max_stamps=payload.max_stamps,
        reward_points_bonus=payload.reward_points_bonus,
        reward_description=payload.reward_description or f"Recompensa de {payload.reward_points_bonus} puntos por completar {payload.max_stamps} sellos",
        is_active=True
    )
    db.add(nueva_config)
    db.commit()
    db.refresh(nueva_config)
    return nueva_config

# ------------------------------------------------------------------------------
# MAPEO DE IMÁGENES DÉ ImgBB POR CANTIDAD DE SELLOS (0 A 10)
# ------------------------------------------------------------------------------
@router.get("/sellos-imagenes", response_model=List[ImagenSelloResponse])
def listar_imagenes_sellos(db: Session = Depends(get_db)):
    """
    Obtiene la lista de imágenes registradas en ImgBB asociadas a cada número de sellos (0 a N).
    """
    imagenes = db.query(ImagenSello).order_by(ImagenSello.stamp_count.asc()).all()
    if not imagenes:
        # Inicializar mapeo base de 0 a 10 sellos con URLs por defecto
        imagenes_base = []
        for count in range(11):
            img = ImagenSello(
                stamp_count=count,
                image_url=f"https://i.ibb.co/example/{count}_sellos.png",
                wallet_hero_url=f"https://i.ibb.co/example/{count}_sellos.png",
                nombre_sello=f"{count} Sellos - Tarjeta de Lealtad"
            )
            db.add(img)
            imagenes_base.append(img)
        db.commit()
        for img in imagenes_base:
            db.refresh(img)
        return imagenes_base
    return imagenes

@router.post("/sellos-imagenes", response_model=ImagenSelloResponse)
def guardar_imagen_sello(payload: ImagenSelloCreate, db: Session = Depends(get_db), admin_current = Depends(get_current_admin)):
    """
    Registra o actualiza la URL de ImgBB para una cantidad específica de sellos.
    """
    if payload.stamp_count < 0:
        raise HTTPException(status_code=400, detail="El conteo de sellos no puede ser negativo.")
    if not payload.image_url:
        raise HTTPException(status_code=400, detail="La URL de la imagen en ImgBB es requerida.")

    existente = db.query(ImagenSello).filter(ImagenSello.stamp_count == payload.stamp_count).first()
    if existente:
        existente.image_url = payload.image_url
        existente.wallet_hero_url = payload.wallet_hero_url or payload.image_url
        existente.nombre_sello = payload.nombre_sello or f"{payload.stamp_count} Sellos"
        db.commit()
        db.refresh(existente)
        return existente
    else:
        nuevo = ImagenSello(
            stamp_count=payload.stamp_count,
            image_url=payload.image_url,
            wallet_hero_url=payload.wallet_hero_url or payload.image_url,
            nombre_sello=payload.nombre_sello or f"{payload.stamp_count} Sellos"
        )
        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)
        return nuevo

@router.post("/sellos-imagenes/batch", response_model=List[ImagenSelloResponse])
def guardar_imagenes_sellos_batch(payload_list: List[ImagenSelloCreate], db: Session = Depends(get_db), admin_current = Depends(get_current_admin)):
    """
    Actualiza múltiples URLs de ImgBB para los sellos en una sola petición.
    """
    resultados = []
    for payload in payload_list:
        existente = db.query(ImagenSello).filter(ImagenSello.stamp_count == payload.stamp_count).first()
        if existente:
            existente.image_url = payload.image_url
            existente.wallet_hero_url = payload.wallet_hero_url or payload.image_url
            existente.nombre_sello = payload.nombre_sello or f"{payload.stamp_count} Sellos"
            resultados.append(existente)
        else:
            nuevo = ImagenSello(
                stamp_count=payload.stamp_count,
                image_url=payload.image_url,
                wallet_hero_url=payload.wallet_hero_url or payload.image_url,
                nombre_sello=payload.nombre_sello or f"{payload.stamp_count} Sellos"
            )
            db.add(nuevo)
            resultados.append(nuevo)
    db.commit()
    for res in resultados:
        db.refresh(res)
    return resultados
