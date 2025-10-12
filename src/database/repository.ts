import { Pool } from "pg";

export abstract class Repository {
    public abstract readonly primaryKey: string;
    public abstract readonly nonPrimaryColumns: string[];
    public abstract readonly allColumns: string[];

    public abstract readonly schema: string;
    public abstract readonly table: string;

    protected readonly pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    public async create(row: Record<string, any>): Promise<void> {
        const placeholders = this.allColumns.map((_, i) => `$${i + 1}`).join(', ');
        const query = `
            INSERT INTO ${this.schema}.${this.table} (${this.allColumns.join(', ')})
            VALUES (${placeholders})
        `;
        const values = Object.values(row);

        await this.pool.query(query, values);
    }

    public async read(filters: Record<string, any>): Promise<Record<any, string>[]> {
        let query = `SELECT * FROM ${this.schema}.${this.table}`;
        const values = Object.values(filters);

        if (values.length > 0) {
            const placeholders = Object.keys(filters).map((col, i) => `${col} = $${i + 1}`).join(' AND ');
            query += ` WHERE ${placeholders}`;
        }

        const items = await this.pool.query(query, values);
        return items.rows;
    }

    public async update(originalPK: string, row: Record<string, any>): Promise<void> {
        const query = `
            UPDATE ${this.schema}.${this.table}
            SET ${this.allColumns.map((col, i) => `${col} = $${i+2}`).join(', ')}
            WHERE ${this.primaryKey} = $1
        `;
        const values = Object.values(row);

        await this.pool.query(query, [originalPK, ...values]);
    }

    public async delete(primaryKey: string): Promise<void> {
        const query = `
            DELETE FROM ${this.schema}.${this.table}
            WHERE ${this.primaryKey} = $1
        `

        await this.pool.query(query, [primaryKey]);
    }
}

export class StudentRepository extends Repository {
    public readonly primaryKey: string = "id_alumno";
    public readonly nonPrimaryColumns: string[] = ['nombre', 'apellido', 'curso', 'modalidad', 'responsable_de_pagos', 'responsable1'];
    public readonly allColumns: string[] = [this.primaryKey, ...this.nonPrimaryColumns];

    public readonly schema: string = "pyac";
    public readonly table: string = "alumnos";

    // Ejemplo que no se usa. El punto es que podemos agregar lo que queramos en cada caso.
    // Después lo conectamos a un endpoint y listo!
    public async getSortedById(): Promise<Record<any, string>[]> {
        const query = `
            SELECT *
            FROM ${this.schema}.${this.table}
            ORDER BY ${this.primaryKey}
        `
        const items = await this.pool.query(query);
        return items.rows;
    }
}