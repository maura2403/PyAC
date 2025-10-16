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