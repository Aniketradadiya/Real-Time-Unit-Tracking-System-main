import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { createModelAdapter } from '../utils/sequelize-query-helper';

export interface DeviceAttributes {
    id: string;
    deviceId: string;
    userId: string;
    deviceName: string;
    location?: string;
    deviceType: 'METER' | 'EQUIPMENT';
    status: 'ACTIVE' | 'INACTIVE' | 'FAULT';
    lastHeartbeat: Date;
    powerThreshold: number;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface DeviceCreationAttributes extends Optional<DeviceAttributes, 'id' | 'deviceType' | 'status' | 'lastHeartbeat' | 'powerThreshold' | 'isDeleted'> {}

export class DeviceModel extends Model<DeviceAttributes, DeviceCreationAttributes> implements DeviceAttributes {
    public id!: string;
    public deviceId!: string;
    public userId!: string;
    public deviceName!: string;
    public location?: string;
    public deviceType!: 'METER' | 'EQUIPMENT';
    public status!: 'ACTIVE' | 'INACTIVE' | 'FAULT';
    public lastHeartbeat!: Date;
    public powerThreshold!: number;
    public isDeleted!: boolean;
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

DeviceModel.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        deviceId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        deviceName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        deviceType: {
            type: DataTypes.ENUM('METER', 'EQUIPMENT'),
            defaultValue: 'EQUIPMENT',
        },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'FAULT'),
            defaultValue: 'ACTIVE',
        },
        lastHeartbeat: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        powerThreshold: {
            type: DataTypes.FLOAT,
            defaultValue: 3000.0,
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'devices',
        timestamps: true,
    }
);

export const Device: any = createModelAdapter<DeviceModel>(DeviceModel);
export type Device = DeviceModel;
export default Device;
