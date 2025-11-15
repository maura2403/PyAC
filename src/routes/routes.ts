import { Router } from "express";
import { Pool } from "pg";
import { createAPICrud } from "../basicCrud.js"
import { StudentRepository, AttendanceRepository, LevelRepository, InvoiceRepository, type Invoice } from "../database/repository.js";
import { requireAuth } from "../middleware/auth.js"
import authApiRoutes from "./authApi.js";
import authPagesRoutes from "./authPages.js";
import { poolDb } from "../database/client.js";

const router = Router();

interface ColumnMeta {
    label: string;
    type: string;
    modificable: boolean;
}

const studentColumnMeta: Record<string, ColumnMeta> = {
    dni: {
        label: "DNI del alumno",
        type: "number",
        modificable: false
    },
    nombre: {
        label: "Nombre",
        type: "text",
        modificable: true
    },
    apellido: {
        label: "Apellido",
        type: "text",
        modificable: true
    },
    curso: {
        label: "Curso",
        type: "text",
        modificable: true
    },
    modalidad: {
        label: "Modalidad",
        type: "text",
        modificable: true
    },
    nivel: {
        label: "Nivel",
        type: "text",
        modificable: true
    },
    responsable_de_pagos: {
        label: "Responsable de pagos",
        type: "text",
        modificable: true
    },
    responsable1: {
        label: "Responsable1",
        type: "text",
        modificable: true
    },
};

// Tecnicamente createAPICrud podria ir adentro de Repository.
// Hay que decidir si todos los Repositories van a tener un CRUD.
// Por ahora quedan separados.
const studentRepo = new StudentRepository(pool);
createAPICrud(router, studentRepo);

const attendanceRepo = new AttendanceRepository(pool);
//createAPICrud(router, attendanceRepo);

const levelRepo = new LevelRepository(pool);
createAPICrud(router, levelRepo);

const invoiceRepo = new InvoiceRepository(pool);
createAPICrud(router, invoiceRepo);

// Create de presente
router.post("/api/presentes", async (req, res) => {
    try {
        await attendanceRepo.create(req.body);
        const student = await studentRepo.getByDNI(req.body.dni);
        if (student.modalidad == "Eventual") {
            const price = await levelRepo.getPrice(student.nivel);
            const invoiceData: Invoice = {
                "dni" : req.body.dni,
                "fecha_de_emision" : new Date(),
                "precio" : price,
                "fecha_de_pago" : null
            }
            await invoiceRepo.create(invoiceData);
        }
        res.status(200).json({ ok: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: (err as Error).message });
    }
});

// Esto tambien lo podriamos generalizar para todos los Repositories.
router.get("/app/alumnos", requireAuth, async (req, res) => {
    const queryParams = req.query as Record<string, string>;
    const queryString = Object.keys(queryParams).map(key => `${key}=${queryParams[key]}`).join('&');
    let url = 'http://localhost:3000/api/alumnos';
    if (queryString !== '') {
        url += `?${queryString}`;
    }

    const response = await fetch(url, {
        method : "GET",
        headers: {
            cookie: req.headers.cookie ?? '',
        }
    });
    const students = await response.json();

    res.render("manageStudents", { "students" : students, "studentColumnMeta" : studentColumnMeta });
});

// Ruta GET principal
router.get("/", (_, res) => {
    res.render("mainMenu");
});


router.use(authApiRoutes);
router.use(authPagesRoutes);


export default router;
