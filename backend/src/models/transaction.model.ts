import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { createModelAdapter } from '../utils/sequelize-query-helper';

export type TransactionType = 'ENERGY_PAYMENT' | 'WALLET_RECHARGE' | 'P2P_TRANSACTION' | 'REFUND';
export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED';

export interface TransactionAttributes {
    id: string;
    transactionId: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    type: TransactionType;
    amount: number;
    energyUnits: number;
    status: TransactionStatus;
    paymentMethod: string;
    txHash?: string;
    description?: string;
    metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id' | 'energyUnits' | 'status' | 'paymentMethod'> {}

export class TransactionModel extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
    declare id: string;
    declare transactionId: string;
    declare userId?: string;
    declare userName?: string;
    declare userEmail?: string;
    declare type: TransactionType;
    declare amount: number;
    declare energyUnits: number;
    declare status: TransactionStatus;
    declare paymentMethod: string;
    declare txHash?: string;
    declare description?: string;
    declare metadata?: Record<string, any>;
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

TransactionModel.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        transactionId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        userName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        userEmail: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        energyUnits: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'SUCCESS',
        },
        paymentMethod: {
            type: DataTypes.STRING,
            defaultValue: 'UPI',
        },
        txHash: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'transactions',
        timestamps: true,
    }
);

export const Transaction: any = createModelAdapter<TransactionModel>(TransactionModel);
export type Transaction = TransactionModel;
export default Transaction;
