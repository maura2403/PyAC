import { Pool } from "pg";

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
        const placeholders = this.model.allColumns.map((_, i) => `$${i + 1}`).join(', ');
        const query = `
            INSERT INTO ${this.model.schema}.${this.model.tableName} (${this.model.allColumns.join(', ')})
            VALUES (${placeholders})
        `;
        const values = this.model.allColumns.map(key => row[key]);
        await this.pool.query(query, values);
    }

    public async read(filters: Record<string, any>): Promise<Record<string, any>[]> {
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
    protected model: Model;
    constructor(pool: Pool) {
        super(pool);
        this.model = new Model(
            {
                dni: { type: DatabaseType.INTEGER, options: { primaryKey: true } },
                nombre: { type: DatabaseType.STRING, options: { } },
                apellido: { type: DatabaseType.STRING, options: { } },
                curso: { type: DatabaseType.STRING, options: { } },
                modalidad: { type: DatabaseType.MODALIDADES, options: { } },
                nivel: { type: DatabaseType.NIVELES, options: { } },
                responsable_de_pagos: { type: DatabaseType.STRING, options: { allowNull: true } },
                responsable1: { type: DatabaseType.STRING, options: { allowNull: true } }
            },
            "Pyac",
            "Alumnos"
        );
    }
}

export class AttendanceRepository extends Repository {
    protected readonly model = new Model(
        {
            dni: { type: DatabaseType.INTEGER, options: { primaryKey: true }},
            fecha: { type: DatabaseType.DATE, options: { primaryKey: true }}
        },
        "Pyac",
        "Presentes"
    );
}

