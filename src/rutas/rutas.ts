import { Router } from "express";
import { Client } from "pg";
import { cargarAlumnosDesdeCsvContenido } from "../pyac.js";

const router = Router();

// Ruta GET para subir CSV
router.get("/app/v0/archivo", (_, res) => {
    res.render("html_upload");
});

// Ruta POST para procesar CSV
router.post("/api/v0/alumnos", async (req, res) => {
    const client = new Client();
    await client.connect();

    try {
        await cargarAlumnosDesdeCsvContenido(client, req.body);
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
