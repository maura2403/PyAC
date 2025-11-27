import { hashPassword, verifyPassword } from "../../login/auth.js";
import { poolDb } from "../client.js";
import { Model, IntegerType, StringType } from "../model.js";
import { Repository } from "../repository.js";

export class UserRepository extends Repository {
    public readonly tableName: string = "usuario";
    protected readonly model: Model = new Model(
        {
            id_usuario: new IntegerType(false, true, undefined, true),
            nombre: new StringType(false, false),
            usuario: new StringType(false, false),
            email: new StringType(false, false),
            password_hash: new StringType(false, false)
        }
    );

    public async createUser(username: string, password: string, nombre: string, email: string): Promise<void> {
        const row = {
            nombre : nombre,
            usuario : username,
            email : email,
            password_hash : await hashPassword(password)
        };
        await this.create(row);
    }

    public async changePassword(userId: number, newPassword: string): Promise<void> {
        const pks = {
            id_usuario : userId
        };
        const row = {
            id_usuario : userId,
            password_hash : await hashPassword(newPassword)
        };
        await this.update(pks, row);
    }

    public async authenticateUser(username: string, password: string): Promise<Record<string, any> | null> {
        const rows = await this.read({usuario : username });
        const usuario = rows[0];
        if (!usuario) { return null; }

        const passwordValida = await verifyPassword(password, usuario['password_hash'] as string);
        if (!passwordValida) { return null; }

        return usuario;
    }
}

export const userRepo = new UserRepository(poolDb);