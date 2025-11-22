import { Pool } from "pg";
import { BooleanType, DateType, EnumType, FloatType, IntegerType, Model, StringType } from "./model.js";

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
            UPDATE ${this.model.schema}.${this.model.tableName}
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
            WHERE ${primaryKeys.map((key, i) => `${key} = $${i + 1}`).join(' AND ')}
            `;
        }
        await this.pool.query(query, values);
    }
}

export class StudentRepository extends Repository {
    protected readonly model: Model = new Model(
        {
            dni: new IntegerType(false, true, "DNI del alumno"),
            nombre: new StringType(false, false, "Nombre"),
            apellido: new StringType(false, false, "Apellido"),
            cursoactual: new StringType(false, false, "Curso"),
            modalidadactual: new EnumType(false, false, ["Eventual", "Mensual", "Fijo"], "Modalidad"),
            cuitresppagos: new StringType(false, false, "CUIT de Responsable de pagos"),
            activo: new BooleanType(false, false, "activo")
        },
        "pyac",
        "alumno"
    );
}

export class AttendanceRepository extends Repository {
    protected readonly model: Model = new Model(
        {
            dni: new IntegerType(false, true),
            fecha: new DateType(false, true)
        },
        "pyac",
        "asistencia"
    );
}

export class LevelRepository extends Repository {
    protected readonly model: Model = new Model(
        {
            nivel:  new EnumType(false, true, ["Jardin", "Primaria"], "Nivel"),
            preciodiario: new FloatType(false, false, "Precio Diario Base"),
            activo: new BooleanType(false, false, "activo")
        },
        "pyac",
        "nivel"
    );

    public async getPrice(nivel: "Jardin" | "Primaria"): Promise<number> {
        const rows = await this.read({ nivel : nivel });
        return rows[0]!.preciodiario;
    }
}

export class InvoiceRepository extends Repository {
    protected readonly model: Model = new Model(
        {
            dni: new IntegerType(false, true, "DNI del alumno"),
            fechaemision: new DateType(false, true, "Fecha de Emisión de Factura"),
            esmensual: new BooleanType(false, true, "Es Mensual"),
            monto: new FloatType(false, false, "Monto"),
            pagado: new BooleanType(true, false, "Esta Paga"),
            fechapago: new DateType(true, false, "Fecha de Pago")
        },
        "pyac",
        "factura"
    );
}

export class ModalityRepository extends Repository {
    protected readonly model: Model = new Model(
        {
            modalidad: new EnumType(false, true, ["Eventual", "Fijo", "Mensual"], "Modalidad"),
            descuento: new FloatType(false, false, "Descuento"),
            activo: new BooleanType(false, false, "activo")
        },
        "pyac",
        "modalidad"
    );
}

export class UserRepository extends Repository {
    protected readonly model: Model = new Model(
        {
            idusuario: new IntegerType(false, true, "idUsuario"),
            nombre: new StringType(true, false, "Nombre"),
            usuario: new StringType(false, false, "Username"),
            email: new StringType(true, false, "Email"),
            passhash: new StringType(false, false, "Hashed Password")
        },
        "pyac",
        "usuario"
    );
}

export class CourseRepository extends Repository {
    protected readonly model: Model = new Model(
        {
            curso: new StringType(false, true, "Curso"),
            nivel: new StringType(false, false, "Nivel"),
            activo: new BooleanType(false, false, "activo")
        },
        "pyac",
        "curso"
    );
}
