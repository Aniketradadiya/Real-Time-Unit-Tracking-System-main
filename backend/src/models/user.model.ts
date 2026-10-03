import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { createModelAdapter } from '../utils/sequelize-query-helper';

export interface UserAttributes {
    id: string;
    name?: string;
    email?: string;
    password?: string;
    mobile?: string;
    address?: string;
    energyLimit: number;
    role: 'USER' | 'ADMIN';
    status: 'ACTIVE' | 'INACTIVE';
    lastActive?: Date;
    isDeleted: boolean;
    createdBy?: string;
    updatedBy?: string;
    deletedBy?: string;
    deletedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'energyLimit' | 'role' | 'status' | 'isDeleted'> {}

export class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: string;
    public name?: string;
    public email?: string;
    public password?: string;
    public mobile?: string;
    public address?: string;
    public energyLimit!: number;
    public role!: 'USER' | 'ADMIN';
    public status!: 'ACTIVE' | 'INACTIVE';
    public lastActive?: Date;
    public isDeleted!: boolean;
    public createdBy?: string;
    public updatedBy?: string;
    public deletedBy?: string;
    public deletedAt?: Date;
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

UserModel.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        mobile: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        energyLimit: {
            type: DataTypes.FLOAT,
            defaultValue: 1.0,
        },
        role: {
            type: DataTypes.ENUM('USER', 'ADMIN'),
            defaultValue: 'USER',
        },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
            defaultValue: 'ACTIVE',
        },
        lastActive: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        createdBy: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        updatedBy: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        deletedBy: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
    }
);

export const User: any = createModelAdapter<UserModel>(UserModel);
export type User = UserModel;
export default User;
