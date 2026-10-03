# 📖 RouteSense: Manual de Usuario y Guía de Operación

Este manual describe los procedimientos operativos para utilizar las tres perspectivas del sistema **RouteSense**: el **Portal Administrativo**, la **Aplicación del Conductor** y el **Portal del Pasajero**.

---

## 👨‍💼 1. Portal de Administración (Administrador / Operador de Flotilla)

El Portal de Administración es la herramienta central donde las empresas de transporte o coordinadores gestionan toda la logística del sistema.

### 1.1 Iniciar Sesión y Acceso al Dashboard
1. Navega a la URL del portal y selecciona la pestaña **Administración / Login**.
2. Ingresa tus credenciales (Correo electrónico y contraseña).
3. Serás redirigido al **Dashboard Principal**, donde verás un resumen de:
   - Número de empresas asociadas.
   - Autobuses activos e inactivos.
   - Choferes disponibles.
   - Rutas registradas y alertas telemétricas.

### 1.2 Gestión de Empresas Concesionarias
- **Registrar Empresa:** Haz clic en **Empresas** -> **Nueva Empresa**. Completa el nombre comercial, RFC, representante legal y teléfono.
- **Ver Catálogo:** Puedes filtrar y desactivar empresas que hayan concluido su contrato de servicio.

### 1.3 Gestión de Flotilla de Autobuses
- **Alta de Unidad:** Navega a **Autobuses** -> **Agregar Unidad**.
- Completa el número económico de la unidad, placa, modelo, capacidad de pasajeros y la empresa a la que pertenece.
- **Asignación de Ruta:** Selecciona la unidad y asigna la ruta predeterminada a la que prestará servicio.

### 1.4 Configuración de Rutas y Paradas
- **Alta de Parada:** Ve a **Paradas** -> **Nueva Parada**. Haz clic en el mapa de Google Maps para marcar las coordenadas exactas de la parada e ingresa un nombre identificador (ej. "Parada Universidad - Puerta 2").
- **Trazado de Ruta:** Ve a **Rutas** -> **Crear Ruta**. Asigna Origen, Destino y arrastra las paradas en el orden secuencial en que el autobús las recorrerá.

---

## 🚘 2. Aplicación del Conductor (Chofer / Operador de Unidad)

La interfaz del Conductor está optimizada para smartphones y tablets montadas en la cabina del autobús.

### 2.1 Iniciar Turno y Selección de Unidad
1. Ingresa a la aplicación desde tu teléfono móvil.
2. Introduce tu número de licencia o credencial de chofer.
3. **Selecciona la unidad:** Elige el número de autobús que vas a manejar durante la jornada.
4. **Selecciona la ruta:** Elige la ruta asignada para el turno.
5. Presiona el botón **"Iniciar Transmisión / Iniciar Ruta"**.

### 2.2 Transmisión Telemétrica GPS
- Una vez iniciada la ruta, la aplicación utilizará el GPS del teléfono para enviar periódicamente (cada 3-5 segundos) la latitud, longitud y velocidad actual al **Microservicio de Monitoreo**.
- En la pantalla verás tu velocidad actual, la siguiente parada programada y el estado de la conexión en vivo (marcador verde = Transmitiendo).

### 2.3 Conclusión del Turno
- Al llegar a la terminal final o concluir la jornada, presiona **"Finalizar Ruta"**. Esto pausará el envío de ubicación para no consumir batería ni datos móviles.

---

## 📱 3. Portal del Pasajero (Cliente / Usuario Final)

El portal público permite a los ciudadanos o estudiantes planificar su viaje y saber exactamente cuándo llegará el próximo autobús.

### 3.1 Consulta de Autobuses en Mapa Interactivo
1. Abre la aplicación desde cualquier navegador móvil o de escritorio.
2. Al ingresar al mapa principal, verás los autobuses en movimiento marcados con un icono en tiempo real.
3. Haz clic sobre cualquier autobús para ver:
   - Número de unidad.
   - Ruta que está realizando.
   - Velocidad estimada.
   - Tiempo estimado de llegada (ETA) a la siguiente parada.

### 3.2 Búsqueda de Rutas y Paradas Cercanas
- Utiliza la barra de búsqueda superior para ingresar tu ubicación actual o destino.
- Filtra por nombre de ruta (ej. "Ruta 1 - Centro / Universidad").
- Selecciona tu parada deseada para ver la lista de unidades que se aproximan a ese punto.

### 3.3 Indicador de Estado del Servicio
- **Unidad en Movimiento:** Marcador activo en el mapa.
- **Sin Servicio:** Si no hay autobuses activos en una ruta, el portal mostrará el horario de inicio del próximo turno.
