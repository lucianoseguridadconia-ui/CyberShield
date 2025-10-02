# 🛡️ CyberShield Backend

Backend API para CyberShield - Plataforma de Seguridad Informática

## 🚀 Stack Tecnológico (100% Gratuito)

- **Runtime:** Node.js + Express
- **Base de datos:** Supabase (PostgreSQL gratuito)
- **Email:** Resend (3,000 emails/mes) o Gmail SMTP
- **Hosting:** Railway/Render (tier gratuito)
- **Autenticación:** JWT + bcrypt

## 📦 Instalación

```bash
# Clonar e instalar dependencias
npm install

# Copiar variables de entorno
cp env.example .env

# Configurar variables en .env (ver sección de configuración)

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start
```

## ⚙️ Configuración

### 1. Supabase (Base de datos gratuita)

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Ve a Settings > API y copia:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`

### 2. Resend (Email gratuito - Recomendado)

1. Ve a [resend.com](https://resend.com) y crea una cuenta
2. Crea una API key
3. Configura `RESEND_API_KEY` en .env

### 3. Gmail SMTP (Alternativa gratuita)

1. Activa 2FA en tu cuenta Gmail
2. Genera una "App Password"
3. Configura `GMAIL_USER` y `GMAIL_APP_PASSWORD`

## 🗄️ Estructura de Base de Datos

### Tabla: users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  company VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

### Tabla: contacts
```sql
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  company VARCHAR(100),
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: audit_requests
```sql
CREATE TABLE audit_requests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(100) NOT NULL,
  employees INTEGER NOT NULL,
  industry VARCHAR(100),
  description TEXT NOT NULL,
  urgency VARCHAR(20) DEFAULT 'medium',
  budget VARCHAR(20),
  phone VARCHAR(20),
  preferred_contact VARCHAR(20) DEFAULT 'email',
  status VARCHAR(20) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil del usuario

### Contacto
- `POST /api/contact` - Enviar mensaje de contacto
- `GET /api/contact` - Obtener mensajes (admin)

### Auditorías
- `POST /api/audit/request` - Solicitar auditoría
- `GET /api/audit/requests` - Lista de solicitudes (admin)
- `GET /api/audit/status/:id` - Estado de solicitud

### Usuarios
- `GET /api/users` - Lista de usuarios (admin)
- `GET /api/users/stats` - Estadísticas

### Utilidades
- `GET /health` - Estado del servidor
- `GET /` - Información de la API

## 🚀 Despliegue Gratuito

### Opción 1: Railway (Recomendado)
1. Ve a [railway.app](https://railway.app)
2. Conecta tu repositorio GitHub
3. Configura las variables de entorno
4. Deploy automático

### Opción 2: Render
1. Ve a [render.com](https://render.com)
2. Crea un nuevo Web Service
3. Conecta tu repositorio
4. Configura variables de entorno

## 🔒 Seguridad

- ✅ Rate limiting por endpoint
- ✅ Validación de datos con Joi
- ✅ Passwords hasheados con bcrypt
- ✅ JWT para autenticación
- ✅ Headers de seguridad con Helmet
- ✅ CORS configurado

## 📧 Templates de Email

El sistema incluye templates automáticos para:
- ✉️ Mensajes de contacto
- 🎉 Bienvenida a nuevos usuarios
- 🔍 Solicitudes de auditoría
- ✅ Confirmaciones automáticas

## 💰 Costos (Tier Gratuito)

- **Supabase:** 500MB DB, 2GB bandwidth
- **Resend:** 3,000 emails/mes
- **Railway:** 500 horas/mes
- **Total:** $0/mes para empezar

## 🆙 Escalabilidad

Cuando necesites más recursos:
- **Supabase Pro:** $25/mes
- **Resend Pro:** $20/mes  
- **Railway Pro:** $5/mes
- **Total:** ~$50/mes para escalar

## 🔧 Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# El servidor estará en http://localhost:3000
```

## 📝 Variables de Entorno

Copia `env.example` a `.env` y configura:

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Email (Resend recomendado)
RESEND_API_KEY=your_resend_key
FROM_EMAIL=noreply@cybershield.com

# Configuración
ADMIN_EMAIL=admin@cybershield.com
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

**¡Protegiendo tu mundo digital! 🛡️**
