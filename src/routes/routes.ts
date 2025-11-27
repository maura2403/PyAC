import { Router } from "express";
import { createAPICrud, createMainRouteForBasicCRUD } from "../basicCrud.js"
import { requireAuth, requireAuthAPI } from "../middleware/auth.js"
import authApiRoutes from "./authApi.js";
import authPagesRoutes from "./authPages.js";
import { dateToISOFormat, dayToNumber, stringToDate, zip } from "../extra/utils.js";
import { parseCsvFromContent } from "../extra/csv.js";
import { attendanceRepo } from "../database/repository/attendanceRepository.js";
import { courseRepo } from "../database/repository/courseRepository.js";
import { fixedStudentRepo } from "../database/repository/fixedStudentRepository.js";
import { invoiceRepo } from "../database/repository/invoiceRepository.js";
import { levelRepo } from "../database/repository/levelRepository.js";
import { studentRepo } from "../database/repository/studentRepository.js";
import { userRepo } from "../database/repository/userRepository.js";

const router = Router();

createAPICrud(router, studentRepo, true, true, true, true);
createAPICrud(router, levelRepo, true, true, true, true);
createAPICrud(router, invoiceRepo, false, true, false, false);
createAPICrud(router, userRepo, true, true, true, true);
createAPICrud(router, courseRepo, true, true, true, true);
createAPICrud(router, fixedStudentRepo, true, true, false, true);

createMainRouteForBasicCRUD(router, studentRepo, "manageStudents");
createMainRouteForBasicCRUD(router, invoiceRepo, "manageInvoices");
createMainRouteForBasicCRUD(router, courseRepo, "manageCourses");
createMainRouteForBasicCRUD(router, levelRepo, "manageLevels");

router.get("/app/alumno/fijo", requireAuth, async (req, res) => {
    const queryParams = req.query;
    const filterParam = queryParams.filter ? JSON.parse(queryParams.filter as string) : {};
    const sortParam = queryParams.sortby ? JSON.parse(queryParams.sortby as string) : {};
    const data = await studentRepo.getFixedStudentsWithDays(filterParam, sortParam);
    res.render('manageFixedStudents', { 'data' : data, 'filterParams': filterParam, 'sortbyParams': sortParam });
});

router.get("/app/asistencia", requireAuth, async (req, res) => {
    if (!req.query.day || !req.query.month || !req.query.year) {
        const today = new Date();
        return res.redirect(`/app/asistencia?day=${today.getDate()}&month=${today.getMonth() + 1}&year=${today.getFullYear()}`);
    }
    const year = parseInt(req.query.year as string);
    const month = parseInt(req.query.month as string);
    const day = parseInt(req.query.day as string);

    const lastSunday = new Date(year, month - 1, day);
    lastSunday.setDate(lastSunday.getDate() - lastSunday.getDay());
    const queryParams = req.query;
    const filterParam = queryParams.filter ? JSON.parse(queryParams.filter as string) : {};
    const sortParam = queryParams.sortby ? JSON.parse(queryParams.sortby as string) : {};
    const data = await studentRepo.getStudentsAttendanceWeek(lastSunday.getFullYear(), lastSunday.getMonth() + 1, lastSunday.getDate(), filterParam, sortParam);
    res.render("manageAttendance", { "sunday" : dateToISOFormat(lastSunday), "data" : data, 'filterParams': filterParam, 'sortbyParams': sortParam  });
});

router.post("/api/asistencia", requireAuth, async (req, res) => {
    try {
        const dni = parseInt(req.body.dni as string);
        const fecha = stringToDate(req.body.sunday);
        const weekDay = dayToNumber(req.body.weekDay as string);
        fecha.setDate(fecha.getDate() + weekDay);
        await attendanceRepo.tomarPresente(dni, fecha.getFullYear(), fecha.getMonth() + 1, fecha.getDate());
        res.status(200).json({ ok: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: (err as Error).message });
    }
});

router.delete("/api/asistencia", requireAuth, async (req, res) => {
    try {
        const dni = parseInt(req.query.dni as string);
        const fecha = stringToDate(req.query.sunday as string);
        const weekDay = dayToNumber(req.query.weekDay as string);
        fecha.setDate(fecha.getDate() + weekDay);
        await attendanceRepo.eliminarPresente(dni, fecha.getFullYear(), fecha.getMonth() + 1, fecha.getDate());
        res.status(200).json({ ok: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: (err as Error).message });
    }
});

router.get("/app/alumno/csv", requireAuth, (req, res) => {
    res.render("uploadStudentCSV");
});


router.post("/api/alumno/csv", requireAuth, async (req, res) => {
    try {
        var {dataLines: studentsDataList, columns: columns} = await parseCsvFromContent(req.body)
        const rows = zip(columns, studentsDataList)

        for(const row of rows){
            await studentRepo.create(row);
        }
        res.status(201).send({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error insertando alumnos' });
    }
});

router.get("/api/factura/descargar", requireAuthAPI, async (req, res) => {
    try {
        const dni = parseInt(req.query.dni as string);
        const fecha_de_emision = req.query.fecha_de_emision as string;
        const es_mensual = req.query.es_mensual === 'true';

        const facturas = await invoiceRepo.read({
            dni: dni,
            fecha_de_emision: fecha_de_emision,
            es_mensual: es_mensual
        });

        if (facturas.length === 0) {
            return res.status(404).send('Factura no encontrada');
        }

        res.render("invoice", { factura: facturas[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al generar la factura');
    }
});

// Ruta GET principal
router.get("/", requireAuth, (_, res) => {
    res.render("mainMenu");
});

router.use(authApiRoutes);
router.use(authPagesRoutes);

export default router;