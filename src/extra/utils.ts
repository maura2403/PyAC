export function arraySameElements(arr1: any[], arr2: any[]): boolean {
    let res = true;
    res &&= arr1.every(element => arr2.includes(element));
    res &&= arr2.every(element => arr1.includes(element));
    return res;
}