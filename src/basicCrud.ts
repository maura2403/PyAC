import type { Router } from "express";
import { Client } from "pg";

export async function createApiCrud(app: Router, apiBaseRoute: string, schema: string, table: string, primaryKey: string, nonPrimaryColumns: string[]){
    const route: string = `${apiBaseRoute}/${table}`;
    const allColumns = [primaryKey, ...nonPrimaryColumns];

    // CREATE
    app.post(route, async (req, res) => {
        const client = new Client();
        await client.connect();

        const placeholders = allColumns.map((_, i) => `$${i + 1}`).join(', ');
        const query = `
            INSERT INTO ${schema}.${table} (${allColumns.join(', ')})
            VALUES (${placeholders})
        `

        const values = allColumns.map(col => req.body[col] === '' ? null : req.body[col]);

        await client.query(query, values);
        await client.end();
        res.status(200).json({ ok: true });
    });

    // READ
    app.get(route, async (req, res) => {
        const client = new Client();
        await client.connect();
        
        const query = `
            SELECT *
            FROM ${schema}.${table}
        `
        const items = await client.query(query);
        res.json(items.rows);

        await client.end();
    });

    for (const field of allColumns) {
        app.get(`${route}/${field}/:${field}`, async (req, res) => {
            const client = new Client();
            await client.connect();
            
            const query = `
                SELECT *
                FROM ${schema}.${table}
                WHERE ${table}.${field} = $1
            `
            const items = await client.query(query, [req.params[field]]);
            res.json(items.rows);

            await client.end();
        });
    }


    // UPDATE
    app.post(`${route}/editar/:${primaryKey}`, async (req, res) => {
        const client = new Client();
        await client.connect();
        const values = allColumns.map(col => req.body[col] === '' ? null : req.body[col]);

        const query = `
            UPDATE ${schema}.${table}
            SET ${nonPrimaryColumns.map ((col, i) => `${col} = $${i+2}`).join(', ')}
            WHERE ${primaryKey} = $1
        `;

        await client.query(query, values);
        await client.end();
        res.status(200).json({ ok: true });
    })

    // DELETE
    app.delete(`${route}/:${primaryKey}`, async (req, res) => {
        const client = new Client();
        await client.connect();

        const query = `
            DELETE FROM ${schema}.${table}
            WHERE ${primaryKey} = $1
        `

        await client.query(query, [req.params[primaryKey]]);
        await client.end();
        res.status(200).json({ ok: true });
    });

    app.get(`${route}/search/:value`, async (req, res) => {
        const client = new Client();
        await client.connect();

        const value = `${req.params.value}%`;

        const query = `
            SELECT *
            FROM ${schema}.${table}
            WHERE ${allColumns.map(c => `${c}::text ILIKE $1`).join(' OR ')}
        `
        const items = await client.query(query, [value]);
        res.json(items.rows);

        await client.end();
    });
}
