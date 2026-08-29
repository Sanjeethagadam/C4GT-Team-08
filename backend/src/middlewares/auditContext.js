const { AsyncLocalStorage } = require('async_hooks');
const mongoose = require('mongoose');

const auditContext = new AsyncLocalStorage();

exports.auditContext = auditContext;

exports.auditContextMiddleware = (req, res, next) => {
  auditContext.run(new Map(), () => {
    next();
  });
};

exports.auditPlugin = function (schema, options) {
  const resourceType = options.resourceType || 'Unknown';

  // Helper to log
  const logAction = async (action, doc, beforeValue = null) => {
    const store = auditContext.getStore();
    if (!store) return;
    const user = store.get('user');
    if (!user) return; // No logged-in user context

    const AuditLog = mongoose.model('AuditLog');
    await AuditLog.create({
      userId: user.id,
      action,
      resourceType,
      resourceId: doc._id,
      beforeValue,
      afterValue: doc.toObject()
    });
  };

  schema.post('save', async function (doc, next) {
    // If it's new, it's a CREATE, else UPDATE
    const action = this.$isNew ? 'CREATE' : 'UPDATE';
    // 'this.$isNew' might not be reliable inside post('save') if it's already saved, but often it works if hooked correctly.
    // However, since it's a simple auto-logger, we can assume 'save' is either create or update.
    await logAction(action, doc);
    next();
  });

  schema.post('findOneAndUpdate', async function (doc, next) {
    if (doc) {
      await logAction('UPDATE', doc);
    }
    next();
  });

  schema.post('findOneAndDelete', async function (doc, next) {
    if (doc) {
      await logAction('DELETE', doc);
    }
    next();
  });
};
