const ActivityLog = require('../models/ActivityLog');

const logActivity = async (adminId, action, entity, entityId = null, details = '') => {
  try {
    await ActivityLog.create({
      admin: adminId,
      action,
      entity,
      entityId,
      details,
    });
  } catch (error) {
    console.error('Activity log error:', error.message);
  }
};

module.exports = { logActivity };
