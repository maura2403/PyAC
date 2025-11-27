import { Pool } from "pg";
import { BooleanType, DateType, EnumType, FloatType, IntegerType, Model, StringType } from "./model.js";
import { hashPassword, verifyPassword } from "../login/auth.js";
import { poolDb } from "./client.js";
import { dayToNumber, getDaysInMonth, getWorkingDays, numberToISOFormat } from "../extra/utils.js";

export abstract class Repository {
    public get frontData(): Record<string, any> {
        return this.model.frontData;
    }
    protected abstract readonly model: Model;
    protected readonly pool: Pool;

    public readonly schema: string = "Pyac";
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

    public async read(filters: Record<string, any>, sortby: Record<string, any> = {}): Promise<Record<string, any>[]> {
        this.model.assertPartialObject(filters);
        this.model.assertSortBy(sortby);
        let rows;
        if (this.model.logicalDelete) {
            rows = await this.logicalRead(filters, sortby);
        }
        else {
            rows = await this.defaultRead(filters, sortby);
        }
        return this.normalizeDates(rows);
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
        const rows = await this.defaultRead(filter);
        if (rows.length > 0) {
            await this.defaultUpdate(filter, { ...row, activo : true } );
        }
        else {
            await this.defaultCreate(row);
        }
    }

    protected filterQuery(filters: Record<string, any>, tableName: string = ''){
        const listFilters: Record<string, any> = {};
        Object.keys(filters).forEach(key => {
            const value = Array.isArray(filters[key]) ? filters[key] : [filters[key]];
            listFilters[key] = value;
        });
        const filterKeys = Object.keys(listFilters);
        const table = tableName !== '' ? tableName + '.' : '';
        const queryValues:any[] = [];
        let filterQuery = '';
        if (filterKeys.length > 0) {
            let filterIndex = 1;
            let conditions = [];
            for (let key of filterKeys) {
                const values = listFilters[key];
                const orValues = values.map((v:any) => {
                    queryValues.push(v);
                    if(v.toString().includes('%')){
                        return `CAST(${table}${key} AS TEXT) ilike $${filterIndex++}`;
                    }
                    else{
                        return `${table}${key} = $${filterIndex++}`;
                    }
                }).join(' OR ');

                conditions.push(`(${orValues})`);
            }
            filterQuery += `${conditions.join(' AND ')}`;
        }

        return { filter: filterQuery, values: queryValues};
    }

    protected sortQuery(sortby: Record<string, any>, tableName: string = ''){
        const sorterKeys = Object.keys(sortby);
        let sortbyQuery = '';
        const table = tableName !== '' ? tableName + '.' : '';
        if (sorterKeys.length > 0) {
            const sortValues = sorterKeys.map((key) => `${table}${key} ${sortby[key]}`).join(' , ');
            sortbyQuery += `${sortValues}`;
        }
        return sortbyQuery;
    }

    private async defaultRead(filters: Record<string, any>, sortby: Record<string, any> = {}): Promise<Record<string, any>[]> {
        let query = `SELECT * FROM ${this.schema}.${this.tableName}`;
        const filterDict = this.filterQuery(filters);
        const sortbyQuery = this.sortQuery(sortby);

        const filterQuery = filterDict.filter === '' ? '' : ' WHERE ' + filterDict.filter;
        const orderBy = sortbyQuery === '' ? '' : ' ORDER BY ' + sortbyQuery;

        query += filterQuery;
        query += orderBy;

        const items = await this.pool.query(query, filterDict.values);
        return items.rows;
    }

    private async logicalRead(filters: Record<string, any>, sortby: Record<string, any> = {}): Promise<Record<string, any>[]> {
        return await this.defaultRead({ ...filters, activo : [ true ] }, sortby);
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
        await this.defaultUpdate(originalPKs, { 'activo' : false });
    }

    private getPrimaryKeys(row: Record<string, any>): Record<string, any> {
        const pkObject = this.model.primaryKeys.reduce((acc, key) => {
            acc[key] = row[key];
            return acc;
        }, {} as Record<string, any>);
        return pkObject;
    }

