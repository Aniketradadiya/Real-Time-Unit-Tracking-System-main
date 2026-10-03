import User from '../models/user.model';
import Transaction from '../models/transaction.model';
import SmartContract from '../models/smart-contract.model';
import SystemLog from '../models/system-log.model';
import SystemSetting from '../models/system-setting.model';
import Device from '../models/device.model';
import Alert from '../models/alert.model';
import { hashAsync } from '../utils/crypto.service';
import Logger from '../utils/logger.service';

export class AdminSeedService {
    public static async seedInitialData(): Promise<void> {
        try {
            await this.seedAdminUser();
            await this.seedSystemSettings();
            await this.seedSmartContracts();
            await this.seedTransactions();
            await this.seedInitialLogs();
            Logger.info('Admin seed verification completed.');
        } catch (error) {
            Logger.error('Error during admin data seeding:', error);
        }
    }

    private static async seedAdminUser(): Promise<void> {
        const existingAdmin = await User.findOne({ role: 'ADMIN', isDeleted: false });
        if (!existingAdmin) {
            const adminEmail = 'admin@rtut.com';
            const userWithEmail = await User.findOne({ email: adminEmail });

            if (userWithEmail) {
                userWithEmail.role = 'ADMIN';
                userWithEmail.status = 'ACTIVE';
                await userWithEmail.save();
                Logger.info(`Updated existing user ${adminEmail} to ADMIN role.`);
            } else {
                const hashedPassword = await hashAsync('AdminPassword@123');
                await User.create({
                    name: 'System Administrator',
                    email: adminEmail,
                    password: hashedPassword,
                    mobile: '+91 9876543210',
                    address: 'Central Power Control Station, Grid Operations HQ',
                    energyLimit: 100,
                    role: 'ADMIN',
                    status: 'ACTIVE',
                    lastActive: new Date(),
                    isDeleted: false,
                });
                Logger.info(`Default Admin account created successfully: ${adminEmail} (password: AdminPassword@123)`);
            }
        }
    }

    private static async seedSystemSettings(): Promise<void> {
        const count = await SystemSetting.countDocuments();
        if (count === 0) {
            await SystemSetting.create({
                key: 'primary',
                systemName: 'GridOS Electricity & IoT Management Platform',
                energyMonitoringInterval: 5,
                defaultEnergyLimit: 25,
                tariffRatePerKwh: 6.0,
                alertThresholds: {
                    highPowerThresholdWatts: 3000,
                    offlineTimeoutMinutes: 5,
                    criticalPowerThresholdWatts: 5000,
                },
                userSettings: {
                    allowRegistration: true,
                    defaultRole: 'USER',
                    requireEmailVerification: false,
                },
                deviceSettings: {
                    deviceTimeoutSeconds: 300,
                    offlineThresholdMinutes: 5,
                    dataRefreshIntervalSeconds: 2,
                },
                alertSettings: {
                    enableAlerts: true,
                    criticalAlertThreshold: 4500,
                    notifyEmail: true,
                    notifyPush: true,
                },
                securitySettings: {
                    sessionTimeoutMinutes: 1440,
                    requireStrongPassword: true,
                    maxFailedLogins: 5,
                },
            });
            Logger.info('Default system settings seeded.');
        }
    }

    private static async seedSmartContracts(): Promise<void> {
        const count = await SmartContract.countDocuments();
        if (count === 0) {
            await SmartContract.insertMany([
                {
                    contractAddress: '0x71C841BC516a75A77e112d7c5F1a7FceFDE8E079',
                    name: 'GridOS Energy Settlement Protocol v2',
                    network: 'Ethereum Mainnet',
                    deploymentStatus: 'DEPLOYED',
                    owner: '0x43b0c95E05F255a297746EbF4C686E2333bB2F04',
                    deploymentDate: new Date('2025-11-14T10:00:00Z'),
                    txHash: '0x9fa8e71c981273901bca280145217482811a2f6029d5b03487f872132d9f7831',
                    compilerVersion: 'Solidity 0.8.23',
                    eventsCount: 1420,
                    isActive: true,
                },
                {
                    contractAddress: '0x32A4f1412Ce97E69f52A47817D50fE3263eB24a9',
                    name: 'P2P Microgrid Trade Registry',
                    network: 'Ethereum Mainnet',
                    deploymentStatus: 'DEPLOYED',
                    owner: '0x43b0c95E05F255a297746EbF4C686E2333bB2F04',
                    deploymentDate: new Date('2026-01-20T14:30:00Z'),
                    txHash: '0x47ba9c29801416e885b2e9211c42289f67a3f0194821a8c90382894fa817291a',
                    compilerVersion: 'Solidity 0.8.23',
                    eventsCount: 865,
                    isActive: true,
                },
                {
                    contractAddress: '0x18Bfa4571A9160Cc9580b0D7513C3b85B9E83912',
                    name: 'ESP32 Hardware Oracle & Meter Proofs',
                    network: 'Sepolia Testnet',
                    deploymentStatus: 'DEPLOYED',
                    owner: '0x43b0c95E05F255a297746EbF4C686E2333bB2F04',
                    deploymentDate: new Date('2026-03-01T08:15:00Z'),
                    txHash: '0x88cc2918fa40192837bc28192039148bc8921a48c20148fa891278bc2918a931',
                    compilerVersion: 'Solidity 0.8.23',
                    eventsCount: 3410,
                    isActive: true,
                },
            ]);
            Logger.info('Initial smart contracts seeded.');
        }
    }

