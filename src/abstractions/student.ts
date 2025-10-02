export class Student {
    private dni: number;
    name: string;
    lastName: string;

    constructor(name: string, lastName: string, dni: number) {
        this.name = name;
        this.lastName = lastName;
        this.dni = dni;
    }

    public static FromJson(jsonData: any): Student {
        let res: Student = new Student(jsonData.nombre, jsonData.apellido, 20);
        console.log(jsonData);
        return res;
    }
}