    private normalizeDates(rows: Record<string, any>[]) {
        return rows?.map(row => {
            const newRow: Record<string, any> = {};
            for (const key in row) {
                const value = row[key];
                if (value instanceof Date) {
                    newRow[key] = numberToISOFormat(value.getFullYear(), value.getMonth(), value.getDate());
                }
                else {
                    newRow[key] = value;
                }
            }
            return newRow;
        });
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
            modalidad: new EnumType(false, false, ["Eventual", "Mensual", "Fijo"], "Modalidad", false, true, false),
            cuit_responsable_de_pagos: new StringType(false, false, "Responsable (CUIT)"),
            activo: new BooleanType(false, false, '', true)
        },
    );

    public async getFixedStudentsWithDays(filters: Record<string, any>, sortby: Record<string, any> = {}): Promise<Record<string, any>[]> {
        
        const filterDict = this.filterQuery(filters,'a');
        const sortbyQuery = this.sortQuery(sortby);
        const filterQuery = filterDict.filter === '' ? '' : ' AND ' + filterDict.filter;
        const orderBy = sortbyQuery === '' ? '' : ' ORDER BY ' + sortbyQuery;

        // BOOL_OR es una aggregate function que checkea si alguno de las filas cumple cierta condicion
        // Como devuelve null si todas son null, usamos coalesce para garantizar false
        const query = `
            SELECT a.dni, a.nombre, a.apellido, a.curso, a.modalidad,
                COALESCE(BOOL_OR(af.dia_de_la_semana = 'Lunes'), false) AS lun,
                COALESCE(BOOL_OR(af.dia_de_la_semana = 'Martes'), false) AS mar,
                COALESCE(BOOL_OR(af.dia_de_la_semana = 'Miercoles'), false) AS mie,
                COALESCE(BOOL_OR(af.dia_de_la_semana = 'Jueves'), false) AS jue,
                COALESCE(BOOL_OR(af.dia_de_la_semana = 'Viernes'), false) AS vie
            FROM ${this.schema}.${this.tableName} AS a
                LEFT JOIN ${fixedStudentRepo.schema}.${fixedStudentRepo.tableName} AS af ON a.dni = af.dni
            WHERE a.modalidad = 'Fijo' ${filterQuery}
            GROUP BY a.dni, a.nombre, a.apellido, a.curso, a.modalidad
            ${orderBy};
        `;
        const items = await this.pool.query(query, filterDict.values);
        return items.rows;
    }

    public async getStudentsAttendanceWeek(year: number, month: number, day: number): Promise<(Record<string, any>)[]>{
        const fecha = numberToISOFormat(year, month, day);
        const query = `
            SELECT a.dni, a.nombre, a.apellido,
                COALESCE(BOOL_OR(p.fecha = (TO_DATE($1, 'YYYY-MM-DD') + INTERVAL '1' day)), false) AS lun,
                COALESCE(BOOL_OR(p.fecha = (TO_DATE($1, 'YYYY-MM-DD') + INTERVAL '2' day)), false) AS mar,
                COALESCE(BOOL_OR(p.fecha = (TO_DATE($1, 'YYYY-MM-DD') + INTERVAL '3' day)), false) AS mie,
                COALESCE(BOOL_OR(p.fecha = (TO_DATE($1, 'YYYY-MM-DD') + INTERVAL '4' day)), false) AS jue,
                COALESCE(BOOL_OR(p.fecha = (TO_DATE($1, 'YYYY-MM-DD') + INTERVAL '5' day)), false) AS vie
                FROM ${this.schema}.${this.tableName} AS a
            LEFT JOIN ${attendanceRepo.schema}.${attendanceRepo.tableName} AS p ON a.dni = p.dni
            GROUP BY a.dni, a.nombre, a.apellido;
        `;
        const items = await this.pool.query(query, [fecha]);
        return items.rows;
    }
}

