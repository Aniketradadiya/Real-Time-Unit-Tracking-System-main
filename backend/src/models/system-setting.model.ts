import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { createModelAdapter } from '../utils/sequelize-query-helper';

export interface SystemSettingAttributes {
    id: string;
    key: string;
    systemName: string;
    energyMonitoringInterval: number;
    defaultEnergyLimit: number;
    tariffRatePerKwh: number;
    alertThresholds?: {
        highPowerThresholdWatts: number;
        offlineTimeoutMinutes: number;
        criticalPowerThresholdWatts: number;
    };
    userSettings?: {
        allowRegistration: boolean;
        defaultRole: 'USER' | 'ADMIN';
        requireEmailVerification: boolean;
    };
    deviceSettings?: {
        deviceTimeoutSeconds: number;
        offlineThresholdMinutes: number;
        dataRefreshIntervalSeconds: number;
    };
    alertSettings?: {
        enableAlerts: boolean;
        criticalAlertThreshold: number;
        notifyEmail: boolean;
        notifyPush: boolean;
    };
    securitySettings?: {
        sessionTimeoutMinutes: number;
        requireStrongPassword: boolean;
        maxFailedLogins: number;
    };
    createdAt?: Date;
    updatedAt?: Date;
}

export interface SystemSettingCreationAttributes extends Optional<SystemSettingAttributes, 'id' | 'key' | 'systemName' | 'energyMonitoringInterval' | 'defaultEnergyLimit' | 'tariffRatePerKwh'> {}

export class SystemSettingModel extends Model<SystemSettingAttributes, SystemSettingCreationAttributes> implements SystemSettingAttributes {
    public id!: string;
    public key!: string;
    public systemName!: string;
    public energyMonitoringInterval!: number;
    public defaultEnergyLimit!: number;
    public tariffRatePerKwh!: number;
    public alertThresholds?: any;
    public userSettings?: any;
    public deviceSettings?: any;
    public alertSettings?: any;
    public securitySettings?: any;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public get _id(): string {
        return this.id;
    }

    public toJSON(): any {
        const values: any = { ...this.get() };
        values._id = values.id;
        return values;
    }
}

SystemSettingModel.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        key: {
            type: DataTypes.STRING,
            defaultValue: 'primary',
            unique: true,
        },
        systemName: {
            type: DataTypes.STRING,
            defaultValue: 'GridOS Real-Time Energy Tracking',
        },
        energyMonitoringInterval: {
            type: DataTypes.INTEGER,
            defaultValue: 5,
        },
        defaultEnergyLimit: {
            type: DataTypes.FLOAT,
            defaultValue: 25,
        },
        tariffRatePerKwh: {
            type: DataTypes.FLOAT,
            defaultValue: 6.0,
        },
        alertThresholds: {
            type: DataTypes.JSONB,
            defaultValue: {
                highPowerThresholdWatts: 3000,
                offlineTimeoutMinutes: 5,
                criticalPowerThresholdWatts: 5000,
            },
        },
        userSettings: {
            type: DataTypes.JSONB,
            defaultValue: {
                allowRegistration: true,
                defaultRole: 'USER',
                requireEmailVerification: false,
            },
        },
        deviceSettings: {
            type: DataTypes.JSONB,
            defaultValue: {
                deviceTimeoutSeconds: 300,
                offlineTimeoutMinutes: 5,
                dataRefreshIntervalSeconds: 2,
            },
        },
        alertSettings: {
            type: DataTypes.JSONB,
            defaultValue: {
                enableAlerts: true,
                criticalAlertThreshold: 4500,
                notifyEmail: true,
                notifyPush: true,
            },
        },
        securitySettings: {
            type: DataTypes.JSONB,
            defaultValue: {
                sessionTimeoutMinutes: 1440,
                requireStrongPassword: true,
                maxFailedLogins: 5,
            },
        },
    },
    {
        sequelize,
        tableName: 'system_settings',
        timestamps: true,
    }
);

export const SystemSetting: any = createModelAdapter<SystemSettingModel>(SystemSettingModel);
export type SystemSetting = SystemSettingModel;
export default SystemSetting;
