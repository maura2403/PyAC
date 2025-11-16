import { Pool } from "pg";
import { DateType, FloatType, IntegerType, ModalidadType, Model, NivelType, StringType } from "./model.js";

export abstract class Repository {
    public get tableName(): string {
        return this.model.tableName;
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
            dni: new IntegerType(false, true),
            nombre: new StringType(),
            apellido: new StringType(),
            curso: new StringType(),
            modalidad: new ModalidadType(),
            nivel: new NivelType(),
            responsable_de_pagos: new StringType(),
            responsable1: new StringType(true)
        },
        "Pyac",
        "Alumnos"
    );
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
            nivel: new NivelType(false, true),
            precio: new FloatType()
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
            precio: new FloatType(),
            fecha_de_pago: new DateType(true)
        },
        "Pyac",
        "Facturas"
    );
}