export function arraySameElements(arr1: any[], arr2: any[]): boolean {
    let res = true;
    res &&= arr1.every(element => arr2.includes(element));
    res &&= arr2.every(element => arr1.includes(element));
    return res;
}

export function accessAt<T>(arr: T[], index: number): T {
    if (arr[index] == undefined) {
        throw new Error(`Index ${index} is out of bounds for array ${arr}.`);
    }
    return arr[index];
}

// El formato de fecha debe ser YYYY-MM-DD. Los meses y los días deben tener exactamente 2 digitos.
// Tanto los meses como los días se indexan a partir de 1.
export function isValidDateYYYYMMDD(dateStr: string) : boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (!regex.test(dateStr)) {
        return false;
    }

    const [year, month, day] = dateStr.split("-").map(Number);
  
    if(!year || !month || !day){
        return false;
    }

    const date = new Date(year, month-1, day);

    const isValid = !isNaN(date.getTime()) &&
                    date.getFullYear() === year &&
                    (date.getMonth()) === month - 1 &&
                    (date.getDate()) === day;

    return isValid;
}

export function assertValidDateYYYYMMDD(dateStr: string){
    if(!isValidDateYYYYMMDD(dateStr)){
            throw new Error(`
                La fecha ${dateStr} no es una fecha válida en el formato YYYY-MM-DD.
                Notar que la fecha 2010-1-1 es inválida pero la fecha 2010-01-01 es válida.
            `);
        }
}

export function zip(fields: string[], rows: string[][]) {
    return rows.map((row) => 
        Object.fromEntries(fields.map((f, i) => [f, row[i]]))
    )
}


