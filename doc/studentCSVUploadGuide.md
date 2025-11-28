### ¿Cómo cargar alumnos a través de archivos CSV?

Para cargar multiples alumnos al sistema utilizando un archivo CSV se deberá crear un archivo CSV que tenga exactamente las siguientes columnas:

`dni`, `nombre`, `apellido`, `curso`, `modalidad`, `cuit_responsable_de_pagos`.

El archivo se podrá subir desde la sección "CSV" accesible desde el menú principal.

En caso de que el archivo tenga columnas extras o faltantes, la carga fallará.

El archivo debe tener la extensión `.csv`.

Ejemplo de archivo CSV válido para carga de alumnos:

```
dni,nombre,apellido,curso,modalidad,cuit_responsable_de_pagos
40000000,Ana,González,6to B,Fijo,20-11111111-1
40000300,Beto,Ruiz,5to A,Mensual,20-12111111-1
40010000,Carlos,Rodríguez,6to B,Fijo,20-11211211-1
40000301,Maria,Sánchez,3ro B,Eventual,20-12111311-1
40003030,Juan,González,6to B,Fijo,20-11111141-1
40700300,Lucas,Domingo,4to A,Mensual,20-15151111-1
```