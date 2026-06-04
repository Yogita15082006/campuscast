const { supabaseAdmin } = require('../config/supabase');

const logActivity = async (adminId, action, entity, entityId = null, details = '') => {
  try {
    await supabaseAdmin.from('admin_logs').insert({
      admin_id: adminId || null,
      action,
      entity,
      entity_id: entityId ? entityId.toString() : null,
      details,
    });
  } catch (error) {
    console.error('Activity log error:', error.message);
  }
};

module.exports = { logActivity };
