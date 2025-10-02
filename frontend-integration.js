// 🛡️ CyberShield - Integración Frontend con Backend
// Archivo para integrar el HTML existente con el nuevo backend

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api'; // Cambiar en producción
const API_PROD_URL = 'https://cybershield-backend.railway.app/api'; // Cambiar por tu URL real

// Detectar si estamos en desarrollo o producción
const API_URL = window.location.hostname === 'localhost' ? API_BASE_URL : API_PROD_URL;

// Utilidad para hacer requests a la API
class CyberShieldAPI {
  constructor() {
    this.baseURL = API_URL;
    this.token = localStorage.getItem('cybershield_token');
  }

  // Método genérico para hacer requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Agregar token si existe
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la solicitud');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Métodos de autenticación
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async getProfile() {
    return await this.request('/auth/me');
  }

  // Método de contacto
  async sendContact(contactData) {
    return await this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
  }

  // Método de auditoría
  async requestAudit(auditData) {
    return await this.request('/audit/request', {
      method: 'POST',
      body: JSON.stringify(auditData)
    });
  }

  // Utilidades de token
  setToken(token) {
    this.token = token;
    localStorage.setItem('cybershield_token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('cybershield_token');
  }

  isLoggedIn() {
    return !!this.token;
  }
}

// Instancia global de la API
const api = new CyberShieldAPI();

// Funciones para integrar con el HTML existente

// 1. Mejorar el formulario de contacto existente
function enhanceContactForm() {
  const contactForm = document.querySelector('#contacto form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const contactData = {
      name: formData.get('name') || contactForm.querySelector('input[type="text"]').value,
      email: formData.get('email') || contactForm.querySelector('input[type="email"]').value,
      message: formData.get('message') || contactForm.querySelector('textarea').value
    };

    try {
      // Mostrar loading
      const submitBtn = contactForm.querySelector('button[type="submit"]') || 
                       contactForm.querySelector('button');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;

      const response = await api.sendContact(contactData);
      
      if (response.success) {
        showNotification('✅ Mensaje enviado correctamente. Te contactaremos pronto.', 'success');
        contactForm.reset();
      }
    } catch (error) {
      showNotification('❌ Error enviando el mensaje: ' + error.message, 'error');
    } finally {
      // Restaurar botón
      const submitBtn = contactForm.querySelector('button[type="submit"]') || 
                       contactForm.querySelector('button');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

// 2. Mejorar el botón de auditoría gratuita
function enhanceAuditButton() {
  const auditBtn = document.querySelector('button[onclick="mostrarAlerta()"]');
  if (!auditBtn) return;

  // Remover el onclick anterior
  auditBtn.removeAttribute('onclick');
  
  auditBtn.addEventListener('click', () => {
    showAuditModal();
  });
}

// 3. Crear modal para solicitud de auditoría
function showAuditModal() {
  const modal = document.createElement('div');
  modal.className = 'audit-modal';
  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>🔍 Solicitar Auditoría Gratuita</h3>
          <button class="close-modal">&times;</button>
        </div>
        <form id="auditForm" class="audit-form">
          <div class="form-group">
            <label>Nombre completo *</label>
            <input type="text" name="name" required>
          </div>
          <div class="form-group">
            <label>Email corporativo *</label>
            <input type="email" name="email" required>
          </div>
          <div class="form-group">
            <label>Empresa *</label>
            <input type="text" name="company" required>
          </div>
          <div class="form-group">
            <label>Número de empleados *</label>
            <select name="employees" required>
              <option value="">Seleccionar...</option>
              <option value="1">1-10</option>
              <option value="11">11-50</option>
              <option value="51">51-200</option>
              <option value="201">201-1000</option>
              <option value="1001">1000+</option>
            </select>
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input type="tel" name="phone">
          </div>
          <div class="form-group">
            <label>Urgencia *</label>
            <select name="urgency" required>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
              <option value="low">Baja</option>
            </select>
          </div>
          <div class="form-group">
            <label>Describe tu situación *</label>
            <textarea name="description" rows="4" required 
              placeholder="Ej: Hemos detectado actividad sospechosa, necesitamos evaluar nuestras vulnerabilidades..."></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary close-modal">Cancelar</button>
            <button type="submit" class="btn-primary">Solicitar Auditoría</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners
  modal.querySelector('.close-modal').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
    if (e.target === modal.querySelector('.modal-overlay')) {
      document.body.removeChild(modal);
    }
  });

  // Form submission
  modal.querySelector('#auditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const auditData = {
      name: formData.get('name'),
      email: formData.get('email'),
      company: formData.get('company'),
      employees: parseInt(formData.get('employees')),
      phone: formData.get('phone'),
      urgency: formData.get('urgency'),
      description: formData.get('description')
    };

    try {
      const submitBtn = modal.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;

      const response = await api.requestAudit(auditData);
      
      if (response.success) {
        showNotification('✅ Solicitud enviada. Te contactaremos en 24 horas.', 'success');
        document.body.removeChild(modal);
      }
    } catch (error) {
      showNotification('❌ Error: ' + error.message, 'error');
    }
  });
}

