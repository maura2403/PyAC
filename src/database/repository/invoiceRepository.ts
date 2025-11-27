import { numberToISOFormat } from "../../extra/utils.js";
import { poolDb } from "../client.js";
import { Model, IntegerType, DateType, BooleanType, FloatType } from "../model.js";
import { Repository } from "../repository.js";

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

    public async read(filters: Record<string, any>, sortby: Record<string, any> = {}): Promise<Record<string, any>[]> {
        const invoiceFields = ['dni', 'fecha_de_emision', 'es_mensual', 'monto', 'pagado', 'fecha_de_pago'];
        const studentFields = ['nombre', 'apellido', 'cuit_responsable_de_pagos'];

        const invoiceFilters: Record<string, any> = {};
        const studentFilters: Record<string, any> = {};
        const invoiceSortby: Record<string, any> = {};
        const studentSortby: Record<string, any> = {};

        Object.keys(filters).forEach(key => {
            if (invoiceFields.includes(key)) {
                invoiceFilters[key] = filters[key];
            }
            else if (studentFields.includes(key)) {
                studentFilters[key] = filters[key];
            }
        });

        Object.keys(sortby).forEach(key => {
            if (invoiceFields.includes(key)) {
                invoiceSortby[key] = sortby[key];
            } else if (studentFields.includes(key)) {
                studentSortby[key] = sortby[key];
            }
        });
        const invoiceFilterDict = this.filterQuery(invoiceFilters, 'f');
        const studentFilterDict = this.filterQuery(studentFilters, 'a');
        const invoiceSortQuery = this.sortQuery(invoiceSortby, 'f');
        const studentSortQuery = this.sortQuery(studentSortby, 'a');

        // Combine filters and sorts
        const conditions: string[] = [];
        const values: any[] = [];
        if (invoiceFilterDict.filter !== '') {
            conditions.push(invoiceFilterDict.filter);
            values.push(...invoiceFilterDict.values);
        }
        if (studentFilterDict.filter !== '') {
            conditions.push(studentFilterDict.filter);
            values.push(...studentFilterDict.values);
        }

        const sortQueries: string[] = [];
        if (invoiceSortQuery !== '') sortQueries.push(invoiceSortQuery);
        if (studentSortQuery !== '') sortQueries.push(studentSortQuery);

        const filterQuery = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
        const orderBy = sortQueries.length > 0 ? ' ORDER BY ' + sortQueries.join(', ') : '';

        // Join with student table to get nombre, apellido, cuit_responsable_de_pagos
        const query = `
            SELECT f.dni, f.fecha_de_emision, f.es_mensual, f.monto, f.pagado, f.fecha_de_pago,
                   a.nombre, a.apellido, a.cuit_responsable_de_pagos
            FROM ${this.schema}.${this.tableName} AS f
            INNER JOIN ${this.schema}.alumno AS a ON f.dni = a.dni
            ${filterQuery}
            ${orderBy};
        `;

        const items = await this.pool.query(query, values);
        // Normalize dates (same logic as base class normalizeDates)
        return this.normalizeDates(items.rows);
    }

    public async deleteMonthlyInvoice(dni: number, year: number, month: number): Promise<void> {
        const query = `
            DELETE FROM ${this.schema}.${this.tableName}
            WHERE dni = $1 AND es_mensual = true AND TO_CHAR(fecha_de_emision, 'YYYY-MM') = $2
        `;
        const fecha = numberToISOFormat(year, month, 1).slice(0, 7);
        await this.pool.query(query, [dni, `${fecha}`]);
    }
}

export const invoiceRepo = new InvoiceRepository(poolDb);