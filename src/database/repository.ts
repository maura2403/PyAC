import { Pool } from "pg";
import { arraySameElements } from "../extra/utils.js";

export abstract class Repository {
    public abstract readonly primaryKeys: string[];
    public abstract readonly nonPrimaryKeys: string[];
    public get allColumns(): string[] {
        return [...this.primaryKeys, ...this.nonPrimaryKeys];
    }
    public abstract readonly schema: string;
    public abstract readonly table: string;

    protected readonly pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    private assertPrimaryKey(pk: Record<string, any>): void {
        const keys = Object.keys(pk);
        if (!arraySameElements(keys, this.primaryKeys)) {
            throw new Error(`The object ${JSON.stringify(pk)} isn't a valid PK for ${this.constructor.name}.`);
        }
    }

    private assertFullObject(row: Record<string, any>): void {
        const keys = Object.keys(row);
        if (!arraySameElements(keys, this.allColumns)) {
            throw new Error(`The object ${JSON.stringify(row)} isn't a valid Object for ${this.constructor.name}.`);
        }
    }

    private assertFilter(filter: Record<string, any>) {
        const keys = Object.keys(filter);
        if (keys.some(key => !this.allColumns.includes(key))) {
            throw new Error(`The object ${JSON.stringify(filter)} isn't a valid Filter for ${this.constructor.name}.`);
        }
    }

    public async create(row: Record<string, any>): Promise<void> {
        this.assertFullObject(row);

        const placeholders = this.allColumns.map((_, i) => `$${i + 1}`).join(', ');
        const query = `
            INSERT INTO ${this.schema}.${this.table} (${this.allColumns.join(', ')})
            VALUES (${placeholders})
        `;
        const values = this.allColumns.map(key => row[key]);
        await this.pool.query(query, values);
    }

    public async read(filters: Record<string, any>): Promise<Record<string, any>[]> {
        this.assertFilter(filters);

        let query = `SELECT * FROM ${this.schema}.${this.table}`;
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
        this.assertPrimaryKey(originalPKs);
        this.assertFullObject(row);

        const query = `
            UPDATE ${this.schema}.${this.table}
            SET ${this.allColumns.map((col, i) => `${String(col)} = $${i + this.primaryKeys.length + 1}`).join(', ')}
            WHERE ${this.primaryKeys.map((key, i) => `${String(key)} = $${i + 1}`).join(' AND ')}
        `;
        const keyValues = this.primaryKeys.map(key => originalPKs[key]);
        const allValues = this.allColumns.map(col => row[col]);
        await this.pool.query(query, [...keyValues, ...allValues]);
    }

    public async delete(originalPKs: Record<string, any>): Promise<void> {
        this.assertPrimaryKey(originalPKs);

        const primaryKeys = Object.keys(originalPKs);
        const query = `
            DELETE FROM ${this.schema}.${this.table}
            WHERE ${primaryKeys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')}
        `
        const values = primaryKeys.map(key => originalPKs[key]);
        await this.pool.query(query, values);
    }
}

export class StudentRepository extends Repository {
    public readonly primaryKeys: string[] = ["id_alumno"];
    public readonly nonPrimaryKeys: string[] = ["nombre", "apellido", "curso", "modalidad", "responsable_de_pagos", "responsable1"];
    public readonly schema: string = "pyac";
    public readonly table: string = "alumnos";

    // Ejemplo que no se usa. El punto es que podemos agregar lo que queramos en cada caso.
    // Después lo conectamos a un endpoint y listo!
    public async getSortedById(): Promise<Record<string, any>[]> {
        const query = `
            SELECT *
            FROM ${this.schema}.${this.table}
            ORDER BY ${this.primaryKeys}
        `
        const items = await this.pool.query(query);
        return items.rows;
    }
}