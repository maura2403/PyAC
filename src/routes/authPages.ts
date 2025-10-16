import { Router }  from "express";
import type { User } from '../login/auth.js';

const router = Router();

declare module 'express-session' {
    interface SessionData {
        user?: User;
    }
}

// Página de login
router.get('/app/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render("login");
});

export default router;