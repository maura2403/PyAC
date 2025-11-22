-- Tabla Nivel
CREATE TABLE IF NOT EXISTS pyac.nivel (
    nivel VARCHAR(120) PRIMARY KEY,
    precioDiario NUMERIC NOT NULL,
    activo BOOLEAN -- Campo que se usa para borrado lógico. Activo = 1 significa no borrado.
);

GRANT SELECT, INSERT, UPDATE, DELETE ON pyac.nivel TO pyac_admin;
