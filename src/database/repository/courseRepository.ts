import { poolDb } from "../client.js";
import { Model, StringType, BooleanType } from "../model.js";
import { Repository } from "../repository.js";

export class CourseRepository extends Repository {
    public readonly tableName: string = "curso";
    protected readonly model: Model = new Model(
        {
            curso: new StringType(false, true, 'Curso', false, true, true),
            nivel: new StringType(false, false, 'Nivel', false, true, true),
            activo: new BooleanType(false, false, '', true)
        }
    );
}

export const courseRepo = new CourseRepository(poolDb);