import { Router } from "express";
import { createAPICrud } from "../basicCrud.js"
import { requireAuth } from "../middleware/auth.js"
import authApiRoutes from "./authApi.js";
import authPagesRoutes from "./authPages.js";
import { poolDb } from "../database/client.js";
import { AttendanceRepository, InvoiceRepository, LevelRepository, StudentRepository } from "../database/repository.js";

const router = Router();

interface ColumnMeta {
    label: string;
    type: string;
    modificable: boolean;
}

const studentRepo = new StudentRepository(poolDb);
createAPICrud(router, studentRepo);

const attendanceRepo = new AttendanceRepository(poolDb);

const levelRepo = new LevelRepository(poolDb);

const invoiceRepo = new InvoiceRepository(poolDb);

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

// Ruta GET principal
router.get("/", (_, res) => {
    res.render("mainMenu");
});


router.use(authApiRoutes);
router.use(authPagesRoutes);


export default router;
