CREATE TABLE pyac.usuarios (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nombre TEXT,
    email TEXT
);

grant select, insert, update, delete on pyac.usuarios to pyac_admin;
grant usage, select on all sequences in schema pyac to pyac_admin;
