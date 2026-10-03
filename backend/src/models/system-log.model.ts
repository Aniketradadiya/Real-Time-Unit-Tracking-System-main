import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { createModelAdapter } from '../utils/sequelize-query-helper';

export interface SystemLogAttributes {
    id: string;
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
    createdAt?: Date;
}

export interface SystemLogCreationAttributes extends Optional<SystemLogAttributes, 'id' | 'ipAddress' | 'userAgent' | 'result' | 'timestamp'> {}

export class SystemLogModel extends Model<SystemLogAttributes, SystemLogCreationAttributes> implements SystemLogAttributes {
    declare id: string;
    declare logId: string;
    declare actor: {
        userId?: string;
        email?: string;
        name?: string;
        role?: string;
    };
    declare action: string;
    declare resource: string;
    declare ipAddress?: string;
    declare userAgent?: string;
    declare details?: any;
    declare result: 'SUCCESS' | 'FAILURE' | 'WARNING';
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

SystemLogModel.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        logId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        actor: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        resource: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ipAddress: {
            type: DataTypes.STRING,
            defaultValue: '127.0.0.1',
        },
        userAgent: {
            type: DataTypes.STRING,
            defaultValue: 'Unknown',
        },
        details: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        result: {
            type: DataTypes.STRING,
            defaultValue: 'SUCCESS',
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'system_logs',
        timestamps: true,
        updatedAt: false,
    }
);

export const SystemLog: any = createModelAdapter<SystemLogModel>(SystemLogModel);
export type SystemLog = SystemLogModel;
export default SystemLog;
