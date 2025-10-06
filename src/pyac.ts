import { Client } from 'pg'
import { parseCsvFromPath, parseCsvFromContent } from './csv.js'


export async function insertStudent(clientDb: Client, studentData: string[], columns: string[]){
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
        INSERT INTO pyac.alumnos (${columns.join(', ')})
        VALUES (${placeholders})
    `;

    const values = studentData.map(value => value === '' ? null : value);
    
    // console.log('Query:', query);
    // console.log('Valores:', values);
    
    await clientDb.query(query, values);
}

export async function insertMultipleStudents(clientDb: Client, studentsDataList: string[][], columns: string[]){
    for (const studentData of studentsDataList){
        await insertStudent(clientDb, studentData, columns)
    }
}

export async function loadStudentsFromCsvPath(clientDb: Client, filePath: string){
    var {dataLines: studentsDataList, columns: columns} = await parseCsvFromPath(filePath)
    await insertMultipleStudents(clientDb, studentsDataList, columns);
}

export async function loadStudentsFromCsvContent(clientDb: Client, content: string){
    var {dataLines: studentsDataList, columns: columns} = await parseCsvFromContent(content)
    await insertMultipleStudents(clientDb, studentsDataList, columns);
}

export async function getStudentsFromDatabase(clientDb: Client) {
    const query = 'SELECT * FROM pyac.alumnos';
    const res = await clientDb.query(query);
    return res.rows;
}