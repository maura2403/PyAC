import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/routes.js"; // Importamos el router con las rutas para nuestro servidor
import session from 'express-session';
import { autenticarUsuario, crearUsuario } from './login/auth.js';
import * as fs from 'fs';
import { Client } from "pg";

import type { User } from './login/auth.js';
import type SessionData from 'express-session';
import type { Request, Response, NextFunction } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(express.text({ type: "text/csv", limit: "10mb" }));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../static")));

// Configuración de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'cambiar_este_secreto_en_produccion',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 día
    }
}));

// Montamos todas las rutas
app.use(routes);

app.listen(PORT, () => {
    console.log(`Example app listening on port http://localhost:${PORT}`);
});

declare module 'express-session' {
    interface SessionData {
        user?: User;
    }
}

// Pendiente cambiar de lugar.
async function getDbClient(){
    const clientDb = new Client();
    await clientDb.connect();
    return clientDb;
}



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

///////////////////////////

// Página de login
app.get('/app/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render("login");
});

// API de login
app.post('/api/v0/auth/login', express.json(), async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const clientDb = await getDbClient();

    try {
        const usuario = await autenticarUsuario(clientDb, username, password);

        if (usuario) {
            req.session.user = usuario;
            return res.json({
                success: true,
                usuario: {
                    username: usuario.username,
                    nombre: usuario.nombre
                }
            });
        } else {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ error: 'Error en el servidor' });
    } finally {
        await clientDb.end();
    }
});

// API de logout
app.post('/api/v0/auth/logout', (req, res) => {
    req.session.destroy((err: any) => {
        if (err) {
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        return res.json({ success: true });
    });
});


// Endpoint para crear usuario (solo para desarrollo/setup inicial)
app.post('/api/v0/auth/register', express.json(), async (req, res) => {
    const { username, password, nombre, email } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const clientDb = await getDbClient();

    try {
        const usuario = await crearUsuario(clientDb, username, password, nombre, email);

        if (usuario) {
            return res.status(201).json({
                success: true,
                usuario: {
                    username: usuario.username,
                    nombre: usuario.nombre
                }
            });
        } else {
            return res.status(400).json({ error: 'No se pudo crear el usuario' });
        }
    } catch (error) {
        console.error('Error al crear usuario:', error);
        return res.status(500).json({ error: 'Error en el servidor' });
    } finally {
        await clientDb.end();
    }
});
