import { Router } from "express";
import { createAPICrud } from "../basicCrud.js"
import { requireAuth } from "../middleware/auth.js"
import authApiRoutes from "./authApi.js";
import authPagesRoutes from "./authPages.js";
import { courseRepo, invoiceRepo, levelRepo, studentRepo, userRepo, modeRepo, fixedStudentRepo} from "../database/repository.js";
import { assertValidDateYYYYMMDD, toISOFormat, zip } from "../extra/utils.js";
import { parseCsvFromContent } from "../extra/csv.js";

const router = Router();

createAPICrud(router, studentRepo, true, true, true, true);
createAPICrud(router, levelRepo, true, true, true, true);
// De las facturas vamos a querer verlas y editarlas.
// La edición es limitada a los campos a rellenar al pagarlas.
createAPICrud(router, invoiceRepo, false, true, true, false);
createAPICrud(router, modeRepo, true, true, true, true);
createAPICrud(router, userRepo, true, true, true, true);
createAPICrud(router, courseRepo, true, true, true, true);
createAPICrud(router, fixedStudentRepo, true, true, false, true);

function createMainRouteForBasicCRUD(specificRoute: string, templateFrontEndName: string) {
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
        const filterParam = queryParams.filter ? JSON.parse(queryParams.filter as string) : {};
        const sortParam = queryParams.sortby ? JSON.parse(queryParams.sortby as string) : {};
        res.render(templateFrontEndName, { 'iterableData' : data, "metadata" : metadata, "filterParams": filterParam, "sortbyParams": sortParam});
    });
}

createMainRouteForBasicCRUD("alumno", "manageStudents");
createMainRouteForBasicCRUD("factura", "manageInvoices");
createMainRouteForBasicCRUD("curso", "manageCourses");
createMainRouteForBasicCRUD("nivel", "manageLevels");

router.get("/app/alumno/fijo", requireAuth, async (req, res) => {
    const data = await studentRepo.getFixedStudentsWithDays();
    res.render('manageFixedStudents', { 'data' : data });
});


router.get("/app/alumno/csv", requireAuth, (req, res) => {
    res.render("uploadStudentCSV");
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


router.get("/app/asistencia", requireAuth, async (req, res) => {
    if (!req.query.day || !req.query.month || !req.query.year) {
        const today = new Date();
        return res.redirect(`/app/asistencia?day=${today.getDate()}&month=${today.getMonth() + 1}&year=${today.getFullYear()}`);
    }

    const year = parseInt(req.query.year as string);
    const month = parseInt(req.query.month as string) - 1;
    const day = parseInt(req.query.day as string);
    const fecha = toISOFormat(year, month, day);

    const students = await studentRepo.getStudentsAttendance(year, month, day);
    const metadata = studentRepo.frontData;

    res.render("manageAttendance", { "fecha" : fecha, "students" : students, "metadata" : metadata });
});


// Ruta GET principal
router.get("/", requireAuth, (_, res) => {
    res.render("mainMenu");
});

router.use(authApiRoutes);
router.use(authPagesRoutes);

export default router;
