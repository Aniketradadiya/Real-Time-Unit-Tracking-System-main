import { model, models, Schema, Types } from 'mongoose';

export interface SystemSettingDocument {
    _id: Types.ObjectId;
    key: string;
    systemName: string;
    energyMonitoringInterval: number; // in seconds
    defaultEnergyLimit: number; // in kWh
    tariffRatePerKwh: number; // in INR
    alertThresholds: {
        highPowerThresholdWatts: number;
        offlineTimeoutMinutes: number;
        criticalPowerThresholdWatts: number;
    };
    userSettings: {
        allowRegistration: boolean;
        defaultRole: 'USER' | 'ADMIN';
        requireEmailVerification: boolean;
    };
    deviceSettings: {
        deviceTimeoutSeconds: number;
        offlineThresholdMinutes: number;
        dataRefreshIntervalSeconds: number;
    };
    alertSettings: {
        enableAlerts: boolean;
        criticalAlertThreshold: number;
        notifyEmail: boolean;
        notifyPush: boolean;
    };
    securitySettings: {
        sessionTimeoutMinutes: number;
        requireStrongPassword: boolean;
        maxFailedLogins: number;
    };
    updatedAt: Date;
    createdAt: Date;
}

const systemSettingSchema = new Schema<SystemSettingDocument>(
    {
        key: { type: String, default: 'primary', unique: true },
        systemName: { type: String, default: 'GridOS Real-Time Energy Tracking' },
        energyMonitoringInterval: { type: Number, default: 5 },
        defaultEnergyLimit: { type: Number, default: 25 },
        tariffRatePerKwh: { type: Number, default: 6.0 },
        alertThresholds: {
            highPowerThresholdWatts: { type: Number, default: 3000 },
            offlineTimeoutMinutes: { type: Number, default: 5 },
            criticalPowerThresholdWatts: { type: Number, default: 5000 },
        },
        userSettings: {
            allowRegistration: { type: Boolean, default: true },
            defaultRole: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
            requireEmailVerification: { type: Boolean, default: false },
        },
        deviceSettings: {
            deviceTimeoutSeconds: { type: Number, default: 300 },
            offlineThresholdMinutes: { type: Number, default: 5 },
            dataRefreshIntervalSeconds: { type: Number, default: 2 },
        },
        alertSettings: {
            enableAlerts: { type: Boolean, default: true },
            criticalAlertThreshold: { type: Number, default: 4500 },
            notifyEmail: { type: Boolean, default: true },
            notifyPush: { type: Boolean, default: true },
        },
        securitySettings: {
            sessionTimeoutMinutes: { type: Number, default: 1440 },
            requireStrongPassword: { type: Boolean, default: true },
            maxFailedLogins: { type: Number, default: 5 },
        },
    },
    { timestamps: true }
);

const SystemSetting = models.SystemSetting || model<SystemSettingDocument>('SystemSetting', systemSettingSchema);

export default SystemSetting;
