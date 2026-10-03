import { model, models, Schema, Types } from 'mongoose';

export type TransactionType = 'ENERGY_PAYMENT' | 'WALLET_RECHARGE' | 'P2P_TRANSACTION' | 'REFUND';
export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED';

export interface TransactionDocument {
    _id: Types.ObjectId;
    transactionId: string;
    userId?: Types.ObjectId;
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
    createdAt: Date;
    updatedAt: Date;
}

const transactionSchema = new Schema<TransactionDocument>(
    {
        transactionId: { type: String, required: true, unique: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
        userName: { type: String },
        userEmail: { type: String },
        type: {
            type: String,
            enum: ['ENERGY_PAYMENT', 'WALLET_RECHARGE', 'P2P_TRANSACTION', 'REFUND'],
            required: true,
            index: true,
        },
        amount: { type: Number, required: true },
        energyUnits: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['SUCCESS', 'PENDING', 'FAILED'],
            default: 'SUCCESS',
            index: true,
        },
        paymentMethod: { type: String, default: 'UPI' },
        txHash: { type: String },
        description: { type: String },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

const Transaction = models.Transaction || model<TransactionDocument>('Transaction', transactionSchema);

export default Transaction;
