from fastapi import APIRouter, Depends
from schemas import ClientResponse
from utils.dependencies import get_current_user

router = APIRouter(tags=["Clientes"])

@router.get("/clients/me", response_model=ClientResponse)
def obtener_perfil(current_user: dict = Depends(get_current_user)):
    # El current_user devuelto por la dependencia ya es el modelo Usuario o un dict con sus datos
    return current_user
