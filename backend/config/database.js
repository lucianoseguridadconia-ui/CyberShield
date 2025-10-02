const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (base de datos gratuita)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para probar la conexión
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('⚠️  Tabla users no existe aún, se creará automáticamente');
    } else {
      console.log('✅ Conexión a Supabase exitosa');
    }
  } catch (err) {
    console.error('❌ Error conectando a Supabase:', err.message);
  }
}

// Esquemas de tablas para crear automáticamente
const createTables = async () => {
  try {
    // Crear tabla de usuarios
    await supabase.rpc('create_users_table', {});
    
    // Crear tabla de contactos
    await supabase.rpc('create_contacts_table', {});
    
    // Crear tabla de auditorías
    await supabase.rpc('create_audits_table', {});
    
    console.log('✅ Tablas creadas/verificadas correctamente');
  } catch (error) {
    console.log('ℹ️  Las tablas se crearán manualmente en Supabase Dashboard');
  }
};

module.exports = {
  supabase,
  testConnection,
  createTables
};
