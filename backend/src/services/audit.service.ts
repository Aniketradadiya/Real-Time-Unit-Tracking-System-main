import { Request } from 'express';
import SystemLog from '../models/system-log.model';
import Logger from '../utils/logger.service';

export interface AuditLogParams {
    actor?: {
        userId?: string;
        email?: string;
        name?: string;
        role?: string;
    };
    req?: Request;
    action: string;
    resource: string;
    details?: any;
    result?: 'SUCCESS' | 'FAILURE' | 'WARNING';
}

export class AuditService {
    public static async log(params: AuditLogParams): Promise<void> {
        try {
            const req = params.req;
            const actor = params.actor || {
                userId: (req as any)?.userId || (req as any)?.user?._id?.toString() || 'SYSTEM',
                email: (req as any)?.user?.email || 'system@rtut.local',
                name: (req as any)?.user?.name || 'System / Admin',
                role: (req as any)?.user?.role || 'ADMIN',
            };

            const ipAddress =
                (req?.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
                req?.socket?.remoteAddress ||
                '127.0.0.1';

            const userAgent = (req?.headers['user-agent'] as string) || 'Internal System';

            const logId = `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

            await SystemLog.create({
                logId,
                actor,
                action: params.action,
                resource: params.resource,
                ipAddress,
                userAgent,
                details: params.details,
                result: params.result || 'SUCCESS',
                timestamp: new Date(),
            });

            Logger.info(`[Audit] ${params.action} by ${actor.email || actor.role} on ${params.resource}`);
        } catch (error) {
            Logger.error('Failed to create audit log:', error);
        }
    }
}

export default AuditService;
