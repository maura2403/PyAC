import { Pool } from "pg";
import { numberToISOFormat } from "../extra/utils.js";
import type { Model } from "./model.js";

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

    protected normalizeDates(rows: Record<string, any>[]) {
        return rows?.map(row => {
            const newRow: Record<string, any> = {};
            for (const key in row) {
                const value = row[key];
                if (value instanceof Date) {
                    newRow[key] = numberToISOFormat(value.getFullYear(), value.getMonth() + 1, value.getDate());
                }
                else {
                    newRow[key] = value;
                }
            }
            return newRow;
        });
    }
}