import { Pool } from "pg";
import { BooleanType, DateType, EnumType, FloatType, IntegerType, Model, StringType } from "./model.js";
import { hashPassword, verifyPassword } from "../login/auth.js";

export abstract class Repository {
    public get frontData(): Record<string, any> {
        return this.model.frontData;
    }
    protected abstract readonly model: Model;
    protected readonly pool: Pool;

    protected readonly schema: string = "Pyac";
    public abstract readonly tableName: string;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    public async create(row: Record<string, any>): Promise<void> {
        this.model.assertFullObject(row);
        if (this.model.logicalDelete) {
            await this.logicalCreate(row);
        }
        else {
            await this.defaultCreate(row);
        }
    }

    public async read(filters: Record<string, any>): Promise<Record<string, any>[]> {
        this.model.assertPartialObject(filters);
        let rows;
        if (this.model.logicalDelete) {
            rows = await this.logicalRead(filters);
        }
        else {
            rows = await this.defaultRead(filters);
        }
        return rows;
    }

    public async update(originalPKs: Record<string, any>, row: Record<string, any>): Promise<void> {
        this.model.assertPrimaryKey(originalPKs);
        this.model.assertPartialObject(row);
        if (this.model.logicalDelete) {
            await this.logicalUpdate(originalPKs, row);
        }
        else {
            await this.defaultUpdate(originalPKs, row);
        }
    }

    public async delete(originalPKs: Record<string, any>): Promise<void> {
        this.model.assertPrimaryKey(originalPKs);
        if (this.model.logicalDelete) {
            await this.logicalDelete(originalPKs);
        }
        else {
            await this.defaultDelete(originalPKs);
        }
    }

    private async defaultCreate(row: Record<string, any>) {
        const placeholders = this.model.nonDefaultValueColumns.map((_, i) => `$${i + 1}`).join(', ');
        const query = `
                INSERT INTO ${this.schema}.${this.tableName} (${this.model.nonDefaultValueColumns.join(', ')})
                VALUES (${placeholders})
            `;
        const values = this.model.nonDefaultValueColumns.map(key => row[key]);
        await this.pool.query(query, values);
    }

    private async logicalCreate(row: Record<string, any>): Promise<void> {
        const filter = this.getPrimaryKeys(row);
        const rows = await this.read(filter);
        if (rows.length > 0) {
            await this.update(filter, { ...row, activo : true } );
        }
        else {
            await this.defaultCreate(row);
        }
    }

    private async defaultRead(filters: Record<string, any>): Promise<Record<string, any>[]> {
        let query = `SELECT * FROM ${this.schema}.${this.tableName}`;
        const filterKeys = Object.keys(filters);
        if (filterKeys.length > 0) {
            const placeholders = filterKeys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
            query += ` WHERE ${placeholders}`;
        }
        const values = filterKeys.map(key => filters[key]);
        const items = await this.pool.query(query, values);
        return items.rows;
    }

    private async logicalRead(filters: Record<string, any>): Promise<Record<string, any>[]> {
        return await this.defaultRead({ ...filters, activo : true });
    }

    private async defaultUpdate(originalPKs: Record<string, any>, row: Record<string, any>) {
        const columnsToUpdate = Object.keys(row).filter(col => this.model.allColumns.includes(col));
        const query = `
            UPDATE ${this.schema}.${this.tableName}
            SET ${columnsToUpdate.map((col, i) => `${String(col)} = $${i + this.model.primaryKeys.length + 1}`).join(', ')}
            WHERE ${this.model.primaryKeys.map((key, i) => `${String(key)} = $${i + 1}`).join(' AND ')}
        `;
        const keyValues = this.model.primaryKeys.map(key => originalPKs[key]);
        const updateValues = columnsToUpdate.map(col => row[col]);
        await this.pool.query(query, [...keyValues, ...updateValues]);
    }

    private async logicalUpdate(originalPKs: Record<string, any>, row: Record<string, any>): Promise<void> {
        const rows = await this.read(originalPKs);
        if (rows.length > 0) {
            const obj = rows[0]!;
            if (obj['activo']) {
                await this.defaultUpdate(originalPKs, row);
            }
            else {
                throw new Error('Cannot update an innactive object.');
            }
        }
    }

    private async defaultDelete(originalPKs: Record<string, any>): Promise<void> {
        const query = `
                DELETE FROM ${this.schema}.${this.tableName}
                WHERE ${this.model.primaryKeys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')}
            `;
        const values = this.model.primaryKeys.map(key => originalPKs[key]);
        await this.pool.query(query, values);
    }

    private async logicalDelete(originalPKs: Record<string, any>): Promise<void> {
        await this.update(originalPKs, { 'activo' : false });
    }

    private getPrimaryKeys(row: Record<string, any>): Record<string, any> {
        const pkObject = Object.keys(this.model.primaryKeys).reduce((acc, key) => {
            acc[key] = row[key];
            return acc;
        }, {} as Record<string, any>);
        return pkObject;
    }
}

export class StudentRepository extends Repository {
    public readonly tableName: string = "alumno";
    protected readonly model: Model = new Model(
        {
            dni: new IntegerType(false, true, "DNI"),
            nombre: new StringType(false, false, "Nombre"),
            apellido: new StringType(false, false, "Apellido"),
            curso: new StringType(false, false, "Curso"),
            modalidad: new EnumType(false, false, ["Eventual", "Mensual", "Fijo"], "Modalidad"),
            cuit_responsable_de_pagos: new StringType(false, false, "CUIT de Responsable de pagos"),
            activo: new BooleanType(false, false, '', true)
        },
    );
}

export class CourseRepository extends Repository {
    public readonly tableName: string = "curso";
    protected readonly model: Model = new Model(
        {
            curso: new StringType(false, true),
            nivel: new StringType(false, false),
            activo: new BooleanType(false, false, '', true)
        }
    );
}

export class LevelRepository extends Repository {
    public readonly tableName: string = "nivel";
    protected readonly model: Model = new Model(
        {
            nivel:  new EnumType(false, true, ["Jardin", "Primaria"], "Nivel"),
            precio_diario: new FloatType(false, false, "Precio Diario Base"),
            activo: new BooleanType(false, false, '', true)
        }
    );

    public async getPrice(nivel: "Jardin" | "Primaria"): Promise<number> {
        const rows = await this.read({ nivel : nivel });
        return rows[0]!.precio_diario;
    }
}

export class ModeRepository extends Repository {
    public readonly tableName: string = "modalidad";
    protected readonly model: Model = new Model(
        {
            modalidad: new EnumType(true, false, ["Eventual", "Mensual", "Fijo"]),
            descuento: new FloatType(false, false),
            activo: new BooleanType(false, false, '', true)
        }
    );
}

export class FixedStudentRepository extends Repository {
    public readonly tableName: string = "alumno_fijo";
    protected readonly model: Model = new Model(
        {
            dni: new IntegerType(false, true),
            dia_de_la_semana: new EnumType(false, true, ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"])
        }
    );
}

export class AttendanceRepository extends Repository {
    public readonly tableName: string = "asistencia";
    protected readonly model: Model = new Model(
        {
            dni: new IntegerType(false, true),
            fecha: new DateType(false, true)
        }
    );
}

export class InvoiceRepository extends Repository {
    public readonly tableName: string = "factura";
    protected readonly model: Model = new Model(
        {
            dni: new IntegerType(false, true),
            fecha_de_emision: new DateType(false, true),
            es_mensual: new BooleanType(false, true),
            monto: new FloatType(false, false),
            pagado: new BooleanType(false, false),
            fecha_de_pago: new DateType(true, false)
        }
    );
}

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