export class CourseRepository extends Repository {
    public readonly tableName: string = "curso";
    protected readonly model: Model = new Model(
        {
            curso: new StringType(false, true, 'Curso'),
            nivel: new StringType(false, false, 'Nivel'),
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

    public async tomarPresente(dni: number, year: number, month: number, day: number): Promise<void> {
        const fecha = numberToISOFormat(year, month, day);

        await this.pool.query('BEGIN');
        try {
            await this.create({ dni : dni, fecha : fecha });
            const studentData = await this.getDataForInvoice(dni, fecha);

            if (studentData.modalidad === 'Eventual') {
                await invoiceRepo.create({
                    dni : dni,
                    fecha_de_emision : fecha,
                    es_mensual : false,
                    monto : studentData.precio_diario * studentData.descuento
                });
            }
            if (studentData.modalidad === 'Mensual') {
                const count = await this.amountOfAttendances(dni, year, month);
                if (count == 1) {
                    await invoiceRepo.create({
                        dni : dni,
                        fecha_de_emision : fecha,
                        es_mensual : true,
                        monto : studentData.precio_diario * studentData.descuento * getWorkingDays(year, month)
                    });
                }
            }
            if (studentData.modalidad === 'Fijo') {
                const rows = await fixedStudentRepo.read({ dni : dni });
                const days = rows.map(row => row.dia_de_la_semana);
                const count = await this.amountOfAttendances(dni, year, month);
                if (count == 1) {
                    await invoiceRepo.create({
                        dni : dni,
                        fecha_de_emision : fecha,
                        es_mensual : true,
                        monto : studentData.precio_diario * studentData.descuento * getDaysInMonth(year, month, days)
                    });
                }
                if (!days.map(day => dayToNumber(day)).includes(new Date(year, month - 1, day).getDay())) {
                    await invoiceRepo.create({
                        dni : dni,
                        fecha_de_emision : fecha,
                        es_mensual : false,
                        monto : studentData.precio_diario
                    });
                }
            }
            await this.pool.query('COMMIT');
        }
        catch(e) {
            await this.pool.query('ROLLBACK');
            throw e;
        }
    }

    public async eliminarPresente(dni: number, year: number, month: number, day: number): Promise<void> {
        const fecha = numberToISOFormat(year, month, day);

        await this.pool.query('BEGIN');
        try {
            const studentData = await this.getDataForInvoice(dni, fecha);
            if (studentData.modalidad === 'Eventual') {
                await invoiceRepo.delete({
                    dni : dni,
                    fecha_de_emision : fecha,
                    es_mensual : false
                });
            }
            if (studentData.modalidad === 'Mensual') {
                const count = await this.amountOfAttendances(dni, year, month);
                if (count == 1) {
                    await invoiceRepo.deleteMonthlyInvoice(dni, year, month);
                }
            }
            if (studentData.modalidad === 'Fijo') {
                const count = await this.amountOfAttendances(dni, year, month);
                await invoiceRepo.delete({
                    dni : dni,
                    fecha_de_emision : fecha,
                    es_mensual : false
                });
                if (count == 1) {
                    await invoiceRepo.deleteMonthlyInvoice(dni, year, month);
                }
            }
            await this.delete({ dni : dni, fecha : fecha });
            await this.pool.query('COMMIT');
        }
        catch(e) {
            await this.pool.query('ROLLBACK');
            throw e;
        }
    }

    private async getDataForInvoice(dni: number, fecha: string) {
        const query = `
                SELECT a.modalidad, n.precio_diario, m.descuento FROM ${this.schema}.${this.tableName} as p
                    JOIN ${studentRepo.schema}.${studentRepo.tableName} AS a ON p.dni = a.dni
                    JOIN ${modeRepo.schema}.${modeRepo.tableName} AS m ON a.modalidad = m.modalidad
                    JOIN ${courseRepo.schema}.${courseRepo.tableName} AS c ON a.curso = c.curso
                    JOIN ${levelRepo.schema}.${levelRepo.tableName} AS n ON c.nivel = n.nivel
                WHERE p.dni = $1 AND p.fecha = $2;
            `;
        const values = [dni, fecha];
        const items = await this.pool.query(query, values);
        const data = items.rows[0];
        return data;
    }

    private async amountOfAttendances(dni: number, year: number, month: number): Promise<number> {
        const query = `
            SELECT * FROM ${this.schema}.${this.tableName}
            WHERE dni = $1 AND TO_CHAR(fecha, 'YYYY-MM') = $2
        `;
        const fecha = numberToISOFormat(year, month, 1).slice(0, 7);
        const items = await this.pool.query(query, [dni, `${fecha}`]);
        return items.rows.length;
    }
}

export class InvoiceRepository extends Repository {
    public readonly tableName: string = "factura";
    protected readonly model: Model = new Model(
        {
            dni: new IntegerType(false, true, 'DNI'),
            fecha_de_emision: new DateType(false, true, 'Fecha de emision'),
            es_mensual: new BooleanType(false, true, 'Es Mensual'),
            monto: new FloatType(false, false, 'Monto'),
            pagado: new BooleanType(false, false, 'Pagado', true),
            fecha_de_pago: new DateType(true, false, 'Fecha de pago', true)
        }
    );

    public async deleteMonthlyInvoice(dni: number, year: number, month: number): Promise<void> {
        const query = `
            DELETE FROM ${this.schema}.${this.tableName}
            WHERE dni = $1 AND es_mensual = true AND TO_CHAR(fecha_de_emision, 'YYYY-MM') = $2
        `;
        const fecha = numberToISOFormat(year, month, 1).slice(0, 7);
        await this.pool.query(query, [dni, `${fecha}`]);
    }
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

export const studentRepo = new StudentRepository(poolDb);
export const courseRepo = new CourseRepository(poolDb);
export const levelRepo = new LevelRepository(poolDb);
export const modeRepo = new ModeRepository(poolDb);
export const fixedStudentRepo = new FixedStudentRepository(poolDb);
export const attendanceRepo = new AttendanceRepository(poolDb);
export const invoiceRepo = new InvoiceRepository(poolDb);
export const userRepo = new UserRepository(poolDb);
