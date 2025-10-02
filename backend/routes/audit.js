const express = require('express');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const emailService = require('../config/email');
const { supabase } = require('../config/database');
const { verifyToken } = require('./auth');

const router = express.Router();

// Rate limiting para auditorías
const auditLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 3, // máximo 3 solicitudes por día por IP
  message: 'Límite de solicitudes de auditoría alcanzado. Intenta mañana.'
});

// Esquema de validación para solicitud de auditoría
const auditRequestSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  company: Joi.string().min(2).max(100).required(),
  employees: Joi.number().integer().min(1).max(10000).required(),
  industry: Joi.string().max(100).optional(),
  description: Joi.string().min(20).max(2000).required(),
  urgency: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  budget: Joi.string().valid('under_1k', '1k_5k', '5k_10k', '10k_plus', 'to_discuss').optional(),
  phone: Joi.string().max(20).optional(),
  preferred_contact: Joi.string().valid('email', 'phone', 'both').default('email')
});

// POST /api/audit/request - Solicitar auditoría gratuita
router.post('/request', auditLimiter, async (req, res) => {
  try {
    // Validar datos
    const { error, value } = auditRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }

    const auditData = {
      ...value,
      created_at: new Date().toISOString(),
      status: 'pending',
      priority: value.urgency === 'critical' ? 'high' : 
                value.urgency === 'high' ? 'medium' : 'normal'
    };

    // Guardar en base de datos
    const { data, error: dbError } = await supabase
      .from('audit_requests')
      .insert([auditData])
      .select()
      .single();

    if (dbError) {
      console.error('Error guardando auditoría:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Error procesando la solicitud'
      });
    }

    // Enviar email de notificación al admin
    try {
      await emailService.sendAuditRequestEmail({
        name: value.name,
        email: value.email,
        company: value.company,
        description: value.description
      });
      console.log('✅ Email de auditoría enviado');
    } catch (emailError) {
      console.error('❌ Error enviando email de auditoría:', emailError);
    }

    // Enviar confirmación al cliente
    try {
      await emailService.sendEmail({
        to: value.email,
        subject: '🛡️ Solicitud de auditoría recibida - CyberShield',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🛡️ Solicitud recibida correctamente</h2>
            <p>Hola <strong>${value.name}</strong>,</p>
            <p>Hemos recibido tu solicitud de auditoría de seguridad para <strong>${value.company}</strong>.</p>
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Próximos pasos:</h3>
              <ul>
                <li>📞 Te contactaremos en las próximas 24 horas</li>
                <li>📋 Realizaremos una evaluación inicial gratuita</li>
                <li>📊 Te enviaremos un reporte preliminar</li>
                <li>💼 Discutiremos opciones de auditoría completa</li>
              </ul>
            </div>
            <p><strong>Número de solicitud:</strong> #${data.id}</p>
            <p>Gracias por confiar en CyberShield para proteger tu empresa.</p>
            <p><strong>El equipo de CyberShield</strong></p>
          </div>
        `,
        text: `Hola ${value.name}, hemos recibido tu solicitud de auditoría para ${value.company}. Te contactaremos en 24 horas. Número de solicitud: #${data.id}`
      });
    } catch (emailError) {
      console.error('Error enviando confirmación:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Solicitud de auditoría enviada correctamente. Te contactaremos en 24 horas.',
      data: {
        id: data.id,
        status: data.status,
        created_at: data.created_at
      }
    });

  } catch (error) {
    console.error('Error en solicitud de auditoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/audit/requests - Obtener solicitudes (admin)
router.get('/requests', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('audit_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Error obteniendo auditorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo solicitudes'
    });
  }
});

// GET /api/audit/status/:id - Verificar estado de auditoría
router.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('audit_requests')
      .select('id, status, created_at, company, urgency')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error verificando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando estado'
    });
  }
});

module.exports = router;
