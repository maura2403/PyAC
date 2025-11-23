import { Pool } from "pg";
import { BooleanType, DateType, EnumType, FloatType, IntegerType, Model, StringType } from "./model.js";
import { BooleanType, DateType, EnumType, FloatType, IntegerType, Model, StringType } from "./model.js";

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
        const placeholders = this.model.allColumns.map((_, i) => `$${i + 1}`).join(', ');
        const query = `
            INSERT INTO ${this.schema}.${this.tableName} (${this.model.allColumns.join(', ')})
            VALUES (${placeholders})
        `;
        const values = this.model.allColumns.map(key => row[key]);
        await this.pool.query(query, values);
    }

    public async read(filters: Record<string, any>): Promise<Record<string, any>[]> {
        this.model.assertFilter(filters);
        let query = `SELECT * FROM ${this.schema}.${this.tableName}`;
        const filterKeys = Object.keys(filters);

        // Condiciones de filtro específicas
        if (filterKeys.length > 0) {
            const placeholders = filterKeys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
            query += ` WHERE ${placeholders}`;
        }

        if(this.model.allColumns.includes('activo')){
            if(filterKeys.length > 0){ // Ya hay un WHERE
            query+= ` AND activo = TRUE`;
            } else {
            query+= ` WHERE activo = TRUE`; // No había where, esta es la única condición de filtro.    
            }
        }

        const values = filterKeys.map(key => filters[key]);
        const items = await this.pool.query(query, values);
        return items.rows;
    }

    public async update(originalPKs: Record<string, any>, row: Record<string, any>): Promise<void> {
        this.model.assertPrimaryKey(originalPKs);
        this.model.assertFullObject(row);
        const query = `
            UPDATE ${this.schema}.${this.tableName}
            SET ${this.model.allColumns.map((col, i) => `${String(col)} = $${i + this.model.primaryKeys.length + 1}`).join(', ')}
            WHERE ${this.model.primaryKeys.map((key, i) => `${String(key)} = $${i + 1}`).join(' AND ')}
        `;
        const keyValues = this.model.primaryKeys.map(key => originalPKs[key]);
        const allValues = this.model.allColumns.map(col => row[col]);
        await this.pool.query(query, [...keyValues, ...allValues]);
    }

    public async patch(originalPKs: Record<string, any>, row: Record<string, any>): Promise<void> {
        this.model.assertPrimaryKey(originalPKs);
        const primaryKeys = Object.keys(originalPKs);
        const columnsToPatch = Object.keys(row).filter(col => this.model.allColumns.includes(col));

        if(columnsToPatch.length === 0) throw new Error("PATCH debe incluir al menos una columna a actualizar");

        const setClauses = columnsToPatch.map((col, idx) => `${col} = $${idx + 1}`);

        const setValues = columnsToPatch.map(col => row[col]);


        const whereClauses = this.model.primaryKeys.map((key, i) => `${key} = $${columnsToPatch.length + i + 1}`);
        const pkValues = this.model.primaryKeys.map(key => originalPKs[key]);

    const query = `
        UPDATE ${this.model.schema}.${this.model.tableName}
        SET ${setClauses.join(", ")}
        WHERE ${whereClauses.join(" AND ")}
    `;

    await this.pool.query(query, [...setValues, ...pkValues]);
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
            UPDATE ${this.model.schema}.${this.model.tableName}
            SET activo = FALSE
            WHERE ${primaryKeys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')}
            `;
        } else { // Si no tiene activo, entonces hacemos borrado físico
            query = `
            DELETE FROM ${this.model.schema}.${this.model.tableName}
        const query = `
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
            cursoactual: new StringType(false, false, "Curso"),
            modalidadactual: new EnumType(false, false, ["Eventual", "Mensual", "Fijo"], "Modalidad"),
            cuitresppagos: new StringType(false, false, "CUIT de Responsable de pagos"),
            activo: new BooleanType(false, false, "activo")
        },
        "pyac",
        "alumno"
            curso: new StringType(false, false, "Curso"),
            modalidad: new EnumType(false, false, ["Eventual", "Mensual", "Fijo"], "Modalidad"),
            cuit_responsable_de_pagos: new EnumType(false, false, ["Jardin", "Primaria"], "Nivel"),
        }
    );
}

export class CourseRepository extends Repository {
    public readonly tableName: string = "curso";
    protected readonly model: Model = new Model(
        {
            dni: new IntegerType(false, true),
            fecha: new DateType(false, true)
        },
        "pyac",
        "asistencia"
            curso: new StringType(false, true),
            nivel: new StringType(false, false)
        }
    );
}

export class LevelRepository extends Repository {
    public readonly tableName: string = "nivel";
    protected readonly model: Model = new Model(
        {
            nivel:  new EnumType(false, true, ["Jardin", "Primaria"], "Nivel"),
            preciodiario: new FloatType(false, false, "Precio Diario Base"),
            activo: new BooleanType(false, false, "activo")
        },
        "pyac",
        "nivel"
            nivel:  new EnumType(false, true, ["Jardin", "Primaria"]),
            precio_diario: new FloatType(false, false)
        }
    );

    public async getPrice(nivel: "Jardin" | "Primaria"): Promise<number> {
        const rows = await this.read({ nivel : nivel });
        return rows[0]!.preciodiario;
    }
}

export class ModeRepository extends Repository {
    public readonly tableName: string = "modalidad";
    protected readonly model: Model = new Model(
        {
            modalidad: new EnumType(true, false, ["Eventual", "Mensual", "Fijo"]),
            descuento: new FloatType(false, false)
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
            id_usuario: new IntegerType(false, true),
            nombre: new StringType(false, false),
            usuario: new StringType(false, false),
            email: new StringType(false, false),
            password_hash: new StringType(false, false)
        }
    );

}
