import { numberToISOFormat } from "../../extra/utils.js";
import { poolDb } from "../client.js";
import { Model, IntegerType, StringType, EnumType, BooleanType } from "../model.js";
import { Repository } from "../repository.js";
import { attendanceRepo } from "./attendanceRepository.js";
import { fixedStudentRepo } from "./fixedStudentRepository.js";

export class StudentRepository extends Repository {
    public readonly tableName: string = "alumno";
    protected readonly model: Model = new Model(
        {
            dni: new IntegerType(false, true, "DNI"),
            nombre: new StringType(false, false, "Nombre"),
            apellido: new StringType(false, false, "Apellido"),
            curso: new StringType(false, false, "Curso"),
            modalidad: new EnumType(false, false, ["Eventual", "Mensual", "Fijo"], "Modalidad", false, true, true),
            cuit_responsable_de_pagos: new StringType(false, false, "Responsable (CUIT)", false, true, false),
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

    public async getStudentsAttendanceWeek(year: number, month: number, day: number, filters: Record<string, any>, sortby: Record<string, any> = {}): Promise<(Record<string, any>)[]>{
        const filterDict = this.filterQuery(filters,'a');
        const sortbyQuery = this.sortQuery(sortby);
        const filterQuery = filterDict.filter === '' ? '' : ' WHERE ' + filterDict.filter;
        const orderBy = sortbyQuery === '' ? '' : ' ORDER BY ' + sortbyQuery;
        const valueParam = filterDict.values.length + 1;

        const fecha = numberToISOFormat(year, month, day);
        const query = `
            SELECT a.dni, a.nombre, a.apellido, a.curso,
                COALESCE(BOOL_OR(p.fecha = (TO_DATE($${valueParam}, 'YYYY-MM-DD') + INTERVAL '1' day)), false) AS lun,
                COALESCE(BOOL_OR(p.fecha = (TO_DATE($${valueParam}, 'YYYY-MM-DD') + INTERVAL '2' day)), false) AS mar,
                COALESCE(BOOL_OR(p.fecha = (TO_DATE($${valueParam}, 'YYYY-MM-DD') + INTERVAL '3' day)), false) AS mie,
                COALESCE(BOOL_OR(p.fecha = (TO_DATE($${valueParam}, 'YYYY-MM-DD') + INTERVAL '4' day)), false) AS jue,
                COALESCE(BOOL_OR(p.fecha = (TO_DATE($${valueParam}, 'YYYY-MM-DD') + INTERVAL '5' day)), false) AS vie
                FROM ${this.schema}.${this.tableName} AS a
            LEFT JOIN ${attendanceRepo.schema}.${attendanceRepo.tableName} AS p ON a.dni = p.dni
            ${filterQuery}
            GROUP BY a.dni, a.nombre, a.apellido, a.curso
            ${orderBy};
        `;
        const items = await this.pool.query(query, [...filterDict.values, fecha]);
        return items.rows;
    }
}

export const studentRepo = new StudentRepository(poolDb);