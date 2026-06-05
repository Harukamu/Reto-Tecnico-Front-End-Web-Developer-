# Sistema de Carga y Validación de Datos

Una aplicación React para cargar archivos CSV con autenticación, validación de datos y corrección de errores en línea.

![Tests](https://img.shields.io/badge/Tests-27_passing-00e5a0) ![React](https://img.shields.io/badge/React-19-61DAFB) ![Vite](https://img.shields.io/badge/Vite-8-646CFF)

---

## Características

- **Autenticación simulada** — Login con credenciales fijas, token persistido en `localStorage`
- **Ruta protegida** — Solo usuarios con rol `admin` acceden al dashboard
- **Carga de CSV** — Drag & drop o selector de archivo, con feedback visual
- **Resultados detallados** — Resumen de éxitos y lista de errores con validación
- **Corrección en línea** — Edita campos erróneos y reintenta registro por registro
- **27 tests** cubriendo autenticación, rutas protegidas, formularios y flujos de resultados

---

## Tecnologías

| Herramienta | Uso |
|---|---|
| React 19 | UI |
| React Router 7 | Enrutamiento SPA |
| CSS Modules | Estilos escopados |
| Vite 8 | Build tool |
| Vitest | Test runner |
| Testing Library | Utilidades de tests |

---

## Instalación y ejecución local

### Requisitos previos

- Node.js ≥ 18
- npm ≥ 9

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/csv-uploader.git
cd csv-uploader

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Credenciales de acceso

| Campo | Valor |
|---|---|
| Email | `admin@mail.com` |
| Contraseña | `supersecret` |

> Cualquier otra combinación mostrará el error **"Credenciales inválidas"**.

---

## Scripts disponibles

```bash
npm run dev        # Servidor de desarrollo (hot reload)
npm run build      # Build de producción → dist/
npm run preview    # Previsualizar build de producción
npm run test       # Tests en modo watch
npm run test:run   # Tests una sola vez (CI)
npm run coverage   # Tests + reporte de cobertura
```

---

## Ejecutar los tests

```bash
npm run test:run
```

Salida esperada:

```
Test Files  5 passed (5)
Tests       27 passed (27)
```

---

## Estructura del proyecto

```
src/
├── context/
│   └── AuthContext.jsx       # Estado de autenticación global
├── services/
│   └── api.js                # Simulación de endpoints REST
├── components/
│   ├── Layout.jsx             # Header + contenedor principal
│   ├── ProtectedRoute.jsx     # Guard de ruta para admin
│   ├── UploadForm.jsx         # Formulario con drag & drop
│   ├── ResultsView.jsx        # Resumen de carga + lista de errores
│   └── ErrorRow.jsx           # Fila editable con botón Retry
├── pages/
│   ├── LoginPage.jsx          # /login
│   └── DashboardPage.jsx      # / (protegida)
├── tests/
│   ├── LoginPage.test.jsx
│   ├── UploadForm.test.jsx
│   ├── ResultsView.test.jsx
│   ├── DashboardPage.test.jsx
│   └── ProtectedRoute.test.jsx
├── App.jsx                    # Configuración de rutas
├── main.jsx                   # Entry point
└── index.css                  # Variables CSS globales
```

---

## Endpoints simulados

### POST /api/login

**Response exitosa:**
```json
{
  "ok": true,
  "data": {
    "email": "admin@mail.com",
    "name": "Mr. Admin",
    "role": "admin",
    "token": "mock-jwt-..."
  }
}
```

**Response con error:**
```json
{ "ok": false, "error": "Credenciales inválidas" }
```

### POST /api/upload

**Response:**
```json
{
  "ok": true,
  "data": {
    "success": [{ "id": 1, "name": "Juan Pérez", "email": "juan@example.com", "age": 28 }],
    "errors": [
      {
        "row": 4,
        "data": { "name": "Testino", "email": "bad-email", "age": 25 },
        "details": { "email": "El formato del campo 'email' es inválido." }
      }
    ]
  }
}
```

---

## Archivo CSV de prueba

```csv
name,email,age
Juan Pérez,juan.perez@example.com,28
María García,maria.garcia@example.com,34
Carlos López,carlos.lopez@example.com,22
,bad-email,25
Ana Martínez,ana.martinez@example.com,45
```

Guárdalo como `test-data.csv` y cárgalo en la aplicación.

---

## Deploy

Para deployar en Vercel o Netlify:

```bash
npm run build
# Subir la carpeta dist/ o conectar el repo directamente
```

> URL: https://reto-tecnico-front-end-web-develope.vercel.app/login

---

## Notas de diseño

- Sin base de datos — Toda la lógica de datos es simulada en el frontend
- CSS Modules — Estilos escopados por componente, sin colisiones
- Dark theme — Variables CSS globales en `:root` para consistencia
- Accesibilidad — Labels, roles ARIA y navegación por teclado en el drop zone
