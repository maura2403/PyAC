import { poolDb } from "../client.js";
import { BooleanType, EnumType, FloatType, Model } from "../model.js";
import { Repository } from "../repository.js";

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

export const modeRepo = new ModeRepository(poolDb);