import { requireAuthAPI } from "./middleware/auth.js"
import type { Router } from "express";
import type { Repository } from "./database/repository.js";

// req.body: Contenido para la DB (objeto en CREATE y UPDATE)
// req.query: Parametros para filtrar (en el filtros en el READ o PKs en UPDATE y DELETE)
export async function createAPICrud(router: Router, repository: Repository) {
    const route: string = `/api/${repository.tableName}`;

    // Create
    router.post(route, requireAuthAPI, async (req, res) => {
        try {
            await repository.create(req.body);
            res.status(200).json({ ok: true });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ ok: false, error: (err as Error).message });
        }
    });
    // Read
    router.get(route, requireAuthAPI, async (req, res) => {
        try {
            const rows = await repository.read(req.query);
            res.status(200).json(rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ ok: false, error: (err as Error).message });
        }
    });
    // Update
    router.patch(route, requireAuthAPI, async (req, res) => {
        try {
            await repository.update(req.query, req.body);
            res.status(200).json({ ok: true });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ ok: false, error: (err as Error).message });
        }
    });
    // Delete
    router.delete(route, requireAuthAPI, async (req, res) => {
        try {
            await repository.delete(req.query);
            res.status(200).json({ ok: true });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ ok: false, error: (err as Error).message });
        }
    });

    // Metadata
    router.get(`${route}/metadata`, requireAuthAPI, async(req, res) => {
        try {
            res.status(200).json(repository.frontData);
        }
        catch(err) {
            console.error(err);
            res.status(500).json({ ok: false, error: (err as Error).message });
        }
    })
}