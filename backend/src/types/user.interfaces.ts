export interface UserPayload {
    email?: string;
    mobile?: string;
    name?: string;
    password?: string;
    address?: string;
    role?: 'USER' | 'ADMIN';
    status?: 'ACTIVE' | 'INACTIVE';
    energyLimit?: number;
    lastActive?: Date;
}