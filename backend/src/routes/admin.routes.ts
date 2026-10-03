import { Router } from 'express';
import {
    getDashboardOverview,
    getUsers,
    createUser,
    getUserDetails,
    updateUser,
    resetUserPassword,
    deleteUser,
    getDevices,
    createDevice,
    updateDevice,
    deleteDevice,
    getDeviceTelemetry,
    getEnergyMonitoring,
    getAlerts,
    updateAlert,
    deleteAlert,
    getTransactions,
    getSmartContracts,
    createSmartContract,
    updateSmartContract,
    getMarketplace,
    updateMarketplaceListing,
    getSystemLogs,
    getSettings,
    updateSettings,
    getUserWithPassword,
} from '../controllers/admin.controller';

const adminRouter = Router();

// 1. Admin Dashboard Overview
adminRouter.get('/dashboard', getDashboardOverview);

// 2. Users Management
adminRouter.get('/users', getUsers);
adminRouter.post('/users', createUser);
adminRouter.get('/users/:id', getUserDetails);
adminRouter.patch('/users/:id', updateUser);
adminRouter.post('/users/:id/reset-password', resetUserPassword);
adminRouter.delete('/users/:id', deleteUser);

// 3. Devices Management
adminRouter.get('/devices', getDevices);
adminRouter.post('/devices', createDevice);
adminRouter.patch('/devices/:id', updateDevice);
adminRouter.delete('/devices/:id', deleteDevice);
adminRouter.get('/devices/:id/telemetry', getDeviceTelemetry);

// 4. Energy Monitoring
adminRouter.get('/energy', getEnergyMonitoring);

// 5. Alerts Management
adminRouter.get('/alerts', getAlerts);
adminRouter.patch('/alerts/:id', updateAlert);
adminRouter.delete('/alerts/:id', deleteAlert);

// 6. Transactions Management
adminRouter.get('/transactions', getTransactions);

// 7. Smart Contracts Management
adminRouter.get('/contracts', getSmartContracts);
adminRouter.post('/contracts', createSmartContract);
adminRouter.patch('/contracts/:id', updateSmartContract);

// 8. P2P Marketplace Management
adminRouter.get('/marketplace', getMarketplace);
adminRouter.patch('/marketplace/:id', updateMarketplaceListing);

// 9. System Logs (Audit Trail)
adminRouter.get('/logs', getSystemLogs);

// 10. Admin Settings
adminRouter.get('/settings', getSettings);
adminRouter.patch('/settings', updateSettings);

// Dev helper preserved
if (process.env.NODE_ENV !== 'production') {
    adminRouter.get('/dev/users/:id/password', getUserWithPassword);
}

export default adminRouter;
