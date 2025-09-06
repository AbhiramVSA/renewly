import AuditLog from '../models/auditLog.model.js';

export async function logAudit({ actorId, action, targetType, targetId = null, metadata = {}, req }) {
  try {
    await AuditLog.create({
      actor: actorId,
      action,
      targetType,
      targetId,
      ip: req?.ip || req?.headers['x-forwarded-for'] || null,
      userAgent: req?.headers['user-agent'] || null,
      metadata
    });
  } catch (err) {
    // Fail silently to avoid blocking core flow
    console.error('Audit log failure:', err.message);
  }
}
