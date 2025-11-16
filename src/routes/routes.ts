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

const studentRepo = new StudentRepository(poolDb);
createAPICrud(router, studentRepo);

const attendanceRepo = new AttendanceRepository(poolDb);

const levelRepo = new LevelRepository(poolDb);

const invoiceRepo = new InvoiceRepository(poolDb);

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
