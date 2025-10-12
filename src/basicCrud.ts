import type { Router } from "express";
import type { Repository } from "./database/repository.js";

export async function createAPICrud(router: Router, repository: Repository) {
    const route: string = `/api/${repository.table}`;

    // Create
    router.post(route, async (req, res) => {
        await repository.create(req.body);
        res.status(200).json({ ok: true });
    });
    // Read
    router.get(route, async (req, res) => {
        const rows = await repository.read(req.query);
        res.status(200).json(rows);
    });
    // Update
    router.patch(`${route}/:id`, async (req, res) => {
        await repository.update(req.params.id, req.body);
        res.status(200).json({ ok: true });
    });
    // Delete
    router.delete(`${route}/:id`, async (req, res) => {
        await repository.delete(req.params.id);
        res.status(200).json({ ok: true });
    });
}