// 4. Sistema de notificaciones
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Mostrar con animación
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Ocultar después de 5 segundos
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

// 5. Mejorar página de registro de usuarios
function enhanceUserRegistration() {
  // Si estamos en usuarios.html
  if (window.location.pathname.includes('usuarios.html')) {
    const form = document.querySelector('form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const userData = {
          name: formData.get('name'),
          email: formData.get('email'),
          password: formData.get('password'),
          company: formData.get('company'),
          phone: formData.get('phone')
        };

        try {
          const response = await api.register(userData);
          
          if (response.success) {
            showNotification('✅ Cuenta creada exitosamente. ¡Bienvenido!', 'success');
            // Redirigir después de 2 segundos
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 2000);
          }
        } catch (error) {
          showNotification('❌ Error: ' + error.message, 'error');
        }
      });
    }
  }
}

// 6. Inicializar todas las mejoras
function initCyberShieldIntegration() {
  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCyberShieldIntegration);
    return;
  }

  console.log('🛡️ Inicializando CyberShield API Integration');
  
  enhanceContactForm();
  enhanceAuditButton();
  enhanceUserRegistration();
  
  // Agregar estilos CSS para los modales y notificaciones
  addCyberShieldStyles();
  
  console.log('✅ CyberShield Integration completada');
}

// 7. Estilos CSS para los nuevos componentes
function addCyberShieldStyles() {
  const styles = `
    <style>
    /* Modal Styles */
    .audit-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
    }
    
    .modal-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 0;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .modal-header h3 {
      margin: 0;
      color: #1f2937;
    }
    
    .close-modal {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6b7280;
    }
    
    .audit-form {
      padding: 20px;
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
      color: #374151;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 10px;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #3b82f6;
    }
    
    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    
    .btn-primary, .btn-secondary {
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background: #3b82f6;
      color: white;
      border: none;
    }
    
    .btn-primary:hover {
      background: #2563eb;
    }
    
    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }
    
    .btn-secondary:hover {
      background: #e5e7eb;
    }
    
    /* Notification Styles */
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 1001;
      transform: translateX(400px);
      transition: transform 0.3s ease;
      max-width: 400px;
    }
    
    .notification.show {
      transform: translateX(0);
    }
    
    .notification-success {
      background: #10b981;
    }
    
    .notification-error {
      background: #ef4444;
    }
    
    .notification-info {
      background: #3b82f6;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .modal-content {
        width: 95%;
        margin: 20px;
      }
      
      .form-actions {
        flex-direction: column;
      }
      
      .notification {
        right: 10px;
        left: 10px;
        max-width: none;
      }
    }
    </style>
  `;
  
  document.head.insertAdjacentHTML('beforeend', styles);
}

// Inicializar cuando se cargue el script
initCyberShieldIntegration();
