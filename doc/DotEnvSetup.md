Se deberá crear un archivo `.env` / `.env.test` en la raíz del proyecto.

Las conexiones a la base de datos se pueden configurar de dos formas:
1. Especificando las variables individuales: PGUSER, PGPASSWORD, PGHOST, PGPORT y PGDATABASE.
2. Usando la variable DATABASE_URL con la cadena completa de conexión.

En caso de que ambas configuraciones estén presentes, se priorizará el valor de DATABASE_URL.

- El `.env` deberá tener las variables de entorno de la base de datos de producción.
Cuando se ejecuta el servidor con `npm run server` se tomará el `.env`·

- El `.env.test` deberá tener las variables de entorno de la base de datos de testing.
Cuando se ejecuta el servidor con `npm run server:testing` se tomará el `.env.test`.

Un ejemplo de archivo `.env` para correr localmente el proyecto:

```
PGUSER=pyac_admin
PGPASSWORD=[PASSWORD]
PGHOST=localhost
PGPORT=5432
PGDATABASE=pyac_db

SESSION_SECRET=[COMPLETAR]
PORT=3000
```

Donde [PASSWORD] debe coincidir con la contraseña del usuario pyac_admin creando en [`/resources/queries/setup/db_creation.sql`](/resources/queries/setup/db_creation.sql).

Un ejemplo de `.env` donde se configura especificando la url de la base de datos:

```
DATABASE_URL=[URL]

SESSION_SECRET=[COMPLETAR]
PORT=3000
```
