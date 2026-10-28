# CYR Ecology - Sistema de Gestión Comercial

Este proyecto es un sistema web Fullstack desarrollado para la empresa **CYR Ecology** (consultoría ambiental). Permite gestionar clientes, cotizaciones, facturación (boletas, facturas y notas de venta) y generar reportes de ventas en tiempo real.

## 🚀 Tecnologías Utilizadas

**Frontend:**

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Formik & Yup (validación de formularios)
- Recharts (gráficos)
- html2pdf.js (generación de PDFs)

**Backend:**

- Node.js
- Express.js
- Sequelize (ORM)
- JSON Web Tokens (JWT) para autenticación
- bcryptjs (encriptación)

**Base de Datos:**

- Aiven MySQL (nube) con conexión SSL

**Despliegue:**

- Docker (Backend)

## 📂 Estructura del Proyecto

```text
cyr-ecology-fullstack/
├── backend/            # API REST (Node.js + Express + Sequelize)
│   ├── controllers/    # Lógica de negocio
│   ├── models/         # Modelos de la base de datos
│   ├── routes/         # Endpoints de la API
│   ├── middlewares/    # Seguridad (JWT)
│   └── config/         # Conexión a MySQL
├── frontend/           # Interfaz de usuario (React + Vite)
│   ├── src/
│   │   ├── api/        # Configuración de Axios
│   │   ├── components/ # Componentes reutilizables
│   │   ├── context/    # Contexto de autenticación
│   │   └── pages/      # Vistas (Dashboard, Cotizador, etc.)
├── docs/               # Documentación del proyecto
│   ├── Informe_Final_CYR_Ecology.pdf
│   └── Informe_Final_CYR_Ecology.docx
├── README.md
└── MANUAL_DE_INSTALACION.md
```
