import { arraySameElements } from "../extra/utils.js";

export class Model {
    public readonly schema: string;
    public readonly tableName: string;
    private columns: Record<string, DatabaseType>;

    public get allColumns(): string[] {
        return Object.keys(this.columns);
    }

    public get primaryKeys(): string[] {
        return this.allColumns.filter(key => this.columns[key]!.primaryKey);
    }

    public get nonPrimaryKeys(): string[] {
        return this.allColumns.filter(key => !this.columns[key]!.primaryKey);
    }

    constructor(columns: Record<string, DatabaseType>, modelSchema: string, modelTable: string) {
        this.schema = modelSchema;
        this.tableName = modelTable;
        this.columns = columns;
    }

    public assertFullObject(row: Record<string, any>) {
        const keys = Object.keys(row);
        if (!arraySameElements(keys, this.allColumns)) {
            throw new Error(`The object ${JSON.stringify(row)} isn't a valid Object for ${this.constructor.name}.`);
        }
        this.assertValidation(keys, row);
    }

    public assertFilter(filter: Record<string, any>) {
        const keys = Object.keys(filter);
        if (keys.some(key => !this.allColumns.includes(key))) {
            throw new Error(`The object ${JSON.stringify(filter)} isn't a valid Filter for ${this.constructor.name}.`);
        }
        this.assertValidation(keys, filter);
    }

    public assertPrimaryKey(pk: Record<string, any>): void {
        const keys = Object.keys(pk);
        if (!arraySameElements(keys, this.primaryKeys)) {
            throw new Error(`The object ${JSON.stringify(pk)} isn't a valid PK for ${this.constructor.name}.`);
        }
        this.assertValidation(keys, pk);
    }

    private assertValidation(keys: string[], row: Record<string, any>) {
        keys.forEach(key => {
            const value = row[key];
            const columnType = this.columns[key]!;
            if (!columnType.validate(value)) {
                throw new Error(`The value ${value} isn't a valid value for the column ${key}.`);
            }
        });
    }
}

abstract class DatabaseType {
    public readonly allowNull;
    public readonly primaryKey;

    constructor(allowNull: boolean = false, primaryKey: boolean = false) {
        this.allowNull = allowNull;
        this.primaryKey = primaryKey;
    }

    validate(value: any): boolean {
        if (value === null) {
            return this.allowNull;
        }
        return this.validateType(value);
    }

    protected abstract validateType(value: any): boolean;
}

export class StringType extends DatabaseType {
    validateType(value: any) {
        return typeof value == "string";
    }
}

export class IntegerType extends DatabaseType {
    validateType(value: any) {
        value = Number(value);
        return Number.isInteger(value);
    }
}

export class FloatType extends DatabaseType {
    validateType(value: any) {
        value = Number(value);
        return typeof value == "number";
    }
}

export class BooleanType extends DatabaseType {
    validateType(value: any) {
        return typeof value == "boolean";
    }
}

export class DateType extends DatabaseType {
    validateType(value: any) {
        return value instanceof Date;
    }
}

export class ModalidadType extends DatabaseType {
    validateType(value: any) {
        return ["Eventual", "Mensual", "Fijo"].includes(value);
    }
}

export class NivelType extends DatabaseType {
    validateType(value: any) {
        return ["Jardin", "Primaria"].includes(value);
    }
}