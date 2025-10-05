import { Router } from "express";
import { Client } from "pg";
import { loadStudentsFromCsvContent, getStudentsFromDatabase, insertStudent2 } from "../pyac.js";
import { Student } from "../abstractions/student.js";

const router = Router();

// Ruta GET para subir CSV
router.get("/app/v0/archivo", (_, res) => {
    res.render("html_upload");
});

router.get("/app/alumnos", async (req, res) => {
    const client = new Client();
    await client.connect();
    res.render("handleStudent", { "students" : await getStudentsFromDatabase(client), "studentColumnMeta" : studentColumnMeta });
    await client.end();
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

// INICIO CRUD alumnos

const primaryKey = 'id_alumno';  // Por ahora solo sirve cuando |primaryKeys| == 1.
const nonPrimaryColumns = ['nombre', 'apellido', 'curso', 'modalidad', 'responsable_de_pagos', 'responsable1'];
const allColumns = [primaryKey, ...nonPrimaryColumns];

interface ColumnMeta {
  label: string;
  type: string;
}

const studentColumnMeta: Record<string, ColumnMeta> = {
  id_alumno: {
    label: "DNI del alumno",
    type: "number",
  },
  nombre: {
    label: "Nombre",
    type: "text",
  },
  apellido: {
    label: "Apellido",
    type: "text",
  },
  curso: {
    label: "Curso",
    type: "text",
  },
  modalidad: {
    label: "Modalidad",
    type: "text",
  },
  responsable_de_pagos: {
    label: "Responsable de pagos",
    type: "text",
  },
  responsable1: {
    label: "Responsable1",
    type: "text",
  },
};

// CREATE
router.post("/api/alumnos", async (req, res) => {
    const client = new Client();
    await client.connect();

    const placeholders = allColumns.map((_, i) => `$${i + 1}`).join(', ');
    const query = `
        INSERT INTO pyac.alumnos (${allColumns.join(', ')})
        VALUES (${placeholders})
    `
    const values = allColumns.map(col => req.body[col]);

    await client.query(query, values);

    res.redirect("/app/alumnos");
    await client.end();
});

// READ
router.get("/api/alumnos", async (req, res) => {
    const client = new Client();
    await client.connect();
    
    const query = `
        SELECT *
        FROM pyac.alumnos
    `
    const items = await client.query(query);
    res.json(items.rows);

    await client.end();
});

// DELETE
router.delete(`/api/alumnos/:${primaryKey}`, async (req, res) => {
    const client = new Client();
    await client.connect();

    const query = `
        DELETE FROM pyac.alumnos
        WHERE ${primaryKey} = $1
    `

    await client.query(query, [req.params[primaryKey]]);
    await client.end();
});


// FIN CRUD alumnos

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
