import { Client } from 'pg'
import { leerYParsearCsvDesdePath, leerYParsearCsvDesdeContenido } from './csv.js'


export async function agregarUnAlumno(clientDb: Client, datosDelAlumno: string[], columnas: string[]){
    const placeholders = columnas.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
        INSERT INTO pyac.alumnos (${columnas.join(', ')})
        VALUES (${placeholders})
    `;

    const valores = datosDelAlumno.map(value => value === '' ? null : value);
    
    // console.log('Query:', query);
    // console.log('Valores:', valores);
    
    await clientDb.query(query, valores);
}

export async function agregarMultiplesAlumnos(clientDb: Client, listaDeDatosDeAlumnos: string[][], columnas: string[]){
    for (const datosDeUnAlumno of listaDeDatosDeAlumnos){
        await agregarUnAlumno(clientDb, datosDeUnAlumno, columnas)
    }
}


export async function cargarAlumnosDesdeCsv(clientDb: Client, pathArchivoCsv: string){
    var {dataLines: listaDeDatosDeAlumnos, columns: columnas} = await leerYParsearCsvDesdePath(pathArchivoCsv)
    await agregarMultiplesAlumnos(clientDb, listaDeDatosDeAlumnos, columnas);
}

export async function cargarAlumnosDesdeCsvContenido(clientDb: Client, contenido: string){
    var {dataLines: listaDeDatosDeAlumnos, columns: columnas} = await leerYParsearCsvDesdeContenido(contenido)
    await agregarMultiplesAlumnos(clientDb, listaDeDatosDeAlumnos, columnas);
}
