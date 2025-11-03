import { Client } from "pg";

export async function getDbClient(){
    const clientDb = new Client();
    await clientDb.connect();
    return clientDb;
}
