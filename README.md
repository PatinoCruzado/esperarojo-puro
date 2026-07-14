# EsperaRojo ULima 🚍

Aplicación web mobile-first que informa a estudiantes y trabajadores de la Universidad de Lima sobre el **Corredor Rojo** (buses, paraderos, rutas y aforo).

**Sprint 1** — 7 historias de usuario implementadas.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express.js (API REST) |
| Base de datos | MySQL 8+ con mysql2 (queries parametrizadas) |
| Autenticación | JWT + bcrypt (12 salt rounds) |
| Frontend | HTML5 + CSS3 + JavaScript vanilla (fetch API) |
| Mapa | Leaflet.js + OpenStreetMap tiles |
| Geolocalización | Geolocation API del navegador |

## Prerrequisitos

- [Node.js](https://nodejs.org/) >= 18.0.0
- [MySQL](https://www.mysql.com/) >= 8.0

## Instalación

### 1. Clonar el repositorio

```bash
cd e:\ingesoft}
```

### 2. Configurar variables de entorno

```bash
cd backend
copy .env.example .env
```

Edita `backend/.env` con tus credenciales de MySQL:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_aqui
DB_NAME=esperarojo_db
JWT_SECRET=esperarojo_ulima_secreto_jwt_2024
JWT_EXPIRES_IN=24h
```

### 3. Crear la base de datos y cargar datos

Abre MySQL Workbench o la terminal de MySQL y ejecuta el script SQL:

```bash
mysql -u root -p < database/init.sql
```

O desde MySQL Workbench: File → Open SQL Script → selecciona `database/init.sql` → Execute.

Esto creará:
- La base de datos `esperarojo_db`
- 7 tablas
- 110 paraderos con coordenadas
- 8 rutas (201, 204, 206, 209 × ida/vuelta)
- 334 relaciones ruta-paradero
- 12 buses con aforo simulado
- 3 planes de suscripción
- 1 usuario de prueba

### 4. Instalar dependencias

```bash
cd backend
npm install
```

### 5. Iniciar el servidor

```bash
npm start
```

O en modo desarrollo (auto-reload):

```bash
npm run dev
```

### 6. Abrir la aplicación

Navega a **http://localhost:3000** en tu navegador.

## Usuario de Prueba

| Campo | Valor |
|-------|-------|
| Email | `demo@ulima.edu.pe` |
| Contraseña | `Demo1234` |

## Historias de Usuario (Sprint 1)

| HU | Descripción | Pantalla | Endpoint(s) |
|----|------------|----------|-------------|
| HU-01 | Iniciar sesión / Registro | Login | `POST /api/auth/login`, `POST /api/auth/register` |
| HU-02 | Pantalla principal resumida | Home | `GET /api/home/summary?lat=X&lng=Y` |
| HU-03 | Mapa interactivo de paraderos | Mapa | `GET /api/routes/:id/stops` |
| HU-04 | Consultar rutas disponibles | Rutas | `GET /api/routes?direccion=norte\|sur\|este\|todas` |
| HU-05 | Usar ubicación aproximada | Mapa | Geolocation API del navegador |
| HU-06 | Planes de suscripción | Planes | `GET /api/plans`, `POST /api/subscriptions` |
| HU-07 | Aforo del corredor (%) | Home + API | `GET /api/buses/:rutaId/aforo` |

## Estructura del Proyecto

```
├── backend/
│   ├── config/db.js           # Pool MySQL
│   ├── controllers/           # Lógica de negocio
│   ├── middleware/             # Auth JWT + Error handler
│   ├── models/                # Queries parametrizadas
│   ├── routes/                # Endpoints Express
│   ├── server.js              # Entry point
│   └── package.json
├── frontend/
│   ├── index.html             # SPA shell
│   ├── css/styles.css         # Design system mobile-first
│   └── js/                    # Módulos JS (auth, home, mapa, rutas, planes, app)
├── database/
│   └── init.sql               # Schema + seed data
└── README.md
```

## Datos del Corredor Rojo

Los paraderos y rutas están basados en datos reales de **corredorrojo.pe**:

- **Ruta 201**: Callao (Óvalo La Perla) ↔ Ate (Ceres) — 45/44 paraderos
- **Ruta 204**: Pachacámac ↔ San Miguel — 46 paraderos
- **Ruta 206**: San Miguel ↔ La Molina — 34/32 paraderos
- **Ruta 209**: San Miguel ↔ Ate — 45/42 paraderos

**Tarifas**: S/ 2.43 (general) | S/ 1.21 (estudiante)
**Horario**: Lun-Sáb 5:00am-11:00pm | Dom 5:00am-10:30pm

## Seguridad (OWASP)

- ✅ Contraseñas hasheadas con bcrypt (12 rounds)
- ✅ Queries parametrizadas (sin concatenación de strings → anti SQL injection)
- ✅ JWT en todas las rutas protegidas
- ✅ Validación de inputs en frontend y backend
