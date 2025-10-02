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
    res.render("handleStudent", { "alumnos" : await getStudentsFromDatabase(client)});
    await client.end();
});

router.post("/app/v0/agregar-alumno", async (req, res) => {
    const client = new Client();
    await client.connect();
    await insertStudent2(client, Student.FromJson(req.body));
    res.redirect("/app/alumnos");
    await client.end();
});

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
