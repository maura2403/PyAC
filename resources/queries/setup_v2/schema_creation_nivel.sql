CREATE TABLE IF NOT EXISTS pyac.nivel (
    nivel VARCHAR(120) PRIMARY KEY,
    precioDiario NUMERIC NOT NULL
);
grant select, insert, update, delete on pyac.nivel to pyac_admin;