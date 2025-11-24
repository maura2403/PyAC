import { Router } from "express";
import { createAPICrud } from "../basicCrud.js"
import { requireAuth } from "../middleware/auth.js"
import authApiRoutes from "./authApi.js";
import authPagesRoutes from "./authPages.js";
import { poolDb } from "../database/client.js";
import { AttendanceRepository, InvoiceRepository, LevelRepository, StudentRepository } from "../database/repository.js";
import { assertValidDateYYYYMMDD } from "../extra/utils.js";
import type { Request } from "express";

const router = Router();

const studentRepo = new StudentRepository(poolDb);
createAPICrud(router, studentRepo);

const attendanceRepo = new AttendanceRepository(poolDb);
// No debería tener el CRUD completo. Temporal.
createAPICrud(router, attendanceRepo);

const levelRepo = new LevelRepository(poolDb);

const invoiceRepo = new InvoiceRepository(poolDb);

createAPICrud(router, invoiceRepo);

async function fetchStudentMetadata(req: Request): Promise<Response>{
    const url = 'http://localhost:3000/api/alumnos';
    const metadataResponse = await fetch(`${url}/metadata`, {
        method : "GET",
        headers: {
            cookie: req.headers.cookie ?? '',
        }
    });
    const metadata = await metadataResponse.json();
    return metadata
}

// Esto tambien lo podriamos generalizar para todos los Repositories.
router.get("/app/alumnos", requireAuth, async (req, res) => {
    const queryParams = req.query;
    let queryString = Object.keys(queryParams).map(key => `${key}=${queryParams[key]}`).join('&');
    const url = 'http://localhost:3000/api/alumnos';
    if (queryString !== '') {
        queryString = `?${queryString}`;
    }

    // Fetch students
    const studentsResponse = await fetch(`${url}${queryString}`, {
        method : "GET",
        headers: {
            cookie: req.headers.cookie ?? '',
        }
    });
    const students = await studentsResponse.json();

    // Fetch metadata
    const metadataResponse = await fetch(`${url}/metadata`, {
        method : "GET",
        headers: {
            cookie: req.headers.cookie ?? '',
        }
    });
    const metadata = await metadataResponse.json();

    res.render("manageStudents", { "students" : students, "metadata" : metadata });
});

router.get("/app/presentes", requireAuth, (req, res) => {
    const today = new Date().toISOString().split("T")[0];  // YYYY-MM-DD
    res.redirect(`/app/presentes/${today}`);
});

router.get("/app/presentes/:fecha", requireAuth, async (req, res) => {
    const fecha = req.params.fecha;

    if (!fecha) {
        res.status(400).json({ error: 'Requiere parametro fecha.' });
        return;
    }

    assertValidDateYYYYMMDD(fecha);

    const metadata = await fetchStudentMetadata(req);

    const students = await studentRepo.getwithAttendance(fecha);
    res.render("attendanceForm", { "fecha" : fecha, "students" : students, "metadata" : metadata });
});

router.get("/app/presentes", requireAuth, (req, res) => {
    const today = new Date().toISOString().split("T")[0];  // YYYY-MM-DD
    res.redirect(`/app/presentes/${today}`);
});

// Ruta GET principal
router.get("/", (_, res) => {
    res.render("mainMenu");
});


router.use(authApiRoutes);
router.use(authPagesRoutes);


export default router;
