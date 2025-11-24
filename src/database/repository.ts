import { Pool } from "pg";
import { DateType, EnumType, FloatType, IntegerType, Model, StringType } from "./model.js";
import { assertValidDateYYYYMMDD } from "../extra/utils.js";

export abstract class Repository {
    public get tableName(): string {
        return this.model.tableName;
    }
    public get frontData(): Record<string, any> {
        return this.model.frontData;
    }
    protected abstract readonly model: Model;
    protected readonly pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    public async create(row: Record<string, any>): Promise<void> {
        this.model.assertFullObject(row);
        const placeholders = this.model.allColumns.map((_, i) => `$${i + 1}`).join(', ');
        const query = `
            INSERT INTO ${this.model.schema}.${this.model.tableName} (${this.model.allColumns.join(', ')})
            VALUES (${placeholders})
        `;
        const values = this.model.allColumns.map(key => row[key]);
        await this.pool.query(query, values);
    }

    public async read(filters: Record<string, any>): Promise<Record<string, any>[]> {
        this.model.assertFilter(filters);
        let query = `SELECT * FROM ${this.model.schema}.${this.model.tableName}`;
        const filterKeys = Object.keys(filters);

        if (filterKeys.length > 0) {
            const placeholders = filterKeys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
            query += ` WHERE ${placeholders}`;
        }

        const values = filterKeys.map(key => filters[key]);
        const items = await this.pool.query(query, values);
        return items.rows;
    }

    public async update(originalPKs: Record<string, any>, row: Record<string, any>): Promise<void> {
        this.model.assertPrimaryKey(originalPKs);
        this.model.assertFullObject(row);
        const query = `
            UPDATE ${this.model.schema}.${this.model.tableName}
            SET ${this.model.allColumns.map((col, i) => `${String(col)} = $${i + this.model.primaryKeys.length + 1}`).join(', ')}
            WHERE ${this.model.primaryKeys.map((key, i) => `${String(key)} = $${i + 1}`).join(' AND ')}
        `;
        const keyValues = this.model.primaryKeys.map(key => originalPKs[key]);
        const allValues = this.model.allColumns.map(col => row[col]);
        await this.pool.query(query, [...keyValues, ...allValues]);
    }

    public async delete(originalPKs: Record<string, any>): Promise<void> {
        this.model.assertPrimaryKey(originalPKs);
        const primaryKeys = Object.keys(originalPKs);
        const query = `
            DELETE FROM ${this.model.schema}.${this.model.tableName}
            WHERE ${primaryKeys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')}
        `
        const values = primaryKeys.map(key => originalPKs[key]);
        await this.pool.query(query, values);
    }
}

export class StudentRepository extends Repository {
    protected readonly model: Model = new Model(
        {
            dni: new IntegerType(false, true, "DNI del alumno"),
            nombre: new StringType(false, false, "Nombre"),
            apellido: new StringType(false, false, "Apellido"),
            curso: new StringType(false, false, "Curso"),
            modalidad: new EnumType(false, false, ["Eventual", "Mensual", "Fijo"], "Modalidad"),
            nivel: new EnumType(false, false, ["Jardin", "Primaria"], "Nivel"),
            responsable_de_pagos: new StringType(false, false, "Responsable de pagos"),
            responsable1: new StringType(true, false, "Responsable 1")
        },
        "Pyac",
        "Alumnos"
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


export class AttendanceRepository extends Repository {
    protected readonly model: Model = new Model(
        {
            dni: new IntegerType(false, true),
            fecha: new DateType(false, true)
        },
        "Pyac",
        "Presentes"
    );
}

export class LevelRepository extends Repository {
    protected readonly model: Model = new Model(
        {
            nivel:  new EnumType(false, true, ["Jardin", "Primaria"]),
            precio: new FloatType(false, false)
        },
        "Pyac",
        "Niveles"
    );

    public async getPrice(nivel: "Jardin" | "Primaria"): Promise<number> {
        const rows = await this.read({ nivel : nivel });
        return rows[0]!.precio;
    }
}

export class InvoiceRepository extends Repository {
    protected readonly model: Model = new Model(
        {
            dni: new IntegerType(false, true),
            fecha_de_emision: new DateType(false, true),
            precio: new FloatType(false, false),
            fecha_de_pago: new DateType(true, false)
        },
        "Pyac",
        "Facturas"
    );
}