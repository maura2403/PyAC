import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/routes.js"; // Importamos el router con las rutas para nuestro servidor
import session from 'express-session';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(express.text({ type: "text/csv", limit: "10mb" }));
//app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static(path.join(__dirname, "../static")));

// Configuración de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'cambiar_este_secreto_en_produccion',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 día
    }
}));

// Montamos todas las rutas
app.use(routes);

app.listen(PORT, () => {
    console.log(`Example app listening on port http://localhost:${PORT}`);
});
