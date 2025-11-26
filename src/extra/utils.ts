export function arraySameElements(arr1: any[], arr2: any[]): boolean {
    let res = true;
    res &&= arr1.every(element => arr2.includes(element));
    res &&= arr2.every(element => arr1.includes(element));
    return res;
}

export function toISOFormat(year: number, month: number, day: number): string {
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toISOString().split('T')[0]!;
}

export function getDaysInMonth(year: number, month: number, days: string[]): number {
    const daysAsNumbers = days.map(day => dayToNumber(day));
    const daysInMonth = new Date(year, month, 0).getDate();
    let counter = 0;
    for (let i = 1; i < daysInMonth + 2; i++) {
        const dayOfWeek = new Date(year, month, i).getDay();
        if (daysAsNumbers.includes(dayOfWeek)) {
            counter++;
        }
    }
    return counter;
}

export function getWorkingDays(year: number, month: number): number {
    return getDaysInMonth(year, month, ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes']);
}

export function dayToNumber(day: string): number {
    if (day == 'Lunes') { return 1; }
    if (day == 'Martes') { return 2; }
    if (day == 'Miercoles') { return 3; }
    if (day == 'Jueves') { return 4; }
    if (day == 'Viernes') { return 5; }
    return 0;
}