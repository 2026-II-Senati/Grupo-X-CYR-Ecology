# Manual de Instalación y Despliegue - CYR Ecology

Este documento detalla los pasos necesarios para instalar, configurar y ejecutar el sistema de gestión comercial de **CYR Ecology** en un entorno local de desarrollo, incluyendo la opción de despliegue con Docker.

## 📋 Requisitos Previos

Antes de comenzar, asegúrese de tener instalado en su computadora:

- **Node.js** (versión 18 o superior) - [Descargar](https://nodejs.org/)
- **Git** - [Descargar](https://git-scm.com/)
- **Docker Desktop** (Opcional, para el despliegue del backend) - [Descargar](https://www.docker.com/products/docker-desktop/)
- Un editor de código (Recomendado: **Visual Studio Code**).

---

## 🚀 Paso 1: Clonar el Repositorio

Abra una terminal (PowerShell o CMD) y ejecute el siguiente comando para descargar el código fuente desde el repositorio institucional:

```bash
git clone https://github.com/2026-II-Senati/Grupo-X-CYR-Ecology.git
cd cyr-ecology-fullstack
```

## ⚙️ Paso 2: Configuración del Backend (API REST)

Ingrese a la carpeta del servidor:

bash
cd backend
Instale las dependencias necesarias:

npm install
Configurar Variables de Entorno:
Cree un archivo llamado .env en la raíz de la carpeta backend y configure las credenciales de la base de datos en la nube (Aiven MySQL). El archivo debe contener la siguiente estructura:

env
PORT=3000
DB_HOST=mysql-cyr-cyr-ecology.i.aivencloud.com
DB_PORT=20580
DB_USER=avnadmin
DB_PASSWORD=tu_contraseña_aqui
DB_NAME=defaultdb
JWT_SECRET=cyr_ecology_secreto_2024
API_TOKEN=tu_token_de_decolecta
(Nota: Reemplace tu_contraseña_aqui y tu_token_de_decolecta con las credenciales reales proporcionadas por el administrador del proyecto).

Certificado SSL:
Coloque el archivo ca.pem (certificado proporcionado por Aiven) dentro de la carpeta backend. Este archivo es obligatorio para establecer la conexión segura con la base de datos.

Inicie el servidor en modo desarrollo:

bash
npm run dev
El servidor estará disponible en http://localhost:3000 y debería mostrar el mensaje de conexión exitosa a Aiven (✅ Conexión a Aiven y tablas sincronizadas).

## 💻 Paso 3: Configuración del Frontend (React)

Abra una nueva terminal (mantenga la del backend corriendo) y acceda a la carpeta del cliente:

bash
cd frontend
Instale las dependencias de React:

bash
npm install
Inicie el servidor de Vite:

bash
npm run dev
La interfaz estará disponible en http://localhost:5173.

## 🔐 Paso 4: Acceso al Sistema

Abra su navegador web e ingrese a http://localhost:5173. Utilice las siguientes credenciales de prueba para acceder al sistema:

Correo: admin@cyr.com

Contraseña: 123456

## 🐳 Paso 5: Despliegue con Docker (Opcional)

Si se desea ejecutar el backend dentro de un contenedor Docker (para simular un entorno de producción o garantizar la portabilidad), siga estos pasos:

Asegúrese de que Docker Desktop esté abierto y su motor esté corriendo (icono de ballena en verde).

Desde la carpeta backend, construya la imagen de Docker:

bash
docker build -t cyr-backend .
(No olvide el punto . al final, indica que use el Dockerfile de la carpeta actual).

Ejecute el contenedor pasando las variables de entorno del archivo .env:

bash
docker run -p 3000:3000 --env-file .env cyr-backend
El backend correrá dentro del contenedor y estará accesible en http://localhost:3000.

## 🛠️ Solución de Problemas Frecuentes

Error de conexión a la base de datos (getaddrinfo ENOTFOUND):
Verifique que el archivo .env tenga las credenciales correctas y que el archivo ca.pem esté en la carpeta backend. También asegúrese de que el servicio de Aiven esté encendido (el plan gratuito se apaga por inactividad). Si el error persiste, revise que su red no esté bloqueando el dominio aivencloud.com (puede probar con los datos móviles de un celular).

Error de CORS:
Asegúrese de que el backend esté corriendo en el puerto 3000 y el frontend en el 5173. Verifique que en el server.js el middleware app.use(cors()) esté declarado antes de las rutas.

El PDF no se descarga o sale en blanco:
Verifique que el navegador no esté bloqueando las ventanas emergentes (pop-ups). Además, asegúrese de que la librería html2canvas-pro esté instalada (se usa para que Tailwind v4 funcione con html2pdf).

Error Too many keys specified; max 64 keys allowed:
Este error ocurre al usar sequelize.sync({ alter: true }) en producción. Cambie a alter: false en el archivo server.js para evitar que Sequelize intente modificar las tablas en cada arranque.

El contenedor Docker no arranca (puerto ocupado):
Si al ejecutar docker run sale el error ports are not available, significa que el backend local (Node.js) está usando el puerto 3000. Detenga el backend local con Ctrl + C y vuelva a ejecutar el contenedor.
