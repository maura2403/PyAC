import express from "express";

import { cargarAlumnosDesdeCsvContenido } from "./pyac.js"
import { Client } from 'pg'

import fs from "fs";

const app = express();
const PORT = 3000;

app.use(express.text({ type: 'text/csv', limit: '10mb' }));

app.listen(PORT, () => {
    console.log(`Example app listening on port http://localhost:${PORT}/app/menu`)
})


const HTML_UPLOAD = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Subir CSV de Alumnos</title>
</head>
<body>
<h2>Subir archivo CSV</h2>
<input type="file" id="csvFile" accept=".csv" />
<button onclick="handleUpload()">Procesar y Enviar</button>

<script>
async function handleUpload() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    if (!file) { alert('Seleccioná un CSV'); return; }

    const text = await file.text();

    try {
        const response = await fetch('/api/v0/alumnos', {
            method: 'POST',
            headers: { 'Content-Type': 'text/csv' },
            body: text
        });
        if (response.ok) {
            alert('Datos enviados correctamente');
        } else {
            alert('Error al enviar los datos');
        }
    } catch (err) {
        console.error(err);
        alert('Error de red o servidor');
    }
}
</script>
</body>
</html>
`;

app.get("/app/v0/archivo", (_, res) => {
    res.send(HTML_UPLOAD);
});

app.post('/api/v0/alumnos', async (req, res) => {
    const client = new Client()
    await client.connect()

    try {
        await cargarAlumnosDesdeCsvContenido(client, req.body);
        res.status(201).send({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Error insertando alumnos' });
    }
    
    await client.end()
});
