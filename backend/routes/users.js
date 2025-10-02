const express = require('express');
const { supabase } = require('../config/database');
const { verifyToken } = require('./auth');

const router = express.Router();

// GET /api/users - Obtener lista de usuarios (solo admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    // Verificar si es admin (opcional - por ahora permitir a todos los usuarios autenticados)
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, company, created_at, last_login, is_active')
      .eq('is_active', true)
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
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo usuarios'
    });
  }
});

// GET /api/users/stats - Estadísticas de usuarios
router.get('/stats', verifyToken, async (req, res) => {
  try {
    // Total de usuarios activos
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Usuarios registrados hoy
    const today = new Date().toISOString().split('T')[0];
    const { count: todayUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('created_at', today);

    // Usuarios por mes (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const { data: monthlyUsers } = await supabase
      .from('users')
      .select('created_at')
      .eq('is_active', true)
      .gte('created_at', sixMonthsAgo.toISOString());

    // Procesar datos por mes
    const monthlyStats = {};
    monthlyUsers?.forEach(user => {
      const month = user.created_at.substring(0, 7); // YYYY-MM
      monthlyStats[month] = (monthlyStats[month] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        todayUsers: todayUsers || 0,
        monthlyStats
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas'
    });
  }
});

module.exports = router;
