const nodemailer = require('nodemailer');

// Configuración de correo con múltiples proveedores gratuitos
class EmailService {
  constructor() {
    this.transporter = null;
    this.setupTransporter();
  }

  setupTransporter() {
    // Opción 1: Resend (recomendado - 3000 emails/mes gratis)
    if (process.env.RESEND_API_KEY) {
      this.transporter = nodemailer.createTransporter({
        host: 'smtp.resend.com',
        port: 587,
        secure: false,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY
        }
      });
      console.log('✅ Configurado con Resend');
      return;
    }

    // Opción 2: Gmail SMTP (gratuito con límites)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      this.transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });
      console.log('✅ Configurado con Gmail SMTP');
      return;
    }

    console.log('⚠️  No se configuró ningún proveedor de email');
  }

  async sendEmail({ to, subject, html, text }) {
    if (!this.transporter) {
      throw new Error('No hay transporter de email configurado');
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.GMAIL_USER,
      to,
      subject,
      html,
      text
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      throw error;
    }
  }

  // Template para email de contacto
  async sendContactEmail({ name, email, message }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🛡️ Nuevo mensaje de contacto - CyberShield</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mensaje:</strong></p>
          <p style="background: white; padding: 15px; border-radius: 4px;">${message}</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          Este mensaje fue enviado desde el formulario de contacto de CyberShield.
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `Nuevo contacto de ${name} - CyberShield`,
      html,
      text: `Nuevo mensaje de ${name} (${email}): ${message}`
    });
  }

  // Template para confirmación de registro
  async sendWelcomeEmail({ name, email }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">🛡️ ¡Bienvenido a CyberShield!</h2>
        <p>Hola <strong>${name}</strong>,</p>
        <p>Gracias por registrarte en CyberShield. Tu cuenta ha sido creada exitosamente.</p>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>¿Qué puedes hacer ahora?</h3>
          <ul>
            <li>🔍 Solicitar una auditoría gratuita</li>
            <li>📚 Acceder a nuestros recursos de seguridad</li>
            <li>📧 Recibir alertas de seguridad personalizadas</li>
          </ul>
        </div>
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <p>¡Protegiendo tu mundo digital!</p>
        <p><strong>El equipo de CyberShield</strong></p>
      </div>
    `;

    return await this.sendEmail({
      to: email,
      subject: '🛡️ Bienvenido a CyberShield',
      html,
      text: `¡Hola ${name}! Bienvenido a CyberShield. Tu cuenta ha sido creada exitosamente.`
    });
  }

  // Template para solicitud de auditoría
  async sendAuditRequestEmail({ name, email, company, description }) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">🔍 Nueva solicitud de auditoría - CyberShield</h2>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Solicitante:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Empresa:</strong> ${company || 'No especificada'}</p>
          <p><strong>Descripción:</strong></p>
          <p style="background: white; padding: 15px; border-radius: 4px;">${description}</p>
        </div>
        <p style="color: #dc2626; font-weight: bold;">⚡ Acción requerida: Contactar al cliente en 24 horas</p>
      </div>
    `;

    return await this.sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `🔍 Nueva auditoría solicitada por ${name}`,
      html,
      text: `Nueva auditoría solicitada por ${name} (${email}) - Empresa: ${company || 'N/A'} - ${description}`
    });
  }
}

module.exports = new EmailService();
