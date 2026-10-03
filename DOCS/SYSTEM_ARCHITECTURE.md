# 🏗️ RouteSense: Arquitectura del Sistema e Ingeniería

## 1. Visión General de la Arquitectura

**RouteSense** utiliza una arquitectura de **microservicios distribuida** desacoplada, donde cada dominio de negocio (Administración, Autobuses, Conductores, Empresas, Paradas, Rutas, Clientes y Monitoreo) opera de forma independiente para garantizar **escalabilidad horizontal, tolerancia a fallos y fácil mantenimiento**.

```mermaid
flowchart TD
    subgraph Frontend Layer [Capa de Presentación - React 19 + TailwindCSS]
        UI_Admin[Portal de Administración]
        UI_Driver[Aplicación de Conductor]
        UI_User[Portal del Pasajero / Cliente]
    end

    subgraph Gateway [API Gateway / Cloud Reverse Proxy - Nginx / Render]
        GW[Router Central de Invocaciones HTTP/REST]
    end

    subgraph Microservices [Capa de Microservicios - FastAPI / Python]
        MS_Admin[Microservicio Administrador :8001]
        MS_Bus[Microservicio Autobús :8002]
        MS_Driver[Microservicio Conductores :8003]
        MS_Company[Microservicio Empresas :8004]
        MS_Stops[Microservicio Paradas :8005]
        MS_Routes[Microservicio Rutas :8006]
        MS_Clients[Microservicio Clientes :8007]
        MS_Monitor[Microservicio Monitoreo Real-time :8008]
    end

    subgraph Data Layer [Capa de Datos - PostgreSQL / Supabase]
        DB[(Base de Datos Relacional SQL)]
    end

    UI_Admin --> GW
    UI_Driver --> GW
    UI_User --> GW

    GW --> MS_Admin
    GW --> MS_Bus
    GW --> MS_Driver
    GW --> MS_Company
    GW --> MS_Stops
    GW --> MS_Routes
    GW --> MS_Clients
    GW --> MS_Monitor

    MS_Admin --> DB
    MS_Bus --> DB
    MS_Driver --> DB
    MS_Company --> DB
    MS_Stops --> DB
    MS_Routes --> DB
    MS_Clients --> DB
    MS_Monitor --> DB
```

---

## 2. Detalle de Microservicios de Backend

| Microservicio | Responsabilidad Principal | Modelos de Datos Relevantes |
| :--- | :--- | :--- |
| **`Administrador`** | Gestión de superusuarios, permisos de plataforma y auditorías. | `Administrador`, `Auditoria` |
| **`Autobus`** | Catálogo de unidades de transporte, placas, capacidad y estado operacional. | `Autobus`, `Mantenimiento` |
| **`Conductores`** | Perfiles de choferes, licencia de conducir, estado de disponibilidad y asignaciones. | `Conductor`, `Asignacion` |
| **`Empresas`** | Registro de concesionarias, contratos, razón social y configuración regional. | `EmpresaTransitoria`, `Contrato` |
| **`Paradas`** | Coordenadas latitud/longitud de paradas oficiales, infraestructura y puntos de abordaje. | `Parada`, `Ubicacion` |
| **`Rutas`** | Trazado de trayectos, origen, destino, secuencias de paradas y horarios predeterminados. | `Ruta`, `RutaParada` |
| **`Clientes`** | Gestión de pasaje, autenticación de usuarios finales y preferencias de notificación. | `Cliente`, `Usuario` |
| **`Monitoreo`** | Telemetría GPS en tiempo real, velocidad, estado del trayecto y conexión de choferes. | `MonitoreoGPS`, `UbicacionActual` |

---

## 3. Modelo de Datos y Base de Datos Relacional

El sistema utiliza una base de datos relacional PostgreSQL (vía Supabase / local) organizada con llaves foráneas para mantener integridad referencial.

### Diagrama Entidad-Relación (ERD)

```mermaid
erDiagram
    EMPRESA ||--o{ AUTOBUS : posee
    EMPRESA ||--o{ CONDUCTOR : contrata
    AUTOBUS ||--o{ MONITOREO : emite_telemetria
    CONDUCTOR ||--o{ MONITOREO : conduce
    RUTA ||--o{ AUTOBUS : asignada_a
    RUTA ||--|{ RUTA_PARADA : contiene
    PARADA ||--|{ RUTA_PARADA : pertenece_a

    EMPRESA {
        int id PK
        string nombre
        string rfc
        string estado
    }

    AUTOBUS {
        int id PK
        string numero_unidad
        string placa
        int capacidad
        int empresa_id FK
    }

    CONDUCTOR {
        int id PK
        string nombre
        string licencia
        string telefono
        int empresa_id FK
    }

    PARADA {
        int id PK
        string nombre
        float latitud
        float longitud
    }

    RUTA {
        int id PK
        string nombre
        string origen
        string destino
    }

    MONITOREO {
        int id PK
        int autobus_id FK
        int conductor_id FK
        float latitud
        float longitud
        datetime timestamp
    }
```

---

## 4. Flujo de Transmisión de Ubicación GPS en Tiempo Real

```mermaid
sequenceDiagram
    autonumber
    actor Conductor as 🚌 Conductor (App Móvil)
    participant Monitoreo as ⚡ Microservicio Monitoreo (:8008)
    participant DB as 🗄️ Supabase PostgreSQL
    actor Pasajero as 📱 Pasajero (App Web)

    Conductor->>Monitoreo: POST /monitoreo/ubicacion (lat, lng, autobus_id, velocidad)
    Monitoreo->>DB: UPDATE / INSERT registro de posición actual
    DB-->>Monitoreo: OK (200)
    Monitoreo-->>Conductor: Confirmación de paquete telemétrico enviado

    Pasajero->>Monitoreo: GET /monitoreo/autobuses-activos (ruta_id)
    Monitoreo->>DB: SELECT ubicaciones recientes
    DB-->>Monitoreo: Coordenadas actualizadas de las unidades
    Monitoreo-->>Pasajero: JSON con posiciones para renderizar marcadores en Google Maps
```

---

## 5. Decisiones Tecnológicas Destacadas

1. **FastAPI (Python 3.11+):** Elegido por su velocidad de ejecución (competitiva con Node.js y Go), validación automática de esquemas con Pydantic y generación interactiva de documentación OpenAPI (Swagger UI).
2. **React 19 + Vite 8:** Compilación ultra-rápida en desarrollo y bundle de producción optimizado para dispositivos móviles con baja velocidad de conexión.
3. **Google Maps Javascript API (`@react-google-maps/api`):** Proporciona renderizado fluido de capas de vectores, marcadores personalizados de autobuses y cálculo de rutas óptimas con Polyline.
4. **Docker & Render Infrastructure:** Contenedores ligeros basados en `python:3.11-slim` y `node:20-alpine` para garantizar despliegues reproducibles sin inconsistencias de entorno.
