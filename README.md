React 18 + React Router 6
1. Desinstala las versiones actuales
  npm uninstall react react-dom react-router-dom

2. Instala las versiones compatibles
  npm install react@18 react-dom@18 react-router-dom@6

3. Limpia y reinstala dependencias
  rm -rf node_modules package-lock.json
  npm install

4. Correr el proyecto
  npm run dev

## 🛠️ Tecnologías a Utilizar

### Lenguaje de programación

- TypeScript : JavaScript con tipado estático
- JavaScript (lenguaje general)

### Frontend

- **React**: Biblioteca JavaScript para construir interfaces de usuario con componentes reutilizables
- **Redux**: Para manejo del estado global de la aplicación
- **React Router**: Navegación entre diferentes vistas
- **Axios** - Peticiones HTTP al backend
- **Bootstrap 5.3.8** (vía CDN) - Framework CSS
- Font Awesome 7.0.1

### Backend

- **Node.js**: Entorno de ejecución de JavaScript del lado del servidor
- **Express**: Framework para crear APIs RESTful
- **JWT (JSON Web Tokens)**: Implementación de autenticación segura
- bcryptjs Encriptación de contraseñas

### Base de Datos

- **MongoDB**: Base de datos NoSQL orientada a documentos
- **Mongoose**: ODM para facilitar interacciones con MongoDB

### Herramientas de Desarrollo

- **Git/GitHub**: Control de versiones y colaboración
- **ESLint**: Análisis estático de código
- **Jest**: Testing unitario y de integración
- **Docker**: Contenedorización para desarrollo y despliegue
- **2da opcion para despliegue** : https://app.netlify.com/
