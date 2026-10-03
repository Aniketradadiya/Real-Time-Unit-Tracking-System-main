import { DataTypes, Model, Op, Optional } from 'sequelize';
import sequelize from '../config/database';
import { createModelAdapter } from '../utils/sequelize-query-helper';

export interface TelemetryAttributes {
    id: string;
    deviceId: string;
    userId: string;
    voltage: number;
    current: number;
    power: number;
    energy: number;
    frequency: number;
    powerFactor: number;
    costPerHour: number;
    timestamp: Date;
    createdAt?: Date;
}

export interface TelemetryCreationAttributes extends Optional<TelemetryAttributes, 'id' | 'frequency' | 'powerFactor' | 'costPerHour' | 'timestamp'> {}

export class TelemetryModel extends Model<TelemetryAttributes, TelemetryCreationAttributes> implements TelemetryAttributes {
    declare id: string;
    declare deviceId: string;
    declare userId: string;
    declare voltage: number;
    declare current: number;
    declare power: number;
    declare energy: number;
    declare frequency: number;
    declare powerFactor: number;
    declare costPerHour: number;
    declare timestamp: Date;
    declare readonly createdAt: Date;

    public get _id(): string {
        return this.id;
    }

    public toJSON(): any {
        const values: any = { ...this.get() };
        values._id = values.id;
        return values;
    }
}

TelemetryModel.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        deviceId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        voltage: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        current: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        power: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        energy: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        frequency: {
            type: DataTypes.FLOAT,
            defaultValue: 50.0,
        },
        powerFactor: {
            type: DataTypes.FLOAT,
            defaultValue: 1.0,
        },
        costPerHour: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0,
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'telemetries',
        timestamps: true,
        updatedAt: false,
    }
);

export const Telemetry: any = createModelAdapter<TelemetryModel>(TelemetryModel);

// Specialized aggregate method for monthly bill checking
Telemetry.aggregate = async function (_pipeline: any[]): Promise<any[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const telemetries = await TelemetryModel.findAll({
        where: {
            timestamp: {
                [Op.gte]: thirtyDaysAgo,
            },
        },
    });

    const groups = new Map<string, { userId: string; deviceId: string; totalCost: number; powerSum: number; count: number }>();

    telemetries.forEach((t) => {
        const key = `${t.userId}_${t.deviceId}`;
        const existing = groups.get(key) || {
            userId: t.userId,
            deviceId: t.deviceId,
            totalCost: 0,
            powerSum: 0,
            count: 0,
        };
        existing.totalCost += Number(t.costPerHour || 0);
        existing.powerSum += Number(t.power || 0);
        existing.count += 1;
        groups.set(key, existing);
    });

    return Array.from(groups.values()).map((g) => ({
        _id: {
            userId: g.userId,
            deviceId: g.deviceId,
        },
        totalCost: g.totalCost,
        avgPower: g.count > 0 ? g.powerSum / g.count : 0,
    }));
};

export type Telemetry = TelemetryModel;
export default Telemetry;
