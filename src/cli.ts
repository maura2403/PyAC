import { Client } from 'pg'
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const client = new Client()
await client.connect()
 
const filePath = resolve('./resources/queries/insert-ejemplo-alumnos.sql');
const contents = await readFile(filePath, { encoding: 'utf8' });
console.log(contents);
await client.query(contents);
const res = await client.query('SELECT * FROM pyac.alumnos');
console.log(res.rows[0]);

await client.end()
