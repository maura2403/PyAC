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
    res.render("handleStudent", { "students" : await getStudentsFromDatabase(client)});
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

// CREATE
router.post("/api/alumnos", async (req, res) => {
    const client = new Client();
    await client.connect();

    const query = `
        INSERT INTO pyac.alumnos (id_alumno, nombre, apellido, curso, modalidad, responsable_de_pagos, responsable1)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `
    const values = [req.body['id_alumno'], req.body['nombre'], req.body['apellido'], req.body['curso'], req.body['modalidad'],
                    req.body['responsable_de_pagos'], req.body['responsable1']];

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
router.delete("/api/alumnos/:id_alumno", async (req, res) => {
    const client = new Client();
    await client.connect();

    const query = `
        DELETE FROM pyac.alumnos
        WHERE id_alumno = $1
    `

    await client.query(query, [req.params.id_alumno])
    await client.end()
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
