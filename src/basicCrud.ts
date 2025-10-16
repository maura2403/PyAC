import type { Router } from "express";
import type { Repository } from "./database/repository.js";

// req.body: Contenido para la DB (objeto en CREATE y UPDATE)
// req.query: Parametros para filtrar (en el filtros en el READ o PKs en UPDATE y DELETE)
export async function createAPICrud<T extends PK, PK extends Record<string, any>>(router: Router, repository: Repository<T, PK>) {
    const route: string = `/api/${repository.table}`;

    // Create
    router.post(route, async (req, res) => {
        try {
            await repository.create(req.body as T);
            res.status(200).json({ ok: true });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ ok: false, error: (err as Error).message });
        }
    });
    // Read
    router.get(route, async (req, res) => {
        try {
            const rows = await repository.read(req.query as Partial<T>);
            res.status(200).json(rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ ok: false, error: (err as Error).message });
        }
    });
    // Update
    router.patch(`${route}`, async (req, res) => {
        try {
            await repository.update(req.query as PK, req.body as T);
            res.status(200).json({ ok: true });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ ok: false, error: (err as Error).message });
        }
    });
    // Delete
    router.delete(`${route}`, async (req, res) => {
        try {
            await repository.delete(req.query as PK);
            res.status(200).json({ ok: true });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ ok: false, error: (err as Error).message });
        }
    });
}