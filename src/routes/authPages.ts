import { Router }  from "express";

const router = Router();

declare module 'express-session' {
    interface SessionData {
        user?: Record<string, any>;
    }
}

router.get('/app/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render("login");
});

export default router;