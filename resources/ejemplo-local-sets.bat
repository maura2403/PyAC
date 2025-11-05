REM Las conexiones a la base de datos se pueden configurar de dos formas:
REM 1. Especificando las variables individuales: PGUSER, PGPASSWORD, PGHOST, PGPORT y PGDATABASE.
REM 2. Usando la variable DATABASE_URL con la cadena completa de conexión.
REM En caso de que ambas configuraciones estén presentes, se priorizará el valor de DATABASE_URL.

set PGUSER=pyac_admin
set PGPASSWORD=<password>
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=pyac_db

set DATABASE_URL=<url>

set PORT=3000