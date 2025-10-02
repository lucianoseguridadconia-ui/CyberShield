# 🚀 Guía de Despliegue Gratuito - CyberShield

Esta guía te ayudará a desplegar tu backend y configurar el sistema de correo completamente gratis.

## 📋 Checklist Pre-Despliegue

- [ ] Código del backend creado
- [ ] Variables de entorno configuradas
- [ ] Cuenta en Supabase creada
- [ ] Servicio de email configurado
- [ ] Repositorio en GitHub

## 🗄️ Paso 1: Configurar Supabase (Base de Datos)

### 1.1 Crear cuenta y proyecto
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Espera a que se inicialice (2-3 minutos)

### 1.2 Obtener credenciales
1. Ve a **Settings** > **API**
2. Copia estos valores:
   - **Project URL** → Variable `SUPABASE_URL`
   - **anon public key** → Variable `SUPABASE_ANON_KEY`

### 1.3 Crear tablas
Ve a **SQL Editor** y ejecuta estos comandos:

```sql
-- Tabla de usuarios
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

-- Tabla de contactos
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

-- Tabla de solicitudes de auditoría
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

## 📧 Paso 2: Configurar Email (Resend - Recomendado)

### 2.1 Crear cuenta en Resend
1. Ve a [resend.com](https://resend.com)
2. Crea una cuenta gratuita (3,000 emails/mes)
3. Verifica tu email

### 2.2 Crear API Key
1. Ve a **API Keys**
2. Crea una nueva API Key
3. Copia el valor → Variable `RESEND_API_KEY`

### 2.3 Configurar dominio (opcional)
- Para empezar puedes usar `onboarding@resend.dev`
- Más tarde configura tu propio dominio

## 🚀 Paso 3: Desplegar Backend (Railway)

### 3.1 Preparar repositorio
```bash
# Subir backend a GitHub
git add backend/
git commit -m "Add backend API"
git push origin main
```

### 3.2 Desplegar en Railway
1. Ve a [railway.app](https://railway.app)
2. Crea cuenta con GitHub
3. Click **New Project** > **Deploy from GitHub repo**
4. Selecciona tu repositorio
5. Configura:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### 3.3 Configurar variables de entorno
En Railway, ve a **Variables** y agrega:

```env
NODE_ENV=production
PORT=3000

# Supabase (de paso 1.2)
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_key_de_supabase

# JWT (genera una clave secreta fuerte)
JWT_SECRET=tu_clave_super_secreta_aqui
JWT_EXPIRES_IN=7d

# Email (de paso 2.2)
RESEND_API_KEY=tu_api_key_de_resend
FROM_EMAIL=noreply@tu-dominio.com

# Configuración
ADMIN_EMAIL=tu-email@gmail.com
COMPANY_NAME=CyberShield
WEBSITE_URL=https://tu-dominio.vercel.app
```

### 3.4 Obtener URL del backend
Después del despliegue, Railway te dará una URL como:
`https://tu-proyecto.railway.app`

## 🌐 Paso 4: Integrar Frontend

### 4.1 Agregar script al HTML
Agrega esto antes del `</body>` en tu `index.html`:

```html
<script src="frontend-integration.js"></script>
```

### 4.2 Actualizar URL de producción
En `frontend-integration.js`, cambia:
```javascript
const API_PROD_URL = 'https://tu-proyecto.railway.app/api';
```

### 4.3 Subir cambios
```bash
git add frontend-integration.js
git add index.html  # si lo modificaste
git commit -m "Add backend integration"
git push origin main
```

## ✅ Paso 5: Verificar Funcionamiento

### 5.1 Probar endpoints
Visita en tu navegador:
- `https://tu-proyecto.railway.app/health`
- `https://tu-proyecto.railway.app/`

### 5.2 Probar formularios
1. Ve a tu sitio en Vercel
2. Prueba el formulario de contacto
3. Prueba el botón "Solicitar auditoría gratuita"
4. Verifica que lleguen los emails

## 🔧 Alternativas Gratuitas

### Si Railway no funciona:

#### Opción B: Render
1. Ve a [render.com](https://render.com)
2. **New** > **Web Service**
3. Conecta GitHub
4. Configura igual que Railway

#### Opción C: Gmail SMTP (en lugar de Resend)
Si no quieres usar Resend:

1. Activa 2FA en Gmail
2. Genera App Password
3. Usa estas variables:
```env
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu_app_password
```

## 💰 Límites Gratuitos

- **Supabase:** 500MB DB, 2GB transfer
- **Resend:** 3,000 emails/mes
- **Railway:** 500 horas/mes
- **Vercel:** Ilimitado para sitios estáticos

## 🆙 Cuando Escalar

Cuando superes los límites gratuitos:
- **Supabase Pro:** $25/mes
- **Resend Pro:** $20/mes
- **Railway Pro:** $5/mes

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"
- Verifica las variables `SUPABASE_URL` y `SUPABASE_ANON_KEY`
- Asegúrate de que las tablas estén creadas

### Error: "Email not sending"
- Verifica `RESEND_API_KEY`
- Revisa los logs en Railway
- Prueba con Gmail SMTP como alternativa

### Error: "CORS"
- Verifica que `FRONTEND_URL` apunte a tu dominio de Vercel
- En desarrollo usa `http://localhost:5173`

### Error: "Rate limit exceeded"
- Es normal, los límites se resetean cada hora/día
- En producción considera aumentar los límites

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Railway
2. Verifica las variables de entorno
3. Prueba los endpoints individualmente
4. Consulta la documentación de cada servicio

---

**¡Tu backend estará funcionando en menos de 30 minutos! 🚀**
