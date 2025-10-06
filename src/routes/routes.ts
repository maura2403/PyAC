import { Router } from "express";
import { Client } from "pg";
import { loadStudentsFromCsvContent } from "../pyac.js";
import { createApiCrud } from "../basicCrud.js"

const router = Router();

// Ruta GET para subir CSV
router.get("/app/v0/archivo", (_, res) => {
    res.render("html_upload");
});


/*
router.post("/app/v0/agregar-alumno", async (req, res) => {
    const client = new Client();
    await client.connect();
    await insertStudent2(client, Student.FromJson(req.body));
    res.redirect("/app/alumnos");
    await client.end();
});
*/


const primaryKey = 'id_alumno';  // Por ahora solo sirve cuando |primaryKeys| == 1.
const nonPrimaryColumns = ['nombre', 'apellido', 'curso', 'modalidad', 'responsable_de_pagos', 'responsable1'];
const allColumns = [primaryKey, ...nonPrimaryColumns];

interface ColumnMeta {
    label: string;
    type: string;
    modificable: boolean;
}

const studentColumnMeta: Record<string, ColumnMeta> = {
    id_alumno: {
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


// CRUD alumnos:
const apiBaseRoute = '/api';
const schema = 'pyac';
const table = 'alumnos';

createApiCrud(router, apiBaseRoute, schema, table, primaryKey, nonPrimaryColumns);

router.get("/app/alumnos", async (req, res) => {
    const response = await fetch("http://localhost:3000/api/alumnos");
    res.render("handleStudent", { "students" : await response.json(), "studentColumnMeta" : studentColumnMeta });
});

for (const field of allColumns) {
    router.get(`/app/alumnos/${field}/:${field}`, async (req, res) => {
        const response = await fetch(`http://localhost:3000/api/alumnos/${field}/${req.params[field]}`);
        res.render("handleStudent", { "students" : await response.json(), "studentColumnMeta" : studentColumnMeta });
    });
}

router.get(`/app/alumnos/editar/:${primaryKey}`, async (req, res) => {
    const client = new Client();
    await client.connect();

    const query = `
        SELECT *
        FROM ${schema}.${table}
        WHERE ${primaryKey} = $1 
    `;
    const result = await client.query(query, [req.params[primaryKey]]);
    console.log(result.rows);
    const student = result.rows[0];

    res.render("studentEditForm", { "student" : student, "studentColumnMeta" : studentColumnMeta });

    await client.end();
})


// Ruta POST para procesar CSV
router.post("/api/v0/alumnos", async (req, res) => {
    const client = new Client();
    await client.connect();

    try {
        await loadStudentsFromCsvContent(client, req.body);
        res.status(201).send({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Error insertando alumnos" });
    }

    await client.end();
});

// Ruta GET principal
router.get("/", (_, res) => {
    res.render("mainmenu");
});

export default router;
