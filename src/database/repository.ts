import { Pool } from "pg";
import { BooleanType, DateType, EnumType, FloatType, IntegerType, Model, StringType } from "./model.js";
import { hashPassword, verifyPassword } from "../login/auth.js";
import { assertValidDateYYYYMMDD } from "../extra/utils.js";

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
        const placeholders = this.model.nonDefaultValueColumns.map((_, i) => `$${i + 1}`).join(', ');
        const query = `
            INSERT INTO ${this.schema}.${this.tableName} (${this.model.nonDefaultValueColumns.join(', ')})
            VALUES (${placeholders})
        `;
        const values = this.model.nonDefaultValueColumns.map(key => row[key]);
        await this.pool.query(query, values);
    }

    public async read(filters: Record<string, any>): Promise<Record<string, any>[]> {
        this.model.assertPartialObject(filters);
        let query = `SELECT * FROM ${this.schema}.${this.tableName}`;
        const filterKeys = Object.keys(filters);

        // Condiciones de filtro específicas
        if (filterKeys.length > 0) {
            const placeholders = filterKeys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
            query += ` WHERE ${placeholders}`;
        }

        if(this.model.allColumns.includes('activo')){
            if (filterKeys.length > 0){
                query+= ` AND activo = TRUE`;
            }
            else {
                query+= ` WHERE activo = TRUE`;
            }
        }

        const values = filterKeys.map(key => filters[key]);
        const items = await this.pool.query(query, values);
        return items.rows;
    }

    public async update(originalPKs: Record<string, any>, row: Record<string, any>): Promise<void> {
        this.model.assertPrimaryKey(originalPKs);
        this.model.assertPartialObject(row);
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

    public async delete(originalPKs: Record<string, any>): Promise<void> {
        this.model.assertPrimaryKey(originalPKs);
        const primaryKeys = Object.keys(originalPKs);

        // Miramos si la tabla tiene la columna 'activo' para saber si tenemos que hacer un borrado lógico o físico
        const logicalDelete = this.model.allColumns.includes('activo'); // Si tiene activo, entonces hacemos borrado lógico
        let query: string;
        const values = primaryKeys.map(key => originalPKs[key]);

        if(logicalDelete) {
            query = `
            UPDATE ${this.schema}.${this.tableName}
            SET activo = FALSE
            WHERE ${primaryKeys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')}
            `;
        } else { // Si no tiene activo, entonces hacemos borrado físico
            query = `
            DELETE FROM ${this.schema}.${this.tableName}
            WHERE ${primaryKeys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')}
            `;
        }
        await this.pool.query(query, values);
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
    
    // Se podría intertar abstraer para poder utilizar la implementación de los filtros hechos en el read.
    // Tiene los nombres dni, fecha, apellido, nombre hardcodeados.
    public async getwithAttendance(fecha: string): Promise<(Record<string, any>)[]>{
        assertValidDateYYYYMMDD(fecha);
        
        const query = `
            SELECT 
                a.*,
                p.fecha
            FROM ${this.model.schema}.alumnos AS a
            LEFT JOIN ${this.model.schema}.presentes AS p
                ON a.dni = p.dni AND p.fecha = $1
            ORDER BY a.apellido, a.nombre;
        `;
        const items = await this.pool.query(query, [fecha]);
        return items.rows;
    }
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
