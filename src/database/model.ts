import { arraySameElements } from "../extra/utils.js";

export class Model {
    private columns: Record<string, DatabaseType>;

    public get allColumns(): string[] {
        return Object.keys(this.columns);
    }

    public get nonDefaultValueColumns(): string[] {
        return this.allColumns.filter(key => !this.columns[key]!.hasDefaultValue);
    }

    public get primaryKeys(): string[] {
        return this.allColumns.filter(key => this.columns[key]!.primaryKey);
    }

    public get nonPrimaryKeys(): string[] {
        return this.allColumns.filter(key => !this.columns[key]!.primaryKey);
    }

    public get logicalDelete(): boolean {
        return this.allColumns.includes('activo');
    }

    public get frontData(): Record<string, any> {
        const entries = Object.entries(this.columns);
        const res: Record<string, any> = {};

        entries.forEach(([name, type]) => {
            res[name] = type.frontData;
        });

        return res;
    }

    constructor(columns: Record<string, DatabaseType>) {
        this.columns = columns;
    }

    public assertFullObject(row: Record<string, any>) {
        const keys = Object.keys(row);
        if (!arraySameElements(keys, this.nonDefaultValueColumns)) {
            throw new Error(`The object ${JSON.stringify(row)} isn't a valid Object for ${this.constructor.name}.`);
        }
        this.assertValidation(keys, row);
    }

    public assertPartialObject(filter: Record<string, any>) {
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

    public assertSortBy(sortby: Record<string, any>) {
        const keys = Object.keys(sortby);
        if (keys.some(key => !this.allColumns.includes(key))) {
            throw new Error(`The object ${JSON.stringify(sortby)} isn't a valid Sort for ${this.constructor.name}.`);
        }
        keys.forEach(key => {
            const value = sortby[key];
            if ( value !== "asc" && value !== "desc" ) {
                throw new Error(`The value ${value} isn't a valid value for sorting the column ${key}.`);
            }
        });
    }

    private assertValidation(keys: string[], row: Record<string, any>) {
        const assertRow: Record<string, any> = {};
        Object.keys(row).forEach(key => {
            const value = Array.isArray(row[key]) ? row[key] : [row[key]];
            assertRow[key] = value;
        });
        keys.forEach(key => {
            const values = assertRow[key];
            const columnType = this.columns[key]!;
            for (const value of values){
                if (!columnType.validate(value)) {
                    throw new Error(`The value ${value} isn't a valid value for the column ${key}.`);
                }
            }
        });
    }

}

abstract class DatabaseType {
    public readonly allowNull: boolean;
    public readonly primaryKey: boolean;
    protected readonly frontLabel: string;
    protected abstract readonly inputType: string;
    public readonly hasDefaultValue: boolean;
    protected readonly filterable: boolean;
    protected readonly sortable: boolean;

    constructor(allowNull: boolean, primaryKey: boolean, label: string = '', hasDefaultValue: boolean = false, filterable: boolean = true, sortable: boolean = true) {
        this.allowNull = allowNull;
        this.primaryKey = primaryKey;
        this.frontLabel = label;
        this.hasDefaultValue = hasDefaultValue;
        this.filterable = filterable;
        this.sortable = sortable;
    }

    validate(value: any): boolean {
        if (value === null) {
            return this.allowNull;
        }
        return this.validateType(value);
    }

    public get frontData(): Record<string, any> {
        return {
            "label" : this.frontLabel,
            "type" : this.inputType,
            "pk" : this.primaryKey,
            "filterable" : this.filterable,
            "sortable" : this.sortable
        };
    }

    protected abstract validateType(value: any): boolean;
}

export class StringType extends DatabaseType {
    protected readonly inputType: string = "text";
    protected validateType(value: any) {
        return typeof value == "string";
    }
}

export class IntegerType extends DatabaseType {
    protected readonly inputType: string = "number";
    protected validateType(value: any) {
        value = Number(value);
        return Number.isInteger(value);
    }
}

export class FloatType extends DatabaseType {
    protected readonly inputType: string = "number";
    protected validateType(value: any) {
        value = Number(value);
        return typeof value == "number";
    }
}

export class BooleanType extends DatabaseType {
    protected readonly inputType: string = "checkbox";
    protected validateType(value: any) {
        if(typeof value == "boolean") return true;
        if(typeof value == "string" && (value == "true" || value == "false")) return true;
        return false;
    }
}

export class DateType extends DatabaseType {
    protected readonly inputType: string = "date";

    protected validateType(value: any) {
        if (value instanceof Date) {
            return !isNaN(value.getTime());
        }

        if (typeof value === "string") {
            const parsed = new Date(value);
            if (!isNaN(parsed.getTime())) {
                return true;
            }
            return false;
        }
        return false;
    }
}

export class EnumType extends DatabaseType {
    protected readonly inputType: string = "enum";
    protected readonly values: string[];
    constructor(allowNull: boolean, primaryKey: boolean, values: string[], label: string = '',  hasDefaultValue: boolean = false, filterable: boolean = true, sortable: boolean = true) {
        super(allowNull, primaryKey, label, hasDefaultValue, filterable, sortable);
        this.values = values;
    }

    protected validateType(value: any): boolean {
        return this.values.includes(value);
    }

    public get frontData(): Record<string, any> {
        const res = super.frontData;
        res["values"] = this.values;
        return res;
    }
}