export class LevelRepository extends Repository {
    protected readonly model = new Model(
        {
            nivel: { type: DatabaseType.NIVELES, options: { primaryKey: true }},
            precio: { type: DatabaseType.FLOAT, options: { } }
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
    protected readonly model = new Model(
        {
            dni: { type: DatabaseType.INTEGER, options: { primaryKey: true }},
            fecha_de_emision: { type: DatabaseType.DATE, options: { primaryKey: true }},
            precio: { type: DatabaseType.FLOAT, options: { } },
            fecha_de_pago: { type: DatabaseType.DATE, options: { allowNull: true }}
        },
        "Pyac",
        "Facturas"
    );
}

// Columna no lleva nombre xq el nombre lo define la key del atributo
interface Column {
    type: DatabaseType;
    options: ColumnOptions;
}

// Los campos que son opcionales se van a rellenar con False en caso de ser undefined
interface ColumnOptions {
    primaryKey?: boolean;
    allowNull?: boolean;
}

export const enum DatabaseType {
    STRING = "STRING",
    INTEGER = "INTEGER",
    BOOLEAN = "BOOLEAN",
    FLOAT = "FLOAT",
    DATE = "DATE",
    MODALIDADES = "MODALIDADES",
    NIVELES = "NIVELES"
}

export class Model {
    public readonly schema: string;
    public readonly tableName: string;
    private columns: Record<string, Column>;

    public get allColumns(): string[] {
        return Object.keys(this.columns);
    }

    public get primaryKeys(): string[] {
        return this.allColumns.filter(key => this.columns[key]?.options.primaryKey);
    }

    public get nonPrimaryKeys(): string[] {
        return this.allColumns.filter(key => !this.columns[key]?.options.primaryKey);
    }

    constructor(columns: Record<string, Column>, modelSchema: string, modelTable: string) {
        this.schema = modelSchema;
        this.tableName = modelTable;

        // Convertimos los undefined en false
        this.columns = {};
        for (const key in columns) {
            const col = columns[key]!;
            this.columns[key] = {
                type: col.type,
                options: {
                    primaryKey: col.options.primaryKey ?? false,
                    allowNull: col.options.allowNull ?? false
                }
            };
        }
    }
}

/*
export abstract class Repository<T extends PK, PK extends Record<string, any>> {
    public abstract readonly primaryKeys: (keyof PK)[];
    public abstract readonly nonPrimaryKeys: (keyof Omit<T, keyof PK>)[];
    public get allColumns(): (keyof T)[] {
        return [...this.primaryKeys, ...this.nonPrimaryKeys];
    }
    public abstract readonly schema: string;
    public abstract readonly table: string;

    protected readonly pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    private assertPrimaryKey(pk: PK): void {
        const keys = Object.keys(pk);
        if (!arraySameElements(keys, this.primaryKeys)) {
            throw new Error(`The object ${JSON.stringify(pk)} isn't a valid PK for ${this.constructor.name}.`);
        }
    }

    private assertFullObject(row: T): void {
        const keys = Object.keys(row);
        if (!arraySameElements(keys, this.allColumns)) {
            throw new Error(`The object ${JSON.stringify(row)} isn't a valid Object for ${this.constructor.name}.`);
        }
    }

    private assertFilter(filter: Partial<T>) {
        const keys = Object.keys(filter);
        if (keys.some(key => !this.allColumns.includes(key))) {
            throw new Error(`The object ${JSON.stringify(filter)} isn't a valid Filter for ${this.constructor.name}.`);
        }
    }

    public async create(row: T): Promise<void> {
        this.assertFullObject(row);

        const placeholders = this.allColumns.map((_, i) => `$${i + 1}`).join(', ');
        const query = `
            INSERT INTO ${this.schema}.${this.table} (${this.allColumns.join(', ')})
            VALUES (${placeholders})
        `;
        const values = this.allColumns.map(key => row[key]);
        await this.pool.query(query, values);
    }

    public async read(filters: Partial<T>): Promise<T[]> {
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

    public async update(originalPKs: PK, row: T): Promise<void> {
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

    public async delete(originalPKs: PK): Promise<void> {
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

export type Student = {
    "dni" : number,
    "nombre" : string,
    "apellido" : string,
    "curso" : string,
    "modalidad" : ("Eventual" | "Mensual" | "Fijo"),
    "nivel" : ("Jardin" | "Primaria"),
    "responsable_de_pagos" : string,
    "responsable1" : string
};

export type StudentPK = Pick<Student, "dni">;

export class StudentRepository extends Repository<Student, StudentPK> {
    public readonly primaryKeys: (keyof StudentPK)[] = ["dni"];
    public readonly nonPrimaryKeys: (keyof Omit<Student, keyof StudentPK>)[] = ["nombre", "apellido", "curso", "modalidad", "nivel", "responsable_de_pagos", "responsable1"];
    public readonly schema: string = "pyac";
    public readonly table: string = "alumnos";

    public async getByDNI(dni: number): Promise<Student> {
        const matchingStudents = await this.read({"dni" : dni});
        return accessAt(matchingStudents, 0);
    }
}

export type Attendance = {
    "dni" : number,
    "fecha" : Date
};

export type AttendancePK = Pick<Attendance, "dni" | "fecha">;

export class AttendanceRepository extends Repository<Attendance, AttendancePK> {
    public readonly primaryKeys: (keyof AttendancePK)[] = ["dni", "fecha"];
    public readonly nonPrimaryKeys: (keyof Omit<Attendance, keyof AttendancePK>)[] = [];
    public readonly schema: string = "pyac";
    public readonly table: string = "presentes";
}

export type Level = {
    "nivel" : ("Jardin" | "Primaria"),
    "precio" : number
};

export type LevelPK = Pick<Level, "nivel">;

export class LevelRepository extends Repository<Level, LevelPK> {
    public readonly primaryKeys: (keyof LevelPK)[] = ["nivel"];
    public readonly nonPrimaryKeys: (keyof Omit<Level, keyof LevelPK>)[] = ["precio"];
    public readonly schema: string = "pyac";
    public readonly table: string = "niveles";

    public async getPrice(nivel: "Jardin" | "Primaria"): Promise<number> {
        const matchingLevels = await this.read({"nivel" : nivel});
        return accessAt(matchingLevels, 0).precio;
    }
}

export type Invoice = {
    "dni" : number,
    "fecha_de_emision" : Date,
    "precio" : number,
    "fecha_de_pago" : Date | null
};

export type InvoicePK = Pick<Invoice, "dni" | "fecha_de_emision">;

export class InvoiceRepository extends Repository<Invoice, InvoicePK> {
    public readonly primaryKeys: (keyof InvoicePK)[] = ["dni", "fecha_de_emision"];
    public readonly nonPrimaryKeys: (keyof Omit<Invoice, keyof InvoicePK>)[] = ["precio", "fecha_de_pago"];
    public readonly schema: string = "pyac";
    public readonly table: string = "facturas";
}*/