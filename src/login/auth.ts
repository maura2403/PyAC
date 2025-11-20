import bcrypt from 'bcrypt';
import { Pool } from "pg";

const SALT_ROUNDS = 10;

export interface User {
    id: number;
    username: string;
    nombre: string | null;
    email: string | null;
}

/**
 * Hashea una contraseña usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifica una contraseña contra su hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    console.log(password);
    console.log(hash);
    return await bcrypt.compare(password, hash);
}

/**
 * Autentica un usuario con username y password
 * Retorna el usuario si las credenciales son correctas, null en caso contrario
 */
export async function autenticarUsuario(
    pool: Pool,
    username: string,
    password: string
): Promise<User | null> {
    try {
        console.log("PEPE1");
        console.log(typeof(password));
        const result = await pool.query(
            'SELECT idusuario, usuario, passhash, nombre, email FROM pyac.usuario WHERE usuario = $1',
            [username]
        );

        console.log("PEPE2");
        if (result.rows.length === 0) {
            return null;
        }

        const user = result.rows[0];

        /*if (!user.activo) {
            return null;
        }*/
        console.log("TIPOS", typeof(password));
        console.log(typeof(user.password_hash));
        const passwordValida = await verifyPassword(password, user.password_hash);

        if (!passwordValida) {
            return null;
        }

        // Actualizar último acceso
        //await client.query(
        //    'UPDATE pyac.usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1',
        //    [user.id]
        //  );

        return {
            id: user.id,
            username: user.username,
            nombre: user.nombre,
            email: user.email
        };
    } catch (error) {
        console.error('Error al autenticar usuario:', error);
        return null;
    }
}

/**
 * Crea un nuevo usuario
 */
export async function crearUsuario(
    pool: Pool,
    username: string,
    password: string,
    nombre?: string,
    email?: string
): Promise<User | null> {
    try {
        const passwordHash = await hashPassword(password);

        const result = await pool.query(
            `INSERT INTO pyac.usuarios (username, password_hash, nombre, email)
             VALUES ($1, $2, $3, $4)
             RETURNING id, username, nombre, email`,
            [username, passwordHash, nombre || null, email || null]
        );

        return result.rows[0];
    } catch (error) {
        console.error('Error al crear usuario:', error);
        return null;
    }
}

/**
 * Cambia la contraseña de un usuario
 */
export async function cambiarPassword(
    pool: Pool,
    userId: number,
    newPassword: string
): Promise<boolean> {
    try {
        const passwordHash = await hashPassword(newPassword);

        await pool.query(
            'UPDATE pyac.usuarios SET password_hash = $1 WHERE id = $2',
            [passwordHash, userId]
        );

        return true;
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        return false;
    }
}
