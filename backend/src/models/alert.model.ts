import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { createModelAdapter } from '../utils/sequelize-query-helper';

export type AlertType = 'DEVICE_OFFLINE' | 'HIGH_POWER' | 'ABNORMAL_BILL' | 'DEVICE_FAULT' | 'ENERGY_LIMIT';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED';

export interface AlertAttributes {
    id: string;
    userId: string;
    deviceId: string;
    deviceName: string;
    alertType: AlertType;
    severity: AlertSeverity;
    status: AlertStatus;
    title: string;
    message: string;
    value?: number;
    threshold?: number;
    detectedAt: Date;
    resolvedAt?: Date;
    isRead: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AlertCreationAttributes extends Optional<AlertAttributes, 'id' | 'severity' | 'status' | 'detectedAt' | 'isRead'> {}

export class AlertModel extends Model<AlertAttributes, AlertCreationAttributes> implements AlertAttributes {
    declare id: string;
    declare userId: string;
    declare deviceId: string;
    declare deviceName: string;
    declare alertType: AlertType;
    declare severity: AlertSeverity;
    declare status: AlertStatus;
    declare title: string;
    declare message: string;
    declare value?: number;
    declare threshold?: number;
    declare detectedAt: Date;
    declare resolvedAt?: Date;
    declare isRead: boolean;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    public get _id(): string {
        return this.id;
    }

    public toJSON(): any {
        const values: any = { ...this.get() };
        values._id = values.id;
        return values;
    }
}

AlertModel.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        deviceId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        deviceName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        alertType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        severity: {
            type: DataTypes.STRING,
            defaultValue: 'MEDIUM',
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'ACTIVE',
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        value: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        threshold: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        detectedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        resolvedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'alerts',
        timestamps: true,
    }
);

export const Alert: any = createModelAdapter<AlertModel>(AlertModel);

// Specialized aggregate method for dashboard and stats
Alert.aggregate = async function (_pipeline: any[]): Promise<any[]> {
    const alerts = await AlertModel.findAll();

    const byTypeMap = new Map<string, number>();
    const bySeverityMap = new Map<string, number>();
    let activeCount = 0;
    let unresolvedCount = 0;

    alerts.forEach((a) => {
        byTypeMap.set(a.alertType, (byTypeMap.get(a.alertType) || 0) + 1);
        bySeverityMap.set(a.severity, (bySeverityMap.get(a.severity) || 0) + 1);
        if (a.status === 'ACTIVE') activeCount++;
        if (a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED') unresolvedCount++;
    });

    const byType = Array.from(byTypeMap.entries()).map(([_id, count]) => ({ _id, count }));
    const bySeverity = Array.from(bySeverityMap.entries()).map(([_id, count]) => ({ _id, count }));

    return [
        {
            byType,
            bySeverity,
            activeCount: [{ count: activeCount }],
            unresolvedCount: [{ count: unresolvedCount }],
        },
    ];
};

export type Alert = AlertModel;
export default Alert;
