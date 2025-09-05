import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { 
    type: String, 
    required: true,
    enum: [
      'LOGIN',
      'CREATE_SUBSCRIPTION',
      'UPDATE_SUBSCRIPTION',
      'DELETE_SUBSCRIPTION',
      'CANCEL_SUBSCRIPTION',
      'ROLE_CHANGE',
      'TOKEN_REFRESH'
    ],
    index: true
  },
  targetType: { type: String, required: true, enum: ['USER', 'SUBSCRIPTION', 'SYSTEM'], index: true },
  targetId: { type: mongoose.Schema.Types.Mixed, default: null },
  ip: { type: String },
  userAgent: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, immutable: true }
}, { versionKey: false });

// Prevent updates & deletes (append-only)
auditLogSchema.pre('findOneAndUpdate', function() { throw new Error('Audit logs are append-only'); });
auditLogSchema.pre('updateOne', function() { throw new Error('Audit logs are append-only'); });
auditLogSchema.pre('deleteOne', function() { throw new Error('Audit logs are append-only'); });
auditLogSchema.pre('remove', function() { throw new Error('Audit logs are append-only'); });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
