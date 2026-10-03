# 🔌 RouteSense: Catálogo y Referencia de API REST

Todos los microservicios de RouteSense exponen interfaces RESTful en formato JSON con documentación interactiva integrada de Swagger UI accesible en `/docs` de cada servicio.

---

## 🔑 Autenticación
Los endpoints protegidos requieren un encabezado de autorización HTTP con token JWT Bearer:
```http
Authorization: Bearer <TU_JWT_TOKEN>
```

---

## 1. Microservicio Administrador (`:8001`)

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/admin/login` | Autentica a un administrador y retorna JWT token. | ❌ |
| `GET` | `/admin/perfil` | Retorna los datos del administrador autenticado. | ✅ |
| `GET` | `/admin/auditoria` | Obtiene el historial de logs de eventos y auditoría del sistema. | ✅ |
| `GET` | `/admin/puntos-config` | Obtiene la regla activa de bonificación de puntos por dinero gastado. | ❌ |
| `POST` | `/admin/puntos-config` | Crea o actualiza la regla de bonificación de puntos por dinero gastado. | ✅ |
| `GET` | `/admin/sellos-config` | Obtiene la configuración del sistema de sellos (máximo de sellos, recompensa por canje). | ❌ |
| `POST` | `/admin/sellos-config` | Configura la meta máxima de sellos y puntos de recompensa. | ✅ |
| `GET` | `/admin/sellos-imagenes` | Lista las URLs de ImgBB para cada cantidad de sellos (0 a N sellos). | ❌ |
| `POST` | `/admin/sellos-imagenes` | Registra o actualiza la URL de ImgBB para una cantidad específica de sellos. | ✅ |
| `POST` | `/admin/sellos-imagenes/batch` | Actualiza múltiples URLs de ImgBB para los sellos en lote. | ✅ |



---

## 2. Microservicio Autobús (`:8002`)

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/autobuses/` | Lista todos los autobuses registrados. | ❌ |
| `POST` | `/autobuses/` | Registra una nueva unidad de autobús en la flotilla. | ✅ |
| `GET` | `/autobuses/{id}` | Obtiene los detalles de una unidad por ID. | ❌ |
| `PUT` | `/autobuses/{id}` | Actualiza las especificaciones o estado de una unidad. | ✅ |
| `DELETE` | `/autobuses/{id}` | Elimina o da de baja una unidad. | ✅ |

---

## 3. Microservicio Conductores (`:8003`)

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/conductores/` | Lista todos los conductores registrados. | ✅ |
| `POST` | `/conductores/` | Registra un nuevo perfil de chofer/conductor. | ✅ |
| `GET` | `/conductores/{id}` | Obtiene los datos personales y de licencia del conductor. | ✅ |
| `PUT` | `/conductores/{id}` | Actualiza la disponibilidad o datos del conductor. | ✅ |

---

## 4. Microservicio Empresas (`:8004`)

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/empresas/` | Lista las empresas transportistas concesionarias. | ❌ |
| `POST` | `/empresas/` | Registra una nueva empresa en el sistema. | ✅ |
| `GET` | `/empresas/{id}` | Obtiene la información comercial de una empresa. | ❌ |

---

## 5. Microservicio Paradas (`:8005`)

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/paradas/` | Consulta la lista de paradas de autobús con coordenadas GPS. | ❌ |
| `POST` | `/paradas/` | Agrega una nueva parada geográfica al sistema. | ✅ |
| `GET` | `/paradas/{id}` | Obtiene el detalle de una parada específica. | ❌ |

---

## 6. Microservicio Rutas (`:8006`)

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/rutas/` | Lista las rutas activas de transporte. | ❌ |
| `POST` | `/rutas/` | Crea una nueva ruta con sus puntos de origen y destino. | ✅ |
| `GET` | `/rutas/{id}` | Obtiene el trayecto y paradas asociadas a una ruta. | ❌ |

---

## 7. Microservicio Clientes (`:8007`)

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/clientes/registro` | Registra un nuevo usuario pasajero. | ❌ |
| `POST` | `/clientes/login` | Inicia sesión de cliente y devuelve JWT. | ❌ |
| `GET` | `/clientes/favoritos` | Consulta las rutas/paradas guardadas por el cliente. | ✅ |

---

## 8. Microservicio Monitoreo en Tiempo Real (`:8008`)

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/monitoreo/ubicacion` | Emite las coordenadas GPS actuales de una unidad (usado por la App Chofer). | ✅ |
| `GET` | `/monitoreo/activos` | Devuelve las posiciones en tiempo real de todos los autobuses activos. | ❌ |
| `GET` | `/monitoreo/ruta/{ruta_id}` | Devuelve las posiciones de las unidades filtradas por ruta. | ❌ |
