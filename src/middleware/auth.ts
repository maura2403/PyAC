import type { Request, Response, NextFunction } from "express";

// Middleware de autenticación para el frontend
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/app/login');
    }
}

// Middleware de autenticación para el backend
export function requireAuthAPI(req: Request, res: Response, next: NextFunction) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'No autenticado' });
    }
}
