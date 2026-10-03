import { User, UserModel } from './user.model';
import { Device, DeviceModel } from './device.model';
import { Alert, AlertModel } from './alert.model';
import { Telemetry, TelemetryModel } from './telemetry.model';
import { Transaction, TransactionModel } from './transaction.model';
import { SmartContract, SmartContractModel } from './smart-contract.model';
import { SystemLog, SystemLogModel } from './system-log.model';
import { SystemSetting, SystemSettingModel } from './system-setting.model';

export const initAssociations = () => {
    // User - Device
    UserModel.hasMany(DeviceModel, { foreignKey: 'userId', as: 'devices', onDelete: 'CASCADE' });
    DeviceModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });

    // User - Alert
    UserModel.hasMany(AlertModel, { foreignKey: 'userId', as: 'alerts', onDelete: 'CASCADE' });
    AlertModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });

    // User - Telemetry
    UserModel.hasMany(TelemetryModel, { foreignKey: 'userId', as: 'telemetries', onDelete: 'CASCADE' });
    TelemetryModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });

    // User - Transaction
    UserModel.hasMany(TransactionModel, { foreignKey: 'userId', as: 'transactions', onDelete: 'SET NULL' });
    TransactionModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });
};

export {
    User,
    UserModel,
    Device,
    DeviceModel,
    Alert,
    AlertModel,
    Telemetry,
    TelemetryModel,
    Transaction,
    TransactionModel,
    SmartContract,
    SmartContractModel,
    SystemLog,
    SystemLogModel,
    SystemSetting,
    SystemSettingModel,
};

export default {
    User,
    Device,
    Alert,
    Telemetry,
    Transaction,
    SmartContract,
    SystemLog,
    SystemSetting,
    initAssociations,
};
