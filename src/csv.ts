import { readFile } from 'node:fs/promises';


export async function leerYParsearCsvDesdeContenido(contenido: string) {
    const header = contenido.split(/\r?\n/)[0];
    if (header == null) throw new Error("archivo .csv vacio");
    const columns = header.split(',').map(col => col.trim());
    const dataLines = contenido.split(/\r?\n/).slice(1).filter(line => line.trim() !== '').map(line => line.split(','));
    return {dataLines, columns};
}

export async function leerYParsearCsvDesdePath(filePath: string){
    const contents = await readFile(filePath, { encoding: 'utf8' });
    return leerYParsearCsvDesdeContenido(contents);
}
