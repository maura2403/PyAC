import { Router } from "express";
import { createAPICrud } from "../basicCrud.js"
import { requireAuth } from "../middleware/auth.js"
import authApiRoutes from "./authApi.js";
import authPagesRoutes from "./authPages.js";
import { poolDb } from "../database/client.js";
import { AttendanceRepository, InvoiceRepository, LevelRepository, StudentRepository, ModalityRepository, CourseRepository, UserRepository} from "../database/repository.js";

const router = Router();

interface ColumnMeta {
    label: string;
    type: string;
    modificable: boolean;
}

const studentRepo = new StudentRepository(poolDb);
createAPICrud(router, studentRepo, true, true, true, true); // Creamos el CRUD con funcionalidad completa para estudiantes

const attendanceRepo = new AttendanceRepository(poolDb);

const levelRepo = new LevelRepository(poolDb);
createAPICrud(router, levelRepo, true, true, true, true); // Creamos el CRUD con funcionalidad completa para Niveles

const invoiceRepo = new InvoiceRepository(poolDb);
createAPICrud(router, invoiceRepo, false, true, true, false); // De las facturas vamos a querer verlas y editarlas. La edición es limitada a los campos a rellenar al pagarlas. 

const modalityRepo = new ModalityRepository(poolDb);
createAPICrud(router, modalityRepo, true, true, true, true);

const userRepo = new UserRepository(poolDb);
createAPICrud(router, userRepo, true, true, true, true);

const courseRepo = new CourseRepository(poolDb);
createAPICrud(router, courseRepo, true, true, true, true);

// Normaliza las fechas a formato YY-MM-DDDD si tiene fechas.
function normaliceDates(data: Record<string,  any>[]): Record<string, any>[] {
    return data.map(row => {
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

function createMainRouteForBasicCRUD(specificRoute: string, templateFrontEndName: string, iterableDataName: string, campoPK: string){
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
        const normalizedData = normaliceDates(data); // Pasa los dates (si hubiese) de los campos a formato YY-MM-DDDD
        res.render(templateFrontEndName, { [iterableDataName] : normalizedData, "metadata" : metadata, idCampo: campoPK});
    });

}

createMainRouteForBasicCRUD("alumno", "manageStudents", "students", "dni");
createMainRouteForBasicCRUD("factura", "manageInvoices", "invoices", "dni");
createMainRouteForBasicCRUD("curso", "manageCourses", "courses", "curso");
createMainRouteForBasicCRUD("nivel", "manageLevels", "levels", "nivel");
createMainRouteForBasicCRUD("modalidad", "manageModalities", "modalities", "modalidad");
createMainRouteForBasicCRUD("usuario", "manageUsers", "users", "idusuario");



// Ruta GET principal
router.get("/", (_, res) => {
    res.render("mainMenu");
});


router.use(authApiRoutes);
router.use(authPagesRoutes);


export default router;
