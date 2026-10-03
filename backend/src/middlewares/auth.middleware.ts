import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import userService from '../services/user.service';
import { verifyToken } from '../utils/crypto.service';
import { responseMessages } from '../utils/response-message.service';
import { sendUnauthorizedResponse } from '../utils/response.service';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            return sendUnauthorizedResponse(res, responseMessages.tokenInvalid);
        }

        const decoded: JwtPayload | null = verifyToken(token);
        if (!decoded) {
            return sendUnauthorizedResponse(res, responseMessages.tokenInvalid);
        }

        const userData = await userService.findUserById(decoded.userId);
        if (!userData) {
            return sendUnauthorizedResponse(res, responseMessages.tokenInvalid);
        }

        const userObj = userData.toJSON();
        res.locals.auth = {
            user: userObj
        };
        (req as Request & { userId?: string; user?: any }).userId = decoded.userId as string;
        (req as Request & { userId?: string; user?: any }).user = userObj;
        next();
    } catch (error) {
        return sendUnauthorizedResponse(res, responseMessages.tokenInvalid);
    }
};

/**
 * Middleware to restrict access to ADMIN users only.
 * Must be preceded by authenticateToken middleware.
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = res.locals.auth?.user || (req as any).user;
        if (!user) {
            return sendUnauthorizedResponse(res, 'Authentication required');
        }

        if (user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: Administrator privileges required to access this resource.'
            });
        }

        if (user.status === 'INACTIVE') {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Access denied.'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authorization error'
        });
    }
};