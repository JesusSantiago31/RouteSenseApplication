# 🌐 RouteSense: Guía Paso a Paso de Despliegue e Instalación

Esta guía explica detalladamente cómo desplegar la plataforma **RouteSense** en entornos de producción en la nube (Render / Supabase) o en servidores propios On-Premise utilizando Docker.

---

## 📋 Requisitos Previos

### Para Despliegue en Servidor Local / VPS On-Premise:
- **Docker** v24.0+ y **Docker Compose** v2.20+
- **Node.js** v20+ y **npm** v10+ (opcional para desarrollo sin contenedores)
- **Python** v3.11+
- Clave de API válida de **Google Maps Javascript API**

### Para Despliegue en la Nube (Cloud):
- Cuenta en **Render.com** (o AWS / DigitalOcean)
- Instancia de Base de Datos en **Supabase** (PostgreSQL)
- Repositorio cargado en GitHub / GitLab

---

## 🗄️ Paso 1: Configuración de la Base de Datos (Supabase / PostgreSQL)

1. Inicia sesión en [Supabase](https://supabase.com) y crea un nuevo proyecto de PostgreSQL.
2. Ve a la sección **SQL Editor** en la consola de Supabase.
3. Ejecuta en orden los scripts SQL ubicados en el directorio [`DataBaseProject/`](file:///c:/Users/THINKPAD/Documents/1_ISIC/8_Semestre/RouteSenseApplication/DataBaseProject):
   - [`seguridad_schema.sql`](file:///c:/Users/THINKPAD/Documents/1_ISIC/8_Semestre/RouteSenseApplication/DataBaseProject/seguridad_schema.sql)
   - [`usuarios.sql`](file:///c:/Users/THINKPAD/Documents/1_ISIC/8_Semestre/RouteSenseApplication/DataBaseProject/usuarios.sql)
   - [`operacion.sql`](file:///c:/Users/THINKPAD/Documents/1_ISIC/8_Semestre/RouteSenseApplication/DataBaseProject/operacion.sql)
   - [`transporte.sql`](file:///c:/Users/THINKPAD/Documents/1_ISIC/8_Semestre/RouteSenseApplication/DataBaseProject/transporte.sql)
   - [`monitoreo.sql`](file:///c:/Users/THINKPAD/Documents/1_ISIC/8_Semestre/RouteSenseApplication/DataBaseProject/monitoreo.sql)
4. Copia la cadena de conexión URI de tu base de datos (`postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`).

---

## 🚀 Paso 2: Despliegue en Render.com (Automático con Blueprints)

El proyecto incluye el archivo [`render.yaml`](file:///c:/Users/THINKPAD/Documents/1_ISIC/8_Semestre/RouteSenseApplication/render.yaml) configurado para aprovisionar automáticamente los 8 microservicios y la aplicación estática Frontend en un par de clics.

1. Conecta tu cuenta de GitHub a **Render.com**.
2. Selecciona **New +** -> **Blueprint**.
3. Elige el repositorio `RouteSenseApplication`. Render detectará automáticamente el archivo `render.yaml`.
4. Define el grupo de variables compartidas (`routesense-shared`):
   - `DATABASE_URL`: Asigna la URL de conexión de Supabase obtenida en el Paso 1.
   - `SECRET_KEY`: Render generará automáticamente una clave segura para tokens JWT.
5. Haz clic en **Apply**. Render compilará los Dockerfiles del backend y construirá el bundle de React del frontend.

---

## 🐳 Paso 3: Despliegue Local o en VPS con Docker Compose

Si deseas ejecutar todo el entorno localmente o en un servidor VPS privado (Ubuntu / Debian / CentOS):

1. Clona el repositorio en tu servidor:
   ```bash
   git clone https://github.com/tu-usuario/RouteSenseApplication.git
   cd RouteSenseApplication
   ```

2. Configura los archivos de variables de entorno partiendo de las plantillas:
   ```bash
   cp Frontend/.env.example Frontend/.env
   cp Backend/.env.example Backend/.env
   ```
   Edita `Frontend/.env` introduciendo tu `VITE_GOOGLE_MAPS_API_KEY`.

3. Levanta la infraestructura con Docker Compose:
   ```bash
   docker-compose up -d --build
   ```

4. Verifica el estado de los contenedores:
   ```bash
   docker-compose ps
   ```

5. Accede a las aplicaciones:
   - **Frontend App:** `http://localhost:3000` (o puerto configurado)
   - **Microservicio Administrador:** `http://localhost:8001/docs`
   - **Microservicio Autobús:** `http://localhost:8002/docs`
   - **Microservicio Monitoreo:** `http://localhost:8008/docs`

---

## 🛠️ Solución de Problemas Frecuentes (Troubleshooting)

### 1. Error de CORS en el Frontend al invocar las API
**Causa:** La URL del backend no coincide con el origen permitido.
**Solución:** Asegúrate de que los microservicios tengan configurado `CORSMiddleware` permitiendo la URL del Frontend o `["*"]` en producción.

### 2. El mapa de Google Maps se muestra en blanco o con aviso de error
**Causa:** `VITE_GOOGLE_MAPS_API_KEY` inválida o sin permisos de Maps JavaScript API.
**Solución:** Habilita **Maps JavaScript API** y **Directions API** en la consola de Google Cloud Platform y verifica las restricciones del dominio.

### 3. Error de conexión con PostgreSQL / Supabase
**Causa:** Puerto 5432 bloqueado por firewall o contraseña de base de datos incorrecta.
**Solución:** Si utilizas Supabase, asegúrate de habilitar el modo "Connection Pooling" (puerto 6543) si vas a conectarte desde servidores serverless/Docker en la nube.
