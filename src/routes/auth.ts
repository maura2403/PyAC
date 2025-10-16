import express, { Router }  from "express";
import { autenticarUsuario, crearUsuario } from '../login/auth.js';
import { requireAuth } from "../middleware/auth.js"
import { getDbClient } from "../database/client.js"

const router = Router();


// API de login
router.post('/api/v0/auth/login', express.json(), async (req, res) => {
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
router.post('/api/v0/auth/logout', (req, res) => {
    req.session.destroy((err: any) => {
        if (err) {
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        return res.json({ success: true });
    });
});


// Endpoint para crear usuario (solo para desarrollo/setup inicial)
router.post('/api/v0/auth/register', express.json(), async (req, res) => {
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

export default router;