    private static async seedTransactions(): Promise<void> {
        const count = await Transaction.countDocuments();
        if (count === 0) {
            const admin = await User.findOne({ role: 'ADMIN' });
            const sampleUser = (await User.findOne({ role: 'USER' })) || admin;

            await Transaction.insertMany([
                {
                    transactionId: 'TXN-20261001-001',
                    userId: sampleUser?._id,
                    userName: sampleUser?.name || 'Energy Consumer',
                    userEmail: sampleUser?.email || 'consumer@rtut.local',
                    type: 'WALLET_RECHARGE',
                    amount: 2000,
                    energyUnits: 333.33,
                    status: 'SUCCESS',
                    paymentMethod: 'UPI Instant',
                    txHash: '0xfeed8129a01948ba281920394812a89104812f89',
                    description: 'Instant prepaid wallet recharge',
                    createdAt: new Date(Date.now() - 86400000),
                },
                {
                    transactionId: 'TXN-20261001-002',
                    userId: sampleUser?._id,
                    userName: sampleUser?.name || 'Energy Consumer',
                    userEmail: sampleUser?.email || 'consumer@rtut.local',
                    type: 'ENERGY_PAYMENT',
                    amount: 340.5,
                    energyUnits: 56.75,
                    status: 'SUCCESS',
                    paymentMethod: 'Prepaid Deduct',
                    txHash: '0x88aa410291481bca092147102948c21a48210381',
                    description: 'Automated 24h meter consumption settlement',
                    createdAt: new Date(Date.now() - 3600000 * 3),
                },
                {
                    transactionId: 'TXN-20261002-003',
                    userId: sampleUser?._id,
                    userName: sampleUser?.name || 'Energy Consumer',
                    userEmail: sampleUser?.email || 'consumer@rtut.local',
                    type: 'P2P_TRANSACTION',
                    amount: 412.0,
                    energyUnits: 80,
                    status: 'SUCCESS',
                    paymentMethod: 'P2P Smart Contract',
                    txHash: '0x4d1180aa2918237bca09214710293812837bc281',
                    description: 'Rooftop solar excess export to NODE-BETA-04',
                    createdAt: new Date(Date.now() - 3600000 * 5),
                },
                {
                    transactionId: 'TXN-20261002-004',
                    userId: sampleUser?._id,
                    userName: sampleUser?.name || 'Energy Consumer',
                    userEmail: sampleUser?.email || 'consumer@rtut.local',
                    type: 'P2P_TRANSACTION',
                    amount: 220.5,
                    energyUnits: 45,
                    status: 'SUCCESS',
                    paymentMethod: 'P2P Smart Contract',
                    txHash: '0x6c2a91ff028471bca8210381748291048b291038',
                    description: 'P2P buy order settled with NODE-GAMMA',
                    createdAt: new Date(Date.now() - 1000 * 60 * 25),
                },
                {
                    transactionId: 'TXN-20261002-005',
                    userId: sampleUser?._id,
                    userName: sampleUser?.name || 'Energy Consumer',
                    userEmail: sampleUser?.email || 'consumer@rtut.local',
                    type: 'WALLET_RECHARGE',
                    amount: 5000,
                    energyUnits: 833.33,
                    status: 'SUCCESS',
                    paymentMethod: 'Credit Card',
                    txHash: '0x91be8f041928471bca281920394812a89104812f',
                    description: 'Commercial node wallet replenishment',
                    createdAt: new Date(Date.now() - 3600000 * 12),
                },
            ]);
            Logger.info('Initial transactions seeded.');
        }
    }

    private static async seedInitialLogs(): Promise<void> {
        const count = await SystemLog.countDocuments();
        if (count === 0) {
            await SystemLog.insertMany([
                {
                    logId: `LOG-${Date.now() - 7200000}-01`,
                    actor: { email: 'system@rtut.local', name: 'System Daemon', role: 'SYSTEM' },
                    action: 'SYSTEM_BOOT',
                    resource: 'Core Server v1.0.0',
                    ipAddress: '127.0.0.1',
                    userAgent: 'Node.js/Express System Service',
                    details: 'GridOS Central Ingestion and Monitoring Service booted',
                    result: 'SUCCESS',
                    timestamp: new Date(Date.now() - 7200000),
                },
                {
                    logId: `LOG-${Date.now() - 3600000}-02`,
                    actor: { email: 'admin@rtut.com', name: 'System Administrator', role: 'ADMIN' },
                    action: 'ROLE_VERIFIED',
                    resource: 'Security Subsystem',
                    ipAddress: '127.0.0.1',
                    userAgent: 'GridOS Admin Console',
                    details: 'Administrator session authenticated and privileges verified',
                    result: 'SUCCESS',
                    timestamp: new Date(Date.now() - 3600000),
                },
                {
                    logId: `LOG-${Date.now() - 1800000}-03`,
                    actor: { email: 'admin@rtut.com', name: 'System Administrator', role: 'ADMIN' },
                    action: 'DEVICE_REGISTERED',
                    resource: 'Device: ESP32-GRID-NODE-01',
                    ipAddress: '127.0.0.1',
                    userAgent: 'GridOS Admin Console',
                    details: 'Main ESP32 Smart Meter linked to telemetry pipeline',
                    result: 'SUCCESS',
                    timestamp: new Date(Date.now() - 1800000),
                },
            ]);
            Logger.info('Initial system audit logs seeded.');
        }
    }
}

export default AdminSeedService;
