const AuditLog = require('../models/AuditLog');

class AuditService {
  async logAction(data) {
    try {
      // Validate that passwords/sensitive data are NEVER logged
      const sanitize = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        const clean = { ...obj };
        delete clean.password;
        delete clean.token;
        delete clean.refreshToken;
        return clean;
      };

      const auditEntry = new AuditLog({
        ...data,
        oldValue: sanitize(data.oldValue),
        newValue: sanitize(data.newValue)
      });
      return await auditEntry.save();
    } catch (error) {
      console.error('Audit Log Error:', error.message);
      // We don't necessarily want to break the main application flow if an audit log fails,
      // but in strict compliance systems you might throw the error.
    }
  }
}

module.exports = new AuditService();
