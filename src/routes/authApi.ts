import express, { Router }  from "express";
import { poolDb } from "../database/client.js";
import { UserRepository } from "../database/repository/userRepository.js";

const userRepo = new UserRepository(poolDb);
const router = Router();

router.post('/api/auth/login', express.json(), async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    try {
        const usuario = await userRepo.authenticateUser(username, password);

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
    }
});

export default router;