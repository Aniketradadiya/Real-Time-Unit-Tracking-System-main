import { model, models, Schema, Types } from 'mongoose';

export interface SystemLogDocument {
    _id: Types.ObjectId;
    logId: string;
    actor: {
        userId?: string;
        email?: string;
        name?: string;
        role?: string;
    };
    action: string;
    resource: string;
    ipAddress?: string;
    userAgent?: string;
    details?: any;
    result: 'SUCCESS' | 'FAILURE' | 'WARNING';
    timestamp: Date;
    createdAt: Date;
}

const systemLogSchema = new Schema<SystemLogDocument>(
    {
        logId: { type: String, required: true, unique: true, index: true },
        actor: {
            userId: { type: String },
            email: { type: String },
            name: { type: String },
            role: { type: String },
        },
        action: { type: String, required: true, index: true },
        resource: { type: String, required: true },
        ipAddress: { type: String, default: '127.0.0.1' },
        userAgent: { type: String, default: 'Unknown' },
        details: { type: Schema.Types.Mixed },
        result: {
            type: String,
            enum: ['SUCCESS', 'FAILURE', 'WARNING'],
            default: 'SUCCESS',
            index: true,
        },
        timestamp: { type: Date, default: Date.now, index: true },
    },
    { timestamps: true }
);

const SystemLog = models.SystemLog || model<SystemLogDocument>('SystemLog', systemLogSchema);

export default SystemLog;
