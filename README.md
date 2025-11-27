# PyAC

Presente y A Comer!

## Integrantes

- Emiliano Testa Elesgaray
- Maura Roll
- Mauricio Romero Laino
- Juan Cruz Piedrabuena

### Proyecto hosteado
El proyecto se encuentra disponible en: https://pyac.onrender.com/

### Sobre nosotros
"Presente y A Comer!" es un sistema web para la gestión del comedor escolar que permite administrar niveles educativos, modalidades de asistencia y alumnos. A partir de esa información, la plataforma facilita el registro diario de asistencia al mismo, marcando fácilmente quién estuvo presente y generando automáticamente la facturación correspondiente, simplificando el control administrativo y reduciendo tiempo de gestión.

### Pasos para configurar el proyecto en local

### 0. (Opcional) Cambiar contraseña
Se recomienda en [resources/queries/setup/db_creation.sql](resources/queries/setup/db_creation.sql) cambiar la contraseña de pyac_admin.

### 1. Creación de la bases de datos
#### Crear la bases de datos:
Ejecutar los scripts desde la terminal:

```bash
sudo -u postgres psql -f resources/queries/setup/db_creation.sql
sudo -u postgres psql -d pyac_db -f resources/queries/setup/schema_creation.sql
```

#### (Opcional) Insertar datos de ejemplo:
En [resources/queries/inserts_example.sql](resources/queries/inserts_example.sql) se incluyen datos de prueba.
Se puede ejecutar desde cualquier cliente de PostgreSQL (por ejemplo pgAdmin 4) o directamente desde la terminal:

```bash
psql -h localhost -U pyac_admin -d pyac_db -f resources/queries/inserts_example.sql
```

### 2. Instalar dependencias:
```bash
npm install
```

### 3. Configuración de variables de entorno
Crear un archivo `.env` en la raíz del proyecto como se indica en las [instrucciones](doc/DotEnvSetup.md).


## Pasos para correr el proyecto en local

1. Iniciar el servidor:

```bash
npm run server
```

2. Abrir el navegador en la ruta indicada en la consola. Debería ser:

```
http://localhost:[PORT]
```

## Pasos para crear un usuario administrador
Para crear un usuario administrador manualmente se debe agregar la linea:
```
userRepo.createUser('[USERNAME]', '[PASSWORD]', '[NAME]', '[EMAIL]);
```
al final del archivo [src/routes/routes.ts](`src/routes/routes.ts`).

Luego inicial el servidor utilizando `npm run server`, se habrá creado un nuevo usuario de administrador con usuario [USERNAME] y contraseña [PASSWORD].

**Se recomienda eliminar la linea agregada después de usarla.**

## Scripts disponibles

* **Compilar los archivos del proyecto** según la configuración de `tsconfig.json`:

```bash
npm run prepare
```

* **Compilar el proyecto e iniciar el servidor**:

```bash
npm run server
```
