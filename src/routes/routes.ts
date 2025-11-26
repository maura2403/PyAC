import { Router } from "express";
import { createAPICrud } from "../basicCrud.js"
import { requireAuth } from "../middleware/auth.js"
import authApiRoutes from "./authApi.js";
import authPagesRoutes from "./authPages.js";
import { courseRepo, invoiceRepo, levelRepo, studentRepo, userRepo, modeRepo} from "../database/repository.js";

const router = Router();

createAPICrud(router, studentRepo, true, true, true, true);
createAPICrud(router, levelRepo, true, true, true, true);
// De las facturas vamos a querer verlas y editarlas.
// La edición es limitada a los campos a rellenar al pagarlas.
createAPICrud(router, invoiceRepo, false, true, true, false);
createAPICrud(router, modeRepo, true, true, true, true);
createAPICrud(router, userRepo, true, true, true, true);
createAPICrud(router, courseRepo, true, true, true, true);

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
        const filterParam = queryParams.filter ? JSON.parse(queryParams.filter as string) : {};
        const sortParam = queryParams.sortby ? JSON.parse(queryParams.sortby as string) : {};
        res.render(templateFrontEndName, { [iterableDataName] : data, "metadata" : metadata, "filterParams": filterParam, "sortbyParams": sortParam});
    });
}

createMainRouteForBasicCRUD("alumno", "manageStudents", "students");
createMainRouteForBasicCRUD("factura", "manageInvoices", "invoices");
createMainRouteForBasicCRUD("curso", "manageCourses", "courses");
createMainRouteForBasicCRUD("nivel", "manageLevels", "levels");

// Ruta GET principal
router.get("/", (_, res) => {
    res.render("mainMenu");
});

router.use(authApiRoutes);
router.use(authPagesRoutes);

export default router;