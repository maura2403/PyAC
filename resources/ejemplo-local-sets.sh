# Las conexiones a la base de datos se pueden configurar de dos formas:
# 1. Especificando las variables individuales: PGUSER, PGPASSWORD, PGHOST, PGPORT y PGDATABASE.
# 2. Usando la variable DATABASE_URL con la cadena completa de conexión.
# En caso de que ambas configuraciones estén presentes, se priorizará el valor de DATABASE_URL.

export PGUSER=pyac_admin
export PGPASSWORD=<password>
export PGHOST=localhost
export PGPORT=5432
export PGDATABASE=pyac_db

export DATABASE_URL=<url>

export PORT=3000
