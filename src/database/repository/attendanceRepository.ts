import { numberToISOFormat, getWorkingDays, getDaysInMonth, dayToNumber } from "../../extra/utils.js";
import { poolDb } from "../client.js";
import { Model, IntegerType, DateType } from "../model.js";
import { Repository } from "../repository.js";
import { courseRepo } from "./courseRepository.js";
import { fixedStudentRepo } from "./fixedStudentRepository.js";
import { invoiceRepo } from "./invoiceRepository.js";
import { levelRepo } from "./levelRepository.js";
import { modeRepo } from "./modeRepository.js";
import { studentRepo } from "./studentRepository.js";

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

export const attendanceRepo = new AttendanceRepository(poolDb);