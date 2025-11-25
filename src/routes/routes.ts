import { Router } from "express";
import { createAPICrud } from "../basicCrud.js"
import { requireAuth } from "../middleware/auth.js"
import authApiRoutes from "./authApi.js";
import authPagesRoutes from "./authPages.js";
import { poolDb } from "../database/client.js";
import { AttendanceRepository, InvoiceRepository, LevelRepository, StudentRepository, ModeRepository, CourseRepository, UserRepository} from "../database/repository.js";
import { assertValidDateYYYYMMDD, zip } from "../extra/utils.js";
import { parseCsvFromContent } from "../extra/csv.js"
import type { Request } from "express";

const router = Router();

const studentRepo = new StudentRepository(poolDb);
createAPICrud(router, studentRepo, true, true, true, true);

const attendanceRepo = new AttendanceRepository(poolDb);
createAPICrud(router, attendanceRepo, true, false, false, true);

const levelRepo = new LevelRepository(poolDb);
createAPICrud(router, levelRepo, true, true, true, true);

// De las facturas vamos a querer verlas y editarlas.
// La edición es limitada a los campos a rellenar al pagarlas.
const invoiceRepo = new InvoiceRepository(poolDb);
createAPICrud(router, invoiceRepo, false, true, true, false);

const modalityRepo = new ModeRepository(poolDb);
createAPICrud(router, modalityRepo, true, true, true, true);

const userRepo = new UserRepository(poolDb);
createAPICrud(router, userRepo, true, true, true, true);

const courseRepo = new CourseRepository(poolDb);
createAPICrud(router, courseRepo, true, true, true, true);

// Normaliza las fechas a formato YY-MM-DDDD si tiene fechas.
function normalizeDates(data: Record<string,  any>[]): Record<string, any>[] {
    return data?.map(row => {
        const newRow: Record<string, any> = {};

        for (const key in row) {
            const value = row[key];

            // Si es string con formato YYYY-MM-DDT...
            if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
                newRow[key] = value.slice(0, 10);  // "2025-10-01"
            }
            else {
                newRow[key] = value; // copiar tal cual
            }
        }

        return newRow;
    });
}


function createMainRouteForBasicCRUD(specificRoute: string, templateFrontEndName: string, iterableDataName: string){
    router.get(`/app/${specificRoute}`, requireAuth, async (req, res) => {
        const queryParams = req.query;
        let queryString = Object.keys(queryParams).map(key => `${key}=${queryParams[key]}`).join('&');
        const url = `http://localhost:3000/api/${specificRoute}`;
        if (queryString !== '') {
            queryString = `?${queryString}`;
        }

        // Fetch data
        const response = await fetch(`${url}${queryString}`, {
            method : "GET",
            headers: {
                cookie: req.headers.cookie ?? '',
            }
        });
        const data = await response.json();

        // Fetch metadata
        const metadataResponse = await fetch(`${url}/metadata`, {
            method : "GET",
            headers: {
                cookie: req.headers.cookie ?? '',
            }
        });
        const metadata = await metadataResponse.json();
        const normalizedData = normalizeDates(data); // Pasa los dates (si hubiese) de los campos a formato YY-MM-DDDD
        res.render(templateFrontEndName, { [iterableDataName] : normalizedData, "metadata" : metadata});
    });
}


async function fetchStudentMetadata(req: Request): Promise<Response>{
    const url = 'http://localhost:3000/api/alumno';
    const metadataResponse = await fetch(`${url}/metadata`, {
        method : "GET",
        headers: {
            cookie: req.headers.cookie ?? '',
        }
    });
    const metadata = await metadataResponse.json();
    return metadata
}


createMainRouteForBasicCRUD("alumno", "manageStudents", "students");
createMainRouteForBasicCRUD("factura", "manageInvoices", "invoices");
createMainRouteForBasicCRUD("curso", "manageCourses", "courses");
createMainRouteForBasicCRUD("nivel", "manageLevels", "levels");


router.get("/app/alumno/csv", requireAuth, (req, res) => {
    res.render("uploadStudentCSV")
});


router.post("/api/alumno/csv", requireAuth, async (req, res) => {
    try {
        var {dataLines: studentsDataList, columns: columns} = await parseCsvFromContent(req.body)
        const rows = zip(columns, studentsDataList)

        for(const row of rows){
            await studentRepo.create(row);  // Consultar si usamos un POST o directamente utilizar el repositorio.
        }
        res.status(201).send({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error insertando alumnos' });
    }
});


router.get("/app/asistencia", requireAuth, (req, res) => {
    const today = new Date().toISOString().split("T")[0];  // YYYY-MM-DD
    res.redirect(`/app/asistencia/${today}`);
});

router.get("/app/asistencia/:fecha", requireAuth, async (req, res) => {
    const fecha = req.params.fecha;

    if (!fecha) {
        res.status(400).json({ error: 'Requiere parametro fecha.' });
        return;
    }

    assertValidDateYYYYMMDD(fecha);

    const metadata = await fetchStudentMetadata(req);

    const students = await studentRepo.getwithAttendance(fecha);
    res.render("manageAttendance", { "fecha" : fecha, "students" : students, "metadata" : metadata });
});

router.get("/app/asistencia", requireAuth, (req, res) => {
    const today = new Date().toISOString().split("T")[0];  // YYYY-MM-DD
    res.redirect(`/app/asistencia/${today}`);
});


// Ruta GET principal
router.get("/", (_, res) => {
    res.render("mainMenu");
});

router.use(authApiRoutes);
router.use(authPagesRoutes);

export default router;
