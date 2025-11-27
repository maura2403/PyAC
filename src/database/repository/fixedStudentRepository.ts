import { poolDb } from "../client.js";
import { Model, IntegerType, EnumType } from "../model.js";
import { Repository } from "../repository.js";

export class FixedStudentRepository extends Repository {
    public readonly tableName: string = "alumno_fijo";
    protected readonly model: Model = new Model(
        {
            dni: new IntegerType(false, true),
            dia_de_la_semana: new EnumType(false, true, ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"])
        }
    );
}

export const fixedStudentRepo = new FixedStudentRepository(poolDb);