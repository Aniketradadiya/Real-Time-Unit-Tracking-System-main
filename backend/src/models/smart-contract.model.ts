import { model, models, Schema, Types } from 'mongoose';

export interface SmartContractDocument {
    _id: Types.ObjectId;
    contractAddress: string;
    name: string;
    network: string; // e.g. Ethereum Mainnet, Sepolia Testnet
    deploymentStatus: 'DEPLOYED' | 'PENDING' | 'FAILED' | 'DISABLED';
    owner: string;
    deploymentDate: Date;
    txHash: string;
    compilerVersion?: string;
    eventsCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const smartContractSchema = new Schema<SmartContractDocument>(
    {
        contractAddress: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true },
        network: { type: String, default: 'Ethereum Mainnet' },
        deploymentStatus: {
            type: String,
            enum: ['DEPLOYED', 'PENDING', 'FAILED', 'DISABLED'],
            default: 'DEPLOYED',
        },
        owner: { type: String, default: 'GridOS Protocol Deployer' },
        deploymentDate: { type: Date, default: Date.now },
        txHash: { type: String, required: true },
        compilerVersion: { type: String, default: 'Solidity 0.8.23' },
        eventsCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const SmartContract = models.SmartContract || model<SmartContractDocument>('SmartContract', smartContractSchema);

export default SmartContract;
