const express = require('express');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const emailService = require('../config/email');
const { supabase } = require('../config/database');

const router = express.Router();

// Rate limiting específico para contacto (más restrictivo)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 5 mensajes por hora por IP
  message: 'Demasiados mensajes enviados. Intenta de nuevo en una hora.'
});

// Esquema de validación
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 100 caracteres',
    'any.required': 'El nombre es obligatorio'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Debe ser un email válido',
    'any.required': 'El email es obligatorio'
  }),
  message: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'El mensaje debe tener al menos 10 caracteres',
    'string.max': 'El mensaje no puede exceder 1000 caracteres',
    'any.required': 'El mensaje es obligatorio'
  }),
  company: Joi.string().max(100).optional(),
  phone: Joi.string().max(20).optional()
});

// POST /api/contact - Enviar mensaje de contacto
router.post('/', contactLimiter, async (req, res) => {
  try {
    // Validar datos
    const { error, value } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { name, email, message, company, phone } = value;

    // Guardar en base de datos
    const { data, error: dbError } = await supabase
      .from('contacts')
      .insert([{
        name,
        email,
        message,
        company,
        phone,
        created_at: new Date().toISOString(),
        status: 'pending'
      }])
      .select();

    if (dbError) {
      console.error('Error guardando contacto:', dbError);
      // Continuar aunque falle la BD
    }

    // Enviar email
    try {
      await emailService.sendContactEmail({ name, email, message });
      console.log('✅ Email de contacto enviado');
    } catch (emailError) {
      console.error('❌ Error enviando email:', emailError);
      // No fallar la request si el email falla
    }

    res.json({
      success: true,
      message: 'Mensaje enviado correctamente. Te contactaremos pronto.',
      data: {
        id: data?.[0]?.id,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error en contacto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor. Intenta de nuevo más tarde.'
    });
  }
});

// GET /api/contact - Obtener mensajes (solo para admin)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Error obteniendo contactos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo mensajes'
    });
  }
});

module.exports = router;
