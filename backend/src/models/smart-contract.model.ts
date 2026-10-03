import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { createModelAdapter } from '../utils/sequelize-query-helper';

export interface SmartContractAttributes {
    id: string;
    contractAddress: string;
    name: string;
    network: string;
    deploymentStatus: 'DEPLOYED' | 'PENDING' | 'FAILED' | 'DISABLED';
    owner: string;
    deploymentDate: Date;
    txHash: string;
    compilerVersion?: string;
    eventsCount: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface SmartContractCreationAttributes extends Optional<SmartContractAttributes, 'id' | 'network' | 'deploymentStatus' | 'owner' | 'deploymentDate' | 'compilerVersion' | 'eventsCount' | 'isActive'> {}

export class SmartContractModel extends Model<SmartContractAttributes, SmartContractCreationAttributes> implements SmartContractAttributes {
    public id!: string;
    public contractAddress!: string;
    public name!: string;
    public network!: string;
    public deploymentStatus!: 'DEPLOYED' | 'PENDING' | 'FAILED' | 'DISABLED';
    public owner!: string;
    public deploymentDate!: Date;
    public txHash!: string;
    public compilerVersion?: string;
    public eventsCount!: number;
    public isActive!: boolean;
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

SmartContractModel.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        contractAddress: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        network: {
            type: DataTypes.STRING,
            defaultValue: 'Ethereum Mainnet',
        },
        deploymentStatus: {
            type: DataTypes.STRING,
            defaultValue: 'DEPLOYED',
        },
        owner: {
            type: DataTypes.STRING,
            defaultValue: 'GridOS Protocol Deployer',
        },
        deploymentDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        txHash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        compilerVersion: {
            type: DataTypes.STRING,
            defaultValue: 'Solidity 0.8.23',
        },
        eventsCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'smart_contracts',
        timestamps: true,
    }
);

export const SmartContract: any = createModelAdapter<SmartContractModel>(SmartContractModel);
export type SmartContract = SmartContractModel;
export default SmartContract;
