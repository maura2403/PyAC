import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/routes.js"; // Importamos el router con las rutas para nuestro servidor

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(express.text({ type: "text/csv", limit: "10mb" }));

// Montamos todas las rutas
app.use(routes);

app.listen(PORT, () => {
    console.log(`Example app listening on port http://localhost:${PORT}/app/menu`);
});
