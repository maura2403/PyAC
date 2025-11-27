import { poolDb } from "../client.js";
import { Model, EnumType, FloatType, BooleanType } from "../model.js";
import { Repository } from "../repository.js";

export class LevelRepository extends Repository {
    public readonly tableName: string = "nivel";
    protected readonly model: Model = new Model(
        {
            nivel: new EnumType(false, true, ["Jardín", "Primaria"], "Nivel", false, false, false),
            precio_diario: new FloatType(false, false, "Precio Diario Base", false, false, false),
            activo: new BooleanType(false, false, '', true)
        }
    );
}

export const levelRepo = new LevelRepository(poolDb);